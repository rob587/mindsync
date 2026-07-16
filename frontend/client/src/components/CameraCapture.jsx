import React, { useState, useEffect } from "react";
import useFaceDetection from "../hooks/useFaceDetection";

const CameraCapture = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Attiva la webcam per iniziare",
  );
  const [frameCount, setFrameCount] = useState(0);

  return <div></div>;
};

export default CameraCapture;
