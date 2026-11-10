import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { demoAdminLoginRequest, demoLoginRequest, loginRequest, logoutRequest, refreshSessionRequest } from '../api/auth.api'
import {
  setAccessToken,
  setTokenRefreshHandler,
  setUnauthorizedHandler,
} from '../api/client'
import type { AuthUser, LoginCredentials } from '../types/auth'
import { AuthContext, type AuthContextValue } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  const refreshAccessToken = useCallback(async () => {
    const session = await refreshSessionRequest()
    setAccessToken(session.token)
    setUser(session.user)
    return session.token
  }, [])

  useEffect(() => {
    let isActive = true
    setUnauthorizedHandler(clearSession)
    setTokenRefreshHandler(refreshAccessToken)

    void refreshSessionRequest()
      .then((session) => {
        if (!isActive) return
        setAccessToken(session.token)
        setUser(session.user)
      })
      .catch(() => {
        if (isActive) clearSession()
      })
      .finally(() => {
        if (isActive) setIsInitializing(false)
      })

    return () => {
      isActive = false
      setUnauthorizedHandler(null)
      setTokenRefreshHandler(null)
    }
  }, [clearSession, refreshAccessToken])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await loginRequest(credentials)
    setAccessToken(session.token)
    setUser(session.user)
  }, [])

  const demoLogin = useCallback(async () => {
    const session = await demoLoginRequest()
    setAccessToken(session.token)
    setUser(session.user)
  }, [])

  const demoAdminLogin = useCallback(async () => {
    const session = await demoAdminLoginRequest()
    setAccessToken(session.token)
    setUser(session.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // Local sign-out must still succeed if the API is temporarily unavailable.
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: user !== null,
    isInitializing,
    login,
    demoLogin,
    demoAdminLogin,
    logout,
  }), [demoAdminLogin, demoLogin, isInitializing, login, logout, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
