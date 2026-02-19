from django.shortcuts import render
from django.db.models import Sum, Max

from practice.models import GameSession

_GAME_NAMES = {
    'guess': 'Guess the Word',
    'memory': 'Memory Match',
    'scramble': 'Word Scramble',
}


def home_index(request):
    streak_data = None
    recent_sessions = []
    stats = None
    recommended = None

    if request.user.is_authenticated:
        try:
            profile = request.user.profile
            current = profile.current_streak
            streak_data = {
                'current': current,
                'longest': profile.longest_streak,
                'circles': ['filled' if i < min(current, 7) else 'empty' for i in range(7)],
            }
        except Exception:
            pass

        recent_sessions = list(
            GameSession.objects.filter(user=request.user).order_by('-played_at')[:5]
        )

        game_stats = {}
        for key in ['guess', 'memory', 'scramble']:
            qs = GameSession.objects.filter(user=request.user, game=key)
            count = qs.count()
            best = qs.aggregate(best=Max('score'))['best'] or 0
            game_stats[key] = {'name': _GAME_NAMES[key], 'count': count, 'best': best}

        stats = {
            'total_games': sum(v['count'] for v in game_stats.values()),
            'total_score': GameSession.objects.filter(user=request.user).aggregate(
                total=Sum('score')
            )['total'] or 0,
            'per_game': game_stats,
        }

        # Recommend the game never played first, then the one with the lowest best score
        never_played = [k for k, v in game_stats.items() if v['count'] == 0]
        rec_key = never_played[0] if never_played else min(
            game_stats, key=lambda k: game_stats[k]['best']
        )
        recommended = {'key': rec_key, 'name': _GAME_NAMES[rec_key]}

    return render(request, 'home/index.html', {
        'streak_data': streak_data,
        'recent_sessions': recent_sessions,
        'stats': stats,
        'recommended': recommended,
    })
