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

  return <div>SessionPage</div>;
};

export default SessionPage;
