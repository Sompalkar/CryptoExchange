import { Auth0Client } from "@auth0/auth0-spa-js"
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from "@/types/auth"

// Auth0 configuration
const auth0 = new Auth0Client({
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || "",
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || "",
  authorizationParams: {
    redirect_uri: typeof window !== "undefined" ? window.location.origin : "",
  },
  cacheLocation: "localstorage",
})

// Traditional email/password authentication
export const loginWithCredentials = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Login failed")
    }

    const data = await response.json()

    // Store tokens in localStorage
    localStorage.setItem("accessToken", data.accessToken)
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken)
    }

    return data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const registerWithCredentials = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Registration failed")
    }

    const data = await response.json()

    // After registration, automatically log in
    return await loginWithCredentials({
      email: credentials.email,
      password: credentials.password,
    })
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

// Auth0 authentication
export const loginWithAuth0 = async (): Promise<User> => {
  try {
    await auth0.loginWithPopup()
    const user = await auth0.getUser()

    if (!user) {
      throw new Error("Failed to get user information")
    }

    // Register or login the user with our backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/auth0`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        picture: user.picture,
        sub: user.sub,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Auth0 login failed")
    }

    const data = await response.json()

    // Store tokens in localStorage
    localStorage.setItem("accessToken", data.accessToken)
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken)
    }

    return data.user
  } catch (error) {
    console.error("Auth0 login error:", error)
    throw error
  }
}

export const logout = async (): Promise<void> => {
  try {
    // Clear local storage tokens
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")

    // Logout from Auth0 if user was authenticated with it
    const isAuthenticated = await auth0.isAuthenticated()
    if (isAuthenticated) {
      await auth0.logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      })
    }

    // Call backend logout endpoint
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
  } catch (error) {
    console.error("Logout error:", error)
  }
}

// Mock user data
const mockUser: User = {
  id: "user-123",
  email: "user@example.com",
  name: "John Doe",
  picture: "/placeholder.svg?height=32&width=32",
}

// Get current user from localStorage or session
export const getCurrentUser = async (): Promise<User | null> => {
  // In a real app, this would check localStorage or make an API call
  // For demo purposes, we'll just return null or a mock user
  if (typeof window !== "undefined") {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    return isLoggedIn ? mockUser : null
  }
  return null
}

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  // In a real app, this would make an API call
  // For demo purposes, we'll just return a mock user
  if (typeof window !== "undefined") {
    localStorage.setItem("isLoggedIn", "true")
  }
  return mockUser
}

// Register function
export const register = async (name: string, email: string, password: string): Promise<User> => {
  // In a real app, this would make an API call
  // For demo purposes, we'll just return a mock user
  if (typeof window !== "undefined") {
    localStorage.setItem("isLoggedIn", "true")
  }
  return { ...mockUser, name }
}

// Logout function
export const logout2 = async (): Promise<void> => {
  // In a real app, this would make an API call and clear tokens
  if (typeof window !== "undefined") {
    localStorage.removeItem("isLoggedIn")
  }
}

export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      return false
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      return false
    }

    const data = await response.json()
    localStorage.setItem("accessToken", data.accessToken)

    return true
  } catch (error) {
    console.error("Refresh token error:", error)
    return false
  }
}
