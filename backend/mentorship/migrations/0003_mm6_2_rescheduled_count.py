from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mentorship', '0002_mm_phase41_enhancements'),
    ]

    operations = [
        migrations.AddField(
            model_name='mentorsession',
            name='rescheduled_count',
            field=models.IntegerField(default=0),
        ),
    ]
