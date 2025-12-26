from django.urls import path
from .views import (
    RegisterStudentView, RegisterCompanyView, LoginView, VerifyEmailView, 
    LogoutView, ToggleEmailAlertsView, ResendVerificationView,
    ForgotPasswordView, ResetPasswordView, CurrentUserView, ChangePasswordView
)

urlpatterns = [
    # Inscription
    path('register/student/', RegisterStudentView.as_view(), name='register-student'),
    path('register/company/', RegisterCompanyView.as_view(), name='register-company'),
    
    # Connexion / Déconnexion
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Vérification email
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    
    # Mot de passe
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # Utilisateur courant
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('toggle-alerts/', ToggleEmailAlertsView.as_view(), name='toggle-alerts'),
]
