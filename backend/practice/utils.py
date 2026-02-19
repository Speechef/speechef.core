from datetime import date, timedelta


def update_streak(user):
    """Update current_streak and longest_streak on the user's profile after a game session."""
    profile = user.profile
    today = date.today()

    if profile.last_played_date == today:
        return  # Already played today — no change needed

    if profile.last_played_date == today - timedelta(days=1):
        profile.current_streak += 1
    else:
        profile.current_streak = 1  # First-ever play or missed at least one day

    profile.longest_streak = max(profile.longest_streak, profile.current_streak)
    profile.last_played_date = today
    profile.save()
