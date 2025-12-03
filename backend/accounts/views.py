import json
import hashlib
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .db_utils import execute_query_one, execute_update

def hash_password(password):
    """Hash simple avec SHA-256 (pour MVP)"""
    return hashlib.sha256(password.encode()).hexdigest()

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
        
        # Vérifier si l'email existe déjà
        existing_user = execute_query_one("SELECT id FROM users WHERE email = %s", [email])
        if existing_user:
            return JsonResponse({'error': 'Email already exists'}, status=400)
        
        # Créer l'utilisateur
        hashed_password = hash_password(password)
        user_id = execute_update(
            "INSERT INTO users (email, password, user_type) VALUES (%s, %s, 'STUDENT')",
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
        
        return JsonResponse({'success': True, 'user_id': user_id, 'message': 'Student registered successfully'})
        
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
        
        # Vérifier si l'email existe déjà
        existing_user = execute_query_one("SELECT id FROM users WHERE email = %s", [email])
        if existing_user:
            return JsonResponse({'error': 'Email already exists'}, status=400)
        
        # Créer l'utilisateur
        hashed_password = hash_password(password)
        user_id = execute_update(
            "INSERT INTO users (email, password, user_type) VALUES (%s, %s, 'COMPANY')",
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
        
        return JsonResponse({'success': True, 'user_id': user_id, 'message': 'Company registered successfully'})
        
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
        
        hashed_password = hash_password(password)
        
        # Vérifier les identifiants
        user = execute_query_one(
            "SELECT id, email, user_type FROM users WHERE email = %s AND password = %s",
            [email, hashed_password]
        )
        
        if not user:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        
        # Récupérer les détails du profil
        profile_data = {}
        if user['user_type'] == 'STUDENT':
            profile = execute_query_one("SELECT * FROM student_profiles WHERE user_id = %s", [user['id']])
            if profile:
                profile_data = {
                    'first_name': profile['first_name'],
                    'last_name': profile['last_name'],
                    'university_id': profile['university_id'],
                    'student_id': profile['id'] # ID du profil étudiant, utile pour postuler
                }
        else:
            profile = execute_query_one("SELECT * FROM company_profiles WHERE user_id = %s", [user['id']])
            if profile:
                profile_data = {
                    'company_name': profile['company_name'],
                    'company_id': profile['id'] # ID du profil entreprise, utile pour créer des offres
                }
        
        return JsonResponse({
            'success': True,
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
def student_profile(request):
    if request.method == 'GET':
        user_id = request.GET.get('user_id')
        if not user_id:
            return JsonResponse({'error': 'User ID required'}, status=400)
            
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
            data = json.loads(request.body)
            user_id = data.get('user_id')
            
            if not user_id:
                return JsonResponse({'error': 'User ID required'}, status=400)

            # Update fields
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
        user_id = request.GET.get('user_id')
        if not user_id:
            return JsonResponse({'error': 'User ID required'}, status=400)
            
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
            data = json.loads(request.body)
            user_id = data.get('user_id')
            
            if not user_id:
                return JsonResponse({'error': 'User ID required'}, status=400)

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
