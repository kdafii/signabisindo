import { useNotification } from "../../context/NotificationContext"
import styles from "./NotificationToast.module.css"

/**
 * NotificationToast
 * Renders all active notifications as a stacked list in the top-right corner.
 * Consumed from NotificationContext — just mount this once in App.jsx.
 */
export default function NotificationToast() {
  const { notifications, dismiss } = useNotification()

  if (!notifications.length) return null

  return (
    <div className={styles.stack} role="region" aria-live="polite" aria-label="Notifikasi">
      {notifications.map(n => (
        <div key={n.id} className={`${styles.toast} ${styles[n.type]}`}>
          <span className={styles.message}>{n.message}</span>
          <button
            className={styles.close}
            onClick={() => dismiss(n.id)}
            aria-label="Tutup notifikasi"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}