import React from 'react';

interface MapViewerProps {
  center?: { lat: number; lng: number };
  zoom?: number;
}

const MapViewer: React.FC<MapViewerProps> = ({
  center = { lat: 51.505, lng: -0.09 },
  zoom = 13,
}) => {
  return (
    <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
      <p className="text-white/50">Map Placeholder. Google Maps integration needed.</p>
    </div>
  );
};

export default MapViewer;
