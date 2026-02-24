# Speechef — Landing Page & Full Product Plan

> Generated: 2026-02-24
> This document captures the full product vision, landing page structure, and page-level plans
> for all major feature areas. Use this as the canonical reference when building new sections.

---

## 1. Overall Site Architecture

```
speechef.com/
├── /                     ← Landing page
├── /dashboard            ← User home after login
├── /analyze              ← AI audio/video analysis
├── /review               ← Expert panel review submission
├── /learn                ← Learning hub (articles, videos, courses)
├── /practice             ← Interactive games + test prep
│   ├── /games/...
│   ├── /roleplay/...
│   └── /test-prep/...
├── /jobs                 ← Job board
└── /mentors              ← Expert mentorship marketplace
```

---

## 2. Landing Page — Section by Section

### 2.1 Navbar
- Logo (Speechef)
- Nav links: `Analyze` · `Learn` · `Practice` · `Jobs` · `Mentors`
- CTA buttons: `Login` · `Get Started Free`
- Language selector

---

### 2.2 Hero Section
**Goal:** Immediate value prop + first conversion point.

- **Headline:** *"Speak Better. Get Hired. Be Understood."*
- **Subheadline:** AI-powered speech coaching platform — analyze your voice, learn from experts, and land jobs that demand great communication.
- **Dual CTA:**
  - `Upload Audio / Video →` (primary)
  - `Watch How It Works` (secondary — opens 60s demo modal)
- **Social proof bar:** `12,000+ learners` · `95% improved fluency scores` · `Partners: IELTS, TOEFL`
- **Visual:** Animated waveform + video thumbnail with a "playing" indicator

---

### 2.3 Instant Analyzer Widget
A drag-and-drop upload zone embedded on the landing page.

```
┌─────────────────────────────────────────┐
│  🎤  Drop your audio or video here      │
│      or  [Browse File]  [Record Now]    │
│  Supports: MP3, WAV, MP4, MOV · Max 1GB│
└─────────────────────────────────────────┘
```

- **Guest** → triggers sign-up modal after file drop
- **Logged-in** → routes directly to `/analyze` pipeline

---

### 2.4 How It Works (3-Step)

| Step | Title | Description |
|---|---|---|
| 1 | Upload or Record | Submit a speech, presentation, or conversation clip |
| 2 | AI Analyzes | Fluency, clarity, filler words, pacing, tone, accent, grammar |
| 3 | Get a Scorecard | Actionable feedback + exercises to close gaps |

---

### 2.5 Dashboard Preview (Motivation Loop)
For logged-in users this is a live dashboard. For landing visitors it is an animated mockup.

**Metrics shown:**
- Overall Communication Score (0–100 gauge chart)
- Streak tracker (GitHub-style heatmap of practice days)
- Weekly Activity (bar chart: minutes practiced, clips analyzed)
- Skill Breakdown Radar: Fluency · Vocabulary · Pronunciation · Pace · Confidence · Grammar
- Recent Sessions feed with timestamps and delta scores
- Next Milestone nudge: *"5 more minutes to unlock your weekly badge"*

---

### 2.6 AI Analysis Feature Deep-Dive
Split layout — feature list left, interactive demo right.

**What AI scores:**
- Filler words (um, uh, like) — frequency + heatmap on transcript
- Speaking pace (WPM) — too fast / too slow zones
- Pronunciation accuracy (phoneme-level)
- Grammar errors — highlighted in transcript
- Vocabulary richness index
- Emotional tone (nervous, confident, monotone)
- Eye contact & posture (from video)
- Background noise / audio quality flag

**Output format:**
- Timestamped transcript with inline annotations
- Radar chart of skill scores
- Priority improvement list ("Fix these 3 things first")
- Suggested exercises matched to weak areas

---

### 2.7 Expert Panel Review Section
Distinct dark/premium card style section.

```
┌──────────────────────────────────────────────────┐
│  🎓  Submit to Our Expert Panel                  │
│                                                  │
│  Get a human review from certified speech        │
│  coaches, communication trainers & linguists.   │
│                                                  │
│  ⏱ 48-hr turnaround   ✅ Written + Video feedback│
│  💬 1 follow-up Q&A included                    │
│                                                  │
│  [Submit for Expert Review →]  From $9 / review │
└──────────────────────────────────────────────────┘
```

Expert panel profiles shown in a carousel:
- Name, photo, credentials, specialty (IELTS / Business English / Public Speaking)
- Star rating + number of reviews completed
- Sample review video teaser (30s)

---

### 2.8 Learn Section Preview
Card grid teasing the learning hub:

| Type | Example |
|---|---|
| Articles | "10 ways to eliminate filler words" |
| Video Lessons | "Mastering the IELTS Speaking Band 8" |
| Audio Guides | "Shadowing technique — day 1" |
| Checklists | "Job interview communication checklist" |
| Courses | "Business English in 30 Days" |

**Filter tags visible:** `IELTS` · `TOEFL` · `Business` · `Public Speaking` · `Accent Reduction` · `Interview Prep`

CTA: `Explore the Learning Hub →`

---

### 2.9 Practice Section Preview
**"Practice the way you play"** — gamified and interactive.

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  🎮 Word Games  │  │  🗣️ Role Play   │  │  📝 Test Prep   │
│ Guess the Word  │  │  Job Interview  │  │  IELTS / TOEFL  │
│ Sentence Build  │  │  Debate Coach   │  │  PTE / OET      │
│ Pronunciation   │  │  Pitch Practice │  │  CELPIP / DELE  │
│ Challenge       │  │  Small Talk AI  │  │  Full Mock Tests│
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Test Prep exams supported:** IELTS · TOEFL · PTE · OET · CELPIP · DELE · DALF · JLPT

CTA: `Start Practicing Free →`

---

### 2.10 Jobs Board Preview
**Headline:** *"Companies want communicators. We'll get you ready — and hired."*

- Companies post jobs specifying minimum communication score requirements
- Users apply with their Speechef scorecard attached
- Score-match indicator on every job card

Sample job card:
```
┌───────────────────────────────────────────┐
│ 🏢 Stripe Inc.          [Apply Now →]    │
│ Customer Success Manager — Remote        │
│ Required: Speechef Score ≥ 78           │
│ Your Score: 82 ✅  You're a match!       │
└───────────────────────────────────────────┘
```

B2B CTA for employers: `Post a Job / Hire from Speechef →`

---

### 2.11 Mentorship Marketplace Section
**Headline:** *"Learn from the best. Book in minutes."*

Mentor card anatomy:
```
┌────────────────────────────────────────┐
│  [Photo]  Dr. Anika Sharma            │
│           ⭐ 4.9  (312 reviews)        │
│  Specialties: IELTS · Public Speaking │
│  Languages: English, Hindi             │
│  Rate: $45 / hour                      │
│  [View Profile]  [Book a Session →]   │
└────────────────────────────────────────┘
```

**Mentor features:**
- Verified credentials badge
- Video intro (30–60 seconds)
- Real-time calendar availability
- Package deals (5-session bundles)
- Rating breakdown (Communication, Patience, Clarity, Value)
- Money-back guarantee badge

**Filters:** Language · Specialty · Rating · Price range · Availability

---

### 2.12 Social Proof / Testimonials
- Video testimonials (play inline)
- Score before/after comparisons: *"From Band 6 to Band 8 in 60 days"*
- Company logos of employers who hire from Speechef

---

### 2.13 Pricing Section

| Tier | Price | Includes |
|---|---|---|
| Free | $0/mo | 3 analyses/mo, basic learn content, limited games |
| Pro | $19/mo | Unlimited analysis, full learn hub, all practice modes |
| Test Prep | $29/mo | Pro + full mock tests, score predictor |
| Expert | $49/mo | All above + 2 expert panel reviews/mo |
| Enterprise | Custom | Teams, companies, institutions |

---

### 2.14 Footer
- Links: About · Blog · Careers · API · For Schools · For Companies
- Legal: Privacy · Terms · Cookie Policy
- Social: YouTube · LinkedIn · Instagram · TikTok
- App store badges (future mobile app)

---

## 3. Page-Level Plans

### 3.1 `/analyze` — AI Analysis Page

**Flow:**
1. Upload widget (drag/drop or record in-browser via mic/webcam)
2. Processing screen with animated waveform + progress steps
3. Results page:
   - Overall score (prominent)
   - Tabbed view: `Transcript` · `Scores` · `Improvement Plan` · `Compare to Last Session`
   - Shareable scorecard (image export / LinkedIn share)
   - "Practice this weakness" CTA → links to relevant practice game

---

### 3.2 `/review` — Expert Panel Review

**Flow:**
1. Upload video (or select from past analyses)
2. Select review type: General · IELTS Speaking · Job Interview · Presentation
3. Select expert (optional — or auto-assign)
4. Payment (Stripe)
5. Status tracker: `Submitted → In Review → Feedback Ready`
6. Feedback delivery: Expert video recording + written notes + follow-up Q&A chat

---

### 3.3 `/learn` — Learning Hub

```
/learn
├── /articles
├── /videos
├── /courses
│   └── /courses/:slug
├── /audio-guides
└── /checklists
```

- Search + filter by topic, level (beginner/intermediate/advanced), exam, language
- Progress tracking: % complete per course, bookmarks, notes
- "Recommended for you" based on weak areas from analysis scores

---

### 3.4 `/practice` — Interactive Practice

```
/practice
├── /games
│   ├── /guess-the-word
│   ├── /pronunciation-challenge
│   ├── /sentence-builder
│   └── /vocabulary-blitz
├── /roleplay
│   ├── /job-interview
│   ├── /presentation
│   ├── /debate
│   └── /small-talk
└── /test-prep
    ├── /ielts
    ├── /toefl
    ├── /pte
    └── /[exam]
```

**Gamification layer:**
- XP points per session
- Daily challenge (resets midnight)
- Leaderboard (opt-in)
- Badges & achievements
- Streak freeze

---

### 3.5 `/jobs` — Job Board

**Employer side:**
- Post jobs with minimum communication score requirement
- Browse verified candidates with scorecard
- Request video introductions from candidates

**Candidate side:**
- One-click apply with Speechef profile
- "Score Gap" indicator — how close you are to qualifying
- Recommended jobs based on current score + trend

---

### 3.6 `/mentors` — Mentor Marketplace

**Mentor onboarding:** Application → credential verification → profile setup → go live

**Session types:**
- One-off 30/60 min sessions
- Bundle packages
- Ongoing monthly coaching

**In-platform features:**
- WebRTC video call
- Session recording (with consent)
- Homework assignments between sessions
- Mentor can annotate student's submitted analysis

---

## 4. Key Technical Components

| Component | Approach |
|---|---|
| Audio/Video upload | Chunked upload (tus protocol), Cloudflare R2 storage |
| AI transcription | OpenAI Whisper API |
| AI scoring | Custom NLP models → GPT-4 for narrative feedback |
| Video analysis | MediaPipe or Azure Video Indexer (eye contact, posture) |
| Real-time recording | WebRTC in-browser |
| Streak / gamification | Redis counters (already in stack) |
| Mentor video calls | Daily.co or Whereby embedded |
| Payments | Stripe (subscriptions + one-time) |
| Job board matching | Score-based filter algorithm |

---

## 5. User Motivation Architecture (Retention Loops)

```
Analyze → See weak score → Go to Learn → Watch lesson
    ↓                                          ↓
Get streak reward ← Practice game ← Apply lesson
    ↓
Share scorecard on LinkedIn → Attract job offers
    ↓
Hire mentor to close last gap → Land job
```

**Notification triggers:**
- "Your streak is at risk" (23hr nudge)
- "New job matched your score"
- "Your expert review is ready"
- "You improved 8 points this week — keep going!"
- Weekly progress digest email

---

## 6. Build Phases

| Phase | Features |
|---|---|
| MVP | AI analysis upload, scorecard output, basic learn content, one practice game |
| Phase 2 | Expert review submission, full practice suite, streak/gamification |
| Phase 3 | Test prep modules (IELTS, TOEFL, etc.), mentor marketplace |
| Phase 4 | Job board with score-matching, employer portal, B2B/institutional plans |
| Phase 5 | Mobile app, API for third-party integrations |
