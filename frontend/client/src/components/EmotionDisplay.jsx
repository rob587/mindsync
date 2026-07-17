import React, { useState, useEffect, useRef } from "react";

const EmotionDisplay = ({ analysis, onReset }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const speechSynthRef = useRef(null);

  const { analysis: metrics, advice, history, timestamp } = analysis;
  const { stress, focus, energy, valence, mood } = metrics || {};

  return <div></div>;
};

export default EmotionDisplay;
