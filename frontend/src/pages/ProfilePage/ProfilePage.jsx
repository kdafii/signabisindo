import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useRouter, PAGES } from "../../context/RouterContext"
import { useNotification } from "../../context/NotificationContext"
import styles from "./ProfilePage.module.css"

// Placeholder scores — replace with real API data
const MOCK_SCORES = [
  { level: "Level 1", score: "18/20" },
  { level: "Level 2", score: "14/20" },
  { level: "Level 3", score: "—"    },
]

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const { replace }  = useRouter()
  const { success, error: showError } = useNotification()

  const [firstName, setFirstName] = useState(user?.firstName ?? "")
  const [lastName,  setLastName]  = useState(user?.lastName  ?? "")

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

  return (
    <main className={styles.page}>
      <div className={styles.profileCard}>
        <p className={styles.username}>{user?.username ?? "—"}</p>
        <p className={styles.fullname}>{user?.firstName} {user?.lastName}</p>

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
        <h2 className={styles.scoreTitle}>Skor kuis</h2>
        {MOCK_SCORES.map(s => (
          <div key={s.level} className={styles.scoreRow}>
            <span>{s.level}</span>
            <span>{s.score}</span>
          </div>
        ))}
      </div>
    </main>
  )
}