"""URL configuration for offers app"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

app_name = 'offers'

router = DefaultRouter()
# router.register(r'', OfferViewSet, basename='offer')

urlpatterns = [
    path('', include(router.urls)),
]
