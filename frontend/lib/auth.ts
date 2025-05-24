import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from "@/types/auth"

// API URL from environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Traditional email/password authentication
export const loginWithCredentials = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/users/login`, {
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
    const response = await fetch(`${API_URL}/api/users/register`, {
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

export const logout = async (): Promise<void> => {
  try {
    // Clear local storage tokens
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")

    // Call backend logout endpoint
    await fetch(`${API_URL}/api/users/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
  } catch (error) {
    console.error("Logout error:", error)
  }
}

// Get current user from API
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem("accessToken")
    if (!token) return null

    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        const refreshed = await refreshToken()
        if (refreshed) {
          // Try again with new token
          return getCurrentUser()
        }
        return null
      }
      throw new Error("Failed to fetch user data")
    }

    const userData = await response.json()
    return userData
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      return false
    }

    const response = await fetch(`${API_URL}/api/users/refresh`, {
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

// Helper function to make authenticated API requests
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem("accessToken")

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })

  // If unauthorized and we have a refresh token, try to refresh and retry
  if (response.status === 401) {
    const refreshed = await refreshToken()
    if (refreshed) {
      // Retry with new token
      return fetchWithAuth(url, options)
    }
  }

  return response
}
