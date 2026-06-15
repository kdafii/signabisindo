import { useRef } from "react"
import { useHandLandmarker } from "../../hooks/useHandLandmarker"
import styles from "./CameraCV.module.css"

/**
 * CameraCV
 * Reusable camera + MediaPipe hand detection component.
 * Used by both the dictionary camera view and the quiz questions view.
 *
 * Props:
 *   onLandmarks  – (left: number[], right: number[]) => void
 *                  Called every `predictInterval` ms when hands are detected.
 *   predictInterval – ms between prediction calls (default 300)
 *   enabled         – pause detection when false (default true)
 *   className       – optional extra class on the wrapper
 */
export default function CameraCV({
  onLandmarks,
  predictInterval = 300,
  enabled = true,
  className = "",
}) {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)

  useHandLandmarker(videoRef, canvasRef, onLandmarks, {
    predictInterval,
    enabled,
  })

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={styles.video}
        aria-label="Kamera deteksi gestur"
      />
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-hidden="true"
      />
    </div>
  )
}