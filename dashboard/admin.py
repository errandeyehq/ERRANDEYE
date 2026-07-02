from django.contrib import admin

from .models import Award, ContactInfo, GalleryImage, Lead, PricingPackage, Stat, Testimonial

admin.site.site_header = "Errand Eye Admin"
admin.site.site_title = "Errand Eye Admin"
admin.site.index_title = "Site Content & Leads"


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email', 'service', 'status', 'created_at')
    list_filter = ('status', 'service')
    search_fields = ('name', 'phone', 'email', 'message')
    list_editable = ('status',)
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('caption', 'order', 'is_published', 'created_at')
    list_editable = ('order', 'is_published')
    list_filter = ('is_published',)
    search_fields = ('caption',)


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'author_title', 'order', 'is_published')
    list_editable = ('order', 'is_published')
    list_filter = ('is_published',)
    search_fields = ('author_name', 'quote')


@admin.register(PricingPackage)
class PricingPackageAdmin(admin.ModelAdmin):
    list_display = ('title', 'price_label', 'order', 'is_published')
    list_editable = ('order', 'is_published')
    list_filter = ('is_published',)
    search_fields = ('title',)


@admin.register(Award)
class AwardAdmin(admin.ModelAdmin):
    list_display = ('title', 'issuer', 'year', 'order', 'is_published')
    list_editable = ('order', 'is_published')
    list_filter = ('is_published',)
    search_fields = ('title', 'issuer')


@admin.register(Stat)
class StatAdmin(admin.ModelAdmin):
    list_display = ('label', 'value', 'suffix', 'order')
    list_editable = ('value', 'suffix', 'order')
    search_fields = ('label',)


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ('phone_primary', 'email', 'business_hours', 'updated_at')

    def has_add_permission(self, request):
        # Singleton: block adding a second row once one exists.
        return not ContactInfo.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
