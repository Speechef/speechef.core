'use client';

import { use, useState } from 'react';
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

export default function LearnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isLoggedIn = !!Cookies.get('access_token');

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link href="/learn" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Learn
        </Link>

        {/* Post header */}
        <div className="bg-[#FADB43] rounded-xl px-6 py-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#141c52]">
            <span>{new Date(post.created_on).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            {post.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/learn?category=${cat.name}`}
                className="font-semibold hover:underline"
              >
                {cat.name}
              </Link>
            ))}
            <span className="ml-auto flex items-center gap-2">
              {isLoggedIn && (
                <button
                  onClick={() => completeMutation.mutate()}
                  disabled={completeMutation.isPending}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors disabled:opacity-60 ${
                    post.is_completed
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-white text-[#141c52] hover:bg-green-100'
                  }`}
                >
                  {post.is_completed ? '✓ Completed' : 'Mark Complete'}
                </button>
              )}
              {!isLoggedIn && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    post.completed ? 'bg-green-200 text-green-800' : 'bg-white text-yellow-700'
                  }`}
                >
                  {post.completed ? 'Completed' : 'Pending'}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#141c52] mb-6">{post.title}</h1>

        {/* Body */}
        <div className="prose prose-slate max-w-none mb-10">
          {post.body.split('\n').map((para, i) =>
            para.trim() ? (
              <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                {para}
              </p>
            ) : null
          )}
        </div>

        {/* Related Articles */}
        {(() => {
          const related = relatedPosts.filter((p) => String(p.id) !== id).slice(0, 3);
          if (related.length === 0) return null;
          return (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#141c52] mb-4">Related Articles</h2>
              <div className="space-y-2">
                {related.map((p) => (
                  <Link key={p.id} href={`/learn/${p.id}`}
                    className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 hover:border-[#141c52] hover:shadow-sm transition-all group">
                    <p className="text-sm font-medium text-[#141c52] group-hover:underline">{p.title}</p>
                    <span className="text-xs text-gray-400 shrink-0 ml-3">
                      {new Date(p.created_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </Link>
                ))}
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
          {post.comments.map((comment) => (
            <div key={comment.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-[#141c52]">{comment.author}</span>
                <span className="text-gray-400">
                  {new Date(comment.created_on).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{comment.body}</p>
            </div>
          ))}
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
