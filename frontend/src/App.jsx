import { RouterProvider, useRouter, PAGES } from "./context/RouterContext"
import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"
import { Navbar, Footer, NotificationToast } from "./components"
import LoginPage    from "./pages/AuthPage/LoginPage"
import RegisterPage from "./pages/AuthPage/RegisterPage"
import HomePage     from "./pages/HomePage/HomePage"
import ProfilePage  from "./pages/ProfilePage/ProfilePage"
import DictionaryPage from "./pages/DictionaryPage/DictionaryPage"
import QuizPage     from "./pages/QuizPage/QuizPage"

// Pages without Navbar/Footer
const BARE_PAGES = new Set([PAGES.LOGIN, PAGES.REGISTER])

function AppInner() {
  const { currentPage } = useRouter()

  const bare = BARE_PAGES.has(currentPage)

  const page = {
    [PAGES.LOGIN]:          <LoginPage />,
    [PAGES.REGISTER]:       <RegisterPage />,
    [PAGES.HOME]:           <HomePage />,
    [PAGES.PROFILE]:        <ProfilePage />,
    [PAGES.DICTIONARY]:     <DictionaryPage />,
    [PAGES.DICT_CAMERA]:    <DictionaryPage />,
    [PAGES.QUIZ_LEVEL]:     <QuizPage />,
    [PAGES.QUIZ_QUESTIONS]: <QuizPage />,
    [PAGES.QUIZ_RESULT]:    <QuizPage />,
  }[currentPage] ?? <HomePage />

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!bare && <Navbar />}
      {page}
      {!bare && <Footer />}
      <NotificationToast />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <NotificationProvider>
          <AppInner />
        </NotificationProvider>
      </RouterProvider>
    </AuthProvider>
  )
}