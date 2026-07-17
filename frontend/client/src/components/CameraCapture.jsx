import React, { useState, useEffect } from "react";
import useFaceDetection from "../hooks/useFaceDetection";

const CameraCapture = ({ onResult, onAnalyzing, isAnalyzing }) => {
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

  // Avvia la webcam
  const startCamera = async () => {
    try {
      setStatusMessage("Avvio webcam in corso...");

      // Verifica se il browser supporta la webcam
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Il tuo browser non supporta la webcam");
      }

      // La webcam viene avviata automaticamente da useFaceDetection
      // Aspettiamo che sia pronta
      setIsCameraActive(true);
      setStatusMessage("Rilevamento volto in corso...");
    } catch (error) {
      console.error("Errore avvio webcam:", error);
      setError("Impossibile accedere alla webcam. Verifica i permessi.");
      setStatusMessage("Errore: " + error.message);
    }
  };

  const stopCamera = () => {
    setIsCameraActive(false);
    setStatusMessage("Webcam fermata");
    setFrameCount(0);

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleAnalyze = () => {
    if (!isCameraReady) {
      setError("La webcam non è ancora pronta. Riprova tra qualche secondo.");
      return;
    }

    setStatusMessage("Analisi in corso...");
    triggerAnalysis();
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <>
      <div className="camera-container">
        {/* Errore */}
        {error && (
          <div className="error-banner" style={{ marginBottom: "15px" }}>
            {error}
            <button
              onClick={clearError}
              style={{
                marginLeft: "15px",
                background: "transparent",
                border: "none",
                color: "#f87171",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Chiudi
            </button>
          </div>
        )}

        {/* Webcam */}
        <div className="camera-wrapper">
          {!isCameraActive ? (
            <div className="camera-placeholder">
              <div className="icon">📷</div>
              <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
                Attiva la webcam per iniziare
              </p>
              <p style={{ color: "#4b5563", fontSize: "0.85rem" }}>
                Avremo bisogno di vedere il tuo viso
              </p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: isCameraReady ? "block" : "none",
                }}
              />

              {!isCameraReady && (
                <div
                  className="camera-placeholder"
                  style={{ position: "absolute", top: 0, left: 0 }}
                >
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p style={{ color: "#9ca3af" }}>Caricamento webcam...</p>
                  </div>
                </div>
              )}

              {/* Overlay con stato */}
              <div className="camera-overlay">
                {isDetecting
                  ? "🧠 Analisi in corso..."
                  : `👤 ${isCameraReady ? "Volto rilevato" : "Attivazione..."}`}
              </div>
            </>
          )}
        </div>

        {/* Statistiche */}
        {isCameraActive && isCameraReady && (
          <div
            style={{
              display: "flex",
              gap: "20px",
              padding: "10px 20px",
              background: "rgba(17, 17, 17, 0.8)",
              borderRadius: "12px",
              border: "1px solid rgba(0, 212, 255, 0.1)",
              fontSize: "0.85rem",
              color: "#9ca3af",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span>Rilevamento attivo</span>
            <span>{frameCount}s</span>
            <span>Connesso</span>
          </div>
        )}

        {/* Controlli */}
        <div className="camera-controls">
          {!isCameraActive ? (
            <button
              className="btn-neon"
              onClick={startCamera}
              style={{
                background: "transparent",
                border: "2px solid #00d4ff",
                color: "#00d4ff",
              }}
            >
              Attiva Webcam
            </button>
          ) : (
            <>
              <button
                className="btn-neon"
                onClick={handleAnalyze}
                disabled={!isCameraReady || isAnalyzing || isDetecting}
                style={{
                  background:
                    isAnalyzing || isDetecting ? "#4b5563" : "transparent",
                  border: "2px solid #7b2ffc",
                  color: isAnalyzing || isDetecting ? "#4b5563" : "#a78bfa",
                  cursor:
                    isAnalyzing || isDetecting ? "not-allowed" : "pointer",
                }}
              >
                {isAnalyzing || isDetecting ? "⏳ Analisi..." : "🧠 Analizza"}
              </button>

              <button
                className="btn-neon"
                onClick={stopCamera}
                style={{
                  border: "2px solid #ef4444",
                  color: "#ef4444",
                }}
              >
                Ferma
              </button>
            </>
          )}
        </div>

        {/* Status message */}
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
    </>
  );
};

export default CameraCapture;
