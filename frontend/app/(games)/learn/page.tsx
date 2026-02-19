'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

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
}

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['learn-categories'],
    queryFn: () => api.get('/learn/categories/').then((r) => r.data),
  });

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['learn-posts', activeCategory],
    queryFn: () =>
      api
        .get('/learn/posts/', { params: activeCategory ? { category: activeCategory } : {} })
        .then((r) => r.data),
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-[#141c52] mb-2">Learn</h1>
        <p className="text-gray-500 mb-8">
          Articles and guides to improve your speech and language skills.
        </p>

        <div className="flex gap-6">
          {/* ── Posts ── */}
          <div className="flex-1 space-y-4">
            {isLoading ? (
              <p className="text-gray-400">Loading posts…</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-400">No posts found.</p>
            ) : (
              posts.map((post) => (
                <Link key={post.id} href={`/learn/${post.id}`} className="block group">
                  <div className="border border-gray-200 rounded-xl p-5 hover:border-[#141c52] hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold text-[#141c52] group-hover:underline leading-snug">
                        {post.title}
                      </h2>
                      <span
                        className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          post.completed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {post.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      {post.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="text-xs bg-[#e8f4fa] text-[#141c52] px-2 py-0.5 rounded-full"
                        >
                          {cat.name}
                        </span>
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
              ))
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="w-48 shrink-0">
            <div className="bg-[#e8f4fa] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#141c52] mb-3">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`w-full text-left text-sm px-2 py-1 rounded-lg ${
                      activeCategory === null
                        ? 'bg-[#141c52] text-white font-semibold'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    All
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setActiveCategory(cat.name)}
                      className={`w-full text-left text-sm px-2 py-1 rounded-lg ${
                        activeCategory === cat.name
                          ? 'bg-[#141c52] text-white font-semibold'
                          : 'text-gray-600 hover:bg-white'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
