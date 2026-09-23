import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-primary-950 text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo-mark.svg" alt="" width={40} height={40} />
              <span className="flex flex-col leading-none">
                <span className="text-xl font-bold">استیدلی</span>
                <span className="text-xs text-accent-400" dir="ltr">Steedly</span>
              </span>
            </div>
            <p className="text-primary-100/70">
              سلامت و مراقبت اسب: دامپزشک و اسب‌کش، مقالات تخصصی، فروشگاه و مسابقات در یک پلتفرم
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">دسترسی سریع</h3>
            <ul className="space-y-2 text-primary-100/70">
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  مقالات
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition">
                  خدمات
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  فروشگاه
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-white transition">
                  مسابقات
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold mb-4">خدمات</h3>
            <ul className="space-y-2 text-primary-100/70">
              <li>
                <Link href="/services/veterinarians" className="hover:text-white transition">
                  دامپزشکان
                </Link>
              </li>
              <li>
                <Link href="/services/transporters" className="hover:text-white transition">
                  اسب‌کش‌ها
                </Link>
              </li>
              <li>
                <Link href="/services/bookings" className="hover:text-white transition">
                  رزرو خدمات
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">تماس با ما</h3>
            <ul className="space-y-2 text-primary-100/70">
              <li>ایمیل: info@steedly.ir</li>
              <li>تلفن: 021-12345678</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-primary-100/70">
          <p>&copy; {new Date().getFullYear()} استیدلی. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}

