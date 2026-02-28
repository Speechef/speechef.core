"""
management command: python manage.py seed_testprep_expand

Adds more questions to existing exam sections without removing any existing data.
Orders start AFTER the existing max order per section — completely non-destructive.

Run after seed_testprep has already been run.
"""

from django.core.management.base import BaseCommand
from django.db.models import Max
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


def _get_section(exam_slug, section_slug):
    """Return an ExamSection or None if not found."""
    try:
        exam = Exam.objects.get(slug=exam_slug)
        return ExamSection.objects.get(exam=exam, slug=section_slug)
    except (Exam.DoesNotExist, ExamSection.DoesNotExist):
        return None


def _next_order(section):
    """Return the next available order number for a section."""
    max_order = section.questions.aggregate(max_order=Max('order'))['max_order']
    return (max_order or 0) + 1


def _add_questions(section, questions, band_descriptors=None):
    """Add a list of (qtype, prompt, diff, opts, correct) tuples starting after current max order."""
    start = _next_order(section)
    added = 0
    for i, q in enumerate(questions):
        qtype, prompt, diff = q[0], q[1], q[2]
        opts = q[3] if len(q) > 3 else None
        correct = q[4] if len(q) > 4 else None
        bd = band_descriptors
        _, created = ExamQuestion.objects.get_or_create(
            section=section,
            order=start + i,
            defaults={
                "question_type": qtype,
                "prompt": prompt,
                "difficulty": diff,
                "options": opts,
                "correct_answer": correct,
                "band_descriptors": bd,
            },
        )
        if created:
            added += 1
    return added


class Command(BaseCommand):
    help = "Expand test prep question banks — additive, non-destructive"

    def handle(self, *args, **options):
        total = 0
        total += self._expand_ielts()
        total += self._expand_toefl()
        total += self._expand_pte()
        total += self._expand_oet()
        total += self._expand_celpip()
        self.stdout.write(self.style.SUCCESS(f"\nDone. {total} new questions added across all exams."))

    # ─────────────────────────────────────────────────────────── IELTS ──────
    def _expand_ielts(self):
        total = 0

        # ── Speaking Part 1 (target: 12, existing: 5, add: 7) ───────────────
        s = _get_section("ielts-academic", "speaking-part-1")
        if s:
            qs = [
                ("free_speech", "What type of music do you enjoy listening to? Has your taste in music changed over the years?", "easy"),
                ("free_speech", "Do you prefer spending time indoors or outdoors? What activities do you enjoy in each setting?", "easy"),
                ("free_speech", "How do you usually keep in touch with friends and family? Do you prefer calling or messaging?", "easy"),
                ("free_speech", "What kinds of books or articles do you like to read? How often do you read for pleasure?", "medium"),
                ("free_speech", "How important is punctuality in your culture? Are you usually on time for appointments?", "medium"),
                ("free_speech", "What do you enjoy most about learning English? What do you find most challenging?", "medium"),
                ("free_speech", "How has your neighbourhood changed over the years? Do you think these changes are positive?", "medium"),
            ]
            added = _add_questions(s, qs, SPEAKING_BAND_DESCRIPTORS)
            total += added
            self.stdout.write(f"  IELTS Speaking Part 1: +{added} questions (total: {s.questions.count()})")

        # ── Speaking Part 2 (target: 8, existing: 3, add: 5) ────────────────
        s = _get_section("ielts-academic", "speaking-part-2")
        if s:
            qs = [
                ("free_speech", "Describe a time when you had to learn something new very quickly. You should say: what you had to learn, why you needed to learn it quickly, how you managed to learn it, and explain whether the experience was positive or negative overall.", "medium"),
                ("free_speech", "Describe an interesting conversation you had with a stranger. You should say: who the person was, where and when you met, what you talked about, and explain why the conversation was memorable.", "medium"),
                ("free_speech", "Describe a piece of technology you could not imagine living without. You should say: what it is, how you use it, how it has changed your daily life, and explain why it is so important to you.", "medium"),
                ("free_speech", "Describe a local business you like visiting. You should say: what type of business it is, how you discovered it, what makes it special, and explain why you would recommend it to others.", "medium"),
                ("free_speech", "Describe an achievement you are particularly proud of. You should say: what you achieved, how long it took to accomplish, what challenges you overcame, and explain why this achievement is significant to you personally.", "hard"),
            ]
            added = _add_questions(s, qs, SPEAKING_BAND_DESCRIPTORS)
            total += added
            self.stdout.write(f"  IELTS Speaking Part 2: +{added} questions (total: {s.questions.count()})")

        # ── Speaking Part 3 (target: 10, existing: 4, add: 6) ───────────────
        s = _get_section("ielts-academic", "speaking-part-3")
        if s:
            qs = [
                ("free_speech", "Do you think artificial intelligence will have a greater impact on employment or on daily life over the next 20 years? Why?", "hard"),
                ("free_speech", "How effective do you think international agreements are at addressing climate change? What are their main limitations?", "hard"),
                ("free_speech", "Some argue that social media has given ordinary people a stronger political voice. Others say it has increased division and misinformation. What is your view?", "hard"),
                ("free_speech", "In what ways does globalisation affect the preservation of local cultures and languages? Is this a cause for concern?", "hard"),
                ("free_speech", "To what extent do you think educational systems prepare young people for the demands of the modern workplace? What changes would you suggest?", "hard"),
                ("free_speech", "How do you think attitudes toward mental health have changed in your country? What still needs to improve?", "hard"),
            ]
            added = _add_questions(s, qs, SPEAKING_BAND_DESCRIPTORS)
            total += added
            self.stdout.write(f"  IELTS Speaking Part 3: +{added} questions (total: {s.questions.count()})")

        # ── Writing Task 1 (target: 8, existing: 2, add: 6) ─────────────────
        s = _get_section("ielts-academic", "writing-task-1")
        if s:
            qs = [
                ("essay_prompt", "The bar chart below compares the average number of hours per week that people in four age groups spent on different leisure activities — watching TV, reading, socialising, and exercise — in 2022. Summarise the key features and make relevant comparisons. Write at least 150 words.", "medium"),
                ("essay_prompt", "The two maps below show a university campus in 2000 and 2023. Describe the significant changes that have taken place, and identify any features that have remained the same. Write at least 150 words.", "medium"),
                ("essay_prompt", "The table below shows the top five countries by international tourist arrivals (in millions) for selected years between 2010 and 2022. Summarise the main trends and make comparisons where relevant. Write at least 150 words.", "medium"),
                ("essay_prompt", "The pie charts below compare the proportion of household spending on different categories (food, housing, transport, entertainment, health, other) in two countries — Country A and Country B — in 2021. Describe the key similarities and differences. Write at least 150 words.", "medium"),
                ("essay_prompt", "The flow diagram below illustrates the process of manufacturing recycled paper from used newspapers, from collection through to the finished product. Summarise the information by describing all stages of the process. Write at least 150 words.", "hard"),
                ("essay_prompt", "The line graph below shows the proportion of people aged 65 and over as a percentage of the total population in four countries (Japan, Germany, Brazil, and Nigeria) between 1980 and 2020, with projections to 2040. Describe the main trends and make relevant comparisons. Write at least 150 words.", "hard"),
            ]
            added = _add_questions(s, qs, WRITING_BAND_DESCRIPTORS)
            total += added
            self.stdout.write(f"  IELTS Writing Task 1: +{added} questions (total: {s.questions.count()})")

        # ── Writing Task 2 (target: 10, existing: 3, add: 7) ────────────────
        s = _get_section("ielts-academic", "writing-task-2")
        if s:
            qs = [
                ("essay_prompt", "Some people believe that the best way to improve public health is through government-led campaigns encouraging healthier lifestyles. Others argue that improving healthcare infrastructure and access is more effective. Discuss both views and give your opinion. Write at least 250 words.", "hard"),
                ("essay_prompt", "The rise of electric vehicles has been presented as a major solution to environmental pollution caused by transport. However, some people argue that the full environmental impact of electric vehicles is not as positive as claimed. To what extent do you agree or disagree? Write at least 250 words.", "hard"),
                ("essay_prompt", "Many young people today change careers multiple times rather than staying in one profession for their entire working lives. What are the advantages and disadvantages of this trend? Write at least 250 words.", "hard"),
                ("essay_prompt", "Some economists argue that the gap between rich and poor countries is widening despite increasing globalisation. What are the causes of this problem, and what measures could be taken to reduce global inequality? Write at least 250 words.", "hard"),
                ("essay_prompt", "It is often argued that zoos serve an important educational and conservation purpose. Others contend that keeping animals in captivity is fundamentally unethical. Discuss both views and give your own opinion. Write at least 250 words.", "hard"),
                ("essay_prompt", "In many countries, people are choosing to have children later in life or not at all. What are the reasons for this trend? Is it a positive or negative development for society? Write at least 250 words.", "hard"),
                ("essay_prompt", "Some people think that modern architecture should prioritise functionality and efficiency above all other considerations. Others believe that buildings should also be aesthetically beautiful and reflect cultural identity. Discuss both views. Write at least 250 words.", "hard"),
            ]
            added = _add_questions(s, qs, WRITING_BAND_DESCRIPTORS)
            total += added
            self.stdout.write(f"  IELTS Writing Task 2: +{added} questions (total: {s.questions.count()})")

        # ── Listening (target: 15, existing: 5, add: 10) ────────────────────
        s = _get_section("ielts-academic", "listening")
        if s:
            qs = [
                ("multiple_choice", "What does the speaker say is the most significant benefit of renewable energy over fossil fuels?", "easy",
                 ["Lower upfront installation costs", "Reduced long-term environmental impact", "Greater energy output per unit", "Ease of transportation across borders"],
                 "Reduced long-term environmental impact"),
                ("fill_blank", "The lecturer states that the first commercial wind farm in the UK was built in _______.", "medium", None, "1991"),
                ("multiple_choice", "In the campus radio interview, what solution does the student suggest to the accommodation shortage?", "medium",
                 ["Building new dormitories on the east campus", "Partnering with private landlords to create approved housing lists", "Reducing the number of international students admitted", "Converting unused office space into temporary student housing"],
                 "Partnering with private landlords to create approved housing lists"),
                ("fill_blank", "According to the lecture, the Great Barrier Reef has lost approximately _______ percent of its coral cover since 1985.", "medium", None, "50"),
                ("multiple_choice", "What does the professor argue is the main weakness of current carbon capture technologies?", "hard",
                 ["They are not technically feasible at large scale", "The energy cost of operation is prohibitively high", "They have not been tested in real-world conditions", "They only work effectively in tropical climates"],
                 "The energy cost of operation is prohibitively high"),
                ("fill_blank", "The speaker explains that the concept of 'planned obsolescence' was first described by the economist _______.", "hard", None, "Packard"),
                ("multiple_choice", "What does the library orientation speaker say about the inter-library loan service?", "easy",
                 ["It is only available to postgraduate students", "Books can be requested online and collected within five working days", "Physical books cannot be requested — only digital articles", "There is a fee per loan after the first three requests"],
                 "Books can be requested online and collected within five working days"),
                ("fill_blank", "The seminar speaker notes that high-income countries produce _______ times more electronic waste per person than low-income countries.", "hard", None, "5"),
                ("multiple_choice", "In the town planning meeting, why do local residents oppose the new supermarket development?", "medium",
                 ["It would increase traffic on residential streets", "The building design is considered architecturally inappropriate", "It would compete directly with the community market", "The planning application was submitted without public consultation"],
                 "It would increase traffic on residential streets"),
                ("fill_blank", "The speaker says that water scarcity currently affects over _______ billion people worldwide.", "medium", None, "2"),
            ]
            added = _add_questions(s, qs)
            total += added
            self.stdout.write(f"  IELTS Listening: +{added} questions (total: {s.questions.count()})")

        # ── Reading (target: 15, existing: 5, add: 10) ──────────────────────
        s = _get_section("ielts-academic", "reading")
        if s:
            qs = [
                ("multiple_choice", "According to the passage on urban heat islands, which of the following is identified as the most effective mitigation strategy?", "medium",
                 ["Increasing the height of urban buildings to improve air circulation", "Expanding green spaces and planting trees in city centres", "Banning private vehicle use during summer months", "Installing reflective roofing materials on all commercial buildings"],
                 "Expanding green spaces and planting trees in city centres"),
                ("fill_blank", "The article states that the human brain contains approximately _______ billion neurons.", "easy", None, "86"),
                ("multiple_choice", "What is the author's primary criticism of the 'sharing economy' model as described in paragraph 3?", "hard",
                 ["It concentrates wealth in a small number of technology companies", "It undermines worker protections and employment rights", "It is only viable in high-income urban environments", "It cannot compete with traditional service industries on quality"],
                 "It undermines worker protections and employment rights"),
                ("fill_blank", "The researcher found that children who spent time in natural environments showed a _______ percent improvement in attention span tests.", "medium", None, "20"),
                ("multiple_choice", "In the passage about cognitive decline, the author argues that:",
                 "hard",
                 ["Physical exercise has a more significant protective effect than mental stimulation",
                  "Social isolation is the single greatest risk factor for dementia",
                  "Lifestyle factors can significantly modify the risk of age-related cognitive decline",
                  "Current drug therapies are sufficient to reverse cognitive decline in most patients"],
                 "Lifestyle factors can significantly modify the risk of age-related cognitive decline"),
                ("fill_blank", "According to the article on deep-sea exploration, scientists have currently mapped less than _______ percent of the ocean floor in detail.", "medium", None, "25"),
                ("multiple_choice", "The word 'proliferation' as used in paragraph 5 of the passage about social media is closest in meaning to:", "easy",
                 ["decline", "regulation", "rapid spread", "commercialisation"],
                 "rapid spread"),
                ("fill_blank", "The author notes that the Amazon rainforest produces approximately _______ percent of the Earth's oxygen.", "easy", None, "20"),
                ("multiple_choice", "Which statement best represents the main argument in the passage about universal basic income?", "hard",
                 ["UBI would inevitably lead to reduced workforce participation", "The evidence for and against UBI is still insufficient to draw firm conclusions", "UBI has been proven effective in all pilot studies conducted to date", "UBI is only economically feasible in the wealthiest nations"],
                 "The evidence for and against UBI is still insufficient to draw firm conclusions"),
                ("multiple_choice", "According to the science passage, what distinguishes a scientific theory from a hypothesis?", "medium",
                 ["A theory is based on a single observation; a hypothesis requires multiple experiments", "A theory is a proven fact; a hypothesis is an educated guess", "A theory has been tested repeatedly and supported by substantial evidence; a hypothesis is an initial, testable explanation", "A theory applies to all scientific fields; a hypothesis is discipline-specific"],
                 "A theory has been tested repeatedly and supported by substantial evidence; a hypothesis is an initial, testable explanation"),
            ]
            added = _add_questions(s, qs)
            total += added
            self.stdout.write(f"  IELTS Reading: +{added} questions (total: {s.questions.count()})")

        self.stdout.write(self.style.SUCCESS("IELTS expansion complete."))
        return total

    # ─────────────────────────────────────────────────────────── TOEFL ──────
    def _expand_toefl(self):
        total = 0
        toefl_speaking_bd = {
            "delivery": "Speech is clear, fluid, and sustained with good pacing and naturalness",
            "language_use": "Effective and accurate use of grammar and vocabulary",
            "topic_development": "Ideas are coherent, well-developed, and relevant to the prompt",
        }

        # ── Speaking Task 1 (existing: 4, add: 6) ───────────────────────────
        s = _get_section("toefl-ibt", "speaking-task-1")
        if s:
            qs = [
                ("free_speech", "Do you think it is better to live in a large city or a small town? Use specific reasons and examples to support your answer.", "easy"),
                ("free_speech", "Some people prefer to plan their activities carefully in advance. Others prefer to be spontaneous. Which approach do you prefer and why?", "medium"),
                ("free_speech", "What is the most important quality a good teacher should have? Use reasons and examples to support your view.", "medium"),
                ("free_speech", "Do you agree or disagree: 'It is more important to enjoy your job than to earn a high salary.' Give reasons and examples.", "medium"),
                ("free_speech", "Describe an important environmental problem in your country and explain what you think should be done about it.", "hard"),
                ("free_speech", "Some people think that online communication has made relationships more superficial. Do you agree or disagree? Give specific reasons and examples.", "hard"),
            ]
            added = _add_questions(s, qs, toefl_speaking_bd)
            total += added
            self.stdout.write(f"  TOEFL Speaking Task 1: +{added} questions (total: {s.questions.count()})")

        # ── Speaking Task 2 (existing: 3, add: 3) ───────────────────────────
        s = _get_section("toefl-ibt", "speaking-task-2")
        if s:
            qs = [
                ("free_speech", "The reading passage introduces the psychological concept of 'anchoring bias.' The professor gives a classroom study that illustrates the concept. Describe the study and explain how it demonstrates the anchoring bias described in the reading. Preparation: 30 seconds. Response: 60 seconds.", "hard"),
                ("free_speech", "The reading passage describes 'mutualistic symbiosis' in ecological relationships. The professor then describes a specific example from marine biology. Summarise the example and explain how it relates to the concept in the reading. Preparation: 30 seconds. Response: 60 seconds.", "hard"),
                ("free_speech", "The reading passage discusses the history and decline of the gold standard in international finance. The professor adds a contemporary perspective. Summarise the professor's key points and explain how they extend the ideas in the reading. Preparation: 30 seconds. Response: 60 seconds.", "medium"),
            ]
            added = _add_questions(s, qs, toefl_speaking_bd)
            total += added
            self.stdout.write(f"  TOEFL Speaking Task 2: +{added} questions (total: {s.questions.count()})")

        # ── Writing Integrated (existing: 2, add: 3) ────────────────────────
        s = _get_section("toefl-ibt", "writing-integrated")
        if s:
            qs = [
                ("essay_prompt", "The reading passage presents three reasons why self-driving vehicles will be widely adopted within a decade. The lecture questions all three reasons with recent evidence. Summarise the main points of the lecture and explain how they cast doubt on the claims in the reading. Write 150–225 words.", "hard"),
                ("essay_prompt", "The reading passage argues that high-rise housing is the most sustainable solution to urban population growth. The lecture presents three counter-arguments. Summarise the lecture's points and explain how they challenge the reading's position. Write 150–225 words.", "hard"),
                ("essay_prompt", "The reading passage outlines the benefits of a four-day working week for employee wellbeing and productivity. The lecture complicates this picture with findings from trial programmes. Summarise the lecture's findings and explain how they relate to the reading. Write 150–225 words.", "medium"),
            ]
            added = _add_questions(s, qs, WRITING_BAND_DESCRIPTORS)
            total += added
            self.stdout.write(f"  TOEFL Writing Integrated: +{added} questions (total: {s.questions.count()})")

        # ── Writing Independent (existing: 2, add: 4) ───────────────────────
        s = _get_section("toefl-ibt", "writing-independent")
        if s:
            qs = [
                ("essay_prompt", "Some people believe that governments should regulate social media platforms to prevent the spread of misinformation. Others think this would infringe on freedom of speech. Do you agree or disagree that governments should regulate social media content? Use specific reasons and examples. Write at least 300 words.", "hard"),
                ("essay_prompt", "Do you agree or disagree with the following statement: 'Students learn more effectively through collaborative projects than through individual assignments.' Give specific reasons and examples. Write at least 300 words.", "hard"),
                ("essay_prompt", "Some people believe that learning a foreign language should be mandatory in all secondary schools. Others argue that students should have the freedom to choose their subjects. What is your opinion? Give specific reasons and examples. Write at least 300 words.", "medium"),
                ("essay_prompt", "Some companies now allow employees to work from home permanently. Others require employees to work in the office. Which policy do you think is better for both employees and organisations? Use specific reasons and examples. Write at least 300 words.", "medium"),
            ]
            added = _add_questions(s, qs, WRITING_BAND_DESCRIPTORS)
            total += added
            self.stdout.write(f"  TOEFL Writing Independent: +{added} questions (total: {s.questions.count()})")

        # ── Listening (existing: 4, add: 7) ─────────────────────────────────
        s = _get_section("toefl-ibt", "listening")
        if s:
            qs = [
                ("multiple_choice", "In the biology lecture, what does the professor say distinguishes active adaptation from passive adaptation in organisms?", "hard",
                 ["Active adaptation involves genetic mutation; passive adaptation does not", "Active adaptation is behavioural and occurs within an individual's lifetime; passive adaptation is evolutionary", "Active adaptation is faster than passive adaptation in all documented cases", "Active adaptation only occurs in vertebrates"],
                 "Active adaptation is behavioural and occurs within an individual's lifetime; passive adaptation is evolutionary"),
                ("multiple_choice", "What is the student's purpose in visiting the professor's office hours?", "easy",
                 ["To request an extension on the research paper deadline", "To ask for clarification about the grading rubric", "To discuss the possibility of changing their thesis topic", "To report a problem with their laboratory equipment"],
                 "To request an extension on the research paper deadline"),
                ("multiple_choice", "According to the art history lecture, what made the Impressionist movement controversial when it emerged in the 1870s?", "medium",
                 ["The artists used materials not approved by the Académie des Beaux-Arts", "It rejected the detailed realism valued by official art institutions", "Impressionist paintings depicted political subjects that were banned at the time", "The artists refused to exhibit in established galleries"],
                 "It rejected the detailed realism valued by official art institutions"),
                ("multiple_choice", "What conclusion does the economics professor draw about the relationship between minimum wage increases and employment?", "hard",
                 ["Higher minimum wages always lead to significant job losses in all sectors", "The employment effects depend heavily on local labour market conditions", "Minimum wage increases have no measurable effect on employment", "Only small increases below the inflation rate have neutral employment effects"],
                 "The employment effects depend heavily on local labour market conditions"),
                ("multiple_choice", "In the student-advisor conversation, what does the advisor recommend to meet the language requirement?", "medium",
                 ["Enrolling in an intensive summer language programme", "Submitting a writing portfolio in lieu of the standardised test", "Petitioning for an exemption based on prior academic experience", "Taking an online placement test to qualify for the advanced level"],
                 "Enrolling in an intensive summer language programme"),
                ("multiple_choice", "According to the psychology lecture, what is the 'fundamental attribution error'?", "hard",
                 ["The tendency to attribute our own failures to external factors while attributing others' failures to internal factors", "The tendency to overestimate the role of situational factors in explaining others' behaviour", "The tendency to make systematic errors when calculating probability", "The tendency to believe that our memory of past events is more accurate than it actually is"],
                 "The tendency to attribute our own failures to external factors while attributing others' failures to internal factors"),
                ("multiple_choice", "What does the professor imply about peer review in academic publishing?", "hard",
                 ["It is sufficient to guarantee the accuracy of all published research", "It is an imperfect process but essential for maintaining scholarly standards", "It should be replaced by open public commentary to increase transparency", "It primarily benefits publishers rather than the scientific community"],
                 "It is an imperfect process but essential for maintaining scholarly standards"),
            ]
            added = _add_questions(s, qs)
            total += added
            self.stdout.write(f"  TOEFL Listening: +{added} questions (total: {s.questions.count()})")

        # ── Reading (existing: 4, add: 7) ────────────────────────────────────
        s = _get_section("toefl-ibt", "reading")
        if s:
            qs = [
                ("multiple_choice", "The phrase 'catalytic effect' in paragraph 3 is closest in meaning to:", "easy",
                 ["a delayed reaction", "a triggering influence that accelerates change", "a temporary but measurable reduction", "an unintended consequence"],
                 "a triggering influence that accelerates change"),
                ("multiple_choice", "According to paragraph 2, what distinguishes a meteor from a meteorite?", "easy",
                 ["A meteor is larger than a meteorite", "A meteorite is a meteor that survives its passage through the atmosphere and lands on Earth", "A meteor originates from outside the solar system; a meteorite does not", "A meteorite is only found in polar regions"],
                 "A meteorite is a meteor that survives its passage through the atmosphere and lands on Earth"),
                ("multiple_choice", "Which of the following best describes the author's stance on genetically modified crops in the passage?", "hard",
                 ["Strongly opposed due to unknown long-term risks", "Uncritically supportive of their widespread adoption", "Cautiously favourable while acknowledging legitimate concerns", "Neutral — the author presents both sides without taking a position"],
                 "Cautiously favourable while acknowledging legitimate concerns"),
                ("multiple_choice", "Based on paragraph 5, what can be inferred about the impact of deforestation on local rainfall patterns?", "hard",
                 ["Deforestation has no measurable effect on regional precipitation", "Removing forest cover reduces local evapotranspiration, which can decrease rainfall", "Deforestation only affects rainfall in equatorial regions", "Increased rainfall typically follows deforestation due to reduced canopy interception"],
                 "Removing forest cover reduces local evapotranspiration, which can decrease rainfall"),
                ("multiple_choice", "In the sentence in paragraph 4, 'this assumption' refers to:", "medium",
                 ["The belief that economic growth always leads to environmental improvement", "The claim that international trade reduces cultural diversity", "The hypothesis that population density drives technological innovation", "The theory that democratic governments respond better to environmental crises"],
                 "The belief that economic growth always leads to environmental improvement"),
                ("multiple_choice", "According to the passage, which development most significantly contributed to the spread of the printing press in Europe?", "medium",
                 ["Royal patronage from European monarchies", "The availability of cheaper materials like vellum and cloth", "The pre-existing network of religious monasteries as distribution centres", "The high level of urban literacy in fifteenth-century Europe"],
                 "The pre-existing network of religious monasteries as distribution centres"),
                ("multiple_choice", "What is the main purpose of the passage about the placebo effect?", "medium",
                 ["To argue that most medicines are no more effective than placebos", "To describe the neurobiological mechanisms by which placebos can produce real physiological effects", "To criticise the use of placebo controls in clinical trials", "To explain why the placebo effect is stronger in some cultures than others"],
                 "To describe the neurobiological mechanisms by which placebos can produce real physiological effects"),
            ]
            added = _add_questions(s, qs)
            total += added
            self.stdout.write(f"  TOEFL Reading: +{added} questions (total: {s.questions.count()})")

        self.stdout.write(self.style.SUCCESS("TOEFL expansion complete."))
        return total

    # ──────────────────────────────────────────────────────────── PTE ───────
    def _expand_pte(self):
        total = 0
        pte_speaking_bd = {
            "oral_fluency": "Speech is smooth and effortless with natural rhythm and stress",
            "pronunciation": "Native-like articulation of English phonemes with natural intonation",
            "content": "Reads or describes all content accurately and completely",
        }

        # ── Read Aloud (existing: 4, add: 5) ─────────────────────────────────
        s = _get_section("pte-academic", "speaking-read-aloud")
        if s:
            qs = [
                ("free_speech", "Climate change represents one of the most pressing challenges of the twenty-first century, demanding coordinated action from governments, industries, and individuals worldwide. Rising global temperatures, driven primarily by greenhouse gas emissions, are linked to increasingly frequent extreme weather events, sea-level rise, and threats to food and water security.", "easy"),
                ("free_speech", "The field of behavioural economics has fundamentally challenged the classical economic assumption that human beings make decisions rationally and in their own best interest. Research has demonstrated that cognitive biases, emotional states, and social influences frequently lead to choices that deviate from what purely rational models would predict.", "medium"),
                ("free_speech", "Antibiotic resistance is emerging as one of the most serious threats to global health. When bacteria evolve the ability to resist the drugs designed to kill them, infections that were once easily treatable become dangerous or even fatal. The overuse of antibiotics in both human medicine and agriculture has significantly accelerated this evolutionary process.", "medium"),
                ("free_speech", "The development of the internet has fundamentally transformed the way human beings communicate, access information, conduct business, and participate in civic life. While this technological revolution has delivered extraordinary benefits, it has also introduced new challenges relating to privacy, security, misinformation, and the digital divide.", "medium"),
                ("free_speech", "Epigenetics, the study of changes in gene expression that do not involve alterations to the underlying DNA sequence, has significantly expanded our understanding of how environmental factors influence biological development. Research suggests that diet, stress, and environmental exposures can produce heritable changes in gene activity that persist across generations.", "hard"),
            ]
            added = _add_questions(s, qs, pte_speaking_bd)
            total += added
            self.stdout.write(f"  PTE Read Aloud: +{added} questions (total: {s.questions.count()})")

        # ── Describe Image (existing: 3, add: 5) ─────────────────────────────
        s = _get_section("pte-academic", "speaking-describe-image")
        if s:
            qs = [
                ("free_speech", "The double bar chart compares annual rainfall (in mm) and average temperature (in °C) across twelve months for two cities — Mumbai and London. Describe the key similarities and differences in climate patterns between the two cities.", "medium"),
                ("free_speech", "The diagram shows the water cycle, illustrating processes including evaporation, condensation, precipitation, surface runoff, and groundwater absorption. Describe the main stages of this process in sequence.", "medium"),
                ("free_speech", "The line graph shows the global smartphone penetration rate (percentage of population owning a smartphone) from 2013 to 2023, broken down by developed and developing nations. Describe the key trends and any significant gaps between the two groups.", "medium"),
                ("free_speech", "The table shows enrolment figures for five university faculties (Arts, Sciences, Engineering, Medicine, Law) over three academic years: 2018–19, 2020–21, and 2022–23. Describe the main changes and any notable trends.", "hard"),
                ("free_speech", "The diagram illustrates the process of crude oil refining, from the initial distillation of raw crude oil to the production of end products including petrol, diesel, kerosene, and bitumen. Describe the key stages of the refining process.", "hard"),
            ]
            added = _add_questions(s, qs, pte_speaking_bd)
            total += added
            self.stdout.write(f"  PTE Describe Image: +{added} questions (total: {s.questions.count()})")

        # ── Writing Essay (existing: 2, add: 5) ──────────────────────────────
        s = _get_section("pte-academic", "writing-essay")
        if s:
            qs = [
                ("essay_prompt", "Some people believe that the internet has made it easier for people to mislead others and spread false information. Others argue that the internet also makes it easier to fact-check and access accurate information. Discuss and give your own view. Write 200–300 words.", "medium"),
                ("essay_prompt", "In many countries, the gap between the highest and lowest income earners is growing. Some argue that this is an inevitable result of a free-market economy. Others argue that governments should intervene more actively to reduce inequality. Discuss and give your view. Write 200–300 words.", "hard"),
                ("essay_prompt", "With increasing globalisation, some languages are spoken by fewer and fewer people, and many are predicted to disappear in coming decades. Some people think that this is a natural and inevitable process. Others believe that steps should be taken to preserve minority languages. Discuss and give your view. Write 200–300 words.", "hard"),
                ("essay_prompt", "Some people think that the most effective way to reduce crime is to give longer prison sentences. Others argue that addressing the root causes of crime — such as poverty, poor education, and social inequality — is more effective. Discuss and give your perspective. Write 200–300 words.", "hard"),
                ("essay_prompt", "Space exploration is an expensive endeavour. Some people believe governments should redirect funds from space programmes to address pressing issues on Earth, such as poverty and climate change. Others believe space exploration is essential for human progress. Discuss both views. Write 200–300 words.", "hard"),
            ]
            added = _add_questions(s, qs, WRITING_BAND_DESCRIPTORS)
            total += added
            self.stdout.write(f"  PTE Writing Essay: +{added} questions (total: {s.questions.count()})")

        # ── Reading Fill Blanks (existing: 4, add: 5) ────────────────────────
        s = _get_section("pte-academic", "reading-fill-blanks")
        if s:
            qs = [
                ("fill_blank", "The _______ system of a country refers to all the institutions, laws, and structures through which the state exercises authority over its citizens.", "easy", None, "political"),
                ("fill_blank", "In chemistry, an element's _______ number is equal to the number of protons found in the nucleus of one of its atoms.", "easy", None, "atomic"),
                ("fill_blank", "The process by which organisms in a community change over time following a disturbance, eventually reaching a stable community known as the _______ community, is called ecological succession.", "medium", None, "climax"),
                ("fill_blank", "Economic _______ refers to a period of temporary economic decline during which trade and industrial activity are reduced, generally identified by a fall in GDP in two successive quarters.", "medium", None, "recession"),
                ("fill_blank", "The theory of _______ selection, first described by Charles Darwin, proposes that organisms with traits better suited to their environment tend to survive and reproduce more successfully.", "easy", None, "natural"),
            ]
            added = _add_questions(s, qs)
            total += added
            self.stdout.write(f"  PTE Reading Fill Blanks: +{added} questions (total: {s.questions.count()})")

        # ── Listening Multiple Choice (existing: 4, add: 6) ──────────────────
        s = _get_section("pte-academic", "listening-multiple-choice")
        if s:
            qs = [
                ("multiple_choice", "What does the speaker identify as the greatest challenge facing public transport systems in mid-sized cities?", "medium",
                 ["Insufficient government funding for infrastructure upgrades", "Low population density making frequent services financially unviable", "Competition from ride-sharing applications", "Ageing vehicle fleets that cannot accommodate modern accessibility requirements"],
                 "Low population density making frequent services financially unviable"),
                ("multiple_choice", "According to the researcher, what is the most significant limitation of current artificial intelligence systems in healthcare diagnostics?", "hard",
                 ["They cannot process medical images as accurately as human radiologists", "They require extremely large training datasets that may not always be representative", "They are too expensive for deployment in public healthcare systems", "Their recommendations cannot be legally acted upon without physician oversight"],
                 "They require extremely large training datasets that may not always be representative"),
                ("multiple_choice", "In the lecture about water management, what does the speaker say is the primary cause of aquifer depletion in agricultural regions?", "medium",
                 ["Industrial contamination of groundwater sources", "Over-extraction for irrigation using outdated techniques", "Climate change reducing annual rainfall in affected regions", "Increasing urban population placing demand on rural water resources"],
                 "Over-extraction for irrigation using outdated techniques"),
                ("multiple_choice", "What does the speaker conclude about the role of sleep in memory consolidation?", "hard",
                 ["Sleep duration has no measurable effect on the retention of new information", "REM sleep is specifically associated with the consolidation of procedural and emotional memories", "Deep sleep is only important for physical recovery, not cognitive processing", "The relationship between sleep and memory is consistent across all age groups"],
                 "REM sleep is specifically associated with the consolidation of procedural and emotional memories"),
                ("multiple_choice", "What is the speaker's main argument about organic farming?", "medium",
                 ["It consistently produces higher yields than conventional farming methods", "Its environmental benefits must be weighed against lower productivity per hectare", "It is economically viable only for small-scale farming operations", "Consumer demand for organic produce is insufficient to make it commercially sustainable"],
                 "Its environmental benefits must be weighed against lower productivity per hectare"),
                ("multiple_choice", "According to the economics lecture, what is the 'opportunity cost' of a decision?", "easy",
                 ["The financial cost of implementing the chosen option", "The value of the next-best alternative that is forgone by making a choice", "The total cost of all options that were not selected", "The difference in price between two competing products in the market"],
                 "The value of the next-best alternative that is forgone by making a choice"),
            ]
            added = _add_questions(s, qs)
            total += added
            self.stdout.write(f"  PTE Listening Multiple Choice: +{added} questions (total: {s.questions.count()})")

        self.stdout.write(self.style.SUCCESS("PTE expansion complete."))
        return total

    # ──────────────────────────────────────────────────────────── OET ───────
    def _expand_oet(self):
        total = 0
        oet_speaking_bd = {
            "intelligibility": "All speech is easily understood by a native speaker unfamiliar with the accent",
            "fluency": "Speech flows naturally with minimal hesitation; does not impede communication",
            "appropriateness": "Language is clinically appropriate and adapted to the patient's needs",
            "resources": "Wide range of vocabulary and grammar structures used accurately",
            "relationship_building": "Demonstrates empathy, actively listens, and builds therapeutic rapport",
        }
        oet_writing_bd = {
            "purpose": "The purpose of the letter is immediately clear and all required information is communicated",
            "content": "All relevant case note information is incorporated; no inaccuracies or omissions",
            "conciseness": "Letter is appropriately concise; no unnecessary detail or notes-style language",
            "layout": "Professional letter format with correct sections and appropriate register",
            "language": "Accurate grammar, vocabulary, and spelling appropriate for a medical professional",
        }

        # ── Speaking Role Play (existing: 3, add: 6) ─────────────────────────
        s = _get_section("oet", "speaking-role-play")
        if s:
            qs = [
                ("free_speech", "You are a registered nurse in a community health centre. Your patient, Mrs. Chen (55-year-old office worker), has recently been diagnosed with type 2 diabetes. She understands little about the condition and is worried about having to inject insulin. Your task: explain what type 2 diabetes is and how it differs from type 1, reassure her that most type 2 patients are managed initially with oral medication and lifestyle change, and give practical advice on diet and monitoring blood glucose. She seems overwhelmed and has questions about what she can eat.", "medium"),
                ("free_speech", "You are a physiotherapist in a hospital rehabilitation unit. Your patient, Mr. Kowalski (38-year-old builder), has had surgery to repair a torn anterior cruciate ligament (ACL). He is eager to return to work as soon as possible and underestimates the recovery time needed. Your task: explain the stages of ACL rehabilitation, clarify realistic timeframes for returning to light and then heavy physical work, and discuss the consequences of returning too early. Address his frustration and motivation to get back to work quickly.", "hard"),
                ("free_speech", "You are a hospital pharmacist. Your patient, Ms. Okafor (29-year-old teacher), has been prescribed sertraline (an SSRI) for the first time for anxiety disorder. She has concerns about becoming 'addicted' to antidepressants and is uncertain whether she wants to take medication at all. Your task: correct the misconception about addiction, explain how SSRIs work and why they take 2–4 weeks to show effect, describe common initial side effects (nausea, insomnia), and discuss what to expect at follow-up. Use empathy and respect her autonomy.", "hard"),
                ("free_speech", "You are a dentist in a general dental practice. Your patient, Mr. Ramirez (60-year-old), has been told he needs to have two teeth extracted due to severe periodontal disease. He is frightened about the procedure and wants to know if there is an alternative. Your task: explain why extraction is necessary at this stage, describe the extraction procedure in simple terms, explain local anaesthetic and what to expect during recovery, and discuss options for tooth replacement (dentures, bridge, implant). Be compassionate and address his fear throughout.", "hard"),
                ("free_speech", "You are an occupational therapist. Your patient, Mrs. Nguyen (74-year-old), has been referred following a fall at home that resulted in a fractured wrist. She lives alone and her family is concerned about her safety. Your task: conduct a brief functional assessment, discuss home hazard modification (removing rugs, installing grab rails, improving lighting), and explore whether she would be receptive to assistive devices or a home care assessment. She is resistant to changes, saying she has managed fine for years.", "medium"),
                ("free_speech", "You are a speech pathologist. You are meeting Mr. Obi (45-year-old businessman) for the first time. He was referred by his GP following a mild stroke three weeks ago that has left him with mild word-finding difficulties (anomia). He is distressed by the change in his communication ability and worried about returning to work. Your task: explain what anomia is, reassure him about the high recovery rates for mild post-stroke communication difficulties, outline a plan for therapy, and discuss strategies he can use immediately to manage in professional settings.", "hard"),
            ]
            added = _add_questions(s, qs, oet_speaking_bd)
            total += added
            self.stdout.write(f"  OET Speaking Role Play: +{added} questions (total: {s.questions.count()})")

        # ── Listening (existing: 4, add: 6) ──────────────────────────────────
        s = _get_section("oet", "listening")
        if s:
            qs = [
                ("multiple_choice", "In the physiotherapy session recording, what does the therapist identify as the patient's primary barrier to completing home exercises?", "medium",
                 ["Insufficient time due to work commitments", "Pain during the exercises as currently prescribed", "Lack of understanding of the exercise instructions", "Absence of appropriate equipment at home"],
                 "Pain during the exercises as currently prescribed"),
                ("fill_blank", "The ward nurse instructs the patient to take the prescribed anticoagulant at the same time each day and to avoid eating large amounts of foods high in vitamin _______, such as leafy green vegetables.", "medium", None, "K"),
                ("multiple_choice", "What is the main purpose of the public health lecture on vaccination?", "medium",
                 ["To explain how individual vaccines are manufactured", "To demonstrate how herd immunity protects vulnerable populations", "To argue that mandatory vaccination programmes are more effective than voluntary ones", "To compare the effectiveness of different vaccine types"],
                 "To demonstrate how herd immunity protects vulnerable populations"),
                ("fill_blank", "In the multidisciplinary team meeting, the registrar states that the patient's _______ function has improved significantly since commencing diuretic therapy.", "hard", None, "renal"),
                ("multiple_choice", "What does the GP explain to the patient about the difference between a viral and bacterial respiratory infection?", "easy",
                 ["Viral infections always require antibiotics; bacterial infections do not", "Bacterial infections typically resolve without treatment; viral infections require antiviral medication", "Viral infections cannot be treated with antibiotics and usually resolve without medication", "Both types respond equally well to rest and fluids alone"],
                 "Viral infections cannot be treated with antibiotics and usually resolve without medication"),
                ("fill_blank", "The surgeon explains that following a laparoscopic cholecystectomy, most patients are discharged within _______ to 24 hours if there are no complications.", "medium", None, "12"),
            ]
            added = _add_questions(s, qs)
            total += added
            self.stdout.write(f"  OET Listening: +{added} questions (total: {s.questions.count()})")

        # ── Writing Letter (existing: 2, add: 4) ─────────────────────────────
        s = _get_section("oet", "writing-letter")
        if s:
            qs = [
                ("essay_prompt", "Case notes: Patient: Mr. James Carter, 52-year-old truck driver. Presenting complaint: two-week history of progressive right knee pain, worse on stairs and prolonged standing. No history of trauma. Past history: BMI 34, mild hypertension managed with ramipril, non-smoker. Examination: crepitus on knee flexion, mild effusion, no ligament instability. X-ray: moderate medial compartment osteoarthritis. Initial management: NSAIDs, physiotherapy referral, weight management advice. Task: Write a referral letter to an orthopaedic surgeon for specialist assessment and consideration of further management options including possible joint replacement.", "hard"),
                ("essay_prompt", "Case notes: Patient: Miss Priya Sharma, 22-year-old university student. Admitted 3 days ago with first presentation of generalised tonic-clonic seizure. No prior seizure history. No family history of epilepsy. Investigations: MRI brain — normal. EEG — mild non-specific changes. Commenced on sodium valproate, no further seizures. Discharged today. Driving restrictions explained and acknowledged. Task: Write a discharge letter to her GP summarising the admission, current diagnosis, treatment commenced, and follow-up requirements including neurology outpatient appointment.", "hard"),
                ("essay_prompt", "Case notes: Patient: Mr. Ali Hassan, 67-year-old retired teacher. Referred for increasing difficulty swallowing solids over 3 months, weight loss of 6 kg. Past history: GORD (gastro-oesophageal reflux disease) managed with omeprazole, non-smoker, moderate alcohol use. Examination: mild epigastric tenderness. Task: Write an urgent referral letter to a gastroenterologist requesting endoscopy and specialist review. Highlight the clinical urgency given the symptoms and weight loss.", "hard"),
                ("essay_prompt", "Case notes: Patient: Mrs. Sandra Watts, 78-year-old retired nurse. Carer (husband, 80) is the main contact. Increasing confusion over 4 weeks. MMSE score: 18/30 today vs 26/30 six months ago. CT head: mild cortical atrophy consistent with age. Thyroid function, B12, folate, and renal function all normal. Likely diagnosis: early Alzheimer's dementia. Task: Write a referral letter to the Memory Assessment Service requesting formal neuropsychological assessment and diagnosis confirmation. Include relevant history, current presentation, and family situation.", "hard"),
            ]
            added = _add_questions(s, qs, oet_writing_bd)
            total += added
            self.stdout.write(f"  OET Writing Letter: +{added} questions (total: {s.questions.count()})")

        self.stdout.write(self.style.SUCCESS("OET expansion complete."))
        return total

    # ────────────────────────────────────────────────────────── CELPIP ──────
    def _expand_celpip(self):
        total = 0
        celpip_speaking_bd = {
            "coherence": "Ideas are clearly organised with logical progression and effective transitions",
            "vocabulary": "Wide and precise vocabulary used appropriately for the context",
            "listenability": "Speech is easy to follow; listener does not need to work hard to understand",
            "task_fulfillment": "All aspects of the task are addressed fully and relevantly",
        }

        # ── Speaking Opinion (existing: 4, add: 6) ───────────────────────────
        s = _get_section("celpip", "speaking-opinion")
        if s:
            qs = [
                ("free_speech", "One person believes that Canadian cities should implement congestion pricing — charging drivers a fee to enter busy downtown areas during peak hours. Another person argues this would unfairly disadvantage lower-income workers who depend on their cars. Which view do you agree with more? Give specific reasons.", "medium"),
                ("free_speech", "One speaker argues that Canada should reduce university tuition fees significantly, funded by higher taxes on corporations and high earners. Another argues that tuition fees ensure students value their education and that employers, not taxpayers, should fund post-secondary costs. Which argument do you find more compelling? Why?", "hard"),
                ("free_speech", "One person believes that Canadians should eat a predominantly plant-based diet to reduce the environmental impact of food production. Another says personal food choices are a matter of individual freedom and cultural identity. Discuss both views and give your own perspective.", "medium"),
                ("free_speech", "One speaker argues that children should not be allowed to use smartphones before the age of 14. Another says smartphones give children access to learning resources and help parents keep children safe. Which view do you agree with and why?", "easy"),
                ("free_speech", "One person believes that recycling programmes are highly effective and should be expanded. Another says recycling alone is insufficient without reducing overall consumption and improving product design. Which perspective do you find more persuasive? Give reasons.", "medium"),
                ("free_speech", "One speaker supports building more nuclear power plants as a reliable, low-carbon energy source. Another is concerned about safety, waste storage, and high construction costs. Which view do you find more convincing? Explain your reasoning with examples.", "hard"),
            ]
            added = _add_questions(s, qs, celpip_speaking_bd)
            total += added
            self.stdout.write(f"  CELPIP Speaking Opinion: +{added} questions (total: {s.questions.count()})")

        # ── Listening (existing: 4, add: 6) ──────────────────────────────────
        s = _get_section("celpip", "listening")
        if s:
            qs = [
                ("multiple_choice", "In the conversation between two colleagues, why does the man decide to take the later train home?", "easy",
                 ["He needs to finish a report before leaving the office", "He wants to avoid the evening rush hour", "His car is being serviced and a colleague offered him a lift", "He agreed to join the team for dinner after work"],
                 "He agreed to join the team for dinner after work"),
                ("multiple_choice", "According to the radio report, what is the city council's proposed solution to the shortage of affordable housing?", "medium",
                 ["Rezoning suburban areas to allow higher-density residential development", "Imposing a vacancy tax on empty properties owned by investors", "Restricting short-term rental platforms like Airbnb to owner-occupied properties", "Creating a public developer to build municipally owned rental housing"],
                 "Rezoning suburban areas to allow higher-density residential development"),
                ("multiple_choice", "In the voicemail message, what does the caller ask the listener to do before Friday?", "easy",
                 ["Submit the completed forms to the HR department in person", "Send the signed documents by email to the address on the form", "Call back to confirm receipt of the original package", "Update the emergency contact information on the employee portal"],
                 "Send the signed documents by email to the address on the form"),
                ("multiple_choice", "What does the school board official say is the primary reason for introducing year-round schooling in the pilot schools?", "medium",
                 ["To reduce the cost of maintaining school buildings during long summer closures", "To address learning loss that disproportionately affects lower-income students over the summer", "To better align the school calendar with parents' work schedules", "To increase the number of instructional hours and improve standardised test scores"],
                 "To address learning loss that disproportionately affects lower-income students over the summer"),
                ("multiple_choice", "In the podcast discussion about mental health in the workplace, what does the expert identify as the most effective employer intervention?", "hard",
                 ["Providing unlimited paid mental health leave for all employees", "Training managers to recognise early signs of burnout and respond with flexibility", "Mandating annual psychological assessments for all staff", "Offering subsidised gym memberships and wellness programme enrolments"],
                 "Training managers to recognise early signs of burnout and respond with flexibility"),
                ("multiple_choice", "What concern does the resident raise at the town hall meeting regarding the proposed bike lane expansion?", "medium",
                 ["The construction would eliminate on-street parking on a busy commercial street", "The design does not include adequate lighting for evening cycling", "The lane would run too close to a busy elementary school", "The project cost estimates are significantly higher than other cities have paid for similar infrastructure"],
                 "The construction would eliminate on-street parking on a busy commercial street"),
            ]
            added = _add_questions(s, qs)
            total += added
            self.stdout.write(f"  CELPIP Listening: +{added} questions (total: {s.questions.count()})")

        # ── Writing Email (existing: 2, add: 4) ──────────────────────────────
        s = _get_section("celpip", "writing-email")
        if s:
            qs = [
                ("essay_prompt", "Your community centre is planning to remove the only public computer lab in the building to create extra space for fitness equipment. You depend on this lab to access government services and complete online courses. Write an email to the community centre director: explain who uses the computer lab and for what purposes, describe the impact removing it would have, and suggest an alternative solution that meets both needs. Write 150–200 words.", "medium"),
                ("essay_prompt", "You recently purchased a laptop computer online from a large electronics retailer. The laptop arrived with a cracked screen and does not turn on. When you contacted customer service, you were told to ship it back at your own expense and wait 4–6 weeks for a replacement. Write an email to the customer service manager: clearly describe the problem, explain why the proposed resolution is unsatisfactory, and request a specific remedy with a reasonable deadline. Write 150–200 words.", "hard"),
                ("essay_prompt", "Your company recently changed its policy so that all employees must now be in the office five days a week, eliminating the remote working arrangement that has been in place for three years. You have found working from home significantly more productive and have important personal circumstances (caring for a young child) that make full-time office attendance difficult. Write an email to your manager: acknowledge the company's perspective, explain your situation clearly, and propose a flexible arrangement. Write 150–200 words.", "hard"),
                ("essay_prompt", "A close friend is planning to move to a new city to start a job at a company you know quite well. You worked there two years ago and have mixed feelings about the company culture and the role your friend has been offered. Write an email to your friend: share relevant positive information about the company, raise your specific concerns honestly but tactfully, and offer to talk more before they make a final decision. Write 150–200 words.", "medium"),
            ]
            added = _add_questions(s, qs, {
                "content": "All required points are addressed fully and accurately in the appropriate register",
                "coherence": "Ideas flow logically with effective use of linking expressions",
                "vocabulary": "Precise and varied vocabulary appropriate to the email context",
                "grammar": "Range of grammatical structures used with high accuracy",
            })
            total += added
            self.stdout.write(f"  CELPIP Writing Email: +{added} questions (total: {s.questions.count()})")

        # ── Reading (existing: 4, add: 6) ────────────────────────────────────
        s = _get_section("celpip", "reading")
        if s:
            qs = [
                ("multiple_choice", "According to the tenant's rights brochure, under what circumstances may a landlord legally enter a rental unit without prior notice?", "medium",
                 ["When they believe the tenant has caused damage to the property", "In an emergency where there is a risk to the safety of persons or property", "When the lease allows for monthly inspection visits", "When the tenant is more than two weeks behind on rent"],
                 "In an emergency where there is a risk to the safety of persons or property"),
                ("multiple_choice", "What is the main purpose of the opinion article about urban farming?", "easy",
                 ["To provide a how-to guide for starting a community garden", "To argue that urban agriculture can meaningfully contribute to city food security", "To compare the cost-efficiency of urban farms versus traditional agriculture", "To profile a specific urban farm project in a Canadian city"],
                 "To argue that urban agriculture can meaningfully contribute to city food security"),
                ("multiple_choice", "According to the employee handbook excerpt, which of the following actions is NOT considered a violation of the company's internet use policy?", "medium",
                 ["Using company email to forward chain messages or personal jokes", "Accessing social media during designated break periods on personal devices", "Downloading unlicensed software onto company-owned computers", "Using the company VPN to access streaming services while working remotely"],
                 "Accessing social media during designated break periods on personal devices"),
                ("multiple_choice", "What does the letter to the editor imply about the author's attitude toward the proposed downtown revitalisation plan?", "hard",
                 ["They are enthusiastically in favour and urge the council to proceed without delay", "They are opposed because the plan prioritises commercial interests over community needs", "They support the plan's goals but question the proposed timeline and cost estimates", "They believe the plan should be put to a public referendum before any work begins"],
                 "They support the plan's goals but question the proposed timeline and cost estimates"),
                ("multiple_choice", "In the workplace health and safety notice, what does the organisation advise all employees to do by the end of the month?", "easy",
                 ["Complete an online ergonomic assessment and submit their workstation adjustment form", "Attend a mandatory first aid and CPR recertification training session", "Update their emergency contact information in the HR system", "Sign and return the updated workplace harassment policy acknowledgement form"],
                 "Complete an online ergonomic assessment and submit their workstation adjustment form"),
                ("multiple_choice", "Based on the science article about sleep, which conclusion would the author most likely support?", "hard",
                 ["Adults who sleep fewer than six hours perform as well cognitively as those who sleep eight hours", "Chronic sleep deprivation has cumulative negative effects that cannot be fully reversed by a single night of recovery sleep", "Napping for thirty minutes can fully compensate for a night of inadequate sleep", "Sleep requirements decrease significantly after the age of forty"],
                 "Chronic sleep deprivation has cumulative negative effects that cannot be fully reversed by a single night of recovery sleep"),
            ]
            added = _add_questions(s, qs)
            total += added
            self.stdout.write(f"  CELPIP Reading: +{added} questions (total: {s.questions.count()})")

        self.stdout.write(self.style.SUCCESS("CELPIP expansion complete."))
        return total
