'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth';
import NotificationBell from './NotificationBell';
import api from '@/lib/api';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/learn',     label: 'Learn' },
  { href: '/practice',  label: 'Practice' },
  { href: '/jobs',      label: 'Jobs' },
  { href: '/mentors',   label: 'Mentors' },
];

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery<{ username: string }>({
    queryKey: ['profile'],
    enabled: isLoggedIn,
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

  function handleLogout() {
    logout();
    router.replace('/');
  }

  const initial = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/10"
      style={{ backgroundColor: '#141c52' }}
    >
      <div className="max-w-7xl mx-auto px-5 flex items-center h-14 gap-2">

        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-lg font-extrabold text-white tracking-tight shrink-0 mr-4"
        >
          Speechef
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-0.5">
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
                    ? 'bg-white/15 text-white'
                    : 'text-white/65 hover:text-white hover:bg-white/8'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* Analyze CTA */}
              <Link
                href="/analyze"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
              >
                + Analyze
              </Link>

              <NotificationBell />

              {/* Avatar + dropdown */}
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white transition-opacity hover:opacity-80"
                  style={{
                    background: 'linear-gradient(135deg,#1e2d78,#2a3d9a)',
                    border: '2px solid rgba(255,255,255,0.25)',
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
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-full text-sm font-semibold text-[#141c52] transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FADB43' }}
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
