import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings


def send_email(to_email, subject, body):
    """
    Envoi d'un email via configuration SMTP.
    """
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.EMAIL_HOST_USER
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        server.starttls()
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.EMAIL_HOST_USER, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Erreur envoi email: {e}")
        return False


def send_verification_email(user_email, token):
    """
    Envoi d'un email de vérification avec token et lien.
    """
    subject = "Vérifiez votre compte DZ-Stagiaire"
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    body = f"""Bonjour,

Merci de vous être inscrit sur DZ-Stagiaire.

Cliquez sur le lien suivant pour vérifier votre compte :
{verification_link}

Ou utilisez votre code de vérification : {token}

Ce lien expire dans 24 heures.

Cordialement,
L'équipe DZ-Stagiaire"""
    return send_email(user_email, subject, body)


def send_password_reset_email(user_email, token):
    """
    Envoi d'un email de réinitialisation de mot de passe.
    """
    subject = "Réinitialisation de votre mot de passe - DZ-Stagiaire"
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    body = f"""Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe sur DZ-Stagiaire.

Cliquez sur le lien suivant pour réinitialiser votre mot de passe :
{reset_link}

Ce lien expire dans 1 heure.

Si vous n'avez pas fait cette demande, ignorez cet email.

Cordialement,
L'équipe DZ-Stagiaire"""
    return send_email(user_email, subject, body)


def send_notification_email(user_email, subject, content):
    """
    Envoi d'un email de notification générique.
    """
    body = f"""Bonjour,

{content}

---
Cet email a été envoyé automatiquement par DZ-Stagiaire.
Pour désactiver les notifications par email, rendez-vous dans vos paramètres.

Cordialement,
L'équipe DZ-Stagiaire"""
    return send_email(user_email, subject, body)


def send_application_notification(company_email, student_name, offer_title):
    """
    Notification nouvelle candidature à une entreprise.
    """
    subject = f"Nouvelle candidature - {offer_title}"
    body = f"""Bonjour,

Un étudiant a postulé à votre offre "{offer_title}".

Candidat : {student_name}

Connectez-vous à votre espace pour consulter cette candidature.

Cordialement,
L'équipe DZ-Stagiaire"""
    return send_email(company_email, subject, body)


def send_status_update_email(student_email, offer_title, new_status):
    """
    Notification changement de statut de candidature.
    """
    status_labels = {
        'PENDING': 'En attente',
        'PRESELECTED': 'Présélectionné(e)',
        'ACCEPTED': 'Accepté(e)',
        'REJECTED': 'Refusé(e)',
        'ARCHIVED': 'Archivée'
    }
    
    subject = f"Mise à jour de votre candidature - {offer_title}"
    status_text = status_labels.get(new_status, new_status)
    body = f"""Bonjour,

Le statut de votre candidature pour l'offre "{offer_title}" a été mis à jour.

Nouveau statut : {status_text}

Connectez-vous à votre espace pour plus de détails.

Cordialement,
L'équipe DZ-Stagiaire"""
    return send_email(student_email, subject, body)


def send_new_offer_notification(user_email, offer_title, company_name):
    """
    Notification nouvelle offre publiée (pour recommandations).
    """
    subject = f"Nouvelle offre : {offer_title}"
    body = f"""Bonjour,

Une nouvelle offre correspondant à votre profil vient d'être publiée !

Offre : {offer_title}
Entreprise : {company_name}

Connectez-vous pour consulter cette offre et postuler.

Cordialement,
L'équipe DZ-Stagiaire"""
    return send_email(user_email, subject, body)


def send_profile_reminder_email(user_email, user_name, role):
    """
    Rappel profil incomplet.
    """
    subject = "Complétez votre profil DZ-Stagiaire"
    
    if role == 'STUDENT':
        tips = """
- Ajoutez une photo de profil
- Rédigez une bio attractive
- Listez vos compétences
- Téléversez votre CV au format PDF
- Ajoutez vos formations et expériences
- Liez vos profils LinkedIn et GitHub"""
    else:
        tips = """
- Ajoutez le logo de votre entreprise
- Rédigez une description détaillée
- Indiquez votre secteur d'activité
- Précisez la taille de votre entreprise
- Ajoutez le lien de votre site web"""
    
    body = f"""Bonjour{' ' + user_name if user_name else ''},

Votre profil DZ-Stagiaire n'est pas complet.

Un profil complet augmente vos chances de {'trouver un stage' if role == 'STUDENT' else 'recevoir des candidatures de qualité'} !

Conseils pour compléter votre profil :{tips}

Connectez-vous pour compléter votre profil.

Cordialement,
L'équipe DZ-Stagiaire"""
    return send_email(user_email, subject, body)
