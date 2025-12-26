from django.urls import path
from . import views

urlpatterns = [
    # Authentification
    path('register/student/', views.register_student, name='register_student'),
    path('register/company/', views.register_company, name='register_company'),
    path('login/', views.login_user, name='login'),
    path('verify-email/<str:token>/', views.verify_email, name='verify_email'),
    path('token/refresh/', views.refresh_token_view, name='token_refresh'),
    
    # Profils
    path('student/profile/', views.student_profile, name='student_profile'),
    path('company/profile/', views.company_profile, name='company_profile'),
    
    # Recherche de profils (Entreprise)
    path('students/search/', views.search_students, name='search_students'),
]

