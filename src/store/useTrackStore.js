import { create } from 'zustand';

/**
 * useTrackStore - Central state management for the Vehicle Tracking System.
 */
export const useTrackStore = create((set) => ({
  // List of all active vehicles being tracked
  vehicles: [],
  
  // Geofences defined in the system
  geofences: [],
  geofenceVisibility: true,
  
  // Real-time alerts feed (newest first)
  alerts: [],
  
  // Currently selected trip for detailed view
  selectedTripId: null,

  // Historical playback state
  playback: {
    tripId: null,
    isPlaying: false,
    speed: 1,
    progress: 0,
  },

  activeTab: 'live',

  // Global search/filter criteria
  filters: {
    search: '',
    status: 'all',
    region: 'all',
    office: 'all',
  },

  pulsingVehicles: new Set(),

  // Actions
  setVehicles: (vehicles) => set({ vehicles }),
  
  updateVehiclePosition: (tripId, data) => set((state) => ({
    vehicles: state.vehicles.map(v => 
      v.tripId === tripId ? { ...v, ...data } : v
    )
  })),

  setGeofences: (geofences) => set({ geofences }),
  toggleGeofenceVisibility: () => set((state) => ({ 
    geofenceVisibility: !state.geofenceVisibility 
  })),

  addAlert: (alert) => set((state) => {
    // Basic deduplication
    const isDuplicate = state.alerts.some(a => 
      a.message === alert.message && (Date.now() - a.id < 10000)
    );
    if (isDuplicate) return state;

    const newPulsing = new Set(state.pulsingVehicles);
    if (alert.vehicleId) {
      newPulsing.add(alert.vehicleId);
      setTimeout(() => {
        set((s) => {
          const s2 = new Set(s.pulsingVehicles);
          s2.delete(alert.vehicleId);
          return { pulsingVehicles: s2 };
        });
      }, 5000);
    }

    return {
      pulsingVehicles: newPulsing,
      alerts: [
        { id: Date.now(), timestamp: new Date(), ...alert },
        ...state.alerts
      ].slice(0, 50)
    };
  }),

  setSelectedTrip: (tripId) => set({ selectedTripId: tripId }),

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  startPlayback: (tripId) => set((state) => ({
    playback: { ...state.playback, tripId, isPlaying: true, progress: 0 }
  })),

  stopPlayback: () => set((state) => ({
    playback: { ...state.playback, isPlaying: false }
  })),

  updatePlayback: (update) => set((state) => ({
    playback: { ...state.playback, ...update }
  })),
}));
