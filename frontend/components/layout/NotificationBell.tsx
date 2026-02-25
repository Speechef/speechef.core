'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Notification {
  id: number;
  title: string;
  body: string;
  notification_type: string;
  link: string;
  read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  streak_risk: '🔥',
  review_ready: '🎓',
  job_match: '💼',
  score_improvement: '📈',
  badge_earned: '🏅',
  general: '🔔',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: countData } = useQuery<{ count: number }>({
    queryKey: ['notif-count'],
    queryFn: () => api.get('/auth/notifications/unread-count/').then((r) => r.data),
    refetchInterval: 60_000,
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/auth/notifications/').then((r) => r.data),
    enabled: open,
  });

  const readAllMutation = useMutation({
    mutationFn: () => api.post('/auth/notifications/read-all/'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notif-count'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const readOneMutation = useMutation({
    mutationFn: (id: number) => api.post(`/auth/notifications/${id}/read/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notif-count'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = countData?.count ?? 0;
  const preview = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span
            className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-0.5"
            style={{ backgroundColor: '#fe9940', color: '#141c52' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-bold text-sm" style={{ color: '#141c52' }}>Notifications</p>
            {unread > 0 && (
              <button
                onClick={() => readAllMutation.mutate()}
                className="text-xs text-indigo-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {preview.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No notifications yet.
            </div>
          ) : (
            <div>
              {preview.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${n.read ? 'opacity-60' : ''}`}
                >
                  <div className="flex gap-3 items-start">
                    <span className="text-lg flex-shrink-0">{TYPE_ICONS[n.notification_type] ?? '🔔'}</span>
                    <div className="flex-1 min-w-0" onClick={() => {
                      if (!n.read) readOneMutation.mutate(n.id);
                      setOpen(false);
                    }}>
                      {n.link ? (
                        <Link href={n.link} className="block">
                          <p className="text-sm font-semibold text-gray-800 leading-tight">{n.title}</p>
                          {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                        </Link>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-gray-800 leading-tight">{n.title}</p>
                          {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                        </>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: '#fe9940' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-xs font-semibold py-3 text-indigo-600 hover:bg-gray-50 transition-colors"
          >
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  );
}
