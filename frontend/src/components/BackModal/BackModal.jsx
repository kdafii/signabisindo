import styles from "./BackModal.module.css"

/**
 * BackModal
 * Shown when user tries to navigate back during an active session (quiz, camera).
 *
 * Props:
 *   open       – boolean
 *   onProceed  – () => void  — user confirms they want to leave
 *   onCancel   – () => void  — user stays
 *   title      – string (optional)
 *   message    – string (optional)
 */
export default function BackModal({
  open,
  onProceed,
  onCancel,
  title   = "Tinggalkan sesi ini?",
  message = "Progres kamu akan hilang jika kamu keluar sekarang.",
}) {
  if (!open) return null

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="back-modal-title">
      <div className={styles.card}>
        <h2 className={styles.title} id="back-modal-title">{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Tetap di sini
          </button>
          <button className={styles.proceedBtn} onClick={onProceed}>
            Keluar
          </button>
        </div>
      </div>
    </div>
  )
}