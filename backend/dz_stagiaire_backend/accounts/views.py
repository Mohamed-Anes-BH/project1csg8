from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from core.db import execute_query, queries
from core.security import hash_password, check_password, generate_jwt, generate_token, generate_verification_code
from django.conf import settings
from core.email import send_verification_email, send_password_reset_email
import datetime


class RegisterStudentView(APIView):
    """
    Inscription d'un étudiant.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return Response({'error': 'Champs obligatoires manquants'}, status=status.HTTP_400_BAD_REQUEST)

        # Validation email format
        if '@' not in email or '.' not in email:
            return Response({'error': 'Format email invalide'}, status=status.HTTP_400_BAD_REQUEST)

        # Validation password length
        if len(password) < 6:
            return Response({'error': 'Le mot de passe doit contenir au moins 6 caractères'}, status=status.HTTP_400_BAD_REQUEST)

        existing_user = execute_query(queries['check_email_exists'], (email,), fetch_one=True)
        if existing_user:
            return Response({'error': 'Cet email est déjà utilisé'}, status=status.HTTP_400_BAD_REQUEST)

        hashed_pw = hash_password(password)
        verification_token = generate_verification_code()  # 6-digit code

        user_id = execute_query(queries['register_user'], (email, hashed_pw, 'STUDENT', verification_token), commit=True)

        if not user_id:
            return Response({'error': 'Erreur base de données'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        execute_query(queries['create_student_profile'], (user_id,), commit=True)
        send_verification_email(email, verification_token)

        return Response({'message': 'Étudiant inscrit. Veuillez vérifier votre email.'}, status=status.HTTP_201_CREATED)


class RegisterCompanyView(APIView):
    """
    Inscription d'une entreprise.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')
        company_name = data.get('company_name')
        
        if not email or not password or not company_name:
            return Response({'error': 'Champs obligatoires manquants'}, status=status.HTTP_400_BAD_REQUEST)

        # Validation email format
        if '@' not in email or '.' not in email:
            return Response({'error': 'Format email invalide'}, status=status.HTTP_400_BAD_REQUEST)

        # Validation password length
        if len(password) < 6:
            return Response({'error': 'Le mot de passe doit contenir au moins 6 caractères'}, status=status.HTTP_400_BAD_REQUEST)

        existing_user = execute_query(queries['check_email_exists'], (email,), fetch_one=True)
        if existing_user:
            return Response({'error': 'Cet email est déjà utilisé'}, status=status.HTTP_400_BAD_REQUEST)

        hashed_pw = hash_password(password)
        verification_token = generate_verification_code()  # 6-digit code

        user_id = execute_query(queries['register_user'], (email, hashed_pw, 'COMPANY', verification_token), commit=True)

        if not user_id:
            return Response({'error': 'Erreur base de données'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        execute_query(queries['create_company_profile'], (user_id, company_name), commit=True)
        send_verification_email(email, verification_token)

        return Response({'message': 'Entreprise inscrite. Veuillez vérifier votre email.'}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Connexion utilisateur (JWT).
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Identifiants manquants'}, status=status.HTTP_400_BAD_REQUEST)

        user = execute_query(queries['get_user_for_login'], (email,), fetch_one=True)

        if not user:
            return Response({'error': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user['password_hash']):
            return Response({'error': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user['is_verified']:
            return Response({'error': 'Email non vérifié. Veuillez vérifier votre email.'}, status=status.HTTP_403_FORBIDDEN)

        token = generate_jwt(user['id'], user['role'])

        return Response({
            'token': token,
            'role': user['role'],
            'user_id': user['id'],
            'message': 'Connexion réussie'
        })


class VerifyEmailView(APIView):
    """
    Vérification de l'email par token.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get('token')
        if not token:
            return Response({'error': 'Token requis'}, status=status.HTTP_400_BAD_REQUEST)

        user = execute_query(queries['get_user_by_token'], (token,), fetch_one=True)
        if not user:
            return Response({'error': 'Token invalide ou expiré'}, status=status.HTTP_400_BAD_REQUEST)

        execute_query(queries['verify_user_email'], (user['id'],), commit=True)

        return Response({'message': 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.'})

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token requis'}, status=status.HTTP_400_BAD_REQUEST)

        user = execute_query(queries['get_user_by_token'], (token,), fetch_one=True)
        if not user:
            return Response({'error': 'Token invalide ou expiré'}, status=status.HTTP_400_BAD_REQUEST)

        execute_query(queries['verify_user_email'], (user['id'],), commit=True)

        return Response({'message': 'Email vérifié avec succès'})


class ResendVerificationView(APIView):
    """
    Renvoyer l'email de vérification.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email requis'}, status=status.HTTP_400_BAD_REQUEST)

        user = execute_query(queries['get_unverified_user_by_email'], (email,), fetch_one=True)
        if not user:
            return Response({'error': 'Email non trouvé ou déjà vérifié'}, status=status.HTTP_400_BAD_REQUEST)

        new_token = generate_verification_code()  # 6-digit code
        execute_query(queries['resend_verification_token'], (new_token, email), commit=True)
        send_verification_email(email, new_token)

        return Response({'message': 'Email de vérification renvoyé'})


class ForgotPasswordView(APIView):
    """
    Demande de réinitialisation de mot de passe.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email requis'}, status=status.HTTP_400_BAD_REQUEST)

        existing = execute_query(queries['check_email_exists'], (email,), fetch_one=True)
        if not existing:
            # Return success even if not found for security
            return Response({'message': 'Si cet email existe, un lien de réinitialisation sera envoyé.'})

        reset_token = generate_token()
        expires = datetime.datetime.now() + datetime.timedelta(hours=1)
        
        execute_query(queries['set_password_reset_token'], (reset_token, expires, email), commit=True)
        send_password_reset_email(email, reset_token)

        return Response({'message': 'Si cet email existe, un lien de réinitialisation sera envoyé.'})


class ResetPasswordView(APIView):
    """
    Réinitialisation du mot de passe avec token.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not token or not new_password:
            return Response({'error': 'Token et mot de passe requis'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'error': 'Le mot de passe doit contenir au moins 6 caractères'}, status=status.HTTP_400_BAD_REQUEST)

        user = execute_query(queries['get_user_by_reset_token'], (token,), fetch_one=True)
        if not user:
            return Response({'error': 'Token invalide ou expiré'}, status=status.HTTP_400_BAD_REQUEST)

        hashed_pw = hash_password(new_password)
        execute_query(queries['reset_password'], (hashed_pw, user['id']), commit=True)

        return Response({'message': 'Mot de passe réinitialisé avec succès'})


class LogoutView(APIView):
    """
    Déconnexion (côté client, supprimer le token).
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Client side should delete token
        return Response({'message': 'Déconnexion réussie'})


class ToggleEmailAlertsView(APIView):
    """
    Activer/désactiver les alertes email.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        current = execute_query(queries['get_email_alerts_status'], (request.user.id,), fetch_one=True)['email_alerts']
        new_val = not current
        execute_query(queries['update_email_alerts_status'], (new_val, request.user.id), commit=True)
        return Response({'email_alerts': new_val, 'message': 'Préférences mises à jour'})

    def get(self, request):
        current = execute_query(queries['get_email_alerts_status'], (request.user.id,), fetch_one=True)
        return Response({'email_alerts': current['email_alerts']})


class CurrentUserView(APIView):
    """
    Récupérer les informations de l'utilisateur connecté.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = {
            'id': request.user.id,
            'email': request.user.email,
            'role': request.user.role,
            'is_verified': request.user.is_verified
        }
        
        # Enrich with profile info
        if request.user.role == 'STUDENT':
            student = execute_query("SELECT first_name, last_name, avatar_path FROM students WHERE user_id = %s", (request.user.id,), fetch_one=True)
            if student:
                user_data['first_name'] = student.get('first_name')
                user_data['last_name'] = student.get('last_name')
                user_data['full_name'] = f"{student.get('first_name', '')} {student.get('last_name', '')}".strip() or "Étudiant"
                if student.get('avatar_path'):
                    user_data['avatar_url'] = request.build_absolute_uri(settings.MEDIA_URL + student['avatar_path'])
                    
        elif request.user.role == 'COMPANY':
            company = execute_query("SELECT name, logo_path FROM companies WHERE user_id = %s", (request.user.id,), fetch_one=True)
            if company:
                user_data['company_name'] = company.get('name')
                user_data['full_name'] = company.get('name') or "Entreprise"
                if company.get('logo_path'):
                    user_data['logo_url'] = request.build_absolute_uri(settings.MEDIA_URL + company['logo_path'])
        
        return Response(user_data)


class ChangePasswordView(APIView):
    """
    Changer le mot de passe (utilisateur connecté).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response({'error': 'Mots de passe requis'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'error': 'Le nouveau mot de passe doit contenir au moins 6 caractères'}, status=status.HTTP_400_BAD_REQUEST)

        user = execute_query(queries['get_user_for_login'], (request.user.email,), fetch_one=True)
        
        if not check_password(current_password, user['password_hash']):
            return Response({'error': 'Mot de passe actuel incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        hashed_pw = hash_password(new_password)
        query = "UPDATE users SET password_hash = %s WHERE id = %s"
        execute_query(query, (hashed_pw, request.user.id), commit=True)

        return Response({'message': 'Mot de passe modifié avec succès'})
