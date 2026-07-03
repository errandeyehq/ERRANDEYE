from django.core.management.base import BaseCommand

from dashboard.models import Award, ContactInfo, PricingPackage, Stat, Testimonial


class Command(BaseCommand):
    help = "Seed sample content across all sections, for local dev verification only."

    def handle(self, *args, **options):
        Testimonial.objects.get_or_create(
            author_name="Dev Seed Client",
            defaults=dict(
                quote="Seeded testimonial to verify dynamic rendering end to end.",
                author_title="QA Check, Seed Script",
                order=0,
            ),
        )

        Stat.objects.all().delete()
        for label, value, suffix, order in [
            ("Countries Served", "3", "", 0),
            ("Core Service Lines", "9", "", 1),
            ("Confidential Handling", "100", "%", 2),
            ("Message to Get Started", "1", "", 3),
        ]:
            Stat.objects.create(label=label, value=value, suffix=suffix, order=order)

        Award.objects.get_or_create(
            title="Seed Test Award",
            defaults=dict(issuer="QA Script", year="2026", order=0),
        )

        PricingPackage.objects.get_or_create(
            title="Seed Package",
            defaults=dict(price_label="Custom quote", features="Seeded feature one\nSeeded feature two", order=0),
        )

        info, _ = ContactInfo.objects.get_or_create(pk=1)
        info.phone_primary = "+234 000 000 0001 (NG-seed)"
        info.phone_secondary = "+254 000 000 0002 (KE-seed)"
        info.whatsapp_number = "2348000000001"
        info.email = "seed@errandeye.com"
        info.offices = "Seed City One\nSeed City Two"
        info.business_hours = "Seed Hours: 24/7"
        info.save()

        self.stdout.write(self.style.SUCCESS("Seeded dev content."))
