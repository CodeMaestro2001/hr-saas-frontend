import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AttendanceRecord } from '../../types/workforce'
import { AttendanceStatusCard } from './AttendanceStatusCard'
import { AttendanceTable } from './AttendanceTable'
import { CheckInOutButton } from './CheckInOutButton'

const record: AttendanceRecord = {
  id: 'attendance-id',
  employeeId: 'employee-id',
  checkInTime: '2026-10-15T21:30:00.000Z',
  checkOutTime: '2026-10-16T00:00:00.000Z',
  workedMinutes: 150,
  createdAt: '2026-10-15T21:30:00.000Z',
  updatedAt: '2026-10-16T00:00:00.000Z',
  employee: {
    id: 'employee-id',
    fullName: 'Nimal Perera',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    user: { email: 'employee@example.com' },
  },
}

describe('attendance UI components', () => {
  it('renders backend workedMinutes for an overnight session', () => {
    render(<AttendanceTable records={[record]} showEmployee />)
    expect(screen.getByText('2 hr 30 min')).toBeInTheDocument()
    expect(screen.getByText('Nimal Perera')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('shows an open session as checked in and offers checkout', () => {
    render(<AttendanceStatusCard records={[{ ...record, checkOutTime: null, workedMinutes: null }]} isActionPending={false} onAction={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Checked in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Check out' })).toBeInTheDocument()
  })

  it('prevents repeated actions while a check-in is pending', async () => {
    const onClick = vi.fn()
    render(<CheckInOutButton isCheckedIn={false} isPending onClick={onClick} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Check in...' }))
    expect(onClick).not.toHaveBeenCalled()
  })
})
