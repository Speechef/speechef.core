# LP1.1 — Landing Page: Hero + Layout Scaffold

## Status: Unblocked

## Why
The current landing page (`/public/page.tsx`) is a stub. Users arriving at speechef.com see no value proposition, no CTA, and no indication of what the product does. This is the entry point for all growth — it must be built first before any other landing page sections can be layered on.

## What
Build the full page scaffold and hero section for the public landing page.

### Scaffold
- Create `app/(public)/layout.tsx` with a public-facing navbar (logo, nav links, Login + Get Started CTA buttons)
- Create a sticky navbar that hides on scroll-down, reveals on scroll-up
- Footer component with links, socials, and legal

### Hero Section
- Headline: *"Speak Better. Get Hired. Be Understood."*
- Subheadline: AI-powered speech coaching platform
- Primary CTA: `Upload Audio / Video →`
- Secondary CTA: `Watch How It Works` (opens 60s demo video in a modal)
- Social proof bar: learner count, improvement stat, partner logos
- Background: animated waveform SVG or CSS animation

### How It Works (3-step)
- Step 1: Upload or Record
- Step 2: AI Analyzes
- Step 3: Get a Scorecard

## Files to Touch
- `frontend/app/(public)/page.tsx` — hero + how-it-works sections
- `frontend/app/(public)/layout.tsx` — public navbar + footer
- `frontend/components/landing/Navbar.tsx` (new)
- `frontend/components/landing/Footer.tsx` (new)
- `frontend/components/landing/HeroSection.tsx` (new)
- `frontend/components/landing/HowItWorks.tsx` (new)

## Done When
- `localhost:3000` renders a fully styled, responsive landing page
- Hero headline, dual CTAs, and social proof bar are visible
- How It Works 3-step section renders below the hero
- Navbar is sticky and responsive (collapses to hamburger on mobile)
- All links are wired (even if destination pages don't exist yet, they route correctly)
