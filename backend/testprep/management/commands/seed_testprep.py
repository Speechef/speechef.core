from django.core.management.base import BaseCommand
from testprep.models import Exam, ExamSection, ExamQuestion

SPEAKING_BAND_DESCRIPTORS = {
    "fluency_coherence": "Speech flows naturally with minimal hesitation and ideas are logically connected",
    "lexical_resource": "Wide range of vocabulary used flexibly and precisely",
    "grammatical_range": "Wide range of structures used accurately and appropriately",
    "pronunciation": "Consistently precise pronunciation that is fully intelligible",
}

WRITING_BAND_DESCRIPTORS = {
    "task_achievement": "All parts of the task are fully addressed with relevant, extended ideas",
    "coherence_cohesion": "Information is well organised with skillful use of cohesive devices",
    "lexical_resource": "Wide range of vocabulary used with full flexibility and precision",
    "grammatical_range": "Wide range of grammatical structures used with full accuracy",
}


def _section(exam, slug, name, duration_seconds, instructions, order):
    sec, _ = ExamSection.objects.get_or_create(
        exam=exam, slug=slug,
        defaults={"name": name, "duration_seconds": duration_seconds,
                  "instructions": instructions, "order": order},
    )
    return sec


def _question(section, order, qtype, prompt, difficulty, options=None, correct_answer=None, band_descriptors=None):
    ExamQuestion.objects.get_or_create(
        section=section, order=order,
        defaults={
            "question_type": qtype,
            "prompt": prompt,
            "difficulty": difficulty,
            "options": options,
            "correct_answer": correct_answer,
            "band_descriptors": band_descriptors or SPEAKING_BAND_DESCRIPTORS,
        },
    )


class Command(BaseCommand):
    help = "Seed test prep data: IELTS, TOEFL, PTE, OET, CELPIP"

    def handle(self, *args, **options):
        self._seed_ielts()
        self._seed_toefl()
        self._seed_pte()
        self._seed_oet()
        self._seed_celpip()
        self.stdout.write(self.style.SUCCESS("All 5 exams seeded successfully."))

    # ─────────────────────────────────────────────────────────── IELTS ──────
    def _seed_ielts(self):
        exam, _ = Exam.objects.get_or_create(
            slug="ielts-academic",
            defaults={
                "name": "IELTS Academic",
                "description": (
                    "The International English Language Testing System is the world's most popular "
                    "English proficiency test. The Academic module is required for university admissions "
                    "and professional registration."
                ),
                "sections": [],
                "scoring_info": {
                    "scale": "0–9 bands (half-band increments)",
                    "passing_score": "Band 6.5–7.0 for most universities",
                    "bands": {
                        "9.0": "Expert user — complete command of the language",
                        "8.0": "Very good user — only occasional inaccuracies",
                        "7.0": "Good user — handles complex language well",
                        "6.0": "Competent user — generally effective command",
                        "5.0": "Modest user — partial command, coping with overall meaning",
                        "4.0": "Limited user — basic competence only",
                    },
                    "score_composition": "Average of Listening, Reading, Writing, Speaking",
                },
                "is_active": True,
            },
        )

        # ── Speaking Part 1 ──────────────────────────────────────────────────
        s = _section(exam, "speaking-part-1", "Speaking Part 1", 270,
                     "The examiner will ask you questions about familiar topics such as your home, family, work, studies and interests. This part lasts 4–5 minutes.", 1)
        for order, (prompt, diff) in enumerate([
            ("Tell me about your hometown. What do you like most about living there?", "easy"),
            ("Do you enjoy cooking? What kinds of food do you like to prepare at home?", "easy"),
            ("How do you usually spend your weekends? Has this changed since you were younger?", "easy"),
            ("How important is social media in your daily life? Do you think you use it too much?", "medium"),
            ("Describe the kind of work or study environment you prefer and explain why.", "medium"),
        ], 1):
            _question(s, order, "free_speech", prompt, diff)
        self.stdout.write(f"  IELTS: Speaking Part 1 — {s.questions.count()} questions")

        # ── Speaking Part 2 ──────────────────────────────────────────────────
        s = _section(exam, "speaking-part-2", "Speaking Part 2", 180,
                     "You will be given a topic card. You have 1 minute to prepare, then speak for 1–2 minutes. The examiner may ask one or two follow-up questions.", 2)
        for order, (prompt, diff) in enumerate([
            ("Describe a memorable journey you have taken. You should say: where you went, why you went there, what you did, and explain why this journey was memorable.", "medium"),
            ("Describe a book or film that had a strong impact on you. You should say: what it is about, when you encountered it, how it affected your thinking, and explain why it made such an impression.", "medium"),
            ("Describe a time when you helped someone who was in difficulty. You should say: who needed help, what the situation was, how you helped them, and explain how you felt afterwards.", "medium"),
        ], 1):
            _question(s, order, "free_speech", prompt, diff)
        self.stdout.write(f"  IELTS: Speaking Part 2 — {s.questions.count()} questions")

        # ── Speaking Part 3 ──────────────────────────────────────────────────
        s = _section(exam, "speaking-part-3", "Speaking Part 3", 360,
                     "The examiner will ask further questions connected to the topic in Part 2. This is a discussion requiring more abstract and analytical responses. This part lasts 4–5 minutes.", 3)
        for order, (prompt, diff) in enumerate([
            ("How has tourism changed local cultures in your country? Do you think this is mostly positive or negative?", "hard"),
            ("Do you think governments should prioritise investment in public transport over roads? Why or why not?", "hard"),
            ("In what ways has the internet changed how people communicate? Do you believe these changes are beneficial overall?", "hard"),
            ("Some people argue that cities are becoming too large. What problems does rapid urbanisation create, and how might they be addressed?", "hard"),
        ], 1):
            _question(s, order, "free_speech", prompt, diff)
        self.stdout.write(f"  IELTS: Speaking Part 3 — {s.questions.count()} questions")

        # ── Writing Task 1 ───────────────────────────────────────────────────
        s = _section(exam, "writing-task-1", "Writing Task 1", 1200,
                     "You should spend about 20 minutes on this task. You should write at least 150 words. Summarise the information from a diagram, chart, graph, or table. Select and report the main features and make comparisons where relevant.", 4)
        for order, (prompt, diff) in enumerate([
            ("The line graph below shows the percentage of households with internet access in three countries between 2005 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.", "medium"),
            ("The diagram below illustrates the stages in the water recycling process used by a large city. Summarise the information by describing the process shown. Write at least 150 words.", "medium"),
        ], 1):
            _question(s, order, "essay_prompt", prompt, diff, band_descriptors=WRITING_BAND_DESCRIPTORS)
        self.stdout.write(f"  IELTS: Writing Task 1 — {s.questions.count()} questions")

        # ── Writing Task 2 ───────────────────────────────────────────────────
        s = _section(exam, "writing-task-2", "Writing Task 2", 2400,
                     "You should spend about 40 minutes on this task. Present a written argument or case to an educated reader with no specialist knowledge. Write at least 250 words.", 5)
        for order, (prompt, diff) in enumerate([
            ("Some people believe that all university students should be free to choose any subjects they wish to study. Others argue that students should only study subjects that will lead to future employment. Discuss both views and give your own opinion. Write at least 250 words.", "hard"),
            ("Many people believe that social networking sites have had a largely negative impact on individuals and society. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.", "hard"),
            ("In many countries, the number of people choosing to live alone is increasing. Do you think this is a positive or negative development? Give reasons for your answer and include examples where relevant. Write at least 250 words.", "hard"),
        ], 1):
            _question(s, order, "essay_prompt", prompt, diff, band_descriptors=WRITING_BAND_DESCRIPTORS)
        self.stdout.write(f"  IELTS: Writing Task 2 — {s.questions.count()} questions")

        # ── Listening ────────────────────────────────────────────────────────
        s = _section(exam, "listening", "Listening", 1800,
                     "You will hear a recording and answer questions based on what you hear. You will hear each recording only once. Questions include multiple choice and gap-fill tasks.", 6)
        listening_qs = [
            ("multiple_choice", "Based on the talk, what is the main reason the speaker gives for the increase in urban migration?",
             "medium", ["Better employment opportunities in cities", "Effects of climate change on rural areas", "Expansion of social networks", "Government relocation policies"],
             "Better employment opportunities in cities"),
            ("fill_blank",
             "The speaker states that city populations in developing countries grew by _______ percent over the past decade.",
             "medium", None, "23"),
            ("multiple_choice",
             "According to the lecture, which factor is NOT listed as a challenge for urban planners?",
             "medium", ["Housing affordability", "Traffic congestion", "Air quality", "Water desalination"],
             "Water desalination"),
            ("fill_blank",
             "The presenter recommends _______ zoning as a key strategy to reduce urban sprawl.",
             "hard", None, "mixed-use"),
            ("multiple_choice",
             "What conclusion does the speaker draw about investment in public transport?",
             "hard", ["It should be scaled back in favour of road expansion", "It is the single most effective solution to congestion", "It requires coordinated international funding", "Its long-term benefits outweigh initial costs"],
             "Its long-term benefits outweigh initial costs"),
        ]
        for order, (qtype, prompt, diff, opts, correct) in enumerate(listening_qs, 1):
            _question(s, order, qtype, prompt, diff, options=opts, correct_answer=correct,
                      band_descriptors=None)
        self.stdout.write(f"  IELTS: Listening — {s.questions.count()} questions")

        # ── Reading ──────────────────────────────────────────────────────────
        s = _section(exam, "reading", "Reading", 3600,
                     "The Academic Reading test contains three long texts. Questions include multiple choice, identifying information, matching headings, and sentence completion.", 7)
        reading_qs = [
            ("multiple_choice",
             "According to the passage, what is the primary ecological role of biodiversity?",
             "medium", ["Economic value through ecosystem services", "Aesthetic value in natural landscapes", "Stability and resilience of ecosystems", "Raw material for pharmaceutical research"],
             "Stability and resilience of ecosystems"),
            ("fill_blank",
             "The author states that scientists estimate approximately _______ species are lost every single day due to deforestation.",
             "medium", None, "137"),
            ("multiple_choice",
             "Which conservation approach does the author argue is most effective in the long term?",
             "medium", ["Complete preservation with no human access", "Sustainable management integrating local communities", "Relocation of endangered species to urban reserves", "Laboratory-based genetic preservation"],
             "Sustainable management integrating local communities"),
            ("fill_blank",
             "The scientific term the author uses for the permanent loss of a species is _______.",
             "easy", None, "extinction"),
            ("multiple_choice",
             "The author's primary argument in the passage is that:",
             "hard", ["Climate change is the leading cause of biodiversity loss", "Economic development and conservation are incompatible", "International cooperation alone can prevent species loss", "Protecting biodiversity requires balancing human and ecological needs"],
             "Protecting biodiversity requires balancing human and ecological needs"),
        ]
        for order, (qtype, prompt, diff, opts, correct) in enumerate(reading_qs, 1):
            _question(s, order, qtype, prompt, diff, options=opts, correct_answer=correct,
                      band_descriptors=None)
        self.stdout.write(f"  IELTS: Reading — {s.questions.count()} questions")

        self.stdout.write(self.style.SUCCESS(f"IELTS Academic seeded: {exam.exam_sections.count()} sections"))

    # ─────────────────────────────────────────────────────────── TOEFL ──────
    def _seed_toefl(self):
        exam, _ = Exam.objects.get_or_create(
            slug="toefl-ibt",
            defaults={
                "name": "TOEFL iBT",
                "description": (
                    "The Test of English as a Foreign Language — Internet-Based Test is accepted by over "
                    "11,000 universities in more than 150 countries. It measures reading, listening, "
                    "speaking, and writing skills needed for academic success."
                ),
                "sections": [],
                "scoring_info": {
                    "scale": "0–120 total (0–30 per section)",
                    "passing_score": "80–100 for most universities",
                    "levels": {
                        "24–30": "Advanced",
                        "18–23": "High-Intermediate",
                        "10–17": "Low-Intermediate",
                        "0–9": "Below Low-Intermediate",
                    },
                    "score_composition": "Sum of Reading (0–30), Listening (0–30), Speaking (0–30), Writing (0–30)",
                },
                "is_active": True,
            },
        )

        # ── Speaking Task 1 ──────────────────────────────────────────────────
        s = _section(exam, "speaking-task-1", "Speaking Task 1 — Independent", 75,
                     "Express and defend a personal choice. Preparation time: 15 seconds. Response time: 45 seconds. Speak clearly and support your opinion with reasons and examples.", 1)
        toefl_speaking_bd = {
            "delivery": "Speech is clear, fluid, and sustained with good pacing and naturalness",
            "language_use": "Effective and accurate use of grammar and vocabulary",
            "topic_development": "Ideas are coherent, well-developed, and relevant to the prompt",
        }
        for order, (prompt, diff) in enumerate([
            ("What is your favourite season of the year and why? Use specific details and examples to support your choice.", "easy"),
            ("Some students prefer studying in groups; others prefer to study alone. Which do you prefer and why?", "medium"),
            ("Do you agree or disagree with the following statement: 'Technology has made modern life more complicated, not simpler.' Use reasons and examples to support your opinion.", "hard"),
            ("Describe a skill you have learned outside of school that you consider valuable. Explain why this skill is important to you.", "medium"),
        ], 1):
            _question(s, order, "free_speech", prompt, diff, band_descriptors=toefl_speaking_bd)
        self.stdout.write(f"  TOEFL: Speaking Task 1 — {s.questions.count()} questions")

        # ── Speaking Task 2 ──────────────────────────────────────────────────
        s = _section(exam, "speaking-task-2", "Speaking Task 2 — Integrated", 90,
                     "Read a short passage, then listen to a lecture on the same topic. Preparation time: 30 seconds. Response time: 60 seconds. Summarise the points made in the lecture and explain how they relate to the reading.", 2)
        for order, (prompt, diff) in enumerate([
            ("The reading passage describes the concept of 'spaced repetition' as a learning technique. The lecture challenges some of the assumptions made. Summarise the points made in the lecture and explain how they cast doubt on the reading's claims.", "hard"),
            ("The reading passage explains the phenomenon of 'decision fatigue.' The professor elaborates on this concept with a real-world study. Describe the study and explain how it supports the concepts in the reading passage.", "hard"),
            ("The reading passage presents arguments for and against remote working. The lecture provides new research findings. Summarise the lecture's key points and explain their relationship to the reading.", "medium"),
        ], 1):
            _question(s, order, "free_speech", prompt, diff, band_descriptors=toefl_speaking_bd)
        self.stdout.write(f"  TOEFL: Speaking Task 2 — {s.questions.count()} questions")

        # ── Writing Integrated ───────────────────────────────────────────────
        s = _section(exam, "writing-integrated", "Writing Task 1 — Integrated", 1200,
                     "You have 20 minutes to read a passage (3 minutes), listen to a related lecture, then write a response of 150–225 words. Summarise the points made in the lecture and explain how they relate to or challenge the reading.", 3)
        for order, (prompt, diff) in enumerate([
            ("The reading passage presents three arguments supporting the reintroduction of wolves into national parks. The lecture challenges all three arguments. Summarise the main points of the lecture and explain how they challenge the specific arguments made in the reading passage. Write 150–225 words.", "medium"),
            ("The reading passage argues that online learning is superior to traditional classroom instruction in several key respects. The lecture questions these claims using recent research. Summarise the lecture's points and explain how they undermine the reading passage. Write 150–225 words.", "hard"),
        ], 1):
            _question(s, order, "essay_prompt", prompt, diff, band_descriptors=WRITING_BAND_DESCRIPTORS)
        self.stdout.write(f"  TOEFL: Writing Integrated — {s.questions.count()} questions")

        # ── Writing Independent ──────────────────────────────────────────────
        s = _section(exam, "writing-independent", "Writing Task 2 — Independent", 1800,
                     "You have 30 minutes to plan and write an essay of at least 300 words. State, explain, and support your opinion on an issue.", 4)
        for order, (prompt, diff) in enumerate([
            ("Do you agree or disagree with the following statement: 'Universities should require all students to take courses outside their major field of study.' Use specific reasons and examples to support your answer. Write at least 300 words.", "hard"),
            ("Some people think that governments should spend money on building more public libraries. Others believe that money should be spent on improving internet access instead. Which view do you agree with? Use specific reasons and details to support your choice. Write at least 300 words.", "hard"),
        ], 1):
            _question(s, order, "essay_prompt", prompt, diff, band_descriptors=WRITING_BAND_DESCRIPTORS)
        self.stdout.write(f"  TOEFL: Writing Independent — {s.questions.count()} questions")

        # ── Listening ────────────────────────────────────────────────────────
        s = _section(exam, "listening", "Listening", 2400,
                     "Listen to lectures and conversations, then answer questions. Topics include academic subjects across a range of disciplines. Each audio is played once.", 5)
        toefl_listening = [
            ("multiple_choice",
             "According to the professor, what was the main factor that led to the decline of the Roman Empire?",
             "medium", ["Military overextension", "Economic inflation", "Political corruption", "Environmental degradation"],
             "Economic inflation"),
            ("multiple_choice",
             "What does the professor imply about the role of trade routes in ancient civilisations?",
             "hard", ["They were primarily used for military expansion", "They were the primary driver of cultural exchange", "They were controlled exclusively by central governments", "They had little impact on urban development"],
             "They were the primary driver of cultural exchange"),
            ("multiple_choice",
             "Listen to a student-advisor conversation. What is the student's main concern?",
             "easy", ["A scheduling conflict with two required courses", "A disagreement with a professor over a grade", "Uncertainty about choosing a major", "Difficulties with the online registration system"],
             "A scheduling conflict with two required courses"),
            ("multiple_choice",
             "Based on the ecology lecture, what distinguishes a 'keystone species' from other species in an ecosystem?",
             "hard", ["It is the most numerous species in the ecosystem", "Its removal causes disproportionate changes to the ecosystem", "It occupies the highest position in the food chain", "It has the widest geographic distribution"],
             "Its removal causes disproportionate changes to the ecosystem"),
        ]
        for order, (qtype, prompt, diff, opts, correct) in enumerate(toefl_listening, 1):
            _question(s, order, qtype, prompt, diff, options=opts, correct_answer=correct, band_descriptors=None)
        self.stdout.write(f"  TOEFL: Listening — {s.questions.count()} questions")

        # ── Reading ──────────────────────────────────────────────────────────
        s = _section(exam, "reading", "Reading", 3600,
                     "Read three passages of 700 words each on academic topics and answer associated questions. Question types include multiple choice, sentence simplification, and vocabulary questions.", 6)
        toefl_reading = [
            ("multiple_choice",
             "The word 'pivotal' in paragraph 2 is closest in meaning to:",
             "easy", ["controversial", "central", "unexpected", "gradual"],
             "central"),
            ("multiple_choice",
             "According to paragraph 4, which of the following best describes the relationship between photosynthesis and the global carbon cycle?",
             "hard", ["Photosynthesis has a negligible effect on atmospheric CO₂ levels", "Photosynthesis is one of the primary mechanisms removing CO₂ from the atmosphere", "Photosynthesis releases more CO₂ than it absorbs over a plant's lifetime", "Photosynthesis only affects carbon levels in aquatic environments"],
             "Photosynthesis is one of the primary mechanisms removing CO₂ from the atmosphere"),
            ("multiple_choice",
             "Which of the following statements about the Industrial Revolution would the author most likely agree with?",
             "hard", ["It had an exclusively positive impact on human welfare", "Its environmental consequences were not understood at the time", "Its negative effects were immediately apparent to contemporaries", "It is irrelevant to understanding modern economic systems"],
             "Its environmental consequences were not understood at the time"),
            ("multiple_choice",
             "What can be inferred from paragraph 6 about the long-term effects of agricultural monocultures?",
             "hard", ["They consistently increase crop yields over successive seasons", "They can degrade soil quality and reduce biodiversity over time", "They are the recommended approach by most agricultural scientists", "They have been largely abandoned in developed nations"],
             "They can degrade soil quality and reduce biodiversity over time"),
        ]
        for order, (qtype, prompt, diff, opts, correct) in enumerate(toefl_reading, 1):
            _question(s, order, qtype, prompt, diff, options=opts, correct_answer=correct, band_descriptors=None)
        self.stdout.write(f"  TOEFL: Reading — {s.questions.count()} questions")

        self.stdout.write(self.style.SUCCESS(f"TOEFL iBT seeded: {exam.exam_sections.count()} sections"))

    # ──────────────────────────────────────────────────────────── PTE ───────
    def _seed_pte(self):
        exam, _ = Exam.objects.get_or_create(
            slug="pte-academic",
            defaults={
                "name": "PTE Academic",
                "description": (
                    "Pearson Test of English Academic is a computer-based English language test for "
                    "non-native English speakers. Scores are accepted by thousands of universities and "
                    "colleges worldwide, and it is used for Australian and New Zealand visa applications."
                ),
                "sections": [],
                "scoring_info": {
                    "scale": "10–90 overall score",
                    "passing_score": "65+ for most universities; 79+ for Australian skilled migration",
                    "levels": {
                        "79–90": "Expert (CEFR C1+)",
                        "59–78": "Advanced (CEFR B2)",
                        "43–58": "Upper-intermediate (CEFR B1)",
                        "30–42": "Intermediate (CEFR A2/B1)",
                        "10–29": "Below intermediate",
                    },
                    "score_composition": "Enabling skills: Grammar, Oral Fluency, Pronunciation, Reading, Spelling, Vocabulary, Written Discourse",
                },
                "is_active": True,
            },
        )

        pte_speaking_bd = {
            "oral_fluency": "Speech is smooth and effortless with natural rhythm and stress",
            "pronunciation": "Native-like articulation of English phonemes with natural intonation",
            "content": "Reads or describes all content accurately and completely",
        }

        # ── Read Aloud ───────────────────────────────────────────────────────
        s = _section(exam, "speaking-read-aloud", "Speaking: Read Aloud", 600,
                     "You will see a text on screen. Read the text aloud as naturally and clearly as possible. You have 30–40 seconds to read each text. Your pronunciation, fluency, and accuracy are assessed.", 1)
        for order, (prompt, diff) in enumerate([
            ("The discovery of penicillin in 1928 by Alexander Fleming revolutionised modern medicine. Before antibiotics, even minor bacterial infections could prove fatal. Today, however, the overuse of antibiotics has led to the emergence of drug-resistant strains of bacteria, posing a significant challenge to global public health.", "easy"),
            ("Renewable energy sources such as solar and wind power have seen dramatic cost reductions over the past decade, making them increasingly competitive with fossil fuels. Despite this progress, integrating these intermittent energy sources into existing electrical grids presents significant engineering and policy challenges that must be carefully managed.", "medium"),
            ("The concept of neuroplasticity refers to the brain's remarkable ability to reorganise itself by forming new neural connections throughout life. This property allows neurons in the brain to compensate for injury and disease and to adjust their activities in response to new situations or environmental changes, challenging earlier assumptions that the adult brain was fixed and immutable.", "hard"),
            ("Urbanisation is one of the most significant demographic shifts of the twenty-first century, with more than half the world's population now living in cities. While urban environments offer access to economic opportunities and services, they also concentrate poverty, pollution, and social inequality in ways that require innovative governance and planning responses.", "medium"),
        ], 1):
            _question(s, order, "free_speech", prompt, diff, band_descriptors=pte_speaking_bd)
        self.stdout.write(f"  PTE: Read Aloud — {s.questions.count()} questions")

        # ── Describe Image ───────────────────────────────────────────────────
        s = _section(exam, "speaking-describe-image", "Speaking: Describe Image", 300,
                     "You will see an image — a graph, chart, map, or diagram. You have 25 seconds to study it and 40 seconds to describe it as fully as possible. Mention main trends, comparisons, and significant data points.", 2)
        for order, (prompt, diff) in enumerate([
            ("The bar chart shows the percentage of adults in five countries who reported exercising for at least 30 minutes three or more times per week in 2022. Describe the main features of this chart and make relevant comparisons between countries.", "medium"),
            ("The pie chart shows the breakdown of global electricity generation by source in 2023, including coal, natural gas, nuclear, hydropower, solar, wind, and other renewables. Describe the key features and highlight any notable proportions.", "medium"),
            ("The map shows changes in the layout of a town centre between 1990 and 2020. Describe the significant changes that have taken place, comparing the two time periods.", "hard"),
        ], 1):
            _question(s, order, "free_speech", prompt, diff, band_descriptors=pte_speaking_bd)
        self.stdout.write(f"  PTE: Describe Image — {s.questions.count()} questions")

        # ── Writing Essay ────────────────────────────────────────────────────
        s = _section(exam, "writing-essay", "Writing: Essay", 1200,
                     "You have 20 minutes to write a 200–300 word argumentative essay on the topic provided. You will be assessed on your ability to present and support a clear position with well-organised arguments.", 3)
        for order, (prompt, diff) in enumerate([
            ("Many organisations now use artificial intelligence to screen job applications and assist in hiring decisions. Some believe this improves fairness and efficiency; others argue it introduces new forms of bias and reduces human judgment. Discuss both perspectives and share your own view. Write 200–300 words.", "hard"),
            ("In many cities, private car ownership is increasing rapidly, creating problems with traffic and pollution. Some argue that governments should discourage car ownership through higher taxes. Others believe this would be unfair to lower-income households. Discuss the issue and provide your own perspective. Write 200–300 words.", "hard"),
        ], 1):
            _question(s, order, "essay_prompt", prompt, diff, band_descriptors=WRITING_BAND_DESCRIPTORS)
        self.stdout.write(f"  PTE: Writing Essay — {s.questions.count()} questions")

        # ── Reading Fill Blanks ──────────────────────────────────────────────
        s = _section(exam, "reading-fill-blanks", "Reading: Fill in the Blanks", 1200,
                     "Read each passage carefully and fill in each blank with the most appropriate word. Choose words that fit both grammatically and contextually.", 4)
        reading_fill = [
            ("fill_blank", "The process by which plants convert sunlight into chemical energy is called _______.", "easy", None, "photosynthesis"),
            ("fill_blank", "A country's _______ domestic product (GDP) is the total monetary value of all goods and services produced within its borders in a given year.", "easy", None, "gross"),
            ("fill_blank", "The study of the distribution of species and ecosystems across geographic space is known as _______.", "medium", None, "biogeography"),
            ("fill_blank", "In economics, the principle that an increase in the supply of a good, with demand held constant, will lead to a _______ in its price is fundamental to market theory.", "medium", None, "decrease"),
        ]
        for order, (qtype, prompt, diff, opts, correct) in enumerate(reading_fill, 1):
            _question(s, order, qtype, prompt, diff, options=opts, correct_answer=correct, band_descriptors=None)
        self.stdout.write(f"  PTE: Reading Fill Blanks — {s.questions.count()} questions")

        # ── Listening Multiple Choice ─────────────────────────────────────────
        s = _section(exam, "listening-multiple-choice", "Listening: Multiple Choice", 1800,
                     "Listen to short audio clips and select the correct answer. Some questions require one answer; others require you to select multiple correct answers.", 5)
        pte_listening = [
            ("multiple_choice",
             "What is the main purpose of the speaker's presentation?",
             "easy", ["To argue that renewable energy is too expensive", "To outline the economic case for transitioning away from fossil fuels", "To describe the engineering challenges of solar panel installation", "To compare different countries' energy policies"],
             "To outline the economic case for transitioning away from fossil fuels"),
            ("multiple_choice",
             "According to the speaker, which factor most significantly determines language acquisition speed in young children?",
             "medium", ["The quality of formal schooling", "The amount of screen time they have", "The richness of their social and linguistic environment", "Genetic predisposition to language learning"],
             "The richness of their social and linguistic environment"),
            ("multiple_choice",
             "What does the researcher conclude about the effectiveness of mindfulness meditation?",
             "hard", ["Its benefits are limited to clinical populations with anxiety disorders", "Long-term practice produces measurable structural changes in the brain", "It is equally effective regardless of the duration or frequency of practice", "Its benefits are primarily psychological rather than physiological"],
             "Long-term practice produces measurable structural changes in the brain"),
            ("multiple_choice",
             "What is the speaker's primary criticism of modern urban planning?",
             "hard", ["It prioritises aesthetics over functionality", "It often fails to account for future population growth", "It is excessively influenced by private developers", "It neglects the social dimensions of community wellbeing"],
             "It neglects the social dimensions of community wellbeing"),
        ]
        for order, (qtype, prompt, diff, opts, correct) in enumerate(pte_listening, 1):
            _question(s, order, qtype, prompt, diff, options=opts, correct_answer=correct, band_descriptors=None)
        self.stdout.write(f"  PTE: Listening Multiple Choice — {s.questions.count()} questions")

        self.stdout.write(self.style.SUCCESS(f"PTE Academic seeded: {exam.exam_sections.count()} sections"))

    # ──────────────────────────────────────────────────────────── OET ───────
    def _seed_oet(self):
        exam, _ = Exam.objects.get_or_create(
            slug="oet",
            defaults={
                "name": "OET",
                "description": (
                    "The Occupational English Test assesses English language proficiency for healthcare "
                    "professionals including doctors, nurses, pharmacists, and allied health professionals. "
                    "It is accepted by medical councils and nursing boards in Australia, New Zealand, UK, and beyond."
                ),
                "sections": [],
                "scoring_info": {
                    "scale": "Grade A (highest) to Grade E (lowest)",
                    "passing_score": "Grade B in all four sub-tests for most healthcare registration bodies",
                    "grades": {
                        "A": "Equivalent to IELTS 8.0–9.0 — Expert level",
                        "B": "Equivalent to IELTS 7.0–7.5 — Good user",
                        "C": "Equivalent to IELTS 5.5–6.5 — Competent user",
                        "D": "Equivalent to IELTS 4.0–5.0 — Limited user",
                        "E": "Below minimum required standard",
                    },
                    "score_composition": "Separate grades for Listening, Reading, Writing, and Speaking",
                },
                "is_active": True,
            },
        )

        oet_speaking_bd = {
            "intelligibility": "All speech is easily understood by a native speaker unfamiliar with the accent",
            "fluency": "Speech flows naturally with minimal hesitation; does not impede communication",
            "appropriateness": "Language is clinically appropriate and adapted to the patient's needs",
            "resources": "Wide range of vocabulary and grammar structures used accurately",
            "relationship_building": "Demonstrates empathy, actively listens, and builds therapeutic rapport",
        }

        # ── Speaking Role Play ───────────────────────────────────────────────
        s = _section(exam, "speaking-role-play", "Speaking: Role Play", 600,
                     "In each role play, you play a healthcare professional. The examiner plays the patient or carer. You will be given a card with the scenario and your role. Each role play lasts about 5 minutes. You are assessed on intelligibility, fluency, appropriateness of language, and relationship-building skills.", 1)
        for order, (prompt, diff) in enumerate([
            ("You are a nurse in a general practice clinic. Your patient, Mr. Thompson (72, retired), has been referred by his GP following high blood pressure readings. He has no prior history of cardiac issues. Explain what hypertension means, why it is concerning, discuss lifestyle modifications (diet, exercise, alcohol, smoking), and introduce the possibility of medication. He seems anxious and minimises his symptoms.", "medium"),
            ("You are a junior doctor in a hospital emergency department. A mother has brought in her 6-year-old son, who has been experiencing repeated episodes of wheezing. You need to take a focused history, explain that you suspect asthma, outline the next diagnostic steps (including spirometry), and reassure the mother while addressing her concerns about the diagnosis.", "hard"),
            ("You are a pharmacist. A patient in her 40s has been prescribed metformin for newly diagnosed type 2 diabetes. She is confused about why she needs medication when she has made dietary changes. Explain how metformin works, its potential side effects (especially gastrointestinal), and the importance of taking it with food. Address her concerns about long-term medication use.", "hard"),
        ], 1):
            _question(s, order, "free_speech", prompt, diff, band_descriptors=oet_speaking_bd)
        self.stdout.write(f"  OET: Speaking Role Play — {s.questions.count()} questions")

        # ── Listening ────────────────────────────────────────────────────────
        s = _section(exam, "listening", "Listening", 2700,
                     "You will hear recordings of healthcare consultations, interviews, and talks. Answer multiple choice and note completion questions based on what you hear.", 2)
        oet_listening = [
            ("multiple_choice",
             "In the consultation, why does the doctor decide NOT to prescribe antibiotics immediately?",
             "medium", ["The patient has a known allergy to penicillin", "The symptoms suggest a viral rather than bacterial infection", "The patient refuses medication on principle", "The clinic has run out of the relevant antibiotic"],
             "The symptoms suggest a viral rather than bacterial infection"),
            ("fill_blank",
             "The nurse advises the patient to take the iron supplements with _______ juice to improve absorption.",
             "easy", None, "orange"),
            ("multiple_choice",
             "What is the primary goal of the palliative care approach described in the lecture?",
             "hard", ["To cure the underlying disease as rapidly as possible", "To improve quality of life and relieve suffering", "To extend life expectancy through aggressive treatment", "To reduce the cost of end-of-life healthcare"],
             "To improve quality of life and relieve suffering"),
            ("fill_blank",
             "According to the physiotherapist, patients recovering from a hip replacement should avoid bending the hip beyond _______ degrees for the first six weeks.",
             "medium", None, "90"),
        ]
        for order, (qtype, prompt, diff, opts, correct) in enumerate(oet_listening, 1):
            _question(s, order, qtype, prompt, diff, options=opts, correct_answer=correct, band_descriptors=None)
        self.stdout.write(f"  OET: Listening — {s.questions.count()} questions")

        # ── Writing Letter ───────────────────────────────────────────────────
        s = _section(exam, "writing-letter", "Writing: Referral Letter", 2700,
                     "You have 45 minutes to write a professional referral or discharge letter of approximately 180–200 words. Use the case notes provided. Your letter should be appropriately structured, accurate, and free of unnecessary notes-style abbreviations.", 3)
        for order, (prompt, diff) in enumerate([
            ("Case notes: Patient is Mrs. Eleanor Davies, 68-year-old retired teacher. She presented with increasing shortness of breath on exertion over the past 3 months. Past history: hypertension (well-controlled on amlodipine 5mg), no prior cardiac history. Examination: mild bilateral ankle oedema, heart sounds — possible S3 gallop. ECG: sinus rhythm, no ST changes. CXR: mild cardiomegaly and early pulmonary oedema. Task: Write a referral letter to a cardiologist requesting an urgent outpatient appointment.", "hard"),
            ("Case notes: Patient is Mr. Arun Patel, 45-year-old accountant. Admitted 5 days ago with a right lower lobe pneumonia. Treated with IV amoxicillin/clavulanate, now switched to oral. Condition improving: afebrile for 48 hours, oxygen saturation 98% on room air. Discharged today with oral antibiotics for a further 5 days. Task: Write a discharge letter to the patient's GP summarising the admission, treatment, and follow-up plan.", "hard"),
        ], 1):
            _question(s, order, "essay_prompt", prompt, diff, band_descriptors={
                "purpose": "The purpose of the letter is immediately clear and all required information is communicated",
                "content": "All relevant case note information is incorporated; no inaccuracies or omissions",
                "conciseness": "Letter is appropriately concise; no unnecessary detail or notes-style language",
                "layout": "Professional letter format with correct sections and appropriate register",
                "language": "Accurate grammar, vocabulary, and spelling appropriate for a medical professional",
            })
        self.stdout.write(f"  OET: Writing Letter — {s.questions.count()} questions")

        self.stdout.write(self.style.SUCCESS(f"OET seeded: {exam.exam_sections.count()} sections"))

    # ────────────────────────────────────────────────────────── CELPIP ──────
    def _seed_celpip(self):
        exam, _ = Exam.objects.get_or_create(
            slug="celpip",
            defaults={
                "name": "CELPIP",
                "description": (
                    "The Canadian English Language Proficiency Index Program is Canada's leading English "
                    "language test. It is accepted by Immigration, Refugees and Citizenship Canada (IRCC) "
                    "for permanent residence and citizenship applications, and by many Canadian professional organisations."
                ),
                "sections": [],
                "scoring_info": {
                    "scale": "Level 1 (lowest) to Level 12 (highest)",
                    "passing_score": "Level 7 (CLB 7) required for most permanent residence applications",
                    "levels": {
                        "10–12": "Advanced proficiency (CLB 10–12)",
                        "8–9": "Upper-intermediate (CLB 8–9)",
                        "6–7": "Intermediate (CLB 6–7) — immigration threshold",
                        "4–5": "High-basic (CLB 4–5)",
                        "1–3": "Basic proficiency",
                    },
                    "score_composition": "Separate scores for Listening, Reading, Writing, and Speaking",
                },
                "is_active": True,
            },
        )

        celpip_speaking_bd = {
            "coherence": "Ideas are clearly organised with logical progression and effective transitions",
            "vocabulary": "Wide and precise vocabulary used appropriately for the context",
            "listenability": "Speech is easy to follow; listener does not need to work hard to understand",
            "task_fulfillment": "All aspects of the task are addressed fully and relevantly",
        }

        # ── Speaking Opinion ─────────────────────────────────────────────────
        s = _section(exam, "speaking-opinion", "Speaking: Give Your Opinion", 300,
                     "Listen to two people discussing an issue with opposing views. Then give your own opinion on the topic. You have 30 seconds to prepare and 90 seconds to speak. Support your opinion with reasons and examples.", 1)
        for order, (prompt, diff) in enumerate([
            ("One person argues that Canadian cities should invest heavily in cycling infrastructure to reduce car traffic. Another says this would be impractical given Canada's harsh winters and large geographic distances. Which view do you agree with more? Give specific reasons and examples to support your position.", "medium"),
            ("One speaker believes that all Canadian high school students should complete a mandatory year of community service before attending university. Another thinks this should be entirely voluntary. Share your perspective, explaining your reasoning clearly.", "medium"),
            ("One person argues that remote work is better for employees and should become the new standard. Another insists that in-person work fosters collaboration and company culture. Which position do you find more convincing, and why?", "hard"),
            ("One speaker argues that Canada should accept significantly more immigrants annually to address labour shortages. Another is concerned about the pressure this places on housing and public services. Discuss both perspectives and give your own view.", "hard"),
        ], 1):
            _question(s, order, "free_speech", prompt, diff, band_descriptors=celpip_speaking_bd)
        self.stdout.write(f"  CELPIP: Speaking Opinion — {s.questions.count()} questions")

        # ── Listening ────────────────────────────────────────────────────────
        s = _section(exam, "listening", "Listening", 2700,
                     "Listen to conversations, news reports, and discussions typical of everyday Canadian life. Answer multiple choice questions based on what you hear.", 2)
        celpip_listening = [
            ("multiple_choice",
             "Why does the woman decide not to take the earlier bus?",
             "easy", ["It is too crowded during rush hour", "It does not stop near her workplace", "Her shift does not begin until later in the morning", "The fare is significantly higher"],
             "Her shift does not begin until later in the morning"),
            ("multiple_choice",
             "What is the main point the radio presenter makes about the new housing policy?",
             "medium", ["It will make homes affordable for most first-time buyers within two years", "It addresses supply but may not resolve underlying affordability issues", "It is strongly opposed by the provincial government", "It will primarily benefit existing homeowners"],
             "It addresses supply but may not resolve underlying affordability issues"),
            ("multiple_choice",
             "In the community meeting recording, what concern is raised most frequently by residents?",
             "medium", ["The environmental impact of the proposed construction", "The lack of public consultation before the decision was made", "The increase in property taxes associated with the development", "The loss of green space in the neighbourhood"],
             "The lack of public consultation before the decision was made"),
            ("multiple_choice",
             "What does the college advisor recommend the student do before the application deadline?",
             "hard", ["Request a reference letter from a professor in their current programme", "Retake a prerequisite course to improve their GPA", "Submit a portfolio demonstrating relevant work experience", "Contact the admissions office directly to discuss eligibility"],
             "Request a reference letter from a professor in their current programme"),
        ]
        for order, (qtype, prompt, diff, opts, correct) in enumerate(celpip_listening, 1):
            _question(s, order, qtype, prompt, diff, options=opts, correct_answer=correct, band_descriptors=None)
        self.stdout.write(f"  CELPIP: Listening — {s.questions.count()} questions")

        # ── Writing Email ────────────────────────────────────────────────────
        s = _section(exam, "writing-email", "Writing: Email", 1200,
                     "You have 27 minutes to write an email of 150–200 words. Read the situation carefully and make sure you address all the points listed. Your email should be appropriately formal or informal depending on the context.", 3)
        for order, (prompt, diff) in enumerate([
            ("Your neighbour recently moved away and left a piece of furniture at your house temporarily. They have not contacted you in three months despite your messages. Write an email to your neighbour addressing the following points: remind them of the arrangement, explain how the situation has become inconvenient for you, and request a specific plan for collection or disposal. Write 150–200 words.", "medium"),
            ("You recently attended a professional development workshop organised by your employer. While some aspects were useful, you found the scheduling disruptive and the content only partially relevant to your role. Write an email to your HR department that: acknowledges what was valuable about the workshop, clearly explains your specific concerns, and suggests practical improvements for future sessions. Write 150–200 words.", "hard"),
        ], 1):
            _question(s, order, "essay_prompt", prompt, diff, band_descriptors={
                "content": "All required points are addressed fully and accurately in the appropriate register",
                "coherence": "Ideas flow logically with effective use of linking expressions",
                "vocabulary": "Precise and varied vocabulary appropriate to the email context",
                "grammar": "Range of grammatical structures used with high accuracy",
            })
        self.stdout.write(f"  CELPIP: Writing Email — {s.questions.count()} questions")

        # ── Reading ──────────────────────────────────────────────────────────
        s = _section(exam, "reading", "Reading", 2400,
                     "Read passages about everyday Canadian topics — including correspondence, articles, advertisements, and workplace documents — and answer multiple choice questions.", 4)
        celpip_reading = [
            ("multiple_choice",
             "According to the apartment rental advertisement, which of the following is included in the monthly rent?",
             "easy", ["Underground parking and a storage locker", "Water and heat but not electricity", "All utilities including internet and cable", "Heat only; all other utilities are separate"],
             "Water and heat but not electricity"),
            ("multiple_choice",
             "What is the primary purpose of the community newsletter article?",
             "easy", ["To warn residents about a recurring safety hazard in the park", "To announce volunteer opportunities for an upcoming neighbourhood event", "To promote a new local business that has opened nearby", "To outline changes to the municipal recycling programme"],
             "To announce volunteer opportunities for an upcoming neighbourhood event"),
            ("multiple_choice",
             "Based on the workplace policy document, under what circumstance may an employee take an unplanned absence without prior approval?",
             "medium", ["When a family member requires routine medical care", "In the event of a personal medical emergency or acute illness", "When they have unused vacation days available", "When approved in writing by their direct manager in advance"],
             "In the event of a personal medical emergency or acute illness"),
            ("multiple_choice",
             "What can be inferred from the letter to the editor about the author's view of the new transit expansion plan?",
             "hard", ["They support it unconditionally as an overdue investment", "They oppose it because of the financial cost to taxpayers", "They are cautiously supportive but concerned about implementation details", "They believe another city should serve as the model instead"],
             "They are cautiously supportive but concerned about implementation details"),
        ]
        for order, (qtype, prompt, diff, opts, correct) in enumerate(celpip_reading, 1):
            _question(s, order, qtype, prompt, diff, options=opts, correct_answer=correct, band_descriptors=None)
        self.stdout.write(f"  CELPIP: Reading — {s.questions.count()} questions")

        self.stdout.write(self.style.SUCCESS(f"CELPIP seeded: {exam.exam_sections.count()} sections"))
