import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStoredMember } from "../api/client";

export default function Home() {
  const [symptom, setSymptom] = useState("");
  const navigate = useNavigate();
  const member = getStoredMember();

  const handleQuickChat = (e) => {
    e.preventDefault();
    const text = symptom.trim();
    if (!text) return;
    navigate("/chat", { state: { initialMessage: text } });
  };

  const handleConcern = (concern) => {
    navigate("/chat", { state: { initialMessage: `I want to know about ${concern}` } });
  };

  return (
    <div className="home-page">
      {/* ===== Hero ===== */}
      <section className="hero">
        <div className="hero-inner">
          <h1>Your Health, Your Language, Your Care</h1>
          <p className="hero-sub">
            AI-powered healthcare support for rural communities — in English & తెలుగు.
          </p>
          <div className="hero-actions">
            <Link to={member ? "/symptoms" : "/register"} className="btn btn-primary btn-lg">
              🩺 Start Health Check
            </Link>
            <Link to={member ? "/chat" : "/login"} className="btn btn-outline btn-lg">
              💬 Chat with AI
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Quick Healthcare Services ===== */}
      <section className="section">
        <h2 className="section-title">Quick Healthcare Services</h2>
        <div className="service-grid">
          <Link to="/chat" className="service-card">
            <span className="service-icon">🤖</span>
            <h3>AI Health Chat</h3>
            <p>Talk about your symptoms in simple language.</p>
          </Link>
          <Link to="/symptoms" className="service-card">
            <span className="service-icon">🩺</span>
            <h3>Symptom Check</h3>
            <p>Run a safe triage screening with clear guidance.</p>
          </Link>
          <Link to="/phcs" className="service-card">
            <span className="service-icon">🏥</span>
            <h3>Find PHC</h3>
            <p>Search for Primary Health Centres by district.</p>
          </Link>
          <Link to="/profile" className="service-card">
            <span className="service-icon">📊</span>
            <h3>Health Records</h3>
            <p>Your assessments and profile under one place.</p>
          </Link>
          <Link to="/chat" className="service-card">
            <span className="service-icon">💬</span>
            <h3>Telugu Support</h3>
            <p>మీ భాషలో ఆరోగ్య సహాయం పొందండి.</p>
          </Link>
        </div>
      </section>

      {/* ===== Popular Health Concerns ===== */}
      <section className="section">
        <h2 className="section-title">Popular Health Concerns</h2>
        <div className="concern-row">
          {["Fever", "Diabetes", "Blood Pressure", "Women's Health", "Baby Care"].map(
            (concern) => (
              <button
                key={concern}
                className="concern-chip"
                onClick={() => handleConcern(concern)}
              >
                {concern}
              </button>
            )
          )}
        </div>
      </section>

      {/* ===== AI Health Assistant ===== */}
      <section className="section assistant-section">
        <h2 className="section-title">AI Health Assistant</h2>
        <p className="muted">
          "Tell us what you're feeling..." — I will guide you with safe next steps.
        </p>
        <form onSubmit={handleQuickChat} className="assistant-form">
          <input
            type="text"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="Describe your symptoms..."
            maxLength={500}
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </form>
      </section>

      {/* ===== Health Information ===== */}
      <section className="section">
        <h2 className="section-title">Health Information</h2>
        <div className="info-grid">
          <Link to="/health-tips" className="info-card">
            <span className="service-icon">💡</span>
            <h3>Health Tips</h3>
            <p>Simple daily habits for a healthy life.</p>
          </Link>
          <Link to="/health-tips" className="info-card">
            <span className="service-icon">🛡️</span>
            <h3>Prevention</h3>
            <p>Stop common illnesses before they start.</p>
          </Link>
          <Link to="/health-tips" className="info-card">
            <span className="service-icon">🍚</span>
            <h3>Nutrition</h3>
            <p>Affordable, local food guidance.</p>
          </Link>
          <Link to="/phcs" className="info-card">
            <span className="service-icon">📍</span>
            <h3>Local PHC Info</h3>
            <p>Find nearby primary health facilities.</p>
          </Link>
        </div>
      </section>

      {/* ===== Why Arogya Innovators ===== */}
      <section className="section why-section">
        <h2 className="section-title">Why Arogya Innovators?</h2>
        <div className="why-grid">
          <div className="why-item">✓ Telugu support</div>
          <div className="why-item">✓ Rural focused</div>
          <div className="why-item">✓ Secure</div>
          <div className="why-item">✓ AI assistance</div>
          <div className="why-item">✓ Simple interface</div>
        </div>
        <p className="muted small-text center-text">
          Arogya Sahayak is a health guidance helper — not a doctor. For serious or urgent
          conditions, always contact a health worker or call 108.
        </p>
      </section>
    </div>
  );
}