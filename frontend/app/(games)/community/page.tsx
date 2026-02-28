'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const CATEGORIES = [
  { value: '',             label: 'All' },
  { value: 'grammar',      label: 'Grammar' },
  { value: 'vocabulary',   label: 'Vocabulary' },
  { value: 'pronunciation',label: 'Pronunciation' },
  { value: 'test_prep',    label: 'Test Prep' },
  { value: 'writing',      label: 'Writing' },
  { value: 'general',      label: 'General' },
];

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  grammar:       { bg: '#dbeafe', text: '#1e40af' },
  vocabulary:    { bg: '#ede9fe', text: '#6d28d9' },
  pronunciation: { bg: '#fce7f3', text: '#9d174d' },
  test_prep:     { bg: '#dcfce7', text: '#166534' },
  writing:       { bg: '#fef3c7', text: '#92400e' },
  general:       { bg: '#f3f4f6', text: '#374151' },
};

interface Thread {
  id: number;
  title: string;
  body: string;
  category: string;
  is_pinned: boolean;
  vote_count: number;
  reply_count: number;
  author: string;
  created_at: string;
}

export default function CommunityPage() {
  const [category, setCategory] = useState('');
  const [search, setSearch]     = useState('');

  const { data: threads, isLoading } = useQuery<Thread[]>({
    queryKey: ['community-threads', category, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      return api.get(`/community/threads/?${params}`).then((r) => r.data);
    },
  });

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#f4f6fb' }}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: BRAND.primary }}>Community</h1>
            <p className="text-sm text-gray-500 mt-0.5">Ask questions, share tips, help others improve their English.</p>
          </div>
          <Link
            href="/community/new"
            className="px-5 py-2.5 rounded-full text-sm font-bold shrink-0"
            style={{ background: BRAND.gradient, color: BRAND.primary }}
          >
            + Ask a Question
          </Link>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search threads…"
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20 shadow-sm"
        />

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className="px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-all"
              style={category === c.value
                ? { background: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Thread list */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200" style={{ borderTopColor: '#FADB43' }} />
          </div>
        ) : threads && threads.length > 0 ? (
          <div className="space-y-3">
            {threads.map((t) => {
              const catColor = CAT_COLORS[t.category] ?? CAT_COLORS.general;
              return (
                <Link
                  key={t.id}
                  href={`/community/${t.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {t.is_pinned && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">📌 Pinned</span>
                        )}
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: catColor.bg, color: catColor.text }}
                        >
                          {t.category.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm group-hover:underline leading-snug" style={{ color: BRAND.primary }}>
                        {t.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{t.body}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>by <span className="font-medium text-gray-600">@{t.author}</span></span>
                    <span>{new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>▲ {t.vote_count}</span>
                    <span>💬 {t.reply_count}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-sm">No threads yet. Be the first to ask a question!</p>
            <Link
              href="/community/new"
              className="mt-4 inline-block px-5 py-2 rounded-full text-sm font-bold"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              Ask Now →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
