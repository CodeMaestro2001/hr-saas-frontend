import { useEffect } from 'react'

const warningMessage = 'You have unsaved changes. Leave this page and discard them?'

export function useUnsavedChanges(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const interceptInternalLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null
      if (!target || target.target === '_blank' || target.hasAttribute('download')) return
      const destination = new URL(target.href, window.location.href)
      const current = new URL(window.location.href)
      if (destination.origin !== current.origin || destination.href === current.href) return
      if (!window.confirm(warningMessage)) {
        event.preventDefault()
        event.stopImmediatePropagation()
      }
    }

    window.addEventListener('beforeunload', beforeUnload)
    document.addEventListener('click', interceptInternalLink, true)
    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
      document.removeEventListener('click', interceptInternalLink, true)
    }
  }, [enabled])
}
