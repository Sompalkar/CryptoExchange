import type { User } from "@/types/auth"
import type { SetterOrUpdater } from "recoil"
import Cookies from "js-cookie"

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Token storage key in cookies
const TOKEN_KEY = "nexusx_auth_token"
const TOKEN_EXPIRY_DAYS = 7

// Get the stored token from cookies
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return Cookies.get(TOKEN_KEY) || null
}

// Store the token in cookies
export function setToken(token: string): void {
  if (typeof window === "undefined") return
  Cookies.set(TOKEN_KEY, token, {
    expires: TOKEN_EXPIRY_DAYS,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
}

// Remove the token from cookies
export function removeToken(): void {
  if (typeof window === "undefined") return
  Cookies.remove(TOKEN_KEY)
}

// Fetch with authentication
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  return fetch(url.startsWith("http") ? url : `${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: "include", // Include cookies in requests
  })
}

// Register with credentials
export async function registerWithCredentials({
  email,
  username,
  password,
}: {
  email: string
  username: string
  password: string
}): Promise<{ user: User; token: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Registration failed")
    }

    const data = await response.json()
    setToken(data.token)
    return data
  } catch (error) {
    console.error("Registration error:", error)

    // For demo purposes only - remove in production
    if (process.env.NODE_ENV === "development") {
      const demoUser = {
        id: "demo-user-id",
        email,
        username: username || email.split("@")[0],
        name: username || email.split("@")[0],
        balance: {
          BTC: 0.5,
          USDT: 10000,
          ETH: 5.0,
        },
      }
      const demoToken = "demo-token"
      setToken(demoToken)
      return { user: demoUser, token: demoToken }
    }

    throw error
  }
}

// Login with credentials
export async function loginWithCredentials({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<{ user: User; token: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Login failed")
    }

    const data = await response.json()
    setToken(data.token)
    return data
  } catch (error) {
    console.error("Login error:", error)

    // For demo purposes only - remove in production
    if (process.env.NODE_ENV === "development") {
      const demoUser = {
        id: "demo-user-id",
        email,
        name: email.split("@")[0],
        balance: {
          BTC: 0.5,
          USDT: 10000,
          ETH: 5.0,
        },
      }
      const demoToken = "demo-token"
      setToken(demoToken)
      return { user: demoUser, token: demoToken }
    }

    throw error
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const token = getToken()
  if (!token) return null

  try {
    const response = await fetchWithAuth(`/api/users/me`)

    if (!response.ok) {
      if (response.status === 401) {
        removeToken()
        return null
      }
      throw new Error("Failed to get user profile")
    }

    return await response.json()
  } catch (error) {
    console.error("Get current user error:", error)

    // For demo purposes only - remove in production
    if (process.env.NODE_ENV === "development") {
      return {
        id: "demo-user-id",
        email: "demo@example.com",
        name: "Demo User",
        picture: "",
        balance: {
          BTC: 0.5,
          USDT: 10000,
          ETH: 5.0,
          SOL: 25,
          ADA: 1000,
          DOT: 100,
        },
      }
    }

    return null
  }
}

// Initialize authentication
export async function initializeAuth(
  setUser: SetterOrUpdater<User | null>,
  setAuthLoading: SetterOrUpdater<boolean>,
): Promise<void> {
  setAuthLoading(true)
  try {
    const user = await getCurrentUser()
    setUser(user)
  } catch (error) {
    console.error("Auth initialization error:", error)
    setUser(null)
  } finally {
    setAuthLoading(false)
  }
}

// Logout
export async function logout(setUser: SetterOrUpdater<User | null>): Promise<void> {
  removeToken()
  setUser(null)
}
