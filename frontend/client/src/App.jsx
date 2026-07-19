import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  return (
    <>
      <div className="app-container">
        {/* Header */}
        <header className="app-header glass-card">
          <h1 className="app-title neon-text">🧠 MindSync</h1>
          <p className="app-subtitle">Il tuo coach emotivo personale</p>
        </header>

        {/* Dashboard principale */}
        <main className="app-main">
          <Dashboard />
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
