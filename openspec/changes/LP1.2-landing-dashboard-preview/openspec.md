# LP1.2 — Landing Page: Dashboard Preview / Motivation Widget

## Status: Blocked → LP1.1

## Why
Users need to see what they'll get before signing up. A live-looking dashboard preview showing scores, streaks, and skill breakdowns communicates the product's value better than any paragraph of text.

## What
An animated mockup section on the landing page that previews the user dashboard.

### Metrics to Display (static/animated demo data)
- Overall Communication Score — circular gauge (0–100)
- Streak tracker — GitHub-style activity heatmap
- Weekly Activity bar chart — minutes practiced, clips analyzed
- Skill Breakdown radar chart: Fluency · Vocabulary · Pronunciation · Pace · Confidence · Grammar
- Recent Sessions feed (3 rows, with delta score badges)
- "Next Milestone" nudge card

### Behavior
- For **guests**: renders as an animated demo with mock data
- For **logged-in users** (if navigating back to landing): shows their real data with a `Go to Dashboard →` CTA

### Tech
- Use Recharts or Chart.js for radar + bar charts
- Gauge: custom SVG or `react-gauge-chart`
- Heatmap: `react-activity-calendar` or hand-rolled grid

## Files to Touch
- `frontend/app/(public)/page.tsx` — add section
- `frontend/components/landing/DashboardPreview.tsx` (new)
- `frontend/components/landing/ScoreGauge.tsx` (new)
- `frontend/components/landing/SkillRadar.tsx` (new)
- `frontend/components/landing/StreakHeatmap.tsx` (new)

## Done When
- Dashboard preview section renders below How It Works on the landing page
- All charts animate on scroll into view
- Looks accurate to what the real `/dashboard` will eventually show
- Fully responsive on mobile (stack charts vertically)
