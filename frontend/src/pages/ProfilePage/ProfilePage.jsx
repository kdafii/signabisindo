import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useRouter, PAGES } from "../../context/RouterContext"
import { useNotification } from "../../context/NotificationContext"
import styles from "./ProfilePage.module.css"

const API = import.meta.env.VITE_API_BASE_URL

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const { replace }  = useRouter()
  const { success, error: showError } = useNotification()

  const [firstName, setFirstName] = useState(user?.first_name ?? "")
  const [lastName,  setLastName]  = useState(user?.last_name  ?? "")
  const [attempts,  setAttempts]  = useState([])
  const [loadingAttempts, setLoadingAttempts] = useState(true)

  useEffect(() => {
    if (!user) return

    fetch(`${API}/quiz-attempts?user_id=${user.id}&limit=10`, {
      headers: { Authorization: `Bearer ${user.access_token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(setAttempts)
      .catch(() => showError("Gagal memuat riwayat kuis."))
      .finally(() => setLoadingAttempts(false))
  }, [user?.id])

  function handleSave() {
    if (!firstName || !lastName) {
      showError("Nama tidak boleh kosong.")
      return
    }
    updateProfile(firstName, lastName)
    success("Profil berhasil disimpan.")
  }

  function handleLogout() {
    logout()
    replace(PAGES.LOGIN)
  }

  function formatDuration(seconds) {
    if (!seconds) return "—"
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  function formatDate(isoString) {
    if (!isoString) return "—"
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    })
  }


  return (
    <main className={styles.page}>
      <div className={styles.profileCard}>
        <p className={styles.username}>{user?.username ?? "—"}</p>
        <p className={styles.fullname}>{user?.first_name} {user?.last_name}</p>

        <input
          className={styles.input}
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          placeholder="Nama depan"
        />
        <input
          className={styles.input}
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          placeholder="Nama belakang"
        />

        <button className={styles.saveBtn} onClick={handleSave}>Simpan</button>
        <button className={styles.logoutBtn} onClick={handleLogout}>Log out</button>
      </div>

      <div className={styles.scoreCard}>
        <h2 className={styles.scoreTitle}>Riwayat kuis</h2>

        {loadingAttempts ? (
          <p className={styles.emptyText}>Memuat…</p>
        ) : attempts.length === 0 ? (
          <p className={styles.emptyText}>Belum ada riwayat kuis.</p>
        ) : (
          <>
            <div className={`${styles.scoreRow} ${styles.scoreHeader}`}>
              <span>Tanggal</span>
              <span>Benar</span>
              <span>Dilewati</span>
              <span>Durasi</span>
            </div>
            {attempts.map(a => (
              <div key={a.id} className={styles.scoreRow}>
                <span>{formatDate(a.started_at)}</span>
                <span>{a.completed_questions}/{a.completed_questions + a.skipped_count}</span>
                <span>{a.skipped_count}</span>
                <span>{formatDuration(a.duration_seconds)}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  )
}