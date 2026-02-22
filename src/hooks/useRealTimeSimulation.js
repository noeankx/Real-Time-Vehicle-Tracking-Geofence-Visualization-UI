import { useEffect, useRef } from 'react';
import { useTrackStore } from '../store/useTrackStore';
import { MOCK_VEHICLES, MOCK_GEOFENCES } from '../assets/data/mockData';

/**
 * useRealTimeSimulation - Simulates real-time vehicle movements and geofence events.
 */
export function useRealTimeSimulation() {
  const setVehicles = useTrackStore((state) => state.setVehicles);
  const setGeofences = useTrackStore((state) => state.setGeofences);
  const updateVehiclePosition = useTrackStore((state) => state.updateVehiclePosition);
  const addAlert = useTrackStore((state) => state.addAlert);
  const playback = useTrackStore((state) => state.playback);
  const updatePlayback = useTrackStore((state) => state.updatePlayback);
  
  const simulationRef = useRef(null);
  const playbackRef = useRef(null);

  useEffect(() => {
    setVehicles(MOCK_VEHICLES);
    setGeofences(MOCK_GEOFENCES);

    simulationRef.current = setInterval(() => {
      const vehicles = useTrackStore.getState().vehicles;
      
      vehicles.forEach((vehicle) => {
        const currentIdx = Math.max(0, vehicle.completedRoute.length - 1);
        const targetIdx = currentIdx + 1;
        
        if (targetIdx < vehicle.route.length) {
          const nextPoint = vehicle.route[targetIdx];
          
          // Smooth simulation step
          const newLat = vehicle.position[0] + (nextPoint[0] - vehicle.position[0]) * 0.15;
          const newLng = vehicle.position[1] + (nextPoint[1] - vehicle.position[1]) * 0.15;
          const newPosition = [newLat, newLng];

          // Check if vehicle has reached the target point (threshold)
          const distToTarget = calculateDistance(newPosition, nextPoint);
          let updatedCompletedRoute = [...vehicle.completedRoute];
          if (distToTarget < 0.0001) {
            updatedCompletedRoute.push(nextPoint);
          }

          // Geofence status tracking
          let insideOffice = false;
          let approachingPickup = false;

          MOCK_GEOFENCES.forEach((fence) => {
            const distance = calculateDistance(newPosition, fence.center);
            const radiusScale = fence.radius / 111320; // Approx meters to degrees

            if (distance < radiusScale) {
              if (fence.type === 'office') {
                insideOffice = true;
                addAlert({
                  type: 'GEOFENCE_OFFICE',
                  message: `Vehicle ${vehicle.tripId} entered Office: ${fence.name}`,
                  vehicleId: vehicle.tripId,
                });
              } else if (fence.type === 'pickup') {
                addAlert({
                  type: 'GEOFENCE_PICKUP',
                  message: `Cab arrived for ${fence.employee}`,
                  vehicleId: vehicle.tripId,
                });
              }
            } else if (fence.type === 'pickup' && distance < radiusScale * 5) {
              approachingPickup = true;
            }
          });

          updateVehiclePosition(vehicle.tripId, { 
            position: newPosition,
            completedRoute: updatedCompletedRoute,
            insideOffice,
            approachingPickup
          });
        }
      });
    }, 1000); // Faster update for smoother feel

    return () => clearInterval(simulationRef.current);
  }, []);

  useEffect(() => {
    if (playback.isPlaying && playback.tripId) {
      playbackRef.current = setInterval(() => {
        const currentPlayback = useTrackStore.getState().playback;
        const vehicles = useTrackStore.getState().vehicles;
        const vehicle = vehicles.find(v => v.tripId === currentPlayback.tripId);
        
        if (vehicle && currentPlayback.progress < 100) {
          const newProgress = Math.min(100, currentPlayback.progress + (1 * currentPlayback.speed));
          updatePlayback({ progress: newProgress });
        } else if (currentPlayback.progress >= 100) {
          updatePlayback({ isPlaying: false });
        }
      }, 500);
    } else {
      clearInterval(playbackRef.current);
    }

    return () => clearInterval(playbackRef.current);
  }, [playback.isPlaying, playback.tripId, playback.speed]);
}

function calculateDistance(p1, p2) {
  if (!p1 || !p2) return 999;
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}
