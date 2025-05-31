export interface User {
  id: string
  email: string
  name?: string
  username?: string
  picture?: string
  balance?: Record<string, number>
}

export interface AuthResponse {
  user: User
  token: string
}
