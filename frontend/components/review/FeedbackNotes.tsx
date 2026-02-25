'use client';

interface FeedbackNotesProps {
  notes: string | null;
}

// Minimal markdown renderer for bold, italic, headers, bullets
function renderMarkdown(text: string) {
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold mt-4 mb-1 text-gray-800">{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-5 mb-2 text-gray-900">{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mt-5 mb-2" style={{ color: '#141c52' }}>{line.slice(2)}</h1>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 text-sm text-gray-700 list-disc">{parseLine(line.slice(2))}</li>;
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm text-gray-700 leading-relaxed">{parseLine(line)}</p>;
    });
}

function parseLine(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function FeedbackNotes({ notes }: FeedbackNotesProps) {
  if (!notes) {
    return (
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-4xl mb-2">📝</p>
        <p className="text-gray-500 text-sm">Written notes will appear here once your review is delivered.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-bold text-base mb-4" style={{ color: '#141c52' }}>Expert Notes</h3>
      <div className="prose prose-sm max-w-none">
        {renderMarkdown(notes)}
      </div>
    </div>
  );
}
