import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .db_utils import execute_query, execute_query_one, execute_update, execute_many
from core.views import create_notification

@csrf_exempt
def create_offer(request):
    """Créer une nouvelle offre (Entreprise uniquement)"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    

    try:
        data = json.loads(request.body)
        
        # Sécurité: Récupérer l'ID de l'entreprise via le token
        if not hasattr(request, 'user_id') or request.user_type != 'COMPANY':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        # Récupérer l'ID du profil entreprise
        company_profile = execute_query_one(
            "SELECT id FROM company_profiles WHERE user_id = %s", 
            [request.user_id]
        )
        if not company_profile:
            return JsonResponse({'error': 'Company profile not found'}, status=404)
            
        company_id = company_profile['id']
        
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
    """Liste des offres avec filtres avancés"""
    try:
        keyword = request.GET.get('keyword', '')
        offer_type = request.GET.get('type', '')
        location = request.GET.get('location', '')
        sector = request.GET.get('sector', '')
        
        # Sécurité: Utiliser l'ID du token s'il existe (injecté par middleware)
        student_id = getattr(request, 'user_id', None)
        
        # Si c'est un étudiant connecté, on récupère son ID de profil pour le ciblage
        student_profile_id = None
        if student_id and getattr(request, 'user_type', '') == 'STUDENT':
            profile = execute_query_one("SELECT id FROM student_profiles WHERE user_id = %s", [student_id])
            if profile:
                student_profile_id = profile['id']
        
        query = """
            SELECT o.*, c.company_name, c.logo, c.sector,
                   GROUP_CONCAT(DISTINCT s.name) as specialties
            FROM offers o
            JOIN company_profiles c ON o.company_id = c.id
            LEFT JOIN offer_specialties os ON o.id = os.offer_id
            LEFT JOIN specialties s ON os.specialty_id = s.id
            WHERE o.is_active = 1
        """
        params = []
        
        # Filtrage des offres ciblées selon l'université de l'étudiant
        if student_profile_id:
            query += """
                AND (
                    o.is_targeted = FALSE
                    OR o.id IN (
                        SELECT ou.offer_id 
                        FROM offer_universities ou
                        JOIN student_profiles sp ON sp.university_id = ou.university_id
                        WHERE sp.id = %s
                    )
                )
            """
            params.append(student_profile_id)
        
        if keyword:
            query += " AND (o.title LIKE %s OR o.description LIKE %s)"
            params.extend([f'%{keyword}%', f'%{keyword}%'])
            
        if offer_type:
            query += " AND o.offer_type = %s"
            params.append(offer_type)

        if location:
            query += " AND o.location LIKE %s"
            params.append(f'%{location}%')

        if sector:
            query += " AND c.sector = %s"
            params.append(sector)
            
        # Pagination
        try:
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 20))
        except ValueError:
            page = 1
            limit = 20
            
        offset = (page - 1) * limit

        # Ajouter GROUP BY (nécessaire pour le count et le select final)
        query += " GROUP BY o.id, c.company_name, c.logo, c.sector"

        # Compter le total (pour la pagination)
        count_query = f"SELECT COUNT(*) as total FROM ({query}) as subquery"
        total_result = execute_query_one(count_query, params)
        total_count = total_result['total'] if total_result else 0
        
        # Ajouter ORDER BY, LIMIT et OFFSET pour la requête finale
        query += " ORDER BY o.created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        offers = execute_query(query, params)
        
        return JsonResponse({
            'offers': offers,
            'pagination': {
                'current_page': page,
                'total_pages': (total_count + limit - 1) // limit,
                'total_count': total_count,
                'limit': limit
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def recommended_offers(request):
    """Recommande des offres basées sur la spécialité de l'étudiant"""
    try:
        student_id = request.GET.get('student_id')
        if not student_id:
            return JsonResponse({'error': 'Student ID required'}, status=400)

        # 1. Récupérer la spécialité de l'étudiant
        student_profile = execute_query_one(
            "SELECT specialty_id FROM student_profiles WHERE id = %s",
            [student_id]
        )
        
        if not student_profile or not student_profile['specialty_id']:
            return JsonResponse({'offers': []}) # Pas de spécialité, pas de recommandation ciblée

        specialty_id = student_profile['specialty_id']

        # 2. Trouver les offres qui matchent cette spécialité
        # On exclut les offres déjà postulées par cet étudiant
        query = """
            SELECT DISTINCT o.*, c.company_name, c.logo
            FROM offers o
            JOIN company_profiles c ON o.company_id = c.id
            JOIN offer_specialties os ON o.id = os.offer_id
            WHERE o.is_active = 1
            AND os.specialty_id = %s
            AND o.id NOT IN (
                SELECT offer_id FROM applications WHERE student_id = %s
            )
            ORDER BY o.created_at DESC
        """
        
        offers = execute_query(query, [specialty_id, student_id])
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
        # Sécurité: Vérifier que c'est un étudiant
        if not hasattr(request, 'user_id') or request.user_type != 'STUDENT':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        # Récupérer l'ID du profil étudiant
        profile = execute_query_one("SELECT id FROM student_profiles WHERE user_id = %s", [request.user_id])
        if not profile:
            return JsonResponse({'error': 'Student profile not found'}, status=404)
            
        student_id = profile['id']
        
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
        # Sécurité: Vérifier que c'est une entreprise
        if not hasattr(request, 'user_id') or request.user_type != 'COMPANY':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        # Récupérer l'ID du profil entreprise
        profile = execute_query_one("SELECT id FROM company_profiles WHERE user_id = %s", [request.user_id])
        if not profile:
            return JsonResponse({'error': 'Company profile not found'}, status=404)
            
        company_id = profile['id']
            
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
        
        # Récupérer les infos de la candidature pour la notification
        application_info = execute_query_one(
            """
            SELECT a.student_id, o.title, sp.user_id, c.company_name
            FROM applications a
            JOIN offers o ON a.offer_id = o.id
            JOIN student_profiles sp ON a.student_id = sp.id
            JOIN company_profiles c ON o.company_id = c.id
            WHERE a.id = %s
            """,
            [application_id]
        )
        
        if not application_info:
            return JsonResponse({'error': 'Application not found'}, status=404)
            
        # Mettre à jour le statut
        execute_update(
            "UPDATE applications SET status = %s WHERE id = %s",
            [new_status, application_id]
        )
        
        # Créer une notification pour l'étudiant
        status_messages = {
            'REÇUE': 'Votre candidature a été reçue',
            'EN_COURS': 'Votre candidature est en cours d\'étude',
            'ENTRETIEN': 'Vous êtes convoqué(e) à un entretien',
            'ACCEPTÉE': '🎉 Félicitations ! Votre candidature a été acceptée',
            'REFUSÉE': 'Votre candidature n\'a pas été retenue'
        }
        
        notification_message = f"{status_messages[new_status]} pour l'offre \"{application_info['title']}\" chez {application_info['company_name']}"
        create_notification(application_info['user_id'], notification_message, 'APPLICATION_STATUS')
        
        return JsonResponse({'success': True, 'message': 'Status updated successfully'})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# ============================================
# DASHBOARD ÉTUDIANT
# ============================================

def student_applications(request):
    """Dashboard Étudiant - Liste de ses candidatures"""
    try:
        # Sécurité: Utiliser l'ID du token
        if not hasattr(request, 'user_id') or request.user_type != 'STUDENT':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        # Récupérer l'ID du profil étudiant
        profile = execute_query_one("SELECT id FROM student_profiles WHERE user_id = %s", [request.user_id])
        if not profile:
            return JsonResponse({'error': 'Student profile not found'}, status=404)
            
        student_id = profile['id']
        
        # Récupérer toutes les candidatures de l'étudiant
        applications = execute_query(
            """
            SELECT a.id, a.status, a.applied_at, a.updated_at,
                   o.id as offer_id, o.title, o.description, o.offer_type, o.location,
                   c.company_name, c.logo, c.sector
            FROM applications a
            JOIN offers o ON a.offer_id = o.id
            JOIN company_profiles c ON o.company_id = c.id
            WHERE a.student_id = %s
            ORDER BY a.applied_at DESC
            """,
            [student_id]
        )
        
        # Statistiques
        stats = {
            'total': len(applications),
            'en_cours': sum(1 for a in applications if a['status'] in ['REÇUE', 'EN_COURS', 'ENTRETIEN']),
            'acceptees': sum(1 for a in applications if a['status'] == 'ACCEPTÉE'),
            'refusees': sum(1 for a in applications if a['status'] == 'REFUSÉE')
        }
        
        return JsonResponse({
            'applications': applications,
            'stats': stats
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# ============================================
# GESTION DES OFFRES (ENTREPRISE)
# ============================================

@csrf_exempt
def update_offer(request, offer_id):
    """Modifier une offre existante (Entreprise)"""
    if request.method != 'PUT':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        # Sécurité: Vérifier que l'entreprise est propriétaire de l'offre
        if not hasattr(request, 'user_id') or request.user_type != 'COMPANY':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        # Récupérer l'ID du profil entreprise
        company_profile = execute_query_one("SELECT id FROM company_profiles WHERE user_id = %s", [request.user_id])
        if not company_profile:
            return JsonResponse({'error': 'Company profile not found'}, status=404)
            
        # Vérifier que l'offre appartient à cette entreprise
        offer = execute_query_one("SELECT id FROM offers WHERE id = %s AND company_id = %s", [offer_id, company_profile['id']])
        if not offer:
            return JsonResponse({'error': 'Offer not found or permission denied'}, status=404)

        data = json.loads(request.body)
        
        # Mettre à jour l'offre
        execute_update(
            """
            UPDATE offers 
            SET title = %s, description = %s, offer_type = %s, 
                duration = %s, location = %s, is_targeted = %s
            WHERE id = %s
            """,
            [
                data.get('title'),
                data.get('description'),
                data.get('offer_type'),
                data.get('duration'),
                data.get('location'),
                data.get('is_targeted', False),
                offer_id
            ]
        )
        
        # Mettre à jour les spécialités si fournies
        if 'specialty_ids' in data:
            # Supprimer les anciennes
            execute_update("DELETE FROM offer_specialties WHERE offer_id = %s", [offer_id])
            
            # Ajouter les nouvelles
            specialty_ids = data.get('specialty_ids', [])
            if specialty_ids:
                specialty_params = [(offer_id, spec_id) for spec_id in specialty_ids]
                execute_many(
                    "INSERT INTO offer_specialties (offer_id, specialty_id) VALUES (%s, %s)",
                    specialty_params
                )
        
        # Mettre à jour les universités ciblées si fournies
        if 'university_ids' in data:
            # Supprimer les anciennes
            execute_update("DELETE FROM offer_universities WHERE offer_id = %s", [offer_id])
            
            # Ajouter les nouvelles si ciblé
            if data.get('is_targeted'):
                university_ids = data.get('university_ids', [])
                if university_ids:
                    uni_params = [(offer_id, uni_id) for uni_id in university_ids]
                    execute_many(
                        "INSERT INTO offer_universities (offer_id, university_id) VALUES (%s, %s)",
                        uni_params
                    )
        
        return JsonResponse({'success': True, 'message': 'Offer updated successfully'})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def archive_offer(request, offer_id):
    """Archiver une offre (la désactiver)"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        # Sécurité: Vérifier que l'entreprise est propriétaire
        if not hasattr(request, 'user_id') or request.user_type != 'COMPANY':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        company_profile = execute_query_one("SELECT id FROM company_profiles WHERE user_id = %s", [request.user_id])
        if not company_profile:
            return JsonResponse({'error': 'Company profile not found'}, status=404)
            
        # Vérifier ownership
        offer = execute_query_one("SELECT id FROM offers WHERE id = %s AND company_id = %s", [offer_id, company_profile['id']])
        if not offer:
            return JsonResponse({'error': 'Offer not found or permission denied'}, status=404)

        execute_update(
            "UPDATE offers SET is_active = FALSE WHERE id = %s",
            [offer_id]
        )
        return JsonResponse({'success': True, 'message': 'Offer archived successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def delete_offer(request, offer_id):
    """Supprimer une offre définitivement"""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        # Sécurité: Vérifier que l'entreprise est propriétaire
        if not hasattr(request, 'user_id') or request.user_type != 'COMPANY':
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        company_profile = execute_query_one("SELECT id FROM company_profiles WHERE user_id = %s", [request.user_id])
        if not company_profile:
            return JsonResponse({'error': 'Company profile not found'}, status=404)
            
        # Vérifier ownership
        offer = execute_query_one("SELECT id FROM offers WHERE id = %s AND company_id = %s", [offer_id, company_profile['id']])
        if not offer:
            return JsonResponse({'error': 'Offer not found or permission denied'}, status=404)

        execute_update("DELETE FROM offers WHERE id = %s", [offer_id])
        return JsonResponse({'success': True, 'message': 'Offer deleted successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# ============================================
# STATISTIQUES
# ============================================

def track_offer_view(offer_id, student_id=None):
    """Helper function to track offer views"""
    try:
        execute_update(
            "INSERT INTO offer_views (offer_id, student_id) VALUES (%s, %s)",
            [offer_id, student_id]
        )
    except Exception as e:
        print(f"Error tracking view: {e}")

def offer_statistics(request, offer_id):
    """Statistiques d'une offre (vues, candidatures)"""
    try:
        # Nombre de vues
        views_result = execute_query_one(
            "SELECT COUNT(*) as count FROM offer_views WHERE offer_id = %s",
            [offer_id]
        )
        views_count = views_result['count'] if views_result else 0
        
        # Nombre de candidatures par statut
        applications_stats = execute_query(
            """
            SELECT status, COUNT(*) as count
            FROM applications
            WHERE offer_id = %s
            GROUP BY status
            """,
            [offer_id]
        )
        
        # Total candidatures
        total_applications = sum(stat['count'] for stat in applications_stats)
        
        # Taux d'acceptation
        accepted = sum(stat['count'] for stat in applications_stats if stat['status'] == 'ACCEPTÉE')
        acceptance_rate = (accepted / total_applications * 100) if total_applications > 0 else 0
        
        return JsonResponse({
            'views': views_count,
            'total_applications': total_applications,
            'applications_by_status': applications_stats,
            'acceptance_rate': round(acceptance_rate, 2)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

