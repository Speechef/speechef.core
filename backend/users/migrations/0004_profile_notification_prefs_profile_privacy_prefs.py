from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_notification_badge_userbadge'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='notification_prefs',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='profile',
            name='privacy_prefs',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
