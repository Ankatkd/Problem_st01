"use client"

import { useState, useRef, useEffect } from "react"
import { useAvatarState } from "@/hooks/use-avatar-state"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Mic, MicOff, Volume2, VolumeX, StopCircle, PlusCircle } from "lucide-react"
import styles from "./chat-interface.module.css"

type Message = {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: Date
}

interface ChatInterfaceProps {
  apiEndpoint: string
}

export default function ChatInterface({ apiEndpoint }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { setEmotion, setSpeaking, setMessage } = useAvatarState()

  // Speech recognition setup
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "en-US"

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        handleSendMessage(transcript) // Automatically send the transcribed message
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      recognitionInstance.onerror = (event: Event) => {
        console.error("Speech recognition error", (event as any).error)
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    } else {
      console.warn("Speech recognition is not supported in this browser.")
    }
  }, [])

  // Text-to-speech setup
  const speak = (text: string) => {
    if (!isSpeaking || !window.speechSynthesis) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Get available voices and set a good one if available
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(
      (voice) => voice.name.includes("Google") || voice.name.includes("Female") || voice.name.includes("Samantha"),
    )

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => {
      setSpeaking(true)
    }

    utterance.onend = () => {
      setSpeaking(false)
      setMessage("")
    }

    window.speechSynthesis.speak(utterance)
  }

  // Stop the avatar's speech
  const stopAvatar = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel() // Stop speech synthesis
      setSpeaking(false) // Reset speaking state
      setMessage("") // Clear the current message
    }
  }

  // Start a new chat
  const startNewChat = () => {
    setMessages([]) // Clear all messages
    stopAvatar() // Stop any ongoing speech
  }

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Function to handle sending a message
  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText
    if (!messageText.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)

    try {
      // Call the API
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: messageText }), // Match the required JSON format
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      // Add AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.ai_response,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setEmotion("neutral") // You can update this based on the API response if needed
      setMessage(data.ai_response)

      // Speak the response
      speak(data.ai_response)
    } catch (error) {
      console.error("Error sending message:", error)

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, there was an error processing your request. Please check your API endpoint or try again later.",
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
      setEmotion("sad")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle voice input
  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser.")
      return
    }

    if (!isListening) {
      recognition.start()
      setIsListening(true)
    } else {
      recognition.stop()
      setIsListening(false)
    }
  }

  // Toggle text-to-speech
  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking)

    if (isSpeaking) {
      window.speechSynthesis?.cancel()
    }
  }

  return (
    <div className={styles.chatInterface}>
      <div className={styles.chatHeader}>
        <h2>Chat with AI Assistant</h2>
        <div className={styles.headerActions}>
          <button
            className={`${styles.actionButton} ${styles.stopButton}`}
            onClick={stopAvatar}
            title="Stop Avatar"
          >
            <StopCircle size={20} />
          </button>
          <button
            className={`${styles.actionButton} ${styles.newChatButton}`}
            onClick={startNewChat}
            title="New Chat"
          >
            <PlusCircle size={20} />
          </button>
          <button
            className={`${styles.speakButton} ${isSpeaking ? styles.active : ""}`}
            onClick={toggleSpeaking}
            title={isSpeaking ? "Mute voice responses" : "Enable voice responses"}
          >
            {isSpeaking ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`${styles.message} ${message.sender === "user" ? styles.userMessage : styles.aiMessage}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.messageContent}>
                <p>{message.text}</p>
                <span className={styles.timestamp}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            className={`${styles.message} ${styles.aiMessage} ${styles.loadingMessage}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          className={styles.textInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage()
          }}
        />

        <button
          className={`${styles.voiceButton} ${isListening ? styles.listening : ""}`}
          onClick={toggleListening}
          title={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          className={styles.sendButton}
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}