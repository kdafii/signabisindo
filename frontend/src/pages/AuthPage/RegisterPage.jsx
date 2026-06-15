import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useRouter, PAGES } from "../../context/RouterContext"
import { useNotification } from "../../context/NotificationContext"
import styles from "./AuthPage.module.css"

export default function RegisterPage() {
  const { register }  = useAuth()
  const { replace, navigate } = useRouter()
  const { error: showError }  = useNotification()

  const [form, setForm] = useState({ username: "", firstName: "", lastName: "", password: "" })
  const [loading, setLoading] = useState(false)

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit() {
    const { username, firstName, lastName, password } = form
    if (!username || !firstName || !lastName || !password) {
      showError("Semua kolom harus diisi.")
      return
    }
    setLoading(true)
    try {
      await register(username, firstName, lastName, password)
      replace(PAGES.HOME)
    } catch {
      showError("Registrasi gagal. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.box}>
        <h1 className={styles.heading}>Register</h1>

        <input className={styles.input} type="text"     placeholder="john_doe" value={form.username}  onChange={set("username")}  autoComplete="username" />
        <input className={styles.input} type="text"     placeholder="John"     value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
        <input className={styles.input} type="text"     placeholder="Doe"      value={form.lastName}  onChange={set("lastName")}  autoComplete="family-name" />
        <input className={styles.input} type="password" placeholder="••••••"   value={form.password}  onChange={set("password")}  autoComplete="new-password"
          onKeyDown={e => e.key === "Enter" && handleSubmit()} />

        <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Mendaftar…" : "Register"}
        </button>

        <p className={styles.switchText}>
          Punya akun?{" "}
          <button className={styles.switchLink} onClick={() => navigate(PAGES.LOGIN)}>
            Login
          </button>
        </p>
      </div>
    </main>
  )
}