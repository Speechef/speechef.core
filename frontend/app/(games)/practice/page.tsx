import Link from 'next/link';

const games = [
  {
    href: '/practice/guess-the-word',
    title: 'Guess the Word',
    description: 'Improve your vocabulary by selecting the correct meaning for a random word.',
    emoji: '🧠',
  },
  {
    href: '/practice/memory-match',
    title: 'Memory Match',
    description: 'Flip cards to match words with their meanings. Fewer attempts = higher score.',
    emoji: '🃏',
  },
  {
    href: '/practice/word-scramble',
    title: 'Word Scramble',
    description: 'Unscramble the letters to reveal the hidden word.',
    emoji: '🔤',
  },
];

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#141c52' }}>
            Language Practice
          </h1>
          <p className="text-gray-500">Choose a game to sharpen your vocabulary.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {games.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="block bg-white rounded-2xl shadow p-6 hover:shadow-md transition-shadow no-underline"
            >
              <div className="text-4xl mb-3">{game.emoji}</div>
              <h2 className="text-lg font-bold mb-2" style={{ color: '#141c52' }}>
                {game.title}
              </h2>
              <p className="text-gray-500 text-sm">{game.description}</p>
              <div
                className="mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium"
                style={{ backgroundColor: '#FADB43', color: '#141c52' }}
              >
                Play Now
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/practice/leaderboard"
            className="text-sm font-medium hover:underline"
            style={{ color: '#141c52' }}
          >
            View Leaderboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
