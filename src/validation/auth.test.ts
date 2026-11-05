import { describe, expect, it } from 'vitest'
import { changePasswordSchema, resetPasswordSchema } from './auth'

describe('production authentication validation', () => {
  it('requires a reset password of at least 12 characters', () => {
    const result = resetPasswordSchema.safeParse({ newPassword: 'too-short', confirmPassword: 'too-short' })
    expect(result.success).toBe(false)
  })

  it('requires reset password confirmation to match', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'a-secure-password',
      confirmPassword: 'another-password',
    })
    expect(result.success).toBe(false)
  })

  it('prevents reusing the current password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'a-secure-password',
      newPassword: 'a-secure-password',
      confirmPassword: 'a-secure-password',
    })
    expect(result.success).toBe(false)
  })
})
