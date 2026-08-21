import { useState } from "react";
import { api } from "../api/client";
import { getStoredMember } from "../api/client";

const commonSymptoms = [
  "Fever",
  "Headache",
  "Cough",
  "Cold",
  "Stomach pain",
  "Vomiting",
  "Diarrhea",
  "Body pain",
  "Weakness",
  "Chest pain",
  "Breathing difficulty",
  "Dizziness"
];

export default function Symptoms() {
  const [selected, setSelected] = useState([]);
  const [symptomText, setSymptomText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const member = getStoredMember();
  const language = member?.preferredLanguage === "te" ? "te" : "en";

  const toggleSymptom = (symptom) => {
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        symptoms: selected,
        language
      };
      if (symptomText.trim()) {
        payload.symptomText = symptomText.trim();
      }

      const response = await api.post("/api/symptoms/assess", payload);
      setResult(response.data);
    } catch (err) {
      setError(err.message || "Assessment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const triageClass =
    result?.triage?.level === "EMERGENCY"
      ? "triage-emergency"
      : result?.triage?.level === "HIGH"
        ? "triage-high"
        : result?.triage?.level === "MEDIUM"
          ? "triage-medium"
          : "triage-low";

  return (
    <div className="page-container">
      <h2>🩺 Symptom Assessment</h2>
      <p className="muted">
        Select your symptoms and we will run a safe screening. This is not a medical diagnosis.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="symptom-grid">
          {commonSymptoms.map((symptom) => (
            <button
              type="button"
              key={symptom}
              className={`symptom-chip ${selected.includes(symptom) ? "selected" : ""}`}
              onClick={() => toggleSymptom(symptom)}
            >
              {symptom}
            </button>
          ))}
        </div>

        <div className="form-group margin-top">
          <label>Describe how you feel (optional)</label>
          <textarea
            value={symptomText}
            onChange={(e) => setSymptomText(e.target.value)}
            placeholder="e.g. fever since two days, mild headache..."
            rows={3}
            maxLength={2000}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || (selected.length === 0 && !symptomText.trim())}
        >
          {loading ? "Assessing..." : "Run Assessment"}
        </button>
      </form>

      {result && (
        <div className={`assessment-result ${triageClass}`}>
          <h3>
            Triage Level:{" "}
            <span className="triage-level">{result.triage.level}</span>
          </h3>
          <p>{result.assessment.recommendation}</p>
          {result.triage.reason && (
            <p className="muted small-text">{result.triage.reason}</p>
          )}

          {result.triage.level === "EMERGENCY" && (
            <div className="emergency-badge">
              ⚠️ This is an emergency. Call 108 or go to the nearest hospital immediately.
            </div>
          )}
          {result.triage.level === "HIGH" && (
            <div className="high-badge">
              Please seek medical care as soon as possible — visit your nearest PHC or doctor.
            </div>
          )}
        </div>
      )}
    </div>
  );
}