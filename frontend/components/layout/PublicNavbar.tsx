'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/analyze',  label: 'Analyze'  },
  { href: '/learn',    label: 'Learn'    },
  { href: '/practice', label: 'Practice' },
  { href: '/jobs',     label: 'Jobs'     },
  { href: '/mentors',  label: 'Mentors'  },
];

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on navigation
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold" style={{ color: '#141c52' }}>
          Speechef
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-[#141c52] text-gray-500 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-block px-5 py-2 rounded-full border-2 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: '#141c52', color: '#141c52' }}
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-block px-5 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            Get Started Free
          </Link>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" style={{ color: '#141c52' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" style={{ color: '#141c52' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-3 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-[#141c52] hover:bg-gray-50 transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 mt-2 flex gap-2">
              <Link
                href="/login"
                className="flex-1 text-center px-4 py-2.5 rounded-xl border-2 text-sm font-medium"
                style={{ borderColor: '#141c52', color: '#141c52' }}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
