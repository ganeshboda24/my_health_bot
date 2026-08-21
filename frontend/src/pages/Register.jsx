import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken, setStoredMember } from "../api/client";

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.post("/api/auth/register", {
        name,
        phone,
        password,
        preferredLanguage
      });
      setToken(result.data.token);
      setStoredMember(result.data.member);
      navigate("/chat");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🩺 Arogya Sahayak</h1>
        <p className="subtitle">Create your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              minLength="2"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              pattern="[6-9][0-9]{9}"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label>Preferred language (మీ భాష)</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-alt">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}