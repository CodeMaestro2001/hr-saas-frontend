import axios from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const apiClient = axios.create({
  baseURL: (configuredBaseUrl || 'http://localhost:3000/api').replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && accessToken) {
      accessToken = null
      onUnauthorized?.()
    }

    return Promise.reject(error)
  },
)
