'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface ReviewRatingProps {
  reviewId: number;
  existingRating: number | null;
}

export default function ReviewRating({ reviewId, existingRating }: ReviewRatingProps) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(existingRating ?? 0);
  const [submitted, setSubmitted] = useState(!!existingRating);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (rating: number) =>
      api.post(`/review/${reviewId}/rate/`, { rating }).then((r) => r.data),
    onSuccess: () => {
      setSubmitted(true);
      qc.invalidateQueries({ queryKey: ['review', String(reviewId)] });
    },
  });

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-sm mb-3" style={{ color: '#141c52' }}>Your Rating</h3>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className={`w-6 h-6 ${i < selected ? 'text-amber-400' : 'text-gray-200'}`}
              fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-sm text-gray-500 ml-2">Thank you for your feedback!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-bold text-sm mb-3" style={{ color: '#141c52' }}>Rate This Review</h3>
      <p className="text-xs text-gray-500 mb-3">How helpful was the expert feedback?</p>
      <div className="flex items-center gap-2 mb-4">
        {Array.from({ length: 5 }).map((_, i) => {
          const val = i + 1;
          return (
            <button
              key={i}
              onMouseEnter={() => setHovered(val)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setSelected(val)}
              className="transition-transform hover:scale-110"
            >
              <svg className={`w-7 h-7 transition-colors ${i < (hovered || selected) ? 'text-amber-400' : 'text-gray-200'}`}
                fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => selected > 0 && mutation.mutate(selected)}
        disabled={selected === 0 || mutation.isPending}
        className="w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
      >
        {mutation.isPending ? 'Submitting…' : 'Submit Rating'}
      </button>
    </div>
  );
}
