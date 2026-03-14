"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths for Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Activity {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description?: string;
  image?: string;
  rating?: number;
  duration?: number;
}

interface ActivityMapProps {
  activities: Activity[];
  center: [number, number];
  onHover: (activity: Activity) => void;
  onLeave: () => void;
}

// Category-based marker colors
const categoryColors: Record<string, string> = {
  culture: "#6366f1",     // indigo
  beach: "#06b6d4",       // cyan
  restaurant: "#f59e0b",  // amber
  museum: "#8b5cf6",      // violet
  adventure: "#ef4444",   // red
  nightlife: "#ec4899",   // pink
  shopping: "#10b981",    // emerald
  nature: "#22c55e",      // green
  wellness: "#14b8a6",    // teal
};

function createCategoryIcon(category: string): L.DivIcon {
  const color = categoryColors[category] || "#6366f1";
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        background: ${color};
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function ActivityMap({ activities, center, onHover, onLeave }: ActivityMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      
      {activities.map((activity) => {
        if (!activity.lat || !activity.lng) return null;
        return (
          <Marker
            key={activity.id}
            position={[activity.lat, activity.lng]}
            icon={createCategoryIcon(activity.category)}
            eventHandlers={{
              mouseover: () => onHover(activity),
              mouseout: () => onLeave(),
            }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong>{activity.name}</strong>
                {activity.description && (
                  <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {activity.description.slice(0, 100)}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
