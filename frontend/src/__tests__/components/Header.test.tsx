import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Header from '@/components/Header';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Header Component', () => {
  it('renders logo and navigation links', () => {
    render(<Header />);

    expect(screen.getByText('اسب بان')).toBeInTheDocument();
    expect(screen.getByText('مقالات')).toBeInTheDocument();
    expect(screen.getByText('خدمات')).toBeInTheDocument();
    expect(screen.getByText('فروشگاه')).toBeInTheDocument();
  });

  it('shows login button when user is not logged in', () => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => null);

    render(<Header />);

    expect(screen.getByText('ورود / ثبت‌نام')).toBeInTheDocument();
  });
});

