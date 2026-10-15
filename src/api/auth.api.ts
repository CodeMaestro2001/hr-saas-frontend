import type { AuthResponse, CurrentUserResponse, LoginCredentials } from '../types/auth'
import { apiClient } from './client'

export async function loginRequest(credentials: LoginCredentials) {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
  return response.data
}

export async function getCurrentUserRequest() {
  const response = await apiClient.get<CurrentUserResponse>('/auth/me')
  return response.data.user
}
