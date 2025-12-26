from django.urls import path, include

urlpatterns = [
    path('api/auth/', include('accounts.urls')),
    path('api/students/', include('students.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/offers/', include('offers.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/messaging/', include('messaging.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/admin/', include('admin_panel.urls')),
]

