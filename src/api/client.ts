import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const apiBaseUrl = (configuredBaseUrl || 'http://localhost:3000/api').replace(/\/+$/, '')

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
  withCredentials: true,
})

let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null
let onRefreshToken: (() => Promise<string>) | null = null

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export function setTokenRefreshHandler(handler: (() => Promise<string>) | null) {
  onRefreshToken = handler
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
      return Promise.reject(error)
    }

    const requestConfig = error.config as RetryableRequestConfig
    if (accessToken && onRefreshToken && !requestConfig._authRetry) {
      requestConfig._authRetry = true
      try {
        const token = await onRefreshToken()
        requestConfig.headers.set('Authorization', `Bearer ${token}`)
        return await apiClient.request(requestConfig)
      } catch {
        // The session is cleared below after a failed refresh.
      }
    }

    accessToken = null
    onUnauthorized?.()
    return Promise.reject(error)
  },
)
