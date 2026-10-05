import Link from 'next/link';
import { FaUserMd, FaTruck, FaMapMarkerAlt } from 'react-icons/fa';

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Dispatch services</h1>

      {/* Map View Button */}
      <div className="mb-8 text-center">
        <Link
          href="/services/map"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition shadow-lg"
        >
          <FaMapMarkerAlt />
          <span>View on map</span>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Veterinarians */}
        <Link
          href="/services/veterinarians"
          className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <FaUserMd className="text-6xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Veterinarians</h2>
          <p className="text-gray-600 mb-4">
            Search and book a specialist veterinarian online across the country
          </p>
          <span className="text-primary-600 font-semibold">View veterinarians →</span>
        </Link>

        {/* Transporters */}
        <Link
          href="/services/transporters"
          className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <FaTruck className="text-6xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Horse transporters</h2>
          <p className="text-gray-600 mb-4">
            Find and book horse transport services with suitable equipment
          </p>
          <span className="text-primary-600 font-semibold">View horse transporters →</span>
        </Link>
      </div>

      <div className="bg-primary-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Book a service</h3>
        <p className="text-gray-700 mb-4">
          To book a service, first log in to your account and then choose the one that suits you
          from the list of service providers and book it.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          Log in / Sign up
        </Link>
      </div>
    </div>
  );
}

