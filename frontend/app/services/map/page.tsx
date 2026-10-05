'use client';

import { useState, useEffect } from 'react';
import { servicesAPI } from '@/lib/api';
import dynamic from 'next/dynamic';

// Dynamic import for map to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-screen flex items-center justify-center">Loading map...</div>
});

interface ServiceProvider {
  id: number;
  full_name?: string;
  contact_name?: string;
  company_name?: string;
  latitude: number;
  longitude: number;
  phone: string;
  rating: number;
  specialization?: string;
  distance?: number;
}

export default function ServicesMapPage() {
  const [serviceType, setServiceType] = useState<'veterinarian' | 'transporter'>('veterinarian');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(50); // km

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Tehran
          setUserLocation({ lat: 35.6892, lng: 51.3890 });
        }
      );
    } else {
      // Default to Tehran
      setUserLocation({ lat: 35.6892, lng: 51.3890 });
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchProviders();
    }
  }, [serviceType, userLocation, radius]);

  const fetchProviders = async () => {
    if (!userLocation) return;

    setLoading(true);
    try {
      const response = serviceType === 'veterinarian'
        ? await servicesAPI.getVeterinarians({
            latitude: userLocation.lat.toString(),
            longitude: userLocation.lng.toString(),
            radius: radius.toString()
          })
        : await servicesAPI.getTransporters({
            latitude: userLocation.lat.toString(),
            longitude: userLocation.lng.toString(),
            radius: radius.toString()
          });

      setProviders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Choose on map</h1>
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Service Type Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setServiceType('veterinarian')}
            className={`flex-1 px-4 py-2 rounded-lg transition ${
              serviceType === 'veterinarian'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Veterinarians
          </button>
          <button
            onClick={() => setServiceType('transporter')}
            className={`flex-1 px-4 py-2 rounded-lg transition ${
              serviceType === 'transporter'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Horse transporters
          </button>
        </div>

        {/* Radius Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Distance:</label>
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
          </select>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapComponent
          userLocation={userLocation}
          providers={providers}
          serviceType={serviceType}
          onProviderSelect={setSelectedProvider}
        />
      </div>

      {/* Provider List */}
      {providers.length > 0 && (
        <div className="bg-white border-t max-h-64 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-bold mb-2">
              {providers.length} {serviceType === 'veterinarian' ? 'veterinarians' : 'horse transporters'} found
            </h3>
            <div className="space-y-2">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider)}
                  className={`p-3 border rounded-lg cursor-pointer transition ${
                    selectedProvider?.id === provider.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">
                        {provider.full_name || provider.contact_name || provider.company_name}
                      </h4>
                      {provider.specialization && (
                        <p className="text-sm text-gray-600">{provider.specialization}</p>
                      )}
                      <p className="text-sm text-gray-500">{provider.phone}</p>
                      {provider.distance && (
                        <p className="text-xs text-primary-600 mt-1">
                          {provider.distance.toFixed(1)} km
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Provider Action */}
      {selectedProvider && (
        <div className="bg-white border-t p-4">
          <button
            onClick={() => {
              // Navigate to booking page
              window.location.href = `/services/booking?type=${serviceType}&id=${selectedProvider.id}`;
            }}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Book {serviceType === 'veterinarian' ? 'veterinarian' : 'horse transporter'}
          </button>
        </div>
      )}
    </div>
  );
}

