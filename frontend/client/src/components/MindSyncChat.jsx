import React, { useState, useRef, useEffect } from "react";

const MindSyncChat = ({ analysis }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Ciao! Ho appena analizzato il tuo stato emotivo. Sono qui se vuoi parlare di come ti senti o approfondire qualcosa. Cosa vorresti sapere?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/emotion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          analysis: analysis.analysis,
          advice: analysis.advice,
          history: messages,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Mi dispiace, ho avuto un problema. Riprova!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return <div></div>;
};

export default MindSyncChat;
