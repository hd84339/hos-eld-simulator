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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await planTrip(form);
      setResult(res.data);
    } catch (error) {
      console.error("Failed to plan trip:", error);
      const msg = error.response?.data?.error || error.response?.data?.message || "Error planning trip. Please check your inputs.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <h2 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px" }}>
        <span>📍</span> Plan New Trip
      </h2>

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
          style={{ marginTop: "0.5rem", background: loading ? "var(--text-muted)" : "var(--primary)" }}
        >
          {loading ? "Calculating Route..." : "Optimize & Plan Trip"}
        </button>
      </div>
    </div>
  );
}
