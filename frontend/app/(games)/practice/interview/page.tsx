'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

const MODES = [
  { value: 'behavioral', label: 'Behavioral', emoji: '🧠' },
  { value: 'technical',  label: 'Technical',  emoji: '💻' },
  { value: 'hr',         label: 'HR / Competency', emoji: '🤝' },
  { value: 'mixed',      label: 'Mixed',      emoji: '🎯' },
];

const DIFFS = [
  { value: 'easy',   label: 'Entry Level', color: '#16a34a', bg: '#dcfce7' },
  { value: 'medium', label: 'Mid Level',   color: '#d97706', bg: '#fef3c7' },
  { value: 'hard',   label: 'Senior Level',color: '#dc2626', bg: '#fee2e2' },
];

type Phase = 'setup' | 'active' | 'finished';

interface Turn {
  role: 'user' | 'assistant';
  content: string;
  feedback?: string;
  score?: number;
  ideal_answer?: string;
  ts: string;
}

interface SessionItem {
  id: number;
  role: string;
  mode: string;
  difficulty: string;
  status: string;
  overall_score: number | null;
  started_at: string;
}

interface AnswerResp {
  feedback: string;
  score: number;
  ideal_answer: string;
  next_question: string | null;
}

interface FinishResp {
  overall_score: number;
  summary_feedback: string;
  strengths: string[];
  improvements: string[];
}

export default function InterviewPage() {
  const { isLoggedIn } = useAuthStore();
  const qc = useQueryClient();

  const [phase, setPhase]         = useState<Phase>('setup');
  const [role, setRole]           = useState('');
  const [companyType, setCompanyType] = useState('');
  const [mode, setMode]           = useState('behavioral');
  const [difficulty, setDifficulty] = useState('medium');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [turns, setTurns]         = useState<Turn[]>([]);
  const [answer, setAnswer]       = useState('');
  const [lastResp, setLastResp]   = useState<AnswerResp | null>(null);
  const [showIdeal, setShowIdeal] = useState(false);
  const [report, setReport]       = useState<FinishResp | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: history } = useQuery<SessionItem[]>({
    queryKey: ['interview-sessions'],
    queryFn: () => api.get('/interview/my/').then((r) => r.data),
    enabled: isLoggedIn,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  const { mutate: startSession, isPending: starting } = useMutation({
    mutationFn: () => api.post('/interview/start/', { role, company_type: companyType, mode, difficulty }),
    onSuccess: (res) => {
      setSessionId(res.data.session_id);
      setTurns([{ role: 'assistant', content: res.data.opening_message, ts: new Date().toISOString() }]);
      setPhase('active');
      qc.invalidateQueries({ queryKey: ['interview-sessions'] });
    },
  });

  const { mutate: sendAnswer, isPending: sending } = useMutation({
    mutationFn: () => api.post(`/interview/${sessionId}/answer/`, { answer }),
    onSuccess: (res) => {
      const r: AnswerResp = res.data;
      setTurns((prev) => [
        ...prev,
        { role: 'user', content: answer, ts: new Date().toISOString() },
        ...(r.next_question ? [{ role: 'assistant' as const, content: r.next_question, feedback: r.feedback, score: r.score, ideal_answer: r.ideal_answer, ts: new Date().toISOString() }] : []),
      ]);
      setLastResp(r);
      setAnswer('');
      setShowIdeal(false);
      if (!r.next_question) finishSession();
    },
  });

  const { mutate: finishSession, isPending: finishing } = useMutation({
    mutationFn: () => api.post(`/interview/${sessionId}/finish/`),
    onSuccess: (res) => {
      setReport(res.data);
      setPhase('finished');
      qc.invalidateQueries({ queryKey: ['interview-sessions'] });
    },
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: '#f4f6fb' }}>
        <span className="text-5xl">🎯</span>
        <h2 className="text-lg font-bold" style={{ color: BRAND.primary }}>Sign in to practice interviews</h2>
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
          <Link href="/practice" className="text-sm text-gray-400 hover:underline">← Practice Hub</Link>
          <h1 className="text-2xl font-extrabold mt-2" style={{ color: BRAND.primary }}>Interview Simulation</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-powered text interview with real-time feedback and scoring.</p>
        </div>

        {/* Setup phase */}
        {phase === 'setup' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Target Role *</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Software Engineer, Product Manager"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Company Type (optional)</label>
              <input
                type="text"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                placeholder="e.g. Startup, FAANG, Consulting firm"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20"
              />
            </div>

            {/* Mode chips */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Interview Type</label>
              <div className="flex flex-wrap gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    className="px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-all"
                    style={mode === m.value
                      ? { background: BRAND.primary, color: '#fff', borderColor: BRAND.primary }
                      : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty chips */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Level</label>
              <div className="flex flex-wrap gap-2">
                {DIFFS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className="px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-all"
                    style={difficulty === d.value
                      ? { background: d.color, color: '#fff', borderColor: d.color }
                      : { background: d.bg, color: d.color, borderColor: d.color + '60' }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => startSession()}
              disabled={starting || !role.trim()}
              className="w-full py-3 rounded-full text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              {starting ? 'Starting…' : 'Start Interview →'}
            </button>
          </div>
        )}

        {/* Active phase */}
        {phase === 'active' && (
          <div className="space-y-4">

            {/* Chat bubbles */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 max-h-[50vh] overflow-y-auto">
              {turns.map((t, i) => (
                <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      t.role === 'user' ? 'rounded-br-sm text-white' : 'rounded-bl-sm bg-gray-100 text-gray-700'
                    }`}
                    style={t.role === 'user' ? { backgroundColor: BRAND.primary } : undefined}
                  >
                    {t.content}
                    {/* Feedback under AI turn */}
                    {t.role === 'assistant' && t.feedback && (
                      <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                        <p className="text-xs text-gray-500">{t.feedback}</p>
                        {t.score !== undefined && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>
                            Score: {t.score}/10
                          </span>
                        )}
                        {t.ideal_answer && (
                          <button
                            onClick={() => setShowIdeal((v) => !v)}
                            className="block text-xs text-blue-600 hover:underline mt-1"
                          >
                            {showIdeal ? 'Hide' : 'See'} ideal answer
                          </button>
                        )}
                        {showIdeal && t.ideal_answer && (
                          <p className="text-xs text-gray-500 italic border-l-2 border-blue-200 pl-2 mt-1">{t.ideal_answer}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Answer input */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer…"
                rows={4}
                className="w-full p-4 text-sm text-gray-700 resize-none outline-none"
              />
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
                <button
                  onClick={() => finishSession()}
                  disabled={finishing}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                >
                  End Interview
                </button>
                <button
                  onClick={() => sendAnswer()}
                  disabled={sending || !answer.trim()}
                  className="px-6 py-2 rounded-full text-sm font-bold transition-opacity disabled:opacity-50"
                  style={{ background: BRAND.gradient, color: BRAND.primary }}
                >
                  {sending ? 'Sending…' : 'Send Answer →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Finished phase */}
        {phase === 'finished' && report && (
          <div className="space-y-4">
            {/* Score */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Overall Score</p>
              <span
                className="text-6xl font-extrabold"
                style={{ color: report.overall_score >= 75 ? '#16a34a' : report.overall_score >= 50 ? '#d97706' : '#dc2626' }}
              >
                {report.overall_score}
              </span>
              <span className="text-2xl text-gray-300 font-bold">/100</span>
              <p className="text-sm text-gray-600 leading-relaxed mt-4 max-w-sm mx-auto">{report.summary_feedback}</p>
            </div>

            {/* Strengths + Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.strengths.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-sm font-semibold mb-3 text-green-700">Strengths</p>
                  <ul className="space-y-2">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.improvements.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-sm font-semibold mb-3 text-orange-600">To Improve</p>
                  <ul className="space-y-2">
                    {report.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => { setPhase('setup'); setTurns([]); setReport(null); setLastResp(null); setSessionId(null); }}
              className="w-full py-3 rounded-full text-sm font-bold"
              style={{ background: BRAND.gradient, color: BRAND.primary }}
            >
              Practice Again →
            </button>
          </div>
        )}

        {/* History */}
        {isLoggedIn && history && history.length > 0 && phase === 'setup' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-semibold mb-3" style={{ color: BRAND.primary }}>Recent Sessions</p>
            <div className="space-y-2">
              {history.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 text-sm p-3 rounded-xl bg-gray-50">
                  <div>
                    <span className="font-medium text-gray-700">{s.role}</span>
                    <span className="text-gray-400 ml-2 text-xs capitalize">{s.mode} · {s.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.status === 'finished' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {s.status}
                    </span>
                    {s.overall_score != null && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{s.overall_score}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
