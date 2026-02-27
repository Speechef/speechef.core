# MM5.1 — Smart Mentor Matching ("Recommended for You")

## Status: Unblocked

## Why
The mentor directory is a generic list. Users with analysis data (AI1.x) have clearly identified
weak areas (fluency, grammar, pace, pronunciation) but there is no connection between those scores
and mentor recommendations. Personalised matching is a key differentiator vs generic marketplaces
and directly increases booking conversion.

## What

### Matching Logic (backend)
`GET /api/v1/mentors/recommended/`
1. Fetch user's latest `AnalysisSession` scores (fluency, grammar, pace, pronunciation, vocabulary)
2. Find the 2 lowest-scoring dimensions
3. Map dimensions to mentor specialties:
   ```python
   DIMENSION_TO_SPECIALTY = {
       'fluency':       ['Fluency', 'Conversation', 'IELTS Speaking'],
       'grammar':       ['Grammar', 'Business English', 'Academic Writing'],
       'pace':          ['Public Speaking', 'Presentation Skills'],
       'pronunciation': ['Pronunciation', 'Accent Reduction'],
       'vocabulary':    ['Vocabulary', 'IELTS', 'TOEFL'],
   }
   ```
4. Filter active mentors whose `specialties` overlap with the mapped list
5. Order by: `rating_avg DESC`, `session_count DESC`
6. Return top 3, with a `match_reason` string per mentor:
   e.g. `"Matches your fluency goal"` / `"Specialises in grammar improvement"`

If user has no analysis data → return top-rated mentors with `match_reason=null`.

### Frontend — Mentor Directory (`/mentors`)
New section above the full listing:

```
┌─────────────────────────────────────────────────────┐
│  ✨ Recommended for You                              │
│  Based on your latest speech analysis               │
│  [MentorCard]  [MentorCard]  [MentorCard]           │
└─────────────────────────────────────────────────────┘
```

- Each card shows the `match_reason` as a coloured chip below the mentor name
- "No analysis yet? Upload a recording to get personalised recommendations" if no analysis data

### Frontend — Dashboard
- Add a compact "Recommended Mentors" widget (2 cards horizontal) to the main dashboard page
- CTA: `Browse All →` → `/mentors`

## Files to Touch
- `backend/mentorship/views.py` — `RecommendedMentorsView`
- `backend/mentorship/urls.py` — `GET /api/v1/mentors/recommended/`
- `frontend/app/(app)/mentors/page.tsx` — Recommended section at top
- `frontend/components/mentors/RecommendedSection.tsx` (new)
- `frontend/app/(app)/dashboard/page.tsx` — recommended mentors widget

## Done When
- Endpoint returns 3 mentors with correct `match_reason` based on user's analysis scores
- Section renders on the mentor directory page above the full listing
- Dashboard widget shows 2 recommended mentors
- Users with no analysis see top-rated mentors + upload CTA
- Users with no weak areas (all scores > 80) see top-rated mentors with no match reason
