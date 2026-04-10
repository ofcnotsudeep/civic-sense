import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SEVERITY_COLOR, TYPE_ICON, STATUS_LABEL } from '../utils/helpers.js';

// Fix leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createMarkerIcon = (incident) => {
  const color = SEVERITY_COLOR(incident.severity);
  const icon = TYPE_ICON[incident.type] || '⚠️';
  const size = incident.severity >= 8 ? 44 : incident.severity >= 5 ? 38 : 32;
  const pulse = incident.severity >= 9;

  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse ? `
          <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.3;animation:pulse-ring 1.5s ease-out infinite;"></div>
          <div style="position:absolute;inset:4px;border-radius:50%;background:${color};opacity:0.2;animation:pulse-ring 1.5s ease-out infinite 0.4s;"></div>
        ` : ''}
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color}22;
          border:2px solid ${color};
          display:flex;align-items:center;justify-content:center;
          font-size:${size * 0.45}px;
          backdrop-filter:blur(4px);
        ">${icon}</div>
      </div>
    `
  });
};

export default function MapView({ incidents, selectedId, onSelectIncident }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (mapInstanceRef.current) return;
    mapInstanceRef.current = L.map(mapRef.current, {
      center: [28.6139, 77.2090],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    incidents.forEach(incident => {
      const marker = L.marker(
        [incident.latitude, incident.longitude],
        { icon: createMarkerIcon(incident) }
      );

      const popup = L.popup({ closeButton: false, maxWidth: 260 }).setContent(`
        <div style="font-family:'DM Sans',sans-serif;padding:8px 2px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:22px;">${TYPE_ICON[incident.type] || '⚠️'}</span>
            <div>
              <div style="font-weight:600;font-size:13px;color:var(--text);text-transform:capitalize;">${incident.type}</div>
              <div style="font-size:11px;color:${SEVERITY_COLOR(incident.severity)};font-family:'Space Mono',monospace;font-weight:700;">SEV ${incident.severity}/10 · ${STATUS_LABEL[incident.status] || incident.status}</div>
            </div>
          </div>
          <div style="font-size:12px;color:#8892a4;margin-bottom:6px;line-height:1.5;">${incident.summary}</div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#4f5b70;border-top:1px solid #1e2535;padding-top:6px;margin-top:6px;">
            <span>→ ${incident.department}</span>
            <span>${incident.estimated_hours}h est.</span>
          </div>
        </div>
      `);

      marker.bindPopup(popup);
      marker.on('click', () => onSelectIncident && onSelectIncident(incident));
      marker.addTo(map);
      markersRef.current[incident.id] = marker;
    });
  }, [incidents]);

  // Pan to selected
  useEffect(() => {
    if (!selectedId || !mapInstanceRef.current) return;
    const incident = incidents.find(i => i.id === selectedId);
    if (incident) {
      mapInstanceRef.current.setView([incident.latitude, incident.longitude], 14, { animate: true });
      markersRef.current[selectedId]?.openPopup();
    }
  }, [selectedId]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 0 }} />
  );
}
