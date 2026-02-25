from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='RolePlaySession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mode', models.CharField(choices=[('job_interview', 'Job Interview'), ('presentation', 'Presentation Pitch'), ('debate', 'Debate'), ('small_talk', 'Small Talk')], max_length=30)),
                ('topic', models.CharField(blank=True, max_length=200)),
                ('turns', models.JSONField(default=list)),
                ('score', models.IntegerField(blank=True, null=True)),
                ('ai_feedback', models.TextField(blank=True)),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('finished_at', models.DateTimeField(blank=True, null=True)),
                ('status', models.CharField(choices=[('active', 'Active'), ('finished', 'Finished')], default='active', max_length=10)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='roleplay_sessions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-started_at'],
            },
        ),
    ]
