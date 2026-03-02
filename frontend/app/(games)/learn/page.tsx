'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  created_on: string;
  categories: Category[];
  is_bookmarked: boolean;
  is_completed: boolean;
}

interface CourseInfo {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  level: string;
  featured?: boolean;
}

// ─── Category colour / emoji map ─────────────────────────────────────────────

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

// ─── Static course catalogue ─────────────────────────────────────────────────

const COURSES: CourseInfo[] = [
  {
    id: 'grammar',
    name: 'Grammar Fundamentals',
    description: 'Articles, tenses, conditionals, passive voice — the backbone of English',
    emoji: '✏️',
    category: 'Grammar',
    level: 'Foundation',
    featured: true,
  },
  {
    id: 'pronunciation',
    name: 'Pronunciation Mastery',
    description: 'Sound clear, natural and confident in every conversation',
    emoji: '🗣️',
    category: 'Pronunciation',
    level: 'Intermediate',
  },
  {
    id: 'fluency',
    name: 'Fluency Builder',
    description: 'Speak smoothly, drop filler words, command the pause',
    emoji: '🌊',
    category: 'Fluency',
    level: 'Intermediate',
  },
  {
    id: 'vocabulary',
    name: 'Vocabulary Expansion',
    description: 'Build a rich, precise word bank for any situation',
    emoji: '📚',
    category: 'Vocabulary',
    level: 'All levels',
  },
  {
    id: 'communication',
    name: 'Communication Skills',
    description: 'Listen actively and express ideas with impact',
    emoji: '💬',
    category: 'Communication',
    level: 'Advanced',
  },
  {
    id: 'writing',
    name: 'Professional Writing',
    description: 'Craft clear, compelling emails and documents',
    emoji: '✍️',
    category: 'Writing',
    level: 'Intermediate',
  },
];

// ─── Chapter names ────────────────────────────────────────────────────────────

const CHAPTER_NAMES: Record<string, Record<number, string>> = {
  'Grammar':          { 1: 'The Basics', 2: 'Nouns & Articles', 3: 'Pronouns & Adjectives', 4: 'Tenses', 5: 'Sentence Structure', 6: 'Advanced Grammar' },
  'Pronunciation':    { 1: 'Sound Foundations', 2: 'Specific Challenges', 3: 'Advanced Features' },
  'Fluency':          { 1: 'Building Flow', 2: 'Mastering Pace' },
  'Vocabulary':       { 1: 'Core Vocabulary', 2: 'Advanced Usage' },
  'Communication':    { 1: 'Verbal Foundations', 2: 'Active Communication', 3: 'Non-Verbal Presence' },
  'Listening':        { 1: 'Foundations' },
  'Interview Skills': { 1: 'Interview Essentials' },
  'Writing':          { 1: 'Professional Writing' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function getExcerpt(body: string, maxLen = 110): string {
  const { cleanBody } = parsePostMeta(body);
  const clean = cleanBody
    .replace(/^##.*$/gm, '')
    .replace(/^- /gm, '')
    .replace(/\n+/g, ' ')
    .trim();
  return clean.length <= maxLen ? clean : clean.slice(0, maxLen) + '…';
}

function readTime(body: string): string {
  const { cleanBody } = parsePostMeta(body);
  const words = cleanBody.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

function useDebounce<T>(value: T, delay: number): T {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ─── Main page ───────────────────────────────────────────────────────────────

function LearnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();
  const articlesRef = useRef<HTMLDivElement>(null);

  const activeCategory = searchParams.get('category') || null;
  const showBookmarks = searchParams.get('bookmarks') === '1';
  const sortBy = (searchParams.get('sort') ?? 'newest') as 'newest' | 'oldest' | 'az';
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const search = useDebounce(searchInput, 300);

  function pushParams(cat: string | null, bm: boolean, sort: string, q: string) {
    const p = new URLSearchParams();
    if (cat) p.set('category', cat);
    if (bm) p.set('bookmarks', '1');
    if (sort && sort !== 'newest') p.set('sort', sort);
    if (q) p.set('search', q);
    router.push(`/learn${p.size ? `?${p}` : ''}`);
  }

  // ─── Queries ───────────────────────────────────────────────────────────────

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['learn-categories'],
    queryFn: () => api.get('/learn/categories/').then((r) => r.data),
  });

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['learn-posts', activeCategory, search, showBookmarks],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (activeCategory) params.category = activeCategory;
      if (search) params.search = search;
      if (showBookmarks) params.bookmarked = '1';
      return api.get('/learn/posts/', { params }).then((r) => r.data);
    },
  });

  const { data: allPosts = [], isLoading: allPostsLoading } = useQuery<Post[]>({
    queryKey: ['learn-posts-all'],
    queryFn: () => api.get('/learn/posts/').then((r) => r.data),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (postId: number) =>
      api.post(`/learn/posts/${postId}/bookmark/`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learn-posts'] });
      queryClient.invalidateQueries({ queryKey: ['learn-posts-all'] });
    },
  });

  function handleBookmark(e: React.MouseEvent, postId: number) {
    e.preventDefault();
    if (!isLoggedIn) { router.push('/login'); return; }
    bookmarkMutation.mutate(postId);
  }

  // ─── Derived state ──────────────────────────────────────────────────────────

  // activeCourse must be declared before sortedPosts because the sort callback
  // reads it synchronously — accessing a const before its declaration is TDZ.
  const activeCourse = COURSES.find((c) => c.category === activeCategory);

  const sortedPosts = [...posts].sort((a, b) => {
    // In course mode lessons must always appear chronologically (oldest → newest)
    // so lesson numbers match the intended chapter order.
    if (activeCourse) return new Date(a.created_on).getTime() - new Date(b.created_on).getTime();
    if (sortBy === 'oldest') return new Date(a.created_on).getTime() - new Date(b.created_on).getTime();
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
  });

  const noFilter = !activeCategory && !search && !showBookmarks;
  const featuredPost =
    noFilter && allPosts.length > 0
      ? [...allPosts].sort(
          (a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime(),
        )[0]
      : null;

  const completedCount = allPosts.filter((p) => p.is_completed).length;
  const completionPct =
    allPosts.length > 0 ? Math.round((completedCount / allPosts.length) * 100) : 0;

  function catPostCount(catName: string) {
    return allPosts.filter((p) => p.categories.some((c) => c.name === catName)).length;
  }
  function catCompletedCount(catName: string) {
    return allPosts.filter(
      (p) => p.is_completed && p.categories.some((c) => c.name === catName),
    ).length;
  }
  function catChapterCount(catName: string) {
    const chapters = new Set(
      allPosts
        .filter((p) => p.categories.some((c) => c.name === catName) && p.body)
        .map((p) => parsePostMeta(p.body).chapter)
        .filter((ch): ch is number => ch !== null),
    );
    return chapters.size;
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fb' }}>

      {/* ── PAGE HEADER BANNER ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(160deg, #eef2ff 0%, #f8f9fb 60%)',
          borderBottom: '1px solid #e8eaf0',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

            {/* Left: title + description */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xl">📚</span>
                <h1 className="text-[1.75rem] font-bold text-[#141c52] tracking-tight">Learn</h1>
              </div>
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-md">
                Structured courses and articles to sharpen your English — from grammar foundations to fluency.
              </p>
            </div>

            {/* Right: progress card */}
            {allPosts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 shrink-0 w-full sm:w-auto sm:min-w-[280px]">
                {/* Stat numbers */}
                <div className="flex items-center gap-5 mb-4">
                  <div>
                    <p className="text-2xl font-black text-[#141c52] leading-none">{allPosts.length}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-wide">Articles</p>
                  </div>
                  <div className="w-px h-10 bg-gray-100" />
                  <div>
                    <p className="text-2xl font-black text-[#141c52] leading-none">{categories.length}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-wide">Topics</p>
                  </div>
                  {isLoggedIn && (
                    <>
                      <div className="w-px h-10 bg-gray-100" />
                      <div>
                        <p
                          className="text-2xl font-black leading-none"
                          style={{ color: completionPct === 100 ? '#16a34a' : '#141c52' }}
                        >
                          {completionPct}%
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-wide">Complete</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Brand progress bar */}
                {isLoggedIn ? (
                  <>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400">Overall progress</span>
                      <span className="font-semibold text-[#141c52]">{completedCount} / {allPosts.length} done</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f3f4f6' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${completionPct}%`, background: 'linear-gradient(to right,#FADB43,#fe9940)' }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 text-center">Log in to track your progress</p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">

        {/* ── SEARCH + CATEGORY TABS ────────────────────────────────────────── */}
        <div ref={articlesRef} className="pb-6">
          {/* Search bar */}
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onBlur={() => pushParams(activeCategory, showBookmarks, sortBy, searchInput)}
              placeholder="Search articles…"
              className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all shadow-sm"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); pushParams(activeCategory, showBookmarks, sortBy, ''); }}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
            {/* All */}
            <FilterTab
              label="All"
              count={allPosts.length}
              active={noFilter}
              onClick={() => { setSearchInput(''); pushParams(null, false, sortBy, ''); }}
            />
            {/* Bookmarks */}
            <FilterTab
              label="🔖 Saved"
              active={showBookmarks}
              onClick={() => { setSearchInput(''); pushParams(null, true, sortBy, ''); }}
            />
            {/* Per-category */}
            {categories.map((cat) => {
              const m = CATEGORY_META[cat.name];
              const isAct = activeCategory === cat.name && !search && !showBookmarks;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSearchInput(''); pushParams(cat.name, false, sortBy, ''); }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap"
                  style={
                    isAct
                      ? {
                          backgroundColor: m?.text ?? '#141c52',
                          color: '#fff',
                          borderColor: m?.text ?? '#141c52',
                          boxShadow: `0 2px 8px ${m?.border ?? '#e5e7eb'}`,
                        }
                      : {
                          backgroundColor: m?.bg ?? '#fff',
                          color: m?.text ?? '#6b7280',
                          borderColor: m?.border ?? '#e5e7eb',
                        }
                  }
                >
                  {m?.emoji} {cat.name}
                  <span className="opacity-60">{catPostCount(cat.name)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── COURSE MODE BANNER ────────────────────────────────────────────── */}
        {activeCourse && !search && !allPostsLoading && (
          <CourseBanner
            course={activeCourse}
            totalPosts={catPostCount(activeCourse.category)}
            completedPosts={catCompletedCount(activeCourse.category)}
            chapterCount={catChapterCount(activeCourse.category)}
            isLoggedIn={isLoggedIn}
          />
        )}

        {/* ── FEATURED HERO (no filter active) ─────────────────────────────── */}
        {featuredPost && !activeCourse && (
          <FeaturedHero post={featuredPost} onBookmark={handleBookmark} />
        )}

        {/* ── SORT ROW ──────────────────────────────────────────────────────── */}
        {!isLoading && posts.length > 0 && !activeCourse && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              {posts.length} {activeCourse ? 'lesson' : 'article'}{posts.length !== 1 ? 's' : ''}
              {activeCategory && (
                <span>
                  {' '}in <strong className="text-[#141c52]">{activeCategory}</strong>
                </span>
              )}
            </p>
            {activeCourse && !search ? (
              <span className="flex items-center gap-1.5 text-xs text-gray-400 px-3 py-1.5 bg-white rounded-xl border border-gray-200">
                <span>📋</span> In lesson order
              </span>
            ) : (
              <select
                value={sortBy}
                onChange={(e) => pushParams(activeCategory, showBookmarks, e.target.value, searchInput)}
                aria-label="Sort articles"
                className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-500 focus:outline-none focus:border-indigo-300"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="az">A – Z</option>
              </select>
            )}
          </div>
        )}

        {/* ── ARTICLE GRID ──────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-sm">
                <div className="h-16 animate-pulse" style={{ backgroundColor: '#e9ecef' }} />
                <div className="bg-white p-4 space-y-2">
                  <div className="h-4 rounded animate-pulse w-3/4" style={{ backgroundColor: '#f0f0f0' }} />
                  <div className="h-3 rounded animate-pulse" style={{ backgroundColor: '#f5f5f5' }} />
                  <div className="h-3 rounded animate-pulse w-2/3" style={{ backgroundColor: '#f5f5f5' }} />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 pb-12">
            <p className="text-5xl mb-3">📭</p>
            {search ? (
              <>
                <p className="font-semibold text-gray-600 text-base">No results for &ldquo;{search}&rdquo;</p>
                <p className="text-sm mt-1 text-gray-400">Try a different keyword or clear your search.</p>
                <button
                  onClick={() => { setSearchInput(''); pushParams(activeCategory, showBookmarks, sortBy, ''); }}
                  className="mt-4 text-sm font-semibold text-indigo-600 hover:underline"
                >
                  Clear search
                </button>
              </>
            ) : showBookmarks ? (
              <>
                <p className="font-semibold text-gray-600 text-base">No saved articles yet.</p>
                <p className="text-sm mt-1 text-gray-400">Bookmark articles while reading to find them here.</p>
              </>
            ) : (
              <p className="font-semibold text-gray-600">No posts in this category yet.</p>
            )}
          </div>
        ) : activeCourse ? (
          // ── COURSE MODE: track panel with left filters + right list ─────────
          <CourseTrackPanel
            posts={sortedPosts}
            catMeta={CATEGORY_META[activeCourse.category]}
            courseCategory={activeCourse.category}
            search={search}
            onBookmark={handleBookmark}
            isLoggedIn={isLoggedIn}
          />
        ) : (
          // ── STANDARD MODE: flat 2-col grid ──────────────────────────────────
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
            {sortedPosts.map((post) => {
              const isNew =
                !post.is_completed &&
                Date.now() - new Date(post.created_on).getTime() < 14 * 24 * 60 * 60 * 1000;
              const primaryCat = post.categories[0];
              const catMeta = primaryCat ? CATEGORY_META[primaryCat.name] : undefined;

              return (
                <ArticleCard
                  key={post.id}
                  post={post}
                  catMeta={catMeta}
                  isNew={isNew}
                  lessonNum={null}
                  search={search}
                  onBookmark={handleBookmark}
                  onCategoryClick={(name) => { setSearchInput(''); pushParams(name, false, sortBy, ''); }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FilterTab ───────────────────────────────────────────────────────────────

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap"
      style={
        active
          ? { backgroundColor: '#141c52', color: '#fff', borderColor: '#141c52' }
          : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
      }
    >
      {label}
      {count !== undefined && <span className="opacity-60">{count}</span>}
    </button>
  );
}

// ─── CourseBanner ────────────────────────────────────────────────────────────

function CourseBanner({
  course,
  totalPosts,
  completedPosts,
  chapterCount,
  isLoggedIn,
}: {
  course: CourseInfo;
  totalPosts: number;
  completedPosts: number;
  chapterCount: number;
  isLoggedIn: boolean;
}) {
  const meta = CATEGORY_META[course.category];
  const pct = totalPosts > 0 && isLoggedIn ? Math.round((completedPosts / totalPosts) * 100) : 0;

  return (
    <div
      className="rounded-2xl p-5 mb-6 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${meta?.bg ?? '#f9fafb'} 0%, #ffffff 70%)`,
        border: `2px solid ${meta?.border ?? '#e5e7eb'}`,
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.07]"
        style={{ backgroundColor: meta?.text ?? '#141c52' }}
      />
      <div
        className="absolute right-20 -bottom-8 w-28 h-28 rounded-full opacity-[0.05]"
        style={{ backgroundColor: meta?.text ?? '#141c52' }}
      />

      <div className="flex items-start gap-4 relative z-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0"
          style={{ backgroundColor: meta?.border ?? '#e5e7eb' }}
        >
          {course.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: meta?.bg ?? '#f9fafb', color: meta?.text ?? '#141c52', border: `1px solid ${meta?.border ?? '#e5e7eb'}` }}
            >
              {course.level}
            </span>
            {course.featured && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#78350f' }}
              >
                ★ Featured Course
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">
              {chapterCount > 0 && `${chapterCount} chapter${chapterCount !== 1 ? 's' : ''} · `}{totalPosts} lesson{totalPosts !== 1 ? 's' : ''}
            </span>
          </div>

          <h2
            className="text-xl font-bold mb-1 leading-tight"
            style={{ color: meta?.text ?? '#141c52' }}
          >
            {course.name}
          </h2>
          <p className="text-sm text-gray-500 mb-3">{course.description}</p>

          {isLoggedIn && totalPosts > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">
                  {completedPosts} of {totalPosts} lessons completed
                </span>
                <span className="font-bold" style={{ color: meta?.text ?? '#141c52' }}>
                  {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: meta?.border ?? '#e5e7eb' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: meta?.text ?? '#141c52' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FeaturedHero ────────────────────────────────────────────────────────────

function FeaturedHero({
  post,
  onBookmark,
}: {
  post: Post;
  onBookmark: (e: React.MouseEvent, id: number) => void;
}) {
  const primaryCat = post.categories[0];
  const catMeta = primaryCat ? CATEGORY_META[primaryCat.name] : undefined;
  const excerpt = post.body ? getExcerpt(post.body, 180) : '';
  const { difficulty } = post.body ? parsePostMeta(post.body) : { difficulty: null };

  return (
    <Link href={`/learn/${post.id}`} className="block group mb-6">
      <div
        className="rounded-2xl overflow-hidden transition-all duration-200 group-hover:shadow-xl"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}
      >
        {/* Coloured top band */}
        <div
          className="px-6 py-5 relative overflow-hidden"
          style={{ backgroundColor: catMeta?.bg ?? '#f9fafb' }}
        >
          <div
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
            style={{ backgroundColor: catMeta?.text ?? '#141c52' }}
          />
          <div
            className="absolute right-24 bottom-0 w-16 h-16 rounded-full opacity-10"
            style={{ backgroundColor: catMeta?.text ?? '#141c52' }}
          />

          <div className="flex items-center gap-3 relative z-10">
            <span className="text-3xl">{catMeta?.emoji ?? '📖'}</span>
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {post.categories.map((cat) => {
                const m = CATEGORY_META[cat.name];
                return (
                  <span
                    key={cat.id}
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: m?.border ?? '#e5e7eb', color: m?.text ?? '#141c52' }}
                  >
                    {m?.emoji} {cat.name}
                  </span>
                );
              })}
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#78350f' }}
              >
                Latest
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {difficulty && <DifficultyBadge difficulty={difficulty} />}
              {post.body && (
                <span
                  className="text-xs font-medium"
                  style={{ color: catMeta?.text ?? '#141c52', opacity: 0.7 }}
                >
                  {readTime(post.body)}
                </span>
              )}
              <button
                onClick={(e) => onBookmark(e, post.id)}
                className="text-xl hover:scale-110 transition-transform"
                title={post.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                {post.is_bookmarked ? '🔖' : '🏷️'}
              </button>
            </div>
          </div>
        </div>

        {/* White content area */}
        <div className="bg-white px-6 py-5">
          <h2 className="text-[1.4rem] font-bold text-[#141c52] group-hover:underline leading-snug tracking-tight mb-2.5">
            {post.title}
          </h2>
          <p className="text-[15px] text-gray-500 leading-[1.75] mb-4">{excerpt}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {new Date(post.created_on).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {post.is_completed && (
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                ✓ Completed
              </span>
            )}
            <span className="ml-auto text-sm font-semibold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Read article
              <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── ArticleCard ─────────────────────────────────────────────────────────────

function ArticleCard({
  post,
  catMeta,
  isNew,
  lessonNum,
  search,
  onBookmark,
  onCategoryClick,
}: {
  post: Post;
  catMeta: { bg: string; text: string; border: string; emoji: string } | undefined;
  isNew: boolean;
  lessonNum: number | null;
  search: string;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onCategoryClick: (name: string) => void;
}) {
  const excerpt = post.body ? getExcerpt(post.body, 100) : '';
  const { difficulty } = post.body ? parsePostMeta(post.body) : { difficulty: null };

  return (
    <Link href={`/learn/${post.id}`} className="block group">
      <div
        className="rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-200"
        style={{
          boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)',
          transform: 'translateY(0)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 6px 20px rgba(0,0,0,0.08), 0 0 0 1.5px ${catMeta?.border ?? '#e5e7eb'}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)';
        }}
      >
        {/* Coloured header band */}
        <div
          className="px-4 pt-3 pb-3 flex items-center gap-2 relative overflow-hidden"
          style={{
            background: catMeta
              ? `linear-gradient(180deg, ${catMeta.bg} 0%, ${catMeta.bg}cc 100%)`
              : '#f9fafb',
          }}
        >
          <div
            className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10"
            style={{ backgroundColor: catMeta?.text ?? '#141c52' }}
          />

          {/* Lesson number (course mode) */}
          {lessonNum !== null && (
            <span
              className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 relative z-10"
              style={{ backgroundColor: catMeta?.text ?? '#141c52', color: '#fff' }}
            >
              {lessonNum}
            </span>
          )}

          {/* Category pills */}
          <div className="flex items-center gap-1.5 flex-wrap relative z-10">
            {post.categories.map((cat) => {
              const m = CATEGORY_META[cat.name];
              return (
                <button
                  key={cat.id}
                  onClick={(e) => { e.preventDefault(); onCategoryClick(cat.name); }}
                  className="text-xs font-semibold px-2 py-0.5 rounded-full hover:opacity-75 transition-opacity"
                  style={{ backgroundColor: m?.border ?? '#e5e7eb', color: m?.text ?? '#141c52' }}
                >
                  {m?.emoji} {cat.name}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-1.5 shrink-0 relative z-10">
            {isNew && (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full leading-none"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#78350f' }}
              >
                New
              </span>
            )}
            {difficulty && <DifficultyBadge difficulty={difficulty} size="xs" />}
            {post.body && (
              <span
                className="text-xs font-medium"
                style={{ color: catMeta?.text ?? '#6b7280', opacity: 0.65 }}
              >
                {readTime(post.body)}
              </span>
            )}
          </div>
        </div>

        {/* White content */}
        <div className="bg-white px-4 py-4 flex flex-col flex-1">
          <h2 className="text-[15px] font-bold text-[#141c52] group-hover:underline leading-snug tracking-tight mb-2">
            {search ? highlightMatch(post.title, search) : post.title}
          </h2>

          {excerpt && (
            <p className="text-[13px] text-gray-500 leading-[1.65] line-clamp-2 mb-3">
              {excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 mt-auto pt-2.5 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {new Date(post.created_on).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={(e) => onBookmark(e, post.id)}
                title={post.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
                className="text-sm hover:scale-110 transition-transform leading-none"
              >
                {post.is_bookmarked ? '🔖' : '🏷️'}
              </button>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  post.is_completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {post.is_completed ? '✓ Done' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── CourseTrackPanel ─────────────────────────────────────────────────────────

const DIFF_MAP = {
  Easy:   { bg: '#dcfce7', text: '#166534', border: '#bbf7d0', dot: '#22c55e' },
  Medium: { bg: '#fef9c3', text: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  Hard:   { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', dot: '#ef4444' },
} as const;

function CourseTrackPanel({
  posts,
  catMeta,
  courseCategory,
  search,
  onBookmark,
  isLoggedIn,
}: {
  posts: Post[];
  catMeta: { bg: string; text: string; border: string; emoji: string } | undefined;
  courseCategory: string;
  search: string;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  isLoggedIn: boolean;
}) {
  const [hideCompleted, setHideCompleted] = useState(false);
  const [diffFilter, setDiffFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [chapterFilter, setChapterFilter] = useState<number | null>(null);

  const postsWithMeta = posts.map((p, idx) => ({
    post: p,
    lessonNum: idx + 1,
    ...parsePostMeta(p.body ?? ''),
  }));

  const chapters = Array.from(
    new Set(postsWithMeta.map((pm) => pm.chapter).filter((ch): ch is number => ch !== null)),
  ).sort((a, b) => a - b);

  const filtered = postsWithMeta.filter((pm) => {
    if (hideCompleted && pm.post.is_completed) return false;
    if (diffFilter !== 'All' && pm.difficulty !== diffFilter) return false;
    if (chapterFilter !== null && pm.chapter !== chapterFilter) return false;
    return true;
  });

  const completedCount = postsWithMeta.filter((pm) => pm.post.is_completed).length;
  const pct = postsWithMeta.length > 0 && isLoggedIn
    ? Math.round((completedCount / postsWithMeta.length) * 100)
    : 0;

  return (
    <div className="flex gap-4 pb-12 items-start">

      {/* ── Left: filter sidebar ── */}
      <div className="flex-shrink-0 space-y-4" style={{ width: 172 }}>

        {/* Progress mini-card */}
        <div className="rounded-xl p-3.5 bg-white border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Progress</p>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-2xl font-black leading-none" style={{ color: '#141c52' }}>{completedCount}</span>
            <span className="text-xs text-gray-400 pb-0.5">/ {postsWithMeta.length} done</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: catMeta?.border ? `${catMeta.border}55` : '#f3f4f6' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(to right,${catMeta?.text ?? '#141c52'},${catMeta?.border ?? '#e5e7eb'})`,
              }}
            />
          </div>
        </div>

        {/* Visibility toggle */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">View</p>
          <button
            onClick={() => setHideCompleted((v) => !v)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border"
            style={
              hideCompleted
                ? { background: '#141c52', color: '#fff', borderColor: '#141c52' }
                : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
            }
          >
            <span>{hideCompleted ? '🙈' : '👁️'}</span>
            {hideCompleted ? 'Show all' : 'Hide done'}
            {completedCount > 0 && (
              <span className="ml-auto text-[10px] opacity-60">{completedCount}</span>
            )}
          </button>
        </div>

        {/* Difficulty filter */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Difficulty</p>
          <div className="space-y-1.5">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => {
              const isAct = diffFilter === d;
              const dm = d !== 'All' ? DIFF_MAP[d] : null;
              return (
                <button
                  key={d}
                  onClick={() => setDiffFilter(d)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border text-left"
                  style={
                    isAct
                      ? dm
                        ? { background: dm.bg, color: dm.text, borderColor: dm.border }
                        : { background: '#141c52', color: '#fff', borderColor: '#141c52' }
                      : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                  }
                >
                  {dm && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dm.dot }} />}
                  {d}
                  <span className="ml-auto text-[10px] opacity-55">
                    {d === 'All'
                      ? postsWithMeta.length
                      : postsWithMeta.filter((pm) => pm.difficulty === d).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter filter */}
        {chapters.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Chapter</p>
            <div className="space-y-1.5">
              <button
                onClick={() => setChapterFilter(null)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border text-left"
                style={
                  chapterFilter === null
                    ? { background: '#141c52', color: '#fff', borderColor: '#141c52' }
                    : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                }
              >
                All
                <span className="ml-auto text-[10px] opacity-55">{postsWithMeta.length}</span>
              </button>
              {chapters.map((ch) => {
                const isAct = chapterFilter === ch;
                const name = CHAPTER_NAMES[courseCategory]?.[ch] ?? `Ch ${ch}`;
                const count = postsWithMeta.filter((pm) => pm.chapter === ch).length;
                return (
                  <button
                    key={ch}
                    onClick={() => setChapterFilter(isAct ? null : ch)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border text-left"
                    style={
                      isAct
                        ? { background: catMeta?.bg ?? '#f9fafb', color: catMeta?.text ?? '#141c52', borderColor: catMeta?.border ?? '#e5e7eb' }
                        : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                    }
                  >
                    <span className="truncate flex-1">{name}</span>
                    <span className="text-[10px] opacity-55 flex-shrink-0">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Right: lesson list ── */}
      <div className="flex-1 min-w-0">
        {/* List header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-[#141c52]">{filtered.length}</span>
            {' '}lesson{filtered.length !== 1 ? 's' : ''}
            {hideCompleted && completedCount > 0 && (
              <span className="ml-1 opacity-60">· {completedCount} hidden</span>
            )}
          </p>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">In order</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-semibold text-gray-600 text-sm">
              {hideCompleted && completedCount === postsWithMeta.length
                ? 'All lessons complete!'
                : 'No lessons match this filter'}
            </p>
            <button
              onClick={() => { setHideCompleted(false); setDiffFilter('All'); setChapterFilter(null); }}
              className="mt-3 text-xs font-semibold hover:underline"
              style={{ color: '#141c52' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filtered.map(({ post, lessonNum, chapter, difficulty }, idx) => {
              const isDone = post.is_completed;
              const chName = chapter ? (CHAPTER_NAMES[courseCategory]?.[chapter] ?? `Ch ${chapter}`) : null;
              const dm = difficulty ? DIFF_MAP[difficulty] : null;
              const isLast = idx === filtered.length - 1;

              return (
                <div
                  key={post.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${!isLast ? 'border-b border-gray-50' : ''} ${isDone ? 'opacity-40' : 'hover:bg-gray-50/70'}`}
                >
                  {/* Order badge */}
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={
                      isDone
                        ? { background: '#dcfce7', color: '#166534' }
                        : { background: catMeta?.bg ?? '#f9fafb', color: catMeta?.text ?? '#141c52' }
                    }
                  >
                    {isDone ? '✓' : lessonNum}
                  </span>

                  {/* Bookmark star */}
                  <button
                    onClick={(e) => onBookmark(e, post.id)}
                    className="flex-shrink-0 text-base leading-none transition-transform hover:scale-125"
                    title={post.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    {post.is_bookmarked ? '⭐' : '☆'}
                  </button>

                  {/* Title + chapter */}
                  <Link href={`/learn/${post.id}`} className="flex-1 min-w-0 group">
                    <p
                      className={`text-sm font-semibold leading-snug group-hover:underline truncate ${
                        isDone ? 'line-through text-gray-400' : 'text-[#141c52]'
                      }`}
                    >
                      {search ? highlightMatch(post.title, search) : post.title}
                    </p>
                    {chName && (
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{chName}</p>
                    )}
                  </Link>

                  {/* Difficulty */}
                  {dm && (
                    <span
                      className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: dm.bg, color: dm.text, border: `1px solid ${dm.border}` }}
                    >
                      {difficulty}
                    </span>
                  )}

                  {/* Status */}
                  <span
                    className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={
                      isDone
                        ? { background: '#dcfce7', color: '#166534' }
                        : { background: '#f3f4f6', color: '#9ca3af' }
                    }
                  >
                    {isDone ? '✓ Done' : 'To do'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
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

// ─── highlightMatch ───────────────────────────────────────────────────────────

function highlightMatch(text: string, query: string): React.ReactNode {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── Learn Hero ──────────────────────────────────────────────────────────────

const LN_STYLES = `
  @keyframes lnOrbDrift {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(-40px,30px) scale(1.08); }
    66%      { transform:translate(30px,-22px) scale(0.94); }
  }
  @keyframes lnRise {
    from { opacity:0; transform:translateY(48px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes lnChev {
    0%,100% { transform:translateY(0); opacity:0.4; }
    50%     { transform:translateY(10px); opacity:1; }
  }
  @keyframes lnCta {
    0%,100% { box-shadow:0 8px 30px rgba(250,219,67,.28); }
    50%     { box-shadow:0 8px 50px rgba(250,219,67,.55); }
  }
  @keyframes lnCount {
    from { opacity:0; transform:scale(0.6) translateY(12px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  .ln-orb-a { animation:lnOrbDrift 14s ease-in-out infinite; }
  .ln-orb-b { animation:lnOrbDrift 19s ease-in-out infinite reverse; }
  .ln-orb-c { animation:lnOrbDrift 11s ease-in-out infinite 3s; }
  .ln-rise-1 { animation:lnRise .85s ease both; }
  .ln-rise-2 { animation:lnRise .85s .18s ease both; }
  .ln-rise-3 { animation:lnRise .85s .34s ease both; }
  .ln-rise-4 { animation:lnRise .85s .52s ease both; }
  .ln-chev   { animation:lnChev 1.9s ease-in-out infinite; }
  .ln-cta    { animation:lnCta 3s ease-in-out infinite; }
  .ln-stat   { animation:lnCount .6s ease both; }
  .ln-stat-1 { animation-delay:.55s; }
  .ln-stat-2 { animation-delay:.72s; }
  .ln-stat-3 { animation-delay:.89s; }
`;

const LN_STATS = [
  { value: '8',   label: 'Courses' },
  { value: '8',   label: 'Categories' },
  { value: 'AI',  label: 'Powered' },
];

const BRAND_LN = { primary: '#141c52', gradient: 'linear-gradient(to right,#FADB43,#fe9940)' };

function LearnHero({ onScrollDown }: { onScrollDown: () => void }) {
  const [p, setP] = useState(0);

  useEffect(() => {
    const update = () => setP(Math.min(1, window.scrollY / window.innerHeight));
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Ease-in-out cubic
  const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

  // Background: upward curtain wipe (bottom inset grows)
  const wipe = e * 110;

  const textOpacity = Math.max(0, 1 - e * 1.9);
  const textScale   = 1 - e * 0.07;
  const chevOpacity = Math.max(0, 1 - e * 3.5);

  return (
    <div className="relative overflow-hidden" style={{ height: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: LN_STYLES }} />

      {/* Background — upward wipe */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg,#080d26 0%,#141c52 48%,#1a2460 100%)',
          clipPath: `inset(0 0 ${wipe}% 0)`,
        }}
      />

      {/* Orbs */}
      <div className="ln-orb-a absolute rounded-full pointer-events-none"
        style={{ width: 540, height: 540, top: -150, right: -110,
          background: 'radial-gradient(circle,rgba(250,219,67,.13) 0%,transparent 68%)',
          clipPath: `inset(0 0 ${wipe}% 0)` }} />
      <div className="ln-orb-b absolute rounded-full pointer-events-none"
        style={{ width: 420, height: 420, bottom: -100, left: -120,
          background: 'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 68%)',
          clipPath: `inset(0 0 ${wipe}% 0)` }} />
      <div className="ln-orb-c absolute rounded-full pointer-events-none"
        style={{ width: 290, height: 290, top: '30%', left: '14%',
          background: 'radial-gradient(circle,rgba(167,139,250,.12) 0%,transparent 68%)',
          clipPath: `inset(0 0 ${wipe}% 0)` }} />

      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: Math.max(0, 0.035 - e * 0.035),
          clipPath: `inset(0 0 ${wipe}% 0)`,
        }} />

      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center"
        style={{ opacity: textOpacity, transform: `scale(${textScale})` }}
      >
        {/* Label */}
        <div className="ln-rise-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.11)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FADB43] inline-block" />
          Learning Hub
        </div>

        {/* Headline */}
        <h1 className="ln-rise-2 font-black leading-[1.02] mb-4"
          style={{ fontSize: 'clamp(2.8rem,8vw,5.5rem)' }}>
          <span style={{ color: '#fff' }}>Read. Learn.</span>
          <br />
          <span style={{
            backgroundImage: 'linear-gradient(90deg,#FADB43,#fe9940,#FADB43)',
            backgroundSize: '200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Level Up.
          </span>
        </h1>

        {/* Sub */}
        <p className="ln-rise-3 text-base font-medium mb-9 max-w-md mx-auto"
          style={{ color: 'rgba(255,255,255,0.48)' }}>
          Structured articles across grammar, vocabulary, pronunciation &amp; more — track your progress as you go.
        </p>

        {/* Stat row */}
        <div className="ln-rise-3 flex items-center justify-center gap-10 mb-10">
          {LN_STATS.map((s, i) => (
            <div key={s.label} className={`ln-stat ln-stat-${i + 1} text-center`}>
              <p className="text-3xl font-black text-white leading-none">{s.value}</p>
              <p className="text-xs font-semibold mt-1.5 uppercase tracking-wide"
                style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="ln-rise-4 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onScrollDown}
            className="ln-cta px-8 py-3.5 rounded-full text-sm font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95"
            style={{ background: BRAND_LN.gradient, color: BRAND_LN.primary }}
          >
            Browse Articles ↓
          </button>
          <Link
            href="/learn?category=Grammar"
            className="px-7 py-3.5 rounded-full text-sm font-semibold border transition-all hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.62)' }}
          >
            ✏️ Grammar →
          </Link>
        </div>
      </div>

      {/* Scroll chevron */}
      <button
        onClick={onScrollDown}
        className="ln-chev absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
        style={{ opacity: chevOpacity }}
        aria-label="Scroll down"
      >
        <span className="text-[0.58rem] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.32)' }}>Scroll</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          style={{ color: 'rgba(255,255,255,0.38)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Gradient fade into content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom,transparent,#f8f9fb)' }} />
    </div>
  );
}

export default function LearnPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <LearnHero onScrollDown={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      <div ref={contentRef}>
        <Suspense>
          <LearnContent />
        </Suspense>
      </div>
    </>
  );
}
