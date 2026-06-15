import { useState, useCallback } from "react"
import { useNotification } from "../../context/NotificationContext"
import { useDiscardGuard } from "../../hooks/useDiscardGuard"
import {CameraCV} from "../../components"
import {BackModal} from "../../components"
import { QUIZ_LEVELS, API_URL } from "../../utils/constants"
import styles from "./QuizPage.module.css"

// ─── Sub-view: Level picker ─────────────────────────────────────────────────
function LevelPicker({ onSelect }) {
  return (
    <main className={styles.levelPage}>
      <h1 className={styles.levelHeading}>Pilih Level</h1>
      {QUIZ_LEVELS.map(lvl => (
        <button
          key={lvl.id}
          className={styles.levelOption}
          onClick={() => onSelect(lvl)}
        >
          {lvl.label}
        </button>
      ))}
    </main>
  )
}

// ─── Sub-view: Question ─────────────────────────────────────────────────────
function QuizQuestion({ level, soalIndex, letter, totalSoal, onNext, onSkip, onBack }) {
  const [feedback, setFeedback] = useState(null) // "correct" | "wrong" | null
  const { error: showError }    = useNotification()

  const { confirmBack, isOpen, proceed, cancel } = useDiscardGuard(onBack, true)

  const handleLandmarks = useCallback(async (left, right) => {
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ h0_landmarks: left, h1_landmarks: right }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setFeedback(data.predicted_label === letter ? "correct" : "wrong")
    } catch {
      showError("Gagal konek ke backend deteksi.")
    }
  }, [letter, showError])

  return (
    <main className={styles.questionPage}>
      <button className={styles.backBtn} onClick={confirmBack}>&#60; Back</button>

      <div className={styles.questionHeader}>
        <span className={styles.levelLabel}>{level.label}</span>
        <div className={styles.hurufInfo}>
          <span className={styles.hurufLabel}>Huruf {letter}</span>
          <span className={styles.soalCount}>Soal {soalIndex + 1} dari {totalSoal}</span>
        </div>
      </div>

      <CameraCV onLandmarks={handleLandmarks} predictInterval={300} />

      <p className={styles.hint}>Tunjukkan gestur huruf {letter} ke kamera.</p>

      {feedback && (
        <div className={`${styles.feedbackBar} ${styles[feedback]}`}>
          {feedback === "correct" ? "BENAR" : "SALAH — coba lagi"}
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.nextBtn}  onClick={() => { setFeedback(null); onNext() }}>
          Selanjutnya
        </button>
        <button className={styles.skipBtn}  onClick={() => { setFeedback(null); onSkip() }}>
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

// ─── Sub-view: Result ───────────────────────────────────────────────────────
function QuizResult({ level, correct, total, onBack }) {
  return (
    <main className={styles.resultPage}>
      <h1 className={styles.levelLabel}>{level.label}</h1>
      <div className={styles.resultCard}>
        <h2 className={styles.resultTitle}>Kuis selesai</h2>
        <p className={styles.resultStat}>Benar: {correct} dari {total}</p>
        <p className={styles.resultStat}>Akurasi: {Math.round((correct / total) * 100)}%</p>
        <button className={styles.kembaliBtn} onClick={onBack}>Kembali</button>
      </div>
    </main>
  )
}

// ─── Main QuizPage ───────────────────────────────────────────────────────────
export default function QuizPage() {
  const [view, setView]         = useState("level")   // "level" | "question" | "result"
  const [level, setLevel]       = useState(null)
  const [soalIndex, setSoalIndex] = useState(0)
  const [correct, setCorrect]   = useState(0)

  function startLevel(lvl) {
    setLevel(lvl)
    setSoalIndex(0)
    setCorrect(0)
    setView("question")
  }

  function advance(wasCorrect = false) {
    if (wasCorrect) setCorrect(c => c + 1)
    const next = soalIndex + 1
    if (next >= level.totalSoal) {
      setView("result")
    } else {
      setSoalIndex(next)
    }
  }

  const currentLetter = level?.letters[soalIndex % level.letters.length]

  if (view === "result") {
    return (
      <QuizResult
        level={level}
        correct={correct}
        total={level.totalSoal}
        onBack={() => setView("level")}
      />
    )
  }

  if (view === "question") {
    return (
      <QuizQuestion
        level={level}
        soalIndex={soalIndex}
        letter={currentLetter}
        totalSoal={level.totalSoal}
        onNext={() => advance(false)}
        onSkip={() => advance(false)}
        onBack={() => setView("level")}
      />
    )
  }

  return <LevelPicker onSelect={startLevel} />
}