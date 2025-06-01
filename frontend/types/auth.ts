export interface User {
  id: string
  email: string
  name?: string
  username?: string
  picture?: string
  balance?: Record<string, number>
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}
