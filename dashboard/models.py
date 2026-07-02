from django.core.exceptions import ValidationError
from django.db import models


class Lead(models.Model):
    """A quote/contact request submitted from the public site's contact form."""

    STATUS_NEW = 'new'
    STATUS_CONTACTED = 'contacted'
    STATUS_CLOSED = 'closed'
    STATUS_CHOICES = [
        (STATUS_NEW, 'New'),
        (STATUS_CONTACTED, 'Contacted'),
        (STATUS_CLOSED, 'Closed'),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    service = models.CharField(max_length=150, blank=True, help_text="Service the lead is asking about.")
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"


class GalleryImage(models.Model):
    """A photo shown on the public gallery page."""

    image = models.ImageField(upload_to='gallery/')
    caption = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first.")
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.caption or f"Gallery image #{self.pk}"


class Testimonial(models.Model):
    """A client quote shown in the homepage testimonial carousel."""

    quote = models.TextField()
    author_name = models.CharField(max_length=120)
    author_title = models.CharField(max_length=150, blank=True, help_text="e.g. 'Regional Manager, Logistics Company, Nairobi'")
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.author_name}: {self.quote[:40]}"


class PricingPackage(models.Model):
    """A pricing/package card shown on the About page."""

    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    price_label = models.CharField(max_length=80, help_text="e.g. 'From $150' or 'Custom quote'")
    features = models.TextField(help_text="One feature per line.", blank=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def feature_list(self):
        return [line.strip() for line in self.features.splitlines() if line.strip()]

    def __str__(self):
        return self.title


class Award(models.Model):
    """An award/recognition badge shown on the site."""

    title = models.CharField(max_length=150, help_text="e.g. 'Women in Business, Nominee'")
    year = models.CharField(max_length=20, blank=True)
    issuer = models.CharField(max_length=150, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class Stat(models.Model):
    """A homepage stat counter, e.g. 'Countries Served: 3'."""

    label = models.CharField(max_length=100, help_text="e.g. 'Countries Served'")
    value = models.CharField(max_length=20, help_text="e.g. '3' or '9' (suffix like '+' goes in Suffix).")
    suffix = models.CharField(max_length=10, blank=True, help_text="e.g. '+' or '%'")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.label}: {self.value}{self.suffix}"


class ContactInfo(models.Model):
    """
    Site-wide contact details (phone, email, offices, hours).
    Singleton: only one row is ever used, enforced in save().
    """

    phone_primary = models.CharField(max_length=40, blank=True, help_text="e.g. '+234 816 476 6193 (NG)'")
    phone_secondary = models.CharField(max_length=40, blank=True, help_text="e.g. '+254 701 840 462 (KE)'")
    whatsapp_number = models.CharField(max_length=40, blank=True, help_text="Digits only, for wa.me links, e.g. '2348164766193'")
    email = models.EmailField(blank=True)
    offices = models.TextField(blank=True, help_text="One office per line, e.g. 'Nairobi, Kenya'")
    business_hours = models.CharField(max_length=150, blank=True, help_text="e.g. 'Mon - Sat, 8am - 8pm'")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Contact Info"
        verbose_name_plural = "Contact Info"

    def office_list(self):
        return [line.strip() for line in self.offices.splitlines() if line.strip()]

    def clean(self):
        if not self.pk and ContactInfo.objects.exists():
            raise ValidationError("Contact Info already exists. Edit the existing entry instead of creating a new one.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return "Site Contact Info"
