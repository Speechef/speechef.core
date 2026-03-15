from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from community.models import Thread, Reply, ThreadVote


SEED_DATA = [
    {
        "category": "grammar",
        "title": "When to use 'which' vs 'that' in relative clauses?",
        "body": (
            "I always get confused between 'which' and 'that'. For example: "
            "'The book that I bought' vs 'The book which I bought'. "
            "Are they interchangeable? Is one more formal than the other?"
        ),
        "replies": [
            "Great question! 'That' is used for restrictive clauses (defines the noun, no comma) "
            "and 'which' for non-restrictive clauses (adds extra info, usually preceded by a comma). "
            "e.g. 'The book that I bought last week' vs 'My favourite book, which I lent you, is missing.'",
            "In American English the distinction is quite strict. British English is more flexible. "
            "A good rule of thumb: if you can drop the clause without changing the meaning of the sentence, use 'which' with a comma.",
        ],
        "accepted_reply_index": 0,
        "is_pinned": True,
    },
    {
        "category": "grammar",
        "title": "Present perfect vs simple past — what's the real difference?",
        "body": (
            "Native speakers seem to switch between 'I have eaten' and 'I ate' freely. "
            "When is each one correct? Does it depend on time markers?"
        ),
        "replies": [
            "Simple past is for a completed action at a specific time in the past ('I ate at 7 pm'). "
            "Present perfect links the past to the present — the exact time isn't important ('I've already eaten, so I'm not hungry').",
            "Also watch out for time markers: 'yesterday', 'last year', 'in 2020' force simple past. "
            "'Just', 'already', 'ever', 'never', 'so far' pair with present perfect.",
        ],
        "accepted_reply_index": None,
        "is_pinned": False,
    },
    {
        "category": "vocabulary",
        "title": "Best techniques for retaining new vocabulary long-term?",
        "body": (
            "I learn 20 words a day but forget them within a week. "
            "I've tried flashcards and word lists but nothing sticks. "
            "What actually works for long-term retention?"
        ),
        "replies": [
            "Spaced repetition is scientifically proven to work best. Apps like Anki schedule reviews "
            "just before you forget. Combine it with writing example sentences in your own words.",
            "Context is king. Instead of memorising a bare definition, read the word in 3–5 authentic "
            "sentences from native texts. Your brain encodes the word alongside real usage patterns.",
            "Use the word within 24 hours of learning it — in speech, writing, or even thinking. "
            "Active recall beats passive review every time.",
        ],
        "accepted_reply_index": 0,
        "is_pinned": False,
    },
    {
        "category": "vocabulary",
        "title": "What's the difference between 'affect' and 'effect'?",
        "body": (
            "I know this is a classic mix-up but I still second-guess myself every time. "
            "Is there a simple rule that covers most cases?"
        ),
        "replies": [
            "'Affect' is almost always a verb ('Stress affects sleep'). "
            "'Effect' is almost always a noun ('The effect was immediate'). "
            "A memory trick: RAVEN — Remember Affect Verb, Effect Noun.",
        ],
        "accepted_reply_index": 0,
        "is_pinned": False,
    },
    {
        "category": "pronunciation",
        "title": "How do I reduce my accent when speaking English?",
        "body": (
            "People often ask me to repeat myself, especially on phone calls. "
            "I want to sound clearer without losing my cultural identity. "
            "Any practical exercises?"
        ),
        "replies": [
            "Focus on stress and rhythm first — English is stress-timed, meaning stressed syllables "
            "are evenly spaced. Many accents sound unclear not because of individual sounds but because "
            "stress patterns differ. Try shadowing native speakers at 0.8x speed.",
            "Record yourself reading a short paragraph, then compare it with a native recording of the "
            "same text. Your ear quickly learns to spot differences you couldn't hear before.",
        ],
        "accepted_reply_index": None,
        "is_pinned": False,
    },
    {
        "category": "test_prep",
        "title": "IELTS Writing Task 2 — how to structure a band 7+ essay?",
        "body": (
            "I keep getting 6.0 for writing even though I think my ideas are good. "
            "Is the structure the issue? What does a band 7 essay actually look like?"
        ),
        "replies": [
            "Structure alone won't get you to 7 but a weak structure will hold you back. "
            "Aim for: Introduction (paraphrase + thesis), Body 1 (main argument + example), "
            "Body 2 (second argument + example), Conclusion (summary + final opinion). "
            "Each paragraph should open with a clear topic sentence.",
            "At band 7, examiners expect 'a range of complex structures used with some flexibility'. "
            "That means mixing relative clauses, conditionals, and passive voice naturally — not just "
            "dumping them in to show off.",
        ],
        "accepted_reply_index": 0,
        "is_pinned": False,
    },
    {
        "category": "test_prep",
        "title": "TOEFL vs IELTS — which is accepted more widely for immigration?",
        "body": (
            "I'm applying for Canadian permanent residency. The immigration consultant said either "
            "is accepted but I'm not sure which is easier or which universities prefer."
        ),
        "replies": [
            "For Canadian immigration (Express Entry) CLB scores come from IELTS Academic/General or CELPIP. "
            "TOEFL is not accepted for Express Entry — double-check this with IRCC's official site.",
            "For university admissions in Canada both are accepted, but many prefer IELTS. "
            "If you're comfortable with a computer-based test, TOEFL iBT might feel more natural.",
        ],
        "accepted_reply_index": 0,
        "is_pinned": False,
    },
    {
        "category": "writing",
        "title": "How do I make my emails sound more professional?",
        "body": (
            "My manager said my emails are too casual but I don't know what to change. "
            "Things like subject lines, greetings, and sign-offs — what's the standard?"
        ),
        "replies": [
            "Start with a clear subject line that states the action required: 'Action required: Q3 report approval by Friday'. "
            "Open with 'Dear [Name],' for formal external emails or 'Hi [Name],' internally. "
            "End with 'Kind regards' or 'Best regards' — avoid 'Thanks!' alone.",
            "Cut filler phrases like 'I hope this email finds you well' — busy readers skip them. "
            "Put your main request in the first two sentences. Use bullet points for multiple items.",
        ],
        "accepted_reply_index": None,
        "is_pinned": False,
    },
    {
        "category": "general",
        "title": "How many hours of English practice per day is realistic for a working adult?",
        "body": (
            "I work full-time and can't dedicate hours every evening. "
            "What's the minimum effective daily practice to actually improve?"
        ),
        "replies": [
            "30 focused minutes beats 2 unfocused hours. Consistency matters far more than volume. "
            "Even 15 minutes of deliberate practice (shadowing, writing, vocabulary review) daily "
            "compounds significantly over months.",
            "Stack it onto existing habits — listen to an English podcast during your commute, "
            "switch your phone language to English, read one news article at lunch. "
            "Immersion doesn't require free time; it requires environment design.",
        ],
        "accepted_reply_index": None,
        "is_pinned": False,
    },
    {
        "category": "general",
        "title": "Is it worth paying for a language tutor or are free resources enough?",
        "body": (
            "There are so many free apps and YouTube channels now. "
            "What does a paid tutor actually give you that free resources can't?"
        ),
        "replies": [
            "A tutor gives you real-time corrective feedback and a speaking partner who adapts to your level. "
            "Free resources are excellent for input (listening/reading) but terrible for output correction. "
            "If speaking and fluency are your goals, a tutor accelerates you much faster.",
            "Even one 30-minute session per week with a tutor, combined with free resources for the rest, "
            "is a highly cost-effective balance. Platforms like iTalki let you find affordable community tutors.",
        ],
        "accepted_reply_index": 0,
        "is_pinned": False,
    },
]


class Command(BaseCommand):
    help = "Seed the community forum with sample threads and replies."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing threads before seeding.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            Thread.objects.all().delete()
            self.stdout.write(self.style.WARNING("Deleted all existing threads."))

        # Get or create seed users
        admin_user, _ = User.objects.get_or_create(
            username="speechef_admin",
            defaults={"email": "admin@speechef.com", "is_staff": True},
        )
        if not admin_user.has_usable_password():
            admin_user.set_password("admin123")
            admin_user.save()

        helper_user, _ = User.objects.get_or_create(
            username="english_helper",
            defaults={"email": "helper@speechef.com"},
        )
        if not helper_user.has_usable_password():
            helper_user.set_password("helper123")
            helper_user.save()

        extra_user, _ = User.objects.get_or_create(
            username="learner_pro",
            defaults={"email": "learner@speechef.com"},
        )
        if not extra_user.has_usable_password():
            extra_user.set_password("learner123")
            extra_user.save()

        reply_authors = [helper_user, extra_user, admin_user]

        created_count = 0
        for item in SEED_DATA:
            thread, created = Thread.objects.get_or_create(
                title=item["title"],
                defaults={
                    "user": admin_user,
                    "body": item["body"],
                    "category": item["category"],
                    "is_pinned": item["is_pinned"],
                },
            )
            if not created:
                self.stdout.write(f"  Skipping existing thread: {thread.title[:60]}")
                continue

            created_count += 1

            # Add replies
            for i, reply_body in enumerate(item["replies"]):
                author = reply_authors[i % len(reply_authors)]
                reply = Reply.objects.create(
                    user=author,
                    thread=thread,
                    body=reply_body,
                )
                if item.get("accepted_reply_index") == i:
                    reply.is_accepted = True
                    reply.save(update_fields=["is_accepted"])

            # Add a couple of votes from helper users
            for voter in [helper_user, extra_user]:
                ThreadVote.objects.get_or_create(user=voter, thread=thread)

            self.stdout.write(f"  Created: {thread.title[:60]}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. Created {created_count}/{len(SEED_DATA)} threads."
            )
        )
