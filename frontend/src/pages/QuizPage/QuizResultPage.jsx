import { useQuiz } from "../../context/QuizContext"
import { useRouter, PAGES } from "../../context/RouterContext"
import styles from "./QuizPage.module.css"

export default function QuizResultPage() {
  const { level, correct } = useQuiz()
  const { navigate } = useRouter()

  if (!level) {
    navigate(PAGES.QUIZ_LEVEL)
    return null
  }

  return (
    <main className={styles.resultPage}>
      <h1 className={styles.levelLabel}>
        {level.label}
      </h1>

      <div className={styles.resultCard}>
        <h2 className={styles.resultTitle}>
          Kuis selesai
        </h2>

        <p className={styles.resultStat}>
          Benar: {correct} dari {level.totalSoal}
        </p>

        <p className={styles.resultStat}>
          Akurasi:
          {" "}
          {Math.round(
            (correct / level.totalSoal) * 100
          )}
          %
        </p>

        <button
          className={styles.kembaliBtn}
          onClick={() => navigate(PAGES.QUIZ_LEVEL)}
        >
          Kembali
        </button>
      </div>
    </main>
  )
}