import { QUIZ_LEVELS } from "../../utils/constants"
import { useQuiz } from "../../context/QuizContext"
import { useRouter, PAGES } from "../../context/RouterContext"
import styles from "./QuizPage.module.css"

export default function QuizLevelPage() {
  const { resetQuiz } = useQuiz()
  const { navigate } = useRouter()

  function startLevel(lvl) {
    resetQuiz(lvl)
    navigate(PAGES.QUIZ_QUESTIONS)
  }

  return (
    <main className={styles.levelPage}>
      <h1 className={styles.levelHeading}>Pilih Level</h1>

      {QUIZ_LEVELS.map((lvl) => (
        <button
          key={lvl.id}
          className={styles.levelOption}
          onClick={() => startLevel(lvl)}
        >
          {lvl.label}
        </button>
      ))}
    </main>
  )
}