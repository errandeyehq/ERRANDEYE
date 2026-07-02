from django.urls import path

from . import views

urlpatterns = [
    path('site-content/', views.site_content, name='site-content'),
    path('leads/', views.create_lead, name='create-lead'),
]
