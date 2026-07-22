import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import SessionPage from "./pages/SessionPage";
import "./App.css";

function App() {
  const [currentMood, setCurrentMood] = useState(null);

  useEffect(() => {
    console.log("🎨 Mood cambiato:", currentMood);
    const moodColors = {
      stressato: "radial-gradient(ellipse at center, #1a0505 0%, #0a0a0a 70%)",
      teso: "radial-gradient(ellipse at center, #1a0a05 0%, #0a0a0a 70%)",
      stanco: "radial-gradient(ellipse at center, #0d0d14 0%, #0a0a0a 70%)",
      neutrale: "radial-gradient(ellipse at center, #0d0d0d 0%, #0a0a0a 70%)",
      concentrato:
        "radial-gradient(ellipse at center, #051520 0%, #0a0a0a 70%)",
      "rilassato e concentrato":
        "radial-gradient(ellipse at center, #051a10 0%, #0a0a0a 70%)",
      entusiasta: "radial-gradient(ellipse at center, #1a1505 0%, #0a0a0a 70%)",
    };

    const bg = moodColors[currentMood] || moodColors["neutrale"];
    document.body.style.background = bg;
    document.body.style.transition = "background 1.5s ease";
  }, [currentMood]);

  return (
    <>
      <div className="app-container">
        {/* Header */}
        <header className="app-header glass-card">
          <h1 className="app-title neon-text">MindSync</h1>
          <p className="app-subtitle">Il tuo coach emotivo personale</p>
        </header>

        {/* Dashboard principale */}
        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={<Dashboard onMoodChange={setCurrentMood} />}
            />
            <Route path="/session/:id" element={<SessionPage />} />
          </Routes>
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
