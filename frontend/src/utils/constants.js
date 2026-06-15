/** All 26 BISINDO alphabet letters */
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

/** Quiz levels config */
export const QUIZ_LEVELS = [
  { id: 1, label: "Level 1", letters: ALPHABET.slice(0, 9),  totalSoal: 20 },
  { id: 2, label: "Level 2", letters: ALPHABET.slice(9, 18), totalSoal: 20 },
  { id: 3, label: "Level 3", letters: ALPHABET.slice(18),    totalSoal: 20 },
]

/** API base URL — update to match your backend */
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"