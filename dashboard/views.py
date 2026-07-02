import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import Award, ContactInfo, GalleryImage, Lead, PricingPackage, Stat, Testimonial


def _gallery_payload(request):
    return [
        {
            'id': img.pk,
            'image_url': request.build_absolute_uri(img.image.url) if img.image else '',
            'caption': img.caption,
        }
        for img in GalleryImage.objects.filter(is_published=True)
    ]


def _testimonials_payload():
    return [
        {
            'id': t.pk,
            'quote': t.quote,
            'author_name': t.author_name,
            'author_title': t.author_title,
        }
        for t in Testimonial.objects.filter(is_published=True)
    ]


def _pricing_payload():
    return [
        {
            'id': p.pk,
            'title': p.title,
            'description': p.description,
            'price_label': p.price_label,
            'features': p.feature_list(),
        }
        for p in PricingPackage.objects.filter(is_published=True)
    ]


def _awards_payload():
    return [
        {'id': a.pk, 'title': a.title, 'year': a.year, 'issuer': a.issuer}
        for a in Award.objects.filter(is_published=True)
    ]


def _stats_payload():
    return [
        {'id': s.pk, 'label': s.label, 'value': s.value, 'suffix': s.suffix}
        for s in Stat.objects.all()
    ]


def _contact_info_payload():
    info = ContactInfo.objects.first()
    if not info:
        return {}
    return {
        'phone_primary': info.phone_primary,
        'phone_secondary': info.phone_secondary,
        'whatsapp_number': info.whatsapp_number,
        'email': info.email,
        'offices': info.office_list(),
        'business_hours': info.business_hours,
    }


@require_GET
def site_content(request):
    """Single combined read endpoint the static site fetches on page load."""
    return JsonResponse({
        'gallery': _gallery_payload(request),
        'testimonials': _testimonials_payload(),
        'pricing': _pricing_payload(),
        'awards': _awards_payload(),
        'stats': _stats_payload(),
        'contact_info': _contact_info_payload(),
    })


@csrf_exempt
@require_POST
def create_lead(request):
    """Public endpoint the site's contact form POSTs to."""
    try:
        data = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    name = (data.get('name') or '').strip()
    message = (data.get('message') or '').strip()
    if not name or not message:
        return JsonResponse({'error': 'name and message are required.'}, status=400)

    lead = Lead.objects.create(
        name=name[:150],
        email=(data.get('email') or '').strip()[:254],
        phone=(data.get('phone') or '').strip()[:40],
        service=(data.get('service') or '').strip()[:150],
        message=message,
    )
    return JsonResponse({'id': lead.pk, 'status': 'received'}, status=201)
