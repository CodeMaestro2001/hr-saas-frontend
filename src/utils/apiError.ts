import axios from 'axios'

interface ApiErrorBody {
  error?: {
    message?: unknown
  }
}

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return 'Something went wrong. Please try again.'
  }

  if (!error.response) {
    return 'Unable to reach the server. Check that the API is running and try again.'
  }

  if (error.response.status === 403) {
    return 'You do not have permission to perform this action.'
  }

  const message = error.response.data?.error?.message
  if (typeof message === 'string' && message.trim()) {
    return message
  }

  return 'The server could not complete your request. Please try again.'
}
