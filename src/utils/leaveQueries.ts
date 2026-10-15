import type { QueryClient } from '@tanstack/react-query'

export async function invalidateLeaveQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['leaves'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin', 'leaves'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'employee', 'leaves'] }),
  ])
}
