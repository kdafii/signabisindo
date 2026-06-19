import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useRouter, PAGES } from "../../context/RouterContext"
import { useNotification } from "../../context/NotificationContext"
import styles from "./AuthPage.module.css"

export default function LoginPage() {
  const { login }    = useAuth()
  const { replace, navigate } = useRouter()
  const { error: showError }  = useNotification()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleSubmit() {
    if (!username || !password) {
      showError("Isi username dan password terlebih dahulu.")
      return
    }
    setLoading(true)
    try {
      await login(username, password)
      replace(PAGES.HOME)
    } catch (err) {
      showError("Login gagal. Periksa username dan password kamu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.box}>
        <h1 className={styles.appTitle}>
          <span style={{ fontWeight: 400 }}>Signa</span>BISINDO
        </h1>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="username">Username</label>
          <input
            id="username"
            className={styles.input}
            type="text"
            placeholder="john_doe"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            id="password"
            className={styles.input}
            type="password"
            placeholder="••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Masuk…" : "Login"}
        </button>

        <p className={styles.switchText}>
          Tidak punya akun?{" "}
          <button className={styles.switchLink} onClick={() => navigate(PAGES.REGISTER)}>
            Register
          </button>
        </p>
      </div>
    </main>
  )
}