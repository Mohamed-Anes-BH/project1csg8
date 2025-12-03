from django.urls import path
from . import views

urlpatterns = [
    path('universities/', views.get_universities, name='get_universities'),
    path('domains/', views.get_domains, name='get_domains'),
    path('domains/<int:domain_id>/specialties/', views.get_specialties, name='get_specialties'),
]
