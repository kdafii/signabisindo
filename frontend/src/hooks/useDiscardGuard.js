import { useState } from "react"

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