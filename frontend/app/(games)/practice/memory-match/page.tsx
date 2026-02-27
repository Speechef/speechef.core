'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };
const GAME_COLOR = { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' };

interface Pair {
  id: number;
  word: string;
  correct_meaning: string;
}

interface Card {
  uid: string;
  pairId: number;
  type: 'word' | 'meaning';
  text: string;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCards(pairs: Pair[]): Card[] {
  const cards: Card[] = [];
  pairs.forEach((p) => {
    cards.push({ uid: `w-${p.id}`, pairId: p.id, type: 'word', text: p.word, flipped: false, matched: false });
    cards.push({ uid: `m-${p.id}`, pairId: p.id, type: 'meaning', text: p.correct_meaning, flipped: false, matched: false });
  });
  return shuffle(cards);
}

export default function MemoryMatchPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [matched, setMatched] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const { data: pairs, isLoading, refetch } = useQuery<Pair[]>({
    queryKey: ['memory-pairs'],
    queryFn: () => api.get('/practice/memory-match/?count=6').then((r) => r.data),
  });

  useEffect(() => {
    if (pairs && pairs.length > 0) {
      setCards(buildCards(pairs));
      setFlipped([]);
      setLocked(false);
      setAttempts(0);
      setMatched(0);
      setDone(false);
    }
  }, [pairs]);

  const handleFlip = useCallback(
    (uid: string) => {
      if (locked || flipped.includes(uid)) return;
      const card = cards.find((c) => c.uid === uid);
      if (!card || card.matched) return;

      const newFlipped = [...flipped, uid];
      setCards((prev) => prev.map((c) => (c.uid === uid ? { ...c, flipped: true } : c)));
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setLocked(true);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        const [aUid, bUid] = newFlipped;
        const a = cards.find((c) => c.uid === aUid)!;
        const b = cards.find((c) => c.uid === bUid)!;
        const isMatch = a.pairId === b.pairId && a.type !== b.type;

        if (isMatch) {
          const newMatched = matched + 1;
          setMatched(newMatched);
          setCards((prev) =>
            prev.map((c) =>
              c.uid === aUid || c.uid === bUid ? { ...c, matched: true, flipped: true } : c
            )
          );
          setFlipped([]);
          setLocked(false);
          if (pairs && newMatched === pairs.length) {
            const finalScore = Math.max(0, pairs.length * 10 - Math.max(0, newAttempts - pairs.length));
            setScore(finalScore);
            api.post('/practice/guess/complete/', { score: finalScore, game: 'memory' }).catch(() => null);
            setTimeout(() => setDone(true), 400);
          }
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.uid === aUid || c.uid === bUid ? { ...c, flipped: false } : c
              )
            );
            setFlipped([]);
            setLocked(false);
          }, 900);
        }
      }
    },
    [cards, flipped, locked, attempts, matched, pairs]
  );

  function handlePlayAgain() {
    refetch();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!pairs || pairs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">No questions available yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Page header with game color chip */}
        <div className="mb-6">
          <Link href="/practice" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">← Practice</Link>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg text-sm font-semibold"
              style={{ background: GAME_COLOR.bg, color: GAME_COLOR.text }}>
              🃏 Memory Match
            </span>
            {!done && (
              <div className="flex gap-3 text-sm text-gray-500 ml-auto">
                <span>Attempts: <strong style={{ color: BRAND.primary }}>{attempts}</strong></span>
                <span>Matched: <strong style={{ color: BRAND.primary }}>{matched}/{pairs.length}</strong></span>
              </div>
            )}
          </div>
        </div>

        {done ? (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: GAME_COLOR.border }}>
            {/* Score band */}
            <div className="px-6 py-6 text-center" style={{ background: GAME_COLOR.bg }}>
              <p className="text-lg font-semibold mb-1" style={{ color: GAME_COLOR.text }}>
                All {pairs.length} pairs matched in {attempts} attempt{attempts !== 1 ? 's' : ''}!
              </p>
              <p className="text-4xl font-bold" style={{ color: BRAND.primary }}>Score: {score}</p>
            </div>
            {/* White body */}
            <div className="bg-white px-6 py-6 text-center">
              <Button
                onClick={handlePlayAgain}
                className="rounded-full font-medium text-[#141c52]"
                style={{ backgroundColor: '#FADB43' }}
              >
                Play Again
              </Button>
              <Link
                href="/practice/history?game=memory"
                className="block text-sm text-gray-400 hover:underline mt-3"
              >
                View session history →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => {
              const isRevealed = card.flipped || card.matched;
              return (
                <button
                  key={card.uid}
                  onClick={() => handleFlip(card.uid)}
                  disabled={isRevealed || locked}
                  className="h-20 rounded-xl font-semibold text-xs px-2 transition-all duration-300 cursor-pointer"
                  style={
                    card.matched
                      ? { backgroundColor: '#bbf7d0', color: '#065f46', border: '2px solid #16a34a' }
                      : isRevealed
                      ? { backgroundColor: '#FADB43', color: BRAND.primary, border: '2px solid #FADB43' }
                      : { backgroundColor: BRAND.primary, color: '#fff', border: `2px solid ${BRAND.primary}` }
                  }
                >
                  {isRevealed ? card.text : '?'}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
