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
export default function MapView({ route }) {
  if (!route || !route.path) return null;

  const path = route.path;
  const center = path[0];

  return (
    <div className="glass-card" style={{ padding: "0.5rem", height: "450px" }}>
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
      >
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline positions={path} color="blue" />

        <Marker position={path[0]}>
          <Popup>Start</Popup>
        </Marker>

        <Marker position={path[path.length - 1]}>
          <Popup>End</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}