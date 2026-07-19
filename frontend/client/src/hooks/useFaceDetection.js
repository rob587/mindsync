import { useState, useEffect, useRef, useCallback } from "react";
import { analyzeEmotion } from "../services/apiService";

export const useFaceDetection = (onResult, onAnalyzing, isCameraActive) => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const faceMeshRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const metricsHistoryRef = useRef([]);
  const landmarksHistoryRef = useRef([]);

  const loadFaceMesh = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.FaceMesh) {
        resolve(window.FaceMesh);
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
      script.crossOrigin = "anonymous";
      script.onload = () => resolve(window.FaceMesh);
      script.onerror = () => reject(new Error("Impossibile caricare FaceMesh"));
      document.body.appendChild(script);
    });
  }, []);

  const calculateMetrics = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) return null;

    const LEFT_EYE = [33, 133, 157, 158, 159, 160, 161, 173];
    const RIGHT_EYE = [362, 263, 387, 386, 385, 384, 398, 466];
    const MOUTH = [
      61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0,
      37, 39, 40, 185,
    ];

    const distance = (p1, p2) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dz = p1.z - p2.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    const getEyeOpenness = () => {
      const leftEye = landmarks.filter((_, i) => LEFT_EYE.includes(i));
      const rightEye = landmarks.filter((_, i) => RIGHT_EYE.includes(i));
      if (leftEye.length < 4 || rightEye.length < 4) return 50;
      const leftOpen = distance(leftEye[0], leftEye[4]);
      const rightOpen = distance(rightEye[0], rightEye[4]);
      return Math.min(Math.round(((leftOpen + rightOpen) / 2) * 200), 100);
    };

    const getMouthTension = () => {
      const mouthPoints = landmarks.filter((_, i) => MOUTH.includes(i));
      if (mouthPoints.length < 4) return 50;
      const mouthOpen = distance(
        mouthPoints[0],
        mouthPoints[mouthPoints.length - 1],
      );
      return Math.max(0, Math.min(100, 100 - mouthOpen * 300));
    };

    const getBlinkRate = () => (getEyeOpenness() < 30 ? 20 : 5);

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

  const sendToBackend = useCallback(
    async (landmarks, metrics) => {
      try {
        onAnalyzing(true);
        const result = await analyzeEmotion({
          userId: "roberto",
          landmarks: landmarks.map((l) => [l.x, l.y, l.z]),
          sessionId: `session_${Date.now()}`,
          metrics,
        });
        onAnalyzing(false);
        onResult(result);
      } catch (error) {
        console.error("Errore invio al backend:", error);
        onAnalyzing(false);
        onResult({ success: false, error: error.message || "Errore server" });
      }
    },
    [onResult, onAnalyzing],
  );

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

  useEffect(() => {
    if (!isCameraActive) return; // ← non parte finché non clicchi

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          streamRef.current = stream;
          console.log("✅ Webcam avviata");
        }

        const FaceMesh = await loadFaceMesh();
        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
          if (results.multiFaceLandmarks?.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            const metrics = calculateMetrics(landmarks);
            if (metrics) {
              landmarksHistoryRef.current.push(landmarks);
              metricsHistoryRef.current.push(metrics);
              if (landmarksHistoryRef.current.length > 30) {
                landmarksHistoryRef.current.shift();
                metricsHistoryRef.current.shift();
              }
            }
          }
        });

        faceMeshRef.current = faceMesh;
        setIsCameraReady(true);
        console.log("✅ FaceMesh pronto");

        const detectLoop = async () => {
          if (videoRef.current && faceMeshRef.current) {
            try {
              await faceMeshRef.current.send({ image: videoRef.current });
            } catch (err) {}
          }
          animationRef.current = requestAnimationFrame(detectLoop);
        };

        detectLoop();
      } catch (error) {
        console.error("❌ Errore inizializzazione:", error);
        setError("Errore avvio: " + error.message);
      }
    };

    init();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
      if (faceMeshRef.current) faceMeshRef.current.close();
      setIsCameraReady(false);
    };
  }, [isCameraActive, loadFaceMesh, calculateMetrics]);

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
