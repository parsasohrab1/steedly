import Link from 'next/link';
import { FaHorse, FaShoppingCart, FaCalendarAlt, FaUserMd } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-primary-700">
          Horse health and care, all in one place
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Veterinarians and horse transporters near you, specialized horse health articles, shop and competition calendar
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/blog"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            View articles
          </Link>
          <Link
            href="/shop"
            className="bg-white text-primary-600 border-2 border-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition"
          >
            Go to the shop
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Link
          href="/blog"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <FaHorse className="text-5xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Specialized articles</h2>
          <p className="text-gray-600">
            Access comprehensive articles about breeds, diseases, equipment and more...
          </p>
        </Link>

        <Link
          href="/services"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <FaUserMd className="text-5xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Dispatch services</h2>
          <p className="text-gray-600">
            Book a veterinarian or horse transporter online across the country
          </p>
        </Link>

        <Link
          href="/shop"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <FaShoppingCart className="text-5xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Online shop</h2>
          <p className="text-gray-600">
            Buy horse equipment, medicines and supplements
          </p>
        </Link>

        <Link
          href="/competitions"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <FaCalendarAlt className="text-5xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Competitions</h2>
          <p className="text-gray-600">
            Stay informed about domestic and international competitions
          </p>
        </Link>
      </section>

      {/* Latest Blog Posts Preview */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Latest articles</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* This will be populated with actual blog posts from API */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">Sample article</h3>
              <p className="text-gray-600 text-sm">
                The article summary is displayed here...
              </p>
            </div>
          </div>
        </div>
        <div className="text-center mt-6">
          <Link
            href="/blog"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            View all articles →
          </Link>
        </div>
      </section>
    </div>
  );
}

