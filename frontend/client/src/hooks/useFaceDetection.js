// frontend/src/hooks/useFaceDetection.js
import { useState, useEffect, useRef, useCallback } from "react";
import * as faceMesh from "@mediapipe/face_mesh";
import * as cameraUtils from "@mediapipe/camera_utils";
import { analyzeEmotion } from "../services/apiService";

const FaceMesh = faceMesh.FaceMesh;
const Camera = cameraUtils.Camera;

export const useFaceDetection = (onResult, onAnalyzing) => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const lastMetricsRef = useRef(null);

  const metricsHistoryRef = useRef([]);
  const landmarksHistoryRef = useRef([]);

  const calculateMetrics = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) return null;

    const LEFT_EYE_INDICES = [33, 133, 157, 158, 159, 160, 161, 173];
    const RIGHT_EYE_INDICES = [362, 263, 387, 386, 385, 384, 398, 466];
    const MOUTH_INDICES = [
      61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0,
      37, 39, 40, 185,
    ];
    const NOSE_TIP = 1;
    const CHIN = 152;

    const distance = (p1, p2) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dz = p1.z - p2.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    const getEyeOpenness = () => {
      const leftEye = landmarks.filter((l) =>
        LEFT_EYE_INDICES.includes(l.index),
      );
      const rightEye = landmarks.filter((l) =>
        RIGHT_EYE_INDICES.includes(l.index),
      );

      if (leftEye.length < 4 || rightEye.length < 4) return 50;

      const leftOpen = distance(leftEye[0], leftEye[4]) / 0.1;
      const rightOpen = distance(rightEye[0], rightEye[4]) / 0.1;

      return Math.min(Math.round(((leftOpen + rightOpen) / 2) * 100), 100);
    };

    const getMouthTension = () => {
      const mouthPoints = landmarks.filter((l) =>
        MOUTH_INDICES.includes(l.index),
      );
      if (mouthPoints.length < 4) return 50;

      const topLip = mouthPoints[0];
      const bottomLip = mouthPoints[mouthPoints.length - 1];
      const mouthOpen = distance(topLip, bottomLip) / 0.05;

      return Math.max(0, Math.min(100, 100 - mouthOpen * 10));
    };

    const getBlinkRate = () => {
      const eyeOpen = getEyeOpenness();
      return eyeOpen < 30 ? 20 : 5;
    };

    const getHeadPosition = () => {
      const nose = landmarks.find((l) => l.index === NOSE_TIP);
      const chin = landmarks.find((l) => l.index === CHIN);

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

  const sendToBackend = useCallback(
    async (landmarks, metrics) => {
      try {
        onAnalyzing(true);

        const userId = "roberto";
        const sessionId = `session_${Date.now()}`;

        const result = await analyzeEmotion({
          userId,
          landmarks: landmarks.slice(0, 5),
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

  const triggerAnalysis = useCallback(() => {
    if (landmarksHistoryRef.current.length === 0) {
      setError(
        "Nessun dato facciale rilevato. Assicurati che la webcam sia attiva.",
      );
      return;
    }

    setIsDetecting(true);

    const lastMetrics =
      metricsHistoryRef.current[metricsHistoryRef.current.length - 1];

    if (!lastMetrics) {
      setError("Impossibile calcolare le metriche. Riprova.");
      setIsDetecting(false);
      return;
    }

    const lastLandmarks =
      landmarksHistoryRef.current[landmarksHistoryRef.current.length - 1];

    sendToBackend(lastLandmarks, lastMetrics);
    setIsDetecting(false);
  }, [sendToBackend]);

  // Inizializza FaceMesh
  useEffect(() => {
    const initializeFaceMesh = async () => {
      try {
        const faceMeshInstance = new FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        faceMeshInstance.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMeshInstance.onResults((results) => {
          if (
            results.multiFaceLandmarks &&
            results.multiFaceLandmarks.length > 0
          ) {
            const landmarks = results.multiFaceLandmarks[0];
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
        });

        faceMeshRef.current = faceMeshInstance;

        const video = videoRef.current;
        if (!video) return;

        const camera = new Camera(video, {
          onFrame: async () => {
            await faceMeshInstance.send({ image: video });
          },
          width: 640,
          height: 480,
        });

        await camera.start();
        cameraRef.current = camera;
        setIsCameraReady(true);
      } catch (error) {
        console.error("Errore inizializzazione FaceMesh:", error);
        setError("Errore nell'avvio della webcam. Verifica i permessi.");
      }
    };

    initializeFaceMesh();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
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
