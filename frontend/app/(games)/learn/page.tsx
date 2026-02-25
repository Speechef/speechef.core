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
  created_on: string;
  categories: Category[];
  completed: boolean;
  is_bookmarked: boolean;
  is_completed: boolean;
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

  // All filter state lives in the URL
  const activeCategory = searchParams.get('category') || null;
  const showBookmarks = searchParams.get('bookmarks') === '1';
  const sortBy = (searchParams.get('sort') ?? 'newest') as 'newest' | 'oldest' | 'az';
  // Search is local for responsive typing; synced to URL on blur
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
    enabled: isLoggedIn,
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-[#141c52] mb-2">Learn</h1>
        <p className="text-gray-500 mb-6">
          Articles and guides to improve your speech and language skills.
        </p>

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

        {/* Mobile category row (hidden on md+) */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-hide">
          {[
            { label: 'All', action: () => { setSearchInput(''); pushParams(null, false, sortBy, ''); }, active: !activeCategory && !search && !showBookmarks },
            { label: '🔖 Saved', action: () => { setSearchInput(''); pushParams(null, true, sortBy, ''); }, active: showBookmarks },
            ...categories.map((cat) => ({
              label: cat.name,
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

        <div className="flex gap-6">
          {/* ── Posts ── */}
          <div className="flex-1">
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
            <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-3xl mb-3">📚</p>
                {search ? (
                  <>
                    <p className="font-semibold">No results for "{search}"</p>
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
              [...posts].sort((a, b) => {
                if (sortBy === 'oldest') return new Date(a.created_on).getTime() - new Date(b.created_on).getTime();
                if (sortBy === 'az')     return a.title.localeCompare(b.title);
                return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
              }).map((post) => {
                const isNew = !post.is_completed &&
                  (Date.now() - new Date(post.created_on).getTime()) < 7 * 24 * 60 * 60 * 1000;
                return (
                <Link key={post.id} href={`/learn/${post.id}`} className="block group">
                  <div className="border border-gray-200 rounded-xl p-5 hover:border-[#141c52] hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold text-[#141c52] group-hover:underline leading-snug flex-1">
                        {search
                          ? highlightMatch(post.title, search)
                          : post.title}
                      </h2>
                      <div className="flex items-center gap-2 shrink-0">
                        {isNew && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}>
                            New
                          </span>
                        )}
                        <button
                          onClick={(e) => handleBookmark(e, post.id)}
                          title={post.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
                          className="text-lg leading-none hover:scale-110 transition-transform"
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
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {post.categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={(e) => {
                            e.preventDefault();
                            setSearchInput('');
                            pushParams(cat.name, false, sortBy, '');
                          }}
                          className="text-xs bg-[#e8f4fa] text-[#141c52] px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          {cat.name}
                        </button>
                      ))}
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(post.created_on).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
              })
            )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="hidden md:block w-48 shrink-0 space-y-3">
            {isLoggedIn && allPosts.length > 0 && (() => {
              const completedCount = allPosts.filter((p) => p.is_completed).length;
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
                          style={{ width: `${Math.round((completedCount / allPosts.length) * 100)}%` }}
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
                    className={`w-full text-left text-sm px-2 py-1 rounded-lg ${
                      activeCategory === null && !search && !showBookmarks
                        ? 'bg-[#141c52] text-white font-semibold'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    All
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
                      className={`w-full text-left text-sm px-2 py-1 rounded-lg ${
                        activeCategory === cat.name && !search && !showBookmarks
                          ? 'bg-[#141c52] text-white font-semibold'
                          : 'text-gray-600 hover:bg-white'
                      }`}
                    >
                      {cat.name}
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

/** Wrap the matched substring in a <mark> for visual highlighting. */
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
