import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  // Fetch result from backend (server-side, no auth needed for public OG images)
  // In production this would use a signed token or public endpoint
  // For now we render a template with placeholder data if fetch fails
  let overallScore = 0;
  let fluencyScore = 0;
  let vocabularyScore = 0;
  let paceWpm = 0;
  let username = 'Speechef User';
  let analyzedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
    const res = await fetch(`${apiBase}/analysis/${sessionId}/results/`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      overallScore = data.overall_score ?? 0;
      fluencyScore = data.fluency_score ?? 0;
      vocabularyScore = data.vocabulary_score ?? 0;
      paceWpm = data.pace_wpm ?? 0;
    }
  } catch {
    // Silently fall back to zeros — still renders a valid OG card
  }

  const barWidth = (v: number, max = 100) => Math.round((Math.min(v, max) / max) * 280);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: 'linear-gradient(135deg, #141c52 0%, #1e2d78 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
          <div style={{
            background: 'linear-gradient(to right, #FADB43, #fe9940)',
            borderRadius: 12,
            padding: '8px 20px',
            marginRight: 16,
          }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#141c52' }}>🎤 Speechef</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>Communication Score</span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start' }}>
          {/* Big score */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 200 }}>
            <div style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FADB43, #fe9940)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 56, fontWeight: 900, color: '#141c52' }}>{overallScore}</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>out of 100</span>
          </div>

          {/* Skill bars */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { label: 'Fluency', value: fluencyScore, max: 100 },
              { label: 'Vocabulary', value: vocabularyScore, max: 100 },
              { label: 'Pace', value: Math.min(100, Math.round((paceWpm / 180) * 100)), max: 100 },
            ].map((skill) => (
              <div key={skill.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>{skill.label}</span>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{skill.value}</span>
                </div>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5 }}>
                  <div style={{
                    width: barWidth(skill.value, skill.max),
                    height: 10,
                    background: 'linear-gradient(to right, #FADB43, #fe9940)',
                    borderRadius: 5,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Analyzed: {analyzedDate}</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>speechef.com</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
