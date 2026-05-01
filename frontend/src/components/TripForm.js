import React, { useState } from "react";
import { planTrip } from "../api/api";

export default function TripForm({ setResult }) {
  const [form, setForm] = useState({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    cycle_used: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const submit = async () => {
    if (!form.current_location || !form.pickup_location || !form.dropoff_location) {
      setError("Please fill in all locations.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        cycle_used: form.cycle_used === "" ? 0 : Number(form.cycle_used)
      };
      const res = await planTrip(payload);
      setResult(res.data);
    } catch (err) {
      console.error("Failed to plan trip:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || "Error planning trip. Please check your inputs.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <h2 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px" }}>
        <span>📍</span> Plan New Trip
      </h2>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "#f87171", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1rem", fontSize: "0.875rem" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="form-group">
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>Current Location</label>
          <input 
            name="current_location" 
            value={form.current_location}
            onChange={handleChange} 
            placeholder="e.g. New York, NY" 
          />
        </div>

        <div className="form-group">
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>Pickup Point</label>
          <input 
            name="pickup_location" 
            value={form.pickup_location}
            onChange={handleChange} 
            placeholder="e.g. Chicago, IL" 
          />
        </div>

        <div className="form-group">
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>Dropoff Point</label>
          <input 
            name="dropoff_location" 
            value={form.dropoff_location}
            onChange={handleChange} 
            placeholder="e.g. Los Angeles, CA" 
          />
        </div>

        <div className="form-group">
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>Cycle Hours Used</label>
          <input 
            name="cycle_used" 
            type="number" 
            value={form.cycle_used}
            onChange={handleChange} 
            placeholder="0"
          />
        </div>

        <button 
          onClick={submit} 
          disabled={loading}
          style={{ 
            marginTop: "0.5rem", 
            background: loading ? "var(--text-muted)" : "var(--primary)",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "⏳ Calculating Route & Rules..." : "Optimize & Plan Trip"}
        </button>
      </div>
    </div>
  );
}

