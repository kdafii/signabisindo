import { RouterProvider, useRouter, PAGES } from "./context/RouterContext"
import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"
import { Navbar, Footer, NotificationToast } from "./components"
import LoginPage    from "./pages/AuthPage/LoginPage"
import RegisterPage from "./pages/AuthPage/RegisterPage"
import HomePage     from "./pages/HomePage/HomePage"
import ProfilePage  from "./pages/ProfilePage/ProfilePage"
import DictionaryPage from "./pages/DictionaryPage/DictionaryPage"
import QuizLevelPage from "./pages/QuizPage/QuizLevelPage"
import QuizQuestionsPage from "./pages/QuizPage/QuizQuestionsPage"
import QuizResultPage from "./pages/QuizPage/QuizResultPage"
import { QuizProvider } from "./context/QuizContext"

// Pages without Navbar/Footer
const BARE_PAGES = new Set([
  PAGES.LOGIN,
  PAGES.REGISTER,
  PAGES.QUIZ_QUESTIONS,
  PAGES.QUIZ_RESULT
])

function AppInner() {
  const { currentPage } = useRouter()
  const bare = BARE_PAGES.has(currentPage)

  function renderPage() {
    switch (currentPage) {
      case PAGES.LOGIN:          return <LoginPage />
      case PAGES.REGISTER:       return <RegisterPage />
      case PAGES.HOME:           return <HomePage />
      case PAGES.PROFILE:        return <ProfilePage />
      case PAGES.DICTIONARY:
      case PAGES.DICT_CAMERA:    return <DictionaryPage />
      case PAGES.QUIZ_QUESTIONS: return <QuizQuestionsPage/>
      case PAGES.QUIZ_RESULT:    return <QuizResultPage/>
      default:                   return <HomePage />
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!bare && <Navbar />}
      {renderPage()}
      <Footer/>
      <NotificationToast />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <NotificationProvider>
          <QuizProvider>
            <AppInner />
          </QuizProvider>
        </NotificationProvider>
      </RouterProvider>
    </AuthProvider>
  )
}