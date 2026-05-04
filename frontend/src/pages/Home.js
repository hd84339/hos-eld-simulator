import React, { useState } from "react";
import TripForm from "../components/TripForm";
import ELDDashboard from "../components/ELDDashboard";
import MapView from "../components/MapView";
import TripItinerary from "../components/TripItinerary";

export default function Home() {
  const [result, setResult] = useState(null);

  return (
    <div className="container">
      <header style={{ marginBottom: "4rem", textAlign: "center", animation: "fadeIn 0.8s ease-out" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", background: "rgba(99, 102, 241, 0.1)", borderRadius: "2rem", border: "1px solid rgba(99, 102, 241, 0.2)", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>FMCSA Compliant Engine</span>
        </div>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem", background: "linear-gradient(135deg, #fff 0%, var(--accent) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: "1.1" }}>
          HOS + ELD Simulator
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.25rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          The professional standard for high-fidelity Hours of Service & Electronic Logging Device logistics simulation.
        </p>
      </header>

      <main className="grid">
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <TripForm setResult={setResult} />
          {result && (
            <>
              <MapView route={result.route} stops={result.stops} />
              <TripItinerary data={result} />
            </>
          )}
        </div>

        <div>
            
          <ELDDashboard data={result} />
        </div>
      </main>

      <footer style={{ marginTop: "4rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem", borderTop: "1px solid var(--border)", paddingTop: "2rem" }}>
        <p>&copy; 2024 Logistics Optimizer. All rights reserved. FMCSA Compliance Simulation Ready.</p>
      </footer>
    </div>
  );
}
