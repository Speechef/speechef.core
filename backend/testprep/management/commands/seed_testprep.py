from django.core.management.base import BaseCommand
from testprep.models import Exam, ExamSection, ExamQuestion


class Command(BaseCommand):
    help = "Seed test prep data with IELTS and TOEFL sample questions"

    def handle(self, *args, **options):
        self._seed_ielts()
        self._seed_toefl()
        self.stdout.write(self.style.SUCCESS("Test prep data seeded successfully."))

    def _seed_ielts(self):
        exam, _ = Exam.objects.get_or_create(
            slug="ielts",
            defaults={
                "name": "IELTS Academic",
                "description": "International English Language Testing System — Academic module.",
                "sections": ["Speaking", "Writing", "Listening", "Reading"],
                "scoring_info": {
                    "scale": "0–9 bands",
                    "bands": {
                        "9": "Expert user",
                        "8": "Very good user",
                        "7": "Good user",
                        "6": "Competent user",
                        "5": "Modest user",
                    }
                },
                "is_active": True,
            }
        )

        section, _ = ExamSection.objects.get_or_create(
            exam=exam,
            slug="speaking-part-1",
            defaults={
                "name": "Speaking Part 1",
                "duration_seconds": 270,
                "instructions": "Answer questions about yourself and familiar topics. Speak naturally.",
                "order": 1,
            }
        )

        questions = [
            ("free_speech", "Tell me about your hometown. What do you like most about it?", "medium", 1),
            ("free_speech", "Do you enjoy reading? What kinds of books do you prefer?", "easy", 2),
            ("free_speech", "Describe a typical day in your life.", "easy", 3),
            ("free_speech", "How important is technology in your daily routine?", "medium", 4),
            ("free_speech", "What kind of music do you enjoy and why?", "easy", 5),
        ]

        for qtype, prompt, difficulty, order in questions:
            ExamQuestion.objects.get_or_create(
                section=section,
                order=order,
                defaults={
                    "question_type": qtype,
                    "prompt": prompt,
                    "difficulty": difficulty,
                    "band_descriptors": {
                        "fluency": "Speaks without noticeable effort or loss of coherence",
                        "vocabulary": "Uses a wide range of vocabulary",
                        "grammar": "Uses a wide range of structures",
                        "pronunciation": "Consistently produces precise pronunciation",
                    }
                }
            )

        self.stdout.write(f"  IELTS: {exam.name} seeded with {section.questions.count()} questions")

    def _seed_toefl(self):
        exam, _ = Exam.objects.get_or_create(
            slug="toefl",
            defaults={
                "name": "TOEFL iBT",
                "description": "Test of English as a Foreign Language — Internet-Based Test.",
                "sections": ["Speaking", "Writing", "Listening", "Reading"],
                "scoring_info": {
                    "scale": "0–120 total (0–30 per section)",
                    "levels": {
                        "24-30": "Advanced",
                        "18-23": "High-Intermediate",
                        "10-17": "Low-Intermediate",
                        "0-9": "Below Low-Intermediate",
                    }
                },
                "is_active": True,
            }
        )

        section, _ = ExamSection.objects.get_or_create(
            exam=exam,
            slug="speaking-task-1",
            defaults={
                "name": "Speaking Task 1 — Independent",
                "duration_seconds": 75,
                "instructions": "You have 15 seconds to prepare and 45 seconds to speak.",
                "order": 1,
            }
        )

        questions = [
            ("free_speech", "What is your favorite season of the year? Explain why using details and examples.", "medium", 1),
            ("free_speech", "Describe a person who has had a significant influence on your life.", "medium", 2),
            ("free_speech", "Some people prefer to live in the city; others prefer the countryside. Which do you prefer and why?", "hard", 3),
            ("free_speech", "Describe an activity you enjoy doing in your free time and explain why.", "easy", 4),
            ("free_speech", "What is the most important quality for a leader to have? Use examples to support your view.", "hard", 5),
        ]

        for qtype, prompt, difficulty, order in questions:
            ExamQuestion.objects.get_or_create(
                section=section,
                order=order,
                defaults={
                    "question_type": qtype,
                    "prompt": prompt,
                    "difficulty": difficulty,
                    "band_descriptors": {
                        "delivery": "Speech is clear with good pacing",
                        "language_use": "Effective use of grammar and vocabulary",
                        "topic_development": "Ideas are well developed with relevant details",
                    }
                }
            )

        self.stdout.write(f"  TOEFL: {exam.name} seeded with {section.questions.count()} questions")
