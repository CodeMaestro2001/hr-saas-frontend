import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Employee } from '../../types/workforce'
import { EmployeeForm } from './EmployeeForm'

const employee: Employee = {
  id: '8f22ac1e-a1b8-4176-a3fd-e83a0e156446',
  userId: 'ad1d9ca2-eaa9-4394-bdf8-ac73cec73c75',
  email: 'employee@example.com',
  fullName: 'Nimal Perera',
  department: 'Engineering',
  jobTitle: 'Software Engineer',
  hireDate: '2025-01-15T00:00:00.000Z',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

describe('EmployeeForm', () => {
  it('validates required create fields before submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<EmployeeForm mode="create" isSubmitting={false} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Add employee' }))

    expect(await screen.findByText('Full name must contain at least 2 characters')).toBeInTheDocument()
    expect(screen.getByText('Password must contain at least 8 characters')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a valid create payload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<EmployeeForm mode="create" isSubmitting={false} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Full name'), 'Nimal Perera')
    await user.type(screen.getByLabelText('Email address'), 'EMPLOYEE@example.com')
    await user.type(screen.getByLabelText('Initial password'), 'initial-password')
    await user.type(screen.getByLabelText('Department'), 'Engineering')
    await user.type(screen.getByLabelText('Job title'), 'Software Engineer')
    await user.type(screen.getByLabelText('Hire date'), '2025-01-15')
    await user.click(screen.getByRole('button', { name: 'Add employee' }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'employee@example.com',
      password: 'initial-password',
      fullName: 'Nimal Perera',
      department: 'Engineering',
      jobTitle: 'Software Engineer',
      hireDate: '2025-01-15',
    })
  })

  it('prefills and submits supported edit fields without a password', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<EmployeeForm mode="edit" employee={employee} isSubmitting={false} onSubmit={onSubmit} />)

    expect(screen.getByLabelText('Full name')).toHaveValue('Nimal Perera')
    expect(screen.queryByLabelText('Initial password')).not.toBeInTheDocument()
    await user.clear(screen.getByLabelText('Department'))
    await user.type(screen.getByLabelText('Department'), 'Platform Engineering')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: employee.email,
      fullName: employee.fullName,
      department: 'Platform Engineering',
      jobTitle: employee.jobTitle,
      hireDate: '2025-01-15',
    })
  })

  it('renders backend mutation errors', () => {
    render(
      <EmployeeForm
        mode="create"
        isSubmitting={false}
        apiError="Email already in use"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Email already in use')
  })
})
