export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 text-center"
      style={{ background: '#f4f6fb' }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
        style={{ background: 'linear-gradient(135deg,#141c52,#1e2d78)' }}
      >
        📡
      </div>
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: '#141c52' }}>You&apos;re Offline</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-xs">
          No internet connection detected. Check your connection and try again.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 rounded-full text-sm font-bold"
        style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
      >
        Try Again
      </button>
      <a href="/" className="text-sm text-gray-400 hover:underline">← Go Home</a>
    </div>
  );
}
