# MM1.3 — Mentor Marketplace Frontend (/mentors)

## Status: Done

## Why
The mentor marketplace is the highest-revenue feature. The frontend must give users confidence to book and pay — clear profiles, real ratings, transparent pricing, and a smooth calendar booking flow.

## What

### Mentor Directory `/mentors`
- Search bar + filter panel:
  - Specialty (multi-select tags)
  - Language
  - Min rating (star slider)
  - Max hourly rate (range slider)
  - Available day of week
- Mentor cards grid (3-col desktop, 1-col mobile):
  - Profile photo, name, rating (stars + count)
  - Specialties chips
  - Languages, hourly rate
  - `View Profile` + `Book Now →` buttons
- Infinite scroll pagination

### Mentor Profile Page `/mentors/<id>`
- Hero: photo, name, rating, credentials, verified badge
- Intro video player (30–60s, autoplay muted)
- Bio section
- Specialties + Languages
- Stats: total sessions, avg rating, response time
- Availability widget (weekly calendar showing free slots at a glance)
- Bundle packages (if any): name, sessions, price, savings %
- Reviews section: list of student reviews with rating + date
- Sticky booking sidebar:
  - Select duration: 30 min / 60 min
  - Hourly rate shown
  - `Book a Session →` button

### Booking Flow Modal (opens from profile or card)
**Step 1: Pick a date + time**
- Mini calendar (3-week view)
- Available slots per selected date (fetched from availability endpoint)
- Timezone note ("Times shown in your local timezone")

**Step 2: Confirm + Pay**
- Summary: mentor, date/time, duration, price
- Stripe Elements payment form
- Apply bundle (if user has purchased one)
- `Confirm & Pay →`

**Step 3: Confirmation**
- Meeting details: date, time, video call link (Daily.co)
- "Add to Calendar" button (Google / Apple / .ics download)
- CTA: `View My Sessions →`

### My Sessions Page `/mentors/sessions`
**Upcoming sessions:**
- Session card: mentor photo, date/time, meeting link, duration
- `Join Meeting →` button (enabled 5 min before scheduled time)
- Reschedule / Cancel (if > 24h away)

**Past sessions:**
- Rate & Review widget (if not yet rated)
- Homework from mentor (markdown rendered)
- Recording (if available) — play in-page

## Files to Touch
- `frontend/app/(app)/mentors/page.tsx` (new)
- `frontend/app/(app)/mentors/[id]/page.tsx` (new)
- `frontend/app/(app)/mentors/sessions/page.tsx` (new)
- `frontend/components/mentors/MentorCard.tsx` (new)
- `frontend/components/mentors/MentorProfile.tsx` (new)
- `frontend/components/mentors/BookingModal.tsx` (new)
- `frontend/components/mentors/AvailabilityCalendar.tsx` (new)
- `frontend/components/mentors/SessionCard.tsx` (new)
- `frontend/components/mentors/HomeworkView.tsx` (new)
- `frontend/lib/api/mentors.ts` (new)

## Done When
- Mentor directory loads with real mentor data + filters work
- Profile page shows intro video, availability, and reviews
- Booking modal: date/time selection → Stripe payment → confirmation screen
- My Sessions page shows upcoming sessions with working Join button
- Past sessions show rating widget and homework
- All timezone handling is correct (display in user's local timezone)
