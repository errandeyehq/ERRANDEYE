from pathlib import Path

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
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

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static('/css/', document_root=FRONTEND_ROOT / 'css')
urlpatterns += static('/js/', document_root=FRONTEND_ROOT / 'js')
urlpatterns += static('/assets/', document_root=FRONTEND_ROOT / 'assets')
urlpatterns += static('/pages/', document_root=FRONTEND_ROOT / 'pages')
urlpatterns += [
    path('favicon.ico', serve, {'document_root': FRONTEND_ROOT, 'path': 'favicon.ico'}),
]
