import React from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
export default function MapView({ route, stops = [] }) {
  if (!route || !route.path) return null;

  const path = route.path;
  const center = path[0];

  const createEmojiIcon = (emoji, bgColor) => {
    return L.divIcon({
      html: `<div style="background-color: ${bgColor}; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.5); border: 2px solid white;">${emoji}</div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  const restIcon = createEmojiIcon('😴', '#8b5cf6'); // purple
  const fuelIcon = createEmojiIcon('⛽', '#f59e0b'); // amber

  return (
    <div className="glass-card" style={{ padding: "0.5rem", height: "450px" }}>
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline positions={path} color="#3b82f6" weight={4} opacity={0.8} />

        {route.waypoints && (
          <>
            <Marker position={[route.waypoints.current[0], route.waypoints.current[1]]}>
              <Popup><strong>Current Location</strong></Popup>
            </Marker>
            
            <Marker position={[route.waypoints.pickup[0], route.waypoints.pickup[1]]}>
              <Popup><strong>Pickup Point</strong></Popup>
            </Marker>

            <Marker position={[route.waypoints.dropoff[0], route.waypoints.dropoff[1]]}>
              <Popup><strong>Dropoff Point</strong></Popup>
            </Marker>
          </>
        )}

        {stops && stops.map((stop, idx) => (
          <Marker 
            key={idx} 
            position={[stop.location[0], stop.location[1]]} 
            icon={stop.type === 'rest' ? restIcon : fuelIcon}
          >
            <Popup>
              <div style={{ textAlign: "center" }}>
                <strong>{stop.type === 'rest' ? '😴 Rest Stop' : '⛽ Fuel Stop'}</strong>
                <p style={{ margin: "4px 0 0 0" }}>{stop.label}</p>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
}