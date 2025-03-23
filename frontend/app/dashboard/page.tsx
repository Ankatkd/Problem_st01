"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import Avatar from "@/components/avatar"
import ChatInterface from "@/components/chat-interface"
import SettingsPanel from "@/components/settings-panel"
import { Settings, LogOut } from "lucide-react"
import styles from "./dashboard.module.css"




export default function Dashboard() {
  const [showSettings, setShowSettings] = useState(false)
  const [apiEndpoint, setApiEndpoint] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [mode, setMode] = useState<"light" | "dark">("light") // Default to light mode
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    // Load saved API endpoint from localStorage if available
    const savedEndpoint = localStorage.getItem("apiEndpoint")
    if (savedEndpoint) {
      setApiEndpoint(savedEndpoint)
    }

    // Load saved mode from localStorage if available
    const savedMode = localStorage.getItem("mode") as "light" | "dark" | null
    if (savedMode) {
      setMode(savedMode)
      document.documentElement.setAttribute("data-theme", savedMode) // Apply saved mode globally
    }

    // Add animation delay for initial load
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [user, isLoading, router])

  const handleSaveSettings = (endpoint: string) => {
    setApiEndpoint(endpoint)
    localStorage.setItem("apiEndpoint", endpoint)
    setShowSettings(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Handle mode change (light/dark)
  const handleModeChange = (newMode: "light" | "dark") => {
    setMode(newMode)
    localStorage.setItem("mode", newMode) // Save mode to localStorage
    document.documentElement.setAttribute("data-theme", newMode) // Apply mode globally
  }

  if (isLoading || !user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <main className={styles.main}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <motion.div
            className={styles.userInfo}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className={styles.userAvatar}>{user.name.charAt(0)}</div>
            <div className={styles.userDetails}>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>
          </motion.div>

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <button className={styles.actionButton} onClick={() => setShowSettings(true)} aria-label="Settings">
              <Settings size={20} />
              <span>Settings</span>
            </button>

            <button
              className={`${styles.actionButton} ${styles.logoutButton}`}
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </motion.div>
        </div>

        <motion.h1
          className={styles.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          AI Avatar Assistant
        </motion.h1>

        <div className={styles.contentContainer}>
          <motion.div
            className={styles.avatarContainer}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
          >
            {isLoaded && <Avatar />}
          </motion.div>

          <motion.div
            className={styles.chatContainer}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <ChatInterface apiEndpoint={apiEndpoint} />
          </motion.div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <SettingsPanel
              initialEndpoint={apiEndpoint}
              onSave={handleSaveSettings}
              onClose={() => setShowSettings(false)}
              onModeChange={handleModeChange} // Pass mode change handler
            />
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  )
}