import { useState, useCallback } from "react"
import { useNotification } from "../../context/NotificationContext"
import { useQuiz } from "../../context/QuizContext"
import { useRouter, PAGES } from "../../context/RouterContext"
import { useDiscardGuard } from "../../hooks/useDiscardGuard"
import { CameraCV, BackModal } from "../../components"
import { API_URL } from "../../utils/constants"
import styles from "./QuizPage.module.css"

export default function QuizQuestionsPage() {
  const [feedback, setFeedback] = useState(null)

  const { error: showError } = useNotification()
  const { navigate } = useRouter()

  const {
    level,
    soalIndex,
    setSoalIndex,
    correct,
    setCorrect,
  } = useQuiz()

  const { confirmBack, isOpen, proceed, cancel } =
    useDiscardGuard(() => navigate(PAGES.QUIZ_LEVEL), true)

  if (!level) {
    navigate(PAGES.QUIZ_LEVEL)
    return null
  }

  const letter =
    level.letters[soalIndex % level.letters.length]

  const handleLandmarks = useCallback(
    async (left, right) => {
      try {
        const res = await fetch(`${API_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            h0_landmarks: left,
            h1_landmarks: right,
          }),
        })

        if (!res.ok) throw new Error()

        const data = await res.json()

        setFeedback(
          data.predicted_label === letter
            ? "correct"
            : "wrong"
        )
      } catch {
        showError("Gagal konek ke backend deteksi.")
      }
    },
    [letter, showError]
  )

  function advance(wasCorrect = false) {
    if (wasCorrect) {
      setCorrect((c) => c + 1)
    }

    const next = soalIndex + 1

    if (next >= level.totalSoal) {
      navigate(PAGES.QUIZ_RESULT)
      return
    }

    setSoalIndex(next)
  }

  return (
    <main className={styles.questionPage}>
      <button
        className={styles.backBtn}
        onClick={confirmBack}
      >
        &#60; Back
      </button>

      <div className={styles.questionHeader}>
        <span className={styles.levelLabel}>
          {level.label}
        </span>

        <div className={styles.hurufInfo}>
          <span className={styles.hurufLabel}>
            Huruf {letter}
          </span>

          <span className={styles.soalCount}>
            Soal {soalIndex + 1} dari {level.totalSoal}
          </span>
        </div>
      </div>

      <CameraCV
        onLandmarks={handleLandmarks}
        predictInterval={300}
      />

      <p className={styles.hint}>
        Tunjukkan gestur huruf {letter} ke kamera.
      </p>

      {feedback && (
        <div
          className={`${styles.feedbackBar} ${styles[feedback]}`}
        >
          {feedback === "correct"
            ? "BENAR"
            : "SALAH — coba lagi"}
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={styles.nextBtn}
          onClick={() => {
            setFeedback(null)
            advance(false)
          }}
        >
          Selanjutnya
        </button>

        <button
          className={styles.skipBtn}
          onClick={() => {
            setFeedback(null)
            advance(false)
          }}
        >
          Lewati
        </button>
      </div>

      <BackModal
        open={isOpen}
        onProceed={proceed}
        onCancel={cancel}
        message="Keluar dari kuis? Progres di level ini tidak tersimpan."
      />
    </main>
  )
}