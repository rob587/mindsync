import React, { useState } from "react";
import CameraCapture from "./components/CameraCapture";
import EmotionDisplay from "./components/EmotionDisplay";
import "./App.css";

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalysisResult = (result) => {
    setAnalysis(result);
    setIsAnalyzing(false);
    if (result.success === false) {
      setError(result.error || "Errore durante l'analisi");
    } else {
      setError(null);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <>
      <div className="app-container">
        {/* Header */}
        <header className="app-header glass-card">
          <h1 className="app-title neon-text"> MindSync</h1>
          <p className="app-subtitle">Il tuo coach emotivo personale</p>
        </header>

        {/* Main content */}
        <main className="app-main">
          {!analysis ? (
            <CameraCapture
              onResult={handleAnalysisResult}
              onAnalyzing={setIsAnalyzing}
              isAnalyzing={isAnalyzing}
            />
          ) : (
            <EmotionDisplay analysis={analysis} onReset={handleReset} />
          )}

          {error && <div className="error-banner">{error}</div>}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <p>MindSync v1.0 — AI Emotion Coach</p>
        </footer>
      </div>
    </>
  );
}

export default App;
