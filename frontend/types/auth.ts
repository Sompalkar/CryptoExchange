export interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  picture?: string
  kycStatus?: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name?: string
  firstName?: string
  lastName?: string
  confirmPassword?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}
