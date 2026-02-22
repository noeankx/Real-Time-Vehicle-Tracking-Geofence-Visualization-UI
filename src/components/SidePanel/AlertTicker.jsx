import React from 'react';
import { useTrackStore } from '../../store/useTrackStore';
import { Bell, AlertTriangle, ShieldCheck } from 'lucide-react';

/**
 * AlertTicker - Scrolling feed of recent events.
 */
const AlertTicker = () => {
  const { alerts, setSelectedTrip } = useTrackStore();
  const unreadCount = alerts.length;

  return (
    <div className="bg-gray-900 text-white h-12 flex items-center px-4 overflow-hidden border-b border-gray-800 relative z-30 shadow-sm">
      <div className="flex items-center gap-2 mr-6 border-r border-gray-800 pr-5 shrink-0">
        <div className="relative">
          <Bell size={16} className="text-yellow-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="font-bold text-[9px] tracking-widest hidden sm:inline text-gray-500 uppercase">Live Feed</span>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex gap-8 animate-pulse text-[11px]">
          {alerts.length > 0 ? (
            alerts.slice(0, 5).map((alert) => (
              <button 
                key={alert.id} 
                onClick={() => alert.vehicleId && setSelectedTrip(alert.vehicleId)}
                className="flex items-center gap-2 whitespace-nowrap group hover:text-blue-400 transition-colors"
              >
                <div className="flex items-center gap-1.5 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
                  {alert.type === 'GEOFENCE_OFFICE' ? (
                    <ShieldCheck size={12} className="text-blue-400" />
                  ) : (
                    <AlertTriangle size={12} className="text-orange-400" />
                  )}
                  <span className="font-bold text-[9px] text-gray-400">
                    {alert.type.replace('GEOFENCE_', '')}
                  </span>
                </div>
                <span className="font-medium text-gray-200">{alert.message}</span>
                <span className="text-gray-600 font-mono text-[9px]">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </button>
            ))
          ) : (
            <div className="flex items-center gap-2 text-gray-600 italic">
              <div className="w-1.5 h-1.5 bg-gray-800 rounded-full animate-pulse"></div>
              <span>Monitoring active trips...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertTicker;
