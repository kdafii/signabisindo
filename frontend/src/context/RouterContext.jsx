import { createContext, useContext, useState } from "react"

/**
 * RouterContext
 * Lightweight client-side "router" — no dependency on react-router.
 * Tracks: currentPage, pageParams, navigation history stack.
 */
const RouterContext = createContext(null)

export const PAGES = {
  HOME:           "home",
  LOGIN:          "login",
  REGISTER:       "register",
  PROFILE:        "profile",
  DICTIONARY:     "dictionary",
  DICT_CAMERA:    "dictionary-camera",   // alphabet detail + camera
  QUIZ_LEVEL:     "quiz-level",
  QUIZ_QUESTIONS: "quiz-questions",
  QUIZ_RESULT:    "quiz-result",
}

export function RouterProvider({ children }) {
  const [currentPage, setCurrentPage]   = useState(PAGES.LOGIN)
  const [pageParams, setPageParams]     = useState({})
  const [history, setHistory]           = useState([])

  function navigate(page, params = {}) {
    setHistory(prev => [...prev, { page: currentPage, params: pageParams }])
    setCurrentPage(page)
    setPageParams(params)
  }

  function goBack() {
    setHistory(prev => {
      const next = [...prev]
      const last = next.pop()
      if (last) {
        setCurrentPage(last.page)
        setPageParams(last.params)
      }
      return next
    })
  }

  function replace(page, params = {}) {
    setCurrentPage(page)
    setPageParams(params)
    setHistory([])
  }

  const canGoBack = history.length > 0

  return (
    <RouterContext.Provider value={{ currentPage, pageParams, navigate, goBack, replace, canGoBack }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error("useRouter must be used inside RouterProvider")
  return ctx
}