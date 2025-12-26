from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.db import execute_query, queries
from django.core.files.storage import default_storage
import json


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
            (request.user.id, request.user.id, request.user.id, request.user.id), 
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
            'saved_offers_count': stats['saved_offers_count'] or 0,
            'profile_views': stats['views_count'] or 0,
            'profile_completeness': completeness,
            'unread_notifications': stats['unread_notifications'] or 0,
            'recent_notifications': recent_notifications,
            'recommendations': recommendations[:3]
        })
    
    def get_recommendations(self, user_id):
        """Obtenir les offres recommandées basées sur les compétences."""
        student = execute_query(queries['get_student_skills'], (user_id,), fetch_one=True)
        if not student or not student.get('skills'):
            return []
            
        skills = student['skills'].split(',')
        skills = [s.strip() for s in skills if s.strip()]
        
        if not skills:
            return []
            
        base_query = queries['get_recommendations_base']
        skill_filters = " OR ".join(["o.skills LIKE %s" for _ in skills])
        query = f"{base_query} AND ({skill_filters}) ORDER BY o.created_at DESC LIMIT 5"
        
        params = [f"%{s}%" for s in skills]
        return execute_query(query, tuple(params), fetch_all=True) or []


class StudentProfileView(APIView):
    """
    Gestion du profil étudiant.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)

        profile = execute_query(queries['get_student_profile_full'], (request.user.id,), fetch_one=True)
        if profile:
            profile['completeness'] = calculate_completeness(profile)
        return Response(profile)

    def put(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        fields = ['first_name', 'last_name', 'title', 'bio', 'skills', 'formations', 'experiences', 'linkedin_url', 'github_url']
        updates = []
        params = []
        
        for field in fields:
            if field in data:
                updates.append(f"{field} = %s")
                # Handle JSON fields
                value = data[field]
                if field in ['formations', 'experiences'] and isinstance(value, (list, dict)):
                    value = json.dumps(value)
                params.append(value)
        
        if not updates:
            return Response({'message': 'Aucune modification'})
            
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
            
        return Response(profile)


class RecommendationsView(APIView):
    """
    Obtenir les offres recommandées pour l'étudiant.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)
            
        student = execute_query(queries['get_student_skills'], (request.user.id,), fetch_one=True)
        if not student or not student.get('skills'):
            # Return recent offers if no skills
            offers = execute_query(queries['list_offers_base'] + " ORDER BY o.created_at DESC LIMIT 10", fetch_all=True)
            return Response(offers or [])
            
        skills = student['skills'].split(',')
        skills = [s.strip() for s in skills if s.strip()]
        
        if not skills:
            return Response([])
            
        base_query = queries['get_recommendations_base']
        skill_filters = " OR ".join(["o.skills LIKE %s" for _ in skills])
        query = f"{base_query} AND ({skill_filters}) ORDER BY o.created_at DESC LIMIT 10"
        
        params = [f"%{s}%" for s in skills]
        offers = execute_query(query, tuple(params), fetch_all=True)
        return Response(offers or [])


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
    Téléverser un CV au format PDF.
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

        # Validate file size (max 5MB)
        if file.size > 5 * 1024 * 1024:
            return Response({'error': 'Le fichier ne doit pas dépasser 5 Mo'}, status=status.HTTP_400_BAD_REQUEST)

        file_name = f"cv_{request.user.id}.pdf"
        file_path = default_storage.save(f"cvs/{file_name}", file)
        execute_query(queries['update_student_cv'], (file_path, request.user.id), commit=True)
        return Response({'message': 'CV téléversé', 'path': file_path})

    def delete(self, request):
        """Supprimer le CV."""
        if request.user.role != 'STUDENT':
            return Response({'error': 'Accès réservé aux étudiants'}, status=status.HTTP_403_FORBIDDEN)

        execute_query(queries['update_student_cv'], (None, request.user.id), commit=True)
        return Response({'message': 'CV supprimé'})


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
