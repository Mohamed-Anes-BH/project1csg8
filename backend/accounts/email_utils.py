"""
Email utilities for DZ-Stagiaire
Functions to send verification emails
"""

from django.core.mail import send_mail
from django.conf import settings
import secrets
from datetime import datetime, timedelta
from .db_utils import execute_update, execute_query_one

def generate_verification_token(user_id):
    """
    Generate a unique verification token for a user
    """
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(hours=24)
    
    # Store token in database
    execute_update(
        """
        INSERT INTO verification_tokens (user_id, token, expires_at)
        VALUES (%s, %s, %s)
        """,
        [user_id, token, expires_at]
    )
    
    return token

def send_verification_email(user_email, token, user_type='STUDENT'):
    """
    Send verification email to user
    """
    verification_link = f"http://localhost:8000/api/auth/verify-email/{token}/"
    
    subject = "DZ-Stagiaire - Vérifiez votre adresse email"
    
    message = f"""
Bonjour,

Merci de vous être inscrit sur DZ-Stagiaire !

Pour activer votre compte {'étudiant' if user_type == 'STUDENT' else 'entreprise'}, veuillez cliquer sur le lien ci-dessous :

{verification_link}

Ce lien est valable pendant 24 heures.

Si vous n'avez pas créé de compte sur DZ-Stagiaire, ignorez cet email.

Cordialement,
L'équipe DZ-Stagiaire
    """
    
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 30px; background-color: #f9fafb; }}
        .button {{ 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
        }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DZ-Stagiaire</h1>
        </div>
        <div class="content">
            <h2>Vérifiez votre adresse email</h2>
            <p>Bonjour,</p>
            <p>Merci de vous être inscrit sur <strong>DZ-Stagiaire</strong> !</p>
            <p>Pour activer votre compte <strong>{'étudiant' if user_type == 'STUDENT' else 'entreprise'}</strong>, veuillez cliquer sur le bouton ci-dessous :</p>
            <div style="text-align: center;">
                <a href="{verification_link}" class="button">Vérifier mon email</a>
            </div>
            <p style="color: #666; font-size: 14px;">
                Ou copiez ce lien dans votre navigateur :<br>
                <code>{verification_link}</code>
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                ⏰ Ce lien est valable pendant 24 heures.
            </p>
            <p style="color: #666; font-size: 12px;">
                Si vous n'avez pas créé de compte sur DZ-Stagiaire, ignorez cet email.
            </p>
        </div>
        <div class="footer">
            <p>© 2025 DZ-Stagiaire - Plateforme de stages et PFE en Algérie</p>
        </div>
    </div>
</body>
</html>
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def verify_token(token):
    """
    Verify a token and return user_id if valid
    """
    result = execute_query_one(
        """
        SELECT user_id, expires_at 
        FROM verification_tokens 
        WHERE token = %s
        """,
        [token]
    )
    
    if not result:
        return None, "Token invalide"
    
    # Check if token has expired
    if datetime.now() > result['expires_at']:
        return None, "Token expiré"
    
    return result['user_id'], None
