from django.urls import path
from .views import (
    CompanyDashboardView, CompanyProfileView, PublicCompanyProfileView,
    UploadLogoView, CompanyOffersView, CompanyApplicationsView,
    DownloadStudentCVView, CompanySettingsView
)

urlpatterns = [
    # Dashboard
    path('dashboard/', CompanyDashboardView.as_view(), name='company-dashboard'),
    
    # Profil
    path('profile/', CompanyProfileView.as_view(), name='company-profile'),
    path('profile/<int:pk>/', PublicCompanyProfileView.as_view(), name='public-company-profile'),
    
    # Logo
    path('upload-logo/', UploadLogoView.as_view(), name='upload-logo'),
    
    # Offres de l'entreprise
    path('my-offers/', CompanyOffersView.as_view(), name='company-offers'),
    
    # Candidatures reçues
    path('applications/', CompanyApplicationsView.as_view(), name='company-applications'),
    
    # Télécharger CV étudiant
    path('download-cv/<int:student_id>/', DownloadStudentCVView.as_view(), name='download-student-cv'),
    
    # Paramètres
    path('settings/', CompanySettingsView.as_view(), name='company-settings'),
]
