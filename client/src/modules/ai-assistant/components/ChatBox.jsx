import { useState } from "react";
import MessageBubble from "./MessageBubble";

const ChatBox = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you?" },
  ]);

  const [input, setInput] = useState("");

  // 🔥 NEW: backend call function
  const sendMessageToBackend = async (message) => {
    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      return data.reply;
    } catch (error) {
      console.error(error);
      return "Server error. Please try again.";
    }
  };

  // 🔥 UPDATED handleSend
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    // show user message
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage },
    ]);

    setInput("");

    // temporary loading message
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Thinking..." },
    ]);

    // call backend
    const reply = await sendMessageToBackend(userMessage);

    // replace "Thinking..." with actual reply
    setMessages((prev) => [
      ...prev.slice(0, -1),
      { sender: "bot", text: reply },
    ]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: "10px",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#2563eb",
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        AI Assistant
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          backgroundColor: "#f9fafb",
        }}
      >
        {messages.map((msg, index) => (
          <MessageBubble key={index} sender={msg.sender} text={msg.text} />
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #ddd",
          padding: "8px",
        }}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />

        <button
          onClick={handleSend}
          style={{
            marginLeft: "8px",
            padding: "8px 12px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;