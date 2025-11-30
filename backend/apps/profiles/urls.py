"""URL configuration for profiles app"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

app_name = 'profiles'

# Router for ViewSets
router = DefaultRouter()
# router.register(r'students', StudentProfileViewSet, basename='student')
# router.register(r'companies', CompanyProfileViewSet, basename='company')

urlpatterns = [
    path('', include(router.urls)),
]
