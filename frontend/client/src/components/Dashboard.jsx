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

  return <div></div>;
};

export default Dashboard;
