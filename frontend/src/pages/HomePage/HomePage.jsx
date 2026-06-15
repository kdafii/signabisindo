import { useRouter, PAGES } from "../../context/RouterContext"
import styles from "./HomePage.module.css"

export default function HomePage() {
  const { navigate } = useRouter()

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Tempat belajar alfabet BISINDO</h1>
      <p className={styles.sub}>Latihan gestur dengan feedback instan</p>

      <div className={styles.cards}>
        <button className={styles.card} onClick={() => navigate(PAGES.DICTIONARY)}>
          <h2 className={styles.cardTitle}>Kamus</h2>
          <p className={styles.cardDesc}>
            Pelajari 26 Alfabet BISINDO dan latihan menggunakan kamera
          </p>
        </button>

        <button className={styles.card} onClick={() => navigate(PAGES.QUIZ_LEVEL)}>
          <h2 className={styles.cardTitle}>Kuis</h2>
          <p className={styles.cardDesc}>
            Pelajari 26 Alfabet BISINDO dan latihan menggunakan kamera
          </p>
        </button>
      </div>
    </main>
  )
}