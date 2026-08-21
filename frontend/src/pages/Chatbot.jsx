import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { api, getStoredMember } from "../api/client";

const welcomeMessage = {
  role: "bot",
  text: "Namaste! I am Arogya Sahayak, your health guidance helper. I can discuss your symptoms in simple language (English or Telugu) and suggest safe next steps. I am not a doctor. For serious or urgent problems, you must see a health worker. How can I help you today?"
};

const quickPrompts = [
  { icon: "🌡️", label: "I have a fever", text: "I have a fever. What should I do?" },
  { icon: "🤕", label: "Headache advice", text: "I have a headache. What can I do?" },
  { icon: "💧", label: "Stomach problem", text: "I have stomach pain and loose motion." },
  { icon: "🩺", label: "Check my BP", text: "My blood pressure is high. What should I do?" }
];

export default function Chatbot() {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const member = getStoredMember();
  const location = useLocation();

  const language = member?.preferredLanguage === "te" ? "te" : "en";

  // If the user clicked a quick-chat link on the Home page,
  // auto-send that message when the chat first loads.
  const initialMessage = location.state?.initialMessage;

  useEffect(() => {
    if (initialMessage) {
      const text = String(initialMessage).slice(0, 500);
      // Clear the state so it doesn't re-send on refresh
      window.history.replaceState({}, "");

      setMessages((prev) => [...prev, { role: "user", text }]);
      setLoading(true);

      api
        .post("/api/chat/message", { message: text, language })
        .then((result) => {
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              text: result.data.botReply,
              urgency: result.data.urgency
            }
          ]);
        })
        .catch((err) => {
          setError(err.message || "Failed to get a response. Please try again.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (messageText) => {
    const text = messageText.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const result = await api.post("/api/chat/message", {
        message: text,
        language
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: result.data.botReply,
          urgency: result.data.urgency
        }
      ]);
    } catch (err) {
      setError(err.message || "Failed to get a response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-heading">
          <div className="assistant-avatar">✦</div>
          <div>
            <div className="chat-title-row">
              <h1>Arogya Sahayak</h1>
              <span className="online-status"><span /> Available</span>
            </div>
            <p className="muted">Your private health guidance companion</p>
          </div>
        </div>
        <div className="chat-meta">
          <span>EN</span><span>తెలుగు</span>
          <span className="chat-disclaimer">For guidance only, not a diagnosis</span>
        </div>
      </div>

      <div className="chat-window">
        {messages.length === 1 && !initialMessage && (
          <div className="chat-intro">
            <span className="intro-kicker">START HERE</span>
            <h2>What would you like help with?</h2>
            <p>Tell me what you are feeling. I will help you decide the next safe step.</p>
            <div className="quick-prompts">
              {quickPrompts.map((prompt) => (
                <button type="button" className="quick-prompt" key={prompt.label} onClick={() => sendMessage(prompt.text)} disabled={loading}>
                  <span>{prompt.icon}</span>
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-msg ${msg.role}`}>
            {msg.role === "bot" && <div className="message-avatar">✦</div>}
            <div className="message-content">
              <div className={`chat-bubble ${msg.role === "user" ? "user-bubble" : "bot-bubble"}`}>
                {msg.text}
              </div>
              {msg.urgency === "EMERGENCY" && (
                <div className="emergency-badge">
                  <strong>Immediate help needed</strong>
                  <span>Call 108 or go to the nearest hospital now.</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg bot">
            <div className="message-avatar">✦</div>
            <div className="chat-bubble bot-bubble typing" aria-label="Arogya Sahayak is thinking">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="error-text chat-error" role="alert">{error}</p>}

      <form onSubmit={handleSend} className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe how you are feeling..."
          maxLength={500}
          disabled={loading}
        />
        <button type="submit" className="send-button" disabled={loading || !input.trim()} aria-label="Send message">
          <span>Send</span><span aria-hidden="true">↑</span>
        </button>
      </form>
      <p className="composer-note">Press Enter to send <span>•</span> Your messages stay private</p>
    </div>
  );
}