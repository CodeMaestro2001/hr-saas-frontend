import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { approveLeave, cancelLeave, rejectLeave } from '../../api/leaves.api'
import type { LeaveRequest } from '../../types/workforce'
import { getApiErrorMessage } from '../../utils/apiError'
import { invalidateLeaveQueries } from '../../utils/leaveQueries'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'

export type LeaveAction = 'approve' | 'reject' | 'cancel'

interface LeaveActionDialogProps {
  leave: LeaveRequest | null
  action: LeaveAction | null
  onClose: () => void
  onSuccess: (leave: LeaveRequest, action: LeaveAction) => void
}

const actionContent = {
  approve: {
    title: 'Approve leave request?',
    description: 'This will mark the request as approved and record you as the reviewer.',
    confirmLabel: 'Approve request',
    pendingLabel: 'Approving…',
    tone: 'positive' as const,
  },
  reject: {
    title: 'Reject leave request?',
    description: 'This will mark the request as rejected. The current API does not accept a rejection note.',
    confirmLabel: 'Reject request',
    pendingLabel: 'Rejecting…',
    tone: 'danger' as const,
  },
  cancel: {
    title: 'Cancel leave request?',
    description: 'Only pending requests can be cancelled. This action cannot be reversed in the current API.',
    confirmLabel: 'Cancel request',
    pendingLabel: 'Cancelling…',
    tone: 'danger' as const,
  },
}

export function LeaveActionDialog({ leave, action, onClose, onSuccess }: LeaveActionDialogProps) {
  const queryClient = useQueryClient()
  const [errorState, setErrorState] = useState<{ key: string; message: string } | null>(null)
  const mutation = useMutation({
    mutationFn: async ({ leaveId, requestedAction }: { leaveId: string; requestedAction: LeaveAction }) => {
      if (requestedAction === 'approve') return approveLeave(leaveId)
      if (requestedAction === 'reject') return rejectLeave(leaveId)
      return cancelLeave(leaveId)
    },
  })

  if (!leave || !action) return null
  const content = actionContent[action]
  const selectionKey = `${leave.id}:${action}`
  const error = errorState?.key === selectionKey ? errorState.message : null

  const confirm = async () => {
    setErrorState(null)
    try {
      const updatedLeave = await mutation.mutateAsync({ leaveId: leave.id, requestedAction: action })
      queryClient.setQueryData(['leaves', 'detail', leave.id], updatedLeave)
      await invalidateLeaveQueries(queryClient)
      onSuccess(updatedLeave, action)
    } catch (mutationError) {
      setErrorState({ key: selectionKey, message: getApiErrorMessage(mutationError) })
      await invalidateLeaveQueries(queryClient)
    }
  }

  return (
    <ConfirmationDialog
      isOpen
      title={content.title}
      description={content.description}
      confirmLabel={content.confirmLabel}
      pendingLabel={content.pendingLabel}
      tone={content.tone}
      isPending={mutation.isPending}
      error={error}
      onConfirm={() => void confirm()}
      onCancel={onClose}
    />
  )
}
