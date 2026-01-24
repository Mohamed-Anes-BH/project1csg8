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
    Envoi d'un email de vérification avec le code.
    """
    subject = "Votre code de vérification DZ-Stagiaire"
    body = f"""Bonjour,

Merci de vous être inscrit sur DZ-Stagiaire.

Pour activer votre compte, veuillez entrer le code de vérification ci-dessous :

{token}

Ce code expirera bientôt.

Si vous n'avez pas demandé ce code, ignorez cet email.

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


def send_application_notification(company_email, student_name, offer_title, offer_type=None):
    """
    Notification nouvelle candidature à une entreprise.
    Inclut le type d'offre (Stage/PFE) si disponible.
    """
    # Déterminer le type d'offre en français
    offer_type_label = ""
    if offer_type:
        offer_types = {
            'STAGE': 'stage',
            'PFE': 'projet de fin d\'études (PFE)',
            'INTERNSHIP': 'stage',
            'JOB': 'offre d\'emploi'
        }
        offer_type_label = offer_types.get(offer_type.upper(), 'offre')
    else:
        offer_type_label = 'offre'
    
    subject = f"📋 Nouvelle candidature - {offer_title}"
    body = f"""Bonjour,

Vous avez reçu une nouvelle candidature pour votre {offer_type_label} !

📌 Offre : {offer_title}
👤 Candidat : {student_name}

Connectez-vous à votre espace entreprise sur DZ-Stagiaire pour :
• Consulter le profil complet du candidat
• Télécharger son CV
• Le contacter via la messagerie
• Accepter ou refuser sa candidature

Ne tardez pas à répondre aux candidatures pour attirer les meilleurs talents !

Cordialement,
L'équipe DZ-Stagiaire"""
    return send_email(company_email, subject, body)


def send_status_update_email(student_email, offer_title, new_status, offer_type=None):
    """
    Notification changement de statut de candidature.
    Envoie un email personnalisé selon le statut (accepté, refusé, etc.)
    """
    status_labels = {
        'PENDING': 'En attente',
        'PRESELECTED': 'Présélectionné(e)',
        'ACCEPTED': 'Accepté(e)',
        'REJECTED': 'Refusé(e)',
        'ARCHIVED': 'Archivée'
    }
    
    # Déterminer le type d'offre en français
    offer_type_label = ""
    if offer_type:
        offer_types = {
            'STAGE': 'stage',
            'PFE': 'projet de fin d\'études (PFE)',
            'INTERNSHIP': 'stage',
            'JOB': 'emploi'
        }
        offer_type_label = offer_types.get(offer_type.upper(), 'offre')
    else:
        offer_type_label = 'offre'
    
    status_text = status_labels.get(new_status, new_status)
    
    # Messages personnalisés selon le statut
    if new_status == 'ACCEPTED':
        subject = f"🎉 Félicitations ! Votre candidature a été acceptée - {offer_title}"
        body = f"""Bonjour,

Excellente nouvelle ! 🎉

Votre candidature pour le {offer_type_label} "{offer_title}" a été ACCEPTÉE !

L'entreprise souhaite poursuivre avec vous. Vous serez contacté(e) prochainement pour les prochaines étapes.

Nous vous félicitons pour cette réussite !

Connectez-vous à votre espace pour voir les détails et contacter l'entreprise.

Cordialement,
L'équipe DZ-Stagiaire"""

    elif new_status == 'REJECTED':
        subject = f"Mise à jour de votre candidature - {offer_title}"
        body = f"""Bonjour,

Nous avons le regret de vous informer que votre candidature pour le {offer_type_label} "{offer_title}" n'a pas été retenue.

Ne vous découragez pas ! Voici quelques conseils :
• Continuez à postuler à d'autres offres correspondant à votre profil
• Améliorez votre CV et vos compétences
• Consultez les nouvelles offres régulièrement sur DZ-Stagiaire

De nombreuses opportunités vous attendent sur notre plateforme !

Cordialement,
L'équipe DZ-Stagiaire"""

    elif new_status == 'PRESELECTED':
        subject = f"✨ Bonne nouvelle ! Vous êtes présélectionné(e) - {offer_title}"
        body = f"""Bonjour,

Bonne nouvelle ! ✨

Votre candidature pour le {offer_type_label} "{offer_title}" a retenu l'attention de l'entreprise.

Vous êtes maintenant PRÉSÉLECTIONNÉ(E) pour cette offre.

L'entreprise examinera votre profil de plus près. Restez attentif(ve) à vos emails et messages sur la plateforme.

Connectez-vous à votre espace pour plus de détails.

Cordialement,
L'équipe DZ-Stagiaire"""

    else:
        subject = f"Mise à jour de votre candidature - {offer_title}"
        body = f"""Bonjour,

Le statut de votre candidature pour le {offer_type_label} "{offer_title}" a été mis à jour.

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
