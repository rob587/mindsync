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

  return (
    <>
      <div
        style={{
          background: "rgba(17,17,17,0.8)",
          border: "1px solid rgba(123,47,252,0.2)",
          borderRadius: "16px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <h3
          style={{
            color: "#a78bfa",
            fontSize: "0.85rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Parla con MindSync
        </h3>

        {/* Messaggi */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            maxHeight: "350px",
            overflowY: "auto",
            paddingRight: "5px",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "12px 16px",
                  borderRadius:
                    msg.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background:
                    msg.role === "user"
                      ? "rgba(123,47,252,0.3)"
                      : "rgba(255,255,255,0.05)",
                  border:
                    msg.role === "user"
                      ? "1px solid rgba(123,47,252,0.4)"
                      : "1px solid rgba(255,255,255,0.05)",
                  color: "#e5e7eb",
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "16px 16px 16px 4px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  color: "#6b7280",
                  fontSize: "0.9rem",
                }}
              >
                MindSync sta pensando...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: "10px" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi qualcosa... (Invio per inviare)"
            rows={2}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(123,47,252,0.2)",
              borderRadius: "12px",
              padding: "12px",
              color: "#e5e7eb",
              fontSize: "0.9rem",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="btn-neon"
            style={{
              padding: "12px 20px",
              borderColor: "#7b2ffc",
              color: "#a78bfa",
              alignSelf: "flex-end",
              opacity: loading || !input.trim() ? 0.5 : 1,
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </>
  );
};

export default MindSyncChat;
