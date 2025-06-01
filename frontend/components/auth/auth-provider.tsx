"use client"

import type React from "react"

import { useEffect } from "react"
import { useRecoilState } from "recoil"
import { userState, authLoadingState } from "@/lib/recoil/atoms"
import { initializeAuth } from "@/lib/auth"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setUser] = useRecoilState(userState)
  const [, setAuthLoading] = useRecoilState(authLoadingState)

  // Initialize authentication on component mount
  useEffect(() => {
    initializeAuth(setUser, setAuthLoading)
  }, [setUser, setAuthLoading])

  return <>{children}</>
}
