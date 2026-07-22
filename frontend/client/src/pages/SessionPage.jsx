import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MindSyncChat from "../components/MindSyncChat";
import EmotionChart from "../components/EmotionChart";

const SessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/emotion/session/${id}`,
        );
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        setSession(data.session);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  const getMoodInfo = (mood) => {
    const map = {
      stressato: { emoji: "😰", color: "#ef4444" },
      "rilassato e concentrato": { emoji: "😌", color: "#34d399" },
      entusiasta: { emoji: "🤩", color: "#fbbf24" },
      stanco: { emoji: "😴", color: "#6b7280" },
      concentrato: { emoji: "🧠", color: "#22d3ee" },
      teso: { emoji: "😬", color: "#f97316" },
      neutrale: { emoji: "😐", color: "#9ca3af" },
    };
    return map[mood] || { emoji: "😐", color: "#9ca3af" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#ef4444" }}>❌ {error || "Sessione non trovata"}</p>
        <button className="btn-neon" onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
          ← Torna alla home
        </button>
      </div>
    );
  }

  const moodInfo = getMoodInfo(session.mood);
  const advice = session.advice_given ? JSON.parse(session.advice_given) : null


  const analysisObj = {
    analysis: {
      stress: session.stress,
      focus: session.focus,
      energy: session.energy,
      valence: session.valence,
      mood: session.mood,
    },
    advice: advice || {
      analysis: "Sessione precedente",
      advice: "",
      suggestedActivity: session.suggested_activity || "",
      motivation: "",
    }
  }

  return <>
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="btn-neon"
        style={{ alignSelf: "flex-start", padding: "8px 20px", fontSize: "0.85rem", borderColor: "#6b7280", color: "#6b7280" }}
      >
        ← Torna alla home
      </button>

      {/* Header sessione */}
      <div className="glass-card" style={{ padding: "25px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "10px" }}>{moodInfo.emoji}</div>
        <h2 style={{ color: moodInfo.color, fontSize: "1.4rem", marginBottom: "5px", textTransform: "capitalize" }}>
          {session.mood}
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>{formatDate(session.created_at)}</p>
      </div>

      {/* Metriche */}
      <div className="emotion-grid">
        <div className="emotion-card">
          <div className="label">Stress</div>
          <div className="value stress">{session.stress}%</div>
        </div>
        <div className="emotion-card">
          <div className="label">Focus</div>
          <div className="value focus">{session.focus}%</div>
        </div>
        <div className="emotion-card">
          <div className="label">Energia</div>
          <div className="value energy">{session.energy}%</div>
        </div>
        <div className="emotion-card">
          <div className="label">Valenza</div>
          <div className="value valence">{session.valence}%</div>
        </div>
      </div>

      {/* Consiglio AI originale */}
      {advice && (
        <div className="advice-box">
          <h3 style={{ color: "#a78bfa", fontSize: "0.9rem", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "15px" }}>
            Analisi originale
          </h3>
          <div className="advice-analysis">{advice.analysis}</div>
          <div className="advice-tip">💡 {advice.advice}</div>
          {advice.suggestedActivity && (
            <span className="advice-activity">
              {advice.suggestedActivity}
            </span>
          )}
          {advice.motivation && (
            <div className="advice-motivation">💫 {advice.motivation}</div>
          )}
        </div>
      )}

      {/* Chat */}
      <MindSyncChat analysis={analysisObj} />

    </div>
  </>;
};

export default SessionPage;
