import { useState, useRef } from "react"
import { useNotification } from "../../context/NotificationContext"
import { useQuiz } from "../../context/QuizContext"
import { useRouter, PAGES } from "../../context/RouterContext"
import { useDiscardGuard } from "../../hooks/useDiscardGuard"
import { CameraCV, BackModal } from "../../components"
import { API_URL } from "../../utils/constants"
import styles from "./QuizPage.module.css"

export default function QuizQuestionsPage() {
  const [feedback, setFeedback] = useState(null)

  const advancingRef = useRef(false)
  const cooldownRef   = useRef(false)
  const correctRef   = useRef(0)
  const skippedRef   = useRef(0)

  const { error: showError } = useNotification()
  const { navigate } = useRouter()

  const {
    level,
    soalIndex, setSoalIndex,
    setCorrect,
    setSkippedCount,
    randomLetters,
    resetQuiz,
  } = useQuiz()

  // pakai ref terpisah yang di-sync tiap render
  const soalIndexRef = useRef(soalIndex)
  soalIndexRef.current = soalIndex

  function handleBack() {
    resetQuiz()
    navigate(PAGES.HOME)
  }

  const { confirmBack, isOpen, proceed, cancel } =
    useDiscardGuard(handleBack, true)

  if (!level) {
    navigate(PAGES.HOME)
    return null
  }

  const letter = randomLetters[soalIndex]

  const letterRef = useRef(letter)
  letterRef.current = letter

  function advance(wasCorrect = false, wasSkipped = false) {
    const currentIndex = soalIndexRef.current  // baca ref SAAT advance dipanggil

    if (wasCorrect) {
      correctRef.current += 1
      setCorrect(correctRef.current)
    }
    if (wasSkipped) {
      skippedRef.current += 1
      setSkippedCount(skippedRef.current)
    }

    const next = currentIndex + 1
    if (next >= level.totalSoal) {
      navigate(PAGES.QUIZ_RESULT)
      return
    }

    soalIndexRef.current = next   // update ref sebelum setState
    setSoalIndex(next)
    setFeedback(null)
    advancingRef.current = false  // unlock setelah semua update
  }

  async function handleLandmarks(left, right) {
    if (advancingRef.current || cooldownRef.current) return

    const currentLetter = letterRef.current  // snapshot SEBELUM async

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ h0_landmarks: left, h1_landmarks: right }),
      })
      if (!res.ok) throw new Error()

      const data = await res.json()

      // cek lagi setelah await — kalau soal sudah pindah, abaikan
      if (advancingRef.current || cooldownRef.current) return

      if (data.predicted_label === currentLetter && currentLetter === letterRef.current) {
        advancingRef.current = true
        setFeedback("correct")
        setTimeout(() => {
          advance(true)
          cooldownRef.current = true
          setTimeout(() => { cooldownRef.current = false }, 1200)
        }, 800)
      } else {
        setFeedback("wrong")
      }
    } catch {
      showError("Gagal konek ke backend deteksi.")
    }
  }

  return (
    <main className={styles.questionPage}>
      <button className={styles.backBtn} onClick={confirmBack}>
        &#60; Back
      </button>

      <div className={styles.questionHeader}>
        <span className={styles.levelLabel}>{level.label}</span>
        <div className={styles.hurufInfo}>
          <span className={styles.hurufLabel}>Huruf {letter}</span>
          <span className={styles.soalCount}>
            Soal {soalIndex + 1} dari {level.totalSoal}
          </span>
        </div>
      </div>

      <CameraCV onLandmarks={handleLandmarks} predictInterval={500} />
      <p className={styles.cameraHint}>
        Tunggu landmark muncul · gunakan tangan kanan/kiri bergantian jika ada gangguan
      </p>

      <p className={styles.hint}>Tunjukkan gestur huruf {letter} ke kamera.</p>

      {feedback && (
        <div className={`${styles.feedbackBar} ${styles[feedback]}`}>
          {feedback === "correct" ? "BENAR" : "SALAH — coba lagi"}
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.skipBtn} onClick={() => {
          if (advancingRef.current) return
          advancingRef.current = true
          advance(false, true)
          cooldownRef.current = true
          setTimeout(() => { cooldownRef.current = false }, 1200)
        }}>
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