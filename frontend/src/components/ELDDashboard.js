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

  const getLogBorderColor = (status) => {
    switch(status.toUpperCase()) {
      case 'DRIVING': return 'var(--primary)';
      case 'ON_DUTY': return 'var(--warning)';
      case 'OFF_DUTY': return 'var(--text-muted)';
      case 'SLEEPER': return '#8b5cf6'; // purple
      default: return 'var(--text-muted)';
    }
  };

  // Group logs by day
  const logsByDay = data.hos.eld_log ? data.hos.eld_log.reduce((acc, log) => {
    if (!acc[log.day]) acc[log.day] = [];
    acc[log.day].push(log);
    return acc;
  }, {}) : {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0 }}>📊 Compliance Dashboard</h2>
          <span className={`status-badge ${getStatusClass(data.hos.status)}`}>
            {data.hos.status.toUpperCase()}
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
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>Estimated Driving Time</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.25rem", fontWeight: "600" }}>{data.route?.estimated_hours || "0"} hrs</p>
          </div>
        </div>

        {data.hos.status === "violation" ? (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "#f87171", padding: "1rem", borderRadius: "0.75rem", marginBottom: "1.5rem" }}>
            <strong>🚫 Violation Detected:</strong> {data.hos.message}
            {data.hos.violation_type && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.875rem", fontFamily: "monospace", opacity: 0.8 }}>
                Code: {data.hos.violation_type}
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid var(--success)", color: "#4ade80", padding: "1rem", borderRadius: "0.75rem", marginBottom: "1.5rem" }}>
            <strong>✅ Compliant:</strong> Trip approved under FMCSA HOS regulations.
          </div>
        )}

        {data.hos.rules_enforced && data.hos.rules_enforced.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", color: "var(--warning)" }}>⚠️ Required Rests Scheduled</h3>
            <ul style={{ margin: 0, paddingLeft: "1.5rem", fontSize: "0.9rem", color: "var(--text-main)" }}>
              {data.hos.rules_enforced.map((rule, idx) => (
                <li key={idx} style={{ marginBottom: "0.25rem" }}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        <h3 style={{ fontSize: "1.125rem", marginBottom: "1rem", color: "var(--text-muted)" }}>ELD Activity Logs (Simulated)</h3>
        
        {Object.keys(logsByDay).map(day => (
          <div key={day} style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.25rem" }}>
              Day {day}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {logsByDay[day].map((entry, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "0.5rem",
                  borderLeft: `4px solid ${getLogBorderColor(entry.status)}`
                }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <strong style={{ fontSize: "0.95rem" }}>{entry.status}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{entry.note || "HOS Event"}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{entry.start.toFixed(2)} → {entry.end.toFixed(2)}</span>
                    <span style={{ fontSize: "0.75rem", marginLeft: "4px", color: "var(--text-muted)" }}>hrs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
