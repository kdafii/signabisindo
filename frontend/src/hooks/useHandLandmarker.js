import { useEffect, useRef, useCallback } from "react"
import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision"

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"

/**
 * Flattens a single hand's landmarks into a 63-element Float array [x,y,z × 21].
 */
function flattenLandmarks(hand) {
  return hand.flatMap(lm => [lm.x, lm.y, lm.z])
}

/**
 * useHandLandmarker
 *
 * @param {React.RefObject} videoRef   – <video> element ref
 * @param {React.RefObject} canvasRef  – <canvas> element ref (for overlay drawing)
 * @param {(left: number[], right: number[]) => void} onLandmarks
 *   Called at most once every `predictInterval` ms with flattened left/right hand arrays.
 *   Arrays are 63 zeros when that hand is absent.
 * @param {{ predictInterval?: number, enabled?: boolean }} options
 */
export function useHandLandmarker(videoRef, canvasRef, onLandmarks, options = {}) {
  const { predictInterval = 300, enabled = true } = options

  const landmarkerRef    = useRef(null)
  const drawingUtilsRef  = useRef(null)
  const rafRef           = useRef(null)
  const lastPredictRef   = useRef(0)
  const onLandmarksRef   = useRef(onLandmarks)
  const enabledRef       = useRef(enabled)
  const streamRef       = useRef(null)

  // Keep callback ref in sync — avoids stale closure in rAF loop
  useEffect(() => { onLandmarksRef.current = onLandmarks }, [onLandmarks])
  useEffect(() => { enabledRef.current = enabled }, [enabled])

  // ── Drawing helper ──────────────────────────────────────────────────────────
  const drawResults = useCallback((results) => {
    const canvas = canvasRef.current
    const video  = videoRef.current
    if (!canvas || !video) return

    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!drawingUtilsRef.current) {
      drawingUtilsRef.current = new DrawingUtils(ctx)
    }

    for (const landmarks of results.landmarks ?? []) {
      drawingUtilsRef.current.drawConnectors(
        landmarks,
        HandLandmarker.HAND_CONNECTIONS,
        { color: "#00FF88", lineWidth: 2 }
      )
      drawingUtilsRef.current.drawLandmarks(landmarks, {
        color: "#FFFFFF",
        fillColor: "#00FF88",
        radius: 3,
      })
    }
  }, [canvasRef, videoRef])

  // ── Detection loop ──────────────────────────────────────────────────────────
  const detectLoop = useCallback(() => {
    const video       = videoRef.current
    const landmarker  = landmarkerRef.current

    if (!video || !landmarker || !enabledRef.current) {
      rafRef.current = requestAnimationFrame(detectLoop)
      return
    }

    if (video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectLoop)
      return
    }

    const results = landmarker.detectForVideo(video, performance.now())
    drawResults(results)

    if (results.landmarks?.length) {
      const now = Date.now()
      if (now - lastPredictRef.current >= predictInterval) {
        lastPredictRef.current = now

        let left  = new Array(63).fill(0)
        let right = new Array(63).fill(0)

        results.landmarks.forEach((landmarks, i) => {
          const hand = results.handednesses?.[i]?.[0]?.categoryName
          if (hand === "Left")       left  = flattenLandmarks(landmarks)
          else if (hand === "Right") right = flattenLandmarks(landmarks)
        })

        onLandmarksRef.current?.(left, right)
      }
    }

    rafRef.current = requestAnimationFrame(detectLoop)
  }, [videoRef, drawResults, predictInterval])

  // ── Camera setup ────────────────────────────────────────────────────────────
  const setupCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
    })

    const video = videoRef.current
    video.srcObject = stream
    await new Promise(resolve => { video.onloadedmetadata = resolve })
    await video.play()
  }, [videoRef])

  // ── MediaPipe init ──────────────────────────────────────────────────────────
  const initLandmarker = useCallback(async () => {
    const vision = await FilesetResolver.forVisionTasks(WASM_URL)
    landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence:  0.5,
      minTrackingConfidence:      0.7,
    })
  }, [])

  // ── Main effect ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const cancelledRef = { current: false }

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        })

        if (cancelledRef.current) {
          stream.getTracks().forEach(t => t.stop())
          return
        }

        streamRef.current = stream

        const video = videoRef.current
        video.srcObject = stream
        await new Promise(resolve => { video.onloadedmetadata = resolve })
        await video.play()

        if (cancelledRef.current) {
          stream.getTracks().forEach(t => t.stop())
          video.srcObject = null
          return
        }

        const vision = await FilesetResolver.forVisionTasks(WASM_URL)
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence:  0.5,
          minTrackingConfidence:      0.7,
        })

        if (!cancelledRef.current) detectLoop()
      } catch (err) {
        console.error("[useHandLandmarker] init error:", err)
      }
    }

    start()

    return () => {
      cancelledRef.current = true
      cancelAnimationFrame(rafRef.current)

      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null

      landmarkerRef.current?.close?.()
      landmarkerRef.current = null
    }
  }, [])
}