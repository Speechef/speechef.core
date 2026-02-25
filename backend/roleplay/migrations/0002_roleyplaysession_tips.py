from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('roleplay', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='roleplaysession',
            name='tips',
            field=models.JSONField(default=list),
        ),
    ]
