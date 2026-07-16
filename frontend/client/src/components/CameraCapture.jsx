import React, { useState, useEffect } from "react";
import useFaceDetection from "../hooks/useFaceDetection";

const CameraCapture = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Attiva la webcam per iniziare",
  );
  const [frameCount, setFrameCount] = useState(0);

  const {
    videoRef,
    isCameraReady,
    isDetecting,
    error,
    triggerAnalysis,
    setError,
  } = useFaceDetection(onResult, onAnalyzing);

  useEffect(() => {
    if (isCameraActive && isCameraReady) {
      const interval = setInterval(() => {
        setFrameCount((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCameraActive, isCameraReady]);

  return <div></div>;
};

export default CameraCapture;
