import Link from 'next/link';
import DashboardPreview from '@/components/landing/DashboardPreview';
import AnalyzeWidget from '@/components/landing/AnalyzeWidget';

// ─── Static data ────────────────────────────────────────────────────────────

const features = [
  {
    icon: '🤖',
    title: 'AI Speech Analysis',
    desc: 'Upload audio or video and get instant scores on 8 dimensions of communication.',
    cta: 'Try It Free →',
    href: '/analyze',
  },
  {
    icon: '🎓',
    title: 'Expert Panel Review',
    desc: 'Get your speech reviewed by certified coaches. Written + video feedback in 48h.',
    cta: 'Submit a Video →',
    href: '/review',
    badge: 'From $9',
  },
  {
    icon: '📚',
    title: 'Learning Hub',
    desc: 'Articles, video lessons, audio guides, and full courses across all skill levels.',
    cta: 'Start Learning →',
    href: '/learn',
  },
  {
    icon: '🎮',
    title: 'Interactive Practice',
    desc: 'Vocabulary games, role-play scenarios, and full mock tests for IELTS, TOEFL, PTE, and more.',
    cta: 'Start Practicing →',
    href: '/practice',
  },
  {
    icon: '💼',
    title: 'Jobs Board',
    desc: 'Apply to companies that value communication — with your Speechef score attached.',
    cta: 'Browse Jobs →',
    href: '/jobs',
  },
  {
    icon: '👨‍🏫',
    title: '1:1 Mentorship',
    desc: 'Book sessions with certified speech coaches. Real-time calendar, transparent pricing.',
    cta: 'Find a Mentor →',
    href: '/mentors',
  },
];

const sampleJobs = [
  { company: 'Stripe', title: 'Customer Success Manager', location: 'Remote', score: 78, type: 'Full Time' },
  { company: 'McKinsey & Co.', title: 'Associate Consultant', location: 'New York', score: 85, type: 'Full Time' },
  { company: 'Duolingo', title: 'Language Coach', location: 'Remote', score: 72, type: 'Contract' },
];

const mentors = [
  { initials: 'AS', name: 'Dr. Anika Sharma', rating: '4.9', reviews: 312, specialty: 'IELTS · Public Speaking', rate: '$45/hr', dark: false },
  { initials: 'JO', name: 'James Okafor', rating: '4.8', reviews: 198, specialty: 'Business English', rate: '$38/hr', dark: true },
  { initials: 'PN', name: 'Priya Nair', rating: '5.0', reviews: 441, specialty: 'TOEFL · Accent Reduction', rate: '$52/hr', dark: false },
  { initials: 'MC', name: 'Miguel Costa', rating: '4.7', reviews: 87, specialty: 'Public Speaking', rate: '$35/hr', dark: true },
];

const testimonials = [
  {
    quote: 'Speechef has transformed my public speaking skills. I feel more confident and prepared to address any audience.',
    name: 'John Doe',
    role: 'CEO',
    company: 'XYZ Company',
    img: 'https://images.unsplash.com/flagged/photo-1595514191830-3e96a518989b?q=80&w=200&auto=format&fit=crop',
  },
  {
    quote: "I highly recommend Speechef to anyone looking to improve their communication abilities. It's been a game-changer for me.",
    name: 'Jane Smith',
    role: 'Designer',
    company: 'ABC Inc',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
  {
    quote: 'Speechef helped me gain confidence in public speaking. It\'s an invaluable resource for anyone looking to improve their skills.',
    name: 'David Johnson',
    role: 'Entrepreneur',
    company: 'RTX Corp',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
];

const pricing = [
  {
    tier: 'Free',
    price: '$0',
    period: '/mo',
    features: ['3 analyses per month', 'Basic learn content', '3 practice games'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    tier: 'Pro',
    price: '$19',
    period: '/mo',
    features: ['Unlimited analyses', 'Full learning hub', 'All practice modes', 'Leaderboard'],
    cta: 'Start Pro',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    tier: 'Test Prep',
    price: '$29',
    period: '/mo',
    features: ['Everything in Pro', 'Full mock tests (IELTS, TOEFL…)', 'Score predictor', 'Progress tracking'],
    cta: 'Start Test Prep',
    highlight: false,
  },
  {
    tier: 'Expert',
    price: '$49',
    period: '/mo',
    features: ['Everything in Test Prep', '2 expert reviews/month', 'Priority assignment'],
    cta: 'Start Expert',
    highlight: false,
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="text-center pt-24 pb-20 px-6">
        <h1
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 max-w-4xl mx-auto"
          style={{ color: '#141c52' }}
        >
          Speak Better.{' '}
          <span style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Get Hired.
          </span>{' '}
          Be Understood.
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          AI-powered speech coaching — analyze your voice, learn from experts, practice with games,
          and land jobs that reward great communication.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/analyze"
            className="px-8 py-4 rounded-full text-lg font-semibold transition-opacity hover:opacity-90 shadow-md"
            style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)', color: '#141c52' }}
          >
            Upload Audio / Video →
          </Link>
          <Link
            href="#how-it-works"
            className="px-8 py-4 rounded-full text-lg font-medium border-2 transition-colors hover:bg-gray-50"
            style={{ borderColor: '#141c52', color: '#141c52' }}
          >
            See How It Works ↓
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mt-10 text-sm text-gray-400">
          <span>✦ 12,000+ learners</span>
          <span>✦ 95% improved scores</span>
          <span>✦ IELTS &amp; TOEFL prep included</span>
        </div>
      </section>

      {/* ── Analyze Upload Widget ────────────────────────────────────────── */}
      <AnalyzeWidget />

      {/* ── Dashboard Preview ────────────────────────────────────────────── */}
      <DashboardPreview />

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#141c52' }}>
            How It Works
          </h2>
          <p className="text-center text-gray-500 mb-12">Three steps from upload to improvement.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🎙️', num: '01', title: 'Upload or Record', desc: 'Submit a speech, presentation, or conversation clip in any format.' },
              { icon: '🤖', num: '02', title: 'AI Analyzes', desc: 'Get scored on fluency, pace, filler words, grammar, tone, and pronunciation.' },
              { icon: '📈', num: '03', title: 'Get Your Scorecard', desc: 'Receive a prioritized improvement plan with exercises matched to your weak areas.' },
            ].map((step) => (
              <div key={step.num} className="bg-white rounded-2xl p-8 shadow text-center">
                <div className="text-5xl mb-3">{step.icon}</div>
                <div className="text-xs font-bold tracking-widest text-gray-300 mb-2">{step.num}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#141c52' }}>{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Highlights ───────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3" style={{ color: '#141c52' }}>
            Everything you need to communicate with confidence
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            One platform for analysis, learning, practice, expert review, jobs, and mentorship.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold" style={{ color: '#141c52' }}>{f.title}</h3>
                  {f.badge && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)', color: '#141c52' }}
                    >
                      {f.badge}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">{f.desc}</p>
                <Link
                  href={f.href}
                  className="mt-4 text-sm font-semibold hover:underline"
                  style={{ color: '#141c52' }}
                >
                  {f.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Expert Panel Teaser ──────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#141c52' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get Reviewed by a Human Expert
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Our panel of certified speech coaches and communication trainers will review your video
            and deliver written + recorded feedback within 48 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-10 mt-8 text-white text-sm">
            <span>⏱ 48-hr turnaround</span>
            <span>✅ Written + Video feedback</span>
            <span>💬 1 follow-up Q&amp;A included</span>
          </div>
          <Link
            href="/review"
            className="inline-block mt-10 px-10 py-4 rounded-full text-lg font-bold transition-opacity hover:opacity-90 shadow-lg"
            style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)', color: '#141c52' }}
          >
            Submit for Expert Review →
          </Link>
          <p className="text-gray-400 text-sm mt-3">Starting from $9 per review</p>

          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {[
              { name: 'Dr. Sarah K.', spec: 'IELTS Specialist', rating: '⭐ 4.9' },
              { name: 'James Okafor', spec: 'Public Speaking', rating: '⭐ 4.8' },
              { name: 'Priya Nair', spec: 'Business English', rating: '⭐ 5.0' },
            ].map((e) => (
              <div key={e.name} className="bg-white/10 rounded-xl p-4 text-center w-44">
                <div className="text-white font-semibold text-sm">{e.name}</div>
                <div className="text-gray-400 text-xs mt-1">{e.spec}</div>
                <div className="text-gray-300 text-xs mt-1">{e.rating}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Practice & Test Prep ─────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3" style={{ color: '#141c52' }}>
            Practice the Way You Play
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Gamified exercises, AI role-play, and timed mock exams — all in one place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Word Games */}
            <div className="bg-white rounded-2xl p-6 shadow">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#141c52' }}>Word Games</h3>
              <ul className="space-y-2 text-sm text-gray-500 mb-6">
                {['Guess the Word', 'Memory Match', 'Word Scramble', 'Vocabulary Blitz'].map((g) => (
                  <li key={g} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />{g}
                  </li>
                ))}
              </ul>
              <Link
                href="/practice"
                className="inline-block text-sm font-semibold px-5 py-2 rounded-full border-2 transition-colors hover:bg-gray-50"
                style={{ borderColor: '#141c52', color: '#141c52' }}
              >
                Play Now →
              </Link>
            </div>

            {/* Role Play */}
            <div
              className="rounded-2xl p-6 shadow"
              style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)' }}
            >
              <div className="text-3xl mb-3">🗣️</div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-bold" style={{ color: '#141c52' }}>Role Play</h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium opacity-70"
                  style={{ backgroundColor: '#141c52', color: '#FADB43' }}
                >
                  Coming Soon
                </span>
              </div>
              <ul className="space-y-2 text-sm mb-6" style={{ color: '#141c52' }}>
                {['Job Interview Sim', 'Debate Coach', 'Pitch Practice', 'Small Talk AI'].map((g) => (
                  <li key={g} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#141c52]/30 inline-block" />{g}
                  </li>
                ))}
              </ul>
              <Link
                href="/practice"
                className="inline-block text-sm font-semibold px-5 py-2 rounded-full transition-colors hover:opacity-80"
                style={{ backgroundColor: '#141c52', color: '#FADB43' }}
              >
                Explore →
              </Link>
            </div>

            {/* Test Prep */}
            <div className="rounded-2xl p-6 shadow" style={{ backgroundColor: '#141c52' }}>
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-xl font-bold text-white mb-4">Test Prep</h3>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                {['IELTS', 'TOEFL', 'PTE', 'OET', 'CELPIP', 'DELE'].map((g) => (
                  <li key={g} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block" />{g}
                  </li>
                ))}
              </ul>
              <Link
                href="/practice/test-prep"
                className="inline-block text-sm font-semibold px-5 py-2 rounded-full transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)', color: '#141c52' }}
              >
                Start Prep →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Jobs Preview ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3" style={{ color: '#141c52' }}>
            Land Jobs That Value Communication
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Companies post roles with minimum Speechef score requirements. Apply with your scorecard.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {sampleJobs.map((job) => (
              <div key={job.title} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: '#141c52' }}
                  >
                    {job.company[0]}
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)', color: '#141c52' }}
                  >
                    Score ≥ {job.score}
                  </span>
                </div>
                <div className="font-bold text-sm mb-1" style={{ color: '#141c52' }}>{job.title}</div>
                <div className="text-gray-400 text-xs">{job.company}</div>
                <div className="text-gray-400 text-xs mt-1">{job.location} · {job.type}</div>
              </div>
            ))}
          </div>
          <div className="text-center space-y-3">
            <div>
              <Link
                href="/jobs"
                className="inline-block px-8 py-3 rounded-full border-2 text-sm font-semibold transition-colors hover:bg-gray-50"
                style={{ borderColor: '#141c52', color: '#141c52' }}
              >
                Browse All Jobs →
              </Link>
            </div>
            <div>
              <Link href="/jobs/post" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Hiring communicators? Post a job free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mentors Preview ──────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3" style={{ color: '#141c52' }}>
            Learn From the Best. Book in Minutes.
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Certified coaches with real ratings, transparent pricing, and instant calendar booking.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {mentors.map((m) => (
              <div key={m.name} className="bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold"
                  style={m.dark
                    ? { backgroundColor: '#141c52', color: '#FADB43' }
                    : { background: 'linear-gradient(to right, #FADB43, #fe9940)', color: '#141c52' }
                  }
                >
                  {m.initials}
                </div>
                <div className="font-bold text-sm mb-1" style={{ color: '#141c52' }}>{m.name}</div>
                <div className="text-xs text-gray-400 mb-1">⭐ {m.rating} ({m.reviews})</div>
                <div className="text-xs text-gray-500 mb-1">{m.specialty}</div>
                <div className="text-xs font-semibold" style={{ color: '#141c52' }}>{m.rate}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/mentors"
              className="inline-block px-8 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)', color: '#141c52' }}
            >
              Browse All Mentors →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#141c52' }}>
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6 shadow"
                style={{ background: 'linear-gradient(to left, #FADB43, #fe9940)' }}
              >
                <p className="text-lg mb-6" style={{ color: '#141c52' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-bold" style={{ color: '#141c52' }}>{t.name}</p>
                    <p className="text-sm" style={{ color: '#141c52' }}>
                      {t.role},{' '}
                      <span
                        className="text-xs px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: '#141c52' }}
                      >
                        {t.company}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3" style={{ color: '#141c52' }}>
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-500 mb-12">Start free. Upgrade when you&apos;re ready.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {pricing.map((p) => (
              <div
                key={p.tier}
                className={`bg-white rounded-2xl p-6 shadow flex flex-col relative ${
                  p.highlight ? 'ring-2' : ''
                }`}
                style={p.highlight ? { ringColor: '#FADB43' } : {}}
              >
                {p.badge && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full shadow"
                    style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)', color: '#141c52' }}
                  >
                    {p.badge}
                  </span>
                )}
                <div className="text-sm font-semibold text-gray-400 mb-1">{p.tier}</div>
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-4xl font-extrabold" style={{ color: '#141c52' }}>{p.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{p.period}</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-500 flex-1 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5" style={{ color: '#FADB43' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="block text-center py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                  style={p.highlight
                    ? { background: 'linear-gradient(to right, #FADB43, #fe9940)', color: '#141c52' }
                    : { backgroundColor: '#141c52', color: 'white' }
                  }
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
