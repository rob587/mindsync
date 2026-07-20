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

  return <div></div>;
};

export default MindSyncChat;
