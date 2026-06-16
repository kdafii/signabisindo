import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useQuiz } from "../../context/QuizContext"
import { useRouter, PAGES } from "../../context/RouterContext"
import styles from "./QuizPage.module.css"
import { useNotification } from "../../context/NotificationContext"

export default function QuizResultPage() {
  const { level, correct, skippedCount, resetQuiz, submitAttempt } = useQuiz()
  const { user } = useAuth()
  const { navigate } = useRouter()
  const { error: showError }    = useNotification()

  const [saving, setSaving] = useState(true)

  useEffect(() => {
    if (!level || !user) return

    submitAttempt(user, correct, skippedCount)
      .catch(err => showError(err.message || "Gagal menyimpan hasil quiz"))
      .finally(() => setSaving(false))
  }, []) // sekali saja saat mount

  if (!level) {
    navigate(PAGES.HOME)
    return null
  }

  const answered = level.totalSoal - skippedCount

  return (
    <main className={styles.resultPage}>
      <h1 className={styles.levelLabel}>{level.label}</h1>

      <div className={styles.resultCard}>
        <h2 className={styles.resultTitle}>Kuis selesai</h2>

        <p className={styles.resultStat}>Benar: {correct} dari {level.totalSoal}</p>
        <p className={styles.resultStat}>Dilewati: {skippedCount}</p>
        <p className={styles.resultStat}>
          Akurasi: {answered > 0 ? Math.round((correct / level.totalSoal) * 100) : 0}%
        </p>

        {saving && <p className={styles.savingText}>Menyimpan hasil…</p>}

        <button
          className={styles.kembaliBtn}
          disabled={saving}
          onClick={() => {
            resetQuiz()
            navigate(PAGES.HOME)
          }}
        >
          Kembali
        </button>
      </div>
    </main>
  )
}