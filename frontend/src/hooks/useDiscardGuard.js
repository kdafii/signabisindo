import { useState } from "react"

/**
 * useDiscardGuard
 *
 * Returns helpers to intercept a "back" action and show a
 * confirmation modal when there is unsaved progress.
 *
 * Usage:
 *   const { confirmBack, isOpen, proceed, cancel } = useDiscardGuard(onActualBack)
 *   <button onClick={confirmBack}>Back</button>
 *   <BackModal open={isOpen} onProceed={proceed} onCancel={cancel} />
 */
export function useDiscardGuard(onBack, hasProgress = true) {
  const [isOpen, setIsOpen] = useState(false)

  function confirmBack() {
    if (hasProgress) {
      setIsOpen(true)
    } else {
      onBack()
    }
  }

  function proceed() {
    setIsOpen(false)
    onBack()
  }

  function cancel() {
    setIsOpen(false)
  }

  return { confirmBack, isOpen, proceed, cancel }
}