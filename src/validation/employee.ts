import { z } from 'zod'

const commonFields = {
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(254),
  fullName: z.string().trim().min(2, 'Full name must contain at least 2 characters').max(100),
  department: z.string().trim().min(2, 'Department must contain at least 2 characters').max(100),
  jobTitle: z.string().trim().min(2, 'Job title must contain at least 2 characters').max(100),
  hireDate: z.iso.date({ error: 'Enter a valid hire date' }),
}

export const employeeFormSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('create'),
    ...commonFields,
    password: z.string().min(8, 'Password must contain at least 8 characters').max(72),
  }),
  z.object({
    mode: z.literal('edit'),
    ...commonFields,
    password: z.literal(''),
  }),
])

export type EmployeeFormInput = z.input<typeof employeeFormSchema>
export type EmployeeFormValues = z.output<typeof employeeFormSchema>
