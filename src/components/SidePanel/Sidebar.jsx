import React from 'react';
import { useTrackStore } from '../../store/useTrackStore';
import { Filter, Car, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Sidebar - Command Center for trip monitoring and filtering.
 */
const Sidebar = () => {
  const { 
    vehicles, filters, setFilters, selectedTripId, setSelectedTrip, 
    activeTab, playback, startPlayback, stopPlayback, updatePlayback,
    geofenceVisibility, toggleGeofenceVisibility 
  } = useTrackStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = (v.driver || '').toLowerCase().includes(filters.search.toLowerCase()) || 
                          (v.tripId || '').toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || v.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'in-progress').length,
    insideOffice: vehicles.filter(v => v.insideOffice).length,
    approaching: vehicles.filter(v => v.approachingPickup).length,
  };

  return (
    <aside 
      className={twMerge(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col relative z-20 shadow-md",
        isCollapsed ? "w-0 overflow-hidden" : "w-80"
      )}
    >
      {/* Header & Stats */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Car className="text-blue-600" size={20} />
          Command Center
        </h2>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Total</div>
            <div className="text-xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="text-[10px] text-green-600 uppercase font-semibold">Active</div>
            <div className="text-xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="text-[10px] text-blue-600 uppercase font-semibold">In Office</div>
            <div className="text-xl font-bold text-blue-600">{stats.insideOffice}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="text-[10px] text-orange-600 uppercase font-semibold">Approaching</div>
            <div className="text-xl font-bold text-orange-600">{stats.approaching}</div>
          </div>
        </div>
      </div>

      {/* Filters & Toggles */}
      <div className="p-4 space-y-3 border-b border-gray-100">
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Search Driver or Trip ID..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>
        
        <div className="flex flex-wrap gap-1.5 font-sans">
          {['all', 'in-progress', 'delayed', 'alert'].map((status) => (
            <button
              key={status}
              onClick={() => setFilters({ status })}
              className={clsx(
                "px-2.5 py-1 rounded-md text-[10px] uppercase font-bold border transition-all",
                filters.status === status 
                  ? "bg-gray-800 border-gray-800 text-white" 
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <button 
          onClick={toggleGeofenceVisibility}
          className={clsx(
            "w-full py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all",
            geofenceVisibility 
              ? "bg-blue-50 border-blue-200 text-blue-600" 
              : "bg-gray-50 border-gray-200 text-gray-500"
          )}
        >
          <MapPin size={12} />
          {geofenceVisibility ? 'Hide Geofences' : 'Show Geofences'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex px-2 pt-2">
          <button 
            onClick={() => useTrackStore.setState({ activeTab: 'live' })}
            className={twMerge(
              "flex-1 py-2 text-[10px] font-bold uppercase transition-all border-b-2",
              activeTab === 'live' ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent"
            )}
          >
            Monitor
          </button>
          <button 
            onClick={() => useTrackStore.setState({ activeTab: 'playback' })}
            className={twMerge(
              "flex-1 py-2 text-[10px] font-bold uppercase transition-all border-b-2",
              activeTab === 'playback' ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent"
            )}
          >
            History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeTab === 'live' ? (
            filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <div 
                  key={vehicle.tripId}
                  onClick={() => setSelectedTrip(vehicle.tripId)}
                  className={clsx(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    selectedTripId === vehicle.tripId 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-50 hover:bg-gray-50"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-blue-600 font-mono">{vehicle.tripId}</span>
                    <span className={clsx(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                      vehicle.status === 'in-progress' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="font-bold text-gray-800 text-sm mb-2">{vehicle.driver}</div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500 border-t border-gray-100 pt-2">
                    <span className="flex items-center gap-1"><Clock size={10}/> {vehicle.eta}</span>
                    <span className="flex items-center gap-1"><MapPin size={10}/> {Math.round(vehicle.speed)} km/h</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 text-xs italic">No matching trips</div>
            )
          ) : (
            <div className="p-2 space-y-4">
              <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <Clock className="mx-auto text-gray-300 mb-2" size={32} />
                <h3 className="font-bold text-gray-700 text-xs uppercase">Trip Playback</h3>
                <p className="text-[9px] text-gray-500 mt-1">Select a completed trip</p>
              </div>

              <div className="space-y-2">
                {vehicles.map(v => (
                  <button 
                    key={v.tripId}
                    onClick={() => startPlayback(v.tripId)}
                    className={twMerge(
                      "w-full p-3 text-left border rounded-lg transition-all flex items-center justify-between",
                      playback.tripId === v.tripId ? "border-blue-500 bg-blue-50" : "border-gray-50 hover:bg-gray-50"
                    )}
                  >
                    <div>
                      <div className="text-[10px] font-bold text-blue-600 font-mono">{v.tripId}</div>
                      <div className="text-sm font-semibold text-gray-700">{v.driver}</div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </button>
                ))}
              </div>

              {playback.tripId && (
                <div className="p-4 bg-gray-800 rounded-xl text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-blue-400 font-mono">{playback.tripId}</div>
                      <div className="text-xs font-bold uppercase tracking-wider">Playback</div>
                    </div>
                    <button onClick={stopPlayback} className="p-1.5 bg-gray-700 rounded-md text-gray-400 hover:text-white">
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                  
                  <div className="relative h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full bg-blue-500 transition-all duration-300" 
                      style={{ width: `${playback.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[1, 5, 10].map(s => (
                        <button 
                          key={s}
                          onClick={() => updatePlayback({ speed: s })}
                          className={clsx(
                            "px-2 py-1 rounded text-[9px] font-bold border transition-all",
                            playback.speed === s ? "bg-blue-600 border-blue-600" : "border-gray-700 text-gray-500"
                          )}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => updatePlayback({ isPlaying: !playback.isPlaying })}
                      className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 active:scale-95 transition-all"
                    >
                      {playback.isPlaying ? <Clock size={16} /> : <Car size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 w-6 h-10 rounded-full flex items-center justify-center shadow-md z-50 text-gray-400 hover:text-blue-600 transition-all"
      >
        {isCollapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
      </button>
    </aside>
  );
};

export default Sidebar;
