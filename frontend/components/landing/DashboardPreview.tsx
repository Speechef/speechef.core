'use client';

const skills = [
  { label: 'Fluency', score: 88, color: '#FADB43' },
  { label: 'Vocabulary', score: 74, color: '#fe9940' },
  { label: 'Pronunciation', score: 81, color: '#FADB43' },
  { label: 'Pace', score: 79, color: '#fe9940' },
  { label: 'Confidence', score: 92, color: '#FADB43' },
  { label: 'Grammar', score: 71, color: '#fe9940' },
];

const recentSessions = [
  { label: 'Product Pitch', date: 'Feb 23', score: 82, delta: '+6' },
  { label: 'Interview Prep', date: 'Feb 21', score: 76, delta: '+3' },
  { label: 'Presentation', date: 'Feb 19', score: 73, delta: '+8' },
];

// 7 rows × 12 cols heatmap (3 months of practice)
const heatmap = Array.from({ length: 7 }, (_, row) =>
  Array.from({ length: 12 }, (_, col) => {
    const n = row * 12 + col;
    if (n > 74) return 0;
    return n % 3 === 0 ? 3 : n % 5 === 0 ? 2 : n % 2 === 0 ? 1 : 0;
  })
);

function ScoreGauge({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ * 0.75; // 270° arc
  const offset = circ * 0.25;                    // start at 225°

  return (
    <div className="relative flex items-center justify-center w-36 h-36 mx-auto">
      <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-[135deg]">
        {/* Track */}
        <circle cx="72" cy="72" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeDashoffset={offset}
          strokeLinecap="round" />
        {/* Fill */}
        <circle cx="72" cy="72" r={r} fill="none"
          stroke="url(#gaugeGrad)" strokeWidth="10"
          strokeDasharray={`${progress} ${circ - progress}`}
          strokeDashoffset={offset} strokeLinecap="round" />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FADB43" />
            <stop offset="100%" stopColor="#fe9940" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-extrabold" style={{ color: '#141c52' }}>{score}</div>
        <div className="text-xs text-gray-400">/ 100</div>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            Your Dashboard
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-3" style={{ color: '#141c52' }}>
            Track every dimension of your progress
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Every session builds your score, streak, and skill profile — visible at a glance.
          </p>
        </div>

        {/* Dashboard mock */}
        <div className="rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          {/* Mock browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="mx-auto text-xs text-gray-400 font-mono">speechef.com/dashboard</span>
          </div>

          <div className="p-6 bg-white grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Score + streak */}
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-100 p-5 text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Communication Score
                </p>
                <ScoreGauge score={82} />
                <p className="mt-3 text-xs text-gray-400">+8 pts this week</p>
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Practice Streak
                </p>
                <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(12,1fr)' }}>
                  {heatmap.map((row, ri) =>
                    row.map((val, ci) => (
                      <div
                        key={`${ri}-${ci}`}
                        className="aspect-square rounded-sm"
                        style={{
                          backgroundColor: val === 0 ? '#f3f4f6'
                            : val === 1 ? '#fef08a'
                            : val === 2 ? '#fadb43'
                            : '#fe9940',
                        }}
                      />
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-right">14-day streak 🔥</p>
              </div>
            </div>

            {/* Skill bars */}
            <div className="rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Skill Breakdown
              </p>
              <div className="space-y-3">
                {skills.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium" style={{ color: '#141c52' }}>{s.label}</span>
                      <span className="text-gray-400">{s.score}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${s.score}%`, backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium">Top priority to improve:</p>
                <p className="text-sm font-bold mt-1" style={{ color: '#141c52' }}>Grammar · Vocabulary</p>
              </div>
            </div>

            {/* Recent sessions */}
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-100 p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                  Recent Sessions
                </p>
                <div className="space-y-3">
                  {recentSessions.map((s) => (
                    <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#141c52' }}>{s.label}</p>
                        <p className="text-xs text-gray-400">{s.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: '#141c52' }}>{s.score}</p>
                        <p className="text-xs font-semibold text-green-500">{s.delta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-xl p-4 text-center"
                style={{ background: 'linear-gradient(to right,#141c52,#1e2d78)' }}
              >
                <p className="text-xs font-semibold text-gray-300 mb-1">Next milestone</p>
                <p className="text-white font-bold text-sm">Score 85 to unlock Expert badge</p>
                <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '82%', background: 'linear-gradient(to right,#FADB43,#fe9940)' }} />
                </div>
                <p className="text-gray-400 text-xs mt-1">82 / 85</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
