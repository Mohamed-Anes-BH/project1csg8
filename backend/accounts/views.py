import json
import bcrypt
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from .db_utils import execute_query_one, execute_update, execute_query
from .email_utils import generate_verification_token, send_verification_email, verify_token
from core.validators import validate_email, validate_password_strength

def hash_password(password):
    """Hash sécurisé avec Bcrypt (Production Ready)"""
    # encode() convertit la string en bytes, hashpw attend des bytes
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')  # On stocke le hash sous forme de string

def check_password(password, hashed_password):
    """Vérifie le mot de passe avec Bcrypt"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_tokens_for_user(user):
    """Generate JWT tokens for a user"""
    refresh = RefreshToken()
    refresh['user_id'] = user['id']
    refresh['email'] = user['email']
    refresh['user_type'] = user['user_type']
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@csrf_exempt
def register_student(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        
        # Validation
        if not validate_email(email):
            return JsonResponse({'error': 'Invalid email format'}, status=400)
            
        is_strong, msg = validate_password_strength(password)
        if not is_strong:
            return JsonResponse({'error': msg}, status=400)
        
        # Vérifier si l'email existe déjà
        existing_user = execute_query_one("SELECT id FROM users WHERE email = %s", [email])
        if existing_user:
            return JsonResponse({'error': 'Email already exists'}, status=400)
        
        # Créer l'utilisateur (non vérifié)
        hashed_password = hash_password(password)
        user_id = execute_update(
            "INSERT INTO users (email, password, user_type, is_verified) VALUES (%s, %s, 'STUDENT', FALSE)",
            [email, hashed_password]
        )
        
        # Créer le profil étudiant
        execute_update(
            """
            INSERT INTO student_profiles (user_id, first_name, last_name, university_id, domain_id, specialty_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            [
                user_id, 
                first_name, 
                last_name,
                data.get('university_id'),
                data.get('domain_id'),
                data.get('specialty_id')
            ]
        )
        
        # Générer token de vérification et envoyer email
        token = generate_verification_token(user_id)
        email_sent = send_verification_email(email, token, 'STUDENT')
        
        return JsonResponse({
            'success': True,
            'message': 'Inscription réussie ! Vérifiez votre email pour activer votre compte.',
            'email_sent': email_sent
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def register_company(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        company_name = data.get('company_name')
        
        # Validation
        if not validate_email(email):
            return JsonResponse({'error': 'Invalid email format'}, status=400)
            
        is_strong, msg = validate_password_strength(password)
        if not is_strong:
            return JsonResponse({'error': msg}, status=400)
        
        # Vérifier si l'email existe déjà
        existing_user = execute_query_one("SELECT id FROM users WHERE email = %s", [email])
        if existing_user:
            return JsonResponse({'error': 'Email already exists'}, status=400)
        
        # Créer l'utilisateur (non vérifié)
        hashed_password = hash_password(password)
        user_id = execute_update(
            "INSERT INTO users (email, password, user_type, is_verified) VALUES (%s, %s, 'COMPANY', FALSE)",
            [email, hashed_password]
        )
        
        # Créer le profil entreprise
        execute_update(
            """
            INSERT INTO company_profiles (user_id, company_name, description, sector, website)
            VALUES (%s, %s, %s, %s, %s)
            """,
            [
                user_id, 
                company_name,
                data.get('description', ''),
                data.get('sector', ''),
                data.get('website', '')
            ]
        )
        
        # Générer token de vérification et envoyer email
        token = generate_verification_token(user_id)
        email_sent = send_verification_email(email, token, 'COMPANY')
        
        return JsonResponse({
            'success': True,
            'message': 'Inscription réussie ! Vérifiez votre email pour activer votre compte.',
            'email_sent': email_sent
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def verify_email(request, token):
    """Verify email with token"""
    try:
        user_id, error = verify_token(token)
        
        if error:
            return JsonResponse({'error': error}, status=400)
        
        # Mark user as verified
        execute_update(
            "UPDATE users SET is_verified = TRUE WHERE id = %s",
            [user_id]
        )
        
        # Delete used token
        execute_update(
            "DELETE FROM verification_tokens WHERE token = %s",
            [token]
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        # Récupérer l'utilisateur par email
        user = execute_query_one(
            "SELECT id, email, password, user_type, is_verified FROM users WHERE email = %s",
            [email]
        )
        
        if not user or not check_password(password, user['password']):
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        
        # Vérifier si l'email est vérifié
        if not user['is_verified']:
            return JsonResponse({
                'error': 'Email not verified',
                'message': 'Veuillez vérifier votre email avant de vous connecter.'
            }, status=403)
        
        # Générer JWT tokens
        tokens = get_tokens_for_user(user)
        
        # Récupérer les détails du profil
        profile_data = {}
        if user['user_type'] == 'STUDENT':
            profile = execute_query_one("SELECT * FROM student_profiles WHERE user_id = %s", [user['id']])
            if profile:
                profile_data = {
                    'first_name': profile['first_name'],
                    'last_name': profile['last_name'],
                    'university_id': profile['university_id'],
                    'student_id': profile['id']
                }
        else:
            profile = execute_query_one("SELECT * FROM company_profiles WHERE user_id = %s", [user['id']])
            if profile:
                profile_data = {
                    'company_name': profile['company_name'],
                    'company_id': profile['id']
                }
        
        return JsonResponse({
            'success': True,
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': {
                'id': user['id'],
                'email': user['email'],
                'user_type': user['user_type'],
                **profile_data
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def refresh_token_view(request):
    """Refresh access token using refresh token"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        refresh_token = data.get('refresh')
        
        if not refresh_token:
            return JsonResponse({'error': 'Refresh token required'}, status=400)
        
        # Validate and refresh token
        token = RefreshToken(refresh_token)
        
        return JsonResponse({
            'success': True,
            'access': str(token.access_token)
        })
        
    except Exception as e:
        return JsonResponse({'error': 'Invalid or expired refresh token'}, status=401)

# Keep existing profile views unchanged
@csrf_exempt
def student_profile(request):
    if request.method == 'GET':
        # Sécurité: Utiliser l'ID du token
        if not hasattr(request, 'user_id') or request.user_type != 'STUDENT':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        user_id = request.user_id
            
        try:
            query = """
                SELECT u.email, sp.*, 
                       univ.name as university_name, 
                       d.name as domain_name, 
                       s.name as specialty_name
                FROM users u
                JOIN student_profiles sp ON u.id = sp.user_id
                LEFT JOIN universities univ ON sp.university_id = univ.id
                LEFT JOIN domains d ON sp.domain_id = d.id
                LEFT JOIN specialties s ON sp.specialty_id = s.id
                WHERE u.id = %s
            """
            profile = execute_query_one(query, [user_id])
            
            if not profile:
                return JsonResponse({'error': 'Profile not found'}, status=404)
                
            return JsonResponse({'profile': profile})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    elif request.method == 'PUT':
        try:
            # Sécurité: Utiliser l'ID du token
            if not hasattr(request, 'user_id') or request.user_type != 'STUDENT':
                return JsonResponse({'error': 'Unauthorized'}, status=401)
                
            user_id = request.user_id
            data = json.loads(request.body)

            query = """
                UPDATE student_profiles 
                SET first_name = %s, last_name = %s, 
                    skills = %s, experience = %s, education = %s,
                    portfolio_link = %s, github_link = %s, cv_visibility = %s
                WHERE user_id = %s
            """
            params = [
                data.get('first_name'),
                data.get('last_name'),
                data.get('skills'),
                data.get('experience'),
                data.get('education'),
                data.get('portfolio_link'),
                data.get('github_link'),
                data.get('cv_visibility', 'PRIVATE'),
                user_id
            ]
            
            execute_update(query, params)
            return JsonResponse({'success': True, 'message': 'Profile updated successfully'})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def company_profile(request):
    if request.method == 'GET':
        # Sécurité: Utiliser l'ID du token
        if not hasattr(request, 'user_id') or request.user_type != 'COMPANY':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        user_id = request.user_id
            
        try:
            query = """
                SELECT u.email, cp.*
                FROM users u
                JOIN company_profiles cp ON u.id = cp.user_id
                WHERE u.id = %s
            """
            profile = execute_query_one(query, [user_id])
            
            if not profile:
                return JsonResponse({'error': 'Profile not found'}, status=404)
                
            return JsonResponse({'profile': profile})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    elif request.method == 'PUT':
        try:
            # Sécurité: Utiliser l'ID du token
            if not hasattr(request, 'user_id') or request.user_type != 'COMPANY':
                return JsonResponse({'error': 'Unauthorized'}, status=401)
                
            user_id = request.user_id
            data = json.loads(request.body)

            query = """
                UPDATE company_profiles 
                SET company_name = %s, description = %s, 
                    sector = %s, website = %s
                WHERE user_id = %s
            """
            params = [
                data.get('company_name'),
                data.get('description'),
                data.get('sector'),
                data.get('website'),
                user_id
            ]
            
            execute_update(query, params)
            return JsonResponse({'success': True, 'message': 'Profile updated successfully'})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# ============================================
# RECHERCHE DE PROFILS (ENTREPRISE)
# ============================================

def search_students(request):
    """Rechercher des profils étudiants (visible uniquement si cv_visibility='PUBLIC')"""
    try:
        keyword = request.GET.get('keyword', '')
        specialty_id = request.GET.get('specialty_id', '')
        university_id = request.GET.get('university_id', '')
        domain_id = request.GET.get('domain_id', '')
        
        query = """
            SELECT sp.id, sp.first_name, sp.last_name, sp.skills, sp.experience,
                   sp.education, sp.portfolio_link, sp.github_link,
                   u.name as university_name, d.name as domain_name, s.name as specialty_name
            FROM student_profiles sp
            LEFT JOIN universities u ON sp.university_id = u.id
            LEFT JOIN domains d ON sp.domain_id = d.id
            LEFT JOIN specialties s ON sp.specialty_id = s.id
            WHERE sp.cv_visibility = 'PUBLIC'
        """
        params = []
        
        if keyword:
            query += """ AND (
                sp.first_name LIKE %s OR sp.last_name LIKE %s OR 
                sp.skills LIKE %s OR sp.experience LIKE %s
            )"""
            keyword_param = f'%{keyword}%'
            params.extend([keyword_param, keyword_param, keyword_param, keyword_param])
        
        if specialty_id:
            query += " AND sp.specialty_id = %s"
            params.append(specialty_id)
        
        if university_id:
            query += " AND sp.university_id = %s"
            params.append(university_id)
        
        if domain_id:
            query += " AND sp.domain_id = %s"
            params.append(domain_id)
        
        query += " ORDER BY sp.updated_at DESC LIMIT 50"
        
        students = execute_query(query, params)
        return JsonResponse({'students': students, 'count': len(students)})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
