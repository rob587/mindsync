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

  return <div>SessionPage</div>;
};

export default SessionPage;
