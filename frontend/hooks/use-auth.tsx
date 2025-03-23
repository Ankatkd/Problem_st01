"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // In a real app, this would call your API
    // For demo purposes, we'll simulate a successful login

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple validation (in a real app, this would be done on the server)
    if (email === "demo@example.com" && password === "password") {
      const user = {
        id: "1",
        name: "Demo User",
        email: "demo@example.com",
      }
      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      return
    }

    // For demo purposes, accept any email/password with basic validation
    if (email.includes("@") && password.length >= 6) {
      // Generate a random user
      const user = {
        id: Math.random().toString(36).substring(2, 9),
        name: email.split("@")[0],
        email,
      }
      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      return
    }

    throw new Error("Invalid email or password")
  }

  const signup = async (name: string, email: string, password: string) => {
    // In a real app, this would call your API
    // For demo purposes, we'll simulate a successful signup

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple validation
    if (!email.includes("@") || password.length < 6) {
      throw new Error("Invalid email or password")
    }

    const user = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
    }

    setUser(user)
    localStorage.setItem("user", JSON.stringify(user))
  }

  const logout = async () => {
    // In a real app, this would call your API
    // For demo purposes, we'll just clear the local storage

    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

