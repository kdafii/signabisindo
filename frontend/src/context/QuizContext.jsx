import { createContext, useContext, useState } from "react"

const QuizContext = createContext()

export function QuizProvider({ children }) {
  const [level, setLevel] = useState(null)
  const [soalIndex, setSoalIndex] = useState(0)
  const [correct, setCorrect] = useState(0)

  function resetQuiz(lvl) {
    setLevel(lvl)
    setSoalIndex(0)
    setCorrect(0)
  }

  return (
    <QuizContext.Provider
      value={{
        level,
        setLevel,
        soalIndex,
        setSoalIndex,
        correct,
        setCorrect,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export const useQuiz = () => useContext(QuizContext)