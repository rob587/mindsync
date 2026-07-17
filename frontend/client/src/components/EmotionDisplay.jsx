import React, { useState, useEffect, useRef } from "react";

const EmotionDisplay = ({ analysis, onReset }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const speechSynthRef = useRef(null);

  const { analysis: metrics, advice, history, timestamp } = analysis;
  const { stress, focus, energy, valence, mood } = metrics || {};

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

  return <div></div>;
};

export default EmotionDisplay;
