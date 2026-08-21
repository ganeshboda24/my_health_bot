import { useEffect, useState } from "react";
import { api, getStoredMember, setStoredMember } from "../api/client";

export default function Profile() {
  const [member, setMember] = useState(getStoredMember());
  const [form, setForm] = useState({
    name: "",
    preferredLanguage: "en",
    age: "",
    gender: ""
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || "",
        preferredLanguage: member.preferredLanguage || "en",
        age: member.age ?? "",
        gender: member.gender || ""
      });
    }
  }, [member]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        preferredLanguage: form.preferredLanguage
      };
      if (form.age !== "") payload.age = Number(form.age);
      if (form.gender) payload.gender = form.gender;

      const result = await api.put("/api/members/profile", payload);
      setStoredMember(result.data.member);
      setMember(result.data.member);
      setSaved(true);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!member) {
    return <div className="page-container">Please log in to view your profile.</div>;
  }

  return (
    <div className="page-container">
      <h2>👤 My Profile</h2>

      <div className="profile-card">
        <p>
          <strong>Phone:</strong> {member.phone}
        </p>
        <p>
          <strong>Role:</strong> {member.role}
        </p>
        <p>
          <strong>Member ID:</strong> {member._id}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Preferred language</label>
          <select
            name="preferredLanguage"
            value={form.preferredLanguage}
            onChange={handleChange}
          >
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              min="0"
              max="120"
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Not specified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}
        {saved && <p className="success-text">Profile updated successfully.</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}