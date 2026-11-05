export type UserRole = 'ADMIN' | 'EMPLOYEE'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export interface CurrentUserResponse {
  user: AuthUser
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
}
