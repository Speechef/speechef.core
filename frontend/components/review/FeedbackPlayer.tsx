'use client';

import { useState } from 'react';

interface FeedbackPlayerProps {
  videoKey: string | null;
}

export default function FeedbackPlayer({ videoKey }: FeedbackPlayerProps) {
  const [speed, setSpeed] = useState(1);

  if (!videoKey) {
    return (
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-4xl mb-2">🎬</p>
        <p className="text-gray-500 text-sm">Video feedback not yet available.</p>
      </div>
    );
  }

  // In production: videoKey is a Cloudflare R2 key → generate a signed URL server-side
  // For now, construct a URL assuming the video is publicly readable
  const videoUrl = videoKey.startsWith('http') ? videoKey : `https://storage.speechef.com/${videoKey}`;

  return (
    <div className="bg-black rounded-2xl overflow-hidden">
      <video
        src={videoUrl}
        controls
        className="w-full aspect-video"
        onLoadedMetadata={(e) => {
          (e.currentTarget as HTMLVideoElement).playbackRate = speed;
        }}
      />
      {/* Playback speed */}
      <div className="bg-gray-900 px-4 py-2 flex items-center gap-2">
        <span className="text-xs text-gray-400">Speed:</span>
        {[0.75, 1, 1.25, 1.5, 2].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{
              backgroundColor: speed === s ? '#FADB43' : 'transparent',
              color: speed === s ? '#141c52' : '#9ca3af',
              fontWeight: speed === s ? 700 : 400,
            }}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}
