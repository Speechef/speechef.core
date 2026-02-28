'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const CATEGORIES = [
  { value: 'grammar',       label: 'Grammar' },
  { value: 'vocabulary',    label: 'Vocabulary' },
  { value: 'pronunciation', label: 'Pronunciation' },
  { value: 'test_prep',     label: 'Test Prep' },
  { value: 'writing',       label: 'Writing' },
  { value: 'general',       label: 'General' },
];

export default function NewThreadPage() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [category, setCategory] = useState('general');

  const { mutate: create, isPending } = useMutation({
    mutationFn: () => api.post('/community/threads/', { title, body, category }),
    onSuccess: (res) => router.push(`/community/${res.data.id}`),
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: '#f4f6fb' }}>
        <span className="text-5xl">💬</span>
        <h2 className="text-lg font-bold" style={{ color: BRAND.primary }}>Sign in to ask a question</h2>
        <Link href="/login" className="px-6 py-2.5 rounded-full text-sm font-bold" style={{ background: BRAND.gradient, color: BRAND.primary }}>
          Log In →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#f4f6fb' }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <Link href="/community" className="text-sm text-gray-400 hover:underline">← Community</Link>
          <h1 className="text-2xl font-extrabold mt-2" style={{ color: BRAND.primary }}>Ask a Question</h1>
          <p className="text-sm text-gray-500 mt-0.5">Share your question with the community and get help from peers.</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. When should I use 'which' vs 'that'?"
              maxLength={200}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20"
            />
            <p className="text-xs text-gray-300 mt-1 text-right">{title.length}/200</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Details *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Provide context, examples, or specific areas you need help with…"
              rows={8}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none outline-none focus:ring-2 focus:ring-[#141c52]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
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
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => create()}
              disabled={isPending || !title.trim() || !body.trim()}
              className="px-7 py-2.5 rounded-full text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              {isPending ? 'Posting…' : 'Post Question →'}
            </button>
            <Link href="/community" className="text-sm text-gray-400 hover:underline">Cancel</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
