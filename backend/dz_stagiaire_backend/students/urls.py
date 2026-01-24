from django.urls import path
from .views import (
    StudentDashboardView, StudentProfileView, ToggleVisibilityView, 
    UploadCVView, SavedOffersView, PublicStudentProfileView, 
    RecommendationsView, StudentSettingsView, UploadAvatarView
)

urlpatterns = [
    # Dashboard
    path('dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    
    # Profil
    path('profile/', StudentProfileView.as_view(), name='student-profile'),
    path('profile/<int:pk>/', PublicStudentProfileView.as_view(), name='public-profile'),
    
    # Paramètres
    path('visibility/', ToggleVisibilityView.as_view(), name='toggle-visibility'),
    path('settings/', StudentSettingsView.as_view(), name='student-settings'),
    
    # CV & Avatar
    path('upload-cv/', UploadCVView.as_view(), name='upload-cv'),
    path('upload-avatar/', UploadAvatarView.as_view(), name='upload-avatar'),
    
    # Offres sauvegardées
    path('saved-offers/', SavedOffersView.as_view(), name='saved-offers'),
    path('saved-offers/<int:pk>/', SavedOffersView.as_view(), name='delete-saved-offer'),
    
    # Recommandations
    path('recommendations/', RecommendationsView.as_view(), name='recommendations'),
]
