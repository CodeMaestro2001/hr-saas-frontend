import axios from 'axios'
import type {
  AuthResponse,
  ChangePasswordInput,
  LoginCredentials,
  ResetPasswordInput,
} from '../types/auth'
import { apiBaseUrl, apiClient } from './client'

const sessionClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  withCredentials: true,
})

let refreshPromise: Promise<AuthResponse> | null = null

export async function loginRequest(credentials: LoginCredentials) {
  const response = await sessionClient.post<AuthResponse>('/auth/login', credentials)
  return response.data
}

export async function demoLoginRequest() {
  const response = await sessionClient.post<AuthResponse>('/auth/demo')
  return response.data
}

export async function demoAdminLoginRequest() {
  const response = await sessionClient.post<AuthResponse>('/auth/demo-admin')
  return response.data
}

export function refreshSessionRequest() {
  refreshPromise ??= sessionClient
    .post<AuthResponse>('/auth/refresh')
    .then((response) => response.data)
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

export async function logoutRequest() {
  await sessionClient.post('/auth/logout')
}

export async function forgotPasswordRequest(email: string) {
  const response = await sessionClient.post<{ message: string }>('/auth/forgot-password', { email })
  return response.data
}

export async function resetPasswordRequest(input: ResetPasswordInput) {
  await sessionClient.post('/auth/reset-password', input)
}

export async function changePasswordRequest(input: ChangePasswordInput) {
  await apiClient.post('/auth/change-password', input)
}
