import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCurrentUserRequest, loginRequest } from '../api/auth.api'
import { setAccessToken, setUnauthorizedHandler } from '../api/client'
import type { AuthUser, LoginCredentials } from '../types/auth'
import { AuthContext, type AuthContextValue } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthUser | null>(null)

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { token } = await loginRequest(credentials)
    setAccessToken(token)

    try {
      const currentUser = await getCurrentUserRequest()
      setUser(currentUser)
    } catch (error) {
      setAccessToken(null)
      setUser(null)
      queryClient.clear()
      throw error
    }
  }, [queryClient])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: user !== null,
    login,
    logout,
  }), [login, logout, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
