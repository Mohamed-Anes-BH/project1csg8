import bcrypt
import uuid
import jwt
import datetime
from django.conf import settings


def hash_password(password):
    """
    Hache un mot de passe avec bcrypt.
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password, hashed_password):
    """
    Vérifie un mot de passe contre son hash.
    """
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


# Alias pour compatibilité
check_password = verify_password


import random

def generate_token():
    """
    Génère un token aléatoire (UUID) pour la réinitialisation de mot de passe.
    """
    return str(uuid.uuid4())


def generate_verification_code():
    """
    Génère un code à 6 chiffres pour la vérification d'email.
    """
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])


def verify_token(token, stored_token):
    """
    Vérifie si le token fourni correspond au token stocké.
    """
    return token == stored_token


def generate_jwt(user_id, role):
    """
    Génère un token JWT pour un utilisateur.
    """
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=settings.JWT_EXPIRATION_DELTA_HOURS),
        'iat': datetime.datetime.utcnow()
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


def decode_jwt(token):
    """
    Décode et valide un token JWT.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
