// import type { User } from "@/types/auth"
// import Cookies from "js-cookie"

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// interface LoginCredentials {
//   email: string
//   password: string
// }

// interface RegisterCredentials {
//   email: string
//   username: string
//   password: string
// }

// interface AuthResponse {
//   token: string
//   user: User
// }

// // Set up default headers for API requests
// const getAuthHeaders = (): HeadersInit => {
//   const token = Cookies.get("auth_token")
//   return {
//     "Content-Type": "application/json",
//     ...(token && { Authorization: `Bearer ${token}` }),
//   }
// }

// // Make authenticated API requests
// export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
//   const response = await fetch(`${API_BASE_URL}${url}`, {
//     ...options,
//     headers: {
//       ...getAuthHeaders(),
//       ...options.headers,
//     },
//     credentials: "include",
//     mode: "cors",
//   })

//   // If unauthorized, clear the token and redirect to login
//   if (response.status === 401) {
//     Cookies.remove("auth_token")
//     window.location.href = "/login"
//   }

//   return response
// }

// // Login with email and password
// export const loginWithCredentials = async (credentials: LoginCredentials): Promise<AuthResponse> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/users/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(credentials),
//       credentials: "include",
//       mode: "cors",
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}))
//       throw new Error(errorData.message || "Login failed")
//     }

//     const data: AuthResponse = await response.json()

//     // Store token in secure cookie
//     Cookies.set("auth_token", data.token, {
//       expires: 7, // 7 days
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax", // Changed from strict to lax for cross-origin requests
//     })

//     return data
//   } catch (error) {
//     console.error("Login error:", error)
//     throw error
//   }
// }

// // Register new user
// export const registerWithCredentials = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/users/register`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(credentials),
//       credentials: "include",
//       mode: "cors",
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}))
//       throw new Error(errorData.message || "Registration failed")
//     }

//     const data: AuthResponse = await response.json()

//     // Store token in secure cookie
//     Cookies.set("auth_token", data.token, {
//       expires: 7, // 7 days
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax", // Changed from strict to lax for cross-origin requests
//     })

//     return data
//   } catch (error) {
//     console.error("Registration error:", error)
//     throw error
//   }
// }

// // Get current user profile
// export const getCurrentUser = async (): Promise<User | null> => {
//   try {
//     const token = Cookies.get("auth_token")
//     if (!token) {
//       return null
//     }

//     const response = await fetch(`${API_BASE_URL}/api/users/me`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       credentials: "include",
//     })

//     if (!response.ok) {
//       if (response.status === 401) {
//         Cookies.remove("auth_token")
//       }
//       return null
//     }

//     const user: User = await response.json()
//     return user
//   } catch (error) {
//     console.error("Get current user error:", error)
//     return null
//   }
// }

// // Logout user
// export const logout = async (): Promise<void> => {
//   try {
//     // Clear the auth token cookie
//     Cookies.remove("auth_token")

//     // Redirect to login page
//     window.location.href = "/login"
//   } catch (error) {
//     console.error("Logout error:", error)
//   }
// }

// // Initialize authentication on app load
// export const initializeAuth = async (
//   setUser: (user: User | null) => void,
//   setAuthLoading: (loading: boolean) => void,
// ): Promise<void> => {
//   try {
//     setAuthLoading(true)
//     const user = await getCurrentUser()
//     setUser(user)
//   } catch (error) {
//     console.error("Auth initialization error:", error)
//     setUser(null)
//   } finally {
//     setAuthLoading(false)
//   }
// }

// // Check if user is authenticated
// export const isAuthenticated = (): boolean => {
//   return !!Cookies.get("auth_token")
// }
