import { z } from 'zod'

export const passwordSchema = z.string()
  .min(12, 'Password must contain at least 12 characters')
  .max(72, 'Password must contain at most 72 characters')

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(254),
})

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
}).refine(({ currentPassword, newPassword }) => currentPassword !== newPassword, {
  path: ['newPassword'],
  message: 'New password must be different',
})
