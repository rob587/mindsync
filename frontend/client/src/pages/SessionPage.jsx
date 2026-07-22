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


  return <div>SessionPage</div>;
};

export default SessionPage;
