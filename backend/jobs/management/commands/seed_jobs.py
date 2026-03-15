from django.core.management.base import BaseCommand
from jobs.models import Jobs


SEED_JOBS = [
    {
        "title": "English Language Instructor",
        "company": "British Language Institute",
        "location": "London, UK",
        "remote": False,
        "employment_type": "full_time",
        "job_type": "Education",
        "job_rate": 45000,
        "min_speechef_score": 70,
        "required_languages": ["English"],
        "is_featured": True,
        "description": (
            "We are looking for a passionate English Language Instructor to join our growing team. "
            "You will design and deliver engaging lessons for adult learners at B1–C2 levels, "
            "assess student progress, and collaborate with curriculum developers. "
            "Cambridge CELTA or equivalent required. Experience with IELTS preparation is a plus."
        ),
        "url": "https://example.com/jobs/english-instructor",
    },
    {
        "title": "Online ESL Teacher",
        "company": "GlobalTalk Education",
        "location": "Remote",
        "remote": True,
        "employment_type": "part_time",
        "job_type": "Education",
        "job_rate": 25,
        "min_speechef_score": 60,
        "required_languages": ["English"],
        "is_featured": False,
        "description": (
            "Teach one-on-one English lessons to students across Asia and Latin America via video call. "
            "Flexible scheduling — you choose your hours. Minimum 10 hours/week. "
            "Native or near-native English proficiency required. Teaching certificate preferred but not mandatory."
        ),
        "url": "https://example.com/jobs/esl-teacher",
    },
    {
        "title": "Corporate Communications Specialist",
        "company": "Nexus Consulting Group",
        "location": "Toronto, Canada",
        "remote": False,
        "employment_type": "full_time",
        "job_type": "Communications",
        "job_rate": 65000,
        "min_speechef_score": 80,
        "required_languages": ["English", "French"],
        "is_featured": True,
        "description": (
            "Craft and manage internal and external communications for a 500-person professional services firm. "
            "Responsibilities include press releases, executive speechwriting, intranet content, and crisis communications. "
            "Bilingual English/French required. 3+ years in corporate communications."
        ),
        "url": "https://example.com/jobs/comms-specialist",
    },
    {
        "title": "Freelance Translator (English–Spanish)",
        "company": "LinguaLink Pro",
        "location": "Remote",
        "remote": True,
        "employment_type": "freelance",
        "job_type": "Translation",
        "job_rate": 35,
        "min_speechef_score": 65,
        "required_languages": ["English", "Spanish"],
        "is_featured": False,
        "description": (
            "Translate legal, medical, and technical documents from English to Spanish and vice versa. "
            "Per-word rate starting at $0.12 with bonuses for fast turnaround. "
            "ATA certification or equivalent strongly preferred. Portfolio of past work required."
        ),
        "url": "https://example.com/jobs/translator-en-es",
    },
    {
        "title": "Content Writer — English Learning Platform",
        "company": "Speechef",
        "location": "Remote",
        "remote": True,
        "employment_type": "contract",
        "job_type": "Content",
        "job_rate": 40,
        "min_speechef_score": 75,
        "required_languages": ["English"],
        "is_featured": True,
        "description": (
            "Create high-quality articles, exercises, and lesson scripts for our English learning platform. "
            "Topics include grammar, vocabulary, business English, and test preparation. "
            "SEO knowledge is a bonus. You'll work closely with our pedagogical team to ensure accuracy."
        ),
        "url": "https://example.com/jobs/content-writer",
    },
    {
        "title": "Academic English Tutor",
        "company": "Oxford Prep Academy",
        "location": "Oxford, UK",
        "remote": False,
        "employment_type": "part_time",
        "job_type": "Tutoring",
        "job_rate": 30,
        "min_speechef_score": 72,
        "required_languages": ["English"],
        "is_featured": False,
        "description": (
            "Support international undergraduate students with academic writing, reading comprehension, "
            "and presentation skills. Sessions are 1-on-1 or small groups. Term-time position with "
            "possibility of extension. Master's degree in English, Linguistics, or Education required."
        ),
        "url": "https://example.com/jobs/academic-tutor",
    },
    {
        "title": "Pronunciation Coach (Remote)",
        "company": "ClearSpeak Academy",
        "location": "Remote",
        "remote": True,
        "employment_type": "freelance",
        "job_type": "Coaching",
        "job_rate": 55,
        "min_speechef_score": 78,
        "required_languages": ["English"],
        "is_featured": False,
        "description": (
            "Help non-native professionals reduce accent and improve clarity for business settings. "
            "1-on-1 video sessions, tailored programs, and asynchronous feedback via recordings. "
            "Background in phonetics, speech therapy, or accent coaching required."
        ),
        "url": "https://example.com/jobs/pronunciation-coach",
    },
    {
        "title": "Business English Trainer — Banking Sector",
        "company": "Meridian Language Solutions",
        "location": "Dubai, UAE",
        "remote": False,
        "employment_type": "full_time",
        "job_type": "Corporate Training",
        "job_rate": 90000,
        "min_speechef_score": 82,
        "required_languages": ["English"],
        "is_featured": True,
        "description": (
            "Deliver customised Business English training programmes for banking and finance professionals. "
            "Work with executives on presentation skills, report writing, and negotiation language. "
            "Experience in financial services preferred. Salary inclusive of accommodation allowance."
        ),
        "url": "https://example.com/jobs/business-english-trainer",
    },
    {
        "title": "Bilingual Customer Support Agent (English/Mandarin)",
        "company": "TechFlow Asia",
        "location": "Singapore",
        "remote": False,
        "employment_type": "full_time",
        "job_type": "Customer Support",
        "job_rate": 42000,
        "min_speechef_score": 65,
        "required_languages": ["English", "Mandarin"],
        "is_featured": False,
        "description": (
            "Handle customer enquiries via chat, email, and phone in English and Mandarin. "
            "Resolve technical issues for B2B SaaS clients across Southeast Asia. "
            "Strong written English required for internal escalation reports. "
            "Training provided on our platform."
        ),
        "url": "https://example.com/jobs/bilingual-support",
    },
    {
        "title": "IELTS Preparation Instructor",
        "company": "ProTest Academy",
        "location": "Mumbai, India",
        "remote": False,
        "employment_type": "full_time",
        "job_type": "Test Prep",
        "job_rate": 35000,
        "min_speechef_score": 80,
        "required_languages": ["English"],
        "is_featured": False,
        "description": (
            "Prepare students for the IELTS Academic and General Training examinations. "
            "Focus areas: Writing Tasks 1 & 2, Speaking, and Listening. "
            "Demonstrated IELTS band 8.0+ or CELTA/DELTA required. "
            "Strong track record of helping students achieve band 7+ preferred."
        ),
        "url": "https://example.com/jobs/ielts-instructor",
    },
    {
        "title": "English Curriculum Developer",
        "company": "EduLearn Technologies",
        "location": "Remote",
        "remote": True,
        "employment_type": "contract",
        "job_type": "Curriculum Design",
        "job_rate": 50,
        "min_speechef_score": 75,
        "required_languages": ["English"],
        "is_featured": False,
        "description": (
            "Design interactive English language learning modules for a mobile-first platform. "
            "Create exercises, assessments, and learning pathways for A1–C1 learners. "
            "Background in instructional design and familiarity with CEFR framework essential."
        ),
        "url": "https://example.com/jobs/curriculum-developer",
    },
    {
        "title": "Subtitling & Captioning Specialist",
        "company": "StreamLang Media",
        "location": "Remote",
        "remote": True,
        "employment_type": "freelance",
        "job_type": "Media Localisation",
        "job_rate": 28,
        "min_speechef_score": 60,
        "required_languages": ["English"],
        "is_featured": False,
        "description": (
            "Transcribe, translate, and time-code English subtitles for documentary and corporate video content. "
            "Familiarity with Aegisub, SubRip, or similar tools required. "
            "Fast typist (60+ WPM). Attention to detail and on-time delivery essential."
        ),
        "url": "https://example.com/jobs/subtitling-specialist",
    },
    {
        "title": "English Language Program Manager",
        "company": "International Education Foundation",
        "location": "New York, USA",
        "remote": False,
        "employment_type": "full_time",
        "job_rate": 85000,
        "job_type": "Programme Management",
        "min_speechef_score": 85,
        "required_languages": ["English"],
        "is_featured": True,
        "description": (
            "Oversee a portfolio of English language programmes for adult immigrants and refugees. "
            "Manage a team of 12 instructors, handle grant reporting, and liaise with government partners. "
            "Master's in TESOL, Applied Linguistics, or Education Management required. "
            "5+ years of programme management experience."
        ),
        "url": "https://example.com/jobs/program-manager",
    },
    {
        "title": "Voice Actor — English E-learning Narration",
        "company": "SonicLearn Studios",
        "location": "Remote",
        "remote": True,
        "employment_type": "freelance",
        "job_type": "Voice Acting",
        "job_rate": 200,
        "min_speechef_score": 70,
        "required_languages": ["English"],
        "is_featured": False,
        "description": (
            "Record narration for English language learning courses targeting adult learners. "
            "Clear, neutral accent preferred. Home studio with professional microphone required. "
            "Rate is per finished hour of audio. Revision rounds included in rate."
        ),
        "url": "https://example.com/jobs/voice-actor",
    },
    {
        "title": "Multilingual Sales Development Rep (English + Hindi)",
        "company": "SaaS Global Inc.",
        "location": "Bangalore, India",
        "remote": False,
        "employment_type": "full_time",
        "job_type": "Sales",
        "job_rate": 38000,
        "min_speechef_score": 68,
        "required_languages": ["English", "Hindi"],
        "is_featured": False,
        "description": (
            "Identify and qualify leads for our B2B SaaS platform across the Indian and UK markets. "
            "Conduct outreach via email and phone in both English and Hindi. "
            "Strong written and spoken English essential for UK-facing communication. "
            "Sales training provided. Target-based incentives on top of base salary."
        ),
        "url": "https://example.com/jobs/sdr-en-hi",
    },
]


class Command(BaseCommand):
    help = "Seed the jobs board with sample English language and communication industry jobs."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing jobs before seeding.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            Jobs.objects.all().delete()
            self.stdout.write(self.style.WARNING("Deleted all existing jobs."))

        created_count = 0
        for item in SEED_JOBS:
            job, created = Jobs.objects.get_or_create(
                title=item["title"],
                company=item["company"],
                defaults={
                    "description": item["description"],
                    "location": item["location"],
                    "remote": item["remote"],
                    "employment_type": item["employment_type"],
                    "job_type": item["job_type"],
                    "job_rate": item["job_rate"],
                    "min_speechef_score": item["min_speechef_score"],
                    "required_languages": item["required_languages"],
                    "is_featured": item["is_featured"],
                    "url": item["url"],
                },
            )
            if created:
                created_count += 1
                self.stdout.write(f"  Created: {job.title} @ {job.company}")
            else:
                self.stdout.write(f"  Skipping existing: {job.title} @ {job.company}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. Created {created_count}/{len(SEED_JOBS)} jobs."
            )
        )
