'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.replace('/');
  }

  return (
    <nav
      className="flex items-center justify-between px-8 py-4 shadow-sm"
      style={{ backgroundColor: '#141c52' }}
    >
      <Link href="/dashboard" className="text-xl font-bold text-white">
        Speechef
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-white/80 hover:text-white text-sm transition-colors">
          Dashboard
        </Link>
        <Link href="/learn" className="text-white/80 hover:text-white text-sm transition-colors">
          Learn
        </Link>
        <Link href="/practice" className="text-white/80 hover:text-white text-sm transition-colors">
          Practice
        </Link>
        <Link href="/jobs" className="text-white/80 hover:text-white text-sm transition-colors">
          Jobs
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link
              href="/profile"
              className="text-white/80 hover:text-white text-sm transition-colors"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-full text-sm font-medium border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-[#141c52] transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#FADB43' }}
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
