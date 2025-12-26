from django.urls import path
from .views import (
    ApplicationListView, ApplyView, UpdateApplicationStatusView, 
    WithdrawApplicationView, ApplicationDetailView, ApplicationStatsView
)

urlpatterns = [
    # Liste des candidatures
    path('', ApplicationListView.as_view(), name='application-list'),
    
    # Statistiques
    path('stats/', ApplicationStatsView.as_view(), name='application-stats'),
    
    # Postuler
    path('apply/', ApplyView.as_view(), name='apply'),
    
    # Détail d'une candidature
    path('<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
    
    # Modifier le statut (entreprise)
    path('<int:pk>/status/', UpdateApplicationStatusView.as_view(), name='update-status'),
    
    # Retirer une candidature (étudiant)
    path('<int:pk>/withdraw/', WithdrawApplicationView.as_view(), name='withdraw'),
]
