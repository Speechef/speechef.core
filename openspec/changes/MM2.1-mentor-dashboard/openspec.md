# MM2.1 — Mentor Dashboard

## Status: Done

## Why
Mentors currently have no control panel. After onboarding via Stripe Connect they can receive bookings
but have no single place to see their upcoming schedule, manage students, or track their performance.
This is the biggest UX gap on the mentor side and is blocking all other mentor-facing features.

## What

### Route: `/mentors/dashboard`
Only accessible to users who have a `MentorProfile` with `is_active=True`.

### Sections

**Upcoming Sessions (top of page)**
- Chronological list of all sessions with `status=confirmed` in the future
- Each card shows: student name + avatar, date/time (user's local timezone), duration, `Join Meeting →` button (enabled 5 min before start), session status badge

**Today's Schedule sidebar**
- Compact timeline of today's sessions
- Empty state: "No sessions today — enjoy your day"

**Stats bar**
- Total sessions delivered (all time)
- Average rating (stars + numeric)
- Total earnings this month
- Pending payout amount (from Stripe Connect balance)

**Recent Students**
- Last 5 unique students booked, with their name, last session date, and session count
- Link to full student list

**Quick Actions**
- `Update Availability →` (links to availability settings, MM7.1)
- `View Earnings →` (links to MM2.3)
- `Edit Profile →` (links to mentor profile edit page)

## Files to Touch
- `frontend/app/(app)/mentors/dashboard/page.tsx` (new)
- `frontend/components/mentors/dashboard/UpcomingSessionCard.tsx` (new)
- `frontend/components/mentors/dashboard/StatsBar.tsx` (new)
- `frontend/components/mentors/dashboard/TodaySchedule.tsx` (new)
- `frontend/components/mentors/dashboard/RecentStudents.tsx` (new)
- `backend/mentorship/views.py` — add `MentorDashboardView` (aggregates upcoming sessions + stats)
- `backend/mentorship/serializers.py` — `MentorDashboardSerializer`
- `backend/mentorship/urls.py` — `GET /api/v1/mentors/dashboard/`

## Done When
- `/mentors/dashboard` is only visible to active mentors (redirect to `/mentors` otherwise)
- Upcoming sessions list shows real data with correct local times
- Stats bar pulls correct totals from `MentorSession` and Stripe Connect balance
- Join button activates exactly 5 minutes before scheduled time
- Page loads in < 1s (single API call, no waterfalls)
