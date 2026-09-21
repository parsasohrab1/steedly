import type { Metadata } from 'next';
import './globals.css';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'اسبان',
  description: 'پلتفرم جامع خدمات و سلامت سوارکاری ایران — رزرو دامپزشک و نعلبند، آموزش، اخبار و دستیار پوشیدنی هوشمند اسبان‌پالس.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
