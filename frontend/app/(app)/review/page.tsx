'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface Expert {
  id: number;
  name: string;
  bio: string;
  rating_avg: number;
  review_count: number;
  specialties: string[];
  languages: string[];
  price_per_review: number;
  photo_url?: string;
}

const REVIEW_TYPES = [
  { key: 'general', label: 'General Feedback', desc: 'Holistic review of your communication style, structure, and delivery.', icon: '🎙️' },
  { key: 'ielts', label: 'IELTS Speaking', desc: 'Band score prediction with task-specific feedback and tips.', icon: '📋' },
  { key: 'toefl', label: 'TOEFL Speaking', desc: 'Scored response with recommendations per speaking task type.', icon: '📝' },
  { key: 'business', label: 'Business English', desc: 'Professional tone, vocabulary, and presentation delivery review.', icon: '💼' },
  { key: 'presentation', label: 'Presentation', desc: 'Slide narrative, opening/closing, storytelling, and pacing.', icon: '📊' },
];

const STEPS = ['Review Type', 'Upload', 'Choose Expert', 'Payment', 'Confirm'];

// ─── Step components ──────────────────────────────────────────────────────────
function StepType({ selected, onSelect }: { selected: string; onSelect: (k: string) => void }) {
  return (
    <div className="space-y-3">
      {REVIEW_TYPES.map((t) => (
        <button
          key={t.key}
          onClick={() => onSelect(t.key)}
          className="w-full text-left rounded-xl border-2 p-4 transition-all"
          style={{
            borderColor: selected === t.key ? '#141c52' : '#e5e7eb',
            backgroundColor: selected === t.key ? '#f0f2ff' : 'white',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{t.icon}</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#141c52' }}>{t.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
            </div>
            {selected === t.key && (
              <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                ✓
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function StepUpload({ file, onFile }: { file: File | null; onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Upload the video or audio recording you want reviewed. The expert panel will watch/listen and provide written + video feedback within 48 hours.
      </p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => ref.current?.click()}
        className="rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all"
        style={{ borderColor: dragging ? '#FADB43' : '#e5e7eb', backgroundColor: dragging ? '#fffde7' : 'white' }}
      >
        <input ref={ref} type="file" accept="video/*,audio/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        {file ? (
          <>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }}>
              <svg className="w-6 h-6" style={{ color: '#141c52' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700">{file.name}</p>
            <p className="text-xs text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB · Click to change</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-gray-100">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="font-semibold text-gray-600">Drop your recording here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">MP3, WAV, MP4, MOV</p>
          </>
        )}
      </div>
    </div>
  );
}

function StepExpert({ selectedId, onSelect }: { selectedId: number | null; onSelect: (id: number | null) => void }) {
  const { data: experts = [], isLoading } = useQuery<Expert[]>({
    queryKey: ['review-experts'],
    queryFn: () => api.get('/review/experts/').then((r) => r.data),
  });

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Pick a specific expert, or let us auto-assign the best available reviewer.
      </p>
      <button
        onClick={() => onSelect(null)}
        className="w-full text-left rounded-xl border-2 p-4 mb-4 transition-all"
        style={{
          borderColor: selectedId === null ? '#141c52' : '#e5e7eb',
          backgroundColor: selectedId === null ? '#f0f2ff' : 'white',
        }}
      >
        <p className="font-semibold text-sm" style={{ color: '#141c52' }}>⚡ Auto-assign (recommended)</p>
        <p className="text-xs text-gray-500 mt-0.5">We pick the expert with the fastest turnaround and highest rating for your review type.</p>
      </button>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {experts.map((e) => (
            <button
              key={e.id}
              onClick={() => onSelect(e.id)}
              className="w-full text-left rounded-xl border-2 p-4 transition-all"
              style={{
                borderColor: selectedId === e.id ? '#141c52' : '#e5e7eb',
                backgroundColor: selectedId === e.id ? '#f0f2ff' : 'white',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                  style={{ backgroundColor: '#141c52' }}>
                  {e.name?.[0] ?? 'E'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm" style={{ color: '#141c52' }}>{e.name}</p>
                    <span className="text-xs text-amber-500">★ {e.rating_avg?.toFixed(1) ?? '—'}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{(e.specialties ?? []).join(' · ')}</p>
                </div>
                <p className="text-sm font-bold flex-shrink-0" style={{ color: '#141c52' }}>
                  ${e.price_per_review ?? 9}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StepPayment({ reviewType, expertId }: { reviewType: string; expertId: number | null }) {
  return (
    <div className="space-y-5">
      <div className="bg-gray-50 rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-3" style={{ color: '#141c52' }}>Order Summary</h3>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Expert Panel Review</span>
          <span>$9.00</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="capitalize">Type: {reviewType}</span>
          <span>{expertId ? `Expert #${expertId}` : 'Auto-assigned'}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold" style={{ color: '#141c52' }}>
          <span>Total</span>
          <span>$9.00</span>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-sm mb-4 text-gray-700">Card Details</h3>
        <div className="space-y-3">
          <input disabled placeholder="Card number (Stripe integration coming soon)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50" />
          <div className="grid grid-cols-2 gap-3">
            <input disabled placeholder="MM / YY" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50" />
            <input disabled placeholder="CVC" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">🔒 Payments powered by Stripe. Your card is never stored.</p>
      </div>
    </div>
  );
}

function StepConfirm({ reviewType, file, expertId }: { reviewType: string; file: File | null; expertId: number | null }) {
  return (
    <div className="text-center space-y-5">
      <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
        style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }}>
        <svg className="w-8 h-8" style={{ color: '#141c52' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#141c52' }}>Review Submitted!</h2>
        <p className="text-gray-500 text-sm">Your expert will deliver written + video feedback within 48 hours.</p>
      </div>
      <div className="bg-gray-50 rounded-xl p-5 text-left text-sm space-y-2">
        <div className="flex justify-between"><span className="text-gray-400">Type</span><span className="font-medium capitalize">{reviewType}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">File</span><span className="font-medium">{file?.name ?? '—'}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Expert</span><span className="font-medium">{expertId ? `Expert #${expertId}` : 'Auto-assigned'}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">ETA</span><span className="font-medium text-green-600">Within 48 hours</span></div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/dashboard" className="font-semibold px-6 py-2.5 rounded-full text-sm text-white"
          style={{ backgroundColor: '#141c52' }}>
          Go to Dashboard
        </Link>
        <Link href="/review" onClick={() => window.location.reload()} className="font-semibold px-6 py-2.5 rounded-full text-sm border border-gray-200 text-gray-600">
          Submit Another
        </Link>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ReviewPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [reviewType, setReviewType] = useState('general');
  const [file, setFile] = useState<File | null>(null);
  const [expertId, setExpertId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: () =>
      api.post('/review/submit/', { review_type: reviewType, expert_id: expertId }).then((r) => r.data),
    onSuccess: (data) => {
      setStep(4);
      setSubmitted(true);
      // After a short delay, redirect to the status tracker
      if (data?.review_id) {
        setTimeout(() => router.push(`/review/${data.review_id}`), 2500);
      }
    },
  });

  const canProceed = [
    !!reviewType,
    !!file,
    true, // expert optional
    true, // payment stub
  ][step] ?? true;

  const handleNext = () => {
    if (step === 3) {
      submitMutation.mutate();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#141c52' }}>Expert Panel Review</h1>
          <p className="text-gray-500 text-sm">Get written + video feedback from certified speech coaches within 48 hours.</p>
        </div>

        {/* Progress */}
        {!submitted && (
          <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1 min-w-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: i < step ? '#22c55e' : i === step ? '#141c52' : '#e5e7eb',
                    color: i <= step ? 'white' : '#9ca3af',
                  }}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-0.5 w-6 flex-shrink-0"
                    style={{ backgroundColor: i < step ? '#22c55e' : '#e5e7eb' }} />
                )}
              </div>
            ))}
            <p className="ml-2 text-sm font-medium flex-shrink-0" style={{ color: '#141c52' }}>{STEPS[step]}</p>
          </div>
        )}

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          {step === 0 && <StepType selected={reviewType} onSelect={setReviewType} />}
          {step === 1 && <StepUpload file={file} onFile={setFile} />}
          {step === 2 && <StepExpert selectedId={expertId} onSelect={setExpertId} />}
          {step === 3 && <StepPayment reviewType={reviewType} expertId={expertId} />}
          {step === 4 && <StepConfirm reviewType={reviewType} file={file} expertId={expertId} />}
        </div>

        {/* Navigation */}
        {!submitted && (
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed || submitMutation.isPending}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
            >
              {submitMutation.isPending ? 'Submitting…' : step === 3 ? 'Submit & Pay $9 →' : 'Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
