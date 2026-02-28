"""
management command: python manage.py seed_testprep_courses

Seeds ~30 Test Prep theory & strategy lessons into the Learn section,
creating one category per exam (IELTS, TOEFL, PTE, OET, CELPIP).

Run once after migrations. Safe to re-run (get_or_create is idempotent).
"""

from django.core.management.base import BaseCommand
from learn.models import Category, Post


# ── Lesson definitions ─────────────────────────────────────────────────────────

EXAMS = [
    {
        "category": "IELTS",
        "lessons": [
            {
                "title": "IELTS Overview — Format, Scoring & Target Bands",
                "body": """## About IELTS Academic

The International English Language Testing System (IELTS) Academic is the world's most popular English proficiency exam, accepted by over 11,000 organisations in more than 140 countries.

### The Four Sections

- Listening — 40 questions, 30 minutes (+ 10 transfer time), recorded British/Australian/North American accents
- Reading — 40 questions, 60 minutes, three long academic passages
- Writing — 2 tasks, 60 minutes (Task 1: 20 min, Task 2: 40 min)
- Speaking — 3 parts, 11–14 minutes, face-to-face interview

### Band Score Scale

The IELTS band scale runs from 0 to 9 in 0.5 increments. Your overall score is the average of all four sections.

- Band 9 — Expert user: complete, accurate, fluent command
- Band 8 — Very good user: only occasional unsystematic inaccuracies
- Band 7 — Good user: handles complex language, some inaccuracies
- Band 6 — Competent user: generally effective, noticeable mistakes
- Band 5 — Modest user: partial command, copes with overall meaning
- Band 4 — Limited user: basic competence, many problems

### Target Scores by Purpose

- UK / Australia / Canada student visa: Band 6.0–6.5
- University admission (undergraduate): Band 6.5
- University admission (postgraduate): Band 7.0
- Professional registration (medicine, nursing): Band 7.0–7.5
- Immigration (skilled worker): Band 6.0–8.0 depending on program

### Registration & Results

Note: IELTS results are valid for 2 years from the test date.

### Score Composition

Structure: Listening (25%) + Reading (25%) + Writing (25%) + Speaking (25%) = Overall Band
""",
            },
            {
                "title": "IELTS Speaking Strategy — Templates & Techniques",
                "body": """## IELTS Speaking: Part-by-Part Breakdown

The Speaking test is conducted as a private, face-to-face interview. It is divided into three distinct parts.

### Part 1 — Introduction & Interview (4–5 minutes)

The examiner asks familiar questions about home, family, work, studies, hobbies, and everyday topics.

Strategy: Answer with 2–3 sentences. Add a reason or example. Never give one-word answers.

Template: [Direct answer] + [reason/expansion] + [personal example or contrast]

Example: "I'd say I'm more of a morning person. I find I concentrate better before noon, so I schedule my most important tasks early. In the evenings I usually just read or watch something light."

### Part 2 — Long Turn (3–4 minutes)

You receive a task card and have 1 minute to prepare before speaking for 1–2 minutes.

Template for any topic card:
- Opening: "I'm going to talk about [topic]."
- Set the scene: [when / where / who]
- Main body: [what happened / what it is like]
- Significance: "The reason this is memorable is..."
- Closing: "Overall, [summary sentence]."

Note: Use your 1 minute wisely — jot down 3–4 bullet points for each prompt line on the card.

### Part 3 — Discussion (4–5 minutes)

The examiner asks abstract, analytical questions linked to the Part 2 topic.

Strategy: Discuss both sides before giving your opinion. Use academic vocabulary. Avoid absolute statements.

Template for opinion questions: "There are arguments on both sides. On one hand, [view A]. On the other hand, [view B]. Personally, I think [own view] because [reason]."

### Scoring Criteria

- Fluency & Coherence — speak smoothly, link ideas logically
- Lexical Resource — use a wide, precise vocabulary
- Grammatical Range & Accuracy — mix simple and complex sentences
- Pronunciation — clear, intelligible, natural

### Common Mistakes to Avoid

❌ Memorising scripted answers (examiners are trained to detect and penalise this)
✅ Use natural, personalised responses even if slightly imperfect

❌ Stopping after each sentence and waiting
✅ Keep speaking and use fillers: "That's an interesting question — I'd say..."

❌ Using only basic vocabulary: "good", "nice", "a lot"
✅ Upgrade: "beneficial", "remarkable", "a considerable number of"
""",
            },
            {
                "title": "IELTS Writing Strategy — Structure & Band Criteria",
                "body": """## IELTS Writing: Task 1 & Task 2

Writing is worth 25% of your IELTS score. Task 2 is worth twice as many marks as Task 1.

### Task 1 — Report (20 minutes, 150 words minimum)

You describe a graph, chart, table, map, or process diagram.

Structure: Introduction (paraphrase) → Overview (2 main trends) → Body 1 (detail group 1) → Body 2 (detail group 2)

Note: The overview is the most important paragraph. Many test-takers lose marks by omitting it.

### Task 1 Language Toolkit

- Describing trends: rose sharply, declined gradually, remained stable, peaked at, bottomed out at
- Comparing: while, whereas, in contrast, by comparison
- Approximating: approximately, roughly, just under/over

### Task 2 — Essay (40 minutes, 250 words minimum)

Four main essay types appear on IELTS:
- Opinion (agree/disagree): "To what extent do you agree?"
- Discussion: "Discuss both views and give your opinion."
- Problem/Solution: "What are the causes? What solutions can be offered?"
- Two-part question: "Why is this happening? Is this a positive development?"

### Universal Essay Template

Paragraph 1 — Introduction (2–3 sentences):
- Paraphrase the topic
- State your position or overview

Paragraph 2 — Body 1 (5–7 sentences):
- Topic sentence → Explanation → Example → Effect

Paragraph 3 — Body 2 (5–7 sentences):
- Same pattern — counter-argument or second main point

Paragraph 4 — Conclusion (2–3 sentences):
- Restate your position + summary of main points

### Scoring Criteria

- Task Achievement — fully address ALL parts of the question
- Coherence & Cohesion — clear paragraphing, cohesive devices
- Lexical Resource — varied, accurate vocabulary
- Grammatical Range — mix of sentence structures

❌ "I think that technology is good for people."
✅ "There is little doubt that technological advancements have dramatically improved quality of life for millions."
""",
            },
            {
                "title": "IELTS Reading Strategy — Skimming, Scanning & Question Types",
                "body": """## IELTS Academic Reading

You have 60 minutes for three passages (approximately 900 words each) and 40 questions total. No extra transfer time is given.

### Core Strategies

### Skimming (first 60 seconds per passage)
Read only: the title, subtitle, first sentence of each paragraph, and any bold/italic words.
Goal: Understand the passage topic and structure without reading every word.

### Scanning (locate specific answers)
Move your eyes quickly over the text looking for:
- Capital letters (names, places, proper nouns)
- Numbers (dates, statistics, percentages)
- Keywords from the question

### Question Types and Tactics

- True / False / Not Given: TFNG questions test whether the passage supports, contradicts, or does not address the statement. "Not Given" means the text neither confirms nor denies — this is the most misunderstood answer type.
- Matching Headings: Read the first and last sentence of each paragraph first. The heading should match the paragraph's main idea, not just a single detail.
- Multiple Choice: Eliminate obviously wrong options first. Beware of distractors that use words from the text but distort the meaning.
- Fill in the Blank: Words must come directly from the passage. Never change the word form (e.g., if the answer is a noun, write the noun).

### Time Management

- Passage 1: 15 minutes (easiest)
- Passage 2: 20 minutes (moderate)
- Passage 3: 25 minutes (hardest — academic/abstract)

Note: If you cannot find an answer within 2 minutes, move on and return. Spending 5 minutes on one question can cost you three others.

### Vocabulary Building for Reading

- Academic Word List (AWL) — 570 word families covering ~10% of academic texts
- Discipline-specific prefixes: macro/micro, pre/post, multi/mono, inter/intra
""",
            },
            {
                "title": "IELTS Listening Strategy — Note-taking & Audio Cues",
                "body": """## IELTS Listening

You hear four recordings played once only. You answer 40 questions in about 30 minutes + 10 minutes to transfer answers to the answer sheet.

### Recording Types

- Section 1: Conversation in everyday social context (e.g., booking a hotel)
- Section 2: Monologue in everyday social context (e.g., local radio broadcast)
- Section 3: Conversation in educational/training context (e.g., student discussion)
- Section 4: Academic monologue (e.g., university lecture)

### Before the Recording Starts

You have a brief preview time before each section. Use it to:
- Read all questions carefully
- Underline key words (numbers, names, locations, sequence words)
- Predict likely answer types (a name? a time? a verb?)

### During the Recording

- Write as you listen — never wait to recall later
- Answers follow the order of the questions
- Listen for signposting language: "Firstly...", "Moving on to...", "The most important aspect is..."
- Paraphrasing is common: the question says "cost" but the speaker says "price" or "fee"

### Note-taking Symbols

Use shorthand: & = and, w/ = with, → = leads to, ↑ = increases, ↓ = decreases, ~ = approximately, # = number

### Common Traps

❌ Writing the first thing you hear — speakers often self-correct ("The meeting is at 3pm — sorry, 4pm.")
✅ Wait for the final, confirmed answer

❌ Missing answers while writing the previous one
✅ Leave a blank and keep moving — you can revisit during transfer time

### Fill-in-the-Blank Rules

- Write the exact word(s) you hear
- Check spelling carefully — one wrong letter = wrong answer
- Word limit is strict: "NO MORE THAN TWO WORDS" means 1 or 2 words only
""",
            },
            {
                "title": "IELTS Vocabulary & Grammar for the Exam",
                "body": """## High-Frequency Vocabulary for IELTS

Strong vocabulary accounts for 25% of your band score in both Speaking and Writing. This lesson covers the most productive word families and grammar patterns.

### Academic Word Families (AWL Sublist 1)

These 60 families appear most frequently in academic texts:

- analyse / analysis / analytical / analytically
- assess / assessment / assessable
- conclude / conclusion / conclusive / conclusively
- constitute / constituent / constitution / constitutional
- define / definition / definitive
- establish / establishment / established
- indicate / indication / indicative
- obtain / obtainable
- require / requirement / required
- significant / significance / significantly

### Topic Vocabulary: Environment

- greenhouse gases, carbon emissions, renewable energy, fossil fuels
- deforestation, biodiversity, ecological footprint, sustainable development
- mitigation, adaptation, climate resilience

### Topic Vocabulary: Technology

- artificial intelligence, automation, digital literacy, cybersecurity
- innovation, disruption, algorithm, data privacy, connectivity

### Topic Vocabulary: Society & Education

- urbanisation, social mobility, meritocracy, inequality
- curriculum reform, lifelong learning, critical thinking, academic rigour

### Grammar for Band 7+

Mix sentence structures to demonstrate grammatical range:

- Simple: "Technology has changed education."
- Compound: "Technology has changed education, and students now learn online."
- Complex: "Although technology has transformed education, traditional classroom interaction remains irreplaceable."
- Mixed: "While digital tools have undeniably enhanced access to learning, it is argued that the social dimension of education — peer interaction, mentorship, and collaboration — cannot be replicated virtually."

### Linking Language for Writing

- Adding ideas: furthermore, in addition, moreover, not only... but also
- Contrasting: however, nevertheless, despite this, on the other hand
- Cause/effect: consequently, as a result, therefore, this leads to
- Examples: for instance, to illustrate, a case in point is

Note: Avoid overusing "also", "but", and "because" — upgrade to academic equivalents.
""",
            },
        ],
    },
    {
        "category": "TOEFL",
        "lessons": [
            {
                "title": "TOEFL iBT Overview — Format, Scoring & Target Scores",
                "body": """## About the TOEFL iBT

The Test of English as a Foreign Language (TOEFL iBT) is an internet-based test administered by ETS. It is the most widely accepted English proficiency test for US, Canadian, and UK university admissions.

### The Four Sections

- Reading — 2 passages, 10 questions each, 35 minutes total
- Listening — lectures and conversations, 36 minutes
- Speaking — 4 tasks, 16 minutes
- Writing — 2 tasks, 29 minutes

Note: The TOEFL iBT was updated in July 2023. The test now takes approximately 2 hours (down from 3+ hours).

### Score Scale

Each section is scored 0–30, for a maximum total of 120 points.

- 114–120 — Outstanding (C2 proficiency)
- 100–113 — Advanced (C1 proficiency)
- 79–93 — High intermediate (B2 proficiency)
- 60–78 — Intermediate (B1 proficiency)

### Target Scores by Institution

- US undergraduate admission: 79–100
- US graduate school: 90–105
- Top US universities (Harvard, MIT, Stanford): 100+
- UK universities: typically 88–100
- Canada immigration (Express Entry): 10 per skill (CLB 10)

### TOEFL vs IELTS

Use: TOEFL = preferred in US/Canada; IELTS = preferred in UK/Australia
Format: TOEFL is fully computer-based; IELTS has a face-to-face speaking component
Scoring: TOEFL out of 120; IELTS out of 9 bands
""",
            },
            {
                "title": "TOEFL Speaking Strategy — Integrated & Independent Tasks",
                "body": """## TOEFL Speaking: 4 Tasks in 16 Minutes

All TOEFL speaking responses are recorded via microphone and scored by AI + human raters.

### Task 1 — Independent Speaking (15 sec prep / 45 sec response)

You express a personal opinion or preference on a familiar topic.

Template: "[Direct statement of opinion]. [Reason 1 + detail/example]. [Reason 2 + detail]. That's why I [restate opinion]."

Example prompt: "Do you prefer studying alone or in a group?"
Response: "I strongly prefer studying alone. Firstly, I find I retain information better without distractions — at home I can focus deeply on each concept. Additionally, I can set my own pace and spend extra time on difficult topics. For these reasons, solo studying suits my learning style best."

### Tasks 2–4 — Integrated Speaking

These tasks require you to read and/or listen to material before responding.

- Task 2: Read campus announcement + listen to student reaction → summarise both
- Task 3: Read academic concept + listen to professor's example → explain concept using the example
- Task 4: Listen to academic lecture → summarise key points

### Integrated Speaking Template

"According to the reading/listening, [main point]. The [professor/student] explains this by [detail 1]. Furthermore, [detail 2]. This illustrates that [connection to main point]."

### Scoring Rubric (0–4 per task)

- Delivery: pace, pronunciation, naturalness
- Language Use: vocabulary range, grammar
- Topic Development: completeness, coherence, detail

### Key Tips

❌ Memorising generic phrases like "In my humble opinion, I personally believe..."
✅ Get to the point in the first sentence — every second counts at 45 seconds

Note: Speak at a natural, slightly measured pace. Rushing lowers pronunciation scores. Slow, deliberate speech is better than speedy, unclear speech.
""",
            },
            {
                "title": "TOEFL Writing Strategy — Integrated & Academic Discussion",
                "body": """## TOEFL Writing: 2 Tasks in 29 Minutes

### Task 1 — Integrated Writing (20 minutes, 150–225 words)

You read a 300-word passage (3 minutes), then listen to a lecture that challenges the reading. You write a response that explains how the lecture challenges the reading.

Structure:
- Introduction: "The reading argues that [X]. However, the lecture challenges this by [Y]."
- Body 1: "The reading claims [point 1]. The lecturer counters this by stating [counter-point 1 + detail]."
- Body 2: "The reading suggests [point 2]. In contrast, the professor argues [counter-point 2]."
- Body 3: "Finally, the reading states [point 3]. The lecture disputes this with [evidence/example]."

Note: Do NOT include your personal opinion in Task 1. Summarise objectively.

### Task 2 — Academic Discussion (10 minutes, 100+ words)

You read a professor's question and two student responses, then contribute your own position.

Strategy: Agree or partly disagree with one student. Add a new argument not mentioned by either student. Use a specific example to support your point.

Template: "I agree/disagree with [student name]'s view that [X]. While [their point] is valid, I believe [your position]. For example, [specific example]. This shows that [conclusion]."

### Scoring Criteria

- Development: do you fully address the task?
- Organisation: is your response logically structured?
- Language: is your vocabulary and grammar accurate and varied?

❌ "I agree with Professor's question about technology is good."
✅ "The professor raises a compelling question about the role of technology in modern education, and I find myself largely in agreement with David's perspective."
""",
            },
            {
                "title": "TOEFL Reading Strategy — Passage Types & Question Tactics",
                "body": """## TOEFL Reading: 2 Passages, 35 Minutes

TOEFL reading passages are 700-word academic excerpts covering science, history, social science, and humanities.

### Passage Types

- Exposition: presents information about a topic (most common)
- Argumentation: presents a claim and supporting arguments
- Historical narrative: describes events and their causes/effects

### Question Categories

- Factual: "According to paragraph X, which of the following is true?"
- Inference: "What can be inferred from paragraph X?"
- Vocabulary: "The word X in paragraph Y is closest in meaning to..."
- Reference: "The word 'they' in paragraph X refers to..."
- Sentence Simplification: choose the sentence that best expresses the essential meaning
- Insert Sentence: identify where a given sentence fits logically in the passage
- Prose Summary: select 3 major ideas from 6 options (worth 2 points)

### Strategy for Each Type

- Vocabulary questions: eliminate clearly wrong answers; use word roots and context clues
- Inference questions: the answer must be logically derivable from the text — not just plausible
- Prose Summary: identify the passage's 3 major arguments; ignore minor details and examples

### Reading Efficiency

- Read the question stem before reading the passage paragraph in detail
- Underline topic sentences (usually the first sentence of each paragraph)
- Prose summary questions are worth 2 points each — allocate extra time for them

Note: TOEFL reading passages use formal academic register. Build vocabulary from scientific journals, The Economist, and academic textbook introductions.
""",
            },
            {
                "title": "TOEFL Listening Strategy — Lectures, Conversations & Note-taking",
                "body": """## TOEFL Listening: 36 Minutes

You hear 3 lectures (5–7 minutes each) and 2 conversations (3 minutes each). Each lecture has 6 questions; each conversation has 5 questions.

### Content Types

- Lectures: academic content (biology, history, economics, archaeology, art, astronomy)
- Conversations: campus situations (office hours, library, registration, financial aid)

### Note-taking System

The TOEFL allows and encourages note-taking during all listening sections. Use a structured template:

Lecture notes:
- Topic: [one line]
- Main points: 1. ___ 2. ___ 3. ___
- Key examples: ___
- Professor's conclusion/opinion: ___

### Signal Words to Listen For

- Listing: first, second, another key point, finally
- Contrast: however, on the other hand, unlike
- Cause-effect: therefore, as a result, this led to
- Emphasis: most importantly, the key factor is, note that
- Definition: is defined as, what we mean by X is, in other words

### Question Types

- Gist (main idea): "What is the lecture mainly about?"
- Detail: "According to the professor, what is X?"
- Function: "Why does the professor mention X?"
- Attitude: "What is the professor's attitude toward X?"
- Connecting content: put events in order or match concepts

### Common Traps

❌ Focusing on interesting details and missing the main argument
✅ Always note the professor's thesis in the first 30 seconds of the lecture

Note: For "Function" questions, listen for tone and context — the answer is often about WHY something was mentioned, not WHAT was said.
""",
            },
            {
                "title": "TOEFL Vocabulary & Grammar — Academic Word Patterns",
                "body": """## High-Value Vocabulary for TOEFL

TOEFL tests academic reading and listening, so vocabulary focus should be on AWL and TOEFL word lists.

### Essential Academic Verbs

- assert, argue, contend, maintain, propose (for claims)
- demonstrate, illustrate, exemplify, reveal, show (for evidence)
- challenge, dispute, contradict, question, undermine (for counter-argument)
- attribute to, contribute to, result in, stem from (for cause-effect)

### Noun Phrase Patterns

Academic English favours complex noun phrases:

- Simple: "Technology helps students."
- Academic: "The widespread adoption of digital technology has significantly enhanced student engagement."

Build noun phrases with:
- Pre-modifier + Noun + Post-modifier: "a rapidly growing body of evidence supporting this hypothesis"

### Common TOEFL Grammar Structures

- Passive voice: "It has been argued that...", "The theory was first proposed by..."
- Conditional: "If X were the case, Y would follow."
- Relative clauses: "researchers who study X", "the phenomenon, which occurs when..."
- Gerund subjects: "Studying abroad broadens one's perspective."

### Topic Vocabulary: Science & Environment

- hypothesis, empirical, observable, replicate, variable, correlation
- ecosystem, photosynthesis, decomposition, organism, habitat, adaptation

### Topic Vocabulary: Social Science

- demographics, urbanisation, migration, assimilation, policy, infrastructure
- cognitive, behavioural, psychological, sociological, anthropological

Note: TOEFL vocabulary items test precise distinctions — "almost" vs "approximately", "increase" vs "surge". Study collocations, not just individual words.
""",
            },
        ],
    },
    {
        "category": "PTE",
        "lessons": [
            {
                "title": "PTE Academic Overview — Format, Scoring & AI Marking",
                "body": """## About PTE Academic

The Pearson Test of English Academic (PTE Academic) is a fully computer-based English test marked entirely by AI. It is accepted by thousands of universities worldwide and is popular for Australian and New Zealand immigration.

### The Three Parts

- Part 1: Speaking & Writing (77–93 minutes) — includes read aloud, repeat sentence, describe image, re-tell lecture, answer short question, summarise written text, write essay
- Part 2: Reading (32–41 minutes) — includes multiple choice, re-order paragraphs, fill in the blanks
- Part 3: Listening (45–57 minutes) — summarise spoken text, multiple choice, fill blanks, highlight correct summary, select missing word, highlight incorrect words, write from dictation

### Scoring Scale

Scores range from 10–90. The scoring is unique because skills are "enabling" — your reading score also affects your listening score due to vocabulary and oral fluency crossovers.

- 85–90 — C2 (Expert)
- 76–84 — C1 (Advanced)
- 59–75 — B2 (Upper Intermediate)
- 43–58 — B1 (Intermediate)

### Target Scores by Purpose

- Australian skilled migration: 65 overall with no skill below 65
- Australian student visa: 50 per section
- New Zealand skilled migration: 50–65 depending on visa stream
- UK visa: 51–65 depending on category

### Why PTE is Different

Note: The AI marking means consistency — there is no examiner bias. However, the AI also strictly penalises off-topic responses, so answering the actual question is critical.
""",
            },
            {
                "title": "PTE Speaking Strategy — Read Aloud, Describe Image & More",
                "body": """## PTE Speaking: Key Task Types

### Read Aloud (35 seconds preparation, 40 seconds speaking)

A text is displayed. You read it aloud after a microphone opens.

Strategy:
- Use natural sentence stress and rhythm — stress content words (nouns, verbs, adjectives)
- Do not pause mid-word or mid-phrase
- Maintain a steady pace — not too fast, not too slow

Note: This task also contributes to your Reading score — pronunciation, fluency, and reading accuracy are all scored.

### Repeat Sentence (no prep time)

You hear a sentence and immediately repeat it verbatim.

Strategy: Focus on the key content words. If you miss a word, keep going — partial credit is given. Never repeat a shorter, made-up sentence.

### Describe Image (25 seconds prep, 40 seconds speaking)

You see a graph, chart, image, or map. Describe it in 40 seconds.

Template: "This [chart/graph/image] illustrates [topic]. The most significant feature is [main observation]. Additionally, [second observation]. Overall, [summary conclusion]."

### Re-tell Lecture (10 seconds prep, 40 seconds speaking)

You hear and see a lecture clip (60–90 seconds). Re-tell the key points.

Template: "The lecture discusses [topic]. The speaker explains that [main point 1]. They also mention [point 2]. In conclusion, [main takeaway]."

### Answer Short Question (no prep)

One-word or two-word factual answer expected.

Strategy: Answer immediately and concisely. The AI looks for the correct word, not elaboration.
""",
            },
            {
                "title": "PTE Writing Strategy — Summarise Text & Essay",
                "body": """## PTE Writing Tasks

### Summarise Written Text (10 minutes per prompt)

You read a passage and write a single sentence (5–75 words) that summarises the key point.

Template: "[Main subject] [main verb] [key idea], [supporting detail 1], and [supporting detail 2], suggesting that [conclusion]."

Example: "Urbanisation, driven by economic opportunity and improved infrastructure, has led to significant demographic shifts in developing nations, creating both opportunities for growth and challenges relating to resource management and social inequality."

Note: The sentence must be grammatically correct, meaningful, and within the word limit. Do not write a paragraph — one sentence only.

### Write Essay (20 minutes, 200–300 words)

You respond to a prompt expressing agreement, disagreement, or discussion.

Structure:
- Paragraph 1 — Introduction (2–3 sentences): paraphrase topic + state your position
- Paragraph 2 — First supporting argument (5–7 sentences): claim + explanation + example
- Paragraph 3 — Second argument or counter-argument (5–7 sentences)
- Paragraph 4 — Conclusion (2 sentences): restate thesis + summary

### PTE Essay Scoring Criteria

- Content: Is the task fully addressed? Are ideas relevant and developed?
- Form: Is the essay the correct length (200–300 words)?
- Grammar: Variety of structures, accurate punctuation
- Vocabulary: Range and appropriateness
- Spelling: Consistent British OR American spelling (do not mix)

❌ Writing 190 words and submitting — Form score penalised
✅ Aim for 230–260 words to safely exceed the minimum with quality content
""",
            },
            {
                "title": "PTE Reading Strategy — Re-order Paragraphs & Fill in the Blanks",
                "body": """## PTE Reading Tasks

### Multiple Choice (Single & Multiple Answers)

Single answer: select the one best answer from 5 options.
Multiple answer: select ALL correct answers — there is a penalty for wrong selections.

Strategy for multiple answer: Only select an answer if you are confident it is correct. An incorrect selection can negate a correct one.

### Re-order Paragraphs

You are given 4–6 shuffled text boxes and must arrange them in the correct order.

Strategy:
1. Find the topic sentence — it introduces the subject without referring back to anything
2. Look for pronouns (he, she, they, it) — they reference a previously introduced noun
3. Look for sequence markers (first, then, subsequently, finally)
4. Look for logical flow: cause → effect, general → specific

### Reading: Fill in the Blanks

A text with blanks is shown; drag words from a pool to fill the gaps.

Strategy:
- Read the full sentence for meaning context before choosing
- Consider grammar (is a noun, verb, or adjective needed?)
- Check collocations (what word commonly appears with the surrounding words?)

### Reading & Writing: Fill in the Blanks (Hardest Task)

Select from a dropdown menu for each blank. This task is scored for both Reading AND Writing.

Note: Every blank counts as one point. Skipping is never better than a reasoned guess.
""",
            },
            {
                "title": "PTE Listening Strategy — Dictation, Highlight & Summaries",
                "body": """## PTE Listening Tasks

### Summarise Spoken Text (10 minutes per task)

Listen to a 60–90 second audio. Write a summary of 50–70 words.

Template: "The speaker discusses [topic]. They explain that [main point 1]. Additionally, [main point 2]. The speaker concludes that [main takeaway]."

### Multiple Choice Listening

Same strategy as Reading multiple choice. For multiple-answer questions, be conservative — wrong answers penalise.

### Fill in the Blanks (Listening)

You see a transcript with blanks and hear the audio. Type the exact word you hear.

Strategy: Type as you listen — do not rely on memory. Focus on the blanks and predict word type (noun? verb? adjective?) before the audio reaches each blank.

### Highlight Correct Summary

You hear a recording and choose the best summary from 4 options. Eliminate options that contain:
- Details not mentioned in the audio
- Distortions of the speaker's actual meaning
- Correct words used in the wrong context

### Write from Dictation (Most Heavily Weighted)

You hear one sentence and type it exactly.

Note: This task contributes heavily to both Listening and Writing scores. Focus on every single word, including articles and prepositions.

Strategy: Write immediately as you hear. Common errors: missing articles (a/an/the), wrong preposition, missing plural -s.
""",
            },
            {
                "title": "PTE Vocabulary & Enabling Skills — Oral Fluency & Spelling",
                "body": """## Vocabulary & Enabling Skills for PTE

PTE has a unique scoring system where enabling skills (oral fluency, pronunciation, spelling, vocabulary, written discourse, grammar) feed into all four communicative skills.

### Oral Fluency

Oral fluency is assessed on pace, rhythm, and naturalness. The AI listens for:
- Consistent speaking rate (not too fast, not too slow)
- Minimal false starts and repetitions
- Natural sentence groupings (pausing at phrase boundaries, not mid-phrase)

Practice: Read aloud for 10 minutes daily. Record yourself and compare to native speaker recordings.

### Pronunciation

PTE accepts all standard English accents. The AI scores on:
- Correct syllable stress (pho-TO-graph vs PHO-to-graph)
- Clear articulation of all sounds
- Natural reduction and linking (gonna = going to in natural speech)

### Academic Vocabulary for PTE

High-frequency words in PTE reading/listening:
- process, factor, function, structure, system, evidence, impact, approach
- establish, indicate, obtain, require, define, assess, contribute, maintain

### Spelling Patterns

Common errors in Write from Dictation and Fill in the Blanks:

- ie/ei confusion: achieve, believe, receive, perceive
- Double consonants: occurrence, committed, beginning, necessary
- Silent letters: knowledge, environment, government, acknowledge
- -ance vs -ence: significance, consequence, performance, preference

Note: Consistent American or British spelling is acceptable. Mixing is penalised. Choose one system and stick to it throughout your test.
""",
            },
        ],
    },
    {
        "category": "OET",
        "lessons": [
            {
                "title": "OET Overview — Format, Scoring & Healthcare Context",
                "body": """## About the OET

The Occupational English Test (OET) is designed specifically for healthcare professionals seeking registration or migration. It tests English in the healthcare context and is accepted by nursing, medical, and allied health regulatory bodies in the UK, Australia, New Zealand, and beyond.

### Professions Covered

OET is available for 12 healthcare professions: Medicine, Nursing, Dentistry, Pharmacy, Physiotherapy, Optometry, Occupational Therapy, Radiography, Podiatry, Dietetics, Speech Pathology, and Veterinary Science.

### The Four Sub-tests

- Listening (45 minutes) — healthcare consultations and interviews
- Reading (60 minutes) — healthcare texts and articles
- Writing (45 minutes) — referral letter, discharge summary, or other healthcare document
- Speaking (20 minutes) — role-play consultations with a trained interlocutor

### Scoring Scale

Each sub-test is scored A–E (A = highest):
- Grade A — proficient user (equivalent to IELTS 8.5+)
- Grade B — very good user (equivalent to IELTS 7.5–8.0)
- Grade C — good user (equivalent to IELTS 6.5–7.0)
- Grade D — limited user
- Grade E — very limited user

### Target Grades by Purpose

- UK NMC (Nursing & Midwifery Council): Grade B in all four sub-tests
- UK GMC (General Medical Council): Grade B in all four sub-tests
- Australian AHPRA: Grade B minimum in each sub-test
- New Zealand NCNZ (Nursing): Grade B in all sub-tests
""",
            },
            {
                "title": "OET Speaking Strategy — Healthcare Role-Play Consultations",
                "body": """## OET Speaking: Role-Play Format

The OET Speaking test involves two role-plays, each lasting approximately 5 minutes.

### How It Works

You play a healthcare professional. The interlocutor plays a patient, carer, or colleague. You receive a role-play card 3 minutes before each task to prepare.

### Role-Play Card Structure

Your card gives you: the setting, your professional role, the patient's situation, and the communication task (e.g., take history, explain treatment, provide discharge advice).

### Core Communication Framework (SBAR)

Use SBAR for structured clinical communication:
- Situation: "I can see you've come in today because of [X]. Is that right?"
- Background: "I understand you have a history of [condition]."
- Assessment: "Based on what you've told me, I think [clinical impression]."
- Recommendation: "What I'd recommend is [treatment/advice], and here's why..."

### Relationship-Building Language

- Acknowledging: "I understand this must be very worrying for you."
- Empathy: "That sounds really difficult. You've been managing this for a long time."
- Clarifying: "Just to make sure I've understood correctly, you're saying that..."
- Checking understanding: "Can I just check that makes sense? What would you do if...?"

### Common Mistakes

❌ Using technical jargon without explanation ("You have hypertension" without further explanation)
✅ "Your blood pressure is higher than we'd like. This is called hypertension — it means the heart is working harder than it should."

❌ Moving through tasks mechanically without patient-centred responses
✅ Pause, acknowledge, then proceed: "That's understandable. Now, if I may, I'd like to ask about..."
""",
            },
            {
                "title": "OET Writing Strategy — Referral & Discharge Letters",
                "body": """## OET Writing: Healthcare Correspondence

The Writing sub-test requires you to write a professional letter (180–200 words) based on a case note stimulus.

### Task Types

- Referral letter: to a specialist, physiotherapist, social worker, etc.
- Discharge summary: from inpatient to GP or community nurse
- Transfer letter: between facilities
- Advice letter: to patient or carer

### Letter Structure

Your OET letter must follow formal healthcare correspondence conventions:

Header:
- Date
- Recipient's name and title
- Salutation: "Dear Dr Smith," or "Dear Colleague,"

Paragraph 1 — Reason for writing:
"I am writing to refer [Patient name], a [age]-year-old [male/female] with [primary diagnosis], for [purpose of referral]."

Paragraph 2 — Relevant history:
Relevant past medical history, current medications, allergies. Include only what is relevant to the recipient.

Paragraph 3 — Current presentation & management:
"[Patient] presented with [symptoms]. Investigations revealed [findings]. [Patient] has been commenced on [treatment]."

Paragraph 4 — Specific request:
"I would appreciate your assessment of [specific clinical concern]. Please contact our rooms on [number] if you require further information."

Closing: "Yours sincerely," + Name + Title

### Scoring Criteria

- Purpose: Is the purpose of the letter clear?
- Content: Are relevant details included? Are irrelevant details excluded?
- Conciseness and Clarity: Is information presented efficiently?
- Genre and Style: Does it use appropriate professional register?
- Organisation and Layout: Correct structure and formatting?
- Language: Grammatical accuracy, vocabulary, cohesion?

Note: The case notes contain more information than you need. A key OET skill is selecting what the recipient actually needs.
""",
            },
            {
                "title": "OET Reading Strategy — Healthcare Texts & Evidence Summaries",
                "body": """## OET Reading: Part A & Part B

### Part A — Expeditious Reading (15 minutes)

You read 3–4 short texts on a healthcare topic and complete a summary using information from across all texts. This tests your ability to locate specific information quickly.

Strategy:
- Skim for the overall topic and text structure first (30 seconds)
- Read the questions and underline key terms
- Scan each text for the relevant section
- Use exact language from the texts where asked

Note: Part A rewards speed. Do not read every word — find the answer and move on.

### Part B — Careful Reading (45 minutes)

Two longer texts: one clinical or research article, one policy/procedural document. 42 questions total across 6 types.

Question Types:
- Multiple choice (best answer from 4 options)
- Sentence completion (select from provided options)
- Short answer (locate exact information from text)

### Healthcare Text Strategies

Clinical research articles follow a standard structure: Abstract → Introduction → Methods → Results → Discussion → Conclusion.

Scan the Abstract and Discussion sections first — these contain the main findings and conclusions.

For policy texts, look for: eligibility criteria, dosing guidelines, contraindications, exceptions to standard procedure.

### Key Vocabulary for OET Reading

- Clinical: diagnosis, prognosis, aetiology, pathophysiology, comorbidity
- Pharmacological: contraindication, adverse effect, prophylaxis, titration, compliance
- Research: randomised controlled trial, cohort, meta-analysis, prevalence, incidence
""",
            },
            {
                "title": "OET Listening Strategy — Clinical Consultations & Interviews",
                "body": """## OET Listening: Parts A, B & C

### Part A — Consultation (Approx. 5 minutes)

You hear an audio recording of a healthcare consultation. You complete a set of notes.

Strategy:
- Read the note-taking frame carefully before the audio starts
- The notes follow the audio sequentially — answers appear in order
- Write only what is needed; the frame shows what type of answer is expected (e.g., "Symptoms:", "Duration:", "Current medication:")

### Part B — Short Extracts (Approx. 25 minutes)

6 short recordings (healthcare settings). For each, answer 1–2 multiple choice questions.

Strategy: Focus on speaker intent and opinion, not just facts. OET Part B often tests understanding of a speaker's attitude or a patient's concern.

### Part C — Longer Listening (Approx. 15 minutes)

Two longer audio recordings: an interview or talk related to healthcare issues, research, or professional development.

For each recording, answer multiple choice questions (5 questions each).

Strategy:
- The questions follow the order of the audio
- Listen for discourse markers: "The main reason for this is...", "What we found was..."
- Note any statistics or comparisons mentioned — these are frequently tested

### Medical Vocabulary in Listening

Common terms tested in OET Listening:
- symptoms: dyspnoea, oedema, nausea, fatigue, palpitations
- conditions: hypertension, diabetes mellitus, asthma, hypothyroidism
- procedures: electrocardiogram, ultrasound, spirometry, venepuncture
- medications: analgesics, anticoagulants, corticosteroids, antihypertensives
""",
            },
            {
                "title": "OET Medical Vocabulary & Healthcare Communication",
                "body": """## Medical Vocabulary & Professional Communication for OET

### Essential Medical Terminology

Understanding medical prefixes, suffixes, and roots helps decode any unfamiliar term:

Common prefixes:
- tachy- (fast): tachycardia = fast heart rate
- brady- (slow): bradycardia = slow heart rate
- hyper- (above/high): hypertension, hyperglycaemia
- hypo- (below/low): hypotension, hypoglycaemia
- dys- (abnormal/difficult): dyspnoea, dysphagia, dysuria

Common suffixes:
- -itis (inflammation): appendicitis, arthritis, dermatitis
- -ectomy (surgical removal): appendectomy, tonsillectomy
- -ology (study of): cardiology, neurology, haematology
- -pathy (disease): neuropathy, cardiomyopathy
- -plasty (repair/reconstruction): rhinoplasty, arthroplasty

### Patient-Centred Communication Phrases

For taking history:
- "What brings you in today?"
- "Can you describe the pain — is it sharp, dull, burning?"
- "On a scale of 0 to 10, how would you rate the pain?"
- "How long have you been experiencing this?"

For explaining procedures:
- "What I'd like to do is [procedure]. This involves [brief description]."
- "You might experience [sensation] — this is completely normal."
- "Do you have any questions about what I've just explained?"

For giving advice:
- "It's important that you [instruction] because [reason]."
- "I'd recommend [action]. Have you had any experience with [treatment] before?"

### Professional Register in OET Letters

Avoid colloquial: "The patient is getting better."
Use professional: "The patient is demonstrating satisfactory clinical improvement."

Avoid vague: "She has some breathing problems."
Use precise: "She presents with exertional dyspnoea, limiting her activity to short walks."
""",
            },
        ],
    },
    {
        "category": "CELPIP",
        "lessons": [
            {
                "title": "CELPIP Overview — Format, Scoring & Canadian Context",
                "body": """## About CELPIP

The Canadian English Language Proficiency Index Program (CELPIP) is a fully computer-based English test designed specifically for Canadian immigration and citizenship. It is administered by Paragon Testing Enterprises and accepted by IRCC (Immigration, Refugees and Citizenship Canada).

### Two Versions

- CELPIP-General: For permanent residency and citizenship applications — tests all four skills
- CELPIP-General LS: Listening and Speaking only — for citizenship applications only

### The Four Components

- Listening (47–55 minutes) — 8 tasks with daily-life Canadian scenarios
- Reading (55–60 minutes) — 4 tasks
- Writing (53–60 minutes) — 2 tasks
- Speaking (15–20 minutes) — 8 tasks, recorded via computer microphone

### Scoring Scale (CELPIP Levels)

Scores are reported in CELPIP Levels from 1–12, mapped to CLB (Canadian Language Benchmark) levels:

- Level 12 — Expert (CLB 12)
- Level 10–11 — Advanced (CLB 10–11)
- Level 8–9 — Competent (CLB 8–9)
- Level 6–7 — Adequate (CLB 6–7)
- Level 4–5 — Developing (CLB 4–5)

### Target Levels for Canadian Immigration

- Federal Skilled Worker (Express Entry): CLB 7 (CELPIP Level 7)
- Canadian Experience Class: CLB 7 or 5 depending on job category
- Provincial Nominee Programs: varies by province, typically CLB 5–7
- Canadian citizenship: CLB 4 minimum
""",
            },
            {
                "title": "CELPIP Speaking Strategy — 8 Tasks, Canadian Scenarios",
                "body": """## CELPIP Speaking: 8 Tasks

All CELPIP speaking tasks are recorded by a computer — there is no live examiner. This makes the test more consistent but also means your recording must be very clear.

### Task 1 — Giving Advice (30 seconds prep, 90 seconds response)

You look at an image and give advice to someone in the situation.

Template: "Looking at this situation, I would suggest [main advice]. The reason I say this is [reason 1]. Additionally, [reason 2]. Overall, I think this approach would [benefit]."

### Task 2 — Talking About Personal Experience (30 seconds prep, 60 seconds)

Describe a personal experience related to a theme.

Template: "One experience that comes to mind is when [situation]. At the time, [context/feelings]. What I did was [action], and as a result [outcome]. This taught me [lesson or reflection]."

### Task 3 — Describing a Scene (30 seconds prep, 60 seconds)

Describe what you see in a photo.

Template: "In this image, I can see [setting]. In the foreground, [detail 1]. In the background, [detail 2]. The people appear to be [activity/emotion]. The overall atmosphere is [adjective]."

### Tasks 4–5 — Making Predictions & Expressing Opinions

These tasks show a scenario and ask you to predict outcomes or share opinions.

Strategy: Always take a clear position. Use hedging language to sound natural: "I think it's quite likely that...", "My view is that..."

### Tasks 6–7 — Dealing with a Difficult Situation

You must resolve a conflict or complaint tactfully.

Strategy: Use the APC formula — Acknowledge + Propose + Check:
"I completely understand your frustration about [issue]. What I can do is [solution]. Would that work for you?"

### Task 8 — Describing an Unusual Situation

Strategy: Use varied vocabulary and some humour or human interest where appropriate to make your description engaging.
""",
            },
            {
                "title": "CELPIP Writing Strategy — Emails & Opinion Surveys",
                "body": """## CELPIP Writing: 2 Tasks

### Task 1 — Writing an Email (27 minutes, 150–200 words)

You write an email to a friend, colleague, or organisation. The tone ranges from informal (to a friend) to semi-formal (to a neighbour or community group) to formal (to a business or government office).

Format requirements:
- Subject line: clear and relevant
- Salutation: "Dear [Name]," / "Hi [Name],"
- Body: 3 paragraphs (Opening reason → Main content → Closing action)
- Sign-off: "Regards," / "Best wishes," / "Sincerely,"

Template for Task 1:
"Dear [Name],
I am writing to [purpose]. [Background/context sentence].
[Main body: 2–3 sentences with relevant details].
[Closing sentence: call to action or expression of hope].
[Sign-off]"

### Task 2 — Responding to a Survey (26 minutes, 150–200 words)

You read a survey question asking your opinion on a topic (usually a community, workplace, or social issue) and write a structured response.

Structure:
- Sentence 1–2: State your position clearly
- Sentence 3–5: First reason + supporting detail
- Sentence 6–8: Second reason + supporting detail or counter-argument
- Sentence 9–10: Conclusion restating your position

Note: Unlike IELTS Task 2, CELPIP writing is assessed on everyday communicative competence — not academic essay writing. Clear, direct, well-organised responses score well even without highly complex vocabulary.

### Scoring Criteria

- Content: Relevant and complete ideas
- Vocabulary range: Precise, appropriate word choice
- Readability: Clear sentences and paragraphing
- Task fulfilment: Correct format, appropriate tone, correct length
""",
            },
            {
                "title": "CELPIP Reading Strategy — Correspondence, Diagrams & Viewpoints",
                "body": """## CELPIP Reading: 4 Tasks

### Task 1 — Reading Correspondence (Emails, Letters, Notices)

You read a short piece of correspondence and answer 8 questions.

Strategy: Focus on the purpose, tone, and specific requests. Questions often test whether you can distinguish the writer's main request from supporting details.

### Task 2 — Reading to Apply a Diagram

You read instructions or a document (e.g., a form, map, schedule) and answer questions about how to apply the information.

Strategy: Read the questions before the diagram. Then locate the specific section of the diagram that answers each question. Time management is critical here — do not read the entire diagram in detail.

### Task 3 — Reading for Information

A longer text (300–400 words) from everyday contexts (brochures, websites, policies, newsletters). Answer 9 multiple choice questions.

Strategy: Use headings and subheadings to navigate. Most questions can be answered by finding the relevant paragraph rather than reading the full text.

### Task 4 — Reading for Viewpoints

An opinion piece or discussion article. Answer questions about the writer's attitude, implied meaning, and argument structure.

Strategy: Pay attention to hedging (might, could, arguably) and emphatic language (clearly, undoubtedly, it is essential). Questions often test the difference between fact and opinion.

### Canadian Context Vocabulary

CELPIP texts use everyday Canadian English:
- toque (knit hat), loonie (CAD $1 coin), toonie (CAD $2 coin)
- hydro bill (electricity bill), cottage (summer home), Thanksgiving (October in Canada)
- Tim Hortons, LCBO, TTC — common Canadian references
""",
            },
            {
                "title": "CELPIP Listening Strategy — Daily Life & Community Scenarios",
                "body": """## CELPIP Listening: 8 Tasks

CELPIP Listening focuses on everyday Canadian life — conversations between friends, workplace discussions, community announcements, and radio broadcasts.

### Task Types Overview

- Task 1: Listening to a Problem Solving conversation
- Task 2: Listening to a Daily Life Dialogue
- Task 3: Listening for Information (news, announcement, voicemail)
- Task 4: Listening to a Discussion (workplace or community)
- Task 5: Listening to a News Item
- Task 6: Listening to a Problem Solving conversation
- Task 7: Listening to Daily Life Dialogue
- Task 8: Listening to a Viewpoint (opinion speech)

### Strategy for All Listening Tasks

- Read the question and answer options before the audio begins (15–20 seconds given)
- Focus on KEY phrases that directly answer the question
- Beware of distractors — words mentioned in the audio that appear in wrong answer choices
- Listen for Canadian expressions and colloquialisms

### Common Canadian English Features in CELPIP

- Pronunciation: "about" often sounds like "aboot" in Canadian English
- Vocabulary: "eh" (confirmation), "washroom" (bathroom), "take-out" (takeaway), "lineup" (queue)
- Politeness markers: "sorry", "excuse me", "no worries"

### Task 8 — Listening for Viewpoints

This is the most demanding task. A speaker discusses a community or social issue.

Strategy:
- Identify the speaker's MAIN argument in the first 30 seconds
- Note any numbers, statistics, or examples — frequently tested
- Watch for signal words: "the main point is...", "what concerns me is...", "I strongly believe..."
""",
            },
            {
                "title": "CELPIP Vocabulary & Canadian English — Everyday & Professional Contexts",
                "body": """## Vocabulary for CELPIP

CELPIP tests practical, everyday English in a Canadian context. Both informal and semi-formal registers appear frequently.

### Everyday Canadian Vocabulary

Common topics in CELPIP include housing, work, community events, healthcare, and transportation:

- Housing: landlord, tenant, lease agreement, utilities, condo, strata
- Work: shift, overtime, union, HR (human resources), probationary period
- Healthcare: walk-in clinic, referral, prescription, coverage, deductible
- Transport: transit pass, GO train, carpool, highway (not "motorway")

### Email & Correspondence Language

Formal:
- "I am writing to inquire about..."
- "Please do not hesitate to contact me should you require further information."
- "I look forward to your response."

Semi-formal:
- "Just wanted to check in about..."
- "Let me know if that works for you."
- "Happy to discuss this further."

Informal:
- "Hey [Name], hope you're doing well!"
- "Thanks so much for..."
- "Talk soon!"

### Polite Disagreement & Suggestions

CELPIP writing often asks you to suggest improvements or address problems diplomatically:

- Suggesting: "One option that might work well is...", "Have you considered...?"
- Disagreeing politely: "I see your point, though I wonder if...", "While I understand the reasoning, I think..."
- Complaining professionally: "I'm writing to bring to your attention an issue with...", "I hope this matter can be resolved at your earliest convenience."

### Grammar for CELPIP Band 7+

- Use of conditionals: "If the policy were changed, residents would benefit..."
- Relative clauses: "The proposal, which was discussed at last month's meeting, addresses..."
- Reported speech: "She mentioned that the deadline had been extended."

Note: CELPIP rewards natural, idiomatic language over overly formal or academic writing. Aim to sound like an educated, confident Canadian resident — not a textbook essay writer.
""",
            },
        ],
    },
]


class Command(BaseCommand):
    help = "Seed 30 test prep theory & strategy lessons into the Learn section (5 exams × 6 lessons)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing posts in these categories before re-seeding",
        )

    def handle(self, *args, **options):
        total_posts = 0
        for exam_data in EXAMS:
            cat_name = exam_data["category"]
            cat, created = Category.objects.get_or_create(name=cat_name)
            if created:
                self.stdout.write(f"  Created category: {cat_name}")
            else:
                self.stdout.write(f"  Category exists: {cat_name}")

            if options.get("reset"):
                deleted, _ = Post.objects.filter(categories=cat).delete()
                self.stdout.write(f"    Reset: deleted {deleted} existing posts")

            for lesson in exam_data["lessons"]:
                post, created = Post.objects.get_or_create(
                    title=lesson["title"],
                    defaults={"body": lesson["body"]},
                )
                if not created:
                    # Update body in case content changed
                    post.body = lesson["body"]
                    post.save(update_fields=["body"])
                post.categories.add(cat)
                total_posts += 1
                status = "Created" if created else "Updated"
                self.stdout.write(f"    {status}: {lesson['title'][:60]}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {total_posts} test prep lessons seeded across {len(EXAMS)} exam categories."
            )
        )
