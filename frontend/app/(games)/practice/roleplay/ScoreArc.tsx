export default function ScoreArc({ score, size = 140 }: { score: number; size?: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-extrabold" style={{ color: '#141c52', fontSize: Math.round(size * 0.23) }}>{score}</span>
        <span className="text-gray-400" style={{ fontSize: Math.round(size * 0.09) }}>/100</span>
      </div>
    </div>
  );
}
