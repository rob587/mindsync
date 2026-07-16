import { useState, useEffect, useRef, useCallback } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { analyzeEmotion } from "../services/apiService";

export const useFaceDetection = (onResult, onAnalyzing) => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const lastMetricsRef = useRef(null);

  const metricsHistoryRef = useRef([]);
  const landmarksHistoryRef = useRef([]);

  const calculateMetrics = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) return null;

    // Landmark indici per occhi (MediaPipe FaceMesh)
    const LEFT_EYE_INDICES = [33, 133, 157, 158, 159, 160, 161, 173];
    const RIGHT_EYE_INDICES = [362, 263, 387, 386, 385, 384, 398, 466];
    const MOUTH_INDICES = [
      61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0,
      37, 39, 40, 185,
    ];
    const NOSE_TIP = 1;
    const CHIN = 152;

    // Funzione per calcolare la distanza tra due punti
    const distance = (p1, p2) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dz = p1.z - p2.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    // Calcola apertura occhi (media tra occhio sinistro e destro)
    const getEyeOpenness = () => {
      const leftEye = landmarks.filter((l) =>
        LEFT_EYE_INDICES.includes(l.index),
      );
      const rightEye = landmarks.filter((l) =>
        RIGHT_EYE_INDICES.includes(l.index),
      );

      if (leftEye.length < 4 || rightEye.length < 4) return 50;

      // Calcola distanza verticale media per occhio
      const leftOpen = distance(leftEye[0], leftEye[4]) / 0.1;
      const rightOpen = distance(rightEye[0], rightEye[4]) / 0.1;

      return Math.min(Math.round(((leftOpen + rightOpen) / 2) * 100), 100);
    };

    // Calcola tensione bocca (più la bocca è chiusa/tesa, più è alta)
    const getMouthTension = () => {
      const mouthPoints = landmarks.filter((l) =>
        MOUTH_INDICES.includes(l.index),
      );
      if (mouthPoints.length < 4) return 50;

      // Distanza verticale tra labbro superiore e inferiore
      const topLip = mouthPoints[0];
      const bottomLip = mouthPoints[mouthPoints.length - 1];
      const mouthOpen = distance(topLip, bottomLip) / 0.05;

      // Più è aperta, meno tensione
      return Math.max(0, Math.min(100, 100 - mouthOpen * 10));
    };

    // Calcola frequenza battito palpebre
    const getBlinkRate = () => {
      const eyeOpen = getEyeOpenness();
      // Se occhi chiusi o quasi, conta come battito
      return eyeOpen < 30 ? 20 : 5;
    };

    // Calcola posizione testa (inclinazione)
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
};
