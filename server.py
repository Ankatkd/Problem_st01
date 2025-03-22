from flask import Flask, request, jsonify, send_file
import google.generativeai as genai
import pyttsx3
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Step 1: Configure Gemini API
genai.configure(api_key="AIzaSyBdoa9PPqb1a-dDYWp8aRbV-jJK2b5kaiQ")  # Replace with your actual key
model = genai.GenerativeModel("gemini-2.0-flash")  # Correct model usage

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_text = data.get("text")

    # Step 2: Generate AI Response from Gemini
    response = model.generate_content([user_text])  # ✅ Corrected syntax
    ai_response = response.text

    # Step 3: Convert AI response to speech
    engine = pyttsx3.init()
    engine.setProperty("rate", 150)  # Adjust speed
    engine.setProperty("volume", 1.0)

    # Select a male or female voice
    voices = engine.getProperty("voices")
    engine.setProperty("voice", voices[0].id)  # Change index for male/female voice

    # Save AI response as MP3
    filename = "response.mp3"
    engine.save_to_file(ai_response, filename)
    engine.runAndWait()

    # Step 4: Return AI response & speech file URL
    return jsonify({"ai_response": ai_response, "audio_url": "/audio/response.mp3"})

@app.route("/audio/<filename>")
def get_audio(filename):
    return send_file(filename, mimetype="audio/mp3")

if __name__ == "__main__":
    app.run(port=5000)
