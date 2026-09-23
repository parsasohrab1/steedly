'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaUser, FaShoppingCart } from 'react-icons/fa';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';
import Logo from './Logo';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Load cart items count
    const updateCartCount = () => {
      import('@/lib/cart').then(({ cartService }) => {
        setCartItemsCount(cartService.getTotalItems());
      });
    };
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, [pathname]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" aria-label="استیدلی - صفحه اصلی">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>
            <Link href="/blog" className="hover:text-primary-600 transition">
              مقالات
            </Link>
            <Link href="/services" className="hover:text-primary-600 transition">
              خدمات
            </Link>
            <Link href="/shop" className="hover:text-primary-600 transition">
              فروشگاه
            </Link>
            <Link href="/competitions" className="hover:text-primary-600 transition">
              مسابقات
            </Link>
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition">
              <FaShoppingCart size={24} />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <Link
                  href="/profile"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                >
                  <FaUser />
                  پروفایل
                </Link>
                <Link
                  href="/admin"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  پنل مدیریت
                </Link>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                ورود / ثبت‌نام
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <div className="mb-4">
                <SearchBar />
              </div>
              <Link
                href="/blog"
                className="hover:text-primary-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                مقالات
              </Link>
              <Link
                href="/services"
                className="hover:text-primary-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                خدمات
              </Link>
              <Link
                href="/shop"
                className="hover:text-primary-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                فروشگاه
              </Link>
              <Link
                href="/competitions"
                className="hover:text-primary-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                مسابقات
              </Link>
              <Link
                href="/cart"
                className="flex items-center gap-2 hover:text-primary-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaShoppingCart />
                سبد خرید
                {cartItemsCount > 0 && (
                  <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              {isLoggedIn ? (
                <>
                  <div className="flex justify-center mb-2">
                    <NotificationBell />
                  </div>
                  <Link
                    href="/profile"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-center flex items-center justify-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser />
                    پروفایل
                  </Link>
                  <Link
                    href="/admin"
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    پنل مدیریت
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ورود / ثبت‌نام
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

