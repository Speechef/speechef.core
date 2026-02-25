'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import Cookies from 'js-cookie';

interface Category {
  id: number;
  name: string;
}

interface Comment {
  id: number;
  author: string;
  body: string;
  created_on: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  created_on: string;
  categories: Category[];
  completed: boolean;
  is_completed: boolean;
  comments: Comment[];
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

function readTime(body: string): string {
  return `${Math.max(1, Math.ceil(body.split(/\s+/).filter(Boolean).length / 200))} min read`;
}

function renderBody(body: string): React.ReactNode {
  const lines = body.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-xl font-bold text-[#141c52] mt-8 mb-3">
          {line.replace(/^## /, '')}
        </h3>
      );
      i++;
    } else if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-base font-semibold text-[#141c52] mt-6 mb-2">
          {line.replace(/^### /, '')}
        </h4>
      );
      i++;
    } else if (line.startsWith('- ')) {
      const bullets: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        bullets.push(lines[i].replace(/^- /, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1 mb-4 text-gray-700">
          {bullets.map((b, bi) => <li key={bi}>{b}</li>)}
        </ul>
      );
    } else {
      elements.push(
        <p key={i} className="mb-4 text-gray-700 leading-relaxed">
          {line}
        </p>
      );
      i++;
    }
  }

  return <>{elements}</>;
}

const AVATAR_COLORS = [
  { bg: '#dbeafe', text: '#1e40af' },
  { bg: '#fce7f3', text: '#9d174d' },
  { bg: '#d1fae5', text: '#065f46' },
  { bg: '#fef3c7', text: '#78350f' },
  { bg: '#ede9fe', text: '#6d28d9' },
  { bg: '#fee2e2', text: '#991b1b' },
];

function authorAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(hash)];
}

export default function LearnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);

  const isLoggedIn = !!Cookies.get('access_token');

  // Reading progress bar
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ['learn-post', id],
    queryFn: () => api.get(`/learn/posts/${id}/`).then((r) => r.data),
  });

  const firstCategory = post?.categories?.[0]?.name;
  const { data: relatedPosts = [] } = useQuery<Post[]>({
    queryKey: ['learn-related', firstCategory],
    enabled: !!firstCategory,
    queryFn: () => api.get('/learn/posts/', { params: { category: firstCategory } }).then((r) => r.data),
  });

  const { data: allPosts = [] } = useQuery<Post[]>({
    queryKey: ['learn-posts-all-nav'],
    enabled: !!post,
    queryFn: () => api.get('/learn/posts/').then((r) => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: () => api.post(`/learn/posts/${id}/complete/`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learn-post', id] });
      queryClient.invalidateQueries({ queryKey: ['learn-posts'] });
    },
  });

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/learn/posts/${id}/comments/`, { body: commentBody });
      setCommentBody('');
      queryClient.invalidateQueries({ queryKey: ['learn-post', id] });
    } catch {
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Post not found.</p>
      </div>
    );
  }

  const primaryCat = post.categories[0];
  const catMeta = primaryCat ? CATEGORY_META[primaryCat.name] : undefined;
  const progressColor = catMeta?.text ?? '#141c52';

  return (
    <div className="min-h-screen bg-white">
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 z-50 h-0.5 transition-all duration-75"
        style={{ width: `${readingProgress}%`, backgroundColor: progressColor }}
      />

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link href="/learn" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Learn
        </Link>

        {/* Hero header */}
        <div
          className="rounded-2xl px-6 py-5 mb-6"
          style={{
            background: catMeta
              ? `linear-gradient(135deg, ${catMeta.bg} 0%, #ffffff 100%)`
              : 'linear-gradient(135deg, #fef9c3 0%, #ffffff 100%)',
            border: `2px solid ${catMeta?.border ?? '#fde68a'}`,
          }}
        >
          <div className="flex items-start gap-4">
            {/* Category emoji */}
            <div
              className="text-3xl w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: catMeta?.border ?? '#fde68a' }}
            >
              {catMeta?.emoji ?? '📖'}
            </div>

            <div className="flex-1 min-w-0">
              {/* Category pills + date + read time */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {post.categories.map((cat) => {
                  const m = CATEGORY_META[cat.name];
                  return (
                    <Link
                      key={cat.id}
                      href={`/learn?category=${cat.name}`}
                      className="text-xs font-semibold px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity"
                      style={m
                        ? { backgroundColor: m.border, color: m.text }
                        : { backgroundColor: '#e8f4fa', color: '#141c52' }
                      }
                    >
                      {m?.emoji} {cat.name}
                    </Link>
                  );
                })}
                <span className="text-xs text-gray-500 ml-1">
                  {new Date(post.created_on).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">{readTime(post.body)}</span>
              </div>

              {/* Mark complete button */}
              {isLoggedIn && (
                <div className="mt-2">
                  <button
                    onClick={() => completeMutation.mutate()}
                    disabled={completeMutation.isPending}
                    className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors disabled:opacity-60 ${
                      post.is_completed
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white text-[#141c52] border border-gray-300 hover:bg-green-50 hover:border-green-400'
                    }`}
                  >
                    {post.is_completed ? '✓ Completed' : 'Mark Complete'}
                  </button>
                </div>
              )}
              {!isLoggedIn && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block ${
                    post.completed ? 'bg-green-200 text-green-800' : 'bg-white text-yellow-700'
                  }`}
                >
                  {post.completed ? 'Completed' : 'Pending'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#141c52] mb-6">{post.title}</h1>

        {/* Body */}
        <div className="prose prose-slate max-w-none mb-10">
          {renderBody(post.body)}
        </div>

        {/* Related Articles */}
        {(() => {
          const related = relatedPosts.filter((p) => String(p.id) !== id).slice(0, 4);
          if (related.length === 0) return null;
          return (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#141c52] mb-4">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {related.map((p) => {
                  const pCat = p.categories[0];
                  const pMeta = pCat ? CATEGORY_META[pCat.name] : undefined;
                  return (
                    <Link
                      key={p.id}
                      href={`/learn/${p.id}`}
                      className="flex flex-col gap-2 border border-gray-100 rounded-xl px-4 py-3 hover:border-[#141c52] hover:shadow-sm transition-all group"
                    >
                      {pMeta && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full self-start"
                          style={{ backgroundColor: pMeta.bg, color: pMeta.text, border: `1px solid ${pMeta.border}` }}
                        >
                          {pMeta.emoji} {pCat.name}
                        </span>
                      )}
                      <p className="text-sm font-medium text-[#141c52] group-hover:underline leading-snug">{p.title}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(p.created_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Prev / Next navigation */}
        {(() => {
          const sorted = [...allPosts].sort((a, b) => a.id - b.id);
          const idx = sorted.findIndex((p) => String(p.id) === id);
          if (idx === -1) return null;
          const prev = idx > 0 ? sorted[idx - 1] : null;
          const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;
          if (!prev && !next) return null;
          return (
            <div className="flex items-stretch gap-3 my-8">
              {prev ? (
                <Link href={`/learn/${prev.id}`}
                  className="flex-1 flex flex-col justify-center border border-gray-200 rounded-xl px-4 py-3 hover:border-[#141c52] hover:shadow-sm transition-all group">
                  <p className="text-xs text-gray-400 mb-0.5">← Previous</p>
                  <p className="text-sm font-semibold text-[#141c52] group-hover:underline line-clamp-2">{prev.title}</p>
                </Link>
              ) : <div className="flex-1" />}
              {next ? (
                <Link href={`/learn/${next.id}`}
                  className="flex-1 flex flex-col justify-center border border-gray-200 rounded-xl px-4 py-3 hover:border-[#141c52] hover:shadow-sm transition-all group text-right">
                  <p className="text-xs text-gray-400 mb-0.5">Next →</p>
                  <p className="text-sm font-semibold text-[#141c52] group-hover:underline line-clamp-2">{next.title}</p>
                </Link>
              ) : <div className="flex-1" />}
            </div>
          );
        })()}

        <hr className="my-8" />

        {/* Comments */}
        <h2 className="text-xl font-bold text-[#141c52] mb-4">
          Comments ({post.comments.length})
        </h2>

        {post.comments.length === 0 && (
          <p className="text-gray-400 mb-6">No comments yet. Be the first!</p>
        )}

        <div className="space-y-3 mb-8">
          {post.comments.map((comment) => {
            const avatarColor = authorAvatarColor(comment.author);
            const initial = comment.author.charAt(0).toUpperCase();
            return (
              <div key={comment.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
                  >
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-[#141c52]">{comment.author}</span>
                      <span className="text-gray-400">
                        {new Date(comment.created_on).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comment form */}
        {isLoggedIn ? (
          <form onSubmit={handleComment} className="bg-[#e8f4fa] rounded-xl p-5">
            <h3 className="font-semibold text-[#141c52] mb-3">Leave a comment</h3>
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={3}
              placeholder="Write your comment…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#141c52]"
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-3 bg-[#FADB43] text-[#141c52] font-semibold px-5 py-2 rounded-full text-sm hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Posting…' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p className="text-gray-500 text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>{' '}
            to leave a comment.
          </p>
        )}
      </div>
    </div>
  );
}
