from django.urls import path
from .views import (
    AdminStatsView, AdminUserListView, AdminToggleUserView,
    AdminOfferListView, AdminDeleteOfferView, AdminLogsView,
    AdminUserDetailView, AdminSuspendUserView, AdminOfferDetailView,
    AdminSendNotificationView, AdminIncompleteProfilesView
)

urlpatterns = [
    # Statistiques globales
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    
    # Gestion des utilisateurs
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<int:pk>/toggle/', AdminToggleUserView.as_view(), name='admin-toggle-user'),
    path('users/<int:pk>/suspend/', AdminSuspendUserView.as_view(), name='admin-suspend-user'),
    
    # Gestion des offres
    path('offers/', AdminOfferListView.as_view(), name='admin-offers'),
    path('offers/<int:pk>/', AdminOfferDetailView.as_view(), name='admin-offer-detail'),
    path('offers/<int:pk>/delete/', AdminDeleteOfferView.as_view(), name='admin-delete-offer'),
    
    # Logs
    path('logs/', AdminLogsView.as_view(), name='admin-logs'),
    
    # Notifications
    path('send-notification/', AdminSendNotificationView.as_view(), name='admin-send-notification'),
    
    # Profils incomplets
    path('incomplete-profiles/', AdminIncompleteProfilesView.as_view(), name='admin-incomplete-profiles'),
]
