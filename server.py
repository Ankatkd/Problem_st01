from flask import Flask, request, jsonify, send_file
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import google.generativeai as genai
import pyttsx3
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# ✅ Google Gemini AI Configuration
genai.configure(api_key="YOUR_GOOGLE_GEMINI_API_KEY")
model = genai.GenerativeModel("gemini-2.0-flash")

# ✅ User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

# ✅ Chat History Model
class SearchHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    query = db.Column(db.String(500), nullable=False)
    response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# ✅ Initialize DB
with app.app_context():
    db.create_all()

# ✅ Signup Route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    bname = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not (bname and email and password):
        return jsonify({"message": "All fields are required!"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(bname=bname, email=email, password=hashed_password)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Signup successful! Please login."}), 201
    except:
        return jsonify({"message": "Email already exists!"}), 400

# ✅ Login Route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Login successful!", "redirect_url": "/chat"}), 200

    return jsonify({"message": "Invalid credentials!"}), 401

# ✅ AI Chatbot Route (Stores & Retrieves Past Responses)
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_text = data.get("text")
    email = data.get("email")

    if not user_text or not email:
        return jsonify({"message": "Text input and email are required!"}), 400

    # ✅ Find user in the database
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found!"}), 404

    # ✅ Retrieve last response if asked
    if "last response" in user_text.lower():
        last_response = (
            SearchHistory.query
            .filter_by(user_id=user.id)
            .order_by(SearchHistory.timestamp.desc())
            .first()
        )

        if last_response:
            return jsonify({"ai_response": f"Your last response was: {last_response.response}"})
        else:
            return jsonify({"ai_response": "No previous responses found."})

    # ✅ Generate AI Response
    response = model.generate_content([user_text])
    ai_response = response.text.strip()

    # ✅ Store the chat history
    new_search = SearchHistory(user_id=user.id, query=user_text, response=ai_response)
    db.session.add(new_search)
    db.session.commit()

    # ✅ Convert AI Response to Speech
    engine = pyttsx3.init()
    engine.setProperty("rate", 150)  # Adjust speed
    engine.setProperty("volume", 1.0)

    voices = engine.getProperty("voices")
    engine.setProperty("voice", voices[0].id)

    filename = "response.mp3"
    engine.save_to_file(ai_response, filename)
    engine.runAndWait()

    return jsonify({"ai_response": ai_response, "audio_url": "/audio/response.mp3"})

# ✅ Audio File Route
@app.route('/audio/<filename>')
def get_audio(filename):
    return send_file(filename, mimetype="audio/mp3")

if __name__ == '__main__':
    app.run(port=5000, debug=True)  # ✅ Flask App for Authentication + Chatbot
