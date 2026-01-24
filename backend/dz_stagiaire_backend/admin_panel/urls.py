from django.urls import path
from .views import (
    # Dashboard
    AdminDashboardStatsView,
    AdminGrowthStatsView,
    AdminRecentActivityView,
    AdminRecentApplicationsView,
    AdminStatsView,
    
    # Users
    AdminUserListView,
    AdminUserDetailView,
    AdminCreateUserView,
    AdminToggleUserView,
    AdminSuspendUserView,
    AdminRestoreUserView,
    
    # Offers
    AdminOfferListView,
    AdminOfferDetailView,
    AdminApproveOfferView,
    AdminRejectOfferView,
    AdminDeleteOfferView,
    AdminBulkApproveOffersView,
    AdminOfferStatsView,
    
    # Settings & Others
    AdminSettingsView,
    AdminLogsView,
    AdminSendNotificationView,
    AdminIncompleteProfilesView,
)

urlpatterns = [
    # ==========================================
    # DASHBOARD
    # ==========================================
    path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('dashboard/growth/', AdminGrowthStatsView.as_view(), name='admin-growth-stats'),
    path('dashboard/activity/', AdminRecentActivityView.as_view(), name='admin-recent-activity'),
    path('dashboard/applications/', AdminRecentApplicationsView.as_view(), name='admin-recent-applications'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    
    # ==========================================
    # GESTION UTILISATEURS
    # ==========================================
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('users/create/', AdminCreateUserView.as_view(), name='admin-create-user'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<int:pk>/toggle/', AdminToggleUserView.as_view(), name='admin-toggle-user'),
    path('users/<int:pk>/suspend/', AdminSuspendUserView.as_view(), name='admin-suspend-user'),
    path('users/<int:pk>/restore/', AdminRestoreUserView.as_view(), name='admin-restore-user'),
    
    # ==========================================
    # MODÉRATION OFFRES
    # ==========================================
    path('offers/', AdminOfferListView.as_view(), name='admin-offers'),
    path('offers/stats/', AdminOfferStatsView.as_view(), name='admin-offer-stats'),
    path('offers/bulk-approve/', AdminBulkApproveOffersView.as_view(), name='admin-bulk-approve'),
    path('offers/<int:pk>/', AdminOfferDetailView.as_view(), name='admin-offer-detail'),
    path('offers/<int:pk>/approve/', AdminApproveOfferView.as_view(), name='admin-approve-offer'),
    path('offers/<int:pk>/reject/', AdminRejectOfferView.as_view(), name='admin-reject-offer'),
    path('offers/<int:pk>/delete/', AdminDeleteOfferView.as_view(), name='admin-delete-offer'),
    
    # ==========================================
    # PARAMÈTRES SYSTÈME
    # ==========================================
    path('settings/', AdminSettingsView.as_view(), name='admin-settings'),
    
    # ==========================================
    # AUTRES
    # ==========================================
    path('logs/', AdminLogsView.as_view(), name='admin-logs'),
    path('send-notification/', AdminSendNotificationView.as_view(), name='admin-send-notification'),
    path('incomplete-profiles/', AdminIncompleteProfilesView.as_view(), name='admin-incomplete-profiles'),
]
