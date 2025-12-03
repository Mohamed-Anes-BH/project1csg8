import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .db_utils import execute_query, execute_query_one, execute_update, execute_many

@csrf_exempt
def create_offer(request):
    """Créer une nouvelle offre (Entreprise uniquement)"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        company_id = data.get('company_id') # Devrait venir de la session/token en prod
        
        # 1. Créer l'offre
        offer_id = execute_update(
            """
            INSERT INTO offers (company_id, title, description, offer_type, duration, location, is_targeted)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            [
                company_id,
                data.get('title'),
                data.get('description'),
                data.get('offer_type'), # STAGE, PFE, PREMIER_EMPLOI
                data.get('duration'),
                data.get('location'),
                data.get('is_targeted', False)
            ]
        )
        
        # 2. Ajouter les spécialités requises (Many-to-Many)
        specialty_ids = data.get('specialty_ids', [])
        if specialty_ids:
            specialty_params = [(offer_id, spec_id) for spec_id in specialty_ids]
            execute_many(
                "INSERT INTO offer_specialties (offer_id, specialty_id) VALUES (%s, %s)",
                specialty_params
            )
            
        # 3. Ajouter le ciblage universités si nécessaire
        if data.get('is_targeted'):
            university_ids = data.get('university_ids', [])
            if university_ids:
                uni_params = [(offer_id, uni_id) for uni_id in university_ids]
                execute_many(
                    "INSERT INTO offer_universities (offer_id, university_id) VALUES (%s, %s)",
                    uni_params
                )
        
        return JsonResponse({'success': True, 'offer_id': offer_id, 'message': 'Offer created successfully'})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def offer_list(request):
    """Liste des offres avec filtres"""
    try:
        keyword = request.GET.get('keyword', '')
        offer_type = request.GET.get('type', '')
        
        query = """
            SELECT o.*, c.company_name, c.logo,
                   GROUP_CONCAT(DISTINCT s.name) as specialties
            FROM offers o
            JOIN company_profiles c ON o.company_id = c.id
            LEFT JOIN offer_specialties os ON o.id = os.offer_id
            LEFT JOIN specialties s ON os.specialty_id = s.id
            WHERE o.is_active = 1
        """
        params = []
        
        if keyword:
            query += " AND (o.title LIKE %s OR o.description LIKE %s)"
            params.extend([f'%{keyword}%', f'%{keyword}%'])
            
        if offer_type:
            query += " AND o.offer_type = %s"
            params.append(offer_type)
            
        query += " GROUP BY o.id ORDER BY o.created_at DESC"
        
        offers = execute_query(query, params)
        return JsonResponse({'offers': offers})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def offer_detail(request, offer_id):
    """Détail d'une offre"""
    try:
        offer = execute_query_one(
            """
            SELECT o.*, c.company_name, c.description as company_description, c.website
            FROM offers o
            JOIN company_profiles c ON o.company_id = c.id
            WHERE o.id = %s
            """,
            [offer_id]
        )
        
        if not offer:
            return JsonResponse({'error': 'Offer not found'}, status=404)
            
        # Récupérer les spécialités
        specialties = execute_query(
            """
            SELECT s.id, s.name FROM specialties s
            JOIN offer_specialties os ON s.id = os.specialty_id
            WHERE os.offer_id = %s
            """,
            [offer_id]
        )
        offer['specialties'] = specialties
        
        return JsonResponse({'offer': offer})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def apply_to_offer(request, offer_id):
    """Postuler à une offre (Étudiant)"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        student_id = data.get('student_id') # Devrait venir de la session
        
        # Vérifier si déjà postulé
        existing = execute_query_one(
            "SELECT id FROM applications WHERE offer_id = %s AND student_id = %s",
            [offer_id, student_id]
        )
        if existing:
            return JsonResponse({'error': 'Already applied to this offer'}, status=400)
            
        execute_update(
            "INSERT INTO applications (offer_id, student_id, status) VALUES (%s, %s, 'REÇUE')",
            [offer_id, student_id]
        )
        
        return JsonResponse({'success': True, 'message': 'Application submitted successfully'})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def company_dashboard(request):
    """Dashboard Entreprise - Liste des offres et stats"""
    try:
        company_id = request.GET.get('company_id')
        if not company_id:
            return JsonResponse({'error': 'Company ID required'}, status=400)
            
        # 1. Récupérer les offres de l'entreprise avec le nombre de candidats
        offers = execute_query(
            """
            SELECT o.*, COUNT(a.id) as application_count
            FROM offers o
            LEFT JOIN applications a ON o.id = a.offer_id
            WHERE o.company_id = %s
            GROUP BY o.id
            ORDER BY o.created_at DESC
            """,
            [company_id]
        )
        
        # 2. Récupérer les candidatures récentes détaillées
        recent_applications = execute_query(
            """
            SELECT a.id, a.status, a.applied_at,
                   o.title as offer_title,
                   s.first_name, s.last_name, s.cv_visibility,
                   u.name as university_name, spec.name as specialty_name
            FROM applications a
            JOIN offers o ON a.offer_id = o.id
            JOIN student_profiles s ON a.student_id = s.id
            LEFT JOIN universities u ON s.university_id = u.id
            LEFT JOIN specialties spec ON s.specialty_id = spec.id
            WHERE o.company_id = %s
            ORDER BY a.applied_at DESC
            LIMIT 10
            """,
            [company_id]
        )
        
        return JsonResponse({
            'offers': offers,
            'recent_applications': recent_applications
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def update_application_status(request, application_id):
    """Changer le statut d'une candidature (Entreprise)"""
    if request.method != 'PUT':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        new_status = data.get('status')
        
        if new_status not in ['REÇUE', 'EN_COURS', 'ENTRETIEN', 'ACCEPTÉE', 'REFUSÉE']:
            return JsonResponse({'error': 'Invalid status'}, status=400)
            
        execute_update(
            "UPDATE applications SET status = %s WHERE id = %s",
            [new_status, application_id]
        )
        
        return JsonResponse({'success': True, 'message': 'Status updated successfully'})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
