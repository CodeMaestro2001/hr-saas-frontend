import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LeaveForm } from './LeaveForm'

describe('LeaveForm', () => {
  it('validates required fields and date order', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<LeaveForm isSubmitting={false} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Submit request' }))
    expect(await screen.findByText('Select a leave type', { selector: '#leaveType-error' })).toBeInTheDocument()
    expect(screen.getByText('Reason must contain at least 3 characters')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    await user.selectOptions(screen.getByLabelText('Leave type'), 'ANNUAL')
    await user.type(screen.getByLabelText('Start date'), '2026-11-05')
    await user.type(screen.getByLabelText('End date'), '2026-11-04')
    await user.type(screen.getByLabelText('Reason'), 'Family event')
    await user.click(screen.getByRole('button', { name: 'Submit request' }))
    expect(await screen.findByText('End date must be on or after start date')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a valid date-only request', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<LeaveForm isSubmitting={false} onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByLabelText('Leave type'), 'SICK')
    await user.type(screen.getByLabelText('Start date'), '2026-11-02')
    await user.type(screen.getByLabelText('End date'), '2026-11-04')
    await user.type(screen.getByLabelText('Reason'), 'Medical recovery')
    await user.click(screen.getByRole('button', { name: 'Submit request' }))

    expect(onSubmit).toHaveBeenCalledWith({
      leaveType: 'SICK',
      startDate: '2026-11-02',
      endDate: '2026-11-04',
      reason: 'Medical recovery',
    }, expect.anything())
  })

  it('shows overlapping-request errors from the API', () => {
    render(
      <LeaveForm
        isSubmitting={false}
        apiError="Leave dates overlap an active leave request"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Leave dates overlap an active leave request')
  })
})
