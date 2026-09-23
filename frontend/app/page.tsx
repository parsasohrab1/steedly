import Link from 'next/link';
import { FaHorse, FaShoppingCart, FaCalendarAlt, FaUserMd } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-primary-700">
          سلامت و مراقبت اسب، در یک جا
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          دامپزشک و اسب‌کش نزدیک شما، مقالات تخصصی سلامت اسب، فروشگاه و تقویم مسابقات
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/blog"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            مشاهده مقالات
          </Link>
          <Link
            href="/shop"
            className="bg-white text-primary-600 border-2 border-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition"
          >
            ورود به فروشگاه
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
          <h2 className="text-xl font-bold mb-2">مقالات تخصصی</h2>
          <p className="text-gray-600">
            دسترسی به مقالات جامع درباره نژادها، بیماری‌ها، تجهیزات و...
          </p>
        </Link>

        <Link
          href="/services"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <FaUserMd className="text-5xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">خدمات اعزام</h2>
          <p className="text-gray-600">
            رزرو آنلاین دامپزشک و اسب‌کش در سراسر کشور
          </p>
        </Link>

        <Link
          href="/shop"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <FaShoppingCart className="text-5xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">فروشگاه آنلاین</h2>
          <p className="text-gray-600">
            خرید تجهیزات، داروها و مکمل‌های اسب
          </p>
        </Link>

        <Link
          href="/competitions"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <FaCalendarAlt className="text-5xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">مسابقات</h2>
          <p className="text-gray-600">
            اطلاع از مسابقات داخلی و بین‌المللی
          </p>
        </Link>
      </section>

      {/* Latest Blog Posts Preview */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-center">آخرین مقالات</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* This will be populated with actual blog posts from API */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">مقاله نمونه</h3>
              <p className="text-gray-600 text-sm">
                خلاصه مقاله در اینجا نمایش داده می‌شود...
              </p>
            </div>
          </div>
        </div>
        <div className="text-center mt-6">
          <Link
            href="/blog"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            مشاهده همه مقالات →
          </Link>
        </div>
      </section>
    </div>
  );
}

