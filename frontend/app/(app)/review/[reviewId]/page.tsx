'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import StatusTimeline from '@/components/review/StatusTimeline';
import FeedbackPlayer from '@/components/review/FeedbackPlayer';
import FeedbackNotes from '@/components/review/FeedbackNotes';
import ReviewRating from '@/components/review/ReviewRating';
import QAThread from '@/components/review/QAThread';

interface ReviewDetail {
  id: number;
  review_type: string;
  status: 'submitted' | 'assigned' | 'in_review' | 'delivered';
  submitted_at: string;
  deadline_at: string | null;
  delivered_at: string | null;
  feedback_notes: string | null;
  feedback_video_key: string | null;
  feedback_rating: number | null;
  expert: {
    id: number;
    name: string;
    bio: string;
    specialties: string[];
    rating_avg: number;
  } | null;
}

const REVIEW_TYPE_LABELS: Record<string, string> = {
  general: 'General Feedback',
  ielts_speaking: 'IELTS Speaking',
  ielts: 'IELTS Speaking',
  job_interview: 'Job Interview',
  toefl: 'TOEFL Speaking',
  business: 'Business English',
  presentation: 'Presentation',
};

const IMPROVEMENT_LINKS: { label: string; href: string }[] = [
  { label: 'Practice Fluency Games', href: '/practice' },
  { label: 'Test Prep (IELTS / TOEFL)', href: '/practice/test-prep' },
  { label: 'Explore Learning Hub', href: '/learn' },
  { label: 'Book a Mentor Session', href: '/mentors' },
];

export default function ReviewStatusPage() {
  const { reviewId } = useParams<{ reviewId: string }>();
  const { data: profile } = useQuery<{ username: string }>({
    queryKey: ['profile'],
    queryFn: () => api.get('/auth/profile/').then((r) => r.data),
  });

  const { data: review, isLoading } = useQuery<ReviewDetail>({
    queryKey: ['review', reviewId],
    queryFn: () => api.get(`/review/${reviewId}/status/`).then((r) => r.data),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.status === 'delivered') return false;
      return 30_000;
    },
  });

  // Fetch feedback when delivered
  const { data: feedback } = useQuery<{ feedback_notes: string | null; feedback_video_key: string | null }>({
    queryKey: ['review-feedback', reviewId],
    enabled: review?.status === 'delivered',
    queryFn: () => api.get(`/review/${reviewId}/feedback/`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-2">🎙️</p>
          <p>Review not found.</p>
          <Link href="/review" className="text-indigo-600 text-sm mt-2 block hover:underline">← Submit a Review</Link>
        </div>
      </div>
    );
  }

  const isDelivered = review.status === 'delivered';
  const notes = feedback?.feedback_notes ?? review.feedback_notes;
  const videoKey = feedback?.feedback_video_key ?? review.feedback_video_key;
  const expertName = review.expert
    ? review.expert.name
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/review" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">← My Reviews</Link>
            <h1 className="text-2xl font-bold" style={{ color: '#141c52' }}>
              {REVIEW_TYPE_LABELS[review.review_type] ?? review.review_type} Review
            </h1>
            <p className="text-gray-500 text-sm">Review #{review.id}</p>
          </div>
          {isDelivered && (
            <span className="text-sm font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-700">
              ✓ Delivered
            </span>
          )}
        </div>

        {!isDelivered ? (
          /* ── Waiting state ── */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Timeline */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold mb-5" style={{ color: '#141c52' }}>Review Progress</h2>
              <StatusTimeline
                status={review.status}
                submittedAt={review.submitted_at}
                deadlineAt={review.deadline_at}
                deliveredAt={review.delivered_at}
                expertName={expertName}
              />
            </div>

            {/* Expert card + ETA */}
            <div className="space-y-4">
              {review.expert ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Your Reviewer</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full font-bold text-white flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ background: '#141c52' }}>
                      {review.expert.name?.[0] ?? 'E'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#141c52' }}>{review.expert.name}</p>
                      <p className="text-xs text-amber-500">★ {Number(review.expert.rating_avg).toFixed(1)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-3">{review.expert.bio}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-5 text-center text-gray-400 text-sm">
                  Expert assignment pending
                </div>
              )}

              {review.deadline_at && review.status !== 'delivered' && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Expected by</p>
                  <p className="text-sm font-bold text-amber-800">
                    {new Date(review.deadline_at).toLocaleString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Delivered state ── */
          <div className="space-y-6">
            {/* Video + Notes (2-col on desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Video Feedback</p>
                <FeedbackPlayer videoKey={videoKey ?? null} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Written Notes</p>
                <FeedbackNotes notes={notes ?? null} />
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold mb-4" style={{ color: '#141c52' }}>Recommended Next Steps</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {IMPROVEMENT_LINKS.map((link) => (
                  <Link key={link.href} href={link.href}
                    className="text-center text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Rating + Q&A (side by side on desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReviewRating reviewId={review.id} existingRating={review.feedback_rating} />
              <QAThread reviewId={review.id} currentUserName={profile?.username ?? ''} />
            </div>

            {/* Timeline (collapsed) */}
            <details className="bg-white rounded-2xl border border-gray-100 p-6">
              <summary className="font-bold text-sm cursor-pointer" style={{ color: '#141c52' }}>View Review Timeline</summary>
              <div className="mt-4">
                <StatusTimeline
                  status={review.status}
                  submittedAt={review.submitted_at}
                  deadlineAt={review.deadline_at}
                  deliveredAt={review.delivered_at}
                  expertName={expertName}
                />
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
