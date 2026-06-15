import { useState, useCallback } from "react"
import { useRouter, PAGES } from "../../context/RouterContext"
import { useNotification } from "../../context/NotificationContext"
import { useDiscardGuard } from "../../hooks/useDiscardGuard"
import {CameraCV} from "../../components"
import {BackModal} from "../../components"
import { ALPHABET, API_URL } from "../../utils/constants"
import styles from "./DictionaryPage.module.css"

// ─── Sub-view: Alphabet grid ────────────────────────────────────────────────
function AlphabetGrid({ onSelect }) {
  return (
    <main className={styles.gridPage}>
      <div className={styles.grid}>
        {ALPHABET.map(letter => (
          <button
            key={letter}
            className={styles.alphaCard}
            onClick={() => onSelect(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    </main>
  )
}

// ─── Sub-view: Alphabet detail ──────────────────────────────────────────────
function AlphabetDetail({ letter, onBack, onOpenCamera }) {
  return (
    <main className={styles.detailPage}>
      <button className={styles.backBtn} onClick={onBack}>&#60; Back</button>
      <h1 className={styles.detailTitle}>Huruf {letter}</h1>

      {/* Placeholder for actual sign image */}
      <div className={styles.signImage} aria-label={`Gambar isyarat huruf ${letter}`} />

      <p className={styles.detailDesc}>
        Bentuk tangan untuk huruf {letter} dalam alfabet BISINDO.
      </p>

      <button className={styles.primaryBtn} onClick={onOpenCamera}>
        Coba dengan kamera
      </button>
    </main>
  )
}

// ─── Sub-view: Camera + live detection ─────────────────────────────────────
function AlphabetCamera({ letter, onBack }) {
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
    <main className={styles.cameraPage}>
      <button className={styles.backBtn} onClick={confirmBack}>&#60; Back</button>
      <h1 className={styles.detailTitle}>Huruf {letter}</h1>

      <CameraCV onLandmarks={handleLandmarks} predictInterval={300} />

      <p className={styles.detailDesc}>
        Tunjukkan gestur huruf {letter} ke kamera.
      </p>

      {feedback && (
        <div className={`${styles.feedbackBar} ${styles[feedback]}`}>
          {feedback === "correct" ? "BENAR" : "SALAH — coba lagi"}
        </div>
      )}

      <BackModal
        open={isOpen}
        onProceed={proceed}
        onCancel={cancel}
        message="Keluar dari sesi latihan kamera?"
      />
    </main>
  )
}

// ─── Main DictionaryPage ────────────────────────────────────────────────────


export default function DictionaryPage() {
  const { navigate } = useRouter()
  const [view, setView]     = useState("grid")
  const [letter, setLetter] = useState(null)

  function selectLetter(l) {
    setLetter(l)
    setView("detail")
  }

  if (view === "camera") {
    return (
      <AlphabetCamera
        letter={letter}
        onBack={() => setView("detail")}
      />
    )
  }

  if (view === "detail") {
    return (
      <AlphabetDetail
        letter={letter}
        onBack={() => setView("grid")}
        onOpenCamera={() => setView("camera")}
      />
    )
  }

  return <AlphabetGrid onSelect={selectLetter} />
}