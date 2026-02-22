import React, { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTrackStore } from '../../store/useTrackStore';

/**
 * MapContainer - Renders the Leaflet map, vehicles, and geofences.
 */
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Vehicle Marker with CSS transition for smooth movement
const getVehicleIcon = (status, isPulsing) => {
    let color = '#9ca3af'; // idle
    if (status === 'in-progress') color = '#22c55e'; // green
    if (status === 'delayed') color = '#f59e0b'; // amber
    if (status === 'alert') color = '#ef4444'; // red

    return L.divIcon({
        className: 'custom-vehicle-icon',
        html: `
          <div class="relative flex items-center justify-center transition-all duration-1000 ease-linear">
            ${isPulsing ? `<div class="absolute w-8 h-8 rounded-full bg-red-400 animate-ping opacity-50"></div>` : ''}
            <div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); z-index: 10;"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

const MapContainer = () => {
  const { vehicles, geofences, selectedTripId, pulsingVehicles, playback, geofenceVisibility } = useTrackStore();
  const [mapCenter] = useState([12.9716, 77.5946]);

  const selectedVehicle = vehicles.find(v => v.tripId === selectedTripId);

  return (
    <div className="w-full h-full">
      <style>{`
        .leaflet-marker-icon.custom-vehicle-icon {
          transition: transform 1s linear !important;
        }
      `}</style>
      <LeafletMap center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Vehicle Markers */}
        {vehicles.map((vehicle) => (
          <Marker 
            key={vehicle.tripId} 
            position={vehicle.position}
            icon={getVehicleIcon(vehicle.status, pulsingVehicles.has(vehicle.tripId))}
          >
            <Popup>
              <div className="p-2 min-w-[120px]">
                <div className="font-bold border-b pb-1 mb-1 text-slate-800">{vehicle.driver}</div>
                <div className="text-[10px] text-gray-500 font-mono mb-1">{vehicle.tripId}</div>
                <div className="flex flex-col gap-0.5 mt-1">
                  <div className="text-xs flex justify-between"><span>Speed:</span> <span className="font-bold">{Math.round(vehicle.speed)} km/h</span></div>
                  <div className="text-xs flex justify-between"><span>ETA:</span> <span className="font-bold text-blue-600">{vehicle.eta}</span></div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Geofence Overlays */}
        {geofenceVisibility && geofences.map((fence) => (
          <Circle
            key={fence.id}
            center={fence.center}
            pathOptions={{ 
                fillColor: fence.color, 
                color: fence.color, 
                fillOpacity: 0.15,
                weight: 1.5,
                dashArray: fence.type === 'pickup' ? '5, 5' : ''
            }}
            radius={fence.radius}
          >
            <Popup>{fence.name} ({fence.type.toUpperCase()})</Popup>
          </Circle>
        ))}

        {/* Active Trip Visualization */}
        {selectedVehicle && (
          <>
            <Polyline 
              positions={selectedVehicle.route} 
              pathOptions={{ color: '#cbd5e1', weight: 3, dashArray: '8, 8' }} 
            />
            <Polyline 
              positions={selectedVehicle.completedRoute} 
              pathOptions={{ color: '#3b82f6', weight: 4 }} 
            />
            <MapAutoPan position={selectedVehicle.position} />
          </>
        )}

        {/* Playback Replay */}
        {playback.isPlaying && playback.tripId && (
          <PlaybackMarker tripId={playback.tripId} progress={playback.progress} vehicles={vehicles} />
        )}

        {/* Pickup Notifications */}
        {geofenceVisibility && geofences.filter(f => f.type === 'pickup').map((fence) => {
          const isOccupied = vehicles.some(v => calculateDistance(v.position, fence.center) < 0.001);
          if (!isOccupied) return null;

          return (
            <Marker 
              key={`notify-${fence.id}`} 
              position={fence.center}
              icon={L.divIcon({
                className: 'custom-notify-icon',
                html: `
                  <div class="bg-white px-3 py-2 rounded-lg shadow-2xl border-l-4 border-orange-500 flex items-center gap-2 animate-bounce whitespace-nowrap" style="transform: translate(-50%, -140%);">
                    <div class="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
                    <div class="flex flex-col">
                      <span class="text-[9px] text-gray-400 uppercase font-black">Arrival Notice</span>
                      <span class="text-[11px] font-bold text-slate-700">Cab arrived for ${fence.employee}</span>
                    </div>
                  </div>
                `,
                iconSize: [0, 0],
              })}
            />
          );
        })}
      </LeafletMap>
    </div>
  );
};

function calculateDistance(p1, p2) {
  if (!p1 || !p2) return 999;
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}

function PlaybackMarker({ tripId, progress, vehicles }) {
  const vehicle = vehicles.find(v => v.tripId === tripId);
  if (!vehicle) return null;

  const routeScale = (vehicle.route.length - 1) * (progress / 100);
  const index = Math.floor(routeScale);
  const remainder = routeScale - index;
  
  if (index >= vehicle.route.length - 1) return (
    <Marker position={vehicle.route[vehicle.route.length - 1]} icon={getVehicleIcon('idle', false)} />
  );

  const p1 = vehicle.route[index];
  const p2 = vehicle.route[index + 1];
  
  const currentPos = [
    p1[0] + (p2[0] - p1[0]) * remainder,
    p1[1] + (p2[1] - p1[1]) * remainder
  ];

  return (
    <Marker position={currentPos} icon={getVehicleIcon('in-progress', true)}>
      <Popup>Playback: {tripId}</Popup>
    </Marker>
  );
}

function MapAutoPan({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.panTo(position, { animate: true });
        }
    }, [position, map]);
    return null;
}

export default MapContainer;
