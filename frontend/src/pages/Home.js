import React, { useState } from "react";
import TripForm from "../components/TripForm";
import ELDDashboard from "../components/ELDDashboard";
import MapView from "../components/MapView";

export default function Home() {
  const [result, setResult] = useState(null);

  return (
    <div className="container">
      <header style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", background: "linear-gradient(to right, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          HOS + ELD Simulator
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Advanced Hours of Service & Electronic Logging Device Logistics Simulation
        </p>
      </header>

      <main className="grid">
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <TripForm setResult={setResult} />
          {result && <MapView route={result.route} />}
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
