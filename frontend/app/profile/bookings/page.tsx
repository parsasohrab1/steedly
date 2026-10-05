'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { servicesAPI } from '@/lib/api';
import Link from 'next/link';
import { FaArrowRight, FaCalendarAlt } from 'react-icons/fa';

interface Booking {
  id: number;
  service_type: string;
  service_provider_id: number;
  booking_date: string;
  description: string;
  status: string;
  created_at: string;
}

const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels: { [key: string]: string } = {
  pending: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

const serviceTypeLabels: { [key: string]: string } = {
  veterinarian: 'Veterinarian',
  transporter: 'Horse transporter'
};

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await servicesAPI.getBookings();
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My bookings</h1>
        <Link
          href="/profile"
          className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
        >
          Back to profile
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No bookings</h2>
          <p className="text-gray-600 mb-6">You have not placed any bookings yet</p>
          <Link
            href="/services"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            View services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">
                    Booking: {serviceTypeLabels[booking.service_type] || booking.service_type}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(booking.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[booking.status] || statusColors.pending}`}>
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>

              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <span className="text-gray-600">Booking date:</span>
                  <span className="font-semibold">
                    {new Date(booking.booking_date).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                {booking.description && (
                  <div>
                    <span className="text-gray-600">Notes:</span>
                    <p className="mt-1 text-gray-800">{booking.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

