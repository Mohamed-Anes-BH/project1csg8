from django.urls import path
from .views import (
    NotificationListView, MarkReadView, NotificationStatsView,
    DeleteNotificationView, NotificationPreferencesView
)

urlpatterns = [
    # Liste des notifications
    path('', NotificationListView.as_view(), name='notification-list'),
    
    # Statistiques et compteur
    path('stats/', NotificationStatsView.as_view(), name='notification-stats'),
    
    # Marquer comme lu (une ou toutes)
    path('<int:pk>/read/', MarkReadView.as_view(), name='mark-read'),
    path('read-all/', MarkReadView.as_view(), name='mark-all-read'),
    
    # Supprimer (une ou toutes les lues)
    path('<int:pk>/delete/', DeleteNotificationView.as_view(), name='delete-notification'),
    path('delete-read/', DeleteNotificationView.as_view(), name='delete-read-notifications'),
    
    # Préférences
    path('preferences/', NotificationPreferencesView.as_view(), name='notification-preferences'),
]
