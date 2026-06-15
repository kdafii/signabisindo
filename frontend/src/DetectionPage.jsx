import { useEffect, useRef, useState } from "react"
import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils
} from "@mediapipe/tasks-vision"

const API_URL = "http://localhost:8000"

export default function DetectionPage() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const handLandmarkerRef = useRef(null)
  const drawingUtilsRef = useRef(null)
  const lastPredictRef = useRef(0)

  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  function flattenLandmarks(hand) {
    return hand.flatMap((lm) => [lm.x, lm.y, lm.z])
  }

  useEffect(() => {
    async function init() {
      try {
        await setupCamera()
        await createHandLandmarker()

        console.log("Camera ready")
        console.log("HandLandmarker ready")

        detectLoop()
      } catch (err) {
        console.error(err)
        setError(err.message)
      }
    }

    init()

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach(track => track.stop())
      }
    }
  }, [])

  async function predict(h0, h1) {
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          h0_landmarks: h0,
          h1_landmarks: h1
        })
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
      setError("Gagal konek ke backend")
    }
  }

  async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    })

    videoRef.current.srcObject = stream

    await new Promise((resolve) => {
      videoRef.current.onloadedmetadata = resolve
    })

    await videoRef.current.play()
  }

  async function createHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    )

    handLandmarkerRef.current =
      await HandLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
          },

          runningMode: "VIDEO",
          numHands: 2,

          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.7
        }
      )
  }

  function drawResults(results) {
    const canvas = canvasRef.current
    const video = videoRef.current

    if (!canvas || !video) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    )

    if (!drawingUtilsRef.current) {
      drawingUtilsRef.current =
        new DrawingUtils(ctx)
    }

    if (!results.landmarks) return

    for (const landmarks of results.landmarks) {
      drawingUtilsRef.current.drawConnectors(
        landmarks,
        HandLandmarker.HAND_CONNECTIONS,
        {
          lineWidth: 3
        }
      )

      drawingUtilsRef.current.drawLandmarks(
        landmarks,
        {
          radius: 4
        }
      )
    }
  }

  function detectLoop() {
    const video = videoRef.current
    const handLandmarker = handLandmarkerRef.current

    if (!video || !handLandmarker) {
      requestAnimationFrame(detectLoop)
      return
    }

    const results = handLandmarker.detectForVideo(
      video,
      performance.now()
    )

    drawResults(results)

    let leftHand = Array(63).fill(0)
    let rightHand = Array(63).fill(0)

    if (results.landmarks?.length) {
      results.landmarks.forEach((landmarks, index) => {
        const handedness =
          results.handednesses?.[index]?.[0]?.categoryName

        if (handedness === "Left") {
          leftHand = flattenLandmarks(landmarks)
        } else if (handedness === "Right") {
          rightHand = flattenLandmarks(landmarks)
        }
      })

      const now = Date.now()

      if (now - lastPredictRef.current > 300) {
        lastPredictRef.current = now

        predict(
          leftHand,
          rightHand
        )
      }
    }

    requestAnimationFrame(detectLoop)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f13",
        color: "#fff",
        padding: 24
      }}
    >
      <h1>🤟 BISINDO Detection</h1>

      <div
        style={{
          position: "relative",
          maxWidth: 900,
          margin: "0 auto"
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            borderRadius: 12
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%"
          }}
        />
      </div>

      {error && (
        <div style={{ color: "red", marginTop: 20 }}>
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 20,
            background: "#1a1a24",
            padding: 20,
            borderRadius: 12
          }}
        >
          <h2>{result.predicted_label}</h2>

          <p>
            Confidence:
            {" "}
            {(result.confidence * 100).toFixed(2)}%
          </p>

          {result.top3?.map((item) => (
            <div key={item.label}>
              {item.label}
              {" - "}
              {(item.confidence * 100).toFixed(2)}%
            </div>
          ))}
        </div>
      )}
    </div>
  )
}