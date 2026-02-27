'use client';

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { uploadAnalysis, getAnalysisResult } from '@/lib/api/analysis';
import api from '@/lib/api';
import { useAnalysisStatus } from '@/hooks/useAnalysisStatus';
import ShareButton from '@/components/analyze/ShareButton';
import type { AnalysisResult, FillerWord, GrammarError } from '@/types/analysis';

const ACCEPT = ['audio/mpeg', 'audio/wav', 'video/mp4', 'video/quicktime'];
const MAX_BYTES = 1024 * 1024 * 1024; // 1 GB

type PageState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';
type Tab = 'transcript' | 'scores' | 'plan' | 'compare';

// ─── Score Gauge ─────────────────────────────────────────────────────────────
function ScoreArc({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const fill = (score / 100) * arc;
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="80" viewBox="0 0 100 80">
        <defs>
          <linearGradient id={`g-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FADB43" />
            <stop offset="100%" stopColor="#fe9940" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={`${-circ * 0.125}`}
          strokeLinecap="round" transform="rotate(-135 50 60)" />
        <circle cx="50" cy="60" r={r} fill="none" stroke={`url(#g-${label})`} strokeWidth="8"
          strokeDasharray={`${fill} ${circ}`} strokeDashoffset={`${-circ * 0.125}`}
          strokeLinecap="round" transform="rotate(-135 50 60)" />
        <text x="50" y="62" textAnchor="middle" fontSize="16" fontWeight="800" fill="#141c52">{score}</text>
      </svg>
      <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
    </div>
  );
}

// ─── Transcript Tab ───────────────────────────────────────────────────────────
function TranscriptTab({ result }: { result: AnalysisResult }) {
  const [copied, setCopied] = useState(false);
  const fillerSet = new Set(result.fillerWords.map((f: FillerWord) => f.word.toLowerCase()));
  const words = result.transcript.split(/\s+/);

  function copyTranscript() {
    navigator.clipboard.writeText(result.transcript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Full Transcript</h3>
          <button
            onClick={copyTranscript}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
            style={copied
              ? { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }
              : { backgroundColor: 'white', color: '#141c52', borderColor: '#e5e7eb' }}
          >
            {copied ? '✓ Copied!' : 'Copy Transcript'}
          </button>
        </div>
        <p className="text-gray-700 leading-relaxed text-sm">
          {words.map((w, i) => {
            const clean = w.toLowerCase().replace(/[^a-z]/g, '');
            return fillerSet.has(clean) ? (
              <mark key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">{w} </mark>
            ) : (
              <span key={i}>{w} </span>
            );
          })}
        </p>
      </div>
      {result.fillerWords.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-3">Filler Words Detected</h3>
          <div className="flex flex-wrap gap-2">
            {result.fillerWords.map((f: FillerWord) => (
              <span key={f.word} className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-medium">
                "{f.word}" × {f.count}
              </span>
            ))}
          </div>
        </div>
      )}
      {result.grammarErrors.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-red-800 mb-3">Grammar Notes</h3>
          <div className="space-y-2">
            {result.grammarErrors.map((e: GrammarError, i: number) => (
              <div key={i} className="text-sm">
                <span className="line-through text-red-400 mr-2">"{e.text}"</span>
                <span className="text-green-700 font-medium">→ "{e.suggestion}"</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Scores Tab ───────────────────────────────────────────────────────────────
function ScoresTab({ result }: { result: AnalysisResult }) {
  const scores = [
    { label: 'Fluency', value: result.fluencyScore },
    { label: 'Vocabulary', value: result.vocabularyScore },
    { label: 'Overall', value: result.overallScore },
  ];
  const bars = [
    { label: 'Pace', value: Math.min(100, Math.round((result.paceWpm / 180) * 100)), raw: `${result.paceWpm} wpm` },
  ];
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">Score Overview</h3>
        <div className="flex justify-around flex-wrap gap-4">
          {scores.map((s) => <ScoreArc key={s.label} score={s.value} label={s.label} color="#FADB43" />)}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Tone & Pace</h3>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-500">Detected tone:</span>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 capitalize">{result.tone || 'neutral'}</span>
        </div>
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{b.label}</span>
              <span>{b.raw}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${b.value}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">AI Narrative</h3>
        <p className="text-gray-700 text-sm leading-relaxed">{result.narrativeFeedback || 'No narrative available.'}</p>
      </div>
    </div>
  );
}

// ─── Improvement Plan Tab ─────────────────────────────────────────────────────
function PlanTab({ result }: { result: AnalysisResult }) {
  const priorities = result.improvementPriorities;
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Top Priorities</h3>
        {priorities.length === 0 ? (
          <p className="text-gray-400 text-sm">No priorities identified — great job!</p>
        ) : (
          <ol className="space-y-3">
            {priorities.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 pt-0.5">{p}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="rounded-xl p-6" style={{ background: '#141c52' }}>
        <h3 className="text-white font-semibold mb-2">Keep improving</h3>
        <p className="text-white/70 text-sm mb-4">Practice daily with our exercises to work on these areas.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/practice" className="text-sm font-semibold px-4 py-2 rounded-full"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
            Practice Now →
          </Link>
          <Link href="/review" className="text-sm font-semibold px-4 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors">
            Get Expert Review →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Compare Tab ──────────────────────────────────────────────────────────────
function CompareTab({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Benchmark Comparison</h3>
        {[
          { label: 'Fluency', yours: result.fluencyScore, avg: 71, top: 92 },
          { label: 'Vocabulary', yours: result.vocabularyScore, avg: 68, top: 89 },
          { label: 'Overall', yours: result.overallScore, avg: 69, top: 90 },
        ].map((row) => (
          <div key={row.label} className="mb-5">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{row.label}</span>
              <span>Avg {row.avg} · Top 10% {row.top}</span>
            </div>
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="absolute h-full rounded-full opacity-30" style={{ width: `${row.top}%`, background: '#141c52' }} />
              <div className="absolute h-full rounded-full opacity-50" style={{ width: `${row.avg}%`, background: '#6366f1' }} />
              <div className="absolute h-full rounded-full" style={{ width: `${row.yours}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
            </div>
            <div className="flex gap-4 text-xs mt-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }} /> You: <b>{row.yours}</b></span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /> Avg: {row.avg}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-navy-700 inline-block opacity-50" /> Top 10%: {row.top}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link href="/analyze" className="text-sm font-semibold underline text-indigo-600">Analyze another recording →</Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function AnalyzeContent() {
  const searchParams = useSearchParams();
  const [pageState, setPageState] = useState<PageState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadPct, setUploadPct] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('transcript');
  const inputRef = useRef<HTMLInputElement>(null);
  // Capture the ?session= param once on mount (avoids stale-closure issues)
  const initialSessionRef = useRef(searchParams.get('session'));

  // Fetch prior sessions to compute score delta (shared cache with dashboard)
  const { data: prevSessions = [] } = useQuery<Array<{
    id: string; status: string; created_at: string;
    result?: { overall_score: number };
  }>>({
    queryKey: ['analysis-sessions-widget'],
    queryFn: () => api.get('/analysis/sessions/').then((r) => r.data).catch(() => []),
    retry: false,
  });

  const { status: pollingStatus } = useAnalysisStatus(
    pageState === 'processing' ? sessionId : null
  );

  // When Celery finishes, fetch result
  const fetchResult = useCallback(async (sid: string) => {
    try {
      const r = await getAnalysisResult(sid);
      setResult(r);
      setPageState('done');
    } catch {
      setErrorMsg('Failed to load results. Please try again.');
      setPageState('error');
    }
  }, []);

  // If opened via /analyze?session=id (from history "View →"), load that session
  useEffect(() => {
    const sid = initialSessionRef.current;
    if (sid) {
      setSessionId(sid);
      setPageState('processing');
      fetchResult(sid);
    }
  }, [fetchResult]);

  // Watch polling status
  const prevStatus = useRef<string | null>(null);
  if (pollingStatus && pollingStatus !== prevStatus.current) {
    prevStatus.current = pollingStatus;
    if (pollingStatus === 'done' && sessionId) {
      fetchResult(sessionId);
    } else if (pollingStatus === 'failed') {
      setErrorMsg('Analysis failed. Please try a different file.');
      setPageState('error');
    }
  }

  const handleFile = useCallback(async (file: File) => {
    if (!ACCEPT.includes(file.type)) {
      setErrorMsg('Unsupported file type. Use MP3, WAV, MP4, or MOV.');
      setPageState('error');
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrorMsg('File exceeds 1 GB limit.');
      setPageState('error');
      return;
    }
    const fileType = file.type.startsWith('video') ? 'video' : 'audio';
    setPageState('uploading');
    setUploadPct(0);
    setErrorMsg('');

    try {
      const res = await uploadAnalysis(file, fileType, setUploadPct);
      setUploadPct(100);
      setSessionId(res.sessionId);
      setPageState('processing');
    } catch {
      setErrorMsg('Upload failed. Check your connection and try again.');
      setPageState('error');
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'transcript', label: 'Transcript' },
    { key: 'scores', label: 'Scores' },
    { key: 'plan', label: 'Improvement Plan' },
    { key: 'compare', label: 'Compare' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#141c52' }}>Analyze Your Speech</h1>
            <p className="text-gray-500">Upload a recording to get your communication score, transcript, and personalized feedback.</p>
          </div>
          <Link href="/analyze/history"
            className="shrink-0 text-sm font-medium hover:underline mt-1"
            style={{ color: '#141c52' }}>
            History →
          </Link>
        </div>

        {/* Upload / Processing / Error states */}
        {pageState !== 'done' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => pageState === 'idle' || pageState === 'error' ? inputRef.current?.click() : undefined}
            className="rounded-2xl border-2 transition-all p-10 text-center mb-6 cursor-pointer"
            style={{
              borderColor: isDragging ? '#FADB43' : pageState === 'error' ? '#ef4444' : '#e5e7eb',
              backgroundColor: isDragging ? '#fffde7' : pageState === 'error' ? '#fef2f2' : 'white',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".mp3,.wav,.mp4,.mov,audio/*,video/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            {pageState === 'idle' && (
              <>
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }}>
                  <svg className="w-8 h-8" style={{ color: '#141c52' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-700 mb-1">Drop your file here or click to browse</p>
                <p className="text-sm text-gray-400">MP3, WAV, MP4, MOV · Max 1 GB</p>
              </>
            )}

            {pageState === 'uploading' && (
              <>
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }}>
                  <svg className="w-6 h-6" style={{ color: '#141c52' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="font-medium text-gray-700 mb-3">Uploading… {uploadPct}%</p>
                <div className="max-w-xs mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${uploadPct}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
                </div>
              </>
            )}

            {pageState === 'processing' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="font-medium text-gray-700 mb-1">Analyzing your speech…</p>
                <p className="text-sm text-gray-400">This takes 30–90 seconds depending on file length.</p>
                <p className="text-xs text-gray-300 mt-2 uppercase tracking-wide">{pollingStatus ?? 'pending'}</p>
              </>
            )}

            {pageState === 'error' && (
              <>
                <div className="w-12 h-12 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="font-medium text-red-700 mb-1">{errorMsg}</p>
                <p className="text-sm text-gray-400">Click to try again</p>
              </>
            )}
          </div>
        )}

        {/* Results */}
        {pageState === 'done' && result && (() => {
          const prevDone = prevSessions
            .filter((s) => s.status === 'done' && s.result && String(s.id) !== sessionId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          const prevScore = prevDone[0]?.result?.overall_score ?? null;
          const scoreDelta = prevScore !== null ? result.overallScore - prevScore : null;
          return (
          <div>
            {/* Overall score banner */}
            <div className="rounded-2xl p-6 mb-6 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg,#141c52,#1e2d78)' }}>
              <div>
                <p className="text-white/70 text-sm mb-1">Overall Communication Score</p>
                <p className="text-5xl font-black text-white">{result.overallScore}<span className="text-xl font-normal text-white/50"> / 100</span></p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-white/60 text-xs capitalize">Tone: {result.tone || 'Neutral'}</p>
                  {scoreDelta !== null && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: scoreDelta >= 0 ? '#dcfce7' : '#fee2e2',
                        color: scoreDelta >= 0 ? '#166534' : '#991b1b',
                      }}
                    >
                      {scoreDelta >= 0 ? '▲' : '▼'} {Math.abs(scoreDelta)} pts vs last
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {sessionId && <ShareButton sessionId={sessionId} score={result.overallScore} />}
                <button
                  onClick={() => { setPageState('idle'); setResult(null); setSessionId(null); }}
                  className="text-sm font-semibold px-4 py-2 rounded-full"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                >
                  Analyze Another →
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
                  style={{
                    borderColor: activeTab === t.key ? '#141c52' : 'transparent',
                    color: activeTab === t.key ? '#141c52' : '#6b7280',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'transcript' && <TranscriptTab result={result} />}
            {activeTab === 'scores' && <ScoresTab result={result} />}
            {activeTab === 'plan' && <PlanTab result={result} />}
            {activeTab === 'compare' && <CompareTab result={result} />}
          </div>
          );
        })()}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense>
      <AnalyzeContent />
    </Suspense>
  );
}
