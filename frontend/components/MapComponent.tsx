'use client';

import { useEffect, useRef } from 'react';

interface MapComponentProps {
  userLocation: { lat: number; lng: number } | null;
  providers: Array<{
    id: number;
    latitude: number;
    longitude: number;
    full_name?: string;
    contact_name?: string;
    company_name?: string;
    phone: string;
    rating: number;
  }>;
  serviceType: 'veterinarian' | 'transporter';
  onProviderSelect: (provider: any) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function MapComponent({
  userLocation,
  providers,
  serviceType,
  onProviderSelect
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const initMap = () => {
      // Check if Leaflet is already loaded
      if (window.L) {
        createMap();
        return;
      }

      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        createMap();
      };
      document.head.appendChild(script);
    };

    const createMap = () => {
      if (!window.L || !mapRef.current) return;

      const apiKey = process.env.NEXT_PUBLIC_NESHAN_API_KEY || 'YOUR_NESHAN_API_KEY';
      
      // Initialize map
      const map = window.L.map(mapRef.current!, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 12,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true
      });

      // Add Neshan tile layer
      window.L.tileLayer('https://api.neshan.org/v1/static', {
        attribution: '© <a href="https://www.neshan.org">Neshan</a>',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        key: apiKey,
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;

      // Custom icon for user location
      const userIcon = window.L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="#0EA5E9" stroke="#0284C7" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="#ffffff"/>
          </svg>
        `),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      // Add user location marker
      const userMarker = window.L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon
      }).addTo(map);
      userMarker.bindPopup('Your location').openPopup();

      // Custom icon for providers
      const providerIcon = window.L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="${serviceType === 'veterinarian' ? '#10B981' : '#F59E0B'}" 
                    stroke="${serviceType === 'veterinarian' ? '#059669' : '#D97706'}" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="#ffffff"/>
          </svg>
        `),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      // Add provider markers
      markersRef.current = providers.map((provider) => {
        const marker = window.L.marker([provider.latitude, provider.longitude], {
          icon: providerIcon
        }).addTo(map);

        const popupContent = `
          <div style="text-align: right; direction: rtl; min-width: 150px;">
            <strong>${provider.full_name || provider.contact_name || provider.company_name}</strong><br/>
            <small>${provider.phone}</small><br/>
            <small>Rating: ${provider.rating.toFixed(1)} ⭐</small>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          onProviderSelect(provider);
          map.setView([provider.latitude, provider.longitude], 15);
        });

        return marker;
      });

      // Fit bounds to show all markers
      if (providers.length > 0) {
        const group = new window.L.featureGroup([userMarker, ...markersRef.current]);
        map.fitBounds(group.getBounds().pad(0.1));
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [userLocation, providers, serviceType, onProviderSelect]);

  return (
    <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0 }} />
  );
}
