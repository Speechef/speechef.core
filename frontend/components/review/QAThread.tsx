'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Message {
  id: number;
  sender_name: string;
  body: string;
  sent_at: string;
}

interface QAThreadProps {
  reviewId: number;
  currentUserName: string;
}

export default function QAThread({ reviewId, currentUserName }: QAThreadProps) {
  const [draft, setDraft] = useState('');
  const qc = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['review-messages', reviewId],
    queryFn: () => api.get(`/review/${reviewId}/messages/`).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const sendMutation = useMutation({
    mutationFn: () => api.post(`/review/${reviewId}/messages/`, { body: draft }).then((r) => r.data),
    onSuccess: () => {
      setDraft('');
      qc.invalidateQueries({ queryKey: ['review-messages', reviewId] });
    },
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="font-bold text-sm" style={{ color: '#141c52' }}>Follow-up Q&A</h3>
        <p className="text-xs text-gray-400 mt-0.5">1 follow-up included · Your expert will respond within 24h</p>
      </div>

      {/* Messages */}
      <div className="px-5 py-4 space-y-4 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No messages yet. Ask a follow-up question below.</p>
        ) : (
          messages.map((m) => {
            const isOwn = m.sender_name === currentUserName;
            return (
              <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-2xl px-4 py-2.5 ${
                  isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm bg-gray-50'
                }`}
                  style={isOwn ? { background: '#141c52', color: 'white' } : undefined}>
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1 opacity-60">{m.sender_name}</p>
                  )}
                  <p className="text-sm leading-relaxed">{m.body}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-white/40' : 'text-gray-400'}`}>
                    {new Date(m.sent_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="px-5 pb-4 flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a follow-up question…"
          rows={2}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-indigo-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && draft.trim()) {
              e.preventDefault();
              sendMutation.mutate();
            }
          }}
        />
        <button
          onClick={() => sendMutation.mutate()}
          disabled={!draft.trim() || sendMutation.isPending}
          className="self-end px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40 flex-shrink-0"
          style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
