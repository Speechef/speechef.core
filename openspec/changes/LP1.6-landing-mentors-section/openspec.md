# LP1.6 — Landing Page: Mentors Section + Pricing + Social Proof

## Status: Blocked → LP1.1

## Why
Mentorship and pricing complete the landing page's conversion funnel. Social proof (testimonials, before/after scores) closes the deal for users on the fence.

## What
Three final landing page sections: Mentors, Social Proof, and Pricing.

### Mentors Section
- Headline: *"Learn from the best. Book in minutes."*
- Horizontal scrolling card carousel of 4–6 mentor cards:
  - Photo, name, star rating, review count
  - Specialties (IELTS, Business English, Public Speaking)
  - Languages, hourly rate
  - `View Profile` + `Book a Session →` buttons
- Filters shown (static): Language · Specialty · Rating · Price range
- CTA: `Browse All Mentors →` → `/mentors`

### Social Proof Section
- 3 video testimonial cards (thumbnail + play button, opens modal)
- Before/after score comparison: *"From Band 6 to Band 8 in 60 days"*
- Company logo strip (employers who hire from Speechef)

### Pricing Section
| Tier | Price | Includes |
|---|---|---|
| Free | $0/mo | 3 analyses/mo, basic learn, limited games |
| Pro | $19/mo | Unlimited analysis, full learn hub, all practice |
| Test Prep | $29/mo | Pro + mock tests, score predictor |
| Expert | $49/mo | All + 2 expert panel reviews/mo |
| Enterprise | Custom | Teams, companies, institutions |

- Toggle: Monthly / Annual (annual = 2 months free)
- Highlighted recommended plan (Pro)
- CTA per plan: `Get Started →`

## Files to Touch
- `frontend/app/(public)/page.tsx` — add all three sections
- `frontend/components/landing/MentorsPreview.tsx` (new)
- `frontend/components/landing/MentorCard.tsx` (new)
- `frontend/components/landing/SocialProof.tsx` (new)
- `frontend/components/landing/PricingSection.tsx` (new)
- `frontend/components/landing/PricingCard.tsx` (new)

## Done When
- All three sections render on the landing page
- Mentor carousel scrolls horizontally on mobile
- Pricing toggle switches between monthly/annual rates
- All CTAs route correctly
- Page is complete end-to-end: Hero → How It Works → Dashboard Preview → Analyze Widget → Learn/Practice → Expert Review → Jobs → Mentors → Social Proof → Pricing → Footer
