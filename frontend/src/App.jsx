import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { RouterProvider, PAGES } from "./context/RouterContext"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"
import { QuizProvider } from "./context/QuizContext"
import { Navbar, Footer, NotificationToast } from "./components"
import LoginPage         from "./pages/AuthPage/LoginPage"
import RegisterPage      from "./pages/AuthPage/RegisterPage"
import HomePage          from "./pages/HomePage/HomePage"
import ProfilePage       from "./pages/ProfilePage/ProfilePage"
import DictionaryPage    from "./pages/DictionaryPage/DictionaryPage"
import QuizQuestionsPage from "./pages/QuizPage/QuizQuestionsPage"
import QuizResultPage    from "./pages/QuizPage/QuizResultPage"

const BARE_PAGES = new Set([
  PAGES.LOGIN,
  PAGES.REGISTER,
  PAGES.QUIZ_QUESTIONS,
  PAGES.QUIZ_RESULT,
])

function RequireAuth({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to={PAGES.LOGIN} replace />
}

function AppInner() {
  const location = useLocation()  // import dari react-router-dom
  const bare = BARE_PAGES.has(location.pathname)

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!bare && <Navbar />}
      <Routes>
        <Route path={PAGES.LOGIN}      element={<LoginPage />} />
        <Route path={PAGES.REGISTER}   element={<RegisterPage />} />
        <Route path={PAGES.HOME}       element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path={PAGES.PROFILE}    element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path={PAGES.DICTIONARY} element={<RequireAuth><DictionaryPage /></RequireAuth>} />
        <Route path={PAGES.DICT_CAMERA} element={<RequireAuth><DictionaryPage /></RequireAuth>} />
        <Route path={PAGES.QUIZ_QUESTIONS} element={<RequireAuth><QuizQuestionsPage /></RequireAuth>} />
        <Route path={PAGES.QUIZ_RESULT}    element={<RequireAuth><QuizResultPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to={PAGES.HOME} replace />} />
      </Routes>
      <Footer />
      <NotificationToast />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouterProvider>
          <NotificationProvider>
            <QuizProvider>
              <AppInner />
            </QuizProvider>
          </NotificationProvider>
        </RouterProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}