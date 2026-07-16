import { useState, useEffect, useRef, useCallback } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { analyzeEmotion } from "../services/apiService";

export const useFaceDetection = (onResult, onAnalyzing) => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
};
