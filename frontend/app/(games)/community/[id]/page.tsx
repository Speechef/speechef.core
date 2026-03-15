'use client';

import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  grammar:       { bg: '#dbeafe', text: '#1e40af' },
  vocabulary:    { bg: '#ede9fe', text: '#6d28d9' },
  pronunciation: { bg: '#fce7f3', text: '#9d174d' },
  test_prep:     { bg: '#dcfce7', text: '#166534' },
  writing:       { bg: '#fef3c7', text: '#92400e' },
  general:       { bg: '#f3f4f6', text: '#374151' },
};

interface Reply {
  id: number;
  body: string;
  is_accepted: boolean;
  author: string;
  created_at: string;
  is_own: boolean;
}

interface ThreadDetail {
  id: number;
  title: string;
  body: string;
  category: string;
  is_pinned: boolean;
  vote_count: number;
  reply_count: number;
  view_count: number;
  is_voted: boolean;
  is_own_thread: boolean;
  author: string;
  created_at: string;
  replies: Reply[];
}

export default function ThreadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoggedIn } = useAuthStore();
  const qc = useQueryClient();

  const [replyBody, setReplyBody] = useState('');
  const [voted, setVoted]         = useState<boolean | null>(null);
  const [voteCount, setVoteCount] = useState<number | null>(null);

  const { data: thread, isLoading, isError } = useQuery<ThreadDetail>({
    queryKey: ['community-thread', id],
    queryFn: () => api.get(`/community/threads/${id}/`).then((r) => r.data),
  });

  const { mutate: vote } = useMutation({
    mutationFn: () => api.post(`/community/threads/${id}/vote/`),
    onSuccess: (res) => {
      setVoted(res.data.voted);
      setVoteCount(res.data.vote_count);
    },
  });

  const { mutate: addReply, isPending: replying } = useMutation({
    mutationFn: () => api.post(`/community/threads/${id}/replies/`, { body: replyBody }),
    onSuccess: () => {
      setReplyBody('');
      qc.invalidateQueries({ queryKey: ['community-thread', id] });
      qc.invalidateQueries({ queryKey: ['community-threads'] });
    },
  });

  const { mutate: acceptReply } = useMutation({
    mutationFn: (replyId: number) => api.post(`/community/replies/${replyId}/accept/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community-thread', id] }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6fb' }}>
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200" style={{ borderTopColor: '#FADB43' }} />
      </div>
    );
  }

  if (isError || !thread) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#f4f6fb' }}>
        <p className="text-4xl">💬</p>
        <p className="font-semibold" style={{ color: BRAND.primary }}>Thread not found</p>
        <Link href="/community" className="text-sm text-gray-400 hover:underline">← Community</Link>
      </div>
    );
  }

  const catColor = CAT_COLORS[thread.category] ?? CAT_COLORS.general;
  const isVoted = voted ?? thread.is_voted;
  const currentVoteCount = voteCount ?? thread.vote_count;

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#f4f6fb' }}>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Back */}
        <Link href="/community" className="text-sm text-gray-400 hover:underline">← Community</Link>

        {/* Thread card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: catColor.bg, color: catColor.text }}>
                {thread.category.replace('_', ' ')}
              </span>
              {thread.is_pinned && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">📌 Pinned</span>}
            </div>
            <h1 className="text-xl font-extrabold leading-snug" style={{ color: BRAND.primary }}>{thread.title}</h1>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">{thread.body}</p>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
              <span>by <span className="font-medium text-gray-600">@{thread.author}</span></span>
              <span>{new Date(thread.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span>👁 {thread.view_count}</span>
            </div>
          </div>
          {/* Vote bar */}
          <div className="border-t border-gray-100 px-6 py-3 flex items-center gap-4">
            <button
              onClick={() => isLoggedIn && vote()}
              disabled={!isLoggedIn}
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border-2 transition-all disabled:opacity-40"
              style={isVoted
                ? { background: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
            >
              ▲ {currentVoteCount} {isVoted ? 'Voted' : 'Vote'}
            </button>
            <span className="text-xs text-gray-400">💬 {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}</span>
          </div>
        </div>

        {/* Replies */}
        {thread.replies.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
            </p>
            {thread.replies.map((r) => (
              <div
                key={r.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm ${r.is_accepted ? 'border-green-300' : 'border-gray-100'}`}
              >
                {r.is_accepted && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 mb-2">
                    <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</span>
                    Accepted Answer
                  </div>
                )}
                <p className="text-sm text-gray-700 leading-relaxed">{r.body}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>@{r.author}</span>
                    <span>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  {/* Accept button — only thread author sees this */}
                  {thread.is_own_thread && !r.is_accepted && (
                    <button
                      onClick={() => acceptReply(r.id)}
                      className="text-xs text-gray-400 hover:text-green-600 transition-colors"
                    >
                      ✓ Accept
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply form */}
        {isLoggedIn ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write your reply…"
              rows={4}
              className="w-full p-5 text-sm text-gray-700 resize-none outline-none"
            />
            <div className="flex justify-end px-5 py-3 border-t border-gray-100">
              <button
                onClick={() => addReply()}
                disabled={replying || !replyBody.trim()}
                className="px-5 py-2 rounded-full text-sm font-bold transition-opacity disabled:opacity-50"
                style={{ background: BRAND.gradient, color: BRAND.primary }}
              >
                {replying ? 'Posting…' : 'Post Reply →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-sm text-gray-500 mb-3">Sign in to reply</p>
            <Link
              href="/login"
              className="inline-block px-5 py-2 rounded-full text-sm font-bold"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              Log In →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
