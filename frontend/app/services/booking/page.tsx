'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { servicesAPI } from '@/lib/api';
import { FaCalendarAlt, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceType = searchParams.get('type') || 'veterinarian';
  const providerId = searchParams.get('id') || '';

  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    booking_date: '',
    booking_time: '',
    description: '',
  });

  useEffect(() => {
    if (providerId) {
      loadProvider();
    }
  }, [providerId, serviceType]);

  const loadProvider = async () => {
    try {
      const endpoint =
        serviceType === 'veterinarian'
          ? servicesAPI.getVeterinarian(providerId)
          : servicesAPI.getTransporter(providerId);
      const response = await endpoint;
      if (response.data.success) {
        setProvider(response.data.data);
      }
    } catch (error) {
      console.error('Error loading provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const bookingDateTime = `${formData.booking_date}T${formData.booking_time}:00`;
      const response = await servicesAPI.createBooking({
        service_type: serviceType,
        service_provider_id: parseInt(providerId),
        booking_date: bookingDateTime,
        description: formData.description,
      });

      if (response.data.success) {
        alert('Your booking was placed successfully!');
        router.push('/profile/bookings');
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message || 'Error placing the booking. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Service provider not found</h1>
          <button
            onClick={() => router.back()}
            className="text-primary-600 hover:text-primary-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Book {serviceType === 'veterinarian' ? 'veterinarian' : 'horse transporter'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Provider Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Provider information</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaUser className="text-primary-600" />
                    <span className="font-semibold">Name:</span>
                  </div>
                  <p>
                    {provider.full_name ||
                      provider.contact_name ||
                      provider.company_name}
                  </p>
                </div>

                {provider.phone && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FaPhone className="text-primary-600" />
                      <span className="font-semibold">Phone:</span>
                    </div>
                    <p>{provider.phone}</p>
                  </div>
                )}

                {provider.address && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FaMapMarkerAlt className="text-primary-600" />
                      <span className="font-semibold">Address:</span>
                    </div>
                    <p className="text-sm">{provider.address}</p>
                  </div>
                )}

                {provider.specialization && (
                  <div>
                    <span className="font-semibold">Specialization:</span>
                    <p>{provider.specialization}</p>
                  </div>
                )}

                {provider.rating && (
                  <div>
                    <span className="font-semibold">Rating:</span>
                    <p className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      {provider.rating.toFixed(1)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Booking form</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendarAlt className="inline ml-2" />
                    Booking date *
                  </label>
                  <input
                    type="date"
                    required
                    min={minDate}
                    value={formData.booking_date}
                    onChange={(e) =>
                      setFormData({ ...formData, booking_date: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.booking_time}
                    onChange={(e) =>
                      setFormData({ ...formData, booking_time: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter any additional notes about your booking..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Place booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

