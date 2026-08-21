import { useState } from "react";
import { api } from "../api/client";

export default function PhcSearch() {
  const [district, setDistrict] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (district.trim()) params.set("district", district.trim());

      const query = params.toString() ? `?${params.toString()}` : "";
      const result = await api.get(`/api/phcs${query}`);
      setResults(result);
    } catch (err) {
      setError(err.message || "Failed to search PHCs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>🏥 PHC Search</h2>
      <p className="muted">
        Search for Primary Health Centres by district.
      </p>

      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label>District</label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="e.g. West Godavari"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {results && (
        <>
          <p className="margin-top">
            Found <strong>{results.count}</strong> facility/ies.
          </p>
          {results.count === 0 ? (
            <div className="empty-state">
              <p>No facilities matched your filters.</p>
            </div>
          ) : (
            <div className="phc-list">
              {results.data.map((phc, idx) => (
                <div key={idx} className="phc-card">
                  <h3>{phc.name}</h3>
                  <p>
                    <strong>Type:</strong> {phc.type}
                  </p>
                  <p>
                    <strong>District:</strong> {phc.district}
                  </p>
                  {phc.mandal && (
                    <p>
                      <strong>Mandal:</strong> {phc.mandal}
                    </p>
                  )}
                  {phc.phone && (
                    <p>
                      <strong>Phone:</strong> {phc.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="muted small-text">
            ⚠️ Note: {results.note}
          </p>
        </>
      )}
    </div>
  );
}