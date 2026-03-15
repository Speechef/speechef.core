'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth';
import NotificationBell from './NotificationBell';
import api from '@/lib/api';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/learn',     label: 'Learn' },
  { href: '/practice',  label: 'Practice' },
  { href: '/profile',   label: 'Me' },
];

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Delay auth-dependent rendering until after hydration so SSR output matches
  // the initial client render (both show logged-out state until mount).
  useEffect(() => { setMounted(true); }, []);

  const { data: user } = useQuery<{ username: string }>({
    queryKey: ['profile'],
    enabled: mounted && isLoggedIn,
    queryFn: () => api.get('/auth/profile/').then((r) => r.data),
  });

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    router.replace('/');
  }

  const initial = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center h-16 gap-2">

        {/* Logo */}
        <Link
          href={mounted && isLoggedIn ? '/dashboard' : '/'}
          className="text-xl font-extrabold tracking-tight shrink-0 mr-4"
          style={{ color: '#141c52' }}
        >
          Speechef
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const active =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${
                  active
                    ? 'text-[#141c52] font-semibold bg-[#141c52]/8'
                    : 'text-gray-500 hover:text-[#141c52] hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {mounted && isLoggedIn ? (
            <>
              {/* Analyze CTA — gradient (desktop) */}
              <Link
                href="/analyze"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
              >
                + Analyze
              </Link>

              <NotificationBell />

              {/* Avatar + dropdown */}
              <div className="relative hidden md:block" ref={dropRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white transition-opacity hover:opacity-80"
                  style={{
                    background: 'linear-gradient(135deg,#141c52,#1e2d78)',
                    border: '2px solid rgba(20,28,82,0.12)',
                  }}
                  aria-label="User menu"
                >
                  {initial}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden z-50">
                    {user?.username && (
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-bold text-[#141c52] truncate">@{user.username}</p>
                      </div>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>👤</span> My Profile
                    </Link>
                    <Link
                      href="/progress"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>📈</span> My Progress
                    </Link>
                    <Link
                      href="/analyze/history"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>📊</span> Analysis History
                    </Link>
                    <Link
                      href="/notifications"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>🔔</span> Notifications
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>⚙️</span> Settings
                    </Link>
                    <div className="border-t border-gray-100 mt-1" />
                    <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Explore</p>
                    <Link
                      href="/mentors"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>🎓</span> Mentors
                    </Link>
                    <Link
                      href="/community"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>💬</span> Community
                    </Link>
                    <Link
                      href="/jobs"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>💼</span> Jobs
                    </Link>
                    <div className="border-t border-gray-100 mt-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span>↩</span> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
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
            </>
          )}

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
            {NAV_LINKS.map(({ href, label }) => {
              const active =
                href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-[#141c52] font-semibold bg-[#141c52]/8'
                      : 'text-gray-500 hover:text-[#141c52] hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {mounted && isLoggedIn ? (
                <>
                  <Link
                    href="/analyze"
                    className="block w-full text-center text-sm font-bold px-4 py-2.5 rounded-xl mb-2 transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                  >
                    + Analyze
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      href="/profile"
                      className="flex-1 text-center text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex-1 text-center text-sm font-medium px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
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
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
