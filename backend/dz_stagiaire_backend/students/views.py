from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.db import execute_query, queries
from django.core.files.storage import default_storage
import json
import os


def calculate_completeness(profile):
    """
    Calcule le pourcentage de complétion du profil étudiant.
    """
    if not profile:
        return 0
    fields = ['first_name', 'last_name', 'title', 'bio', 'skills', 'formations', 'experiences', 'cv_path', 'linkedin_url', 'github_url']
    filled = 0
    for field in fields:
        if profile.get(field):
            filled += 1
    return int((filled / len(fields)) * 100)


from django.conf import settings

class StudentDashboardView(APIView):
    """
    Dashboard étudiant avec statistiques complètes.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)
            
        # Stats complètes
        stats = execute_query(
            queries['get_student_dashboard_full'], 
            (request.user.id, request.user.id, request.user.id, request.user.id, request.user.id, request.user.id), 
            fetch_one=True
        )
        
        profile = execute_query(queries['get_student_profile_basic'], (request.user.id,), fetch_one=True)
        completeness = calculate_completeness(profile)
        
        # Notifications récentes
        recent_notifications = execute_query(
            queries['get_recent_student_notifications'], 
            (request.user.id, 5), 
            fetch_all=True
        ) or []
        
        # Recommandations
        recommendations = self.get_recommendations(request.user.id)
        
        return Response({
            'applications_count': stats['applications_count'] or 0,
            'accepted_count': stats['accepted_count'] or 0,
            'refused_count': stats['refused_count'] or 0,
            'saved_offers_count': stats['saved_offers_count'] or 0,
            'profile_views': stats['views_count'] or 0,
            'profile_completeness': completeness,
            'unread_notifications': stats['unread_notifications'] or 0,
            'recent_notifications': recent_notifications,
            'recommendations': recommendations[:3]  # Only show top 3 on dashboard
        })
    
    def get_recommendations(self, user_id):
        """Obtenir les offres recommandées (au moins 3 compétences en commun)."""
        return get_strict_recommendations(user_id, limit=3)


class StudentProfileView(APIView):
    """
    Gestion du profil étudiant.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)

        profile = execute_query(queries['get_student_profile_full'], (request.user.id,), fetch_one=True)
        if not profile:
            return Response({'error': 'Profil non trouvé'}, status=status.HTTP_404_NOT_FOUND)
            
        # Transform flat DB data into structure expected by frontend
        # Parse JSON fields
        education = []
        experience = []
        social_links = {}
        
        if profile.get('formations'):
            try:
                education = json.loads(profile['formations']) if isinstance(profile['formations'], str) else profile['formations']
            except (json.JSONDecodeError, TypeError):
                education = []
        
        if profile.get('experiences'):
            try:
                experience = json.loads(profile['experiences']) if isinstance(profile['experiences'], str) else profile['experiences']
            except (json.JSONDecodeError, TypeError):
                experience = []
        
        # Build social links from individual URL fields
        social_links['linkedin'] = profile.get('linkedin_url') or ''
        social_links['github'] = profile.get('github_url') or ''
        social_links['portfolio'] = profile.get('portfolio_url') or ''

        
        # Construct absolute URLs for media
        avatar_url = None
        if profile.get('avatar_path'):
            avatar_url = request.build_absolute_uri(settings.MEDIA_URL + profile['avatar_path'])
            
        resume_url = None
        if profile.get('cv_path'):
            resume_url = request.build_absolute_uri(settings.MEDIA_URL + profile['cv_path'])
        
        # Build response matching frontend expectations
        response_data = {
            'user': {
                'id': profile.get('user_id'),
                'email': profile.get('email'),
                'first_name': profile.get('first_name'),
                'last_name': profile.get('last_name'),
                'username': profile.get('email', '').split('@')[0] if profile.get('email') else None,
                'avatar': avatar_url
            },
            'title': profile.get('title'),
            'bio': profile.get('bio'),
            'phone': profile.get('phone'),
            'wilaya': profile.get('wilaya'),
            'skills': profile.get('skills'),
            'education': education,
            'experience': experience,
            'social_links': social_links,
            'resume': resume_url,
            'is_public': profile.get('is_public', True),
            'email_alerts': profile.get('email_alerts', True),
            'completeness': calculate_completeness(profile)
        }
        
        return Response(response_data)

    def put(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data

        
        # Update email if provided
        if 'email' in data:
            execute_query("UPDATE users SET email = %s WHERE id = %s", (data['email'], request.user.id), commit=True)
            
        updates = []
        params = []
        
        # Mapping frontend field names to DB columns
        field_mapping = {
            'education': 'formations',
            'experience': 'experiences',
            'first_name': 'first_name',
            'last_name': 'last_name',
            'title': 'title', 
            'bio': 'bio', 
            'skills': 'skills',
            'links': 'linkedin_url', # Partial map, handled below 
            'phone': 'phone', 
            'wilaya': 'wilaya'
        }

        # Specific handling for complex or renamed fields
        if 'education' in data:
            val = data['education']
            if isinstance(val, (list, dict)):
                val = json.dumps(val)
            updates.append("formations = %s")
            params.append(val)
            
        if 'experience' in data:
            val = data['experience']
            if isinstance(val, (list, dict)):
                val = json.dumps(val)
            updates.append("experiences = %s")
            params.append(val)
            
        if 'social_links' in data:
            links = data['social_links']
            if isinstance(links, dict):
                if 'linkedin' in links:
                    updates.append("linkedin_url = %s")
                    params.append(links['linkedin'])
                if 'github' in links:
                    updates.append("github_url = %s")
                    params.append(links['github'])
                if 'portfolio' in links:
                    updates.append("portfolio_url = %s")
                    params.append(links['portfolio'])


        # Simple text fields
        simple_fields = ['first_name', 'last_name', 'title', 'bio', 'skills', 'phone', 'wilaya']
        for field in simple_fields:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])
        
        if not updates and 'email' not in data:
            return Response({'message': 'Aucune modification'})
            
        if updates:
            params.append(request.user.id)
            query = f"UPDATE students SET {', '.join(updates)} WHERE user_id = %s"
            execute_query(query, tuple(params), commit=True)
            
        return Response({'message': 'Profil mis à jour'})


class PublicStudentProfileView(APIView):
    """
    Voir le profil public d'un étudiant.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # Incrémenter les vues si ce n'est pas l'étudiant lui-même
        if request.user.id != pk:
            execute_query(queries['increment_student_views'], (pk,), commit=True)
            
        profile = execute_query(queries['get_public_student_profile'], (pk, request.user.id), fetch_one=True)
        if not profile:
            return Response({'error': 'Profil non trouvé ou privé'}, status=status.HTTP_404_NOT_FOUND)
            
        if profile.get('avatar_path'):
            profile['avatar_path'] = request.build_absolute_uri(settings.MEDIA_URL + profile['avatar_path'])
            
        if profile.get('cv_path'):
            profile['cv_path'] = request.build_absolute_uri(settings.MEDIA_URL + profile['cv_path'])
            
        return Response(profile)


def get_strict_recommendations(user_id, limit=None):
    """
    Helper function to filter recommendations based on at least 3 shared skills.
    Returns list of offers.
    """
    student = execute_query(queries['get_student_skills'], (user_id,), fetch_one=True)
    if not student or not student.get('skills'):
        return []
        
    # Clean and split student skills
    student_skills = set(s.strip().lower() for s in student['skills'].split(',') if s.strip())
    
    if not student_skills:
        return []

    # Get potentially relevant offers (broad match first to avoid fetching everything)
    # We use LIKE OR for all skills to get candidates, then filter strictly in Python
    base_query = queries['get_recommendations_base']
    skill_filters = " OR ".join(["o.skills LIKE %s" for _ in student_skills])
    
    # Fetch ample candidates
    query = f"{base_query} AND ({skill_filters}) ORDER BY o.created_at DESC LIMIT 100"
    params = [f"%{s}%" for s in student_skills]
    
    candidates = execute_query(query, tuple(params), fetch_all=True)
    
    if not candidates:
        return []
        
    filtered_offers = []
    for offer in candidates:
        if not offer.get('skills'):
            continue
            
        offer_skills = set(s.strip().lower() for s in offer['skills'].split(',') if s.strip())
        
        # Calculate intersection
        shared_skills = student_skills.intersection(offer_skills)
        
        # Strict condition: At least 3 shared skills
        if len(shared_skills) >= 3:
            filtered_offers.append(offer)
            
    # Apply limit if requested
    if limit:
        return filtered_offers[:limit]
        
    return filtered_offers


class RecommendationsView(APIView):
    """
    Obtenir les offres recommandées pour l'étudiant (Page complète).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)
            
        recommendations = get_strict_recommendations(request.user.id)
        return Response(recommendations)


class ToggleVisibilityView(APIView):
    """
    Basculer la visibilité du profil (public/privé).
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)
            
        current = execute_query(queries['get_student_visibility'], (request.user.id,), fetch_one=True)
        new_val = not current['is_public']
        execute_query(queries['update_student_visibility'], (new_val, request.user.id), commit=True)
        return Response({
            'is_public': new_val,
            'message': f"Profil maintenant {'public' if new_val else 'privé'}"
        })
    
    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)
            
        current = execute_query(queries['get_student_visibility'], (request.user.id,), fetch_one=True)
        return Response({'is_public': current['is_public']})


class UploadCVView(APIView):
    """
    Téléverser un CV au format PDF (Unique).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)

        file = request.FILES.get('cv')
        if not file:
            return Response({'error': 'Aucun fichier fourni'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file type
        if not file.name.lower().endswith('.pdf'):
            return Response({'error': 'Seuls les fichiers PDF sont acceptés'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size
        if file.size > 5 * 1024 * 1024:
            return Response({'error': 'Le fichier ne doit pas dépasser 5 Mo'}, status=status.HTTP_400_BAD_REQUEST)

        # Force single filename to overwrite previous
        file_name = f"cv_{request.user.id}.pdf"
        
        # If file exists, delete it first to ensure overwrite logic works clean with storage (optional)
        if default_storage.exists(f"cvs/{file_name}"):
            default_storage.delete(f"cvs/{file_name}")
            
        file_path = default_storage.save(f"cvs/{file_name}", file)
        
        # Update students table directly
        query = "UPDATE students SET cv_path = %s WHERE user_id = %s"
        execute_query(query, (file_path, request.user.id), commit=True)
        
        full_url = request.build_absolute_uri(settings.MEDIA_URL + file_path)
        return Response({'message': 'CV téléversé', 'path': full_url})

    def delete(self, request):
        """Supprimer le CV."""
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)

        execute_query("UPDATE students SET cv_path = NULL WHERE user_id = %s", (request.user.id,), commit=True)
        return Response({'message': 'CV supprimé'})


class UploadAvatarView(APIView):
    """
    Téléverser l'avatar de l'étudiant.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)

        file = request.FILES.get('avatar')
        if not file:
            return Response({'error': 'Aucun fichier fourni'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file type
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        ext = os.path.splitext(file.name)[1].lower()
        if ext not in allowed_extensions:
            return Response({'error': 'Format non supporté. Utilisez JPG, PNG, GIF ou WebP'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 2MB)
        if file.size > 2 * 1024 * 1024:
            return Response({'error': 'Le fichier ne doit pas dépasser 2 Mo'}, status=status.HTTP_400_BAD_REQUEST)

        file_name = f"avatar_{request.user.id}{ext}"
        file_path = default_storage.save(f"avatars/{file_name}", file)
        
        # Update DB
        query = "UPDATE students SET avatar_path = %s WHERE user_id = %s"
        execute_query(query, (file_path, request.user.id), commit=True)
        
        return Response({'message': 'Avatar téléversé', 'path': file_path})

    def delete(self, request):
        """Supprimer l'avatar."""
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)

        execute_query("UPDATE students SET avatar_path = NULL WHERE user_id = %s", (request.user.id,), commit=True)
        return Response({'message': 'Avatar supprimé'})


class SavedOffersView(APIView):
    """
    Gestion des offres sauvegardées.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)
            
        offers = execute_query(queries['list_saved_offers'], (request.user.id,), fetch_all=True)
        return Response(offers or [])

    def post(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)
            
        offer_id = request.data.get('offer_id')
        if not offer_id:
            return Response({'error': 'ID offre requis'}, status=status.HTTP_400_BAD_REQUEST)
            
        execute_query(queries['save_offer'], (request.user.id, offer_id), commit=True)
        return Response({'message': 'Offre sauvegardée'})

    def delete(self, request, pk):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)
            
        execute_query(queries['unsave_offer'], (request.user.id, pk), commit=True)
        return Response({'message': 'Offre retirée des favoris'})


class StudentSettingsView(APIView):
    """
    Paramètres de l'étudiant.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)

        visibility = execute_query(queries['get_student_visibility'], (request.user.id,), fetch_one=True)
        alerts = execute_query(queries['get_email_alerts_status'], (request.user.id,), fetch_one=True)
        
        return Response({
            'is_public': visibility['is_public'] if visibility else True,
            'email_alerts': alerts['email_alerts'] if alerts else True
        })

    def patch(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        
        if 'is_public' in data:
            execute_query(queries['update_student_visibility'], (data['is_public'], request.user.id), commit=True)
        
        if 'email_alerts' in data:
            execute_query(queries['update_email_alerts_status'], (data['email_alerts'], request.user.id), commit=True)
        
        return Response({'message': 'Paramètres mis à jour'})
