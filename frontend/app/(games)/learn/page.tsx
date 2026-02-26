'use client';

import { useState, useEffect, useRef } from 'react';
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
  completed: boolean;
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

const CHAPTER_NAMES: Record<number, string> = {
  1: 'The Basics',
  2: 'Nouns & Articles',
  3: 'Pronouns & Adjectives',
  4: 'Tenses',
  5: 'Sentence Structure',
  6: 'Advanced Grammar',
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

export default function LearnPage() {
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

  function selectCourse(catName: string) {
    setSearchInput('');
    pushParams(catName, false, sortBy, '');
    setTimeout(
      () => articlesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      80,
    );
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
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xl">📚</span>
                <h1 className="text-[1.75rem] font-bold text-[#141c52] tracking-tight">Learn</h1>
              </div>
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-md">
                Structured courses and articles to sharpen your English — from grammar foundations to fluency.
              </p>
            </div>

            {/* Stats chips */}
            {allPosts.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <StatChip icon="📖" value={allPosts.length} label="articles" />
                <StatChip icon="🗂️" value={categories.length} label="topics" />
                {isLoggedIn && <StatChip icon="✅" value={`${completionPct}%`} label="complete" accent />}
              </div>
            )}
          </div>

          {/* Progress bar for logged-in users */}
          {isLoggedIn && allPosts.length > 0 && (
            <div className="mt-4 max-w-xs">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Overall progress</span>
                <span className="font-semibold text-[#141c52]">{completedCount} / {allPosts.length} done</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${completionPct}%`, background: 'linear-gradient(to right, #4ade80, #22c55e)' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">

        {/* ── LEARNING PATHS ─────────────────────────────────────────────── */}
        <section className="pt-8 pb-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-base font-bold text-[#141c52]">Learning Paths</h2>
            <span className="text-xs text-gray-400">Choose a course to study</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
            {COURSES.map((course) => {
              const meta = CATEGORY_META[course.category];
              const total = catPostCount(course.category);
              const done = catCompletedCount(course.category);
              const chapters = catChapterCount(course.category);
              const pct = total > 0 && isLoggedIn ? Math.round((done / total) * 100) : 0;
              const isActive = activeCategory === course.category;

              return (
                <button
                  key={course.id}
                  onClick={() => selectCourse(course.category)}
                  className="flex-shrink-0 w-[200px] text-left group"
                >
                  <div
                    className="rounded-2xl overflow-hidden transition-all duration-200"
                    style={{
                      boxShadow: isActive
                        ? `0 0 0 2px ${meta?.text ?? '#141c52'}, 0 8px 24px rgba(0,0,0,0.12)`
                        : '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
                      transform: isActive ? 'translateY(-2px)' : undefined,
                    }}
                  >
                    {/* Coloured top */}
                    <div
                      className="h-[88px] flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: meta?.bg ?? '#f9fafb' }}
                    >
                      {/* Decorative blobs */}
                      <div
                        className="absolute -right-5 -top-5 w-20 h-20 rounded-full opacity-20"
                        style={{ backgroundColor: meta?.text ?? '#141c52' }}
                      />
                      <div
                        className="absolute left-3 bottom-2 w-10 h-10 rounded-full opacity-10"
                        style={{ backgroundColor: meta?.text ?? '#141c52' }}
                      />
                      <span className="text-4xl relative z-10">{course.emoji}</span>
                      {course.featured && (
                        <span
                          className="absolute top-2 left-2 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none"
                          style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#78350f' }}
                        >
                          ★ Featured
                        </span>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="bg-white px-3 pb-3 pt-2.5">
                      <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded-full inline-block mb-1.5"
                        style={{ backgroundColor: meta?.bg ?? '#f9fafb', color: meta?.text ?? '#141c52' }}
                      >
                        {course.level}
                      </span>
                      <p
                        className="text-[13.5px] font-bold leading-tight tracking-tight mb-1 group-hover:underline"
                        style={{ color: meta?.text ?? '#141c52' }}
                      >
                        {course.name}
                      </p>
                      <p className="text-[12px] text-gray-400 leading-[1.55] mb-2.5 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Lesson count + progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">
                            {chapters > 0 && <>{chapters} ch · </>}{total} lesson{total !== 1 ? 's' : ''}
                          </span>
                          {isLoggedIn && total > 0 && (
                            <span className="font-semibold" style={{ color: meta?.text ?? '#141c52' }}>
                              {pct}%
                            </span>
                          )}
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: meta?.border ?? '#e5e7eb' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${isLoggedIn ? pct : 0}%`,
                              backgroundColor: meta?.text ?? '#141c52',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

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
        {!isLoading && posts.length > 0 && (
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
          // ── COURSE MODE: chapter-grouped grid ──────────────────────────────
          <ChapterGroupedGrid
            posts={sortedPosts}
            catMeta={CATEGORY_META[activeCourse.category]}
            search={search}
            onBookmark={handleBookmark}
            onCategoryClick={(name) => { setSearchInput(''); pushParams(name, false, sortBy, ''); }}
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

// ─── StatChip ────────────────────────────────────────────────────────────────

function StatChip({
  icon,
  value,
  label,
  accent,
}: {
  icon: string;
  value: string | number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs shadow-sm"
      style={{
        backgroundColor: accent ? '#dcfce7' : '#fff',
        border: `1px solid ${accent ? '#bbf7d0' : '#e5e7eb'}`,
      }}
    >
      <span>{icon}</span>
      <span className="font-bold text-[#141c52]">{value}</span>
      <span className="text-gray-400">{label}</span>
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
              {chapterCount > 0 && `${chapterCount} chapters · `}{totalPosts} lessons
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

// ─── ChapterGroupedGrid ───────────────────────────────────────────────────────

function ChapterGroupedGrid({
  posts,
  catMeta,
  search,
  onBookmark,
  onCategoryClick,
}: {
  posts: Post[];
  catMeta: { bg: string; text: string; border: string; emoji: string } | undefined;
  search: string;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onCategoryClick: (name: string) => void;
}) {
  // Parse chapter for each post and group them
  const postsWithMeta = posts.map((p, idx) => ({
    post: p,
    lessonNum: idx + 1,
    ...parsePostMeta(p.body ?? ''),
  }));

  const chapterMap = new Map<number, typeof postsWithMeta>();
  for (const pm of postsWithMeta) {
    const ch = pm.chapter ?? 0;
    if (!chapterMap.has(ch)) chapterMap.set(ch, []);
    chapterMap.get(ch)!.push(pm);
  }
  const sortedChapters = Array.from(chapterMap.entries()).sort(([a], [b]) => a - b);

  return (
    <div className="pb-12 space-y-8">
      {sortedChapters.map(([chNum, items]) => (
        <div key={chNum}>
          {/* Chapter divider header */}
          {chNum > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl"
                style={{ backgroundColor: catMeta?.bg ?? '#f9fafb', border: `1.5px solid ${catMeta?.border ?? '#e5e7eb'}` }}
              >
                <span className="text-xs font-black uppercase tracking-widest opacity-50" style={{ color: catMeta?.text ?? '#141c52' }}>
                  Ch {chNum}
                </span>
                <span className="w-px h-3.5 opacity-20" style={{ backgroundColor: catMeta?.text ?? '#141c52' }} />
                <span className="text-sm font-bold" style={{ color: catMeta?.text ?? '#141c52' }}>
                  {CHAPTER_NAMES[chNum] ?? `Chapter ${chNum}`}
                </span>
                <span className="text-xs opacity-50" style={{ color: catMeta?.text ?? '#141c52' }}>
                  {items.length} lesson{items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex-1 h-px" style={{ backgroundColor: catMeta?.border ?? '#e5e7eb' }} />
              {/* Difficulty distribution pills */}
              {(['Easy', 'Medium', 'Hard'] as const).map((d) => {
                const count = items.filter((i) => i.difficulty === d).length;
                if (!count) return null;
                const dMap = {
                  Easy:   { bg: '#dcfce7', text: '#166534' },
                  Medium: { bg: '#fef9c3', text: '#92400e' },
                  Hard:   { bg: '#fee2e2', text: '#991b1b' },
                };
                const dm = dMap[d];
                return (
                  <span
                    key={d}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: dm.bg, color: dm.text }}
                  >
                    {count} {d}
                  </span>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(({ post, lessonNum }) => {
              const isNew =
                !post.is_completed &&
                Date.now() - new Date(post.created_on).getTime() < 14 * 24 * 60 * 60 * 1000;
              const primaryCat = post.categories[0];
              const cardMeta = primaryCat ? CATEGORY_META[primaryCat.name] : undefined;

              return (
                <ArticleCard
                  key={post.id}
                  post={post}
                  catMeta={cardMeta}
                  isNew={isNew}
                  lessonNum={lessonNum}
                  search={search}
                  onBookmark={onBookmark}
                  onCategoryClick={onCategoryClick}
                />
              );
            })}
          </div>
        </div>
      ))}
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
