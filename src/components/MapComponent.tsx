import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapComponentProps {
  height?: string;
  center?: [number, number];
  zoom?: number;
  showPath?: boolean;
  focus?: [number, number];
}

const MapComponent = ({ 
  height = "400px", 
  center = [18.6298, 73.7997], // Pimpri-Chinchwad coordinates
  zoom = 13,
  showPath = false,
  focus
}: MapComponentProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView(focus || center, zoom);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    // Add some sample markers for bins
    const binIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3299/3299935.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    const bins = [
      { coords: [18.6298, 73.7997] as [number, number], info: "Smart Bin #101 - 85% Full (Priority)" },
      { coords: [18.6350, 73.8050] as [number, number], info: "Resident Pickup - Jane Doe" },
      { coords: [18.6250, 73.7900] as [number, number], info: "Smart Bin #103 - 20%" },
      { coords: [18.6200, 73.8100] as [number, number], info: "Resident Pickup - John Smith" }
    ];

    // Add route line
    const routeCoords: [number, number][] = [
      [18.6298, 73.7997],
      [18.6350, 73.8050],
      [18.6250, 73.7900],
      [18.6200, 73.8100]
    ];
    L.polyline(routeCoords, { color: '#166534', weight: 4, opacity: 0.6, dashArray: '10, 10' }).addTo(mapRef.current!);

    // Highlight path if requested (Enroute mode)
    if (showPath) {
      const enroutePath: [number, number][] = [
        [18.6298, 73.7997], // Start (Collector)
        [18.6320, 73.8020], // Mid
        [18.6350, 73.8050]  // End (Resident)
      ];
      L.polyline(enroutePath, { color: '#2563eb', weight: 6, opacity: 0.9 }).addTo(mapRef.current!);
      // Point-to-point animation simulated
      L.circleMarker([18.6320, 73.8020], { color: 'white', fillColor: '#2563eb', fillOpacity: 1, radius: 6 }).addTo(mapRef.current!);
    }

    bins.forEach(bin => {
      L.marker(bin.coords, { icon: binIcon })
        .addTo(mapRef.current!)
        .bindPopup(bin.info);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, showPath, focus]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height, width: '100%', borderRadius: '12px', zIndex: 0 }} 
      className="shadow-sm border border-gray-200"
    />
  );
};

export default MapComponent;
