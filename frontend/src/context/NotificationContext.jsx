import { createContext, useContext, useState, useCallback } from "react"

const NotificationContext = createContext(null)

let _id = 0

/**
 * Notification types: "success" | "error" | "info"
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const push = useCallback((message, type = "info", duration = 3000) => {
    const id = ++_id
    setNotifications(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [])

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const success = useCallback((msg, dur) => push(msg, "success", dur), [push])
  const error   = useCallback((msg, dur) => push(msg, "error",   dur), [push])
  const info    = useCallback((msg, dur) => push(msg, "info",    dur), [push])

  return (
    <NotificationContext.Provider value={{ notifications, push, dismiss, success, error, info }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotification must be used inside NotificationProvider")
  return ctx
}