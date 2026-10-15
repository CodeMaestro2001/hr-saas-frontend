import { z } from 'zod'

export const leaveFormSchema = z.object({
  leaveType: z.enum(['ANNUAL', 'SICK', 'CASUAL'], { error: 'Select a leave type' }),
  startDate: z.iso.date({ error: 'Enter a valid start date' }),
  endDate: z.iso.date({ error: 'Enter a valid end date' }),
  reason: z.string().trim().min(3, 'Reason must contain at least 3 characters').max(500),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
})

export type LeaveFormInput = z.input<typeof leaveFormSchema>
export type LeaveFormValues = z.output<typeof leaveFormSchema>
