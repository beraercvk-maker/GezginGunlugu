import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Leaflet'in varsayılan ikon sorunu için düzeltme
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Harita tıklama olaylarını dinleyen alt bileşen
function LocationMarker({ position, setPosition, onLocationSelect }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      // Tıklanan koordinatları üst bileşene gönder
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom()); // Tıklanan yere odaklan
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

// Ana Bileşen
function LocationPicker({ lat, lng, onLocationSelect }) {
  const [position, setPosition] = useState(null);

  // Eğer düzenleme modundaysak ve kayıtlı konum varsa onu göster
  useEffect(() => {
    if (lat && lng) {
      setPosition({ lat, lng });
    }
  }, [lat, lng]);

  // Başlangıç merkezi (Kayıtlı konum yoksa varsayılan: İstanbul)
  // [Enlem, Boylam] formatında
  const center = (lat && lng) ? [lat, lng] : [41.0082, 28.9784];

  return (
    <div style={{ height: '350px', width: '100%', marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e2e8f0', zIndex: 0 }}>
      <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        {/* Harita Katmanı (OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Tıklama ve Marker Bileşeni */}
        <LocationMarker 
            position={position} 
            setPosition={setPosition} 
            onLocationSelect={onLocationSelect} 
        />
      </MapContainer>
      
      <p style={{fontSize: '0.8rem', color: '#666', marginTop: '5px', textAlign: 'center'}}>
        * Harita üzerinde bir yere tıklayarak konumu işaretleyebilirsiniz.
      </p>
    </div>
  );
}

export default LocationPicker;