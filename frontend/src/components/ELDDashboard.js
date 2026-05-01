import React from "react";

export default function ELDDashboard({ data }) {
  if (!data) return (
    <div className="glass-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", color: "var(--text-muted)" }}>
      <p>Enter trip details to generate ELD logs and compliance status.</p>
    </div>
  );

  const getStatusClass = (status) => {
    const s = status.toLowerCase();
    if (s.includes("safe") || s.includes("compliant") || s.includes("approved")) return "status-safe";
    if (s.includes("warning") || s.includes("violation")) return "status-danger";
    return "status-warning";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0 }}>📊 Compliance Dashboard</h2>
          <span className={`status-badge ${getStatusClass(data.hos.status)}`}>
            {data.hos.status}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid var(--border)" }}>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>Total Distance</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.25rem", fontWeight: "600" }}>
              {data.route?.distance_km ? (data.route.distance_km * 0.621371).toFixed(1) : "0"} miles
            </p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid var(--border)" }}>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>Estimated Time</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.25rem", fontWeight: "600" }}>{data.route?.estimated_hours || "0"} hrs</p>
          </div>
        </div>

        {data.hos.status === "violation" ? (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "#f87171", padding: "1rem", borderRadius: "0.75rem", marginBottom: "1.5rem" }}>
            <strong>🚫 Violation Detected:</strong> {data.hos.message}
          </div>
        ) : (
          <div style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid var(--success)", color: "#4ade80", padding: "1rem", borderRadius: "0.75rem", marginBottom: "1.5rem" }}>
            <strong>✅ Compliant:</strong> Trip approved under FMCSA HOS regulations.
          </div>
        )}

        <h3 style={{ fontSize: "1.125rem", marginBottom: "1rem", color: "var(--text-muted)" }}>ELD Activity Logs</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {data.eld_log.map((entry, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "0.5rem",
              borderLeft: `4px solid ${entry.status.toUpperCase() === 'DRIVING' ? 'var(--primary)' : 'var(--warning)'}`
            }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <strong style={{ fontSize: "0.95rem" }}>{entry.status}</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>HOS Regulation Event</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontWeight: "600", color: "var(--primary)" }}>{entry.start} → {entry.end}</span>
                <span style={{ fontSize: "0.75rem", marginLeft: "4px", color: "var(--text-muted)" }}>hrs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
