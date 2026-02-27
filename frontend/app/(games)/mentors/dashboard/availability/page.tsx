'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface UnavailabilityBlock {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
}

interface ConflictError {
  detail: string;
  conflicts: { id: number; scheduled_at: string }[];
}

export default function AvailabilityPage() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  const [showAdd, setShowAdd] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [conflicts, setConflicts] = useState<ConflictError | null>(null);

  useEffect(() => {
    if (!isLoggedIn) router.replace('/login');
  }, [isLoggedIn, router]);

  const { data: blocks = [], isLoading } = useQuery<UnavailabilityBlock[]>({
    queryKey: ['mentor-unavailability'],
    enabled: isLoggedIn,
    queryFn: () => api.get('/mentors/unavailability/').then((r) => r.data),
  });

  const addBlock = useMutation({
    mutationFn: () => api.post('/mentors/unavailability/', { start_date: startDate, end_date: endDate || startDate, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentor-unavailability'] });
      setShowAdd(false);
      setStartDate(''); setEndDate(''); setReason(''); setConflicts(null);
    },
    onError: (err: any) => {
      if (err.response?.status === 409) setConflicts(err.response.data);
    },
  });

  const deleteBlock = useMutation({
    mutationFn: (id: number) => api.delete(`/mentors/unavailability/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentor-unavailability'] }),
  });

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#141c52' }}>Availability Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Block dates when you are unavailable for bookings.</p>
          </div>
          <Link href="/mentors/dashboard"
            className="text-sm font-semibold px-4 py-2 rounded-xl border-2 hover:bg-indigo-50 transition-colors"
            style={{ borderColor: '#141c52', color: '#141c52' }}>
            ← Dashboard
          </Link>
        </div>

        {/* Add block */}
        {showAdd ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold mb-4" style={{ color: '#141c52' }}>Block Dates</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">End Date (optional)</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Reason (private)</label>
              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Holiday, Conference"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            {conflicts && (
              <div className="bg-red-50 rounded-xl p-3 mb-4 text-sm text-red-700">
                <p className="font-semibold mb-1">⚠️ Conflicting sessions:</p>
                {conflicts.conflicts.map((c) => (
                  <p key={c.id} className="text-xs">
                    Session #{c.id} — {new Date(c.scheduled_at).toLocaleString()}
                  </p>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setShowAdd(false); setConflicts(null); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">
                Cancel
              </button>
              <button
                onClick={() => addBlock.mutate()}
                disabled={!startDate || addBlock.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
                style={{ background: 'linear-gradient(to right,#141c52,#1e2d78)', color: 'white' }}>
                {addBlock.isPending ? 'Saving…' : 'Block Dates'}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)}
            className="w-full mb-6 py-3 rounded-2xl border-2 border-dashed text-sm font-semibold transition-colors hover:bg-indigo-50"
            style={{ borderColor: '#141c52', color: '#141c52' }}>
            + Block Dates
          </button>
        )}

        {/* Blocks list */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold" style={{ color: '#141c52' }}>Upcoming Blocks</h2>
          </div>
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1,2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : blocks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No dates blocked — students can book any available slot</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {blocks.map((b) => (
                <div key={b.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {b.start_date === b.end_date
                        ? new Date(b.start_date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                        : `${new Date(b.start_date + 'T00:00:00').toLocaleDateString()} → ${new Date(b.end_date + 'T00:00:00').toLocaleDateString()}`}
                    </p>
                    {b.reason && <p className="text-xs text-gray-400">{b.reason}</p>}
                  </div>
                  <button
                    onClick={() => deleteBlock.mutate(b.id)}
                    disabled={deleteBlock.isPending}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
