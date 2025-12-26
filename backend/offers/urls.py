from django.urls import path
from . import views

urlpatterns = [
    # Offres
    path('', views.offer_list, name='offer_list'),
    path('create/', views.create_offer, name='create_offer'),
    path('<int:offer_id>/', views.offer_detail, name='offer_detail'),
    path('<int:offer_id>/apply/', views.apply_to_offer, name='apply_to_offer'),
    path('recommended/', views.recommended_offers, name='recommended_offers'),
    
    # Gestion des Offres (Entreprise)
    path('<int:offer_id>/update/', views.update_offer, name='update_offer'),
    path('<int:offer_id>/archive/', views.archive_offer, name='archive_offer'),
    path('<int:offer_id>/delete/', views.delete_offer, name='delete_offer'),
    
    # Statistiques
    path('<int:offer_id>/statistics/', views.offer_statistics, name='offer_statistics'),
    
    # Dashboard Entreprise
    path('company/dashboard/', views.company_dashboard, name='company_dashboard'),
    path('applications/<int:application_id>/status/', views.update_application_status, name='update_application_status'),
    
    # Dashboard Étudiant
    path('student/applications/', views.student_applications, name='student_applications'),
]
