"use client"

import type React from "react"

import { useEffect } from "react"
import { useRecoilState } from "recoil"
import { userState, authLoadingState } from "@/lib/recoil/atoms"
import { getCurrentUser } from "@/lib/auth"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useRecoilState(userState)
  const [loading, setLoading] = useRecoilState(authLoadingState)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [setUser, setLoading])

  return <>{children}</>
}
