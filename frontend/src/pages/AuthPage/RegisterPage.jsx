import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useRouter, PAGES } from "../../context/RouterContext"
import { useNotification } from "../../context/NotificationContext"
import styles from "./AuthPage.module.css"

function validate(form) {
  const errors = {}
  if (!form.username) {
    errors.username = "Username wajib diisi."
  } else if (form.username.length < 3) {
    errors.username = "Username minimal 3 karakter."
  } else if (/\s/.test(form.username)) {
    errors.username = "Username tidak boleh mengandung spasi."
  }

  if (!form.firstName) errors.firstName = "Nama depan wajib diisi."
  if (!form.lastName)  errors.lastName  = "Nama belakang wajib diisi."

  if (!form.password) {
    errors.password = "Password wajib diisi."
  } else if (form.password.length < 6) {
    errors.password = "Password minimal 6 karakter."
  }

  return errors
}

export default function RegisterPage() {
  const { register }          = useAuth()
  const { replace, navigate } = useRouter()
  const { error: showError }  = useNotification()

  const [form, setForm]     = useState({ username: "", firstName: "", lastName: "", password: "" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function set(field) {
    return e => {
      const value = e.target.value
      setForm(prev => ({ ...prev, [field]: value }))
      // Clear field error on change
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  async function handleSubmit() {
    const fieldErrors = validate(form)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      await register(form.username, form.firstName, form.lastName, form.password)
      replace(PAGES.HOME)
    } catch (err) {
      showError(err.message)
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
            className={`${styles.input} ${errors.username ? styles.inputError : ""}`}
            type="text"
            placeholder="john_doe"
            value={form.username}
            onChange={set("username")}
            autoComplete="username"
          />
          {errors.username && <span className={styles.errorText}>{errors.username}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="firstName">Nama Depan</label>
          <input
            id="firstName"
            className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}
            type="text"
            placeholder="John"
            value={form.firstName}
            onChange={set("firstName")}
            autoComplete="given-name"
          />
          {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="lastName">Nama Belakang</label>
          <input
            id="lastName"
            className={`${styles.input} ${errors.lastName ? styles.inputError : ""}`}
            type="text"
            placeholder="Doe"
            value={form.lastName}
            onChange={set("lastName")}
            autoComplete="family-name"
          />
          {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            id="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
            type="password"
            placeholder="••••••"
            value={form.password}
            onChange={set("password")}
            autoComplete="new-password"
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          {errors.password && <span className={styles.errorText}>{errors.password}</span>}
        </div>

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