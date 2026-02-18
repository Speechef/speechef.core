import Link from 'next/link';

const features = [
  {
    icon: '🎓',
    title: 'Expert Guidance',
    description:
      'Receive expert guidance and training from experienced speakers to improve your communication skills.',
  },
  {
    icon: '🤝',
    title: 'Community Support',
    description:
      'Join a vibrant community of learners and speakers where you can support and learn from each other.',
  },
  {
    icon: '📣',
    title: 'Effective Communication',
    description:
      'Learn techniques to deliver compelling speeches and presentations that captivate your audience.',
  },
];

const testimonials = [
  {
    quote:
      'Speechef has transformed my public speaking skills. I feel more confident and prepared to address any audience.',
    name: 'John Doe',
    role: 'CEO',
    company: 'XYZ Company',
    img: 'https://images.unsplash.com/flagged/photo-1595514191830-3e96a518989b?q=80&w=200&auto=format&fit=crop',
  },
  {
    quote:
      'I highly recommend Speechef to anyone looking to improve their communication abilities. It\'s been a game-changer for me.',
    name: 'Jane Smith',
    role: 'Designer',
    company: 'ABC Inc',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
  {
    quote:
      'Speechef helped me gain confidence in public speaking. It\'s an invaluable resource for anyone looking to improve their skills.',
    name: 'David Johnson',
    role: 'Entrepreneur',
    company: 'RTX Corp',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-6xl mx-auto">
        <span className="text-2xl font-bold" style={{ color: '#141c52' }}>
          Speechef
        </span>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-5 py-2 rounded-full border-2 font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: '#141c52', color: '#141c52' }}
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 rounded-full font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)', color: '#141c52' }}
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-4">
        <h1
          className="text-5xl md:text-6xl font-bold mb-6 animate-bounce"
          style={{ color: '#141c52' }}
        >
          Communicate your way to the top!
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
          We help you master your public speaking and communications game.
          <br />
          We help you hire the finest speakers tailored for your next event.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="px-8 py-3 rounded-full text-lg font-medium border-2 transition-colors hover:bg-gray-50"
            style={{ borderColor: '#FADB43', color: '#141c52' }}
          >
            Get Started
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 rounded-full text-lg font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)', color: '#141c52' }}
          >
            Register
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-4">
        <div
          className="max-w-6xl mx-auto rounded-3xl py-14 px-8"
          style={{ background: 'linear-gradient(to right, #FADB43, #fe9940)' }}
        >
          <h2 className="text-4xl font-bold text-center mb-10" style={{ color: '#141c52' }}>
            What does Speechef offer?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 shadow text-center">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#141c52' }}>
                  {f.title}
                </h3>
                <p style={{ color: '#141c52' }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-10" style={{ color: '#141c52' }}>
            User Reviews
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
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-white">{t.name}</p>
                    <p style={{ color: '#141c52' }}>
                      {t.role},{' '}
                      <span
                        className="text-sm px-2 py-0.5 rounded text-white"
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

      {/* Footer */}
      <footer className="mt-10 py-10 text-center" style={{ backgroundColor: '#141c52' }}>
        <p className="text-white text-lg">&copy; {new Date().getFullYear()} Speechef. All rights reserved.</p>
      </footer>
    </main>
  );
}
