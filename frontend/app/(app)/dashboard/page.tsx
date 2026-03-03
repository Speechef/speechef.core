'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import ScorecardWidget from '@/components/dashboard/ScorecardWidget';

interface Profile {
  image: string;
  current_streak: number;
  longest_streak: number;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  profile: Profile;
}

interface GameSession {
  id: number;
  game: 'guess' | 'memory' | 'scramble' | 'blitz' | 'sentence' | 'daily' | 'pronunciation';
  score: number;
  played_at: string;
}

interface RolePlaySession {
  id: number;
  status: string;
  score: number | null;
}

interface AnalysisSession {
  id: string;
  status: string;
  created_at: string;
  result?: {
    overall_score: number;
    fluency_score: number;
    vocabulary_score: number;
    pace_wpm: number;
  };
}

const GAME_LABELS: Record<string, string> = {
  guess:         'Guess the Word',
  memory:        'Memory Match',
  scramble:      'Word Scramble',
  blitz:         'Vocabulary Blitz',
  sentence:      'Sentence Builder',
  daily:         'Daily Challenge',
  pronunciation: 'Pronunciation',
};

const GAME_EMOJIS: Record<string, string> = {
  guess:         '🧠',
  memory:        '🃏',
  scramble:      '🔤',
  blitz:         '⚡',
  sentence:      '✍️',
  daily:         '🔥',
  pronunciation: '🎙️',
};

const GAME_HREFS: Record<string, string> = {
  guess:         '/practice/guess-the-word',
  memory:        '/practice/memory-match',
  scramble:      '/practice/word-scramble',
  blitz:         '/practice/vocabulary-blitz',
  sentence:      '/practice/sentence-builder',
  daily:         '/practice/daily-challenge',
  pronunciation: '/practice/pronunciation-challenge',
};

// ── Word of the day bank ──────────────────────────────────────────────────────
const WORD_BANK = [
  { word: 'Eloquent',    pron: '/ˈel.ə.kwənt/',       pos: 'adj',  def: 'Fluent and persuasive in speaking or writing.',                    ex: 'Her eloquent speech moved the entire audience to tears.' },
  { word: 'Articulate',  pron: '/ɑːrˈtɪk.jʊ.lɪt/',    pos: 'adj',  def: 'Able to express ideas clearly and coherently.',                    ex: 'An articulate speaker makes complex ideas easy to understand.' },
  { word: 'Persevere',   pron: '/ˌpɜː.sɪˈvɪər/',       pos: 'verb', def: 'Continue in a course of action despite difficulty.',               ex: 'She persevered through months of study before passing the exam.' },
  { word: 'Resilient',   pron: '/rɪˈzɪl.i.ənt/',       pos: 'adj',  def: 'Able to recover quickly from difficulties.',                       ex: 'Resilient learners bounce back from setbacks stronger than before.' },
  { word: 'Proficient',  pron: '/prəˈfɪʃ.ənt/',         pos: 'adj',  def: 'Competent and skilled in doing something.',                        ex: 'She is proficient in three languages.' },
  { word: 'Concise',     pron: '/kənˈsaɪs/',            pos: 'adj',  def: 'Giving a lot of information clearly in few words.',                 ex: 'Write a concise summary of the article in two sentences.' },
  { word: 'Elaborate',   pron: '/ɪˈlæb.ər.eɪt/',        pos: 'verb', def: 'To develop or present in further detail.',                         ex: 'Could you elaborate on your point about climate change?' },
  { word: 'Fluent',      pron: '/ˈfluː.ənt/',           pos: 'adj',  def: 'Able to speak a language easily and accurately.',                   ex: 'After two years abroad, he was fluent in Spanish.' },
  { word: 'Coherent',    pron: '/kəʊˈhɪər.ənt/',        pos: 'adj',  def: 'Logical and consistent; easy to understand.',                      ex: 'Present your ideas in a coherent, well-structured manner.' },
  { word: 'Succinct',    pron: '/səkˈsɪŋkt/',            pos: 'adj',  def: 'Briefly and clearly expressed.',                                   ex: 'The professor gave a succinct explanation of the theory.' },
  { word: 'Diligent',    pron: '/ˈdɪl.ɪ.dʒənt/',        pos: 'adj',  def: 'Showing careful and persistent work or effort.',                   ex: 'Diligent practice every day leads to rapid improvement.' },
  { word: 'Persuade',    pron: '/pəˈsweɪd/',            pos: 'verb', def: 'Cause someone to believe something through reasoning.',             ex: 'She persuaded the committee to approve the new plan.' },
  { word: 'Empathize',   pron: '/ˈem.pə.θaɪz/',         pos: 'verb', def: 'Understand and share the feelings of another person.',             ex: 'A good listener is able to empathize with the speaker.' },
  { word: 'Negotiate',   pron: '/nɪˈɡəʊ.ʃi.eɪt/',      pos: 'verb', def: 'Discuss something in order to reach an agreement.',                ex: 'They negotiated a higher salary during the job interview.' },
  { word: 'Collaborate', pron: '/kəˈlæb.ər.eɪt/',       pos: 'verb', def: 'Work jointly with others on a shared activity or project.',        ex: 'The two companies collaborated to develop a new product.' },
  { word: 'Innovative',  pron: '/ˈɪn.ə.veɪ.tɪv/',       pos: 'adj',  def: 'Featuring new ideas or methods; introducing change.',              ex: 'Innovative thinking helps companies stay ahead of the competition.' },
  { word: 'Versatile',   pron: '/ˈvɜː.sə.taɪl/',        pos: 'adj',  def: 'Able to adapt to many different functions or situations.',          ex: 'A versatile communicator adjusts their style for any audience.' },
  { word: 'Pragmatic',   pron: '/præɡˈmæt.ɪk/',         pos: 'adj',  def: 'Dealing with things sensibly and practically.',                    ex: 'Take a pragmatic approach to solving the problem.' },
  { word: 'Tenacious',   pron: '/tɪˈneɪ.ʃəs/',          pos: 'adj',  def: 'Keeping a firm hold; very determined.',                            ex: 'Her tenacious attitude helped her reach fluency in record time.' },
  { word: 'Assertive',   pron: '/əˈsɜː.tɪv/',           pos: 'adj',  def: 'Confident and direct in claiming one\'s rights or views.',          ex: 'Be assertive when negotiating your salary.' },
  { word: 'Comprehend',  pron: '/ˌkɒm.prɪˈhend/',       pos: 'verb', def: 'Understand fully; grasp the meaning of something.',                ex: 'It took several readings before she could comprehend the contract.' },
  { word: 'Meticulous',  pron: '/mɪˈtɪk.jʊ.ləs/',      pos: 'adj',  def: 'Showing great attention to detail; very precise.',                  ex: 'Meticulous preparation is the key to a great presentation.' },
  { word: 'Proactive',   pron: '/ˌprəʊˈæk.tɪv/',        pos: 'adj',  def: 'Taking initiative and acting in anticipation rather than reacting.', ex: 'Be proactive and ask questions before problems arise.' },
  { word: 'Credible',    pron: '/ˈkred.ɪ.bəl/',         pos: 'adj',  def: 'Able to be believed; convincing and trustworthy.',                  ex: 'Use evidence and examples to make your argument credible.' },
  { word: 'Nuanced',     pron: '/ˈnjuː.ɑːnst/',         pos: 'adj',  def: 'Characterised by subtle distinctions; not simple or obvious.',      ex: 'His nuanced response showed a deep understanding of the issue.' },
  { word: 'Candid',      pron: '/ˈkæn.dɪd/',            pos: 'adj',  def: 'Truthful and straightforward; open and frank.',                    ex: 'She gave a candid answer about the challenges she faced.' },
  { word: 'Deliberate',  pron: '/dɪˈlɪb.ər.ɪt/',        pos: 'adj',  def: 'Done consciously and intentionally; carefully considered.',         ex: 'His deliberate choice of words showed careful thought.' },
  { word: 'Synthesize',  pron: '/ˈsɪn.θə.saɪz/',        pos: 'verb', def: 'Combine information or ideas into a coherent whole.',               ex: 'The essay synthesizes research from several different sources.' },
  { word: 'Benchmark',   pron: '/ˈbentʃ.mɑːrk/',        pos: 'noun', def: 'A standard or point of reference used to measure progress.',        ex: 'A score of 7.0 is often the benchmark for university admission.' },
  { word: 'Discourse',   pron: '/ˈdɪs.kɔːrs/',          pos: 'noun', def: 'Written or spoken communication; a formal discussion of a topic.',  ex: 'Academic discourse requires clear structure and logical arguments.' },
];

// ── Level system ─────────────────────────────────────────────────────────────
const LEVELS = [
  { name: 'Starter',  emoji: '🌱', min: 0,  max: 25  },
  { name: 'Learner',  emoji: '📚', min: 25, max: 50  },
  { name: 'Skilled',  emoji: '⚡', min: 50, max: 75  },
  { name: 'Expert',   emoji: '🏆', min: 75, max: 101 },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Score gauge ───────────────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ * 0.75;
  const offset = circ * 0.25;
  return (
    <div className="relative flex items-center justify-center w-36 h-36 mx-auto">
      <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-[135deg]">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeDashoffset={offset}
          strokeLinecap="round" />
        <circle cx="72" cy="72" r={r} fill="none"
          stroke="url(#dashGaugeGrad)" strokeWidth="10"
          strokeDasharray={`${progress} ${circ - progress}`}
          strokeDashoffset={offset} strokeLinecap="round" />
        <defs>
          <linearGradient id="dashGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FADB43" />
            <stop offset="100%" stopColor="#fe9940" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-extrabold" style={{ color: '#141c52' }}>{score}</div>
        <div className="text-xs text-gray-400">/ 100</div>
      </div>
    </div>
  );
}

// ── 7-day activity strip ──────────────────────────────────────────────────────
function ActivityHeatmap({ sessions }: { sessions: { played_at: string }[] }) {
  const days = useMemo(() => {
    const countMap: Record<string, number> = {};
    for (const s of sessions) {
      const key = new Date(s.played_at).toDateString();
      countMap[key] = (countMap[key] || 0) + 1;
    }
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const count = countMap[d.toDateString()] ?? 0;
      const isToday = i === 6;
      return {
        label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
        fullLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        count,
        isToday,
      };
    });
  }, [sessions]);

  const COLOR = (count: number) =>
    count === 0 ? '#f3f4f6' : count === 1 ? '#fef08a' : count <= 3 ? '#fadb43' : '#fe9940';

  const activeDays = days.filter((d) => d.count > 0).length;

  return (
    <div>
      <div className="flex gap-3 justify-between">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5" title={`${day.fullLabel} — ${day.count === 0 ? 'No activity' : `${day.count} session${day.count !== 1 ? 's' : ''}`}`}>
            <span className="text-[10px] font-semibold" style={{ color: day.isToday ? '#141c52' : '#9ca3af' }}>
              {day.label}
            </span>
            <div
              className="rounded-full transition-all"
              style={{
                width: 28,
                height: 28,
                backgroundColor: COLOR(day.count),
                border: day.isToday ? '2px solid #141c52' : '2px solid transparent',
                boxShadow: day.count > 0 ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            />
            <span className="text-[10px] font-bold" style={{ color: day.count > 0 ? '#92400e' : 'transparent' }}>
              {day.count > 0 ? day.count : '·'}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-right">{activeDays} active day{activeDays !== 1 ? 's' : ''} this week</p>
    </div>
  );
}

// ── Score pill ────────────────────────────────────────────────────────────────
function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? '#166534' : score >= 50 ? '#92400e' : '#991b1b';
  const bg    = score >= 80 ? '#dcfce7' : score >= 50 ? '#fef3c7' : '#fee2e2';
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: bg }}>
      {score}
    </span>
  );
}

// ── Skill bar ─────────────────────────────────────────────────────────────────
function SkillBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium" style={{ color: '#141c52' }}>{label}</span>
        <span className="text-gray-400">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ── Weekly goal ───────────────────────────────────────────────────────────────
const WEEKLY_GOAL = 5;

function WeeklyGoals({ sessions }: { sessions: { played_at: string }[] }) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const count = sessions.filter((s) => new Date(s.played_at) >= weekStart).length;
  const pct   = Math.min(100, Math.round((count / WEEKLY_GOAL) * 100));
  const done  = count >= WEEKLY_GOAL;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Weekly Goal</p>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={done ? { backgroundColor: '#dcfce7', color: '#166534' } : { backgroundColor: '#fef3c7', color: '#92400e' }}>
          {done ? '✓ Complete!' : `${count} / ${WEEKLY_GOAL}`}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: done ? '#22c55e' : 'linear-gradient(to right,#FADB43,#fe9940)' }} />
      </div>
      <p className="text-xs text-gray-400">
        {done
          ? `Great work! You've played ${count} game${count !== 1 ? 's' : ''} this week.`
          : `Play ${WEEKLY_GOAL - count} more game${WEEKLY_GOAL - count !== 1 ? 's' : ''} to hit your weekly goal.`}
      </p>
    </div>
  );
}

// ── Score trend ───────────────────────────────────────────────────────────────
function ScoreTrend({ sessions }: { sessions: AnalysisSession[] }) {
  const dataPoints = sessions
    .filter((s) => s.status === 'done' && s.result)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-8)
    .map((s) => s.result!.overall_score);

  if (dataPoints.length < 2) {
    return (
      <p className="text-xs text-gray-400 text-center py-3">
        Analyze 2+ recordings to see your score trend.
      </p>
    );
  }

  const min = Math.min(...dataPoints);
  const max = Math.max(...dataPoints);
  const range = Math.max(max - min, 1);
  const W = 240, H = 56, PAD = 6;
  const xStep = (W - PAD * 2) / (dataPoints.length - 1);
  const points = dataPoints
    .map((score, i) => `${PAD + i * xStep},${PAD + (1 - (score - min) / range) * (H - PAD * 2)}`)
    .join(' ');
  const lastScore = dataPoints[dataPoints.length - 1];
  const delta = lastScore - dataPoints[dataPoints.length - 2];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">Last {dataPoints.length} analyses</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: delta >= 0 ? '#dcfce7' : '#fee2e2', color: delta >= 0 ? '#166534' : '#991b1b' }}>
          {delta >= 0 ? '+' : ''}{delta} pts
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <defs>
          <linearGradient id="trendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FADB43" />
            <stop offset="100%" stopColor="#fe9940" />
          </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke="url(#trendGrad)"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {dataPoints.map((score, i) => (
          <circle key={i}
            cx={PAD + i * xStep}
            cy={PAD + (1 - (score - min) / range) * (H - PAD * 2)}
            r={i === dataPoints.length - 1 ? 4 : 2.5}
            fill={i === dataPoints.length - 1 ? '#fe9940' : 'white'}
            stroke="#fe9940" strokeWidth="2" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>Min: {min}</span><span>Max: {max}</span>
      </div>
    </div>
  );
}

// ── Word of the Day ───────────────────────────────────────────────────────────
function WordOfDay() {
  const todayWord = WORD_BANK[Math.floor(Date.now() / 86400000) % WORD_BANK.length];
  const [saved, setSaved] = useState(false);

  const { mutate: saveWord, isPending } = useMutation({
    mutationFn: () => api.post('/practice/saved-words/', { word: todayWord.word, definition: todayWord.def }),
    onSuccess: () => setSaved(true),
  });

  const POS_COLORS: Record<string, { bg: string; text: string }> = {
    adj:  { bg: '#dbeafe', text: '#1e40af' },
    verb: { bg: '#d1fae5', text: '#065f46' },
    noun: { bg: '#ede9fe', text: '#6d28d9' },
    adv:  { bg: '#fce7f3', text: '#9d174d' },
  };
  const posStyle = POS_COLORS[todayWord.pos] ?? { bg: '#f3f4f6', text: '#374151' };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Accent bar */}
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Word of the Day</span>
          <span className="text-[11px] text-gray-400">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Word + POS + Pronunciation */}
        <div className="mb-4">
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
            <h3 className="text-3xl font-extrabold" style={{ color: '#141c52' }}>{todayWord.word}</h3>
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: posStyle.bg, color: posStyle.text }}
            >
              {todayWord.pos}
            </span>
          </div>
          <p className="text-sm text-gray-400">{todayWord.pron}</p>
        </div>

        {/* Definition */}
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{todayWord.def}</p>

        {/* Example */}
        <div className="flex-1 flex items-start gap-2.5 mb-5">
          <div className="w-[3px] shrink-0 self-stretch rounded-full mt-0.5" style={{ background: 'linear-gradient(to bottom,#FADB43,#fe9940)' }} />
          <p className="text-sm italic text-gray-400 leading-relaxed">"{todayWord.ex}"</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => !saved && !isPending && saveWord()}
            disabled={saved || isPending}
            className="flex-1 text-xs font-bold py-2.5 rounded-xl border transition-all"
            style={saved
              ? { borderColor: '#22c55e', color: '#166534', background: '#dcfce7' }
              : { borderColor: '#e5e7eb', color: '#141c52', background: 'white' }}
          >
            {saved ? '✓ Saved' : '🔖 Save word'}
          </button>
          <Link
            href="/practice/sentence-builder"
            className="flex-1 text-xs font-bold py-2.5 rounded-xl text-center transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            Practice it →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Onboarding card ───────────────────────────────────────────────────────────
const ONBOARDING_KEY = 'speechef_onboarding_dismissed';

function OnboardingCard({ hasGames, hasAnalysis, hasRoleplay }: {
  hasGames: boolean; hasAnalysis: boolean; hasRoleplay: boolean;
}) {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => { setDismissed(localStorage.getItem(ONBOARDING_KEY) === 'true'); }, []);
  if (dismissed) return null;

  const steps = [
    { done: hasGames,    emoji: '🎮', title: 'Play your first game',   desc: 'Sharpen vocabulary with a quick word game.',         href: '/practice',          cta: 'Play now' },
    { done: hasAnalysis, emoji: '🎙️', title: 'Analyze your speech',    desc: 'Upload a recording and get your communication score.', href: '/analyze',          cta: 'Upload' },
    { done: hasRoleplay, emoji: '🎭', title: 'Try AI Roleplay',        desc: 'Have a real conversation with an AI coach.',          href: '/practice/roleplay', cta: 'Start' },
  ];
  const completedCount = steps.filter((s) => s.done).length;
  if (completedCount === 3) return null;

  return (
    <div className="rounded-2xl border border-indigo-100 overflow-hidden" style={{ background: 'linear-gradient(135deg, #141c52 0%, #1e2d78 100%)' }}>
      <div className="px-6 pt-5 pb-1 flex items-center justify-between">
        <div>
          <p className="text-white font-bold">Get started with Speechef</p>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{completedCount}/3 steps complete</p>
        </div>
        <button onClick={() => { localStorage.setItem(ONBOARDING_KEY, 'true'); setDismissed(true); }}
          className="text-white/30 hover:text-white/60 transition-colors text-2xl leading-none" aria-label="Dismiss">
          ×
        </button>
      </div>
      <div className="px-6 py-2">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(completedCount / 3) * 100}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 pb-6 pt-2">
        {steps.map((step) => (
          <div key={step.title} className="rounded-xl p-4 flex flex-col gap-2"
            style={{ backgroundColor: step.done ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{step.emoji}</span>
              {step.done && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>Done ✓</span>
              )}
            </div>
            <p className={`text-sm font-semibold leading-tight ${step.done ? 'text-white/40 line-through' : 'text-white'}`}>{step.title}</p>
            {!step.done && (
              <>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{step.desc}</p>
                <Link href={step.href}
                  className="mt-auto text-xs font-bold px-3 py-1.5 rounded-lg text-center transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                  {step.cta} →
                </Link>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: user } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: () => api.get('/auth/profile/').then((r) => r.data),
  });

  const { data: sessions = [] } = useQuery<GameSession[]>({
    queryKey: ['sessions'],
    queryFn: () => api.get('/practice/sessions/').then((r) => r.data),
  });

  const { data: roleplaySessions = [] } = useQuery<RolePlaySession[]>({
    queryKey: ['roleplay-sessions'],
    queryFn: () => api.get('/roleplay/my/').then((r) => r.data).catch(() => []),
  });

  const { data: analysisSessions = [] } = useQuery<AnalysisSession[]>({
    queryKey: ['analysis-sessions-widget'],
    queryFn: () => api.get('/analysis/sessions/').then((r) => r.data).catch(() => []),
    retry: false,
  });

  const latestAnalysis = analysisSessions.find((s) => s.status === 'done');
  const analysisData   = latestAnalysis?.result;
  const profile        = user?.profile;
  const currentStreak  = profile?.current_streak ?? 0;
  const longestStreak  = profile?.longest_streak ?? 0;
  const recentSessions = sessions.slice(0, 5);
  const totalGames     = sessions.length;
  const totalScore     = sessions.reduce((s, x) => s + x.score, 0);

  const allGameKeys = Object.keys(GAME_LABELS);
  const bestByGame:  Record<string, number> = Object.fromEntries(allGameKeys.map((k) => [k, 0]));
  const countByGame: Record<string, number> = Object.fromEntries(allGameKeys.map((k) => [k, 0]));
  for (const s of sessions) {
    if (s.game in countByGame) {
      countByGame[s.game] = (countByGame[s.game] ?? 0) + 1;
      if (s.score > (bestByGame[s.game] ?? 0)) bestByGame[s.game] = s.score;
    }
  }

  const roleplayCount     = roleplaySessions.length;
  const finishedRoleplays = roleplaySessions.filter((s) => s.status === 'finished' && s.score !== null);
  const roleplayAvgScore  = finishedRoleplays.length > 0
    ? Math.round(finishedRoleplays.reduce((sum, s) => sum + (s.score ?? 0), 0) / finishedRoleplays.length)
    : 0;

  const neverPlayed    = allGameKeys.find((k) => countByGame[k] === 0);
  const recommendedKey = neverPlayed ?? allGameKeys.reduce((a, b) => (bestByGame[a] <= bestByGame[b] ? a : b));

  const todayStr    = new Date().toDateString();
  const playedToday = sessions.some((s) => new Date(s.played_at).toDateString() === todayStr);
  const streakAtRisk = currentStreak > 0 && !playedToday;

  const commScore = analysisData?.overall_score
    ?? (sessions.length > 0 ? Math.min(99, Math.round(totalScore / Math.max(1, sessions.length))) : 0);

  const paceScore = analysisData
    ? Math.min(100, Math.round(((analysisData.pace_wpm ?? 0) / 180) * 100))
    : bestByGame['blitz'] ?? 0;

  const skills = [
    { label: 'Fluency',       score: analysisData?.fluency_score    ?? bestByGame['guess']     ?? 0, color: '#FADB43' },
    { label: 'Vocabulary',    score: analysisData?.vocabulary_score ?? bestByGame['blitz']     ?? 0, color: '#fe9940' },
    { label: 'Pronunciation', score: bestByGame['pronunciation']    ?? 0,                            color: '#FADB43' },
    { label: 'Grammar',       score: bestByGame['sentence']         ?? 0,                            color: '#fe9940' },
    { label: 'Pace',          score: paceScore,                                                       color: '#FADB43' },
    { label: 'Confidence',    score: roleplayAvgScore > 0 ? roleplayAvgScore : (bestByGame['daily'] ?? 0), color: '#fe9940' },
  ];

  // ── Level calculations ────────────────────────────────────────────────────
  const rawLevelIdx   = LEVELS.findIndex((l) => commScore < l.max);
  const currentLevelIdx = rawLevelIdx === -1 ? LEVELS.length - 1 : rawLevelIdx;
  const currentLevel  = LEVELS[currentLevelIdx];
  const nextLevel     = LEVELS[currentLevelIdx + 1];
  const levelProgress = Math.min(100, Math.round(
    ((commScore - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100,
  ));
  // For the progress track connecting nodes
  const trackFillPct = Math.min(100,
    ((currentLevelIdx + levelProgress / 100) / (LEVELS.length - 1)) * 100,
  );

  const weekScore = sessions
    .filter((s) => new Date(s.played_at) >= (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d; })())
    .reduce((sum, s) => sum + s.score, 0);

  return (
    <div className="min-h-screen" style={{ background: '#f4f6fb' }}>

      {/* ── Navy hero header ──────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0c1338 0%, #141c52 60%, #1a1060 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              {greeting()}{user ? `, ${user.username}` : ''} 👋
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {streakAtRisk
                ? 'Your streak is at risk — play today to keep it alive!'
                : sessions.length === 0
                ? 'Welcome to Speechef — your English journey starts here.'
                : "Let's keep building your English skills."}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {currentStreak > 0 && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
                style={{ background: 'rgba(250,219,67,0.12)', border: '1px solid rgba(250,219,67,0.22)' }}>
                <span className="text-xl">🔥</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#FADB43' }}>{currentStreak}-day streak</p>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Best: {longestStreak}</p>
                </div>
              </div>
            )}
            <Link
              href={streakAtRisk ? '/practice/daily-challenge' : '/practice'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52', boxShadow: '0 4px 20px rgba(250,219,67,0.3)' }}
            >
              {streakAtRisk ? '🎯 Play today' : '▶ Practice now'}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-7">

        {/* ── Onboarding (new users only) ─────────────────────────────────── */}
        <OnboardingCard
          hasGames={sessions.length > 0}
          hasAnalysis={analysisSessions.some((s) => s.status === 'done')}
          hasRoleplay={roleplaySessions.length > 0}
        />

        {/* ── Journey level card ─ full width ─────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-7 py-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">

              {/* Score gauge + level label */}
              <div className="flex items-center gap-6 shrink-0">
                <ScoreGauge score={commScore} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Level</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{currentLevel.emoji}</span>
                    <span className="text-xl font-extrabold" style={{ color: '#141c52' }}>{currentLevel.name}</span>
                  </div>
                  {nextLevel ? (
                    <p className="text-sm text-gray-400">
                      <strong style={{ color: '#141c52' }}>{nextLevel.min - commScore} pts</strong> to reach {nextLevel.name} {nextLevel.emoji}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold" style={{ color: '#fe9940' }}>🏆 Max level reached!</p>
                  )}
                  {latestAnalysis && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Score updated {new Date(latestAnalysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>

              {/* Journey path */}
              <div className="flex-1 w-full">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Your English Journey</p>
                <div className="relative">
                  <div className="absolute top-4 left-4 right-4 h-[3px] rounded-full bg-gray-100" style={{ zIndex: 0 }} />
                  <div
                    className="absolute top-4 left-4 h-[3px] rounded-full transition-all duration-1000"
                    style={{ width: `calc(${trackFillPct}% * (100% - 32px) / 100)`, background: 'linear-gradient(to right,#FADB43,#fe9940)', zIndex: 1, maxWidth: 'calc(100% - 32px)' }}
                  />
                  <div className="relative flex justify-between" style={{ zIndex: 2 }}>
                    {LEVELS.map((level, i) => {
                      const isPast    = i < currentLevelIdx;
                      const isCurrent = i === currentLevelIdx;
                      const isFuture  = i > currentLevelIdx;
                      return (
                        <div key={level.name} className="flex flex-col items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500"
                            style={{
                              background: isCurrent
                                ? 'linear-gradient(135deg,#FADB43,#fe9940)'
                                : isPast ? '#141c52' : '#f3f4f6',
                              color: isCurrent ? '#141c52' : isPast ? 'white' : '#d1d5db',
                              boxShadow: isCurrent ? '0 0 0 4px rgba(250,219,67,0.2), 0 0 16px rgba(250,219,67,0.35)' : 'none',
                              border: isFuture ? '2px solid #e5e7eb' : 'none',
                            }}
                          >
                            {isPast ? '✓' : level.emoji}
                          </div>
                          <div className="text-center">
                            <p className="text-[11px] font-bold" style={{ color: isFuture ? '#d1d5db' : '#141c52' }}>
                              {level.name}
                            </p>
                            <p className="text-[10px] text-gray-400">{level.min}+</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Progress in <strong style={{ color: '#141c52' }}>{currentLevel.name}</strong></span>
                    <span className="font-semibold" style={{ color: '#141c52' }}>{levelProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${levelProgress}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
        </div>

        {/* ── Main 2+1 grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Left 2/3 ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* What can you do? */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">What can you do?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { href: '/practice/word-games',     emoji: '🎮', label: 'Word Games',      desc: 'Vocabulary, memory & scrambles',   bg: '#fef9c3' },
                  { href: '/practice/roleplay',        emoji: '🎭', label: 'AI Roleplay',     desc: 'Interviews, debates & pitches',    bg: '#fee2e2' },
                  { href: '/practice/test-prep',       emoji: '📝', label: 'Test Prep',       desc: 'IELTS · TOEFL · PTE · OET',       bg: '#dbeafe' },
                  { href: '/analyze',                  emoji: '🎙️', label: 'Speech Analysis', desc: 'Record & get your score',          bg: '#dcfce7' },
                  { href: '/practice/writing-coach',   emoji: '✍️', label: 'Writing Coach',   desc: 'AI feedback on essays & emails',   bg: '#ede9fe' },
                  { href: '/mentors',                  emoji: '🧑‍🏫', label: 'Find a Mentor',  desc: '1-on-1 live video coaching',      bg: '#fff7ed' },
                ].map(({ href, emoji, label, desc, bg }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-yellow-200">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: bg }}>
                      {emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm leading-tight" style={{ color: '#141c52' }}>{label}</p>
                      <p className="text-xs text-gray-400 leading-tight mt-0.5 truncate">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🎮', value: totalGames,                 label: 'Games Played', sub: 'all time'                                              },
                { icon: '⭐', value: totalScore.toLocaleString(), label: 'Total Score',  sub: 'cumulative'                                             },
                { icon: '🔥', value: currentStreak,               label: 'Day Streak',   sub: `Best: ${longestStreak}`                                 },
                { icon: '🎭', value: roleplayCount,               label: 'Roleplay',     sub: roleplayAvgScore > 0 ? `Avg: ${roleplayAvgScore}` : 'sessions' },
              ].map(({ icon, value, label, sub }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{icon}</span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                  </div>
                  <p className="text-3xl font-extrabold" style={{ color: '#141c52' }}>{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Skill breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold" style={{ color: '#141c52' }}>Skill Breakdown</h2>
                {skills.some((s) => s.score > 0) && (
                  <span className="text-xs text-gray-400">
                    Focus on:{' '}
                    <strong style={{ color: '#141c52' }}>
                      {skills.filter((s) => s.score > 0).sort((a, b) => a.score - b.score)[0]?.label ?? '—'}
                    </strong>
                  </span>
                )}
              </div>
              {skills.some((s) => s.score > 0) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skills.map((s) => (
                    <SkillBar key={s.label} label={s.label} score={s.score} color={s.color} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">📊</p>
                  <p className="text-sm text-gray-400 mb-3">Play games or analyze your speech to unlock your skill profile.</p>
                  <Link href="/practice" className="inline-block text-xs font-bold px-4 py-2 rounded-full"
                    style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                    Start practicing →
                  </Link>
                </div>
              )}
            </div>

            {/* Weekly Goal + Score Trend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <WeeklyGoals sessions={sessions} />
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold mb-3" style={{ color: '#141c52' }}>Score Trend</h2>
                <ScoreTrend sessions={analysisSessions} />
              </div>
            </div>

            {/* Test Prep — all tracks */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold" style={{ color: '#141c52' }}>Exam Prep</h2>
                  <p className="text-xs text-gray-400 mt-0.5">All available tracks</p>
                </div>
                <Link href="/practice/test-prep" className="text-xs font-semibold hover:underline" style={{ color: '#141c52' }}>
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { href: '/practice/test-prep/ielts-academic', emoji: '🇬🇧', label: 'IELTS Academic',    desc: 'Listening · Reading · Writing · Speaking', bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', badge: "Chef's Pick" },
                  { href: '/practice/test-prep/toefl-ibt',      emoji: '🇺🇸', label: 'TOEFL iBT',         desc: 'Integrated speaking & academic writing',   bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4', badge: null },
                  { href: '/practice/test-prep/pte-academic',   emoji: '🌏', label: 'PTE Academic',       desc: 'AI-scored speaking & writing tasks',        bg: '#dcfce7', text: '#166534', border: '#86efac', badge: null },
                  { href: '/practice/test-prep/oet',            emoji: '🏥', label: 'OET',                desc: 'Medical English for healthcare pros',       bg: '#fef3c7', text: '#78350f', border: '#fcd34d', badge: null },
                  { href: '/practice/test-prep/celpip',         emoji: '🍁', label: 'CELPIP',             desc: 'Canadian proficiency · Listening & Reading', bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd', badge: null },
                  { href: '/practice/vocab-list',               emoji: '📖', label: 'Vocab Tracker',      desc: '550+ academic words for IELTS & TOEFL',     bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', badge: null },
                ].map(({ href, emoji, label, desc, bg, text, border, badge }) => (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex flex-col gap-1.5 p-3.5 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-sm"
                    style={{ background: bg, borderColor: border }}
                  >
                    {badge && (
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: '#141c52', color: '#FADB43' }}>
                        {badge}
                      </span>
                    )}
                    <span className="text-2xl leading-none">{emoji}</span>
                    <p className="text-xs font-bold leading-tight pr-8" style={{ color: text }}>{label}</p>
                    <p className="text-[10px] leading-tight" style={{ color: text, opacity: 0.65 }}>{desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Quick Play ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold" style={{ color: '#141c52' }}>Quick Play</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Word games &amp; vocabulary drills</p>
                </div>
                <Link href="/practice" className="text-xs font-semibold hover:underline" style={{ color: '#141c52' }}>
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { href: '/practice/vocabulary-blitz',        emoji: '⚡',  label: 'Vocab Blitz',        desc: '60-sec vocabulary sprint',           bg: '#fef9c3', text: '#92400e', border: '#fde68a', badge: 'Sizzling' },
                  { href: '/practice/guess-the-word',          emoji: '🧠',  label: 'Guess the Word',     desc: 'Identify the mystery word meaning',  bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe', badge: null },
                  { href: '/practice/memory-match',            emoji: '🃏',  label: 'Memory Match',       desc: 'Pair words with their meanings',     bg: '#d1fae5', text: '#065f46', border: '#a7f3d0', badge: null },
                  { href: '/practice/word-scramble',           emoji: '🔤',  label: 'Word Scramble',      desc: 'Unscramble the secret ingredient',   bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', badge: null },
                  { href: '/practice/sentence-builder',        emoji: '✍️',  label: 'Sentence Builder',   desc: 'Use vocab words in sentences',       bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8', badge: null },
                  { href: '/practice/pronunciation-challenge', emoji: '🎙️',  label: 'Pronunciation',      desc: 'Speak and get real-time feedback',   bg: '#fee2e2', text: '#991b1b', border: '#fecaca', badge: 'Fresh' },
                  { href: '/practice/daily-challenge',         emoji: '🔥',  label: 'Daily Challenge',    desc: "Today's featured word challenge",    bg: '#fff7ed', text: '#9a3412', border: '#fed7aa', badge: 'Daily' },
                  { href: '/practice/vocab-list',              emoji: '📖',  label: 'Vocab Tracker',      desc: '550+ academic words to master',      bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', badge: null },
                ].map(({ href, emoji, label, desc, bg, text, border, badge }) => (
                  <Link key={href} href={href}
                    className="relative flex flex-col gap-1.5 p-3.5 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-sm"
                    style={{ background: bg, borderColor: border }}>
                    {badge && (
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: '#141c52', color: '#FADB43' }}>{badge}</span>
                    )}
                    <span className="text-2xl leading-none">{emoji}</span>
                    <p className="text-xs font-bold leading-tight pr-8" style={{ color: text }}>{label}</p>
                    <p className="text-[10px] leading-tight" style={{ color: text, opacity: 0.65 }}>{desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── AI Roleplay ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold" style={{ color: '#141c52' }}>AI Roleplay</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Conversational practice with AI coaches</p>
                </div>
                <Link href="/practice" className="text-xs font-semibold hover:underline" style={{ color: '#141c52' }}>
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { href: '/practice/roleplay/job_interview', emoji: '💼',  label: 'Job Interview',      desc: 'Nail tough interview questions',    bg: '#fef3c7', text: '#78350f', border: '#fde68a', badge: "Chef's Special" },
                  { href: '/practice/roleplay/presentation',  emoji: '🎤',  label: 'Presentation Pitch', desc: 'Pitch to an AI audience',           bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe', badge: null },
                  { href: '/practice/roleplay/debate',        emoji: '🗣️',  label: 'Debate',             desc: 'Argue against an AI debater',       bg: '#fee2e2', text: '#991b1b', border: '#fecaca', badge: null },
                  { href: '/practice/roleplay/small_talk',    emoji: '💬',  label: 'Small Talk',         desc: 'Natural English social scenarios',  bg: '#d1fae5', text: '#065f46', border: '#a7f3d0', badge: null },
                  { href: '/practice/interview',              emoji: '🎯',  label: 'Interview Sim',      desc: 'Text mock interview with scoring',  bg: '#fff7ed', text: '#9a3412', border: '#fed7aa', badge: 'AI Sous Chef' },
                ].map(({ href, emoji, label, desc, bg, text, border, badge }) => (
                  <Link key={href} href={href}
                    className="relative flex flex-col gap-1.5 p-3.5 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-sm"
                    style={{ background: bg, borderColor: border }}>
                    {badge && (
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: '#141c52', color: '#FADB43' }}>{badge}</span>
                    )}
                    <span className="text-2xl leading-none">{emoji}</span>
                    <p className="text-xs font-bold leading-tight pr-8" style={{ color: text }}>{label}</p>
                    <p className="text-[10px] leading-tight" style={{ color: text, opacity: 0.65 }}>{desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── AI Tools ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold" style={{ color: '#141c52' }}>AI Tools</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Powered by GPT-4o</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { href: '/practice/writing-coach',   emoji: '✍️', label: 'Writing Coach',   desc: 'Grammar, vocabulary & structure feedback',  bg: '#fdf4ff', text: '#7c3aed', border: '#e9d5ff', badge: 'GPT-4o' },
                  { href: '/practice/resume-analyzer', emoji: '📄', label: 'Resume Analyzer', desc: 'ATS score, phrases & keyword suggestions',  bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', badge: 'GPT-4o' },
                  { href: '/practice/interview',       emoji: '🎯', label: 'Interview Sim',   desc: 'Mock interviews with full scoring report',  bg: '#fff7ed', text: '#9a3412', border: '#fed7aa', badge: 'Fresh' },
                  { href: '/practice/vocab-list',      emoji: '🔖', label: 'Saved Words',     desc: 'Stock your personal vocabulary pantry',     bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', badge: null },
                ].map(({ href, emoji, label, desc, bg, text, border, badge }) => (
                  <Link key={href} href={href}
                    className="relative flex flex-col gap-1.5 p-3.5 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-sm"
                    style={{ background: bg, borderColor: border }}>
                    {badge && (
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: '#141c52', color: '#FADB43' }}>{badge}</span>
                    )}
                    <span className="text-2xl leading-none">{emoji}</span>
                    <p className="text-xs font-bold leading-tight pr-8" style={{ color: text }}>{label}</p>
                    <p className="text-[10px] leading-tight" style={{ color: text, opacity: 0.65 }}>{desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Community & Mentors ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold" style={{ color: '#141c52' }}>Community &amp; Mentors</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Connect, learn and grow together</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { href: '/community',     emoji: '💬',   label: 'Community',       desc: 'Discuss, share & ask questions',       bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
                  { href: '/mentors',       emoji: '🧑‍🏫', label: 'Find a Mentor',   desc: '1-on-1 live video coaching sessions',  bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
                  { href: '/mentors/apply', emoji: '🌟',   label: 'Become a Mentor', desc: 'Share your expertise with learners',    bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
                ].map(({ href, emoji, label, desc, bg, text, border }) => (
                  <Link key={href} href={href}
                    className="flex flex-col gap-1.5 p-3.5 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-sm"
                    style={{ background: bg, borderColor: border }}>
                    <span className="text-2xl leading-none">{emoji}</span>
                    <p className="text-xs font-bold leading-tight" style={{ color: text }}>{label}</p>
                    <p className="text-[10px] leading-tight" style={{ color: text, opacity: 0.65 }}>{desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Leaderboard ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold" style={{ color: '#141c52' }}>Leaderboard</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Kitchen Brigade rankings</p>
                </div>
                <span className="text-2xl">🏆</span>
              </div>
              <div className="space-y-2">
                {[
                  { rank: 1, label: 'Head Chef',      emoji: '👨‍🍳', desc: 'Top scorer', color: '#f59e0b' },
                  { rank: 2, label: 'Sous Chef',       emoji: '🥈',   desc: '2nd place',  color: '#94a3b8' },
                  { rank: 3, label: 'Chef de Partie',  emoji: '🥉',   desc: '3rd place',  color: '#b45309' },
                ].map(({ rank, label, emoji, desc, color }) => (
                  <div key={rank} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
                    <span className="text-lg shrink-0">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: '#141c52' }}>{label}</p>
                      <p className="text-[10px] text-gray-400">{desc}</p>
                    </div>
                    <span className="text-[11px] font-extrabold" style={{ color }}># {rank}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {totalGames > 0 && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: '#fef9c3' }}>
                    <p className="text-xs font-semibold" style={{ color: '#92400e' }}>Your score</p>
                    <p className="text-xs font-extrabold" style={{ color: '#78350f' }}>{totalScore.toLocaleString()} pts</p>
                  </div>
                )}
                <Link
                  href="/practice/leaderboard"
                  className="block text-center py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                >
                  See full brigade →
                </Link>
              </div>
            </div>

          </div>

          {/* ── Right 1/3 ── */}
          <div className="space-y-4">

            {/* Speechef Communication Score */}
            <ScorecardWidget />

            {/* Word of the Day */}
            <WordOfDay />

            {/* Daily Challenge — compact */}
            <Link
              href="/practice/daily-challenge"
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:scale-[1.01] hover:shadow-md"
            >
              <div className="h-[3px]" style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🔥</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-gray-400">Daily Challenge</p>
                      <p className="text-base font-extrabold leading-tight" style={{ color: '#141c52' }}>Today's challenge</p>
                    </div>
                  </div>
                  {playedToday
                    ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: '#dcfce7', color: '#166534' }}>Done ✓</span>
                    : <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: '#fef9c3', color: '#92400e', border: '1px solid #fde68a' }}>New</span>
                  }
                </div>
                <p className="text-xs leading-relaxed mb-4 text-gray-400">
                  {playedToday
                    ? "You've completed today's challenge!"
                    : streakAtRisk
                    ? `⚠ ${currentStreak}-day streak at risk!`
                    : currentStreak > 0
                    ? `Keep your ${currentStreak}-day streak alive.`
                    : 'Build the daily habit.'}
                </p>
                <div className="inline-flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-full"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                  {playedToday ? 'View result →' : 'Start challenge →'}
                </div>
              </div>
            </Link>

            {/* Streak — 7-day strip */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold" style={{ color: '#141c52' }}>Streak</h2>
                {currentStreak > 0 && (
                  <span className="text-xs font-semibold text-gray-400">{currentStreak}-day streak 🔥</span>
                )}
              </div>
              <ActivityHeatmap sessions={sessions} />
            </div>

            {/* Recent Activity with green +pts */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold" style={{ color: '#141c52' }}>Recent Activity</h2>
                <Link href="/practice/history" className="text-xs font-semibold text-indigo-600 hover:underline">All →</Link>
              </div>
              <div className="space-y-1">
                {/* Daily login streak bonus */}
                {currentStreak > 0 && playedToday && (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: '#f0fdf4' }}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🔥</span>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#141c52' }}>Daily Login</p>
                        <p className="text-[10px] text-gray-400">{currentStreak}-day streak</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#16a34a' }}>+{currentStreak * 5} pts</span>
                  </div>
                )}
                {/* Game sessions */}
                {recentSessions.length > 0 ? recentSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{GAME_EMOJIS[s.game] ?? '🎮'}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#141c52', maxWidth: '110px' }}>
                          {GAME_LABELS[s.game] ?? s.game}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(s.played_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold shrink-0 ml-2" style={{ color: '#16a34a' }}>+{s.score} pts</span>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <p className="text-3xl mb-2">🎮</p>
                    <p className="text-xs text-gray-400 mb-3">No activity yet — start playing!</p>
                    <Link href="/practice"
                      className="inline-block text-xs font-bold px-4 py-2 rounded-full"
                      style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                      Start now →
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
