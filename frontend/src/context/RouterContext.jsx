import { createContext, useContext } from "react"
import { useNavigate, useLocation, Navigate } from "react-router-dom"

const RouterContext = createContext(null)

export const PAGES = {
  HOME:           "/",
  LOGIN:          "/login",
  REGISTER:       "/register",
  PROFILE:        "/profile",
  DICTIONARY:     "/dictionary",
  DICT_CAMERA:    "/dictionary/camera",
  QUIZ_QUESTIONS: "/quiz",
  QUIZ_RESULT:    "/quiz/result",
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error("useRouter must be used inside RouterProvider")
  return ctx
}

// RouterProvider sekarang hanya adapter — BrowserRouter ada di App.jsx
export function RouterProvider({ children }) {
  const nav      = useNavigate()
  const location = useLocation()

  function navigate(page, params = {}) {
    nav(page, { state: params })
  }

  function replace(page, params = {}) {
    nav(page, { replace: true, state: params })
  }

  function goBack() {
    nav(-1)
  }

  const currentPage = location.pathname
  const pageParams  = location.state ?? {}
  const canGoBack   = true  // browser handles this

  return (
    <RouterContext.Provider value={{ currentPage, pageParams, navigate, replace, goBack, canGoBack }}>
      {children}
    </RouterContext.Provider>
  )
}