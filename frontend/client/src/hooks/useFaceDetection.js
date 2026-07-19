// frontend/src/hooks/useFaceDetection.js
import { useState, useEffect, useRef, useCallback } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import { analyzeEmotion } from "../services/apiService";

export const useFaceDetection = (onResult, onAnalyzing) => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastMetricsRef = useRef(null);
  const metricsHistoryRef = useRef([]);
  const landmarksHistoryRef = useRef([]);

  // Calcola le metriche dai landmarks
  const calculateMetrics = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) return null;

    // Indici per occhi (FaceLandmarker)
    const LEFT_EYE = [33, 133, 157, 158, 159, 160, 161, 173];
    const RIGHT_EYE = [362, 263, 387, 386, 385, 384, 398, 466];
    const MOUTH = [
      61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0,
      37, 39, 40, 185,
    ];

    // Funzione distanza
    const distance = (p1, p2) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dz = p1.z - p2.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    // Calcola apertura occhi
    const getEyeOpenness = () => {
      const leftEye = landmarks.filter((_, i) => LEFT_EYE.includes(i));
      const rightEye = landmarks.filter((_, i) => RIGHT_EYE.includes(i));

      if (leftEye.length < 4 || rightEye.length < 4) return 50;

      const leftOpen = distance(leftEye[0], leftEye[4]);
      const rightOpen = distance(rightEye[0], rightEye[4]);
      const avgOpen = (leftOpen + rightOpen) / 2;

      return Math.min(Math.round(avgOpen * 200), 100);
    };

    // Calcola tensione bocca
    const getMouthTension = () => {
      const mouthPoints = landmarks.filter((_, i) => MOUTH.includes(i));
      if (mouthPoints.length < 4) return 50;

      const topLip = mouthPoints[0];
      const bottomLip = mouthPoints[mouthPoints.length - 1];
      const mouthOpen = distance(topLip, bottomLip);

      return Math.max(0, Math.min(100, 100 - mouthOpen * 300));
    };

    // Calcola frequenza battiti
    const getBlinkRate = () => {
      const eyeOpen = getEyeOpenness();
      return eyeOpen < 30 ? 20 : 5;
    };

    // Calcola posizione testa
    const getHeadPosition = () => {
      const nose = landmarks[1];
      const chin = landmarks[152];

      if (!nose || !chin) return { x: 0, y: 0, z: 0 };

      return {
        x: Math.round((nose.x - 0.5) * 100),
        y: Math.round((nose.y - 0.5) * 100),
        z: Math.round(nose.z * 100),
      };
    };

    return {
      eyeOpenness: getEyeOpenness(),
      mouthTension: getMouthTension(),
      blinkRate: getBlinkRate(),
      headPosition: getHeadPosition(),
    };
  }, []);

  // Invia i dati al backend
  const sendToBackend = useCallback(
    async (landmarks, metrics) => {
      try {
        onAnalyzing(true);

        const userId = "roberto";
        const sessionId = `session_${Date.now()}`;

        const result = await analyzeEmotion({
          userId,
          landmarks: landmarks.map((l) => [l.x, l.y, l.z]),
          sessionId,
          metrics,
        });

        onAnalyzing(false);
        onResult(result);
      } catch (error) {
        console.error("Errore invio al backend:", error);
        onAnalyzing(false);
        onResult({
          success: false,
          error: error.message || "Errore di comunicazione con il server",
        });
      }
    },
    [onResult, onAnalyzing],
  );

  // Avvia l'analisi
  const triggerAnalysis = useCallback(() => {
    if (landmarksHistoryRef.current.length === 0) {
      setError("Nessun dato facciale rilevato.");
      return;
    }

    setIsDetecting(true);

    const lastMetrics =
      metricsHistoryRef.current[metricsHistoryRef.current.length - 1];
    const lastLandmarks =
      landmarksHistoryRef.current[landmarksHistoryRef.current.length - 1];

    if (!lastMetrics) {
      setError("Impossibile calcolare le metriche.");
      setIsDetecting(false);
      return;
    }

    sendToBackend(lastLandmarks, lastMetrics);
    setIsDetecting(false);
  }, [sendToBackend]);

  // Inizializza FaceLandmarker
  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        // Carica il modello
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });

        faceLandmarkerRef.current = faceLandmarker;

        // Avvia la webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          streamRef.current = stream;
          setIsCameraReady(true);

          // Avvia il loop di rilevamento
          detectLoop();
        }
      } catch (error) {
        console.error("Errore inizializzazione:", error);
        setError("Errore nell'avvio della webcam: " + error.message);
      }
    };

    const detectLoop = () => {
      const detect = async () => {
        if (!videoRef.current || !faceLandmarkerRef.current) {
          animationFrameRef.current = requestAnimationFrame(detect);
          return;
        }

        try {
          const detections = faceLandmarkerRef.current.detectForVideo(
            videoRef.current,
            performance.now(),
          );

          if (detections.faceLandmarks && detections.faceLandmarks.length > 0) {
            const landmarks = detections.faceLandmarks[0];
            const metrics = calculateMetrics(landmarks);

            if (metrics) {
              landmarksHistoryRef.current.push(landmarks);
              metricsHistoryRef.current.push(metrics);

              if (landmarksHistoryRef.current.length > 30) {
                landmarksHistoryRef.current.shift();
                metricsHistoryRef.current.shift();
              }

              lastMetricsRef.current = metrics;
            }
          }
        } catch (error) {
          console.error("Errore nel rilevamento:", error);
        }

        animationFrameRef.current = requestAnimationFrame(detect);
      };

      detect();
    };

    initializeFaceLandmarker();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, [calculateMetrics]);

  return {
    videoRef,
    isCameraReady,
    isDetecting,
    error,
    triggerAnalysis,
    setError,
  };
};

export default useFaceDetection;
