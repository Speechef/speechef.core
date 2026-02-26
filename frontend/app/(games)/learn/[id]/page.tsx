'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import Cookies from 'js-cookie';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category { id: number; name: string; }
interface Comment  { id: number; author: string; body: string; created_on: string; }
interface Post {
  id: number; title: string; body: string; created_on: string;
  categories: Category[]; completed: boolean; is_completed: boolean; comments: Comment[];
}
interface CourseInfo {
  id: string; name: string; description: string;
  emoji: string; category: string; level: string; featured?: boolean;
}
type SectionType = 'exercise' | 'warning' | 'tip' | 'default';
interface BodySection {
  heading: string | null;
  headingId: string | null;
  type: SectionType;
  lines: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
  'Pronunciation':    { bg: '#fef9c3', text: '#92400e', border: '#fde68a', emoji: '🗣️' },
  'Fluency':          { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe', emoji: '🌊' },
  'Vocabulary':       { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0', emoji: '📚' },
  'Grammar':          { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', emoji: '✏️' },
  'Communication':    { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', emoji: '💬' },
  'Listening':        { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8', emoji: '🎧' },
  'Interview Skills': { bg: '#fef3c7', text: '#78350f', border: '#fde68a', emoji: '💼' },
  'Writing':          { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', emoji: '✍️' },
};

const COURSES: CourseInfo[] = [
  { id: 'grammar',       name: 'Grammar Fundamentals',  description: 'Articles, tenses, conditionals — the backbone of English', emoji: '✏️', category: 'Grammar',          level: 'Foundation',  featured: true },
  { id: 'pronunciation', name: 'Pronunciation Mastery', description: 'Sound clear, natural and confident in every conversation',    emoji: '🗣️', category: 'Pronunciation',    level: 'Intermediate' },
  { id: 'fluency',       name: 'Fluency Builder',       description: 'Speak smoothly, drop filler words, command the pause',       emoji: '🌊', category: 'Fluency',          level: 'Intermediate' },
  { id: 'vocabulary',    name: 'Vocabulary Expansion',  description: 'Build a rich, precise word bank for any situation',          emoji: '📚', category: 'Vocabulary',       level: 'All levels'   },
  { id: 'communication', name: 'Communication Skills',  description: 'Listen actively and express ideas with impact',              emoji: '💬', category: 'Communication',    level: 'Advanced'     },
  { id: 'writing',       name: 'Professional Writing',  description: 'Craft clear, compelling emails and documents',               emoji: '✍️', category: 'Writing',          level: 'Intermediate' },
];

const CHAPTER_NAMES: Record<number, string> = {
  1: 'The Basics',
  2: 'Nouns & Articles',
  3: 'Pronouns & Adjectives',
  4: 'Tenses',
  5: 'Sentence Structure',
  6: 'Advanced Grammar',
};

const AVATAR_COLORS = [
  { bg: '#dbeafe', text: '#1e40af' }, { bg: '#fce7f3', text: '#9d174d' },
  { bg: '#d1fae5', text: '#065f46' }, { bg: '#fef3c7', text: '#78350f' },
  { bg: '#ede9fe', text: '#6d28d9' }, { bg: '#fee2e2', text: '#991b1b' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function readTime(body: string): string {
  return `${Math.max(1, Math.ceil(body.split(/\s+/).filter(Boolean).length / 200))} min read`;
}

function extractTOC(body: string): { id: string; text: string }[] {
  return body
    .split('\n')
    .filter((l) => l.startsWith('## '))
    .map((l) => { const text = l.replace(/^## /, ''); return { id: slugify(text), text }; });
}

function authorAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(h)];
}

function parsePostMeta(body: string): { chapter: number | null; difficulty: 'Easy' | 'Medium' | 'Hard' | null; cleanBody: string } {
  const lines = body.split('\n');
  let chapter: number | null = null;
  let difficulty: 'Easy' | 'Medium' | 'Hard' | null = null;
  let startIdx = 0;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const chMatch = lines[i].match(/^Chapter:\s*(\d+)$/);
    const dfMatch = lines[i].match(/^Difficulty:\s*(Easy|Medium|Hard)$/);
    if (chMatch) { chapter = parseInt(chMatch[1], 10); startIdx = Math.max(startIdx, i + 1); }
    if (dfMatch) { difficulty = dfMatch[1] as 'Easy' | 'Medium' | 'Hard'; startIdx = Math.max(startIdx, i + 1); }
  }
  while (startIdx < lines.length && !lines[startIdx].trim()) startIdx++;
  return { chapter, difficulty, cleanBody: lines.slice(startIdx).join('\n') };
}

function getSectionType(heading: string): SectionType {
  const lower = heading.toLowerCase();
  if (/exercise|practice|drill|activity|try it/.test(lower)) return 'exercise';
  if (/mistake|error|avoid|warning|pitfall|wrong/.test(lower)) return 'warning';
  if (/tip|note|remember|trick|pro\s|bonus/.test(lower)) return 'tip';
  return 'default';
}

function parseSections(body: string): BodySection[] {
  const lines = body.split('\n');
  const sections: BodySection[] = [];
  let current: BodySection = { heading: null, headingId: null, type: 'default', lines: [] };
  for (const line of lines) {
    if (line.startsWith('## ')) {
      sections.push(current);
      const heading = line.replace(/^## /, '');
      current = { heading, headingId: slugify(heading), type: getSectionType(heading), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections.filter((s) => s.heading !== null || s.lines.some((l) => l.trim()));
}

type CatMeta = { bg: string; text: string; border: string; emoji: string };

function renderLines(lines: string[], catMeta: CatMeta | undefined): React.ReactNode {
  const els: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // ### Sub-heading
    if (line.startsWith('### ')) {
      const text = line.replace(/^### /, '');
      els.push(
        <h4 key={`h3-${i}`} className="flex items-center gap-2 text-[15px] font-bold text-[#141c52] mt-7 mb-2.5 tracking-[-0.01em]">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: catMeta?.text ?? '#141c52' }} />
          {text}
        </h4>,
      );
      i++;

    // Grammar pattern: Key: Value
    } else if (/^(Structure|Example|Form|Use|Note|Pattern):\s/.test(line)) {
      const grammarLines: string[] = [];
      while (i < lines.length && /^(Structure|Example|Form|Use|Note|Pattern):\s/.test(lines[i])) {
        grammarLines.push(lines[i]);
        i++;
      }
      els.push(
        <div
          key={`grammar-${i}`}
          className="rounded-xl overflow-hidden mb-4 text-sm"
          style={{ border: `1.5px solid ${catMeta?.border ?? '#e5e7eb'}` }}
        >
          {grammarLines.map((gl, gi) => {
            const colonIdx = gl.indexOf(':');
            const key = gl.slice(0, colonIdx);
            const val = gl.slice(colonIdx + 1).trim();
            return (
              <div
                key={gi}
                className="flex items-baseline"
                style={{ backgroundColor: gi % 2 === 0 ? (catMeta?.bg ?? '#f9fafb') : '#ffffff' }}
              >
                <span
                  className="w-28 shrink-0 text-xs font-bold px-3 py-2.5"
                  style={{ color: catMeta?.text ?? '#141c52' }}
                >
                  {key}
                </span>
                <span
                  className="flex-1 px-3 py-2.5 text-gray-700 font-mono text-xs border-l"
                  style={{ borderColor: catMeta?.border ?? '#e5e7eb' }}
                >
                  {val}
                </span>
              </div>
            );
          })}
        </div>,
      );

    // Bullet list (consecutive)
    } else if (line.startsWith('- ')) {
      const bullets: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        bullets.push(lines[i].replace(/^- /, ''));
        i++;
      }
      els.push(
        <ul key={`ul-${i}`} className="space-y-3 mb-6 mt-1.5">
          {bullets.map((b, bi) => (
            <li key={bi} className="flex items-start gap-3.5">
              <span
                className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-[3px]"
                style={{ backgroundColor: catMeta?.bg ?? '#f9fafb', color: catMeta?.text ?? '#141c52', border: `1.5px solid ${catMeta?.border ?? '#e5e7eb'}` }}
              >
                ✓
              </span>
              <span className="text-[15.5px] text-gray-600 leading-[1.78]">{b}</span>
            </li>
          ))}
        </ul>,
      );

    // Regular paragraph
    } else {
      els.push(
        <p key={`p-${i}`} className="text-base text-gray-600 leading-[1.85] mb-5 tracking-[0.003em]">{line}</p>,
      );
      i++;
    }
  }

  return <>{els}</>;
}

function renderBody(body: string, catMeta: CatMeta | undefined): React.ReactNode {
  const sections = parseSections(body);

  return (
    <>
      {sections.map((section, si) => {
        const content = renderLines(section.lines, catMeta);

        // Intro block (no heading)
        if (!section.heading) {
          return (
            <div key={`section-${si}`} className="body-anim">
              {content}
            </div>
          );
        }

        // Exercise callout
        if (section.type === 'exercise') {
          return (
            <div
              key={`section-${si}`}
              className="body-anim rounded-2xl overflow-hidden mb-6 mt-10"
              style={{ border: '1.5px solid #bbf7d0' }}
            >
              <div className="flex items-center gap-2 px-5 py-3" style={{ backgroundColor: '#d1fae5' }}>
                <span>📝</span>
                <h3
                  id={section.headingId ?? undefined}
                  className="scroll-mt-8 text-[1.05rem] font-bold"
                  style={{ color: '#065f46' }}
                >
                  {section.heading}
                </h3>
              </div>
              <div className="px-5 py-4" style={{ backgroundColor: '#f0fdf4' }}>
                {content}
              </div>
            </div>
          );
        }

        // Warning callout
        if (section.type === 'warning') {
          return (
            <div
              key={`section-${si}`}
              className="body-anim rounded-2xl overflow-hidden mb-6 mt-10"
              style={{ border: '1.5px solid #fed7aa' }}
            >
              <div className="flex items-center gap-2 px-5 py-3" style={{ backgroundColor: '#ffedd5' }}>
                <span>⚠️</span>
                <h3
                  id={section.headingId ?? undefined}
                  className="scroll-mt-8 text-[1.05rem] font-bold"
                  style={{ color: '#9a3412' }}
                >
                  {section.heading}
                </h3>
              </div>
              <div className="px-5 py-4" style={{ backgroundColor: '#fff7ed' }}>
                {content}
              </div>
            </div>
          );
        }

        // Tip callout
        if (section.type === 'tip') {
          return (
            <div
              key={`section-${si}`}
              className="body-anim rounded-2xl overflow-hidden mb-6 mt-10"
              style={{ border: '1.5px solid #bfdbfe' }}
            >
              <div className="flex items-center gap-2 px-5 py-3" style={{ backgroundColor: '#dbeafe' }}>
                <span>💡</span>
                <h3
                  id={section.headingId ?? undefined}
                  className="scroll-mt-8 text-[1.05rem] font-bold"
                  style={{ color: '#1e40af' }}
                >
                  {section.heading}
                </h3>
              </div>
              <div className="px-5 py-4" style={{ backgroundColor: '#eff6ff' }}>
                {content}
              </div>
            </div>
          );
        }

        // Default section
        return (
          <div
            key={`section-${si}`}
            className="body-anim scroll-mt-8 mt-12 mb-2"
            id={section.headingId ?? undefined}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-1 h-6 rounded-full shrink-0"
                style={{ backgroundColor: catMeta?.text ?? '#141c52' }}
              />
              <h3 className="text-[1.1rem] font-bold text-[#141c52] leading-snug tracking-[-0.015em]">{section.heading}</h3>
            </div>
            <div className="h-px mb-5 ml-4" style={{ backgroundColor: catMeta?.border ?? '#e5e7eb' }} />
            {content}
          </div>
        );
      })}
    </>
  );
}

// ─── ProgressRing ─────────────────────────────────────────────────────────────

function ProgressRing({
  pct,
  size = 60,
  strokeWidth = 6,
  color,
  trackColor = '#e5e7eb',
  children,
}: {
  pct: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor?: string;
  children?: React.ReactNode;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="relative z-10 flex items-center justify-center">{children}</div>
    </div>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  const COLORS = ['#FADB43', '#fe9940', '#6d28d9', '#065f46', '#1e40af', '#991b1b', '#9d174d', '#166534'];
  const particles = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: (i * 17 + 5) % 95,
    top: (i * 13) % 40,
    color: COLORS[i % COLORS.length],
    delay: (i * 0.07) % 1.4,
    size: [6, 8, 5, 10][i % 4],
    borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0%',
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: `${p.top}px`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.borderRadius,
            animation: `confettiFall 2.2s ease-in ${p.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── StickyReadingBar ─────────────────────────────────────────────────────────

function StickyReadingBar({
  progress,
  nextPost,
  catMeta,
  visible,
}: {
  progress: number;
  nextPost: Post | null;
  catMeta: CatMeta | undefined;
  visible: boolean;
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(110%)' }}
    >
      <div className="max-w-3xl mx-auto px-4 pb-4">
        <div
          className="rounded-2xl px-5 py-3 flex items-center gap-4 shadow-lg"
          style={{
            backgroundColor: '#fff',
            border: `1.5px solid ${catMeta?.border ?? '#e5e7eb'}`,
          }}
        >
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: catMeta?.text ?? '#141c52', fontWeight: 600 }}>Reading progress</span>
              <span className="font-bold" style={{ color: catMeta?.text ?? '#141c52' }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: catMeta?.border ?? '#e5e7eb' }}>
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{ width: `${progress}%`, backgroundColor: catMeta?.text ?? '#141c52' }}
              />
            </div>
          </div>
          {nextPost && (
            <Link
              href={`/learn/${nextPost.id}`}
              className="text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap transition-opacity hover:opacity-80"
              style={{ backgroundColor: catMeta?.text ?? '#141c52', color: '#fff' }}
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LearnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody]     = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [formError, setFormError]         = useState('');
  const [readingProgress, setProgress]    = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!Cookies.get('access_token');

  // ── Reading progress + sticky bar ─────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      const h   = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (top / h) * 100) : 0);
      setShowStickyBar(top > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Scroll-entrance animations ─────────────────────────────────────────────
  useEffect(() => {
    const container = bodyRef.current;
    if (!container) return;
    const elements = container.querySelectorAll('.body-anim');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [id]);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ['learn-post', id],
    queryFn: () => api.get(`/learn/posts/${id}/`).then((r) => r.data),
  });

  const firstCatName = post?.categories?.[0]?.name;
  const { data: relatedPosts = [] } = useQuery<Post[]>({
    queryKey: ['learn-related', firstCatName],
    enabled: !!firstCatName,
    queryFn: () => api.get('/learn/posts/', { params: { category: firstCatName } }).then((r) => r.data),
  });

  const { data: allPosts = [] } = useQuery<Post[]>({
    queryKey: ['learn-posts-all-nav'],
    enabled: !!post,
    queryFn: () => api.get('/learn/posts/').then((r) => r.data),
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const completeMutation = useMutation({
    mutationFn: () => api.post(`/learn/posts/${id}/complete/`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learn-post', id] });
      queryClient.invalidateQueries({ queryKey: ['learn-posts'] });
      queryClient.invalidateQueries({ queryKey: ['learn-posts-all'] });
      queryClient.invalidateQueries({ queryKey: ['learn-posts-all-nav'] });
    },
  });

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) { setFormError('Comment cannot be empty.'); return; }
    setSubmitting(true); setFormError('');
    try {
      await api.post(`/learn/posts/${id}/comments/`, { body: commentBody });
      setCommentBody('');
      queryClient.invalidateQueries({ queryKey: ['learn-post', id] });
    } catch { setFormError('Failed to post comment. Please try again.'); }
    finally  { setSubmitting(false); }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9fb' }}>
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
          <div className="h-5 w-28 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-56 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="h-4 rounded bg-gray-100 animate-pulse w-3/4" />
          <div className="h-4 rounded bg-gray-100 animate-pulse" />
          <div className="h-4 rounded bg-gray-100 animate-pulse w-5/6" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9fb' }}>
        <div className="text-center">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-gray-500 font-medium">Post not found.</p>
          <Link href="/learn" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">← Back to Learn</Link>
        </div>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const primaryCat   = post.categories[0];
  const catMeta      = primaryCat ? CATEGORY_META[primaryCat.name] : undefined;
  const { chapter, difficulty, cleanBody } = parsePostMeta(post.body);
  const toc          = extractTOC(cleanBody);
  const postCatNames = post.categories.map((c) => c.name);
  const activeCourse = COURSES.find((c) => postCatNames.includes(c.category));
  const courseMeta   = activeCourse ? CATEGORY_META[activeCourse.category] : undefined;

  const coursePosts = activeCourse
    ? [...allPosts]
        .filter((p) => p.categories.some((c) => c.name === activeCourse.category))
        .sort((a, b) => new Date(a.created_on).getTime() - new Date(b.created_on).getTime())
    : [];

  const courseIdx  = coursePosts.findIndex((p) => String(p.id) === id);
  const prevLesson = courseIdx > 0 ? coursePosts[courseIdx - 1] : null;
  const nextLesson = courseIdx >= 0 && courseIdx < coursePosts.length - 1 ? coursePosts[courseIdx + 1] : null;
  const courseDone = isLoggedIn ? coursePosts.filter((p) => p.is_completed).length : 0;
  const coursePct  = coursePosts.length > 0 ? Math.round((courseDone / coursePosts.length) * 100) : 0;

  const sortedAll  = [...allPosts].sort((a, b) => a.id - b.id);
  const globalIdx  = sortedAll.findIndex((p) => String(p.id) === id);
  const prevGlobal = globalIdx > 0 ? sortedAll[globalIdx - 1] : null;
  const nextGlobal = globalIdx >= 0 && globalIdx < sortedAll.length - 1 ? sortedAll[globalIdx + 1] : null;

  const related   = relatedPosts.filter((p) => String(p.id) !== id).slice(0, 4);
  const stickyNext = activeCourse ? nextLesson : nextGlobal;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#f8f9fb' }}>

      {/* ── Global CSS ──────────────────────────────────────────────────── */}
      <style>{`
        .body-anim {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .body-anim.visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(-10px) rotate(0deg) scale(1); }
          100% { opacity: 0; transform: translateY(90vh) rotate(720deg) scale(0.5); }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.88); }
          60%  { transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
        .pop-in { animation: popIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      {/* ── Confetti ────────────────────────────────────────────────────── */}
      {justCompleted && <Confetti />}

      {/* ── Reading progress bar ────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 z-50 h-[3px] rounded-r-full transition-all duration-100"
        style={{ width: `${readingProgress}%`, backgroundColor: catMeta?.text ?? '#141c52' }}
      />

      {/* ── Sticky reading bar ──────────────────────────────────────────── */}
      <StickyReadingBar
        progress={readingProgress}
        nextPost={stickyNext ?? null}
        catMeta={catMeta}
        visible={showStickyBar}
      />

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* ── Back link ──────────────────────────────────────────────────── */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#141c52] transition-colors mb-6"
        >
          ← Back to Learn
        </Link>

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden mb-6 relative pop-in"
          style={{
            background: catMeta
              ? `linear-gradient(135deg, ${catMeta.bg} 0%, #ffffff 70%)`
              : 'linear-gradient(135deg, #f8f9fb 0%, #ffffff 70%)',
            border: `2px solid ${catMeta?.border ?? '#e5e7eb'}`,
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -right-14 -top-14 w-52 h-52 rounded-full opacity-[0.09] pointer-events-none"
            style={{ backgroundColor: catMeta?.text ?? '#141c52' }}
          />
          <div
            className="absolute right-20 -bottom-10 w-32 h-32 rounded-full opacity-[0.05] pointer-events-none"
            style={{ backgroundColor: catMeta?.text ?? '#141c52' }}
          />

          <div className="relative z-10 px-6 pt-6 pb-5">
            {/* Emoji badge */}
            <div
              className="w-16 h-16 rounded-2xl text-4xl flex items-center justify-center mb-4 shadow-sm"
              style={{ backgroundColor: catMeta?.border ?? '#e5e7eb' }}
            >
              {catMeta?.emoji ?? '📖'}
            </div>

            {/* Category chips + lesson badge */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {post.categories.map((cat) => {
                const m = CATEGORY_META[cat.name];
                return (
                  <Link
                    key={cat.id}
                    href={`/learn?category=${cat.name}`}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity"
                    style={m ? { backgroundColor: m.border, color: m.text } : { backgroundColor: '#e8f4fa', color: '#141c52' }}
                  >
                    {m?.emoji} {cat.name}
                  </Link>
                );
              })}
              {activeCourse && courseIdx >= 0 && (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#78350f' }}
                >
                  {activeCourse.emoji} Lesson {courseIdx + 1} of {coursePosts.length}
                </span>
              )}
              {chapter && (
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: catMeta?.bg ?? '#f9fafb', color: catMeta?.text ?? '#141c52', border: `1px solid ${catMeta?.border ?? '#e5e7eb'}` }}
                >
                  Ch {chapter} · {CHAPTER_NAMES[chapter] ?? `Chapter ${chapter}`}
                </span>
              )}
              {difficulty && <DifficultyBadge difficulty={difficulty} />}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-[#141c52] mb-4 leading-snug">{post.title}</h1>

            {/* Meta row */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <span>📅</span>
                {new Date(post.created_on).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <span>⏱️</span>{readTime(cleanBody)}
              </span>

              {isLoggedIn ? (
                <button
                  onClick={() => {
                    completeMutation.mutate();
                    if (!nextLesson && !post.is_completed) {
                      setJustCompleted(true);
                      setTimeout(() => setJustCompleted(false), 3000);
                    }
                  }}
                  disabled={completeMutation.isPending}
                  className={`ml-auto text-xs font-bold px-4 py-1.5 rounded-full transition-all disabled:opacity-60 ${
                    post.is_completed
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-white text-[#141c52] border border-gray-300 hover:bg-green-50 hover:border-green-400'
                  }`}
                >
                  {completeMutation.isPending ? '…' : post.is_completed ? '✓ Completed' : 'Mark Complete'}
                </button>
              ) : (
                <span
                  className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${
                    post.completed ? 'bg-green-100 text-green-700' : 'bg-white text-gray-400 border border-gray-200'
                  }`}
                >
                  {post.completed ? '✓ Completed' : 'Pending'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── COURSE NAVIGATOR ──────────────────────────────────────────── */}
        {activeCourse && courseIdx >= 0 && coursePosts.length > 0 && (
          <CourseNavigator
            course={activeCourse}
            courseMeta={courseMeta}
            courseIdx={courseIdx}
            coursePosts={coursePosts}
            courseDone={courseDone}
            coursePct={coursePct}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            currentId={id}
            isLoggedIn={isLoggedIn}
          />
        )}

        {/* ── TABLE OF CONTENTS ─────────────────────────────────────────── */}
        {toc.length >= 2 && <TableOfContents toc={toc} catMeta={catMeta} />}

        {/* ── BODY ──────────────────────────────────────────────────────── */}
        <div
          ref={bodyRef}
          className="mb-10 rounded-2xl px-6 sm:px-8 pt-6 pb-8"
          style={{
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)',
          }}
        >
          {renderBody(cleanBody, catMeta)}
        </div>

        {/* ── RELATED ARTICLES ──────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-[#141c52] uppercase tracking-wide mb-3">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((p) => {
                const pCat  = p.categories[0];
                const pMeta = pCat ? CATEGORY_META[pCat.name] : undefined;
                return (
                  <Link
                    key={p.id}
                    href={`/learn/${p.id}`}
                    className="rounded-xl overflow-hidden group transition-all hover:shadow-md"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                  >
                    <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: pMeta?.bg ?? '#f9fafb' }}>
                      <span className="text-sm">{pMeta?.emoji}</span>
                      <span className="text-xs font-semibold" style={{ color: pMeta?.text ?? '#141c52' }}>{pCat?.name}</span>
                      {p.body && (
                        <span className="text-xs ml-auto opacity-50" style={{ color: pMeta?.text ?? '#6b7280' }}>
                          {readTime(p.body)}
                        </span>
                      )}
                    </div>
                    <div className="bg-white px-4 py-3">
                      <p className="text-sm font-semibold text-[#141c52] group-hover:underline leading-snug line-clamp-2">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(p.created_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── GLOBAL PREV / NEXT ────────────────────────────────────────── */}
        {(prevGlobal || nextGlobal) && (
          <div className="flex gap-3 my-8">
            {prevGlobal ? (
              <Link
                href={`/learn/${prevGlobal.id}`}
                className="flex-1 flex flex-col rounded-xl px-4 py-3 group transition-all hover:shadow-md"
                style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
              >
                <span className="text-xs text-gray-400 mb-1">← Previous</span>
                <span className="text-sm font-semibold text-[#141c52] group-hover:underline line-clamp-2">{prevGlobal.title}</span>
              </Link>
            ) : <div className="flex-1" />}
            {nextGlobal ? (
              <Link
                href={`/learn/${nextGlobal.id}`}
                className="flex-1 flex flex-col rounded-xl px-4 py-3 text-right group transition-all hover:shadow-md"
                style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
              >
                <span className="text-xs text-gray-400 mb-1">Next →</span>
                <span className="text-sm font-semibold text-[#141c52] group-hover:underline line-clamp-2">{nextGlobal.title}</span>
              </Link>
            ) : <div className="flex-1" />}
          </div>
        )}

        <hr className="border-gray-100 my-8" />

        {/* ── COMMENTS ──────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-bold text-[#141c52] mb-4">
            Comments{' '}
            <span className="text-gray-400 font-normal text-sm">({post.comments.length})</span>
          </h2>

          {post.comments.length === 0 && (
            <div
              className="text-center py-8 rounded-2xl mb-6"
              style={{ backgroundColor: '#fff', border: '1px solid #f0f0f0' }}
            >
              <p className="text-3xl mb-1">💬</p>
              <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {post.comments.map((comment) => {
              const av      = authorAvatarColor(comment.author);
              const initial = comment.author.charAt(0).toUpperCase();
              return (
                <div
                  key={comment.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: '#fff', border: '1px solid #f0f0f0' }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: av.bg, color: av.text }}
                    >
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-sm font-semibold text-[#141c52]">{comment.author}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.created_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{comment.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {isLoggedIn ? (
            <form
              onSubmit={handleComment}
              className="rounded-2xl p-5"
              style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
            >
              <h3 className="text-sm font-bold text-[#141c52] mb-3">Leave a comment</h3>
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={3}
                placeholder="Share your thoughts…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
              />
              {formError && <p className="text-red-500 text-xs mt-1.5">{formError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="mt-3 font-semibold px-5 py-2 rounded-full text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#FADB43', color: '#141c52' }}
              >
                {submitting ? 'Posting…' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div
              className="rounded-xl p-4 text-sm text-gray-500 text-center"
              style={{ backgroundColor: '#f9fafb', border: '1px solid #f0f0f0' }}
            >
              <Link href="/login" className="text-indigo-600 hover:underline font-medium">Log in</Link>{' '}
              to join the conversation.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ─── CourseNavigator ─────────────────────────────────────────────────────────

function CourseNavigator({
  course, courseMeta, courseIdx, coursePosts,
  courseDone, coursePct, prevLesson, nextLesson, currentId, isLoggedIn,
}: {
  course: CourseInfo;
  courseMeta: CatMeta | undefined;
  courseIdx: number;
  coursePosts: Post[];
  courseDone: number;
  coursePct: number;
  prevLesson: Post | null;
  nextLesson: Post | null;
  currentId: string;
  isLoggedIn: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalReadTime = coursePosts.reduce(
    (sum, p) => sum + Math.max(1, Math.ceil((p.body ?? '').split(/\s+/).filter(Boolean).length / 200)),
    0,
  );

  return (
    <div
      className="rounded-2xl mb-6 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${courseMeta?.bg ?? '#f9fafb'} 0%, #ffffff 80%)`,
        border: `2px solid ${courseMeta?.border ?? '#e5e7eb'}`,
      }}
    >
      <div className="px-5 py-4">

        {/* Header row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl text-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: courseMeta?.border ?? '#e5e7eb' }}
          >
            {course.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 leading-none mb-0.5">Part of</p>
            <p className="text-sm font-bold leading-tight" style={{ color: courseMeta?.text ?? '#141c52' }}>
              {course.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">~{totalReadTime} min total · {coursePosts.length} lessons</p>
          </div>

          {/* Progress ring (logged in) or lesson count (logged out) */}
          {isLoggedIn ? (
            <ProgressRing
              pct={coursePct}
              size={56}
              strokeWidth={5}
              color={courseMeta?.text ?? '#141c52'}
              trackColor={courseMeta?.border ?? '#e5e7eb'}
            >
              <span className="text-[10px] font-bold leading-none" style={{ color: courseMeta?.text ?? '#141c52' }}>
                {coursePct}%
              </span>
            </ProgressRing>
          ) : (
            <div className="text-right shrink-0">
              <p className="text-sm font-bold" style={{ color: courseMeta?.text ?? '#141c52' }}>
                {courseIdx + 1}
                <span className="text-xs text-gray-400 font-normal"> / {coursePosts.length}</span>
              </p>
              <p className="text-xs text-gray-400">lessons</p>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 mb-3.5 flex-wrap">
          {coursePosts.map((p, idx) => {
            const isCurrent = String(p.id) === currentId;
            return (
              <Link
                key={p.id}
                href={`/learn/${p.id}`}
                className="h-1.5 rounded-full transition-all duration-300 hover:opacity-80"
                style={{
                  width: isCurrent ? 20 : 6,
                  backgroundColor: p.is_completed
                    ? '#22c55e'
                    : isCurrent
                    ? courseMeta?.text ?? '#141c52'
                    : courseMeta?.border ?? '#e5e7eb',
                }}
                title={`Lesson ${idx + 1}: ${p.title}`}
              />
            );
          })}
        </div>

        {/* Prev / Next buttons */}
        <div className="flex gap-2">
          {prevLesson ? (
            <Link
              href={`/learn/${prevLesson.id}`}
              className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl border text-center hover:shadow-sm transition-all"
              style={{ borderColor: courseMeta?.border ?? '#e5e7eb', color: courseMeta?.text ?? '#141c52' }}
            >
              ← Prev Lesson
            </Link>
          ) : <div className="flex-1" />}

          {nextLesson ? (
            <Link
              href={`/learn/${nextLesson.id}`}
              className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl text-center hover:opacity-90 transition-all"
              style={{ backgroundColor: courseMeta?.text ?? '#141c52', color: '#fff' }}
            >
              Next Lesson →
            </Link>
          ) : (
            <div
              className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl text-center"
              style={{ backgroundColor: '#dcfce7', color: '#166534' }}
            >
              🎉 Course Complete!
            </div>
          )}
        </div>

        {/* Toggle lesson list */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1"
        >
          {expanded ? 'Hide' : 'View all'} lessons {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expandable lesson list — grouped by chapter */}
      {expanded && (
        <div
          className="px-5 pb-4 pt-3 border-t"
          style={{ borderColor: courseMeta?.border ?? '#e5e7eb' }}
        >
          {(() => {
            const postsWithMeta = coursePosts.map((p, idx) => ({
              p, idx, ...parsePostMeta(p.body ?? ''),
            }));
            const chapterMap = new Map<number, typeof postsWithMeta>();
            for (const pm of postsWithMeta) {
              const ch = pm.chapter ?? 0;
              if (!chapterMap.has(ch)) chapterMap.set(ch, []);
              chapterMap.get(ch)!.push(pm);
            }
            const sortedChapters = Array.from(chapterMap.entries()).sort(([a], [b]) => a - b);
            return sortedChapters.map(([chNum, items]) => (
              <div key={chNum} className="mb-3">
                {chNum > 0 && (
                  <div className="flex items-center gap-2 mb-1.5 px-3 py-0.5">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider"
                      style={{ color: courseMeta?.text ?? '#141c52', opacity: 0.45 }}
                    >
                      Ch {chNum}
                    </span>
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: courseMeta?.text ?? '#141c52', opacity: 0.65 }}
                    >
                      {CHAPTER_NAMES[chNum] ?? `Chapter ${chNum}`}
                    </span>
                  </div>
                )}
                <ol className="space-y-0.5">
                  {items.map(({ p, idx, difficulty }) => {
                    const isCurrent = String(p.id) === currentId;
                    return (
                      <li key={p.id}>
                        <Link
                          href={`/learn/${p.id}`}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all hover:bg-gray-50"
                          style={isCurrent ? { backgroundColor: courseMeta?.bg ?? '#f9fafb' } : {}}
                        >
                          <span
                            className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
                            style={
                              p.is_completed
                                ? { backgroundColor: '#dcfce7', color: '#166534' }
                                : isCurrent
                                ? { backgroundColor: courseMeta?.text ?? '#141c52', color: '#fff' }
                                : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                            }
                          >
                            {p.is_completed ? '✓' : idx + 1}
                          </span>
                          <span
                            className="flex-1 text-sm line-clamp-1"
                            style={{
                              color: isCurrent ? courseMeta?.text ?? '#141c52' : '#374151',
                              fontWeight: isCurrent ? 600 : 400,
                            }}
                          >
                            {p.title}
                          </span>
                          {difficulty && <DifficultyBadge difficulty={difficulty} size="xs" />}
                          {p.body && (
                            <span className="text-xs text-gray-400 shrink-0">{readTime(p.body)}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}

// ─── DifficultyBadge ─────────────────────────────────────────────────────────

function DifficultyBadge({
  difficulty,
  size = 'sm',
}: {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  size?: 'xs' | 'sm';
}) {
  const map = {
    Easy:   { bg: '#dcfce7', text: '#166534', border: '#bbf7d0', icon: '🟢' },
    Medium: { bg: '#fef9c3', text: '#92400e', border: '#fde68a', icon: '🟡' },
    Hard:   { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', icon: '🔴' },
  };
  const m = map[difficulty];
  return (
    <span
      className={`font-semibold rounded-full inline-flex items-center gap-1 whitespace-nowrap ${
        size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}
      style={{ backgroundColor: m.bg, color: m.text, border: `1px solid ${m.border}` }}
    >
      {m.icon} {difficulty}
    </span>
  );
}

// ─── TableOfContents ─────────────────────────────────────────────────────────

function TableOfContents({
  toc,
  catMeta,
}: {
  toc: { id: string; text: string }[];
  catMeta: CatMeta | undefined;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: '-15% 0% -65% 0%' },
    );
    toc.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [toc]);

  return (
    <div
      className="rounded-2xl p-5 mb-8"
      style={{ backgroundColor: catMeta?.bg ?? '#f9fafb', border: `1px solid ${catMeta?.border ?? '#e5e7eb'}` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{catMeta?.emoji ?? '📋'}</span>
        <h3 className="text-sm font-bold" style={{ color: catMeta?.text ?? '#141c52' }}>In this article</h3>
      </div>
      <ol className="space-y-1">
        {toc.map((item, idx) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="flex items-center gap-3 text-sm transition-all rounded-xl px-2 py-1.5 -mx-2 hover:bg-white/60"
                style={{ color: isActive ? catMeta?.text ?? '#141c52' : '#9ca3af' }}
              >
                <span
                  className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-all"
                  style={
                    isActive
                      ? { backgroundColor: catMeta?.text ?? '#141c52', color: '#fff' }
                      : { backgroundColor: catMeta?.border ?? '#e5e7eb', color: catMeta?.text ?? '#141c52' }
                  }
                >
                  {idx + 1}
                </span>
                <span className={`transition-all ${isActive ? 'font-semibold' : 'font-normal'}`}>{item.text}</span>
                {isActive && (
                  <span className="ml-auto text-xs" style={{ color: catMeta?.text ?? '#141c52' }}>↑</span>
                )}
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
