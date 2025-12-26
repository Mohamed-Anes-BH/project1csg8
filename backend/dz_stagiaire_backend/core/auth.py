import jwt
import datetime
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from core.db import execute_query, queries

def generate_jwt(user_id, role):
    """
    Generates a JWT token for a user.
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
    Decodes and validates a JWT token.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

class JWTAuthentication(BaseAuthentication):
    """
    Custom Authentication class for DRF using our JWT implementation.
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        try:
            # Bearer <token>
            token = auth_header.split(' ')[1]
        except IndexError:
            raise AuthenticationFailed('Invalid token header. No credentials provided.')

        payload = decode_jwt(token)
        if not payload:
            raise AuthenticationFailed('Invalid or expired token.')

        user_id = payload.get('user_id')
        user = self.get_user(user_id)
        if not user:
            raise AuthenticationFailed('User not found.')

        return (user, token)

    def get_user(self, user_id):
        """
        Fetches user from DB. Returns a simple object or dict.
        """
        user_data = execute_query(queries['get_user_by_id'], (user_id,), fetch_one=True)
        
        if user_data:
            # Create a simple object to mimic Django User model behavior for request.user
            class User:
                def __init__(self, data):
                    self.id = data['id']
                    self.email = data['email']
                    self.role = data['role']
                    self.is_verified = data['is_verified']
                    self.is_authenticated = True
                
                def __str__(self):
                    return self.email

            return User(user_data)
        return None

def jwt_required(request):
    """
    Helper to check if request has valid JWT.
    """
    return request.user and request.user.is_authenticated

def role_required(role):
    """
    Decorator or helper to check role.
    Usage would depend on context, here it's a helper.
    """
    def check(user):
        return user.role == role
    return check
