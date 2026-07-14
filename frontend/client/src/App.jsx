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

  return <></>;
}

export default App;
