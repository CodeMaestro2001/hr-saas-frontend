import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { approveLeave, cancelLeave, rejectLeave } from '../../api/leaves.api'
import type { LeaveRequest } from '../../types/workforce'
import { LeaveActionDialog, type LeaveAction } from './LeaveActionDialog'

vi.mock('../../api/leaves.api', () => ({
  approveLeave: vi.fn(),
  cancelLeave: vi.fn(),
  rejectLeave: vi.fn(),
}))

const leave: LeaveRequest = {
  id: 'e8c3ca90-3061-4c04-bd5a-778176a1cc45',
  employeeId: 'employee-id',
  leaveType: 'ANNUAL',
  startDate: '2026-11-02T00:00:00.000Z',
  endDate: '2026-11-04T00:00:00.000Z',
  reason: 'Family event',
  status: 'PENDING',
  reviewedById: null,
  reviewedAt: null,
  createdAt: '2026-10-15T00:00:00.000Z',
  updatedAt: '2026-10-15T00:00:00.000Z',
  employee: {
    id: 'employee-id',
    fullName: 'Nimal Perera',
    department: 'Engineering',
    jobTitle: 'Engineer',
    user: { id: 'user-id', email: 'employee@example.com' },
  },
  reviewedBy: null,
}

function TestQueryProvider({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

function renderAction(action: LeaveAction, onSuccess = vi.fn()) {
  render(
    <TestQueryProvider>
      <LeaveActionDialog leave={leave} action={action} onClose={vi.fn()} onSuccess={onSuccess} />
    </TestQueryProvider>,
  )
  return onSuccess
}

describe('LeaveActionDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cancels a pending employee request after confirmation', async () => {
    const user = userEvent.setup()
    const cancelled = { ...leave, status: 'CANCELLED' as const }
    vi.mocked(cancelLeave).mockResolvedValue(cancelled)
    const onSuccess = renderAction('cancel')

    await user.click(screen.getByRole('button', { name: 'Cancel request' }))
    expect(cancelLeave).toHaveBeenCalledWith(leave.id)
    expect(onSuccess).toHaveBeenCalledWith(cancelled, 'cancel')
  })

  it.each([
    ['approve' as const, approveLeave, 'Approve request'],
    ['reject' as const, rejectLeave, 'Reject request'],
  ])('%ss a pending request after admin confirmation', async (action, request, buttonName) => {
    const user = userEvent.setup()
    const updated = { ...leave, status: action === 'approve' ? 'APPROVED' as const : 'REJECTED' as const }
    vi.mocked(request).mockResolvedValue(updated)
    const onSuccess = renderAction(action)

    await user.click(screen.getByRole('button', { name: buttonName }))
    expect(request).toHaveBeenCalledWith(leave.id)
    expect(onSuccess).toHaveBeenCalledWith(updated, action)
  })

  it('keeps a 409 state-conflict error visible', async () => {
    const user = userEvent.setup()
    vi.mocked(approveLeave).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: { error: { message: 'Only pending leave requests can be reviewed' } },
      },
    })
    renderAction('approve')

    await user.click(screen.getByRole('button', { name: 'Approve request' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Only pending leave requests can be reviewed')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
