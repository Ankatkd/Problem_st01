"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Emotion = "happy" | "sad" | "angry" | "surprised" | "neutral"

type AvatarState = {
  emotion: Emotion
  speaking: boolean
  message: string
  setEmotion: (emotion: Emotion) => void
  setSpeaking: (speaking: boolean) => void
  setMessage: (message: string) => void
}

const AvatarContext = createContext<AvatarState | undefined>(undefined)

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [emotion, setEmotion] = useState<Emotion>("neutral")
  const [speaking, setSpeaking] = useState(false)
  const [message, setMessage] = useState("")

  return (
    <AvatarContext.Provider
      value={{
        emotion,
        speaking,
        message,
        setEmotion,
        setSpeaking,
        setMessage,
      }}
    >
      {children}
    </AvatarContext.Provider>
  )
}

export function useAvatarState() {
  const context = useContext(AvatarContext)

  if (context === undefined) {
    throw new Error("useAvatarState must be used within an AvatarProvider")
  }

  return context
}

