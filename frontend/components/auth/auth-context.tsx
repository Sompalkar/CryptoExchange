"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/auth"
import { getCurrentUser, refreshToken } from "@/lib/auth"

// Define the shape of our auth context
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<boolean>
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshAuth: async () => false,
})

/**
 * AuthProvider component that wraps the application and provides authentication state
 *
 * This provider:
 * 1. Loads the current user on mount
 * 2. Provides authentication state to all child components
 * 3. Handles login, register, and logout functionality
 * 4. Manages token refresh
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get the current user
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Failed to load user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Set up token refresh interval
  useEffect(() => {
    if (!user) return

    // Refresh token every 15 minutes
    const refreshInterval = setInterval(
      async () => {
        await refreshAuth()
      },
      15 * 60 * 1000,
    ) // 15 minutes

    return () => clearInterval(refreshInterval)
  }, [user])

  /**
   * Login function that authenticates a user with email and password
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would call the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for cookies
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Login failed")
      }

      const data = await response.json()
      setUser(data.user)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Register function that creates a new user account
   */
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would call the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        credentials: "include", // Important for cookies
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Registration failed")
      }

      const data = await response.json()
      setUser(data.user)
      router.push("/trade/btc-usdt")
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout function that signs out the current user
   */
  const logout = async () => {
    try {
      // In a real app, this would call the API
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // Important for cookies
      })

      // Clear user state
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  /**
   * Refresh authentication tokens
   */
  const refreshAuth = async (): Promise<boolean> => {
    try {
      const success = await refreshToken()
      if (!success) {
        setUser(null)
        return false
      }
      return true
    } catch (error) {
      console.error("Token refresh error:", error)
      setUser(null)
      return false
    }
  }

  // Provide the auth context to children
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => useContext(AuthContext)
