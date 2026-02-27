'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface MonthlyEntry {
  month: string;
  gross: number;
  fee: number;
  net: number;
  session_count: number;
}

interface SessionRow {
  id: number;
  student_name: string;
  scheduled_at: string;
  duration_minutes: number;
  gross: number;
  fee: number;
  net: number;
}

interface EarningsData {
  summary: {
    monthly_gross: number;
    monthly_fee: number;
    monthly_net: number;
    all_time_gross: number;
    all_time_net: number;
    pending_payout: number | null;
  };
  monthly_breakdown: MonthlyEntry[];
  sessions: SessionRow[];
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color: '#141c52' }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function MonthBar({ entry, max }: { entry: MonthlyEntry; max: number }) {
  const pct = max > 0 ? (entry.net / max) * 100 : 0;
  return (
    <div className="flex items-end gap-2 group">
      <div className="flex flex-col items-center gap-1 flex-1">
        <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: 80 }}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all"
            style={{
              height: `${pct}%`,
              background: 'linear-gradient(to top,#141c52,#1e2d78)',
            }}
          />
        </div>
        <span className="text-xs text-gray-400 text-center leading-tight">{entry.month}</span>
      </div>
      {/* Tooltip on hover via title */}
      <span className="sr-only">{entry.month}: ${entry.net.toFixed(0)} net, {entry.session_count} sessions</span>
    </div>
  );
}

export default function MentorEarningsPage() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery<EarningsData>({
    queryKey: ['mentor-earnings'],
    enabled: isLoggedIn,
    queryFn: () => api.get('/mentors/earnings/').then((r) => r.data),
    retry: false,
  });

  useEffect(() => {
    if (!isLoggedIn) router.replace('/login');
    if (isError) router.replace('/mentors/dashboard');
  }, [isLoggedIn, isError, router]);

  if (!isLoggedIn || isError) return null;

  const maxNet = data ? Math.max(...data.monthly_breakdown.map((m) => m.net), 1) : 1;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#141c52' }}>Earnings</h1>
            <p className="text-gray-500 text-sm mt-1">Platform fee: 15% · Payouts via Stripe Connect</p>
          </div>
          <Link href="/mentors/dashboard"
            className="text-sm font-semibold px-4 py-2 rounded-xl border-2 hover:bg-indigo-50 transition-colors"
            style={{ borderColor: '#141c52', color: '#141c52' }}>
            ← Dashboard
          </Link>
        </div>

        {isLoading || !data ? (
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
            </div>
            <div className="h-48 bg-gray-100 rounded-2xl" />
            <div className="h-64 bg-gray-100 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <SummaryCard label="This month (gross)" value={`$${data.summary.monthly_gross.toFixed(0)}`} />
              <SummaryCard label="Platform fee (15%)" value={`-$${data.summary.monthly_fee.toFixed(0)}`} />
              <SummaryCard label="This month (net)" value={`$${data.summary.monthly_net.toFixed(0)}`}
                sub="what you keep" />
              <SummaryCard label="All-time gross" value={`$${data.summary.all_time_gross.toFixed(0)}`} />
              <SummaryCard label="All-time net" value={`$${data.summary.all_time_net.toFixed(0)}`} />
              <SummaryCard label="Pending payout"
                value={data.summary.pending_payout != null ? `$${data.summary.pending_payout}` : '—'}
                sub="Stripe Connect" />
            </div>

            {/* Monthly bar chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="text-sm font-semibold mb-4" style={{ color: '#141c52' }}>Net Earnings — Last 12 Months</h2>
              <div className="flex items-end gap-1.5">
                {data.monthly_breakdown.map((entry) => (
                  <MonthBar key={entry.month} entry={entry} max={maxNet} />
                ))}
              </div>
            </div>

            {/* Session breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold" style={{ color: '#141c52' }}>Session Breakdown</h2>
                <span className="text-xs text-gray-400">{data.sessions.length} sessions</span>
              </div>
              {data.sessions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No completed sessions yet</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.sessions.map((s) => (
                    <div key={s.id} className="px-5 py-3.5 flex items-center gap-4 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{s.student_name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(s.scheduled_at).toLocaleDateString()} · {s.duration_minutes} min
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold" style={{ color: '#141c52' }}>${s.net.toFixed(0)}</p>
                        <p className="text-xs text-gray-400">${s.gross.toFixed(0)} − ${s.fee.toFixed(0)} fee</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
