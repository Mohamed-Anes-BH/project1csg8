"""URL configuration for experiences app"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

app_name = 'experiences'

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
]
