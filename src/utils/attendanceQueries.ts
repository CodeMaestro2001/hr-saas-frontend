import type { QueryClient } from '@tanstack/react-query'

export async function invalidateAttendanceQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['attendance'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'employee', 'attendance'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin', 'attendance'] }),
  ])
}
