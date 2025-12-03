from django.urls import path
from . import views

urlpatterns = [
    # Authentification
    path('register/student/', views.register_student, name='register_student'),
    path('register/company/', views.register_company, name='register_company'),
    path('login/', views.login_user, name='login'),
    
    # Profils
    path('student/profile/', views.student_profile, name='student_profile'),
    path('company/profile/', views.company_profile, name='company_profile'),
]
