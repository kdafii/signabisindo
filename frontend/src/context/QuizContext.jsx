import { createContext, useContext, useRef, useState } from "react"
import {QUIZ_LEVELS} from "../utils/constants"

const QuizContext = createContext()
const API = import.meta.env.VITE_API_BASE_URL

function generateRandomLetters(letters, total) {
  return Array.from({ length: total }, () =>
    letters[Math.floor(Math.random() * letters.length)]
  )
}

export function QuizProvider({ children }) {
  const LEVEL_1 = QUIZ_LEVELS[0]

  const [soalIndex, setSoalIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [startedAt, setStartedAt]= useState(null)
  const startedAtRef = useRef(new Date().toISOString())

  const [randomLetters, setRandomLetters] = useState(() =>
    generateRandomLetters(LEVEL_1.letters, LEVEL_1.totalSoal)
  )

  const level = LEVEL_1

  function resetQuiz() {
    startedAtRef.current = new Date().toISOString()  // reset hanya saat mulai quiz baru
    setSoalIndex(0)
    setCorrect(0)
    setSkippedCount(0)
    setRandomLetters(generateRandomLetters(level.letters, level.totalSoal))
  }

  async function submitAttempt(user, finalCorrect, finalSkipped) {
    const completedAt = new Date().toISOString()  // simpan dengan Z dulu
    const started = startedAtRef.current           // juga ada Z

    const durationSeconds = Math.round(
      (new Date(completedAt) - new Date(started)) / 1000  // keduanya UTC, aman
    )

    console.log("startedAt:", started)
    console.log("completedAt:", completedAt)
    console.log("diff ms:", new Date(completedAt) - new Date(started))

    const res = await fetch(`${API}/quiz-attempts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.access_token}`,
      },
      body: JSON.stringify({
        user_id:             user.id,
        quiz_level_id:       level.id,
        completed_questions: finalCorrect,
        skipped_count:       finalSkipped,
        duration_seconds:    durationSeconds,
        started_at:          started.replace("Z", ""),      // strip hanya di sini
        completed_at:        completedAt.replace("Z", ""),  // strip hanya di sini
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail ?? "Gagal menyimpan hasil quiz")
    }

    return res.json()
  }

  return (
    <QuizContext.Provider
      value={{
        level,
        soalIndex, setSoalIndex,
        correct,   setCorrect,
        skippedCount, setSkippedCount,
        randomLetters,
        resetQuiz,
        submitAttempt,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export const useQuiz = () => useContext(QuizContext)