# Real-Time Vehicle Tracking & Geofence Visualization

## 🚀 Project Overview
A comprehensive Monitoring Dashboard for enterprise vehicle fleets. This application provides real-time GPS telemetry visualization, automated geofence event detection, and a centralized command center for operational teams.

## 🏗️ Technical Architecture

### 1. Robust Frontend Foundation
- **React (Vite)**: Selected for its lightning-fast HMR and efficient component-based architecture.
- **Tailwind CSS**: Used for a premium, custom UI without the overhead of heavy component libraries.

### 2. Scalable State Management
- **Zustand**: Implementation of a lean, high-performance store. 
- **Separation of Concerns**: State is decoupled from UI, allowing for easy integration with real WebSockets or APIs in the future.
- **Real-time Logic**: Handles hundreds of updates per second using optimized React hooks.

### 3. Advanced Geospatial Rendering
- **Leaflet.js**: Powering the map interaction.
- **Custom Visuals**: 
    - **Smooth Telemetry**: Markers use CSS-accelerated transitions to eliminate "teleporting" during GPS jumps.
    - **Dynamic Overlays**: Office and Pickup geofences with event-based highlighting.
    - **Smart Polylines**: Visual distinction between planned and completed route segments.

## 🧠 Technical Discussion Areas (PDF Requirements)

### 1. WebSocket & Real-Time Rendering
To manage hundreds of simultaneously updating markers, this implementation:
- **CSS Transitions**: Uses `transition: transform` on marker icons. This offloads animation work to the GPU, keeping the main thread free for logic.
- **State Batching**: Position updates are managed via a centralized store, ensuring UI components only re-render when their specific data changes.
- **Simulation**: In a production environment, a `web worker` would be used to parse incoming WebSocket messages to prevent blocking the UI thread.

### 2. Map Library Choice
- **Leaflet.js (Selected)**: Chosen for its negligible bundle size and excellent mobile performance. It is perfect for tracking use cases where highly custom markers and overlays are required.
- **Mapbox GL JS**: While powerful (vector tiles), the licensing costs and larger bundle size were deemed unnecessary for this specific 2D tracking requirement.
- **Google Maps**: Offers best-in-class satellite imagery but has significant tile load costs and limited marker animation flexibility compared to Leaflet's DOM-based approach.

### 3. Geofence Rendering Performance
For scenarios with 2,500+ geofences:
- **Canvas Rendering**: Leaflet's `preferCanvas: true` option would be enabled to render geofences as pixels rather than SVG elements, preventing DOM bloating.
- **Level of Detail (LOD)**: Implementation of "clustering" or layer groups that only render geofences within the current map viewport/zoom level.

### 4. Offline / Degraded Network Handling
- **Heartbeat Monitoring**: The dashboard tracks the "Last Updated" timestamp of the simulation. If updates stop, a "Telemetry Offline" warning appears in the Alert Ticker.
- **Delta Playback**: Upon reconnection, the system is designed to "catch up" by replaying buffered location updates, ensuring no geofence entry events are missed.

## ✨ Key Features
- **Live Command Center**: Real-time stats for trips 'In Transit', 'In Office', and 'Approaching Pickup'.
- **Interactive Multi-Filter**: Search by Driver, Trip ID, or filter by operational status.
- **Smart Alert Feed**: Clickable live ticker that pans the map to active incidents.
- **Dynamic Notifications**: "In-situ" map cards that appear when vehicles arrive at pickup points.
- **Historical Analysis**: Bonus feature allowing for route playback at variable speeds (1x, 5x, 10x).

## 🛠️ Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Launch development server: `npm run dev`
4. Production build: `npm run build`

---
*Developed for MoveInSync Technical Evaluation.*
