import { useRouter, PAGES } from "../../context/RouterContext"
import { useAuth } from "../../context/AuthContext"
import styles from "./Navbar.module.css"

export default function Navbar() {
  const { navigate } = useRouter()
  const { user }     = useAuth()

  return (
    <nav className={styles.nav}>
      <button className={styles.logo} onClick={() => navigate(PAGES.HOME)}>
        Signa<span>BISINDO</span>
      </button>

      <div className={styles.links}>
        <button onClick={() => navigate(PAGES.DICTIONARY)}>Kamus</button>
        <button onClick={() => navigate(PAGES.QUIZ_LEVEL)}>Kuis</button>
        <button onClick={() => navigate(user ? PAGES.PROFILE : PAGES.LOGIN)}>
          Profil
        </button>
      </div>
    </nav>
  )
}