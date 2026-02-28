'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

interface SavedWord {
  id: number;
  word: string;
  definition: string;
  note: string;
  saved_at: string;
}

export default function SavedWordsPage() {
  const { isLoggedIn } = useAuthStore();
  const qc = useQueryClient();

  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState<number | null>(null);

  const { data: words, isLoading } = useQuery<SavedWord[]>({
    queryKey: ['saved-words'],
    queryFn: () => api.get('/practice/saved-words/').then((r) => r.data),
    enabled: isLoggedIn,
  });

  const { mutate: saveWord, isPending: saving } = useMutation({
    mutationFn: () => api.post('/practice/saved-words/', { word: word.trim(), definition, note }),
    onSuccess: (res) => {
      setSaved(res.data.id);
      setWord('');
      setDefinition('');
      setNote('');
      qc.invalidateQueries({ queryKey: ['saved-words'] });
      setTimeout(() => setSaved(null), 2500);
    },
  });

  const { mutate: deleteWord } = useMutation({
    mutationFn: (id: number) => api.delete(`/practice/saved-words/${id}/`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['saved-words'] });
      const prev = qc.getQueryData<SavedWord[]>(['saved-words']);
      qc.setQueryData<SavedWord[]>(['saved-words'], (old) => (old ?? []).filter((w) => w.id !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['saved-words'], ctx.prev);
    },
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: '#f4f6fb' }}>
        <span className="text-5xl">🔖</span>
        <h2 className="text-lg font-bold" style={{ color: BRAND.primary }}>Sign in to save words</h2>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-full text-sm font-bold"
          style={{ background: BRAND.gradient, color: BRAND.primary }}
        >
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
          <Link href="/practice" className="text-sm text-gray-400 hover:underline">← Practice Hub</Link>
          <h1 className="text-2xl font-extrabold mt-2" style={{ color: BRAND.primary }}>Saved Words</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your personal vocabulary list. Add words you want to remember.</p>
        </div>

        {/* Add form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
          <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>Save a New Word</p>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Word or phrase"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20"
          />
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="Definition (optional)"
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 resize-none outline-none focus:ring-2 focus:ring-[#141c52]/20"
          />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Personal note (optional)"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => saveWord()}
              disabled={saving || !word.trim()}
              className="px-6 py-2 rounded-full text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              {saving ? 'Saving…' : '+ Save Word'}
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">✓ Saved!</span>
            )}
          </div>
        </div>

        {/* Words grid */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200" style={{ borderTopColor: '#FADB43' }} />
          </div>
        ) : words && words.length > 0 ? (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {words.length} saved word{words.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {words.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 relative group shadow-sm"
                >
                  <button
                    onClick={() => deleteWord(w.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-lg leading-none"
                    aria-label="Delete"
                  >
                    ×
                  </button>
                  <p className="font-bold text-base" style={{ color: BRAND.primary }}>{w.word}</p>
                  {w.definition && (
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{w.definition}</p>
                  )}
                  {w.note && (
                    <p className="text-xs text-gray-400 mt-1.5 italic">{w.note}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-2">
                    {new Date(w.saved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔖</p>
            <p className="text-sm">No saved words yet. Add your first word above!</p>
          </div>
        )}

      </div>
    </div>
  );
}
