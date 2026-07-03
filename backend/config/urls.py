from pathlib import Path

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.static import serve

FRONTEND_ROOT = Path(settings.BASE_DIR).parent / 'errand-eye'

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('index.html', TemplateView.as_view(template_name='index.html')),
    path('about.html', TemplateView.as_view(template_name='about.html')),
    path('services.html', TemplateView.as_view(template_name='services.html')),
    path('gallery.html', TemplateView.as_view(template_name='gallery.html')),
    path('admin/', admin.site.urls),
    path('api/', include('dashboard.urls')),
]

# Serve media files through Django.
urlpatterns += [
    path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^css/(?P<path>.*)$', serve, {'document_root': FRONTEND_ROOT / 'css'}),
    re_path(r'^js/(?P<path>.*)$', serve, {'document_root': FRONTEND_ROOT / 'js'}),
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': FRONTEND_ROOT / 'assets'}),
    re_path(r'^pages/(?P<path>.*)$', serve, {'document_root': FRONTEND_ROOT / 'pages'}),
    path('favicon.ico', serve, {'document_root': FRONTEND_ROOT, 'path': 'favicon.ico'}),
]
