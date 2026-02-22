import React from 'react';
import Sidebar from './components/SidePanel/Sidebar';
import MapContainer from './components/Map/MapContainer';
import AlertTicker from './components/SidePanel/AlertTicker';
import { useRealTimeSimulation } from './hooks/useRealTimeSimulation';

/**
 * Main Application Component
 * This component sets up the layout and initializes the real-time simulation.
 */
function App() {
  // Initialize our mock location/status simulation
  useRealTimeSimulation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 flex-col">
      {/* Real-time Alert Feed at the top */}
      <AlertTicker />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation/Filtering Sidebar */}
        <Sidebar />
        
        {/* Core Map Interface */}
        <main className="flex-1 relative">
          <MapContainer />
        </main>
      </div>
    </div>
  );
}

export default App;
