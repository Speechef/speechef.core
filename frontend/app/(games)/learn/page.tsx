'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

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

function getExcerpt(body: string, maxLen = 100): string {
  return body.replace(/^##.*$/gm, '').replace(/^- /gm, '').trim().slice(0, maxLen) + '…';
}

function readTime(body: string): string {
  return `${Math.max(1, Math.ceil(body.split(/\s+/).filter(Boolean).length / 200))} min read`;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function LearnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

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

  const { data: allPosts = [] } = useQuery<Post[]>({
    queryKey: ['learn-posts-all'],
    queryFn: () => api.get('/learn/posts/').then((r) => r.data),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (postId: number) => api.post(`/learn/posts/${postId}/bookmark/`).then((r) => r.data),
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

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'oldest') return new Date(a.created_on).getTime() - new Date(b.created_on).getTime();
    if (sortBy === 'az')     return a.title.localeCompare(b.title);
    return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
  });

  const featuredPost = !activeCategory && !search && !showBookmarks && allPosts.length > 0
    ? [...allPosts].sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime())[0]
    : null;

  const completedCount = allPosts.filter((p) => p.is_completed).length;
  const completionPct = allPosts.length > 0 ? Math.round((completedCount / allPosts.length) * 100) : 0;

  const categoryPostCounts: Record<string, number> = {};
  allPosts.forEach((post) => {
    post.categories.forEach((cat) => {
      categoryPostCounts[cat.name] = (categoryPostCounts[cat.name] || 0) + 1;
    });
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-[#141c52] mb-2">Learn</h1>
        <p className="text-gray-500 mb-4">
          Articles and guides to improve your speech and language skills.
        </p>

        {/* Stats strip */}
        {allPosts.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm">
              <span className="text-gray-400">📖</span>
              <span className="font-semibold text-[#141c52]">{allPosts.length}</span>
              <span className="text-gray-500">articles</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm">
              <span className="text-gray-400">🏷️</span>
              <span className="font-semibold text-[#141c52]">{categories.length}</span>
              <span className="text-gray-500">categories</span>
            </div>
            {isLoggedIn && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm">
                <span className="text-gray-400">✅</span>
                <span className="font-semibold text-[#141c52]">{completionPct}%</span>
                <span className="text-gray-500">complete</span>
              </div>
            )}
          </div>
        )}

        {/* Search bar */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onBlur={() => pushParams(activeCategory, showBookmarks, sortBy, searchInput)}
            placeholder="Search articles…"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50 focus:bg-white transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); pushParams(activeCategory, showBookmarks, sortBy, ''); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mobile category row */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-hide">
          {[
            { label: 'All', action: () => { setSearchInput(''); pushParams(null, false, sortBy, ''); }, active: !activeCategory && !search && !showBookmarks },
            { label: '🔖 Saved', action: () => { setSearchInput(''); pushParams(null, true, sortBy, ''); }, active: showBookmarks },
            ...categories.map((cat) => ({
              label: `${CATEGORY_META[cat.name]?.emoji ?? ''} ${cat.name}`,
              action: () => { setSearchInput(''); pushParams(cat.name, false, sortBy, ''); },
              active: activeCategory === cat.name && !search && !showBookmarks,
            })),
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={
                item.active
                  ? { backgroundColor: '#141c52', color: '#fff' }
                  : { backgroundColor: '#e8f4fa', color: '#141c52' }
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Featured hero — only when no filter is active */}
        {featuredPost && (
          <FeaturedHero post={featuredPost} onBookmark={handleBookmark} />
        )}

        <div className="flex gap-6">
          {/* Posts */}
          <div className="flex-1 min-w-0">
            {/* Sort row */}
            {!isLoading && posts.length > 0 && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">{posts.length} article{posts.length !== 1 ? 's' : ''}</p>
                <select
                  value={sortBy}
                  onChange={(e) => pushParams(activeCategory, showBookmarks, e.target.value, searchInput)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="az">Title A–Z</option>
                </select>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-3xl mb-3">📚</p>
                {search ? (
                  <>
                    <p className="font-semibold">No results for &ldquo;{search}&rdquo;</p>
                    <p className="text-sm mt-1">Try a different keyword or clear the search.</p>
                    <button
                      onClick={() => { setSearchInput(''); pushParams(activeCategory, showBookmarks, sortBy, ''); }}
                      className="mt-3 text-sm font-semibold text-indigo-600 hover:underline"
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <p className="font-semibold">No posts found in this category.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedPosts.map((post) => {
                  const isNew = !post.is_completed &&
                    (Date.now() - new Date(post.created_on).getTime()) < 7 * 24 * 60 * 60 * 1000;
                  const primaryCat = post.categories[0];
                  const catMeta = primaryCat ? CATEGORY_META[primaryCat.name] : undefined;
                  return (
                    <Link key={post.id} href={`/learn/${post.id}`} className="block group">
                      <div
                        className="border rounded-xl p-5 hover:shadow-md transition-all flex gap-3 h-full"
                        style={{ borderColor: catMeta?.border ?? '#e5e7eb' }}
                      >
                        {/* Left accent bar */}
                        <div
                          className="w-1 rounded-full shrink-0 self-stretch"
                          style={{ backgroundColor: catMeta?.text ?? '#141c52' }}
                        />
                        <div className="flex-1 min-w-0 flex flex-col">
                          {/* Category pills */}
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            {post.categories.map((cat) => {
                              const m = CATEGORY_META[cat.name];
                              return (
                                <button
                                  key={cat.id}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSearchInput('');
                                    pushParams(cat.name, false, sortBy, '');
                                  }}
                                  className="text-xs font-semibold px-2 py-0.5 rounded-full transition-colors"
                                  style={m
                                    ? { backgroundColor: m.bg, color: m.text, border: `1px solid ${m.border}` }
                                    : { backgroundColor: '#e8f4fa', color: '#141c52' }
                                  }
                                >
                                  {m?.emoji} {cat.name}
                                </button>
                              );
                            })}
                            {isNew && (
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full ml-auto shrink-0"
                                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                              >
                                New
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h2 className="text-base font-bold text-[#141c52] group-hover:underline leading-snug mb-2">
                            {search ? highlightMatch(post.title, search) : post.title}
                          </h2>

                          {/* Excerpt */}
                          {post.body && (
                            <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                              {getExcerpt(post.body, 100)}
                            </p>
                          )}

                          {/* Footer */}
                          <div className="flex items-center gap-2 mt-auto flex-wrap">
                            {post.body && (
                              <span className="text-xs text-gray-400">{readTime(post.body)}</span>
                            )}
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-gray-400">
                              {new Date(post.created_on).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                            </span>
                            <div className="ml-auto flex items-center gap-2 shrink-0">
                              <button
                                onClick={(e) => handleBookmark(e, post.id)}
                                title={post.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
                                className="text-base leading-none hover:scale-110 transition-transform"
                              >
                                {post.is_bookmarked ? '🔖' : '🏷️'}
                              </button>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  post.is_completed
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {post.is_completed ? 'Completed' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden md:block w-52 shrink-0 space-y-3">
            {isLoggedIn && allPosts.length > 0 && (() => {
              const bookmarkedCount = allPosts.filter((p) => p.is_bookmarked).length;
              return (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-[#141c52] mb-3 uppercase tracking-wide">Your Progress</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Completed</span>
                        <span className="font-bold text-[#141c52]">{completedCount} / {allPosts.length}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${completionPct}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-gray-500">Bookmarked</span>
                      <span className="font-bold text-[#141c52]">🔖 {bookmarkedCount}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="bg-[#e8f4fa] rounded-xl p-4 sticky top-6">
              <h3 className="text-sm font-semibold text-[#141c52] mb-3">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => { setSearchInput(''); pushParams(null, false, sortBy, ''); }}
                    className={`w-full text-left text-sm px-2 py-1 rounded-lg flex items-center justify-between ${
                      activeCategory === null && !search && !showBookmarks
                        ? 'bg-[#141c52] text-white font-semibold'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    <span>All</span>
                    {allPosts.length > 0 && (
                      <span className="text-xs opacity-60">{allPosts.length}</span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setSearchInput(''); pushParams(null, true, sortBy, ''); }}
                    className={`w-full text-left text-sm px-2 py-1 rounded-lg ${
                      showBookmarks
                        ? 'bg-[#141c52] text-white font-semibold'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    🔖 Bookmarks
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => { setSearchInput(''); pushParams(cat.name, false, sortBy, ''); }}
                      className={`w-full text-left text-sm px-2 py-1 rounded-lg flex items-center justify-between ${
                        activeCategory === cat.name && !search && !showBookmarks
                          ? 'bg-[#141c52] text-white font-semibold'
                          : 'text-gray-600 hover:bg-white'
                      }`}
                    >
                      <span>{CATEGORY_META[cat.name]?.emoji} {cat.name}</span>
                      {categoryPostCounts[cat.name] && (
                        <span className="text-xs opacity-60">{categoryPostCounts[cat.name]}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {(activeCategory || search || showBookmarks) && (
                <button
                  onClick={() => { setSearchInput(''); pushParams(null, false, sortBy, ''); }}
                  className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 text-left"
                >
                  ✕ Clear filters
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FeaturedHero({
  post,
  onBookmark,
}: {
  post: Post;
  onBookmark: (e: React.MouseEvent, id: number) => void;
}) {
  const primaryCat = post.categories[0];
  const catMeta = primaryCat ? CATEGORY_META[primaryCat.name] : undefined;
  const excerpt = post.body ? getExcerpt(post.body, 160) : '';

  return (
    <Link href={`/learn/${post.id}`} className="block group mb-6">
      <div
        className="rounded-2xl p-6 border-2 hover:shadow-lg transition-all"
        style={{
          backgroundColor: catMeta?.bg ?? '#f9fafb',
          borderColor: catMeta?.border ?? '#e5e7eb',
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="text-3xl shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: catMeta?.border ?? '#e5e7eb' }}
          >
            {catMeta?.emoji ?? '📖'}
          </div>
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {post.categories.map((cat) => {
                const m = CATEGORY_META[cat.name];
                return (
                  <span
                    key={cat.id}
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={m
                      ? { backgroundColor: m.border, color: m.text }
                      : { backgroundColor: '#e8f4fa', color: '#141c52' }
                    }
                  >
                    {m?.emoji} {cat.name}
                  </span>
                );
              })}
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
              >
                Latest
              </span>
              {post.body && (
                <span className="text-xs text-gray-500 ml-auto">{readTime(post.body)}</span>
              )}
            </div>

            {/* Title */}
            <h2
              className="text-2xl font-bold group-hover:underline mb-2 leading-snug"
              style={{ color: catMeta?.text ?? '#141c52' }}
            >
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="text-sm leading-relaxed mb-3 text-gray-600">
              {excerpt}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                {new Date(post.created_on).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </span>
              <button
                onClick={(e) => onBookmark(e, post.id)}
                className="ml-auto text-xl hover:scale-110 transition-transform"
                title={post.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                {post.is_bookmarked ? '🔖' : '🏷️'}
              </button>
              {post.is_completed && (
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

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
