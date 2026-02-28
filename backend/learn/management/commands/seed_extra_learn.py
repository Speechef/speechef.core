from django.core.management.base import BaseCommand
from learn.models import Category, Post

POSTS = [
    {
        "title": "Mastering Consonant Clusters",
        "categories": ["Pronunciation"],
        "body": """Chapter: 2
Difficulty: Medium

## Overview
Consonant clusters are groups of two or more consonants appearing together without an intervening vowel. English has some of the most complex cluster patterns in the world, and mastering them is essential for clear, natural-sounding speech.

## Key Techniques
- Practise minimal pairs to isolate each sound within the cluster
- Use slow-motion drilling: articulate each consonant individually before blending
- Record yourself and compare directly with a native speaker model
- Focus on the most frequent clusters first: str, spl, spr, thr, shr, sts
- Use a mirror to check lip and tongue position for each sound

## Common Trouble Spots
The clusters at word endings often cause difficulty, particularly -sts (tests), -lts (results), and -nths (months). Speakers whose first language has simpler syllable structures frequently insert a vowel between clustered consonants — for example, saying "e-school" instead of "school."

## Practical Exercises
Begin each practice session with five minutes of cluster drills. Tongue twisters such as "the sixth sick sheikh's sixth sheep's sick" are excellent for targeting multiple clusters in a single sentence. Progress from word level to phrase level to fully connected speech, increasing speed only when each word remains crisp and distinct.""",
    },
    {
        "title": "Accent Reduction: Finding Your Natural Voice",
        "categories": ["Pronunciation"],
        "body": """Chapter: 2
Difficulty: Hard

## Overview
Accent reduction does not mean eliminating your accent — it means making your speech more easily understood by a wider audience. The goal is clarity and confidence, not conformity to a single standard.

## Key Techniques
- Identify your target variety of English (British, American, Australian, Canadian)
- Conduct a thorough sound inventory to pinpoint which phonemes differ from your first language
- Shadow native speakers at a slow pace using scripted recordings
- Work with a coach who specialises in your language background
- Practise connected speech features: linking, reduction, and elision

## Understanding Your Starting Point
Every accent is systematic, not random. Once you identify the specific patterns that mark your speech, you can address them methodically rather than trying to change everything at once. Prioritise the sounds that cause the most misunderstandings in your everyday communication.

## Practical Exercises
Choose one podcast episode per week and shadow it for fifteen minutes daily. Keep a pronunciation journal noting sounds you have improved and those still requiring attention. Recording yourself weekly and comparing across sessions is the single most motivating form of feedback.""",
    },
    {
        "title": "The Role of Stress and Rhythm in English",
        "categories": ["Pronunciation", "Communication"],
        "body": """Chapter: 3
Difficulty: Hard

## Overview
English is a stress-timed language, meaning that stressed syllables occur at roughly regular intervals regardless of the number of unstressed syllables between them. This rhythm is one of the most distinctive — and most challenging — features of the language for learners.

## Key Techniques
- Learn which syllable is stressed in every new word you encounter
- Understand sentence-level stress: content words (nouns, verbs, adjectives) are stressed; function words (articles, prepositions) are reduced
- Use a metronome app to practise keeping stressed syllables on the beat
- Listen for the difference between stressed and unstressed vowels in natural speech
- Practise the schwa sound, the most common vowel in English unstressed syllables

## Why Rhythm Matters for Communication
Incorrect stress patterns can make speech difficult to follow, even when individual sounds are accurate. Native listeners rely heavily on the rhythm of speech to predict and process incoming information. Misplaced stress can change meaning entirely — for example, "record" (noun) versus "record" (verb).

## Practical Exercises
Read poetry aloud to develop a feel for English rhythm. News broadcasts are also excellent models of deliberate, clearly stressed speech. Clap or tap the stressed syllables as you listen to identify the beat pattern naturally.""",
    },
    {
        "title": "Breathing Techniques for Smoother Speech",
        "categories": ["Fluency"],
        "body": """Chapter: 1
Difficulty: Medium

## Overview
Breathing is the engine of speech. Without adequate breath support, even the most well-prepared speaker will find their voice fading, their pace rushing, and their articulation deteriorating. Developing conscious control of your breathing transforms the physical foundation of your communication.

## Key Techniques
- Practise diaphragmatic breathing: place one hand on your stomach and ensure it rises as you inhale
- Use the four-four-four method: inhale for four counts, hold for four, exhale for four
- Learn to replenish breath at natural pause points in your speech
- Avoid speaking on residual air — this creates a strained, breathy tone
- Practise sustained phonation: hold a single vowel sound for as long as possible on one breath

## The Connection Between Breath and Fluency
Many disfluency patterns — including rushing, filler words, and mid-sentence stumbles — are rooted in poor breath management. When speakers run out of air, they either gulp new breath mid-phrase or push words out on minimal air, both of which disrupt rhythm and reduce clarity.

## Practical Exercises
Spend five minutes each morning on diaphragmatic breathing before any speaking practice. Read aloud from a book, marking natural breath points with a pencil. Over time, phrasing your speech around your breath capacity will become automatic.""",
    },
    {
        "title": "Using Pauses Powerfully",
        "categories": ["Fluency", "Communication"],
        "body": """Chapter: 2
Difficulty: Medium

## Overview
The most underused tool in a speaker's toolkit is silence. A well-placed pause conveys authority, gives your audience time to absorb your message, and allows you to gather your thoughts without resorting to filler words. Learning to pause deliberately is one of the highest-leverage communication skills you can develop.

## Key Techniques
- Replace filler words (um, uh, like, you know) with deliberate silence
- Use a pause before important words to create anticipation
- Pause after key points to let them land with the audience
- Vary pause length: micro-pauses (0.5s) separate ideas; full pauses (1–2s) mark transitions
- Practise pausing during reading aloud before you use it in live conversation

## Why Silence Feels Difficult
Most people fill silence because it feels awkward to them — but audiences rarely experience it the same way. Research shows that listeners perceive pauses as thoughtful rather than hesitant when the speaker maintains confident eye contact and posture during the silence.

## Practical Exercises
Record a two-minute talk on any topic and count your filler words. Re-record the same talk replacing each filler with silence. Compare how both versions feel and sound. Most speakers are surprised to find the paused version sounds far more polished and credible.""",
    },
    {
        "title": "Eliminating Filler Words",
        "categories": ["Fluency"],
        "body": """Chapter: 2
Difficulty: Hard

## Overview
Filler words — um, uh, like, you know, sort of, basically — are a universal feature of spoken language. In small quantities, they are perfectly normal. When they dominate every sentence, however, they undermine credibility, slow down communication, and frustrate listeners. The good news is that filler words are a habit, and habits can be changed.

## Key Techniques
- Raise your awareness: track fillers in a single conversation or recorded talk
- Identify your personal triggers — fillers often spike when you are searching for a word or feeling anxious
- Practise the pause replacement technique: substitute silence for every filler
- Slow your speaking rate slightly to give your brain more processing time
- Use topic sentences: knowing your main point before you speak reduces mid-sentence searching

## The Psychology of Fillers
Fillers often emerge from a fear of silence. Speakers worry that pausing will make them seem unprepared, so they fill the gap with sound. Reframing silence as a rhetorical tool rather than a failure is the crucial mindset shift.

## Practical Exercises
Ask a trusted colleague to give you a discreet signal — such as tapping the table — each time you use a filler word in conversation. The immediate feedback loop accelerates awareness dramatically. After two weeks of this exercise, most people report a significant reduction in filler frequency.""",
    },
    {
        "title": "Phrasal Verbs Every English Speaker Should Know",
        "categories": ["Vocabulary"],
        "body": """Chapter: 1
Difficulty: Medium

## Overview
Phrasal verbs — combinations of a verb with a preposition or adverb that together create a new meaning — are one of the most challenging and most rewarding areas of English vocabulary. Native speakers use them constantly in both informal and professional conversation, so understanding them is essential for natural communication.

## Key Techniques
- Learn phrasal verbs in context rather than from isolated lists
- Group them by base verb: look up, look after, look into, look forward to
- Understand separable vs. inseparable phrasal verbs ("turn off the light" vs. "turn the light off")
- Notice when a phrasal verb can be replaced with a formal single-word synonym (carry out = execute)
- Use new phrasal verbs in your own sentences within 24 hours of learning them

## Essential Examples by Context
Professional settings: follow up, bring up, wrap up, take on, hand in, carry out
Everyday conversation: get along, look forward to, find out, give up, come up with
Learning and growth: catch up, keep up with, brush up on, figure out, take in

## Practical Exercises
Choose three phrasal verbs each week. Write one sentence using each verb, then use them in conversation that same day. Keep a running notebook of phrasal verbs you encounter in podcasts, films, and books — noting the sentence they appeared in for context.""",
    },
    {
        "title": "Mastering English Idioms",
        "categories": ["Vocabulary"],
        "body": """Chapter: 2
Difficulty: Medium

## Overview
Idioms are fixed expressions whose meaning cannot be deduced from the individual words. "Break a leg," "hit the nail on the head," and "costs an arm and a leg" are idioms — their literal meanings are nonsensical, but their figurative meanings are widely understood by native speakers. Mastering common idioms allows you to understand natural conversation and express ideas vividly.

## Key Techniques
- Learn idioms in their full form and context, not as disconnected phrases
- Study the origin of idioms to make them more memorable
- Group idioms by topic: body parts, animals, colours, weather
- Identify whether an idiom is formal, informal, or colloquial before using it
- Notice idioms in films, TV shows, and podcasts — they appear constantly in natural speech

## Common Idioms by Category
Body: get cold feet, keep an eye on, cost an arm and a leg, bite off more than you can chew
Weather: under the weather, every cloud has a silver lining, steal someone's thunder
Animals: let the cat out of the bag, kill two birds with one stone, elephant in the room

## Practical Exercises
Watch an episode of a TV drama with subtitles and highlight every idiom you notice. Look up any that are unfamiliar. Choose two or three to actively use in the following week. This active-use approach is far more effective than passive reading of idiom lists.""",
    },
    {
        "title": "Academic Word List: Expanding Formal Vocabulary",
        "categories": ["Vocabulary"],
        "body": """Chapter: 2
Difficulty: Hard

## Overview
The Academic Word List (AWL) is a research-based collection of 570 word families that appear frequently across a wide range of academic disciplines. Mastering these words significantly improves reading comprehension of academic texts, professional reports, and formal writing — and makes your own formal communication more precise and credible.

## Key Techniques
- Work through the AWL in order of frequency — the first 60 word families cover the vast majority of academic texts
- Learn each word in multiple forms: analyse (verb), analysis (noun), analytical (adjective), analytically (adverb)
- Use academic texts in your subject area as your primary reading material
- Practise using AWL words in your own writing before attempting to use them in speech
- Use a vocabulary notebook with example sentences drawn from real academic sources

## High-Value Word Families to Start With
Analyse, approach, area, assess, assume, authority, available, benefit, concept, context, create, data, define, distribute, economy, environment, establish, evidence, export, factor, finance, formula, function, identify, income, indicate, interpret, involve, issue, labour, legal, method, occur, percent, period, policy, principle, proceed, process, require, research, respond, role, section, significant, similar, source, specific, structure, theory.

## Practical Exercises
Read one academic article per week in your field of interest. Highlight every AWL word you encounter and note how it is used. Attempt to use at least five AWL words in any written work you produce that week. Over time, these words will move from conscious recall to natural, effortless use.""",
    },
    {
        "title": "Articles: A, An, The — Complete Guide",
        "categories": ["Grammar"],
        "body": """Chapter: 2
Difficulty: Easy

## Overview
Articles are among the smallest words in English, yet they carry significant meaning. Their correct use is one of the most persistent challenges for speakers whose first language has no article system. Understanding when to use a, an, and the — and when to use no article at all — is fundamental to natural English.

## The Three Articles
- A / An: the indefinite article — use when introducing something for the first time or referring to any member of a group
- The: the definite article — use when referring to something already mentioned, unique, or specific to context
- No article: use with uncountable nouns in general statements and plural nouns used generically

## When to Use A vs. An
The choice depends on the sound that follows, not the spelling.
- A before consonant sounds: a book, a university (u sounds like 'yu'), a European
- An before vowel sounds: an apple, an hour (h is silent), an MBA (em sound)

## When to Use The
- Second mention: I saw a dog. The dog was friendly.
- Unique referents: the sun, the moon, the President
- Shared context: Please close the door. (we both know which door)
- Superlatives: the best, the tallest building
- Rivers, oceans, mountain ranges: the Thames, the Pacific, the Alps

## When No Article Is Used
- General statements with plurals: Dogs are loyal. (dogs in general)
- General statements with uncountables: Water is essential.
- Most countries, cities, streets: France, London, Oxford Street
- Languages and subjects: She studies French. He teaches mathematics.

## Common Mistakes to Avoid
- Omitting the when context demands it: I went to the hospital. (specific building)
- Using the with general statements: The dogs are loyal implies specific dogs
- Confusing a/an based on spelling rather than sound: ❌ a hour → ✓ an hour

## Practice Exercise
Read a short news article and underline every article. For each one, ask: is this introducing something new (a/an) or referring to something specific (the)? Then write a paragraph about your city using all three correctly.""",
    },
    {
        "title": "Conditional Sentences: Zero, First, Second, Third",
        "categories": ["Grammar"],
        "body": """Chapter: 6
Difficulty: Hard

## Overview
Conditional sentences express the relationship between a condition and its result. English has four main types, each with a distinct structure and meaning. Mastering them gives you the ability to discuss real situations, hypothetical scenarios, and past regrets with precision.

## The Four Conditional Types

### Zero Conditional — General Truths
Structure: If + present simple, present simple
Example: If you heat water to 100°C, it boils.
Use: Scientific facts, universal truths, habits that always happen

### First Conditional — Real Future Possibility
Structure: If + present simple, will + infinitive
Example: If it rains tomorrow, we will reschedule the session.
Use: Situations that are genuinely possible or likely

### Second Conditional — Hypothetical Present or Future
Structure: If + past simple, would + infinitive
Example: If I had more time, I would practise every day.
Use: Unlikely or imaginary present/future situations

### Third Conditional — Hypothetical Past
Structure: If + past perfect, would have + past participle
Example: If she had studied harder, she would have passed the exam.
Use: Past situations that cannot be changed; expressing regret or relief

## Key Techniques
- The if-clause can come first or second without changing meaning
- Avoid mixing tenses within a single conditional type
- Practise contractions: would have → would've in natural speech
- Mixed conditionals combine types to express complex time relationships: If I had studied medicine (3rd), I would be a doctor now (2nd)

## Common Mistakes
- ❌ If I would have more time… → ✓ If I had more time…
- ❌ If she would study harder… → ✓ If she studied harder…
- ❌ If it will rain… → ✓ If it rains…

## Practice Exercise
Write two sentences for each conditional type. Then take a second conditional sentence and transform it into a third conditional — notice how the time frame shifts from present/future to past. This transformation exercise locks in the underlying logic of each type.""",
    },
    {
        "title": "Passive Voice: When and How to Use It",
        "categories": ["Grammar"],
        "body": """Chapter: 6
Difficulty: Hard

## Overview
The passive voice is one of the most frequently misunderstood grammatical structures in English. It is often taught as something to avoid, yet skilled writers and speakers use it purposefully. Understanding when the passive is the right choice — and when it is not — marks genuine grammatical sophistication.

## Forming the Passive
Structure: correct form of to be + past participle

Active: The manager approved the proposal.
Passive: The proposal was approved by the manager.

The tense of to be matches the tense of the active verb:
- Present simple: is/are + past participle → The report is written weekly.
- Past simple: was/were + past participle → The bridge was built in 1902.
- Present perfect: has/have been + past participle → The issue has been resolved.
- Future: will be + past participle → The results will be announced tomorrow.

## When to Use the Passive
- When the action is more important than the actor: The bridge was built in 1902.
- When the actor is unknown, unimportant, or obvious: The suspect was arrested.
- In formal and scientific writing where objectivity is valued
- To avoid assigning blame or responsibility directly

## Active vs. Passive — Choosing Wisely
Active voice is more direct and usually preferred in everyday communication.
Passive voice foregrounds the object or action — choose it when that is what matters most.
Neither is inherently better; the choice depends on what you want to emphasise.

## Common Mistakes
- Overusing the passive to avoid responsibility: Mistakes were made. (by whom?)
- Confusing the passive with stative verbs: I am interested is not passive — it describes a state
- Using intransitive verbs in the passive: ❌ The event was happened → intransitive verbs cannot be made passive

## Practice Exercise
Take a news article paragraph written in the active voice and rewrite it in the passive. Then reverse the exercise with a formal report. Reflect on what shifts: what information moves to the front? What feels more or less natural?""",
    },
    {
        "title": "Active Listening: The Key to Better Communication",
        "categories": ["Listening", "Communication"],
        "body": """Chapter: 1
Difficulty: Easy

## Overview
Communication is a two-way process, yet most people spend far more time thinking about how they speak than how they listen. Active listening — genuinely attending to and processing what another person is saying — is one of the most powerful skills in any communicator's repertoire. It builds trust, prevents misunderstanding, and makes the speaker feel genuinely heard.

## Key Techniques
- Maintain comfortable eye contact to signal engagement without staring
- Use minimal encouragers: nods, brief affirmations ("I see", "go on") that confirm you are following
- Resist the urge to formulate your response while the other person is still speaking
- Paraphrase what you heard before responding: "So what I'm hearing is…"
- Ask clarifying questions rather than making assumptions about meaning
- Notice tone, pace, and body language alongside the words themselves

## Barriers to Active Listening
- Internal distractions: planning your reply, mind-wandering, emotional reactions to what is being said
- External distractions: noise, phone notifications, other conversations
- Assumptions: hearing what you expect rather than what is actually said
- Judgement: evaluating the speaker rather than the content

## Practical Exercises
In your next significant conversation, challenge yourself to ask at least two clarifying questions before sharing your own view. After the conversation, write down three things you learned that you might have missed had you been less attentive. This debrief practice rapidly improves listening quality.""",
    },
    {
        "title": "Non-Verbal Communication Cues",
        "categories": ["Communication"],
        "body": """Chapter: 2
Difficulty: Medium

## Overview
Research consistently shows that the majority of the emotional impact of face-to-face communication is conveyed non-verbally — through facial expressions, body posture, gestures, eye contact, and physical proximity. Understanding and managing your non-verbal signals is therefore just as important as choosing the right words.

## Key Techniques
- Align your non-verbal signals with your verbal message — incongruence undermines credibility
- Maintain open body posture: uncrossed arms, relaxed shoulders, slight forward lean
- Use purposeful gestures to reinforce key points rather than fidgeting or self-touching
- Calibrate eye contact to the cultural context: what signals confidence in one culture may seem aggressive in another
- Manage microexpressions: brief flashes of genuine emotion that cross the face before conscious control can suppress them

## Reading Others' Non-Verbal Cues
Look for clusters of signals rather than interpreting any single cue in isolation. A crossed arm alone means little; combined with a turned body and minimal eye contact, it suggests disengagement or discomfort. Practise observing people in low-stakes environments — cafés, public transport — to sharpen your ability to read body language accurately.

## Practical Exercises
Watch a film or television drama with the sound off for five minutes. Try to infer the emotional content and power dynamics of each scene purely from non-verbal cues. Then replay with sound and compare your inferences with the actual dialogue. This exercise dramatically sharpens non-verbal awareness.""",
    },
    {
        "title": "Answering Behavioural Interview Questions (STAR Method)",
        "categories": ["Interview Skills"],
        "body": """Chapter: 1
Difficulty: Easy

## Overview
Behavioural interview questions ask you to describe how you have handled specific situations in the past, on the premise that past behaviour is the best predictor of future performance. The STAR method — Situation, Task, Action, Result — provides a clear framework for structuring answers that are compelling, concise, and credible.

## The STAR Framework

### Situation
Set the scene briefly. Give the interviewer just enough context to understand the challenge. Avoid excessive backstory — one to two sentences is usually sufficient.

### Task
Describe your specific responsibility in that situation. What were you personally accountable for? This distinguishes your individual contribution from the team's collective effort.

### Action
This is the most important component. Describe exactly what you did — the specific steps you took, the decisions you made, and why. Use "I" rather than "we" to make your individual contribution clear.

### Result
Quantify the outcome wherever possible. Numbers make results concrete and memorable: "reduced complaints by 30%", "delivered two weeks ahead of schedule", "increased team output by 15%."

## Key Techniques
- Prepare six to eight strong STAR stories that can be adapted to multiple questions
- Keep each answer to approximately two minutes in spoken form
- Practise out loud — written preparation alone is insufficient for interview performance
- Choose stories that demonstrate a range of competencies: leadership, problem-solving, collaboration, resilience
- Always end on a positive result, even if the situation was challenging

## Practical Exercises
Write out three STAR stories in full and then practise delivering them on video. Review the recording critically: is the action section specific enough? Is the result quantified? Are you speaking clearly and at an appropriate pace?""",
    },
    {
        "title": "Writing Clear Emails in Professional English",
        "categories": ["Writing"],
        "body": """Chapter: 1
Difficulty: Easy

## Overview
Email is the dominant medium of professional written communication, yet most professionals receive little formal training in how to write it well. A clear, well-structured email respects the reader's time, reduces the risk of misunderstanding, and reflects positively on the sender's professionalism. These principles apply whether you are writing to a colleague across the office or a client across the world.

## Key Techniques
- Write a subject line that is specific and action-oriented: "Action required: budget approval by Friday" rather than "Budget"
- State your purpose in the first sentence — do not bury the point at the bottom of a long preamble
- Use short paragraphs of two to four sentences; dense blocks of text are rarely read carefully
- Use numbered lists for sequential steps and bulleted lists for parallel items
- Close with a clear call to action: what do you need from the reader, and by when?
- Proofread every email before sending — typos and grammar errors undermine credibility

## Structure of an Effective Professional Email
- Subject line: specific and actionable
- Opening: friendly but purposeful ("I hope this finds you well" is optional; get to the point)
- Body: one main idea per paragraph; supporting details as bullets if needed
- Call to action: explicit request with a deadline
- Closing: professional and warm without being effusive

## Tone Calibration
Tone is notoriously difficult to convey in email because the reader cannot hear your voice or see your face. Default to slightly more formal than you think necessary, particularly with new contacts. Avoid sarcasm, which almost never lands as intended in written form.

## Practical Exercises
Review the last ten emails you sent and evaluate each against the principles above. Identify your most common weakness — vague subject lines, buried purpose, or no clear call to action — and focus on correcting that specific pattern for two weeks.""",
    },
]


class Command(BaseCommand):
    help = "Seed 16 additional learn posts (Pronunciation, Fluency, Vocabulary, Grammar, Listening, Interview Skills, Writing)"

    def handle(self, *args, **options):
        new_cats = ["Listening", "Interview Skills", "Writing"]
        for name in new_cats:
            cat, created = Category.objects.get_or_create(name=name)
            self.stdout.write(f"  {'Created' if created else 'Exists'}: category '{name}'")

        for item in POSTS:
            post, created = Post.objects.get_or_create(
                title=item["title"],
                defaults={"body": item["body"]},
            )
            if not created:
                post.body = item["body"]
                post.save(update_fields=["body"])
            for cat_name in item["categories"]:
                cat = Category.objects.get(name=cat_name)
                post.categories.add(cat)
            self.stdout.write(f"  {'Created' if created else 'Updated'}: {item['title'][:60]}")

        self.stdout.write(self.style.SUCCESS(f"Done. {len(POSTS)} posts seeded."))
