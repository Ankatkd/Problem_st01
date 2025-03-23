"use client"

import type React from "react"

import { AvatarProvider } from "@/hooks/use-avatar-state"
import { AuthProvider } from "@/hooks/use-auth"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AvatarProvider>{children}</AvatarProvider>
    </AuthProvider>
  )
}

