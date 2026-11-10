import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { refreshSessionRequest } from '../api/auth.api'
import { useAuth } from '../hooks/useAuth'
import { AuthProvider } from './AuthProvider'

vi.mock('../api/auth.api', () => ({
  loginRequest: vi.fn(),
  demoAdminLoginRequest: vi.fn(),
  demoLoginRequest: vi.fn(),
  logoutRequest: vi.fn(),
  refreshSessionRequest: vi.fn(),
}))

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

function SessionStatus() {
  const { isAuthenticated, isInitializing, user } = useAuth()
  return (
    <p>
      {isInitializing ? 'restoring' : isAuthenticated ? `signed in as ${user?.email}` : 'signed out'}
    </p>
  )
}

describe('AuthProvider session restoration', () => {
  beforeEach(() => vi.clearAllMocks())

  it('keeps initialization active until a refresh-cookie session is restored', async () => {
    let resolveRefresh: ((value: Awaited<ReturnType<typeof refreshSessionRequest>>) => void) | undefined
    vi.mocked(refreshSessionRequest).mockReturnValue(new Promise((resolve) => {
      resolveRefresh = resolve
    }))

    render(<SessionStatus />, { wrapper: Wrapper })
    expect(screen.getByText('restoring')).toBeInTheDocument()

    resolveRefresh?.({
      token: 'access-token',
      user: { id: 'user-id', email: 'employee@example.com', role: 'EMPLOYEE' },
    })

    expect(await screen.findByText('signed in as employee@example.com')).toBeInTheDocument()
  })

  it('finishes as signed out when no refresh session exists', async () => {
    vi.mocked(refreshSessionRequest).mockRejectedValue(new Error('No session'))
    render(<SessionStatus />, { wrapper: Wrapper })

    await waitFor(() => expect(screen.getByText('signed out')).toBeInTheDocument())
  })
})
