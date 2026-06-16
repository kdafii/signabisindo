import { useRouter, PAGES } from "../../context/RouterContext"
import { useAuth } from "../../context/AuthContext"
import styles from "./Navbar.module.css"

export default function Navbar() {
  const { navigate, currentPage } = useRouter()
  const { user }     = useAuth()

  return (
    <nav className={styles.nav}>
      <button className={styles.logo} onClick={() => navigate(PAGES.HOME)}>
        Signa<span>BISINDO</span>
      </button>

      <div className={styles.links}>
        <button
          className={currentPage === PAGES.DICTIONARY ? styles.active : ""}
          onClick={() => navigate(PAGES.DICTIONARY)}
        >
          Kamus
        </button>

        <button
          className={currentPage === PAGES.PROFILE ? styles.active : ""}
          onClick={() => navigate(user ? PAGES.PROFILE : PAGES.LOGIN)}
        >
          Profil
        </button>
      </div>
    </nav>
  )
}