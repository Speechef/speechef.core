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
            name='InterviewSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(max_length=150)),
                ('company_type', models.CharField(blank=True, max_length=100)),
                ('mode', models.CharField(choices=[('behavioral', 'Behavioral'), ('technical', 'Technical'), ('hr', 'HR / Competency'), ('mixed', 'Mixed')], default='behavioral', max_length=20)),
                ('difficulty', models.CharField(choices=[('easy', 'Entry Level'), ('medium', 'Mid Level'), ('hard', 'Senior Level')], default='medium', max_length=10)),
                ('turns', models.JSONField(default=list)),
                ('status', models.CharField(choices=[('active', 'Active'), ('finished', 'Finished')], default='active', max_length=10)),
                ('overall_score', models.IntegerField(blank=True, null=True)),
                ('summary_feedback', models.TextField(blank=True)),
                ('strengths', models.JSONField(default=list)),
                ('improvements', models.JSONField(default=list)),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('finished_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interview_sessions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-started_at'],
            },
        ),
    ]
