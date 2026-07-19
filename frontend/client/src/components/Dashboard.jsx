import React, { useState, useEffect } from "react";
import CameraCapture from "./CameraCapture";
import EmotionDisplay from "./EmotionDisplay";
import { healthCheck } from "../services/apiService";

const Dashboard = () => {
  const [backendStatus, setBackendStatus] = useState("checking");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await healthCheck();
        setBackendStatus("online");
        console.log("Backend Connesso");
      } catch (error) {
        setBackendStatus("offline");
        setError("impossibile connettersi al backend");
        console.error("backend offline", error);
      }
    };
    checkBackend();
  }, []);

  const handleAnalysisResult = (result) => {
    setAnalysis(result);
    setIsAnalyzing(false);

    if (result.success === false) {
      setError(result.error || "Errore durante l'analisi");
    } else {
      setError(null);
      setSessionCount((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
  };

  if (backendStatus === "checking") {
    return (
      <div
        className="glass-card"
        style={{
          padding: "60px 40px",
          textAlign: "center",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <div className="spinner" style={{ margin: "0 auto" }}></div>
        </div>
        <h3 style={{ color: "#9ca3af", fontSize: "1.1rem" }}>
          Connessione al backend in corso...
        </h3>
        <p style={{ color: "#4b5563", fontSize: "0.85rem", marginTop: "10px" }}>
          Assicurati che il server sia avviato su localhost:5000
        </p>
      </div>
    );
  }

  // Mostra errore se backend offline
  if (backendStatus === "offline") {
    return (
      <div
        className="glass-card"
        style={{
          padding: "60px 40px",
          textAlign: "center",
          maxWidth: "500px",
          margin: "0 auto",
          borderColor: "rgba(239, 68, 68, 0.3)",
        }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔌</div>
        <h3 style={{ color: "#f87171", fontSize: "1.2rem" }}>
          Backend non raggiungibile
        </h3>
        <p style={{ color: "#9ca3af", marginTop: "10px", lineHeight: "1.6" }}>
          {error || 'Avvia il backend con "npm run dev" nella cartella backend'}
        </p>
        <button
          className="btn-neon"
          onClick={() => window.location.reload()}
          style={{ marginTop: "20px" }}
        >
          🔄 Riprova
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Header con stato backend */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            padding: "12px 20px",
            background: "rgba(17, 17, 17, 0.6)",
            borderRadius: "12px",
            border: "1px solid rgba(0, 212, 255, 0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: backendStatus === "online" ? "#34d399" : "#ef4444",
                boxShadow:
                  backendStatus === "online"
                    ? "0 0 10px rgba(52, 211, 153, 0.5)"
                    : "none",
                animation:
                  backendStatus === "online"
                    ? "pulse 2s ease-in-out infinite"
                    : "none",
              }}
            ></span>
            <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
              Backend {backendStatus === "online" ? "🟢 Online" : "🔴 Offline"}
            </span>
          </div>
          <div style={{ color: "#4b5563", fontSize: "0.8rem" }}>
            Sessioni: {sessionCount}
          </div>
        </div>

        {/* Contenuto principale */}
        {!analysis ? (
          <CameraCapture
            onResult={handleAnalysisResult}
            onAnalyzing={setIsAnalyzing}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          <EmotionDisplay analysis={analysis} onReset={handleReset} />
        )}

        {/* Errori globali */}
        {error && !analysis && <div className="error-banner">⚠️ {error}</div>}
      </div>
    </>
  );
};

export default Dashboard;
