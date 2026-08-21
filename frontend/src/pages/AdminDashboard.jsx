import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await api.get("/api/admin/stats");
        setStats(result);
      } catch (err) {
        setError(err.message || "Failed to load admin statistics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="page-container">Loading admin dashboard...</div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <h2>Admin Dashboard</h2>
        <p className="error-text">{error}</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Members", value: stats.stats.totalMembers },
    { label: "Total Assessments", value: stats.stats.totalAssessments },
    { label: "Emergency Cases", value: stats.stats.emergencyCases },
    { label: "Chat Sessions", value: stats.stats.totalChatSessions }
  ];

  return (
    <div className="page-container">
      <h2>📊 Admin Dashboard</h2>
      <p className="muted">System-wide statistics (admin only)</p>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <h3 className="margin-top">Recent Assessments</h3>
      {stats.recentAssessments.length === 0 ? (
        <div className="empty-state">
          <p>No assessments yet.</p>
        </div>
      ) : (
        <div className="assessment-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Symptoms</th>
                <th>Triage</th>
                <th>Language</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentAssessments.map((assessment) => (
                <tr key={assessment._id}>
                  <td>{new Date(assessment.createdAt).toLocaleString()}</td>
                  <td>{assessment.symptoms.join(", ")}</td>
                  <td>
                    <span
                      className={`status-badge status-${assessment.triageLevel.toLowerCase()}`}
                    >
                      {assessment.triageLevel}
                    </span>
                  </td>
                  <td>{assessment.language === "te" ? "తెలుగు" : "English"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}