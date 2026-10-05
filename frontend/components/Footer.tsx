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
                <span className="text-xl font-bold">Steedly</span>
                <span className="text-xs text-accent-400" dir="ltr">Steedly</span>
              </span>
            </div>
            <p className="text-primary-100/70">
              Horse health and care: veterinarians and horse transporters, specialized articles, shop and competitions on one platform
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick links</h3>
            <ul className="space-y-2 text-primary-100/70">
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-white transition">
                  Competitions
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-primary-100/70">
              <li>
                <Link href="/services/veterinarians" className="hover:text-white transition">
                  Veterinarians
                </Link>
              </li>
              <li>
                <Link href="/services/transporters" className="hover:text-white transition">
                  Horse transporters
                </Link>
              </li>
              <li>
                <Link href="/services/bookings" className="hover:text-white transition">
                  Book a service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">Contact us</h3>
            <ul className="space-y-2 text-primary-100/70">
              <li>Email: info@steedly.ir</li>
              <li>Phone: 021-12345678</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-primary-100/70">
          <p>&copy; {new Date().getFullYear()} Steedly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

