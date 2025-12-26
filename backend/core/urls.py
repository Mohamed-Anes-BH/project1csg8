from django.urls import path
from . import views
from . import upload_views

urlpatterns = [
    # Données de référence
    path('universities/', views.get_universities, name='get_universities'),
    path('domains/', views.get_domains, name='get_domains'),
    path('domains/<int:domain_id>/specialties/', views.get_specialties, name='get_specialties'),
    
    # Notifications
    path('notifications/', views.get_notifications, name='get_notifications'),
    path('notifications/<int:notification_id>/mark-read/', views.mark_notification_read, name='mark_notification_read'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    
    # Uploads
    path('upload/', upload_views.upload_file, name='upload_file'),
]
