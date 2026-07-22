import React, { useState, useEffect, useRef } from "react";
import EmotionChart from "./EmotionChart";
import MindSyncChat from "./MindSyncChat";
import { useNavigate } from "react-router-dom";
const EmotionDisplay = ({ analysis, onReset }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [confirmSession, setConfirmSession] = useState(null);
  const speechSynthRef = useRef(null);

  const { analysis: metrics, advice, history, timestamp } = analysis;
  const { stress, focus, energy, valence, mood } = metrics || {};
  const navigate = useNavigate();

  useEffect(() => {
    if ("speechSynthesis" in window) {
      speechSynthRef.current = window.speechSynthesis;
    } else {
      console.warn("Web Speech API non supportata in questo browser");
    }
  }, []);

  const speakAdvice = () => {
    if (!speechSynthRef.current) {
      alert("La sintesi vocale non è supportata dal tuo browser");
      return;
    }

    const message = `
      Ciao! ${advice.analysis || "Ecco la tua analisi emotiva."}
      ${advice.advice || ""}
      L'attività suggerita è ${advice.suggestedActivity || "respirazione"}.
      ${advice.motivation || "Continua così!"}
    `;

    // Crea un oggetto utterance
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "it-IT";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Eventi per tracciare lo stato
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthRef.current.cancel();

    speechSynthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Formatta la data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mappa attività a emoji
  const getActivityEmoji = (activity) => {
    const map = {
      MEDITAZIONE: "🧘",
      "PAUSA ATTIVA": "🚶",
      "ESERCIZIO FISICO": "💪",
      RESPIRAZIONE: "🌬️",
      "CAMBIO ATTIVITÀ": "🔄",
    };
    return map[activity] || "💡";
  };

  // Mappa mood a emoji e colore
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

  return (
    <>
      <div className="emotion-display">
        {/* Pulsante per tornare indietro */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "10px",
          }}
        >
          <button
            onClick={onReset}
            className="btn-neon"
            style={{
              padding: "8px 20px",
              fontSize: "0.85rem",
              borderColor: "#6b7280",
              color: "#6b7280",
            }}
          >
            ← Nuova analisi
          </button>
        </div>

        {/* Grid delle metriche */}
        <div className="emotion-grid">
          <div className="emotion-card">
            <div className="label">Stress</div>
            <div className="value stress">{stress || 0}%</div>
          </div>
          <div className="emotion-card">
            <div className="label">Focus</div>
            <div className="value focus">{focus || 0}%</div>
          </div>
          <div className="emotion-card">
            <div className="label">Energia</div>
            <div className="value energy">{energy || 0}%</div>
          </div>
          <div className="emotion-card">
            <div className="label">Valenza</div>
            <div className="value valence">{valence || 0}%</div>
          </div>
        </div>

        {/* Mood e data */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            padding: "15px 20px",
            background: "rgba(17, 17, 17, 0.5)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.03)",
          }}
        >
          <div>
            <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
              Umore rilevato:
            </span>
            <span className="mood-badge" style={{ marginLeft: "10px" }}>
              {getMoodInfo(mood).emoji} {mood || "Non rilevato"}
            </span>
          </div>
          <div style={{ color: "#4b5563", fontSize: "0.8rem" }}>
            {timestamp ? formatDate(timestamp) : "Ora"}
          </div>
        </div>

        {/* Consiglio AI */}
        <div className="advice-box">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            <h3
              style={{
                color: "#a78bfa",
                fontSize: "0.9rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Consiglio dell'AI
            </h3>

            {/* Pulsanti sintesi vocale */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={isSpeaking ? stopSpeaking : speakAdvice}
                className="btn-neon"
                style={{
                  padding: "6px 16px",
                  fontSize: "0.8rem",
                  borderColor: isSpeaking ? "#ef4444" : "#7b2ffc",
                  color: isSpeaking ? "#ef4444" : "#a78bfa",
                }}
              >
                {isSpeaking ? "🔇 Ferma" : "🔊 Ascolta"}
              </button>
            </div>
          </div>

          <div className="advice-analysis">
            {advice.analysis || "Analisi non disponibile"}
          </div>

          <div className="advice-tip">
            💡 {advice.advice || "Nessun consiglio specifico"}
          </div>

          {advice.suggestedActivity && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <span className="advice-activity">
                {getActivityEmoji(advice.suggestedActivity)}{" "}
                {advice.suggestedActivity}
              </span>
            </div>
          )}

          {advice.motivation && (
            <div className="advice-motivation">💫 {advice.motivation}</div>
          )}
        </div>

        {/* Storico */}
        {history && history.length > 0 && (
          <div className="history-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3>Storico recente</h3>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {showHistory ? "Nascondi" : "Mostra"}
              </button>
            </div>

            {showHistory && (
              <div className="history-list">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="history-item"
                    onClick={() => setConfirmSession(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="h-mood">
                      {getMoodInfo(item.mood).emoji} {item.mood || "N/A"}
                    </span>
                    <span className="h-stats">
                      Stress: {item.stress}% · Focus: {item.focus}%
                    </span>
                    <span className="h-date">
                      {item.created_at ? formatDate(item.created_at) : ""}
                    </span>
                    {item.suggested_activity && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: item.activity_completed
                            ? "#34d399"
                            : "#6b7280",
                          padding: "2px 10px",
                          borderRadius: "12px",
                          background: item.activity_completed
                            ? "rgba(52, 211, 153, 0.1)"
                            : "rgba(107, 114, 128, 0.1)",
                        }}
                      >
                        {item.activity_completed
                          ? "✅ Completata"
                          : "⏳ Da fare"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <EmotionChart history={history} />
        <MindSyncChat analysis={analysis} />

        {/* Footer card */}
        <div
          style={{
            textAlign: "center",
            padding: "10px",
            color: "#4b5563",
            fontSize: "0.75rem",
            borderTop: "1px solid rgba(255,255,255,0.03)",
            marginTop: "10px",
          }}
        >
          MindSync — Analisi completata
        </div>
      </div>

      {/* modale di conferma */}

      {confirmSession && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "rgba(17,17,17,0.95)",
              border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: "20px",
              padding: "30px",
              maxWidth: "400px",
              width: "90%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem" }}>
              {getMoodInfo(confirmSession.mood).emoji}
            </div>
            <h3 style={{ color: "#e5e7eb", fontSize: "1.1rem" }}>
              Vuoi riaprire questa sessione?
            </h3>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "12px",
                padding: "15px",
                fontSize: "0.85rem",
                color: "#9ca3af",
              }}
            >
              <p>
                Umore:{" "}
                <span style={{ color: "#00d4ff" }}>{confirmSession.mood}</span>
              </p>
              <p>
                Stress: {confirmSession.stress}% · Focus: {confirmSession.focus}
                %
              </p>
              <p>{formatDate(confirmSession.created_at)}</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setConfirmSession(null)}
                className="btn-neon"
                style={{ flex: 1, borderColor: "#6b7280", color: "#6b7280" }}
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  setConfirmSession(null);
                  navigate(`/session/${confirmSession.id}`);
                }}
                className="btn-neon"
                style={{ flex: 1 }}
              >
                Apri sessione
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmotionDisplay;
