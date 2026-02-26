import type { Metadata } from 'next';
import PublicResults from './PublicResults';

interface Props {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sessionId } = await params;
  const ogImage = `/api/og/scorecard/${sessionId}`;
  return {
    title: 'Communication Score — Speechef',
    description: 'Check out this communication assessment score from Speechef.',
    openGraph: {
      title: 'My Speechef Communication Score',
      description: 'AI-powered speech coaching and communication assessment.',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  };
}

export default async function ResultsPage({ params }: Props) {
  const { sessionId } = await params;
  return <PublicResults sessionId={sessionId} />;
}
