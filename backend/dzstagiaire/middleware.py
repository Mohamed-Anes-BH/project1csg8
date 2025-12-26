import jwt
from django.conf import settings
from django.http import JsonResponse
from django.urls import resolve

class JWTVerificationMiddleware:
    """
    Middleware pour vérifier le token JWT et injecter user_id/user_type dans request.
    Sécurise automatiquement les endpoints qui ne sont pas publics.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Liste des endpoints publics (pas besoin de token)
        self.public_paths = [
            '/api/auth/login/',
            '/api/auth/register/student/',
            '/api/auth/register/company/',
            '/api/auth/verify-email/',
            '/api/auth/token/refresh/',
            '/api/core/universities/',
            '/api/core/domains/',
            '/api/core/specialties/',
            '/api/core/upload/',
            '/admin/',
            '/static/',
            '/swagger/',
            '/redoc/',
        ]

    def __call__(self, request):
        # 1. Vérifier si l'endpoint est public
        path = request.path
        
        # Si c'est un endpoint public, on laisse passer
        if any(path.startswith(public_path) for public_path in self.public_paths):
            return self.get_response(request)
            
        # Si c'est la liste des offres (GET), c'est public aussi (sauf si on veut postuler)
        if path == '/api/offers/' and request.method == 'GET':
            # On essaie quand même de lire le token pour le ciblage, mais on ne bloque pas
            self._try_extract_user(request)
            return self.get_response(request)

        # 2. Vérifier le token pour les endpoints protégés
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authentication credentials were not provided.'}, status=401)
            
        token = auth_header.split(' ')[1]
        
        try:
            # Décoder le token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Injecter les infos dans request
            request.user_id = payload.get('user_id')
            request.user_type = payload.get('user_type')
            
            # Vérification supplémentaire : un étudiant ne doit pas accéder aux routes entreprise
            if '/company/' in path and request.user_type != 'COMPANY':
                 return JsonResponse({'error': 'Permission denied. Company account required.'}, status=403)
                 
            # Et inversement (optionnel, selon logique métier)
            if '/student/' in path and request.user_type != 'STUDENT':
                 return JsonResponse({'error': 'Permission denied. Student account required.'}, status=403)

        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expired.'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token.'}, status=401)
            
        return self.get_response(request)

    def _try_extract_user(self, request):
        """Essaie d'extraire l'utilisateur sans bloquer si pas de token"""
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            try:
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                request.user_id = payload.get('user_id')
                request.user_type = payload.get('user_type')
            except:
                pass
