"""
management command: python manage.py seed_grammar

Seeds a complete Zero-to-Hero Grammar curriculum (24 lessons) into the
Learn section under the existing 'Grammar' category.

Run once after migrations. Use --reset to wipe & re-seed.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from learn.models import Category, Post


# ── Lesson content ─────────────────────────────────────────────────────────────
# Format notes for the body renderer:
#   Chapter: N        → chapter number (parsed from first 5 lines)
#   Difficulty: X     → Easy / Medium / Hard
#   ## Heading        → section (auto-styled: exercise/warning/tip)
#   ### Sub-heading   → dot-prefixed sub-heading
#   - bullet          → ✓ bullet list
#   Structure: ...    → grammar table row (key/value)
#   Example: ...      → grammar table row
#   Form: ...         → grammar table row
#   Use: ...          → grammar table row
#   Note: ...         → grammar table row
#   Pattern: ...      → grammar table row
#   plain text        → paragraph

LESSONS = [
    # ── LEVEL 1: BEGINNER ──────────────────────────────────────────────────────
    {
        "title": "Parts of Speech: Nouns — The Name-Givers of Language",
        "body": """Chapter: 1
Difficulty: Easy

A noun is the foundation of every sentence. Before you can build anything in English, you need to know how to name things — people, places, ideas, and objects. This lesson breaks down every type of noun you will encounter in everyday speech and professional communication.

## What Is a Noun?

Every word in English belongs to a category called a "part of speech." A noun names a person, place, thing, or idea. Without nouns, we cannot identify who or what we are talking about.

Think of nouns as labels. Just as every product in a shop needs a label, every concept in language needs a name — and that name is a noun.

## Types of Nouns

### Common Nouns
A common noun names a general, non-specific person, place, or thing. It is NOT capitalised unless it begins a sentence.
- city, teacher, phone, hospital, report, meeting
- She works at a hospital.
- The manager approved the report.

### Proper Nouns
A proper noun names a specific, unique person, place, organisation, or title. It is ALWAYS capitalised.
- Delhi, Microsoft, Gagandeep, Monday, English, India
- She works at Microsoft in Delhi.
- The meeting is on Monday.

### Abstract Nouns
An abstract noun names something you cannot touch or see — an idea, emotion, quality, or concept.
- confidence, clarity, freedom, success, intelligence, honesty
- Confidence builds credibility in interviews.
- Clarity is the goal of good communication.

### Concrete Nouns
A concrete noun names something you can experience with your senses.
- book, microphone, table, voice, sound, paper
- She placed the microphone on the table.

### Countable vs Uncountable Nouns
This distinction matters enormously for grammar (articles, plurals).
- Countable: apple → apples, idea → ideas, report → reports
- Uncountable: water, advice, information, luggage, research, feedback, progress

## Common Errors to Avoid

### Uncountable Noun Mistakes (Very Common)
The most frequent grammar error Indian speakers make is treating uncountable nouns as countable.

❌ "She gave me a very good advice."
✅ "She gave me very good advice."

❌ "I have collected many informations."
✅ "I have collected a lot of information."

❌ "Can you give me some feedbacks?"
✅ "Can you give me some feedback?"

❌ "We made good progresses."
✅ "We made good progress."

### Correct Uncountable Nouns List
- advice (not advices)
- information (not informations)
- feedback (not feedbacks)
- luggage / baggage (not luggages)
- research (not researches — as a mass noun)
- furniture (not furnitures)
- equipment (not equipments)
- knowledge (not knowledges)

## Grammar Patterns
Structure: Singular countable → "a/an + noun"
Example: a doctor, an idea, a meeting
Structure: Plural countable → "noun + -s / -es"
Example: doctors, ideas, meetings
Structure: Uncountable → no article or "some/any/much"
Example: some advice, any information, much feedback

## Practice Exercises

### Exercise 1: Identify the Type
Classify each noun as common, proper, abstract, or uncountable:
- communication → abstract
- New York → proper
- information → uncountable (common)
- laptop → common (concrete)
- courage → abstract

### Exercise 2: Spot the Error
Correct these sentences:
- ❌ "She gave good advices about the project."
- ✅ "She gave good advice about the project."
- ❌ "They collected many informations from the survey."
- ✅ "They collected a lot of information from the survey."
- ❌ "The luggages are at the airport."
- ✅ "The luggage is at the airport."

### Exercise 3: Speaking Application
Say each sentence aloud, then record yourself:
- "I need some advice about my presentation."
- "The research shows that confidence matters."
- "She has years of experience in communication."
""",
    },
    {
        "title": "Parts of Speech: Pronouns — Replacing Nouns Correctly",
        "body": """Chapter: 2
Difficulty: Easy

Pronouns replace nouns to avoid repetition. Used incorrectly, they can make speech sound awkward, confusing, or even rude. This lesson covers every pronoun type with special attention to the errors most common in Indian English.

## Why Pronouns Matter in Communication

Without pronouns, every sentence would repeat the noun:
"Gagandeep went to Gagandeep's office. Gagandeep sat at Gagandeep's desk."

With pronouns:
"Gagandeep went to his office. He sat at his desk."

Pronouns make speech flow. But choosing the wrong pronoun — especially in Indian English — is one of the most noticed errors by native speakers.

## Types of Pronouns

### Subject Pronouns
Used as the subject (the doer) of the sentence.
- I, you, he, she, it, we, they
- I am presenting today.
- She leads the team.
- They approved the budget.

### Object Pronouns
Used as the object (receives the action) of the sentence.
- me, you, him, her, it, us, them
- The manager called me.
- She helped him prepare.
- We thanked them for the feedback.

### Possessive Pronouns
Show ownership. Two forms: adjective (before noun) and independent.
- my/mine, your/yours, his/his, her/hers, its/its, our/ours, their/theirs
- That is my report. → That report is mine.
- This is her idea. → This idea is hers.

### Reflexive Pronouns
Refer back to the subject. Used for emphasis or when subject = object.
- myself, yourself, himself, herself, itself, ourselves, yourselves, themselves
- I completed the project myself.
- She taught herself English.

### Relative Pronouns
Introduce relative clauses to add information.
- who (people), which (things), that (people/things), whose (possession)
- The candidate who impressed us most was hired.
- This is the report that you requested.

## Critical Error: Misusing "Myself"

This is one of the MOST common errors in Indian English — using "myself" as a subject or object pronoun.

### Wrong Use of Myself
❌ "Myself Gagandeep, and I am from Delhi."
✅ "I am Gagandeep, and I am from Delhi."

❌ "Myself will handle this project."
✅ "I will handle this project."

❌ "Please contact myself for queries."
✅ "Please contact me for queries."

❌ "Me and him went to the meeting."
✅ "He and I went to the meeting."

### Correct Use of Myself
✅ Emphasis: "I completed it myself." (no one helped me)
✅ Reflexive: "I introduced myself to the team."

## Grammar Patterns
Pattern: Subject pronoun + verb
Example: I speak, She leads, They decide
Pattern: Verb + object pronoun
Example: Call me, Help her, Thank them
Pattern: Subject + verb + reflexive
Example: I taught myself, She challenged herself

## Common Pronoun Errors

### Subject vs Object Confusion
❌ "Between you and I, the project is delayed."
✅ "Between you and me, the project is delayed." (after prepositions, use object pronouns)

❌ "Him and me will present together."
✅ "He and I will present together."

Tip: Remove one pronoun and test. "Me will present" sounds wrong → "I will present."

## Practice Exercises

### Exercise 1: Choose Correctly
- (I/Me) will present the report tomorrow. → I
- The manager praised (he/him) for the idea. → him
- (She/Her) and (I/me) work in the same team. → She and I
- Please send the email to (I/me). → me

### Exercise 2: Fix the Introduction
Rewrite this introduction correctly:
❌ "Myself Priya. Myself is working as a software engineer. Me and my team are working on AI."
✅ "I am Priya. I work as a software engineer. My team and I are working on AI."

### Exercise 3: Speaking Practice
Introduce yourself correctly using these patterns:
- "I am [name], and I work as [job]."
- "My team and I are responsible for [project]."
- "Please feel free to contact me with any questions."
""",
    },
    {
        "title": "Parts of Speech: Verbs, Adjectives & Adverbs",
        "body": """Chapter: 3
Difficulty: Easy

Verbs are the engine of every sentence — nothing happens without them. Adjectives and adverbs are the precision tools that add colour, detail, and exactness to your communication. Master these three and your sentences will come alive.

## Verbs — The Action Core

A verb expresses an action, state, or occurrence. Every grammatical sentence MUST have a verb.

### Types of Verbs

### Action Verbs
Express physical or mental actions.
- speak, write, analyse, think, decide, lead, present, improve
- She speaks with confidence.
- The team analysed the data carefully.

### Linking Verbs
Connect the subject to a description (no action involved).
- is, am, are, was, were, seem, appear, become, feel, look, sound
- The report is complete.
- She seems very confident.
- The meeting was productive.

### Auxiliary (Helping) Verbs
Support the main verb to form tenses, questions, and negatives.
- do, does, did, have, has, had, will, would, can, could, shall, should, may, might, must
- She has completed the task.
- They will present tomorrow.
- You must practise daily.

### Verb Forms (Irregular Verbs)
Many common verbs have irregular past forms. Memorise these:
- speak → spoke → spoken
- go → went → gone
- write → wrote → written
- give → gave → given
- take → took → taken
- bring → brought → brought
- think → thought → thought
- begin → began → begun

## Common Verb Errors

### State Verbs (Never Use in Continuous Form)
These verbs describe states, NOT actions. NEVER use them with -ing.
- know, understand, believe, want, need, prefer, love, like, hate, see, hear, smell

❌ "I am knowing the answer."
✅ "I know the answer."

❌ "She is understanding the concept."
✅ "She understands the concept."

❌ "I am having two brothers."
✅ "I have two brothers."

❌ "He is wanting to improve."
✅ "He wants to improve."

## Adjectives — Describing Nouns

An adjective modifies (describes) a noun or pronoun. It answers: Which? What kind? How many?

### Types of Adjectives
- Descriptive: clear, confident, professional, fluent, concise
- Quantitative: many, few, several, enough, some, more
- Demonstrative: this, that, these, those
- Comparative: clearer, more professional, better
- Superlative: clearest, most professional, best

### Adjective Placement
In English, adjectives usually come BEFORE the noun (unlike many Indian languages where they can follow the noun).

Structure: Adjective + Noun
Example: a clear explanation, professional communication, an effective strategy
Structure: Subject + Linking verb + Adjective
Example: Her explanation is clear. The strategy seems effective.

## Adverbs — Modifying Verbs and Adjectives

An adverb modifies a verb, adjective, or another adverb. It answers: How? When? Where? How much?

### Formation: Adjective + -ly
- clear → clearly
- confident → confidently
- professional → professionally
- effective → effectively
- fluent → fluently

### Common Adverbs in Professional Communication
- She spoke clearly and confidently.
- The team performed exceptionally well.
- Please respond promptly.
- He explained the concept thoroughly.

### Adjective vs Adverb Confusion
❌ "She speaks very good English." (if meaning: speaks well)
✅ "She speaks English very well."

❌ "He performed really brilliant."
✅ "He performed really brilliantly."

Note: "good" is an adjective (describes nouns). "well" is an adverb (describes verbs).

## Grammar Patterns
Structure: Subject + verb + adverb
Example: She speaks clearly. He presents confidently.
Structure: Adjective + noun
Example: a clear message, effective communication
Structure: Subject + linking verb + adjective
Example: The idea seems brilliant. Her voice sounds confident.

## Practice Exercises

### Exercise 1: Choose Verb Form
- She ___ (know / is knowing) the answer. → knows
- They ___ (complete / are completing) the task right now. → are completing
- I ___ (have / am having) a meeting tomorrow. → have
- He ___ (work / is working) very hard these days. → is working

### Exercise 2: Adjective or Adverb?
- She is a ___ (good/well) communicator. → good
- She communicates ___ (good/well). → well
- He gave a ___ (clear/clearly) explanation. → clear
- He explained it ___ (clear/clearly). → clearly

### Exercise 3: Speaking Application
Record yourself describing your work using vivid adjectives and adverbs:
- "I am a [adjective] professional who communicates [adverb]."
- "My team consistently delivers [adjective] results."
""",
    },
    {
        "title": "Sentence Structure: Building Complete Sentences",
        "body": """Chapter: 4
Difficulty: Easy

A sentence is not just a group of words — it is a complete thought with a clear structure. Understanding how sentences are built gives you control over your speech and writing. This lesson teaches you the building blocks and the rules that hold them together.

## What Makes a Complete Sentence?

Every complete English sentence needs exactly three things:
- A subject (who or what the sentence is about)
- A verb (what the subject does or is)
- A complete idea (the thought must be finished)

### The Subject
The subject is the noun or pronoun that performs the action or is described.
- She presents. (She = subject)
- The team completed the project. (The team = subject)
- Confidence builds credibility. (Confidence = subject)

### The Predicate
The predicate contains the verb and everything else after the subject.
- She presents clearly. (presents clearly = predicate)
- The team completed the project on time. (completed the project on time = predicate)

## Sentence Patterns

### SV — Subject + Verb (simplest)
- She speaks.
- The meeting ended.
- Progress happened.

### SVO — Subject + Verb + Object (most common)
- She delivered the presentation.
- They completed the report.
- He improved his grammar.

### SVC — Subject + Verb + Complement (with linking verb)
- She is confident.
- The idea seems brilliant.
- The result was impressive.

### SVOO — Subject + Verb + Indirect Object + Direct Object
- She gave the team feedback.
- He sent the manager the report.

### SVOA — Subject + Verb + Object + Adverb/Adverbial
- She delivered the presentation confidently.
- They completed the project on Friday.

## Common Sentence Errors

### Fragments (Incomplete Sentences)
A fragment is missing a subject, verb, or complete idea.

❌ "Running every day." (no subject)
✅ "She runs every day."

❌ "Because she practises." (incomplete idea — starts a thought but doesn't finish it)
✅ "Because she practises, her fluency has improved."

❌ "The report that I wrote." (no verb for the main clause)
✅ "The report that I wrote was approved."

### Run-on Sentences
Two or more independent clauses joined WITHOUT proper punctuation.

❌ "She is confident she speaks well she impresses everyone."
✅ "She is confident. She speaks well and impresses everyone."
✅ "She is confident; she speaks well and impresses everyone."

### How to Fix Run-ons
- Add a full stop (period) to separate sentences
- Add a semicolon between related independent clauses
- Add a coordinating conjunction (and, but, so, or, nor, for, yet) with a comma

## Grammar Patterns
Pattern: Subject + Verb + Object
Example: She completed the report.
Pattern: Subject + is/are + adjective
Example: The team is ready. The results are impressive.
Pattern: [Adverbial clause], + Subject + Verb
Example: Because she practised, she improved.

## Word Order in English

English has a fixed word order (unlike Hindi/Urdu which are more flexible). The standard order is:

SVOMPT — Subject | Verb | Object | Manner | Place | Time
- She delivered the report professionally at the office on Friday.

This is less commonly remembered as a rule and more commonly felt through practice.

## Practice Exercises

### Exercise 1: Identify Fragments
Label each as a complete sentence (S) or fragment (F):
- "Although the meeting was productive." → F
- "The manager approved the idea." → S
- "Running to improve communication skills." → F
- "She speaks English confidently." → S

### Exercise 2: Fix Run-ons
Correct each run-on sentence using punctuation or conjunctions:
- ❌ "She practises daily her English has improved dramatically."
- ✅ "She practises daily, so her English has improved dramatically."
- ❌ "The presentation was strong the audience was engaged the feedback was positive."
- ✅ "The presentation was strong, the audience was engaged, and the feedback was positive."

### Exercise 3: Build Sentences
Using the SVOO and SVOA patterns, write two sentences about your work:
- "I [verb] my [team/manager] [something] every [day/week]."
- "She presented the [project] [how?] at the [place/event]."
""",
    },
    {
        "title": "Sentence Types: Simple, Compound, Complex & Compound-Complex",
        "body": """Chapter: 5
Difficulty: Easy

One of the clearest signs of an advanced communicator is the ability to vary sentence types. Using only simple sentences sounds choppy and childlike. Using only complex sentences can confuse your listener. This lesson teaches you to mix all four types naturally.

## Why Sentence Variety Matters

Notice the difference:
- Boring: "She practises every day. She has improved. She is more confident. She presents better now."
- Natural: "Because she practises every day, she has improved significantly and now presents with much greater confidence."

The second version flows, shows cause-effect relationships, and sounds professional.

## The Four Sentence Types

### 1. Simple Sentences
One independent clause: one subject + one verb + complete thought.
Structure: [Subject] + [Verb] + [rest]
Example: She speaks clearly.
Example: The team completed the project.
Example: Confidence builds credibility.

Use simple sentences for:
- Direct, punchy statements
- Key points you want to emphasise
- Instructions and calls to action

### 2. Compound Sentences
Two or more independent clauses joined by a coordinating conjunction (FANBOYS) or semicolon.

FANBOYS: For, And, Nor, But, Or, Yet, So

Structure: [Independent clause] + [, + conjunction] + [Independent clause]
Example: She practises daily, and her fluency has improved.
Example: He prepared thoroughly, but he was still nervous.
Example: You can read the report, or you can attend the briefing.
Example: She works hard; she always meets her deadlines.

Use compound sentences for:
- Connecting equally important ideas
- Showing contrast (but, yet)
- Showing cause/result (so)

### 3. Complex Sentences
One independent clause + one or more dependent (subordinate) clauses.

Common subordinating conjunctions:
- because, although, while, when, if, unless, since, after, before, as soon as, even though

Structure: [Dependent clause], + [Independent clause]
Example: Because she practises daily, her fluency has improved.
Example: Although he was nervous, he delivered an excellent presentation.
Example: When the meeting ends, we will review the feedback.

Structure: [Independent clause] + [Dependent clause]
Example: Her fluency has improved because she practises daily.
Example: He delivered an excellent presentation although he was nervous.

Note: When the dependent clause comes FIRST, use a comma. When it comes second, no comma is needed.

### 4. Compound-Complex Sentences
Two or more independent clauses + at least one dependent clause.
Structure: Complex + Compound combination
Example: Because she practised daily, her fluency improved, and she started winning more clients.
Example: Although the project was difficult, the team worked hard, and they delivered on time.

## Common Errors

### Comma Splice
Joining two independent clauses with ONLY a comma (no conjunction).

❌ "She practises daily, she has improved dramatically."
✅ "She practises daily, and she has improved dramatically."
✅ "She practises daily; she has improved dramatically."
✅ "She practises daily. She has improved dramatically."

### Using "But" or "And" to Start a Sentence
In formal writing, avoid starting sentences with conjunctions. In speech and informal writing, it is acceptable.
- Informal: "And that's why I believe in daily practice."
- Formal: "This is why I believe in daily practice."

## Grammar Patterns
Pattern: [Simple] She speaks clearly.
Pattern: [Compound] She speaks clearly, and people trust her.
Pattern: [Complex] Because she speaks clearly, people trust her.
Pattern: [Compound-Complex] Because she speaks clearly, people trust her, and she has built a strong reputation.

## Practice Exercises

### Exercise 1: Identify the Type
Classify each sentence as Simple (S), Compound (Co), Complex (Cx), or Compound-Complex (CC):
- "She improved her vocabulary." → S
- "She improved her vocabulary, so she speaks more professionally." → Co
- "Because she studied hard, she improved." → Cx
- "Because she studied hard, she improved, and she got promoted." → CC

### Exercise 2: Combine Sentences
Combine each pair using the instruction given:
- "She practises. She improves." → Compound using "and": "She practises, and she improves."
- "He was nervous. He presented well." → Complex using "although": "Although he was nervous, he presented well."

### Exercise 3: Speaking Drill
Record yourself answering: "Why do you want to improve your English?"
Use at least one of each sentence type in your answer.
""",
    },
    # ── LEVEL 1 CONTINUED: TENSES ─────────────────────────────────────────────
    {
        "title": "Present Tenses: Simple, Continuous & Perfect",
        "body": """Chapter: 6
Difficulty: Easy

Tense errors are the most visible grammar mistakes in speech. Using the wrong tense makes your meaning unclear and can sound unprofessional. This lesson covers all three present tenses with precise rules and the common errors Indian speakers make.

## Why Tenses Are Essential

Tenses tell your listener WHEN something happens. Without correct tenses:
- "I am living in Delhi for five years." (wrong — listener is confused about timeline)
- "I have been living in Delhi for five years." (correct — clear duration up to now)

## Present Simple

Used for: habits, routines, facts, schedules, and general truths.

Structure: Subject + base verb (he/she/it → verb + s)
Example: I speak English fluently.
Example: She works at a hospital.
Example: The sun rises in the east.
Example: The meeting starts at 9 AM.

### When to Use Present Simple
- Daily habits: "I practise grammar every morning."
- Facts: "Water boils at 100°C."
- Scheduled events: "The conference begins on Monday."
- General truths: "Confidence matters in interviews."

### Key Signals
- always, usually, often, sometimes, never, every day, on Mondays

### Common Error
❌ "She is working in Mumbai." (if it's a permanent fact, not a temporary situation)
✅ "She works in Mumbai."

## Present Continuous

Used for: actions happening RIGHT NOW or temporary situations.

Structure: Subject + is/am/are + verb-ing
Example: I am practising my presentation now.
Example: She is working on the report at the moment.
Example: They are planning a new project this week.

### When to Use Present Continuous
- Action at this exact moment: "She is speaking right now."
- Temporary situations: "I am living with my parents while my flat is renovated."
- Arranged future: "We are meeting at 3 PM tomorrow."

### State Verbs — NEVER Use with Continuous
know, understand, believe, want, need, prefer, love, hate, see, hear, think (=opinion), have (=possess)

❌ "I am knowing the answer."
✅ "I know the answer."

❌ "She is wanting a promotion."
✅ "She wants a promotion."

❌ "I am having two cars." (possession)
✅ "I have two cars."

## Present Perfect

Used for: past actions with a connection to now, experiences, and recent events.

Structure: Subject + have/has + past participle (V3)
Example: I have completed the course.
Example: She has improved significantly.
Example: They have never missed a deadline.
Example: He has just sent the email.

### When to Use Present Perfect
- Experience (ever/never): "Have you ever presented to a large audience?"
- Recent actions (just, already, yet): "I have already finished the report."
- Duration up to now (for/since): "I have worked here for three years."
- Unspecified past time: "She has won many awards." (we don't say when)

### For vs Since
Use: "for" + period of time
Example: I have worked here for five years. / for three months.
Use: "since" + specific point in time
Example: I have worked here since 2019. / since January.

### Common Errors
❌ "I have seen him yesterday." (specific past time → use Past Simple)
✅ "I saw him yesterday."

❌ "She is working here since 2020." (duration up to now → Present Perfect)
✅ "She has worked here since 2020."

❌ "Did you ever visit London?" (experience → Present Perfect)
✅ "Have you ever visited London?"

## Grammar Patterns
Structure: Present Simple → I/You/They + verb | He/She/It + verb+s
Example: I work. She works. They work.
Structure: Present Continuous → am/is/are + verb-ing
Example: I am working. She is working. They are working.
Structure: Present Perfect → have/has + past participle
Example: I have worked. She has worked. They have worked.

## Practice Exercises

### Exercise 1: Choose the Correct Tense
- She ___ (works/is working) in marketing. She joined two years ago. → works
- I ___ (write/am writing) the report right now, please don't disturb me. → am writing
- He ___ (lives/has lived) in Delhi for ten years and still loves it. → has lived
- I ___ (never met/have never met) the CEO. → have never met
- She ___ (finished/has finished) the project yesterday. → finished

### Exercise 2: Correct These Sentences
- ❌ "I am knowing the answer since yesterday." → ✅ "I have known the answer since yesterday."
- ❌ "She is living here for five years." → ✅ "She has lived here for five years."
- ❌ "Have you seen her yesterday?" → ✅ "Did you see her yesterday?"

### Exercise 3: Speaking Practice
Answer these questions using the correct present tense:
- "What do you do?" (routine → Present Simple)
- "What are you working on right now?" (Present Continuous)
- "What have you achieved in your career?" (Present Perfect)
""",
    },
    {
        "title": "Past Tenses: Simple, Continuous & Perfect",
        "body": """Chapter: 7
Difficulty: Easy

The past tenses let you narrate events, tell stories, explain your experience, and describe what happened before something else. In interviews and professional settings, you will use past tenses constantly. Getting them right is essential.

## Past Simple

Used for: completed actions at a specific time in the past.

Structure: Subject + past form (V2) of verb
Example: She presented the report yesterday.
Example: He completed the training in 2022.
Example: The team launched the product last quarter.
Example: I studied grammar every day when I was a student.

### Key Signals
- yesterday, last week/month/year, in 2020, ago, once, when I was young

### Regular vs Irregular Verbs
Regular: work → worked | present → presented | complete → completed
Irregular: go → went | speak → spoke | write → wrote | have → had | give → gave

### Past Simple for Interviews
This is the tense you use most in interviews. The STAR method (Situation, Task, Action, Result) is almost entirely Past Simple:
- "When I was at XYZ Company, I led a team of five people."
- "We faced a deadline challenge, so I reorganised the workflow."
- "As a result, we delivered the project two days early."

## Past Continuous

Used for: actions in progress at a specific time in the past, or background actions interrupted by another action.

Structure: Subject + was/were + verb-ing
Example: She was preparing the presentation when the power went out.
Example: While the team was working, the manager reviewed the results.
Example: At 8 PM yesterday, I was attending a webinar.

### Key Signals
- while, when, at [time] yesterday, at that moment

### Past Continuous vs Past Simple
- The interrupted action uses Past Simple ("went out", "called").
- The ongoing action uses Past Continuous ("was preparing", "was working").
- While I was speaking, my phone rang. (Continuous = background; Simple = interruption)

## Past Perfect

Used for: an action that was completed BEFORE another past action.

Structure: Subject + had + past participle (V3)
Example: By the time she arrived, the meeting had already started.
Example: He had studied the topic before he wrote the report.
Example: I had never presented to 500 people before that conference.

### Key Signals
- by the time, before, after, already, just, never … before

### Common Error
❌ "She had completed the task and then she submitted it."
✅ "She completed the task and then submitted it." (when the sequence is clear, Past Simple is fine for both)
Use Past Perfect only when you need to emphasise that one action happened before another.

## Common Past Tense Errors

❌ "I have gone to London last year." (specific time → Past Simple)
✅ "I went to London last year."

❌ "Yesterday I have completed the report." (specific time → Past Simple)
✅ "Yesterday I completed the report."

❌ "He goed to the office." (irregular verb)
✅ "He went to the office."

❌ "She telled me about the project."
✅ "She told me about the project."

## Grammar Patterns
Structure: Past Simple → Subject + V2
Example: She presented. He went. They completed.
Structure: Past Continuous → Subject + was/were + V-ing
Example: She was presenting. They were working.
Structure: Past Perfect → Subject + had + V3
Example: She had presented. They had completed.

## Practice Exercises

### Exercise 1: Choose the Correct Past Tense
- She ___ (worked/was working) at TCS when she got the new offer. → was working
- I ___ (have completed/completed) the course last month. → completed
- By the time he arrived, the meeting ___ (already started/had already started). → had already started
- While she ___ (presented/was presenting), the CEO walked in. → was presenting

### Exercise 2: Tell a Story (STAR Format)
Write 4 sentences in Past Simple about a challenge you faced:
- "Last year, I [faced/dealt with/handled]..."
- "The team [was/were]..."
- "I [decided to/chose to/organised]..."
- "As a result, we [achieved/delivered/improved]..."

### Exercise 3: Common Error Correction
- ❌ "I have seen her yesterday at the conference." → ✅
- ❌ "The team have finished the project last Friday." → ✅
- ❌ "She goed home early because she was tired." → ✅
""",
    },
    {
        "title": "Future Tenses: Will, Going To & Present Tenses for Future",
        "body": """Chapter: 8
Difficulty: Medium

English has several ways to talk about the future — and choosing the wrong one changes your meaning. This lesson covers all future forms with clear rules for when to use each one, especially in professional and interview contexts.

## Will — Spontaneous Decisions & Predictions

Use "will" for:
- Decisions made at the moment of speaking
- Predictions without evidence
- Offers, promises, and requests
- Fixed facts about the future

Structure: Subject + will + base verb
Example: "I'll help you with that." (decision made now)
Example: "She will probably get the promotion." (prediction)
Example: "I will definitely improve." (promise)
Example: "The sun will rise tomorrow." (fixed fact)

### Key Signals
- probably, definitely, I think, I believe, I'm sure, I hope, perhaps

## Going To — Plans & Evidence-Based Predictions

Use "going to" for:
- Planned intentions (decided before now)
- Predictions based on current evidence

Structure: Subject + is/am/are + going to + base verb
Example: "I am going to apply for the position next week." (already planned)
Example: "Look at those clouds — it is going to rain." (evidence visible now)
Example: "She is going to lead the new project." (it has been decided)

### Will vs Going To — The Key Difference
- "I will write the report." → You just decided this, right now.
- "I am going to write the report." → You had already planned this before now.

## Present Continuous for Future

Use for definite arrangements (appointments, meetings, travel):

Structure: Subject + is/am/are + verb-ing (+ future time expression)
Example: "I am meeting the director at 3 PM tomorrow."
Example: "We are flying to London next Tuesday."
Example: "She is presenting at the conference next Friday."

This sounds more definite and committed than "going to."

## Present Simple for Future (Schedules)

Use for timetables, schedules, and programmes:
- "The train departs at 9 AM."
- "The conference begins on Monday."
- "The deadline is next Friday."

## Future Perfect (Advanced)

Use for actions that will be completed before a future point.

Structure: Subject + will have + past participle
Example: "By the time you read this, I will have completed the course."
Example: "She will have worked here for ten years by next March."

## Grammar Patterns
Structure: Will + base verb (spontaneous / prediction)
Example: I'll send it now. She will probably succeed.
Structure: Am/Is/Are + going to + base verb (planned)
Example: I am going to prepare. She is going to lead.
Structure: Am/Is/Are + verb-ing (definite arrangement)
Example: I am meeting him tomorrow. We are flying tonight.

## Common Future Errors

❌ "I will to call you later." (no "to" after will)
✅ "I will call you later."

❌ "She will going to present tomorrow."
✅ "She is going to present tomorrow." OR "She will present tomorrow."

❌ "I am going to call you now." (spontaneous → use will)
✅ "I'll call you now." / "I will call you now."

## Practice Exercises

### Exercise 1: Will or Going To?
- She is reading the schedule right now. She ___ (will/is going to) present tomorrow. → is going to
- Look out! That glass ___ (will/is going to) fall! → is going to
- "I'm not sure what I'll have." "I ___ (will/am going to) have the pasta." → will (spontaneous)
- I've already booked. I ___ (will/am going to) travel to Mumbai next week. → am going to

### Exercise 2: Career Future Statements
Write sentences about your career plans using all three forms:
- Will: "I think I will..." (prediction)
- Going to: "I am going to..." (definite plan)
- Present Continuous: "I am [meeting/presenting/starting]..." (arranged appointment)

### Exercise 3: Interview Answer
Answer this question using future tenses:
"Where do you see yourself in five years?"
Use: will, going to, and at least one present tense for future.
""",
    },
    # ── LEVEL 2: INTERMEDIATE ─────────────────────────────────────────────────
    {
        "title": "Subject-Verb Agreement: The Golden Rule",
        "body": """Chapter: 9
Difficulty: Medium

Subject-verb agreement is simple in principle: a singular subject takes a singular verb; a plural subject takes a plural verb. But English has dozens of situations where this rule is tricky. This lesson covers all the tricky cases you will encounter.

## The Core Rule

Structure: Singular subject → singular verb (verb + s)
Example: The manager works hard.
Structure: Plural subject → plural verb (verb without s)
Example: The managers work hard.

## Tricky Cases

### Case 1: Collective Nouns
Words like team, group, committee, class, government, staff, faculty, company.

In British English: collective nouns can be singular OR plural depending on context.
In American English: collective nouns are usually singular.

For professional/international communication, use SINGULAR:
✅ "The team is ready." (team as one unit)
✅ "The committee has decided." (one group, one decision)

❌ "The team are winning." (British is fine but avoid in formal contexts)

### Case 2: Indefinite Pronouns
Always singular: everyone, everyone, someone, anyone, no one, everybody, somebody, anybody, nobody, each, either, neither, one

❌ "Everyone are welcome."
✅ "Everyone is welcome."

❌ "Each of the employees were given feedback."
✅ "Each of the employees was given feedback."

❌ "Neither of them have responded."
✅ "Neither of them has responded."

### Case 3: Either/Neither … Or/Nor
The verb agrees with the CLOSEST subject.
- Either the manager or the team members ARE responsible.
- Either the team members or the manager IS responsible.
- Neither the director nor the employees WERE informed.

### Case 4: Phrases Between Subject and Verb
Ignore phrases between the subject and verb to find the real subject.

❌ "The quality of the products are excellent."
✅ "The quality of the products is excellent." (subject = quality, singular)

❌ "A group of students have arrived."
✅ "A group of students has arrived." (subject = group, singular)

❌ "The results of the experiment shows promising data."
✅ "The results of the experiment show promising data." (subject = results, plural)

### Case 5: "There is / There are"
The verb agrees with the noun AFTER it, not "there."
- There is a problem. (one problem)
- There are several problems. (multiple problems)
- There is a report and two emails waiting. (use singular for the first item)

### Case 6: Subjects Joined by "And"
Usually plural:
- The director and the manager are in the meeting.
- Confidence and clarity are essential for communication.

Exception: when two things are considered one unit:
- Rice and curry is my favourite dish.
- Fish and chips is a British classic.

## Common Indian English Errors

❌ "People is saying that..." → ✅ "People are saying that..."
❌ "My family are very supportive." → ✅ "My family is very supportive." (AmE/standard)
❌ "The news are shocking." → ✅ "The news is shocking." (news = uncountable, always singular)
❌ "Mathematics are difficult." → ✅ "Mathematics is difficult." (subjects ending in -ics are singular)

## Grammar Patterns
Pattern: [Singular noun] + is/was/has + verb
Example: The team is ready. The committee has decided.
Pattern: [Plural noun] + are/were/have + verb
Example: The results are positive. They have completed the task.
Pattern: Everyone/Someone/No one + singular verb
Example: Everyone is responsible. Someone has made an error.

## Practice Exercises

### Exercise 1: Choose the Correct Verb
- The committee ___ (have/has) approved the budget. → has
- Everyone in the office ___ (is/are) invited. → is
- Neither the manager nor the employees ___ (was/were) informed. → were
- The quality of their products ___ (is/are) outstanding. → is
- There ___ (is/are) three reports on the desk. → are

### Exercise 2: Spot the Error
- ❌ "Each of the candidates have been interviewed." → ✅
- ❌ "The group of managers are meeting tomorrow." → ✅
- ❌ "Either the CEO or the directors is attending." → ✅
- ❌ "The news are very encouraging this week." → ✅

### Exercise 3: Real-World Application
Write five sentences about your workplace or study group using these patterns:
- The team + singular verb
- Everyone + singular verb
- The results + plural verb
""",
    },
    {
        "title": "Articles: Mastering a, an, and the",
        "body": """Chapter: 10
Difficulty: Medium

Articles are tiny words — just "a," "an," and "the" — but they cause enormous confusion for non-native English speakers. Using the wrong article (or missing one entirely) is one of the most common errors in Indian English. This lesson gives you a complete, practical system.

## The Three Articles

### Indefinite Articles: "a" and "an"
Use when referring to any one member of a general group (non-specific).
- I need a pen. (any pen, not a specific one)
- She is a doctor. (a member of the group "doctors")
- He made an error. (any one error)

### Definite Article: "the"
Use when referring to a specific thing that both speaker and listener can identify.
- Give me the pen. (the specific pen we already talked about, or the only one here)
- The doctor called. (a specific doctor, known to us both)
- She is the CEO of the company. (only one CEO)

### No Article (Zero Article)
Some nouns take NO article at all.

## "A" vs "An" — Sound Rule

This is about SOUND, not spelling.
- A → before a consonant sound
- An → before a vowel sound

Use "A" before consonant sounds:
- a university (sounds like "yu" — consonant sound)
- a one-hour meeting (sounds like "wun" — consonant sound)
- a European country (sounds like "yu" — consonant sound)
- a useful tool

Use "An" before vowel sounds:
- an MBA (sounds like "em" — vowel sound)
- an honest person (sounds like "on" — vowel sound, 'h' is silent)
- an hour (sounds like "ow" — vowel sound, 'h' is silent)
- an X-ray

❌ "a MBA degree" → ✅ "an MBA degree"
❌ "a honest man" → ✅ "an honest man"
❌ "an university" → ✅ "a university"

## When to Use "The"

### Rule 1: Second Mention
First mention → use a/an. After that → use the.
- "I had a meeting yesterday. The meeting went very well."
- "She received a promotion. The promotion came with a pay rise."

### Rule 2: Only One Exists (Unique)
- the sun, the moon, the internet, the government, the prime minister
- the Himalayas, the Amazon, the Eiffel Tower

### Rule 3: Specific Identification
When context makes it clear which one you mean.
- "Could you close the door?" (the specific door in front of us)
- "Please read the report I sent." (the specific report)

### Rule 4: Superlatives
Always use "the" with superlatives.
- She is the best communicator in the team.
- This is the most effective strategy.

### Rule 5: Ordinal Numbers
- the first step, the second chapter, the third attempt

## When NOT to Use "The" (Zero Article)

General plural nouns: "Doctors save lives." (not "The doctors save lives.")
Proper nouns (most): "She lives in Delhi." (not "She lives in the Delhi.")
Meals, languages, subjects (generally): eat breakfast, speak English, study mathematics
Body parts with possessives: "She broke her arm." (not "the arm")

### Common Mistakes with "The"

❌ "She is the honest person."
✅ "She is an honest person." (first mention, general)

❌ "The communication is important in life."
✅ "Communication is important in life." (abstract concept in general)

❌ "Please refer to the page 5."
✅ "Please refer to page 5."

❌ "I like the cricket." (sport in general)
✅ "I like cricket."

## Grammar Patterns
Pattern: A/An + singular countable noun (first mention / general)
Example: She is a professional. He made an error.
Pattern: The + noun (specific / known / unique)
Example: The professional I mentioned is here. The error was corrected.
Pattern: Zero article + plural / uncountable / proper nouns
Example: Doctors study hard. She speaks English. She lives in Mumbai.

## Practice Exercises

### Exercise 1: Fill in a, an, the, or — (no article)
- She is ___ engineer at ___ Microsoft. → an engineer, — Microsoft
- Could you open ___ window, please? → the window
- I saw ___ interesting film last night. ___ film was about grammar. → an interesting film / the film
- ___ communication is essential in ___ workplace. → — communication / the workplace
- He is ___ honest man with ___ MBA. → an honest man / an MBA

### Exercise 2: Spot the Error
- ❌ "She is the best student in a class." → ✅
- ❌ "He is an useful team member." → ✅
- ❌ "The confidence is very important." → ✅
- ❌ "She gave a advise about the project." → ✅

### Exercise 3: Professional Introduction Practice
Write a 5-sentence introduction using articles correctly:
- Include: a (first mention), the (specific reference), an (before vowel sound), and zero article (general concept).
""",
    },
    {
        "title": "Prepositions: In, On, At, and Beyond",
        "body": """Chapter: 11
Difficulty: Medium

Prepositions are small words that show relationships between things — time, place, direction, cause. They are among the hardest parts of English because they often don't follow logic and must be memorised. This lesson gives you the most important preposition rules and the most common errors.

## Prepositions of Time: At, On, In

The easiest way to remember:

### AT — Precise Points in Time
Use: "at" + specific times, meal times, parts of the day (night)
Example: at 9 AM, at noon, at midnight, at dinner time, at the weekend (BrE)
Example: She spoke at 5 PM. The conference starts at 9 o'clock.

### ON — Days and Dates
Use: "on" + days of the week, specific dates, special days
Example: on Monday, on 15 March, on my birthday, on New Year's Day
Example: The meeting is on Friday. She was born on 3 April.

### IN — Longer Periods
Use: "in" + months, years, seasons, decades, centuries, parts of the day (except night)
Example: in March, in 2026, in winter, in the morning, in the evening
Example: She joined the company in 2020. The report is due in January.

### Memory Tip
Think of it as a funnel: IN (big periods) → ON (days/dates) → AT (exact times)

## Prepositions of Place: At, On, In

### AT — Specific Location (a point)
Use: at + address, venue, location
Example: at 221B Baker Street, at the office, at home, at school, at the station

### ON — Surface Contact
Use: on + surfaces, floors, streets, public transport
Example: on the table, on the wall, on the first floor, on Oxford Street, on the bus

### IN — Enclosed Space
Use: in + rooms, buildings, cities, countries, containers
Example: in the office, in Delhi, in India, in the box, in the newspaper

### Common Errors
❌ "She is at the office" (as a location) → ✅ or "in the office" (inside the building — both acceptable)
❌ "He lives on Delhi." → ✅ "He lives in Delhi."
❌ "The meeting is in Monday." → ✅ "The meeting is on Monday."

## Common Prepositional Errors in Indian English

### Discuss ABOUT (Wrong — NEVER use)
❌ "Let's discuss about this problem."
✅ "Let's discuss this problem." (discuss does not need "about")

### Married WITH (Wrong)
❌ "She is married with a doctor."
✅ "She is married to a doctor."

### Return BACK (Redundant)
❌ "He will return back tomorrow."
✅ "He will return tomorrow." (return already means come back)

### Reach TO (Wrong)
❌ "She reached to the station."
✅ "She reached the station." / "She arrived at the station."

### Enter INTO (Often redundant)
❌ "They entered into the building."
✅ "They entered the building."

### Cope UP WITH (Wrong)
❌ "She is unable to cope up with the pressure."
✅ "She is unable to cope with the pressure."

## Common Verb + Preposition Combinations
- apologise TO someone FOR something: "She apologised to the manager for the error."
- agree WITH a person / ON a topic: "I agree with you on this point."
- depend ON: "Success depends on consistent practice."
- interested IN: "I am interested in this opportunity."
- responsible FOR: "She is responsible for the project."
- familiar WITH: "Are you familiar with this software?"
- capable OF: "She is capable of leading the team."
- different FROM (not different THAN/TO in formal contexts): "This approach is different from the previous one."

## Grammar Patterns
Pattern: at + specific time/place point
Example: at 9 AM, at home, at the station
Pattern: on + day/date/surface
Example: on Monday, on the table, on the bus
Pattern: in + enclosed space / longer time period
Example: in the office, in Delhi, in 2026

## Practice Exercises

### Exercise 1: At, On, or In?
- The conference is ___ 10 AM ___ Tuesday ___ March. → at / on / in
- She works ___ Google ___ Bangalore ___ South India. → at / in / in
- He arrived ___ the airport ___ 7 PM ___ Sunday. → at / at / on
- I will call you ___ the morning ___ Monday. → in / on

### Exercise 2: Correct These Sentences
- ❌ "Let's discuss about the issue." → ✅
- ❌ "She is married with a software engineer." → ✅
- ❌ "Please return back the documents." → ✅
- ❌ "He reached to the office at 8 AM." → ✅
- ❌ "I can't cope up with this pressure." → ✅

### Exercise 3: Professional Email Phrases
Write these phrases using correct prepositions:
- "I am writing ___ reference ___ your email dated..." → in / to
- "Please find the report attached ___ this email." → to
- "I will be available ___ 2 PM ___ Thursday." → at / on
""",
    },
    {
        "title": "Modal Verbs: Can, Could, Will, Would, Should, Must & May",
        "body": """Chapter: 12
Difficulty: Medium

Modal verbs are the verbs that express possibility, permission, obligation, ability, and politeness. They are essential for professional communication — getting the modal wrong can make you sound rude, over-confident, or unclear. This lesson covers every modal with precision.

## What Are Modal Verbs?

Modal verbs are a special type of auxiliary verb. Key features:
- They NEVER change form (no -s for third person): "She can speak" (NOT "She cans")
- They are ALWAYS followed by a BASE verb (no "to"): "She should speak" (NOT "She should to speak")
- They express MOOD — ability, permission, obligation, possibility, advice

## The Main Modals and Their Uses

### CAN — Present Ability / Permission
Structure: can + base verb
Example: She can speak four languages. (ability)
Example: Can I take a break? (permission — informal)
Example: You can submit the report tomorrow. (permission)

### COULD — Past Ability / Polite Requests / Possibility
Structure: could + base verb
Example: She could play the piano when she was young. (past ability)
Example: Could you please send me the report? (polite request)
Example: This could be the solution. (possibility)

### WILL — Future / Certainty / Promises
Structure: will + base verb
Example: She will present tomorrow. (future certainty)
Example: I will complete it by Friday. (promise)
Example: Don't worry, it will work. (reassurance)

### WOULD — Hypothetical / Polite Requests / Past Habit
Structure: would + base verb
Example: I would be grateful if you could help. (polite)
Example: Would you like some feedback? (polite offer)
Example: She would practise every morning. (past habit)
Example: If I were the manager, I would change this process. (hypothetical)

### SHOULD — Advice / Expectation / Mild Obligation
Structure: should + base verb
Example: You should practise speaking every day. (advice)
Example: She should have arrived by now. (expectation)
Example: Candidates should arrive 15 minutes early. (expectation/mild rule)

### MUST — Strong Obligation / Logical Deduction
Structure: must + base verb
Example: You must submit the form by Friday. (obligation — from authority)
Example: She must be very experienced — her work is brilliant. (deduction)
Example: You must not share this information. (prohibition)

### MAY / MIGHT — Possibility / Formal Permission
Structure: may/might + base verb
Example: She may arrive late today. (possibility, may = more certain than might)
Example: May I ask a question? (formal permission)
Example: This might be the best approach. (less certain possibility)

## Politeness Scale

From most formal/polite to least:
- Most polite: "Would you mind helping me?"
- Very polite: "Could you please help me?"
- Polite: "Can you help me?"
- Direct: "Help me." (imperative)

For professional emails and meetings, default to COULD or WOULD.

## Common Errors

❌ "She can to speak French." (no "to" after modals)
✅ "She can speak French."

❌ "You should to prepare better." (no "to")
✅ "You should prepare better."

❌ "He mights be late." (modals never change form)
✅ "He might be late."

❌ "I must to attend the meeting." (no "to")
✅ "I must attend the meeting."

❌ "She don't can do it." (modal negation is different)
✅ "She cannot do it." / "She can't do it."

## Grammar Patterns
Pattern: Subject + modal + base verb
Example: She should prepare. They must submit. He could help.
Pattern: Could/Would you + base verb + please?
Example: Could you send the report, please?
Pattern: Subject + modal not + base verb
Example: You must not share this. She cannot attend.

## Practice Exercises

### Exercise 1: Choose the Right Modal
- You look tired. You ___ (should/must) rest. → should (advice)
- Employees ___ (must/might) wear ID badges at all times. (obligation from rules) → must
- ___ (Can/Could) you please review this document? (formal request) → Could
- I'm not sure, but she ___ (will/might) be in the meeting. → might
- When I was young, I ___ (could/would) run 10 km easily. → could

### Exercise 2: Rewrite Formally
Rewrite using a more polite modal:
- "Send me the report." → "Could you please send me the report?"
- "I want to know the deadline." → "I would like to know the deadline."
- "Can I leave early?" → "May I leave early?" / "Would it be possible for me to leave early?"

### Exercise 3: Professional Email Practice
Write a 3-sentence email request using could, would, and may correctly.
""",
    },
    # ── LEVEL 3: ADVANCED ─────────────────────────────────────────────────────
    {
        "title": "Active vs Passive Voice: When and Why to Switch",
        "body": """Chapter: 13
Difficulty: Medium

Active voice is direct, clear, and energetic. Passive voice is formal, indirect, and often used to avoid assigning blame. Knowing when to use each is a mark of a sophisticated communicator. Over-using passive voice makes writing dull and hard to follow.

## What Is Active Voice?

In active voice, the SUBJECT performs the action.
Structure: Subject + Verb + Object
Example: She delivered the presentation. (She = doer)
Example: The team completed the project on time.
Example: The manager approved the budget.

## What Is Passive Voice?

In passive voice, the SUBJECT receives the action. The doer may or may not be mentioned.
Structure: Subject + is/am/are + past participle (by + agent — optional)
Example: The presentation was delivered by her.
Example: The project was completed on time.
Example: The budget has been approved.

## How to Form Passive Voice

### Present Simple Passive
Active: She writes the report.
Passive: The report is written by her.

### Past Simple Passive
Active: She wrote the report.
Passive: The report was written by her.

### Present Perfect Passive
Active: She has submitted the report.
Passive: The report has been submitted.

### Future Passive
Active: She will present the results.
Passive: The results will be presented.

### Passive with Modals
Active: They must complete the form.
Passive: The form must be completed.

## When to Use Passive Voice

### When the Doer Is Unknown
"The window was broken." (we don't know who)
"The document was stolen." (unknown thief)

### When the Doer Is Obvious or Unimportant
"The results were published in the journal." (it's obvious scientists published them)
"The law was passed in 2021." (focus on the law, not who passed it)

### Formal and Scientific Writing
"The data were collected over three months."
"The report was submitted for review."

### To Avoid Assigning Blame (Diplomatic Communication)
Active: "You made an error in the report." (sounds accusatory)
Passive: "An error was made in the report." (diplomatic, no blame)

Active: "We missed the deadline." (owns the mistake)
Passive: "The deadline was missed." (removes personal responsibility)

## When to PREFER Active Voice

For most professional communication, active voice is better:
- It is clearer and more direct
- It sounds more confident
- It is easier to read
- It is appropriate for presentations, emails, and conversations

❌ "The proposal was submitted by the team to the board on Friday."
✅ "The team submitted the proposal to the board on Friday."

## Common Errors

❌ "The work was being done by me all night." (overly passive)
✅ "I worked on it all night." (direct and clear)

❌ "Mistakes were made." (too vague — good for dodging blame but not for clarity)
✅ "The team made some errors that have since been corrected." (clear and honest)

## Grammar Patterns
Structure: [Active] Subject + verb + object
Example: She approved the budget.
Structure: [Passive Present] Object + is/are + past participle
Example: The budget is approved.
Structure: [Passive Past] Object + was/were + past participle
Example: The budget was approved.
Structure: [Passive Perfect] Object + has/have been + past participle
Example: The budget has been approved.

## Practice Exercises

### Exercise 1: Convert Active to Passive
- "The board approved the proposal." → "The proposal was approved by the board."
- "They have submitted all documents." → "All documents have been submitted."
- "She will review the report tomorrow." → "The report will be reviewed tomorrow."

### Exercise 2: Convert Passive to Active
- "The presentation was delivered by the marketing team." → "The marketing team delivered the presentation."
- "Errors were made in the calculation." → "The team made errors in the calculation."
- "The project has been completed." → "The team has completed the project."

### Exercise 3: Choose the Better Form
Decide whether active or passive is better in each context:
- A formal report: "The data ___ collected over 6 months." → were collected (passive: focus on data)
- An email to a colleague: "Could you ___ the document?" → review (active: direct request)
- Diplomatic feedback: "Some errors ___ in the analysis." → were found (passive: no blame)
""",
    },
    {
        "title": "Conditionals: All Four Types with Real Examples",
        "body": """Chapter: 14
Difficulty: Hard

Conditionals express conditions and results — "if this, then that." There are four main types, each for a different situation. Using the right conditional in interviews, negotiations, and presentations shows true fluency and precision.

## Overview of the Four Conditionals

### Zero Conditional — Facts and General Truths
Structure: If + Present Simple, + Present Simple
Use: Things that are always true; cause and effect
Example: If you heat water to 100°C, it boils.
Example: If I miss a deadline, my manager gets upset.
Example: If you practise consistently, your English improves.
Note: "When" can replace "if" in zero conditionals: "When you heat water, it boils."

### First Conditional — Real Future Possibilities
Structure: If + Present Simple, + will + base verb
Use: Situations that are possible or likely in the future
Example: If I prepare thoroughly, I will succeed in the interview.
Example: If she practises every day, her fluency will improve dramatically.
Example: If you send me the report, I will review it today.
Note: Do NOT use "will" in the if-clause: ❌ "If she will prepare..."

### Second Conditional — Hypothetical / Unreal Present
Structure: If + Past Simple, + would + base verb
Use: Imaginary situations; things unlikely to happen; advice using "if I were you"
Example: If I were the CEO, I would change the communication policy.
Example: If she had more confidence, she would apply for the promotion.
Example: If I were you, I would take this opportunity.
Note: ALWAYS use "were" (not "was") with "I" in formal second conditionals.

### Third Conditional — Past Regrets / Unrealised Possibilities
Structure: If + Past Perfect, + would have + past participle
Use: Imagining a different past; expressing regret or relief
Example: If I had practised more, I would have passed the exam.
Example: If she had applied earlier, she would have got the job.
Example: If they had listened to the feedback, they would have avoided the mistake.

## Mixed Conditionals (Advanced)

Sometimes the condition is in the past but the result is in the present (or vice versa).

Past condition → Present result:
Structure: If + Past Perfect, + would + base verb
Example: If I had studied engineering, I would be working in tech now.

Present condition → Past result:
Structure: If + Past Simple, + would have + past participle
Example: If she were more organised, she would have finished yesterday.

## Common Errors

❌ "If I will prepare, I will succeed." (no will in if-clause)
✅ "If I prepare, I will succeed."

❌ "If I was the manager, I would change this." (formal writing → use were)
✅ "If I were the manager, I would change this."

❌ "If she had studied, she would pass the exam." (mixing types)
✅ "If she had studied, she would have passed the exam." (3rd conditional)

❌ "If I would have known, I would have acted." (no would in if-clause)
✅ "If I had known, I would have acted."

## Grammar Patterns
Pattern: Zero → If + V1, V1
Example: If water boils, steam rises.
Pattern: First → If + V1, will + V1
Example: If I prepare, I will succeed.
Pattern: Second → If + V2, would + V1
Example: If I were confident, I would apply.
Pattern: Third → If + had + V3, would have + V3
Example: If I had applied, I would have got it.

## Conditionals in Professional Contexts

### In Interviews
First: "If I join your team, I will bring strong analytical skills."
Second: "If I were leading this project, I would prioritise stakeholder communication."
Third: "If I had had access to better tools, I would have delivered the project faster."

### In Negotiations
First: "If you can confirm the budget, we will begin immediately."
Second: "If the timeline were more flexible, we could include additional features."

### In Presentations
Zero: "If engagement drops, we adjust the strategy."
First: "If we implement this today, we will see results within a month."

## Practice Exercises

### Exercise 1: Identify the Conditional Type
- "If you leave now, you will catch the train." → First
- "If I had more time, I would study harder." → Second
- "If water freezes, it expands." → Zero
- "If she had known, she would have told us." → Third

### Exercise 2: Complete the Sentence
- If I ___ (be) the manager, I ___ (change) the process. → were / would change
- If you ___ (practise) daily, your speaking ___ (improve). → practise / will improve
- If he ___ (study) harder, he ___ (pass) the test. → had studied / would have passed

### Exercise 3: Interview Answer
Answer: "What would you do if you faced conflict in a team?"
Use the second conditional: "If I were faced with conflict, I would..."
""",
    },
    {
        "title": "Relative Clauses: Who, Which, That & Whose",
        "body": """Chapter: 15
Difficulty: Medium

Relative clauses add detail and precision to your sentences without starting a new sentence. They are the difference between choppy, basic English and smooth, sophisticated communication. This lesson covers defining and non-defining relative clauses.

## What Is a Relative Clause?

A relative clause is a dependent clause that gives more information about a noun. It is introduced by a relative pronoun.

Relative pronouns:
- who → for people
- which → for things
- that → for people or things (mainly defining clauses)
- whose → possession (people and things)
- whom → formal object pronoun for people
- where → for places
- when → for times

## Defining Relative Clauses (No Commas)

These clauses identify WHICH specific person/thing we mean. Without the clause, the sentence's meaning changes completely. NO commas are used.

Example: The candidate who impressed us most was hired.
(Without "who impressed us most" → "The candidate was hired" — which candidate? We don't know.)

Example: This is the report that I mentioned.
Example: The software which they use is outdated.
Example: She is the person whose idea changed everything.

### That vs Which in Defining Clauses
Both are often acceptable, but:
- "that" is more common in defining clauses (especially in American English)
- "which" is preferred in formal British English for things

✅ "The report that I submitted was approved."
✅ "The report which I submitted was approved." (more formal)

## Non-Defining Relative Clauses (With Commas)

These clauses add EXTRA information about something already clearly identified. The sentence still makes sense without them. COMMAS are used.

Example: Gagandeep, who leads the team, has improved significantly.
(Gagandeep is already identified. "Who leads the team" is extra info.)

Example: The new software, which was launched last month, has improved efficiency.
Example: Delhi, where I grew up, is a vibrant city.

IMPORTANT: Never use "that" in a non-defining clause.

❌ "Gagandeep, that leads the team, is brilliant."
✅ "Gagandeep, who leads the team, is brilliant."

## Whom — Formal Object Pronoun

"Whom" is used when the relative pronoun is the OBJECT of the clause (not the subject). Very formal; in conversation, "who" is usually acceptable.

- The candidate whom we interviewed was excellent. (we interviewed him → object)
- The manager to whom I reported was very supportive.

Test: Replace with "he/she" → use WHO. Replace with "him/her" → use WHOM.
- "We interviewed him" → whom
- "He interviewed us" → who

## Reducing Relative Clauses (Advanced)

You can often omit the relative pronoun and verb:

Active with subject pronoun (cannot reduce):
- "The person who called me is here." (cannot remove "who")

Active with object pronoun (can reduce):
- "The report that I submitted was approved." → "The report I submitted was approved."

Passive (reduce to participle):
- "The report which was approved yesterday..." → "The report approved yesterday..."

## Grammar Patterns
Pattern: Noun + who + clause (person, subject)
Example: The manager who leads the team is brilliant.
Pattern: Noun + which/that + clause (thing)
Example: The software which/that we use is expensive.
Pattern: Noun, + who/which + clause, + rest (non-defining)
Example: She, who has years of experience, leads the team.
Pattern: Noun + whose + noun + clause (possession)
Example: The candidate whose portfolio impressed us was hired.

## Practice Exercises

### Exercise 1: Fill in Who, Which, That, or Whose
- The employee ___ submitted the report first will receive a bonus. → who / that
- This is the software ___ we have been using for three years. → that / which
- The CEO, ___ vision transformed the company, retired last year. → whose
- This is the office ___ I worked in during my first job. → where / that

### Exercise 2: Add a Relative Clause
Expand each sentence with a relative clause:
- "The candidate was hired." → "The candidate who impressed us most was hired."
- "The software was updated." → "The software that we use was updated yesterday."
- "She leads the team." (add info about her) → "She, who has 10 years of experience, leads the team."

### Exercise 3: Defining or Non-Defining?
Add commas where needed:
- "The report which I sent yesterday has been approved." (defining — no commas needed)
- "This report which took three weeks to prepare has been approved." (non-defining — add commas)
""",
    },
    {
        "title": "Modifiers: Avoiding Dangling and Misplaced Modifiers",
        "body": """Chapter: 16
Difficulty: Hard

Misplaced modifiers are one of the most common — and often funniest — grammar errors. They occur when a describing phrase is placed too far from what it describes, creating unintended and absurd meanings. Spotting and fixing them is a sign of advanced language awareness.

## What Is a Modifier?

A modifier is a word, phrase, or clause that describes or limits another element in the sentence. Modifiers must be placed as close as possible to the word they modify.

Simple modifiers:
- "She is a very confident speaker." (very modifies confident)
- "He quickly completed the task." (quickly modifies completed)

## Misplaced Modifiers

A misplaced modifier is placed too far from the word it describes, often attaching to the wrong noun.

❌ "She almost drove her children to school every day." (almost modifies drove — meaning she nearly drove but didn't each day?)
✅ "She drove her children to almost every school day." (or restructure: "She drove her children to school on almost every school day.")

❌ "The manager only speaks to clients on Fridays."
Could mean: she only speaks (and does nothing else) to clients, OR she only does it on Fridays.
✅ "The manager speaks to clients only on Fridays." (if Friday is the restriction)

❌ "I saw an elephant on the way to work in my car."
Did the elephant drive a car?
✅ "On the way to work, I saw an elephant from my car."

## Dangling Modifiers

A dangling modifier is a phrase or clause that doesn't logically connect to any word in the sentence. It "dangles" — it needs an anchor that is missing.

❌ "Having practised all morning, the presentation went smoothly."
The modifier "Having practised all morning" needs a subject — but "the presentation" cannot practise.
✅ "Having practised all morning, she delivered a smooth presentation."

❌ "Walking down the road, the trees looked beautiful."
Trees cannot walk.
✅ "Walking down the road, I noticed that the trees looked beautiful."

❌ "To improve your speaking, daily practice is essential."
"To improve your speaking" needs YOU — but "daily practice" is the subject.
✅ "To improve your speaking, you need daily practice."

❌ "After completing the report, the results were submitted."
The results did not complete the report.
✅ "After completing the report, she submitted the results."

## Types of Dangling Modifiers

### Participial Phrase (most common)
❌ "Having read the proposal, the budget seemed reasonable."
✅ "Having read the proposal, she found the budget reasonable."

### Infinitive Phrase
❌ "To become fluent, consistent practice must be maintained."
✅ "To become fluent, you must maintain consistent practice."

### Prepositional Phrase
❌ "As a confident speaker, the audience was immediately engaged."
✅ "As a confident speaker, she immediately engaged the audience."

## How to Fix Dangling Modifiers

Step 1: Find the modifier (usually at the start of the sentence).
Step 2: Ask: who is performing the action in the modifier?
Step 3: Make that person/thing the subject of the main clause.

## Only, Even, Just, Nearly — Position Matters

These words must go immediately before the word they modify:

❌ "She only eats vegetables on weekdays." (ambiguous)
✅ "She eats only vegetables on weekdays." (she eats nothing else)
✅ "She eats vegetables only on weekdays." (not on weekends)

❌ "Even I can do this." vs "I can even do this." (different meanings!)

## Grammar Patterns
Pattern: [Modifier phrase], + [correct subject] + verb
Example: Having practised for weeks, she delivered brilliantly.
Pattern: [Adjective] + noun (modifier close to noun)
Example: She gave a clear, concise explanation. (not: clear explanation that was concise)

## Practice Exercises

### Exercise 1: Identify the Error
Is it a dangling modifier (DM) or misplaced modifier (MM)?
- "Running through the park, my keys fell out of my pocket." → DM (keys can't run)
- "She nearly earned a million rupees." (intended: she earned nearly a million) → MM
- "To pass the exam, hard work is required." → DM (hard work does not take the exam)

### Exercise 2: Fix These Sentences
- ❌ "Having completed the course, the certificate was issued." → ✅
- ❌ "Walking into the office, the meeting had already started." → ✅
- ❌ "To improve communication, daily practice must be done." → ✅
- ❌ "She almost made five mistakes in every paragraph." → ✅

### Exercise 3: Write Three Sentences
Write three sentences using introductory participial phrases correctly:
- "Having [done something], [you/he/she] [result]."
- "After [completing something], [correct subject] [action]."
""",
    },
    # ── LEVEL 4: PROFESSIONAL MASTERY ────────────────────────────────────────
    {
        "title": "Parallelism: The Secret of Powerful, Balanced Communication",
        "body": """Chapter: 17
Difficulty: Hard

Parallelism is one of the most powerful tools in professional communication. It creates rhythm, clarity, and balance. Great speeches, persuasive emails, and memorable presentations all use parallelism deliberately. This lesson teaches you to use it correctly.

## What Is Parallelism?

Parallelism means using the same grammatical form for elements in a list or comparison. When items in a series are grammatically parallel, they are easier to process and more memorable.

## Basic Parallelism: Lists

All items in a list must have the same grammatical form.

### Nouns
✅ "The three keys to success are preparation, practice, and persistence."
❌ "The three keys to success are preparation, practising, and to persist."

### Verbs (same form)
✅ "She plans, she prepares, and she executes."
✅ "She came, she saw, she conquered."
❌ "She plans, prepares, and is executing."

### Infinitives
✅ "He wants to speak clearly, to write professionally, and to lead confidently."
❌ "He wants to speak clearly, writing professionally, and leadership."

### Adjectives
✅ "The report was thorough, accurate, and well-structured."
❌ "The report was thorough, accurate, and structured with care."

### Gerunds (-ing forms)
✅ "She enjoys speaking, writing, and presenting."
❌ "She enjoys speaking, to write, and presentation."

## Parallelism with Conjunctions

### And, But, Or
The elements on BOTH sides of the conjunction must match.

❌ "She is intelligent, experienced, and works hard."
✅ "She is intelligent, experienced, and hardworking." (all adjectives)

❌ "He wants a promotion and earning more money."
✅ "He wants a promotion and a pay rise." (both nouns)
✅ "He wants to get promoted and to earn more money." (both infinitives)

### Correlative Conjunctions (Both … and, Either … or, Neither … nor, Not only … but also)
Both parts must be parallel.

❌ "She is not only intelligent but also works hard."
✅ "She is not only intelligent but also hardworking."

❌ "Either you submit the report or telling me why not."
✅ "Either you submit the report or you tell me why not."

❌ "Both speaking clearly and to listen well are important."
✅ "Both speaking clearly and listening well are important."

## Parallelism in Professional Writing

### CV / Resume Bullet Points
All bullets must start with the same grammatical form — usually past tense verbs (for past roles) or present tense verbs (for current roles).

❌ "Led a team of 10 engineers. Responsible for project delivery. I also managed budgets."
✅ "Led a team of 10 engineers. Delivered complex projects on time. Managed annual budgets of ₹50L."

### Email Lists
❌ "Please ensure: 1. The report is submitted. 2. Sending the invoice. 3. To call the client."
✅ "Please ensure: 1. You submit the report. 2. You send the invoice. 3. You call the client."

### Presentations
"Our strategy has three pillars: clarity, consistency, and commitment."
"We plan, we measure, and we improve."

## Famous Examples of Parallelism
- "I came, I saw, I conquered." — Julius Caesar
- "We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields." — Churchill
- "Ask not what your country can do for you — ask what you can do for your country." — JFK

## Practice Exercises

### Exercise 1: Fix the Parallelism
- ❌ "She likes swimming, to read, and plays tennis." → ✅
- ❌ "The goal is improving communication, building confidence, and to practise daily." → ✅
- ❌ "He is not only smart but also works efficiently." → ✅
- ❌ "Either you apologise or leaving the meeting." → ✅

### Exercise 2: Complete with Parallel Structure
- "The three qualities I bring are ___, ___, and ___." (use three adjectives)
- "In my career, I have ___, ___, and ___." (use three past tense verbs)
- "Both ___ and ___ are essential for success." (use two -ing forms)

### Exercise 3: Rewrite for Parallelism
Rewrite this poorly structured list as a parallel bullet-point list:
"My strengths include: good at communication, I can work in teams, and leadership ability."
""",
    },
    {
        "title": "Emphasis Structures: Cleft Sentences & Advanced Patterns",
        "body": """Chapter: 18
Difficulty: Hard

Advanced communicators know how to highlight the most important part of their message using emphasis structures. These constructions are common in formal speeches, presentations, and persuasive writing — and they make you sound notably fluent.

## What Is an Emphasis Structure?

An emphasis structure reorganises a sentence to put extra focus on a specific element. In speech, you might use stress (saying a word louder). In writing and formal speech, you use grammatical structures.

## It-Cleft Sentences

An it-cleft uses "It is/was + [focus] + that/who + rest of sentence" to highlight one element.

### Basic Form
Structure: It is/was + [focus element] + that/who + [rest of clause]

Normal: "She solved the problem."
Cleft (emphasising she): "It was she who solved the problem."
Cleft (emphasising the problem): "It was the problem that she solved."
Cleft (emphasising when): "It was last Tuesday that she solved the problem."

More examples:
- "It is communication that separates good leaders from great ones."
- "It was his clarity of thought that impressed the panel."
- "It is consistent practice that leads to fluency, not talent alone."

### Why Use It-Clefts?
- To highlight a key point in a presentation
- To correct a misunderstanding: "It was John who sent the email, not Sarah."
- To add weight and emphasis to a statement

## What-Cleft Sentences

A what-cleft uses "What + clause + is/was + focus element."

Structure: What + [subject + verb] + is/was + [noun phrase / infinitive]

Examples:
- "What matters most is clarity." (instead of "Clarity matters most.")
- "What she needs is more practice." (instead of "She needs more practice.")
- "What impressed the panel was her preparation."
- "What I value in a candidate is communication skills."

### Variations
- "What I find remarkable is..." (in interviews and presentations)
- "What really made the difference was..." (in storytelling)
- "What you need to understand is..." (in explanations)

## Fronting (Topicalisation)

Moving an element to the front of the sentence for emphasis.

Normal: "I have never seen such commitment."
Fronted: "Such commitment I have never seen." (very formal/literary)

Normal: "She rarely fails to impress."
Fronted: "Rarely does she fail to impress." (inversion with adverb)

### Negative Inversion (Advanced Formal)
When a negative or limiting adverb is fronted, the subject and auxiliary invert.
- "Never have I seen such dedication."
- "Rarely does she make an error."
- "Not only does she speak three languages, but she also writes professionally."
- "Only then did I realise the importance of preparation."
- "No sooner had she started speaking than the audience was captivated."

## Pseudo-Clefts with "The Thing Is"

Informal emphasis structures:
- "The thing is, confidence comes from preparation."
- "The key point is that practice makes perfect."
- "The problem is that nobody communicated clearly."

## Concessive Structures for Balance

Show you can see both sides while emphasising your main point.
- "While some may argue X, the evidence clearly shows Y."
- "Although the task was challenging, the team delivered exceptional results."
- "Despite the setbacks, she maintained her focus and succeeded."

## Grammar Patterns
Pattern: It is/was + [noun/pronoun] + that/who + clause
Example: It is clarity that makes communication effective.
Pattern: What + subject + verb + is/was + noun phrase
Example: What matters is consistent practice.
Pattern: Never/Rarely/Only then + auxiliary + subject + verb
Example: Never have I seen such determination.

## Practice Exercises

### Exercise 1: Rewrite Using It-Cleft
- "Grammar matters most in professional writing." → "It is grammar that matters most in professional writing."
- "She impressed the panel with her confidence." (emphasise confidence) → "It was her confidence that impressed the panel."
- "The training made the difference." → "It was the training that made the difference."

### Exercise 2: Rewrite Using What-Cleft
- "Consistent practice is what you need." → "What you need is consistent practice."
- "Her preparation impressed me." → "What impressed me was her preparation."
- "Clarity matters most." → "What matters most is clarity."

### Exercise 3: Presentation Opening
Write a 4-sentence presentation opening using:
- One it-cleft
- One what-cleft
- One concessive structure (although/while)
- One normal sentence

Example: "What we are going to discuss today is communication excellence. It is not talent, but practice, that creates great speakers. While many believe confidence is innate, the evidence shows it can be developed. Let me explain how."
""",
    },
    {
        "title": "Gerunds and Infinitives: When to Use Which",
        "body": """Chapter: 19
Difficulty: Hard

One of the most consistent sources of confusion for advanced learners is whether to use a gerund (-ing form) or an infinitive (to + verb) after certain verbs, adjectives, and prepositions. This lesson gives you clear rules and essential lists to memorise.

## What Are Gerunds and Infinitives?

A gerund is the -ing form of a verb used as a noun.
- Speaking clearly is a skill. (gerund as subject)
- She enjoys practising every morning. (gerund as object)
- Before leaving, check your notes. (gerund after preposition)

An infinitive is "to + base verb" used as a noun, adjective, or adverb.
- To succeed, you must practise consistently. (infinitive of purpose)
- She wants to improve her grammar. (infinitive as object)
- This is the best way to learn. (infinitive as adjective)

## Verbs Followed by GERUND Only

These verbs must be followed by an -ing form:

Enjoy, avoid, consider, practise, suggest, recommend, keep, finish, admit, deny, risk, miss, involve, delay, mind, can't help, give up, look forward to, be used to, get used to

- She enjoys speaking in public.
- I suggest revising the report before submission.
- They avoided making any promises.
- He admitted making an error.
- I look forward to hearing from you. (very common in emails)
- She is used to presenting to large audiences.
- Give up using filler words — it takes deliberate practice.

## Verbs Followed by INFINITIVE Only

Want, decide, plan, hope, expect, need, choose, offer, refuse, agree, manage, fail, tend, threaten, promise, appear, seem, afford, learn, prepare, intend

- She decided to apply for the position.
- I hope to improve my presentation skills.
- He managed to complete it on time.
- They agreed to review the proposal.
- She failed to meet the deadline.
- I can't afford to make another mistake.

## Verbs That Can Take EITHER (with different meanings)

### Remember
- Remember + gerund → memory of a past action: "I remember giving the speech." (I gave it and I remember it)
- Remember + infinitive → duty/task: "Remember to practise before the interview." (don't forget to do it)

### Forget
- Forget + gerund → past experience: "I'll never forget delivering my first presentation."
- Forget + infinitive → task: "Don't forget to send the report."

### Stop
- Stop + gerund → cease the activity: "She stopped using filler words." (she no longer uses them)
- Stop + infinitive → purpose: "She stopped to check her notes." (she stopped [walking] in order to check)

### Try
- Try + gerund → experiment: "Try practising in front of a mirror." (experiment to see if it helps)
- Try + infinitive → effort/attempt: "She tried to speak clearly but was nervous." (she made an attempt)

### Mean
- Mean + gerund → involve: "Improving fluency means practising daily."
- Mean + infinitive → intend: "I meant to call you earlier."

## After Prepositions: Always Use Gerund

After all prepositions, use a gerund (NEVER infinitive):
- before leaving, after arriving, without practising, instead of worrying, by speaking, for improving, about presenting, in addition to working, on completing

❌ "She improved by to practise daily."
✅ "She improved by practising daily."

❌ "Without to prepare, success is unlikely."
✅ "Without preparing, success is unlikely."

❌ "She is responsible for to manage the team."
✅ "She is responsible for managing the team."

## Grammar Patterns
Pattern: Gerund as subject
Example: Practising daily is essential. Speaking clearly builds trust.
Pattern: Verb + gerund (enjoy, avoid, consider...)
Example: She enjoys presenting. I suggest revising it.
Pattern: Verb + infinitive (want, decide, hope...)
Example: She wants to improve. He decided to apply.
Pattern: Preposition + gerund
Example: By practising. Without preparing. Before leaving.

## Practice Exercises

### Exercise 1: Gerund or Infinitive?
- She suggested ___ (practise/to practise/practising) before the interview. → practising
- I decided ___ (apply/to apply/applying) for the course. → to apply
- He admitted ___ (make/to make/making) several errors. → making
- Don't forget ___ (send/to send/sending) the confirmation email. → to send
- Before ___ (leave/to leave/leaving) the meeting, summarise key points. → leaving

### Exercise 2: Which Meaning?
Explain the difference in meaning:
- "She stopped to check her notes." vs "She stopped checking her notes."
- "I remember meeting the CEO." vs "Remember to meet the CEO at 3 PM."

### Exercise 3: Complete These Professional Phrases
- "I look forward to ___ from you." → hearing
- "She is responsible for ___ the team." → managing
- "Instead of ___, try ___." (your choice of verbs)
- "By ___ daily, she improved her fluency." → practising
""",
    },
    {
        "title": "Common Spoken Grammar Errors: Fix Mode",
        "body": """Chapter: 20
Difficulty: Medium

This lesson is a targeted correction session for the most common grammar errors in Indian English speech and writing. These errors appear repeatedly in interviews, presentations, and professional settings. Knowing them — and fixing them — will immediately upgrade your communication.

## Category 1: Redundancy (Saying the Same Thing Twice)

Redundancy means using unnecessary words that repeat the same idea.

❌ "Return back" → ✅ "Return" (return already means to come back)
❌ "Revert back" → ✅ "Revert" or better: "Please respond/reply"
❌ "Discuss about" → ✅ "Discuss" (discuss = talk about; "about" is redundant)
❌ "Today morning" → ✅ "This morning"
❌ "Today evening" → ✅ "This evening"
❌ "Cope up with" → ✅ "Cope with"
❌ "Prepone" → ✅ "Move forward" or "reschedule to an earlier time" (prepone is not standard English)
❌ "PIN number" → ✅ "PIN" (PIN = Personal Identification Number)
❌ "ATM machine" → ✅ "ATM" (ATM = Automated Teller Machine)
❌ "Free gift" → ✅ "Gift" (gifts are always free)

## Category 2: Wrong Prepositions

❌ "Married with" → ✅ "Married to"
❌ "Discuss about" → ✅ "Discuss"
❌ "Reach to" → ✅ "Reach" / "Arrive at"
❌ "Good in English" → ✅ "Good at English"
❌ "Belong with" → ✅ "Belong to"
❌ "Differ with" (opinion) → ✅ "Differ from" / "Disagree with"
❌ "Advantage of speaking" → ✅ "Advantage of speaking" (this is actually correct: one advantage; plural = advantages of)
❌ "According to me" → ✅ "In my opinion" / "I think" / "I believe" (according to = citing someone else's authority)

## Category 3: Introducing Yourself (Most Common Context)

❌ "Myself Gagandeep."
✅ "I am Gagandeep." / "My name is Gagandeep."

❌ "Myself am from Delhi."
✅ "I am from Delhi."

❌ "Me and my team will handle it."
✅ "My team and I will handle it."

❌ "Our team consists of 5 members including me."
✅ "Our team consists of 5 members including me." (actually correct — "me" after "including" is fine)

The rule: "my team and I" (subject position) vs "my team and me" (object position)
✅ "My team and I will present." (subject)
✅ "The client thanked my team and me." (object)

## Category 4: Double Negatives

❌ "I don't have nothing to say."
✅ "I don't have anything to say." / "I have nothing to say."

❌ "She didn't say nothing."
✅ "She didn't say anything." / "She said nothing."

❌ "He can't barely speak."
✅ "He can barely speak."

## Category 5: Tense Mixing

❌ "Yesterday, I go to the office and I meet the CEO."
✅ "Yesterday, I went to the office and met the CEO."

❌ "She has called me yesterday."
✅ "She called me yesterday."

❌ "I am working here from 2020."
✅ "I have been working here since 2020."

## Category 6: Incorrect Question Formation

❌ "Where you are going?" (statement order, not question order)
✅ "Where are you going?"

❌ "What is your good name?" (Indian formal phrase — not standard English)
✅ "What is your name?" / "May I know your name?"

❌ "How you are?"
✅ "How are you?"

❌ "You are coming tomorrow?" (rising intonation only — acceptable in spoken English but grammatically informal)
✅ "Are you coming tomorrow?" (formal question inversion)

## Category 7: The "Itself" / "As Such" Overuse

These are common fillers in Indian corporate English.

❌ "The project itself will speak for itself itself." (overused)
✅ "The project speaks for itself." (once is fine)

❌ "As such, I feel as such that…" (meaningless filler)
✅ "Therefore, I believe that…" / "As a result, I think…"

## Practice Exercises

### Exercise 1: Correct Every Error
- ❌ "Please revert back to me at the earliest." → ✅
- ❌ "Myself handling this project since last year." → ✅
- ❌ "She don't know nothing about it." → ✅
- ❌ "Today morning I had a call with the client." → ✅
- ❌ "He reached to the meeting five minutes late." → ✅
- ❌ "According to me, this approach is better." → ✅
- ❌ "Where you are going after this?" → ✅

### Exercise 2: Corporate Email Correction
Correct this professional email:
"Respected Sir, Myself is writing in context of the job vacancy. Myself have good communication skills and I am good in English since 5 years. Please revert back at the earliest. Thanking you."

### Exercise 3: Recording Practice
Record yourself making a 60-second professional introduction. Check for:
- No "myself" as subject/object
- Correct tense consistency
- No redundant phrases (revert back, return back, discuss about)
- Correct articles (a, an, the)
""",
    },
    {
        "title": "Formal vs Informal Grammar: Know Your Register",
        "body": """Chapter: 21
Difficulty: Medium

Every piece of communication has a register — a level of formality. Using informal language in a formal context (or vice versa) creates a negative impression. This lesson teaches you to switch registers confidently and professionally.

## What Is Register?

Register is the style of language you use depending on:
- Who you are speaking/writing to
- The context (interview, social media, email, meeting)
- Your relationship with the person

There are three main levels:
- Formal: interviews, presentations, business reports, official emails
- Semi-formal: workplace conversations, professional emails to colleagues
- Informal: friends, family, social media, casual conversation

## Formal vs Informal Vocabulary

### Informal → Formal Equivalents
- wanna → want to
- gonna → going to
- gotta → have to / must
- kids → children
- boss → manager / supervisor / director
- loads of → a great deal of / a large amount of
- a lot of → numerous / a significant number of
- get → obtain / receive / acquire
- look into → investigate / examine
- find out → determine / ascertain / discover
- start → commence / initiate / begin
- end / finish → conclude / complete
- but → however / nevertheless / nonetheless
- so → therefore / consequently / as a result
- also → furthermore / in addition / moreover
- BTW → I would also like to mention
- ASAP → at the earliest opportunity / by [specific date]

## Formal Grammar Rules

### 1. Avoid Contractions
Formal: "I will not be able to attend." / "They have not submitted the report."
Informal: "I won't be able to make it." / "They haven't submitted it."

### 2. Use Full Verb Forms
Formal: "I would like to request..."
Informal: "I'd like to ask..."

### 3. Avoid Phrasal Verbs (In Formal Writing)
Formal: "The meeting was postponed." (not "put off")
Formal: "The proposal was rejected." (not "turned down")
Formal: "Please submit the report." (not "hand in")
Formal: "The decision was announced." (not "brought up")
Formal: "Investigate the issue." (not "look into it")

Common phrasal verb → formal equivalent pairs:
- put off → postpone
- carry out → conduct / perform / execute
- come up with → develop / propose / devise
- go over → review / examine
- point out → indicate / highlight
- bring up → raise / mention / introduce
- find out → discover / determine
- make up for → compensate for

### 4. Use Passive Voice in Formal Writing
Formal: "The report was submitted on Monday."
Informal: "I submitted the report on Monday."

### 5. Avoid Colloquialisms
Formal: "This is a challenging situation."
Informal: "This is a tough spot." / "This is tricky."

## Formal Email Phrases

### Opening
Formal: "I am writing with reference to your email dated..."
Formal: "I am writing to enquire about..."
Formal: "Further to our conversation on [date]..."
Semi-formal: "I hope this email finds you well."

### Making Requests
Formal: "I would be grateful if you could..."
Formal: "Could you please..."
Formal: "I would appreciate it if..."

### Closing
Formal: "Please do not hesitate to contact me should you require further information."
Formal: "I look forward to hearing from you at your earliest convenience."
Formal: "Yours sincerely," (if you know the name) / "Yours faithfully," (if you don't)
Semi-formal: "Kind regards," / "Best regards,"
Informal: "Cheers," / "Thanks,"

## Grammar Patterns
Pattern: Formal → I would like to + verb
Example: I would like to request a meeting.
Pattern: Informal → I want to / I'd like to + verb
Example: I'd like to meet up.
Pattern: Formal → However, + sentence (comma after however)
Example: However, the results were inconclusive.
Pattern: Informal → but + sentence (but at start is casual)
Example: But it didn't work.

## Practice Exercises

### Exercise 1: Make It Formal
Rewrite each sentence formally:
- "Wanna catch up tomorrow?" → "Would you be available to meet tomorrow?"
- "I gotta send this ASAP." → "I need to send this at the earliest opportunity."
- "Can you look into this?" → "Could you please investigate this matter?"
- "I'm gonna put off the meeting." → "I am going to postpone the meeting."
- "BTW, the report's ready." → "I would also like to inform you that the report is ready."

### Exercise 2: Register Match
Choose the correct register for each situation:
- An email to the CEO requesting a meeting: (formal/informal)
- A WhatsApp message to a friend about plans: (formal/informal)
- A presentation to a client: (formal/semi-formal)
- A quick email to a colleague you know well: (semi-formal/informal)

### Exercise 3: Rewrite This Email Formally
"Hi, just checking — can you send me that report? I kinda need it ASAP. BTW, let me know if you need anything from my end. Thanks."
""",
    },
    {
        "title": "Grammar for Job Interviews: Every Tense You Need",
        "body": """Chapter: 22
Difficulty: Medium

Job interviews test your communication under pressure. The grammar choices you make while answering questions reveal your language level. This lesson prepares you to use the right grammar structures for every common interview question type.

## The Core Tenses for Interviews

### Present Simple → Who You Are Now
Use for: your current role, general facts about yourself, habitual actions
- "I work as a software engineer at TCS."
- "I manage a team of eight developers."
- "I specialise in data analytics and machine learning."
- "I believe in clear, honest communication."

### Present Perfect → Your Achievements (Unspecified Past)
Use for: achievements without a specific time, your experience
- "I have led three major projects from conception to delivery."
- "I have worked in the tech industry for seven years."
- "I have developed expertise in cloud infrastructure."
- "I have never missed a client deadline in my career."

### Past Simple → Specific Past Experiences (STAR Method)
Use for: specific stories, challenges, achievements with a clear timeline
- "In my last role, I led a team during a critical system migration."
- "When I joined the project, the team was behind schedule."
- "I reorganised the workflow and introduced daily standups."
- "As a result, we delivered the project two weeks ahead of deadline."

### Future Tenses → Your Plans and Goals
Use for: "Where do you see yourself in 5 years?" / career goals
- "I am planning to develop my leadership skills further." (going to — plan)
- "I hope to take on more strategic responsibilities." (will/hope to)
- "I intend to pursue certification in project management." (intend + infinitive)

### Conditional (Second) → Hypothetical Situations
Use for: "What would you do if..." questions
- "If I were faced with that situation, I would first assess..."
- "If I were leading the team, I would establish clear communication channels."
- "If the project scope changed, I would immediately communicate with stakeholders."

## The STAR Method Grammar Framework

STAR = Situation → Task → Action → Result

### Situation (Past Simple or Past Continuous)
"When I was working at XYZ Company, we faced a critical deadline."
"At the time, the team was struggling with communication gaps."

### Task (Past Simple)
"My responsibility was to coordinate between three departments."
"I needed to deliver the project within two weeks with limited resources."

### Action (Past Simple — Action Verbs)
"I organised a cross-functional meeting with all stakeholders."
"I created a detailed timeline and assigned clear responsibilities."
"I communicated the new plan to each team and monitored progress daily."

### Result (Past Simple + Numbers if Possible)
"As a result, we delivered the project on time and under budget."
"The client was extremely satisfied and extended the contract."
"Team productivity improved by 30% over the following quarter."

## Common Interview Grammar Mistakes

❌ "I am working here since 3 years."
✅ "I have been working here for 3 years."

❌ "In my previous company, I have handled a team."
✅ "In my previous company, I handled a team." (specific past → Past Simple)

❌ "I am having experience in marketing."
✅ "I have experience in marketing." (state verb — no continuous)

❌ "If I will get this job, I will work very hard."
✅ "If I get this job, I will work very hard." (no will in if-clause)

❌ "Myself Gagandeep. I am from Delhi."
✅ "I am Gagandeep. I am from Delhi." / "My name is Gagandeep."

## Power Phrases for Interviews
- "Throughout my career, I have consistently..." (Present Perfect + adverb)
- "One of my most significant achievements was..." (Past Simple)
- "I am particularly passionate about..." (Present Simple)
- "Going forward, I plan to..." (Future — going to)
- "If I were to face that situation, I would..." (Second Conditional)
- "What I believe sets me apart is..." (What-cleft for emphasis)
- "It is my communication skills that I consider my greatest strength." (It-cleft)

## Practice Exercises

### Exercise 1: STAR Tense Check
Write a STAR story for: "Tell me about a time you solved a problem."
Use: Past Simple for S/T/A, Past Simple for R with numbers.

### Exercise 2: Answer Grammatically
Correct the grammar while keeping the meaning:
- "I am working in sales from 5 years and I have good in dealing with clients."
- "In my last job, I have managed a project that have a budget of 10 lakhs."
- "If I will join your company, I will give my 100%."

### Exercise 3: Answer These Questions
Write grammatically correct, 3-sentence answers:
- "Tell me about yourself." (Present Simple + Present Perfect)
- "What is your greatest achievement?" (Past Simple STAR)
- "Where do you see yourself in 5 years?" (Future forms)
""",
    },
    {
        "title": "Advanced Error Correction: 50 Mistakes and Fixes",
        "body": """Chapter: 23
Difficulty: Hard

This lesson is a concentrated error correction masterclass. Work through every sentence, identify the error type, and understand WHY it is wrong. This is the fastest way to eliminate persistent grammar mistakes from your speech and writing.

## Section 1: Verb Form Errors

❌ "She is not knowing the answer." → ✅ "She does not know the answer." (state verb)
❌ "I am believing you." → ✅ "I believe you." (state verb)
❌ "They have went to the office." → ✅ "They have gone to the office." (past participle)
❌ "She has came back." → ✅ "She has come back." (past participle)
❌ "He runned very fast." → ✅ "He ran very fast." (irregular past)
❌ "She speaked well." → ✅ "She spoke well." (irregular past)
❌ "I have did all the work." → ✅ "I have done all the work." (past participle)

## Section 2: Tense Confusion

❌ "I have met him yesterday." → ✅ "I met him yesterday." (specific past → Past Simple)
❌ "She is working here since 2019." → ✅ "She has been working here since 2019."
❌ "Yesterday, I have gone to Delhi." → ✅ "Yesterday, I went to Delhi."
❌ "I know her since childhood." → ✅ "I have known her since childhood."
❌ "If he will come, I will leave." → ✅ "If he comes, I will leave."
❌ "When she will arrive, call me." → ✅ "When she arrives, call me."

## Section 3: Article Errors

❌ "She is the honest person." → ✅ "She is an honest person."
❌ "He has a MBA degree." → ✅ "He has an MBA degree."
❌ "The communication is important." → ✅ "Communication is important." (abstract concept)
❌ "I like the cricket." → ✅ "I like cricket." (sports in general)
❌ "She is best student in class." → ✅ "She is the best student in class."
❌ "He is working in an hospital." → ✅ "He is working in a hospital." (h is not silent)

## Section 4: Pronoun Errors

❌ "Myself Priya. Myself am from Mumbai." → ✅ "I am Priya. I am from Mumbai."
❌ "Me and him went to the meeting." → ✅ "He and I went to the meeting."
❌ "Between you and I, it's wrong." → ✅ "Between you and me, it's wrong."
❌ "Please contact myself for help." → ✅ "Please contact me for help."
❌ "The team and me will present." → ✅ "The team and I will present."

## Section 5: Preposition Errors

❌ "Let's discuss about this." → ✅ "Let's discuss this."
❌ "She is married with a doctor." → ✅ "She is married to a doctor."
❌ "Please return back the form." → ✅ "Please return the form."
❌ "He reached to the station." → ✅ "He reached the station."
❌ "I am good in English." → ✅ "I am good at English."
❌ "She is capable to do it." → ✅ "She is capable of doing it."
❌ "He cope up with pressure." → ✅ "He copes with pressure."

## Section 6: Subject-Verb Agreement

❌ "Everyone are ready." → ✅ "Everyone is ready."
❌ "The news are shocking." → ✅ "The news is shocking."
❌ "Each of the reports are ready." → ✅ "Each of the reports is ready."
❌ "The team are working hard." → ✅ "The team is working hard." (AmE)
❌ "Mathematics are difficult." → ✅ "Mathematics is difficult."
❌ "There is many people waiting." → ✅ "There are many people waiting."

## Section 7: Conditional Errors

❌ "If I will study hard, I will pass." → ✅ "If I study hard, I will pass."
❌ "If I was the CEO, I will change this." → ✅ "If I were the CEO, I would change this."
❌ "If she would have come, we would had celebrated." → ✅ "If she had come, we would have celebrated."
❌ "I would had gone if you had asked." → ✅ "I would have gone if you had asked."

## Section 8: Modal Errors

❌ "She can to speak French." → ✅ "She can speak French."
❌ "You must to attend the meeting." → ✅ "You must attend the meeting."
❌ "He mights be late." → ✅ "He might be late."
❌ "She should to practise more." → ✅ "She should practise more."
❌ "They don't can attend." → ✅ "They cannot attend." / "They can't attend."

## Section 9: Parallelism Errors

❌ "She likes speaking, to write, and plays tennis." → ✅ "She likes speaking, writing, and playing tennis."
❌ "He is intelligent, experienced, and works hard." → ✅ "He is intelligent, experienced, and hardworking."
❌ "Not only she speaks well but also writes." → ✅ "Not only does she speak well, but she also writes well."

## Section 10: Gerund / Infinitive Errors

❌ "She enjoys to swim every morning." → ✅ "She enjoys swimming every morning."
❌ "I suggest to review the document." → ✅ "I suggest reviewing the document."
❌ "He decided practising every day." → ✅ "He decided to practise every day."
❌ "Without to prepare, success is unlikely." → ✅ "Without preparing, success is unlikely."

## Practice Exercises

### Exercise 1: Speed Round
Set a 3-minute timer. Correct as many as you can:
- "She is not knowing the topic."
- "I have met him yesterday."
- "Myself is handling this."
- "If I will go, I will call."
- "She can to lead the team."
- "He enjoys to work late."
- "The team are excellent."

### Exercise 2: Dictation Correction
Read this paragraph aloud, then correct every error:
"Myself Rahul. Me and my team have went to Delhi yesterday for a meeting. The news were shocking — the project have been cancelled. If we would have known earlier, we would have prepared differently. Now, I am wanting to discuss about next steps with my manager."

### Exercise 3: Write Error-Free
Write a 100-word professional introduction using:
- Correct pronoun usage (I/me, not myself)
- At least one Present Perfect sentence
- One Past Simple STAR sentence
- One future sentence (will or going to)
- Correct article usage
""",
    },
    {
        "title": "Punctuation Mastery: Commas, Semicolons & More",
        "body": """Chapter: 24
Difficulty: Medium

Punctuation is the traffic system of written language. Without it, readers crash into meaning. With it, communication flows smoothly. This lesson covers the most important punctuation marks for professional written English — the mistakes that make experienced readers wince.

## The Comma — The Most Misused Mark

### Rule 1: Joining Independent Clauses with FANBOYS
Use a comma BEFORE a coordinating conjunction (for, and, nor, but, or, yet, so) when joining two independent clauses.
- She prepared thoroughly, and she delivered a brilliant presentation.
- The deadline passed, but the team hadn't finished.
- We could meet today, or we could reschedule for Friday.

### Rule 2: After Introductory Elements
Use a comma after a word, phrase, or clause that comes before the main clause.
- However, the results were unexpected.
- After completing the training, she felt more confident.
- Because the meeting was postponed, we lost valuable time.
- Generally speaking, clear communication improves outcomes.

### Rule 3: In Lists (Serial Comma)
Use commas to separate items in a list. The Oxford comma (before "and") is recommended for clarity.
- She improved her vocabulary, grammar, and pronunciation.
- The report covered budgets, timelines, resources, and risks.

### Rule 4: Non-Defining Relative Clauses
Use commas to set off non-defining relative clauses.
- Gagandeep, who leads the team, delivered the presentation.
- The new policy, which was introduced last month, has improved efficiency.

### Rule 5: Appositives
Use commas to set off an appositive (a noun phrase that renames the subject).
- The CEO, Sundar Pichai, announced the new strategy.
- Our manager, a seasoned professional, handles conflicts brilliantly.

### Common Comma Mistakes
❌ "She spoke, and everyone listened." (unnecessary comma — clauses are short, no confusion)
✅ "She spoke and everyone listened." (short clauses, no comma needed)

❌ "She spoke clearly, but, her accent confused some listeners."
✅ "She spoke clearly, but her accent confused some listeners." (one comma before but is enough)

## The Semicolon — The Underused Power Tool

A semicolon connects two independent clauses that are closely related — like a period that doesn't fully stop.

- She prepared for weeks; the effort was clearly visible.
- The deadline was tight; nevertheless, the team delivered on time.
- Some people are born communicators; most people, however, develop the skill over time.

### Semicolons with Transitional Phrases
Use a semicolon BEFORE and comma AFTER: however, therefore, moreover, furthermore, consequently, as a result, in addition.
- The strategy was sound; however, the execution was poor.
- She trained consistently; consequently, her scores improved significantly.
- The budget was limited; nevertheless, the campaign was a success.

## The Colon — Introducing and Listing

A colon introduces a list, explanation, or elaboration.

### Before a List
- She has three strengths: communication, leadership, and analysis.
- The report covers the following areas: budget, timeline, and risk.

### Before an Explanation
- There is one thing I know for certain: consistent practice creates fluency.
- The result was clear: the new strategy had worked.

### Capitalization After a Colon
If what follows is a complete sentence, you may capitalise it (especially in American English):
- There is one truth: Consistent practice creates fluency. (capital optional)

## The Apostrophe — Possession and Contraction

### Possession
- Singular: the manager's report (one manager)
- Plural with 's': the managers' reports (multiple managers)
- Irregular plural: the children's presentation
- Pronoun possession: its (no apostrophe): "The team completed its goal."

❌ "The company forgot it's responsibilities." (it's = it is)
✅ "The company forgot its responsibilities." (possession — no apostrophe)

### Contraction (informal writing only)
- I'm = I am; it's = it is; they're = they are; you're = you are
- won't = will not; can't = cannot; don't = do not; hasn't = has not

## The Dash — Emphasis and Interruption

Use an em dash (—) for emphasis, elaboration, or interruption:
- Communication skills — not technical expertise — are what senior managers value most.
- She had one goal — to become the most effective communicator in the room.
- "I think we should—" "No, let me finish first." (interruption)

## Grammar Patterns
Pattern: [Clause] + comma + FANBOYS + [clause]
Example: She prepared, and she succeeded.
Pattern: Introductory phrase + comma + [main clause]
Example: After the training, she felt confident.
Pattern: [Clause] + semicolon + however/therefore + comma + [clause]
Example: She worked hard; therefore, she succeeded.
Pattern: [Clause] + colon + [list or explanation]
Example: She has three skills: writing, speaking, and listening.

## Practice Exercises

### Exercise 1: Add Correct Punctuation
- "She improved her grammar vocabulary and pronunciation" (Oxford comma list)
- "The project was delayed however the team remained motivated" (semicolon + however)
- "After the meeting the team felt more confident" (introductory phrase)
- "The managers report was well structured" (apostrophe for possession)
- "Its important to review its content before submitting" (its vs it's)

### Exercise 2: Punctuation Choices
Rewrite each sentence twice — once with a comma-conjunction and once with a semicolon:
- "The proposal was strong. The client rejected it."
- Option 1: "The proposal was strong, but the client rejected it."
- Option 2: "The proposal was strong; the client, however, rejected it."

### Exercise 3: Professional Paragraph
Write a 5-sentence professional paragraph about a project you worked on, using at least:
- One comma with FANBOYS
- One semicolon with "however" or "therefore"
- One colon introducing a list
- Correct apostrophes throughout
""",
    },
]


class Command(BaseCommand):
    help = "Seed the Zero-to-Hero Grammar curriculum (24 lessons) into the Learn section"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing Grammar posts before seeding",
        )

    def handle(self, *args, **options):
        grammar_cat, _ = Category.objects.get_or_create(name="Grammar")

        if options["reset"]:
            deleted, _ = Post.objects.filter(categories=grammar_cat).delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing Grammar posts."))

        created = 0
        skipped = 0

        for lesson in LESSONS:
            obj, was_created = Post.objects.get_or_create(
                title=lesson["title"],
                defaults={
                    "body": lesson["body"],
                    "created_on": timezone.now(),
                },
            )
            if was_created:
                obj.categories.add(grammar_cat)
                created += 1
                self.stdout.write(f"  ✅ Created: {lesson['title'][:70]}")
            else:
                # Update body if already exists (so --reset is not required for content updates)
                obj.body = lesson["body"]
                obj.save(update_fields=["body"])
                obj.categories.add(grammar_cat)
                skipped += 1
                self.stdout.write(f"  ⟳ Updated: {lesson['title'][:70]}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! {created} lessons created, {skipped} updated — "
                f"total {Post.objects.filter(categories=grammar_cat).count()} Grammar posts in DB."
            )
        )
