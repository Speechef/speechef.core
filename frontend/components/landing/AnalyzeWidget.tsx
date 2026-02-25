'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type WidgetState = 'idle' | 'dragging' | 'selected' | 'uploading';

const ACCEPTED = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'video/mp4', 'video/quicktime', 'video/webm'];
const MAX_BYTES = 1024 * 1024 * 1024; // 1 GB

function isValidFile(f: File): string | null {
  if (!ACCEPTED.includes(f.type)) return 'Unsupported format. Use MP3, WAV, MP4, or MOV.';
  if (f.size > MAX_BYTES) return 'File is too large. Maximum size is 1 GB.';
  return null;
}

export default function AnalyzeWidget() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<WidgetState>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFile = useCallback((file: File) => {
    const err = isValidFile(file);
    if (err) { setError(err); setState('idle'); return; }
    setError('');
    setFileName(file.name);
    setState('selected');
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setState('dragging'); };
  const onDragLeave = () => setState('idle');
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
    else setState('idle');
  };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = () => {
    // Check auth via cookie (js-cookie or direct cookie read)
    const hasToken = document.cookie.includes('access_token');
    if (!hasToken) {
      router.push('/register');
      return;
    }
    setState('uploading');
    // In production this would POST to /api/v1/analysis/upload/ then redirect
    // For now redirect to /analyze
    setTimeout(() => router.push('/analyze'), 800);
  };

  const isDragging = state === 'dragging';
  const isSelected = state === 'selected';
  const isUploading = state === 'uploading';

  return (
    <section className="py-20 px-6" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#141c52' }}>
            Try It Right Now
          </h2>
          <p className="text-gray-500">
            Drop a clip and get your AI scorecard in under 2 minutes.
          </p>
        </div>

        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className="rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer"
          style={{
            borderColor: isDragging ? '#fe9940' : isSelected ? '#FADB43' : '#d1d5db',
            backgroundColor: isDragging ? '#fffbeb' : 'white',
          }}
          onClick={() => !isSelected && !isUploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".mp3,.wav,.mp4,.mov,.webm"
            className="hidden"
            onChange={onInputChange}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full animate-bounce"
                    style={{
                      height: `${16 + (i % 3) * 8}px`,
                      backgroundColor: '#FADB43',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium" style={{ color: '#141c52' }}>Preparing your analysis…</p>
            </div>
          ) : isSelected ? (
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)' }}
              >
                🎙️
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#141c52' }}>{fileName}</p>
                <p className="text-xs text-gray-400 mt-1">Ready to analyze</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setState('idle'); setFileName(''); }}
                  className="px-4 py-2 rounded-full text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Remove
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                  className="px-6 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                >
                  Analyze Now →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="text-5xl">🎤</div>
              <div>
                <p className="text-lg font-semibold" style={{ color: '#141c52' }}>
                  {isDragging ? 'Drop to analyze' : 'Drop your audio or video here'}
                </p>
                <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="px-5 py-2 rounded-full text-sm font-medium border-2 transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#141c52', color: '#141c52' }}
                >
                  Browse File
                </button>
                <span className="text-gray-300">·</span>
                <button
                  onClick={(e) => { e.stopPropagation(); router.push('/analyze'); }}
                  className="px-5 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
                >
                  🎙️ Record Now
                </button>
              </div>
              <p className="text-xs text-gray-400">MP3 · WAV · MP4 · MOV · Max 1 GB</p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-center text-red-500 text-sm mt-3">{error}</p>
        )}

        <p className="text-center text-xs text-gray-400 mt-4">
          No account needed to try · Sign up after your first analysis to save results
        </p>
      </div>
    </section>
  );
}
