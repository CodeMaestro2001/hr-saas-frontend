import { createContext } from 'react'
import type { AuthUser, LoginCredentials } from '../types/auth'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  demoLogin: () => Promise<void>
  demoAdminLogin: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
