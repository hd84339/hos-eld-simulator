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
        
        {Object.keys(logsByDay).map(day => {
          const statuses = ['OFF_DUTY', 'SLEEPER', 'DRIVING', 'ON_DUTY'];
          const statusLabels = ['OFF', 'SB', 'DRV', 'ON'];
          
          return (
            <div key={day} style={{ marginBottom: "2.5rem" }}>
              <h4 style={{ fontSize: "1rem", color: "var(--text-main)", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                Day {day} Timeline
              </h4>
              
              <div style={{ display: "flex", position: "relative", height: "160px", backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: "0.5rem", overflow: "hidden" }}>
                
                {/* Y-Axis Labels */}
                <div style={{ width: "50px", display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                  {statusLabels.map((lbl, idx) => (
                    <div key={idx} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", borderBottom: idx < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      {lbl}
                    </div>
                  ))}
                </div>

                {/* Grid Area */}
                <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
                  
                  {/* Background Grid Lines (24 hours) */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", pointerEvents: "none" }}>
                    {[...Array(24)].map((_, i) => (
                      <div key={i} style={{ flex: 1, borderRight: "1px dashed rgba(255,255,255,0.05)", position: "relative" }}>
                        <span style={{ position: "absolute", bottom: "4px", left: "2px", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)" }}>{i}</span>
                      </div>
                    ))}
                  </div>

                  {/* 4 Rows for Blocks */}
                  {statuses.map((statusRow, rowIdx) => (
                    <div key={rowIdx} style={{ flex: 1, position: "relative", borderBottom: rowIdx < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      {logsByDay[day].filter(l => l.status === statusRow).map((entry, i) => {
                        const leftPercent = (entry.start / 24) * 100;
                        const widthPercent = ((entry.end - entry.start) / 24) * 100;
                        return (
                          <div 
                            key={i} 
                            title={`${entry.status}: ${entry.start.toFixed(2)} - ${entry.end.toFixed(2)} hrs (${entry.note})`}
                            style={{
                              position: "absolute",
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                              top: "20%",
                              height: "60%",
                              backgroundColor: getLogBorderColor(entry.status),
                              borderRadius: "2px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                              cursor: "pointer",
                              opacity: 0.9,
                              transition: "opacity 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                            onMouseLeave={e => e.currentTarget.style.opacity = 0.9}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Fallback details list below grid for accessibility/readability */}
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.5rem" }}>
                {logsByDay[day].map((entry, i) => (
                  <div key={i} style={{ fontSize: "0.75rem", padding: "0.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "4px", borderLeft: `3px solid ${getLogBorderColor(entry.status)}` }}>
                    <strong>{entry.status}</strong><br/>
                    <span style={{ color: "var(--text-muted)" }}>{entry.start.toFixed(1)} - {entry.end.toFixed(1)}h</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
