'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const BRAND = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

interface WeakPhrase { original: string; suggestion: string; }
interface ResumeFeedback {
  language_score: number;
  ats_score: number;
  top_issues: string[];
  strong_phrases: string[];
  weak_phrases: WeakPhrase[];
  missing_keywords: string[];
  narrative: string;
}

interface SessionItem {
  id: number;
  target_role: string;
  language_score: number | null;
  ats_score: number | null;
  created_at: string;
  narrative: string;
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function ResumeAnalyzerPage() {
  const { isLoggedIn } = useAuthStore();
  const qc = useQueryClient();

  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [feedback, setFeedback] = useState<ResumeFeedback | null>(null);

  const { data: history } = useQuery<SessionItem[]>({
    queryKey: ['resume-sessions'],
    queryFn: () => api.get('/writing/resume/sessions/').then((r) => r.data),
    enabled: isLoggedIn,
  });

  const { mutate: analyze, isPending } = useMutation({
    mutationFn: () => api.post('/writing/resume/analyze/', { resume_text: resumeText, target_role: targetRole }),
    onSuccess: (res) => {
      setFeedback(res.data.feedback);
      qc.invalidateQueries({ queryKey: ['resume-sessions'] });
    },
  });

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#f4f6fb' }}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <Link href="/practice" className="text-sm text-gray-400 hover:underline">← Practice Hub</Link>
          <h1 className="text-2xl font-extrabold mt-2" style={{ color: BRAND.primary }}>Resume / CV Analyzer</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Get ATS compatibility score, language quality feedback, and phrase-level suggestions.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Target Role (optional)
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Product Manager"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#141c52]/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here (plain text preferred)…"
              rows={12}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none outline-none focus:ring-2 focus:ring-[#141c52]/20"
            />
          </div>
          <div className="flex justify-end">
            {!isLoggedIn ? (
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-full text-sm font-bold"
                style={{ background: BRAND.gradient, color: BRAND.primary }}
              >
                Log in to Analyze
              </Link>
            ) : (
              <button
                onClick={() => analyze()}
                disabled={isPending || !resumeText.trim()}
                className="px-6 py-2.5 rounded-full text-sm font-bold transition-opacity disabled:opacity-50"
                style={{ background: BRAND.gradient, color: BRAND.primary }}
              >
                {isPending ? 'Analyzing…' : 'Analyze Resume →'}
              </button>
            )}
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="space-y-4">

            {/* Score bars */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
              <ScoreBar label="Language Quality" score={feedback.language_score} color="#141c52" />
              <ScoreBar label="ATS Compatibility" score={feedback.ats_score} color="#16a34a" />
            </div>

            {/* Narrative */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold mb-1" style={{ color: BRAND.primary }}>Summary</p>
              <p className="text-sm text-gray-600 leading-relaxed">{feedback.narrative}</p>
            </div>

            {/* Top issues */}
            {feedback.top_issues?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold mb-3" style={{ color: BRAND.primary }}>Top Issues</p>
                <ul className="space-y-1.5">
                  {feedback.top_issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
                      <span className="mt-0.5">⚠</span>{issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strong phrases */}
            {feedback.strong_phrases?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold mb-3" style={{ color: BRAND.primary }}>Strong Phrases</p>
                <div className="flex flex-wrap gap-2">
                  {feedback.strong_phrases.map((p, i) => (
                    <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weak phrases */}
            {feedback.weak_phrases?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold mb-3" style={{ color: BRAND.primary }}>Phrase Improvements</p>
                <div className="space-y-2">
                  {feedback.weak_phrases.map((p, i) => (
                    <div key={i} className="flex flex-col gap-0.5 text-sm p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                      <span className="line-through text-yellow-700">{p.original}</span>
                      <span className="text-green-700">→ {p.suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {feedback.missing_keywords?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold mb-3" style={{ color: BRAND.primary }}>Suggested Keywords to Add</p>
                <div className="flex flex-wrap gap-2">
                  {feedback.missing_keywords.map((kw, i) => (
                    <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {isLoggedIn && history && history.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-semibold mb-3" style={{ color: BRAND.primary }}>Recent Analyses</p>
            <div className="space-y-2">
              {history.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 text-sm p-3 rounded-xl bg-gray-50">
                  <div>
                    <span className="font-medium text-gray-700">{s.target_role || 'General Resume'}</span>
                    {s.narrative && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.narrative}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {s.language_score != null && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{s.language_score}</span>
                    )}
                    {s.ats_score != null && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700">ATS {s.ats_score}</span>
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
