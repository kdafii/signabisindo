import styles from "./Footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.brand}>Signa<strong>BISINDO</strong></span>
      <span className={styles.copy}>© {new Date().getFullYear()} · Belajar bahasa isyarat Indonesia</span>
    </footer>
  )
}