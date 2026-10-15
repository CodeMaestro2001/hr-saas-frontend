import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmationDialog } from './ConfirmationDialog'

describe('ConfirmationDialog', () => {
  it('requires explicit confirmation before deactivation', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmationDialog
        isOpen
        title="Deactivate Nimal Perera?"
        description="This blocks future access."
        confirmLabel="Deactivate"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Deactivate' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('shows a deactivation API error without closing the dialog', () => {
    render(
      <ConfirmationDialog
        isOpen
        title="Deactivate employee?"
        description="This blocks future access."
        confirmLabel="Deactivate"
        error="Employee not found"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Employee not found')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
