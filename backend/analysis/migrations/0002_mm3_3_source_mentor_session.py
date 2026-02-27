import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0001_initial'),
        ('mentorship', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='analysissession',
            name='source',
            field=models.CharField(
                choices=[('upload', 'Upload'), ('mentor_session', 'Mentor Session')],
                default='upload',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='analysissession',
            name='mentor_session',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='analysis_sessions',
                to='mentorship.mentorsession',
            ),
        ),
    ]
