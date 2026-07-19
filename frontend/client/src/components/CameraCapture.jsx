// frontend/src/components/CameraCapture.jsx
import React, { useState, useEffect, useRef } from "react";
import useFaceDetection from "../hooks/useFaceDetection";

const CameraCapture = ({ onResult, onAnalyzing, isAnalyzing }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Attiva la webcam per iniziare",
  );
  const [frameCount, setFrameCount] = useState(0);
  const videoRefLocal = useRef(null);

  const {
    videoRef: hookVideoRef,
    isCameraReady,
    isDetecting,
    error,
    triggerAnalysis,
    setError,
  } = useFaceDetection(onResult, onAnalyzing, isCameraActive);

  // Combina i ref
  useEffect(() => {
    if (hookVideoRef.current) {
      videoRefLocal.current = hookVideoRef.current;
    }
  }, [hookVideoRef]);

  // Aggiorna il contatore
  useEffect(() => {
    if (isCameraActive && isCameraReady) {
      const interval = setInterval(() => {
        setFrameCount((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCameraActive, isCameraReady]);

  // Avvia webcam
  const startCamera = async () => {
    try {
      setStatusMessage("📷 Avvio webcam...");
      setIsCameraActive(true);
      setStatusMessage("🔍 Rilevamento volto...");
    } catch (error) {
      console.error("Errore avvio:", error);
      setError("Impossibile accedere alla webcam.");
      setStatusMessage("❌ Errore");
    }
  };

  // Ferma webcam
  const stopCamera = () => {
    setIsCameraActive(false);
    setStatusMessage("🛑 Fermata");
    setFrameCount(0);
    if (hookVideoRef.current && hookVideoRef.current.srcObject) {
      const stream = hookVideoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      hookVideoRef.current.srcObject = null;
    }
  };

  // Analizza
  const handleAnalyze = () => {
    if (!isCameraReady) {
      setError("Webcam non pronta");
      return;
    }
    setStatusMessage("🧠 Analisi...");
    triggerAnalysis();
  };

  return (
    <div className="camera-container">
      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: "15px",
              background: "none",
              border: "none",
              color: "#f87171",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="camera-wrapper">
        {!isCameraActive ? (
          <div className="camera-placeholder">
            <div className="icon">📷</div>
            <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
              Attiva la webcam
            </p>
            <p style={{ color: "#4b5563", fontSize: "0.85rem" }}>
              Avremo bisogno di vedere il tuo viso
            </p>
          </div>
        ) : (
          <>
            <video
              ref={hookVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                backgroundColor: "#111",
              }}
            />

            <div className="camera-overlay">
              {isDetecting
                ? "🧠 Analisi..."
                : isCameraReady
                  ? "✅ Volto rilevato"
                  : "⏳ Caricamento..."}
            </div>
          </>
        )}
      </div>

      {isCameraActive && isCameraReady && (
        <div
          style={{
            display: "flex",
            gap: "20px",
            padding: "10px 20px",
            background: "rgba(17,17,17,0.8)",
            borderRadius: "12px",
            border: "1px solid rgba(0,212,255,0.1)",
            fontSize: "0.85rem",
            color: "#9ca3af",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span>📡 Rilevamento attivo</span>
          <span>⏱️ {frameCount}s</span>
          <span>🟢 Connesso</span>
        </div>
      )}

      <div className="camera-controls">
        {!isCameraActive ? (
          <button className="btn-neon" onClick={startCamera}>
            📷 Attiva Webcam
          </button>
        ) : (
          <>
            <button
              className="btn-neon"
              onClick={handleAnalyze}
              disabled={!isCameraReady || isAnalyzing || isDetecting}
              style={{
                opacity:
                  !isCameraReady || isAnalyzing || isDetecting ? "0.5" : "1",
                cursor:
                  !isCameraReady || isAnalyzing || isDetecting
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {isAnalyzing || isDetecting ? "⏳ Analisi..." : "🧠 Analizza"}
            </button>

            <button
              className="btn-neon"
              onClick={stopCamera}
              style={{ borderColor: "#ef4444", color: "#ef4444" }}
            >
              🛑 Ferma
            </button>
          </>
        )}
      </div>

      {statusMessage && (
        <p
          style={{
            color: "#6b7280",
            fontSize: "0.9rem",
            marginTop: "10px",
            textAlign: "center",
          }}
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
};

export default CameraCapture;
