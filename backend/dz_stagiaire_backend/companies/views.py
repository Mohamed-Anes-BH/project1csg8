from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from core.db import execute_query, queries
from django.core.files.storage import default_storage
from django.http import FileResponse
from django.conf import settings
import os


def calculate_company_completeness(profile):
    """
    Calcule le pourcentage de complétion du profil entreprise.
    """
    if not profile:
        return 0
    fields = ['name', 'description', 'industry', 'location', 'website', 'logo_path', 'size']
    filled = 0
    for field in fields:
        if profile.get(field):
            filled += 1
    return int((filled / len(fields)) * 100)


class CompanyDashboardView(APIView):
    """
    Dashboard entreprise avec statistiques complètes.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Accès réservé aux entreprises'}, status=status.HTTP_403_FORBIDDEN)
            
        # Stats complètes
        stats = execute_query(
            queries['get_company_dashboard_full'], 
            (request.user.id,) * 7,
            fetch_one=True
        )
        
        profile = execute_query(queries['get_company_profile_full'], (request.user.id,), fetch_one=True)
        completeness = calculate_company_completeness(profile)
        
        # Notifications récentes
        recent_notifications = execute_query(
            queries['get_recent_student_notifications'],  # Same query works for both
            (request.user.id, 5), 
            fetch_all=True
        ) or []
        
        return Response({
            'total_offers': stats['total_offers'] or 0,
            'active_offers': stats['active_offers'] or 0,
            'draft_offers': stats['draft_offers'] or 0,
            'applications_received': stats['applications_received'] or 0,
            'pending_applications': stats['pending_applications'] or 0,
            'total_views': stats['total_views'] or 0,
            'profile_completeness': completeness,
            'unread_notifications': stats['unread_notifications'] or 0,
            'recent_notifications': recent_notifications
        })


class CompanyProfileView(APIView):
    """
    Gestion du profil entreprise.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Accès réservé aux entreprises'}, status=status.HTTP_403_FORBIDDEN)

        profile = execute_query(queries['get_company_profile_full'], (request.user.id,), fetch_one=True)
        if not profile:
            return Response({'error': 'Profil non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        # Build social_links object
        social_links = {}
        if profile.get('website'):
            social_links['website'] = profile['website']
        
        logo_url = None
        if profile.get('logo_path'):
            logo_url = request.build_absolute_uri(settings.MEDIA_URL + profile['logo_path'])

        # Build response matching frontend expectations
        response_data = {
            'user_id': profile.get('user_id'),
            'email': profile.get('email'),
            'company_name': profile.get('name'),
            'name': profile.get('name'),
            'description': profile.get('description'),
            'tagline': profile.get('description')[:100] + '...' if profile.get('description') and len(profile.get('description')) > 100 else profile.get('description'),
            'industry': profile.get('industry'),
            'location': profile.get('location'),
            'address': profile.get('address') or profile.get('location'), # Fallback to location if address empty
            'phone': profile.get('phone'),
            'wilaya': profile.get('wilaya'),
            'website': profile.get('website'),
            'logo': logo_url,
            'logo_path': logo_url,
            'size': profile.get('size'),
            'is_verified': profile.get('is_verified', False),
            'social_links': social_links,
            'completeness': calculate_company_completeness(profile)
        }
        
        return Response(response_data)

    def put(self, request):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Accès réservé aux entreprises'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        
        # Update email if provided
        if 'email' in data:
            execute_query("UPDATE users SET email = %s WHERE id = %s", (data['email'], request.user.id), commit=True)
            
        fields = ['name', 'description', 'industry', 'location', 'website', 'size', 'phone', 'wilaya', 'address']
        updates = []
        params = []
        
        for field in fields:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])
        
        if not updates and 'email' not in data:
            return Response({'message': 'Aucune modification'})
            
        if updates:
            params.append(request.user.id)
            query = f"UPDATE companies SET {', '.join(updates)} WHERE user_id = %s"
            execute_query(query, tuple(params), commit=True)
            
        return Response({'message': 'Profil mis à jour'})


class PublicCompanyProfileView(APIView):
    """
    Voir le profil public d'une entreprise.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        profile = execute_query(queries['get_company_profile_full'], (pk,), fetch_one=True)
        if not profile:
            return Response({'error': 'Entreprise non trouvée'}, status=status.HTTP_404_NOT_FOUND)
            
        # Offres actives
        offers = execute_query(queries['get_company_active_offers'], (pk,), fetch_all=True)
        profile['active_offers'] = offers or []
        
        return Response(profile)


class UploadLogoView(APIView):
    """
    Téléverser le logo de l'entreprise.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Accès réservé aux entreprises'}, status=status.HTTP_403_FORBIDDEN)

        file = request.FILES.get('logo')
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

        file_name = f"logo_{request.user.id}{ext}"
        file_path = default_storage.save(f"logos/{file_name}", file)
        execute_query(queries['upload_company_logo'], (file_path, request.user.id), commit=True)
        
        full_url = request.build_absolute_uri(settings.MEDIA_URL + file_path)
        return Response({'message': 'Logo téléversé', 'path': full_url})

    def delete(self, request):
        """Supprimer le logo."""
        if request.user.role != 'COMPANY':
            return Response({'error': 'Accès réservé aux entreprises'}, status=status.HTTP_403_FORBIDDEN)

        execute_query(queries['upload_company_logo'], (None, request.user.id), commit=True)
        return Response({'message': 'Logo supprimé'})


class CompanyOffersView(APIView):
    """
    Liste des offres de l'entreprise avec statistiques.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Accès réservé aux entreprises'}, status=status.HTTP_403_FORBIDDEN)

        status_filter = request.query_params.get('status')
        
        # Base query to get offers with stats
        query = """
            SELECT o.*, 
                (SELECT COUNT(*) FROM applications WHERE offer_id = o.id) as applications_count
            FROM offers o 
            WHERE o.company_id = %s AND o.deleted_at IS NULL
        """
        params = [request.user.id]
        
        # Status Filter
        if status_filter:
            status_val = status_filter.upper()
            
            # Map frontend labels to DB status
            # 'Publiées' -> OPEN
            # 'Brouillons' -> DRAFT
            # 'Archivées' -> ARCHIVED
            if status_val in ['PUBLISHED', 'PUBLIÉES', 'ACTIVE']: 
                status_val = 'OPEN'
            elif status_val in ['BROUILLONS', 'DRAFTS']:
                status_val = 'DRAFT'
            elif status_val in ['ARCHIVÉES', 'ARCHIVES']:
                status_val = 'ARCHIVED'
                
            # Filter if it's a valid status
            if status_val in ['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED']:
                query += " AND o.status = %s"
                params.append(status_val)

        # Title Search
        search_query = request.query_params.get('search')
        if search_query:
            query += " AND o.title LIKE %s"
            params.append(f"%{search_query}%")
        
        query += " ORDER BY o.created_at DESC"
        
        offers = execute_query(query, tuple(params), fetch_all=True)
        
        return Response(offers or [])


class CompanyApplicationsView(APIView):
    """
    Liste des candidatures reçues avec filtres.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Accès réservé aux entreprises'}, status=status.HTTP_403_FORBIDDEN)

        status_filter = request.query_params.get('status')
        offer_id = request.query_params.get('offer_id')
        days = request.query_params.get('days')
        
        if days:
            applications = execute_query(
                queries['list_recent_applications_company'], 
                (request.user.id, int(days)), 
                fetch_all=True
            )
        elif offer_id:
            applications = execute_query(
                queries['filter_applications_by_offer'], 
                (offer_id, request.user.id), 
                fetch_all=True
            )
        elif status_filter:
            applications = execute_query(
                queries['filter_applications_by_status'], 
                (request.user.id, status_filter.upper()), 
                fetch_all=True
            )
        else:
            applications = execute_query(
                queries['list_applications_company'], 
                (request.user.id,), 
                fetch_all=True
            )
        
        # Helper to attach absolute URLs
        if applications:
            for app in applications:
                if app.get('avatar_path'):
                    app['avatar_path'] = request.build_absolute_uri(settings.MEDIA_URL + app['avatar_path'])
                
                # Check if cv_path implies a relative path that needs absolute URL
                # Note: DownloadStudentCVView handles actual download, but if frontend needs a link:
                if app.get('cv_path'):
                    app['cv_path'] = request.build_absolute_uri(settings.MEDIA_URL + app['cv_path'])

        return Response(applications or [])


class DownloadStudentCVView(APIView):
    """
    Télécharger le CV d'un étudiant (entreprise uniquement).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Accès réservé aux entreprises'}, status=status.HTTP_403_FORBIDDEN)

        student = execute_query(queries['get_student_cv_for_download'], (student_id,), fetch_one=True)
        
        if not student or not student.get('cv_path'):
            return Response({'error': 'CV non disponible'}, status=status.HTTP_404_NOT_FOUND)

        cv_path = student['cv_path']
        
        if default_storage.exists(cv_path):
            file = default_storage.open(cv_path, 'rb')
            filename = f"CV_{student.get('first_name', '')}_{student.get('last_name', '')}.pdf"
            response = FileResponse(file, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        
        return Response({'error': 'Fichier non trouvé'}, status=status.HTTP_404_NOT_FOUND)


class CompanySettingsView(APIView):
    """
    Paramètres de l'entreprise.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Accès réservé aux entreprises'}, status=status.HTTP_403_FORBIDDEN)

        alerts = execute_query(queries['get_email_alerts_status'], (request.user.id,), fetch_one=True)
        
        return Response({
            'email_alerts': alerts['email_alerts'] if alerts else True
        })

    def patch(self, request):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Accès réservé aux entreprises'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        
        if 'email_alerts' in data:
            execute_query(queries['update_email_alerts_status'], (data['email_alerts'], request.user.id), commit=True)
        
        return Response({'message': 'Paramètres mis à jour'})
