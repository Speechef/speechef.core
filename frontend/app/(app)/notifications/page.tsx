'use client';

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

const TYPE_LABELS: Record<string, string> = {
  streak_risk: 'Streak',
  review_ready: 'Review',
  job_match: 'Jobs',
  score_improvement: 'Score',
  badge_earned: 'Badge',
  general: 'General',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications-page'],
    queryFn: () => api.get('/auth/notifications/').then((r) => r.data),
  });

  const readAllMutation = useMutation({
    mutationFn: () => api.post('/auth/notifications/read-all/'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-page'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    },
  });

  const readOneMutation = useMutation({
    mutationFn: (id: number) => api.post(`/auth/notifications/${id}/read/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-page'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#141c52' }}>Notifications</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => readAllMutation.mutate()}
              disabled={readAllMutation.isPending}
              className="text-sm font-semibold text-indigo-600 hover:underline disabled:opacity-50"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-semibold">No notifications yet</p>
            <p className="text-sm mt-1">We'll notify you about reviews, badges, and score updates.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const icon = TYPE_ICONS[n.notification_type] ?? '🔔';
              const label = TYPE_LABELS[n.notification_type] ?? 'General';
              return (
                <div
                  key={n.id}
                  className={`bg-white rounded-2xl border p-5 transition-colors ${
                    n.read ? 'border-gray-100 opacity-70' : 'border-indigo-100 bg-indigo-50/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#141c52' }}>{n.title}</p>
                          {n.body && <p className="text-gray-500 text-sm mt-0.5">{n.body}</p>}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs font-medium text-gray-400">{label}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!n.read && (
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#fe9940' }} />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={() => { if (!n.read) readOneMutation.mutate(n.id); }}
                            className="text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            View →
                          </Link>
                        )}
                        {!n.read && (
                          <button
                            onClick={() => readOneMutation.mutate(n.id)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
