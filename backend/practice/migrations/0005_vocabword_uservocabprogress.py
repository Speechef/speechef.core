import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('practice', '0004_gamesession'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='VocabWord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('word', models.CharField(max_length=100, unique=True)),
                ('definition', models.TextField()),
                ('example', models.TextField(blank=True)),
                ('exam_tags', models.JSONField(default=list)),
                ('difficulty', models.CharField(
                    choices=[('basic', 'Basic'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')],
                    max_length=15,
                )),
                ('order', models.IntegerField(default=0)),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='UserVocabProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('known', models.BooleanField(default=False)),
                ('reviewed_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='vocab_progress',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('word', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='user_progress',
                    to='practice.vocabword',
                )),
            ],
            options={
                'unique_together': {('user', 'word')},
            },
        ),
    ]
