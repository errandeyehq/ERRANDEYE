import secrets
import string

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create (or reset the password for) a superuser with a randomly generated password, printed once."

    def add_arguments(self, parser):
        parser.add_argument('--username', default='admin')
        parser.add_argument('--email', default='admin@errandeye.com')

    def handle(self, *args, **options):
        User = get_user_model()
        username = options['username']
        email = options['email']

        alphabet = string.ascii_letters + string.digits
        password = ''.join(secrets.choice(alphabet) for _ in range(16))

        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': email, 'is_staff': True, 'is_superuser': True},
        )
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(f"{action} superuser."))
        self.stdout.write(f"username: {username}")
        self.stdout.write(f"password: {password}")
        self.stdout.write(self.style.WARNING("Save this now, it will not be shown again. Change it after first login."))
