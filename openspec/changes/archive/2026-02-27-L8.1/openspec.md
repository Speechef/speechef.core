# L8.1 — Grammar Course Seed Data & Metadata Convention

## Status: Archived

## Problem
The fixture had only 5 posts across 5 categories with plain body text. No structured course existed, making the learning paths carousel decorative rather than functional.

## Solution

### New Categories (pk 6–8)
Added three categories to `seed.json`:
- pk 6: Listening
- pk 7: Interview Skills
- pk 8: Writing

### General Posts (pk 6–21)
Added 16 posts spread across all 8 categories (Pronunciation, Fluency, Vocabulary, Grammar, Communication, Listening, Interview Skills, Writing) with dates spanning 2024-04-01 → 2025-01-15. Bodies use `## Heading` and `- bullet` markdown syntax for the rich body renderer.

### Grammar Course Posts (pk 22–37)
Added 16 structured Grammar lessons organised into 6 chapters. Each post body begins with metadata lines:
```
Chapter: N
Difficulty: Easy|Medium|Hard

## Overview
...
```

| Chapter | Name | Posts |
|---------|------|-------|
| 1 | The Basics | pk 22–24 |
| 2 | Nouns & Articles | pk 25–26 |
| 3 | Pronouns & Adjectives | pk 27–28 |
| 4 | Tenses | pk 29–31 |
| 5 | Sentence Structure | pk 32–34 |
| 6 | Advanced Grammar | pk 35–37 |

Difficulties distributed Easy → Medium → Hard within each chapter. Dates chronologically ordered (2024-01-01 → 2024-04-29) so oldest-first sort produces correct lesson order.

### Metadata Convention
The `Chapter: N` / `Difficulty: X` prefix is a zero-migration alternative to new model fields. The frontend `parsePostMeta(body)` function strips these lines before rendering and returns structured metadata used by `DifficultyBadge`, `CourseNavigator`, and `ChapterGroupedGrid`.

## Files
- `backend/fixtures/seed.json` (modified — categories pk 6–8, posts pk 6–37)
