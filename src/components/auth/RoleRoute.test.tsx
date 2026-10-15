import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../../hooks/useAuth'
import { RoleRoute } from './RoleRoute'

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }))

const mockUser = (role: 'ADMIN' | 'EMPLOYEE') => {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 'user-id', email: `${role.toLowerCase()}@example.com`, role },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })
}

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/employees']}>
      <Routes>
        <Route path="/access-denied" element={<p>Access denied page</p>} />
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/employees" element={<p>Employee directory</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

function renderEmployeeLeaveRoute() {
  return render(
    <MemoryRouter initialEntries={['/leaves']}>
      <Routes>
        <Route path="/access-denied" element={<p>Access denied page</p>} />
        <Route element={<RoleRoute allowedRoles={['EMPLOYEE']} />}>
          <Route path="/leaves" element={<p>My leave requests</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

function renderAttendanceRoute(path: '/attendance' | '/attendance-management') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/access-denied" element={<p>Access denied page</p>} />
        <Route element={<RoleRoute allowedRoles={['EMPLOYEE']} />}>
          <Route path="/attendance" element={<p>My attendance page</p>} />
        </Route>
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/attendance-management" element={<p>Admin attendance page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('RoleRoute', () => {
  beforeEach(() => vi.clearAllMocks())

  it('allows an administrator to access employee management', () => {
    mockUser('ADMIN')
    renderAdminRoute()
    expect(screen.getByText('Employee directory')).toBeInTheDocument()
  })

  it('redirects an employee away from admin employee management', () => {
    mockUser('EMPLOYEE')
    renderAdminRoute()
    expect(screen.getByText('Access denied page')).toBeInTheDocument()
    expect(screen.queryByText('Employee directory')).not.toBeInTheDocument()
  })

  it('allows an employee to access their own leave page', () => {
    mockUser('EMPLOYEE')
    renderEmployeeLeaveRoute()
    expect(screen.getByText('My leave requests')).toBeInTheDocument()
  })

  it('redirects an administrator away from employee-only leave data', () => {
    mockUser('ADMIN')
    renderEmployeeLeaveRoute()
    expect(screen.getByText('Access denied page')).toBeInTheDocument()
    expect(screen.queryByText('My leave requests')).not.toBeInTheDocument()
  })

  it('allows employees only on personal attendance routes', () => {
    mockUser('EMPLOYEE')
    renderAttendanceRoute('/attendance')
    expect(screen.getByText('My attendance page')).toBeInTheDocument()
  })

  it('prevents employees from viewing admin attendance', () => {
    mockUser('EMPLOYEE')
    renderAttendanceRoute('/attendance-management')
    expect(screen.getByText('Access denied page')).toBeInTheDocument()
  })

  it('allows administrators on read-only attendance management', () => {
    mockUser('ADMIN')
    renderAttendanceRoute('/attendance-management')
    expect(screen.getByText('Admin attendance page')).toBeInTheDocument()
  })

  it('prevents administrators from using employee check-in routes', () => {
    mockUser('ADMIN')
    renderAttendanceRoute('/attendance')
    expect(screen.getByText('Access denied page')).toBeInTheDocument()
  })
})
