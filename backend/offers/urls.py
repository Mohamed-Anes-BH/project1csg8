from django.urls import path
from . import views

urlpatterns = [
    # Offres
    path('', views.offer_list, name='offer_list'),
    path('create/', views.create_offer, name='create_offer'),
    path('<int:offer_id>/', views.offer_detail, name='offer_detail'),
    path('<int:offer_id>/apply/', views.apply_to_offer, name='apply_to_offer'),
    
    # Dashboard Entreprise (Admin Panel)
    path('company/dashboard/', views.company_dashboard, name='company_dashboard'),
    path('applications/<int:application_id>/status/', views.update_application_status, name='update_application_status'),
]
