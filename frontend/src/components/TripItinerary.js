import React from "react";

const StopItem = ({ icon, label, location, type }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.5rem 0" }}>
    <div style={{ 
      width: "24px", 
      height: "24px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      fontSize: "1rem",
      zIndex: 1
    }}>
      {icon}
    </div>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: "0.95rem", color: "var(--text-main)", fontWeight: "500" }}>{location}</span>
    </div>
  </div>
);

export default function TripItinerary({ data }) {
  if (!data) return null;

  return (
    <div className="glass-card">
      <h3 style={{ fontSize: "1.125rem", marginBottom: "1.25rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        📍 Trip Itinerary
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", position: "relative", paddingLeft: "1.25rem" }}>
        {/* Vertical Line Connector */}
        <div style={{ position: "absolute", left: "6px", top: "10px", bottom: "10px", width: "2px", background: "linear-gradient(to bottom, var(--primary), var(--accent))", opacity: 0.3 }}></div>

        {/* Start / Pickup */}
        <StopItem 
          icon="📍" 
          label="Start / Pickup" 
          location={data.route?.waypoints?.pickup_name || "Pickup Point"} 
          type="pickup"
        />

        {/* Dynamic Stops */}
        {data.stops && data.stops.map((stop, idx) => (
          <StopItem 
            key={idx}
            icon={stop.type === 'fuel' ? "⛽" : "😴"} 
            label={stop.label} 
            location={stop.place_name || "Unknown Location"} 
            type={stop.type}
          />
        ))}

        {/* Destination */}
        <StopItem 
          icon="🏁" 
          label="Destination" 
          location={data.route?.waypoints?.dropoff_name || "Dropoff Point"} 
          type="dropoff"
        />
      </div>
    </div>
  );
}
