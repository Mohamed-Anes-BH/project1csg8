"""URL configuration for alerts app"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

app_name = 'alerts'

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
]
