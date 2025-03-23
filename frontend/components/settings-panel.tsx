"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Moon, Sun } from "lucide-react"
import styles from "./settings-panel.module.css"

interface SettingsPanelProps {
  initialEndpoint: string
  onSave: (endpoint: string) => void
  onClose: () => void
  onModeChange: (mode: "light" | "dark") => void // Callback for mode change
}

export default function SettingsPanel({ initialEndpoint, onSave, onClose, onModeChange }: SettingsPanelProps) {
  const [endpoint, setEndpoint] = useState(initialEndpoint)
  const [isValid, setIsValid] = useState(true)
  const [mode, setMode] = useState<"light" | "dark">("light") // Default to light mode

  // Load mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("mode") as "light" | "dark" | null
    if (savedMode) {
      setMode(savedMode)
      onModeChange(savedMode) // Apply the saved mode globally
    }
  }, [onModeChange])

  // Validate URL when endpoint changes
  useEffect(() => {
    if (endpoint) {
      try {
        new URL(endpoint)
        setIsValid(true)
      } catch (e) {
        setIsValid(false)
      }
    } else {
      // Empty is valid (will use fallback)
      setIsValid(true)
    }
  }, [endpoint])

  // Handle saving settings
  const handleSave = () => {
    if (isValid) {
      onSave(endpoint)
    }
  }

  // Toggle between light and dark mode
  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light"
    setMode(newMode)
    localStorage.setItem("mode", newMode) // Save mode to localStorage
    onModeChange(newMode) // Apply the new mode globally
  }

  return (
    <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className={styles.panel}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className={styles.header}>
          <h2>Settings</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

       

          {/* Mode Toggle Section */}
          <div className={styles.formGroup}>
            <label>Theme Mode</label>
            <div className={styles.modeToggle} onClick={toggleMode}>
              <div className={`${styles.modeButton} ${mode === "light" ? styles.active : ""}`}>
                <Sun size={16} />
                <span>Light</span>
              </div>
              <div className={`${styles.modeButton} ${mode === "dark" ? styles.active : ""}`}>
                <Moon size={16} />
                <span>Dark</span>
              </div>
            </div>
          </div>

          {/* API Format Section */}
          <div className={styles.apiFormat}>
            
            <pre className={styles.codeBlock}>
              {}
            </pre>
          </div>
        

        {/* Footer Buttons */}
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveButton} onClick={handleSave} disabled={!isValid}>
            Save Settings
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}