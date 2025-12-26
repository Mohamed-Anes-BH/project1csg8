from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.db import execute_query, queries
from core.notifications import create_notification
from core.utils import paginate_results
from core.logs import log_action
from core.email import send_status_update_email


class ApplicationListView(APIView):
    """
    Liste des candidatures (étudiant: ses candidatures, entreprise: candidatures reçues).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        page = request.query_params.get('page', 1)
        limit = request.query_params.get('limit', 10)
        status_filter = request.query_params.get('status')
        
        if request.user.role == 'STUDENT':
            apps = execute_query(queries['list_applications_student'], (request.user.id,), fetch_all=True)
            
        elif request.user.role == 'COMPANY':
            if status_filter:
                apps = execute_query(
                    queries['filter_applications_by_status'], 
                    (request.user.id, status_filter.upper()), 
                    fetch_all=True
                )
            else:
                apps = execute_query(queries['list_applications_company'], (request.user.id,), fetch_all=True)
        else:
            return Response({'error': 'Rôle invalide'}, status=status.HTTP_400_BAD_REQUEST)
            
        apps = apps or []
        paginated_apps = paginate_results(apps, page, limit)
        
        return Response({
            'count': len(apps),
            'page': int(page),
            'limit': int(limit),
            'results': paginated_apps
        })


class ApplyView(APIView):
    """
    Postuler à une offre.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Seuls les étudiants peuvent postuler'}, status=status.HTTP_403_FORBIDDEN)
            
        offer_id = request.data.get('offer_id')
        if not offer_id:
            return Response({'error': 'ID offre requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier que l'offre existe et est ouverte
        offer = execute_query(queries['get_offer_detail'], (offer_id,), fetch_one=True)
        if not offer:
            return Response({'error': 'Offre non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        
        if offer.get('status') != 'OPEN':
            return Response({'error': 'Cette offre n\'accepte plus de candidatures'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Vérifier que l'étudiant n'a pas déjà postulé
        check = execute_query(queries['check_already_applied'], (offer_id, request.user.id), fetch_one=True)
        if check:
            return Response({'error': 'Vous avez déjà postulé à cette offre'}, status=status.HTTP_400_BAD_REQUEST)
            
        execute_query(queries['create_application'], (offer_id, request.user.id), commit=True)
        
        # Notifier l'entreprise
        company = execute_query(queries['get_company_id_by_offer'], (offer_id,), fetch_one=True)
        if company:
            create_notification(
                company['company_id'], 
                "Nouvelle candidature", 
                f"Un étudiant a postulé à votre offre: {offer.get('title', 'Offre')}"
            )
            
        log_action(request.user.id, "APPLY", f"Candidature soumise pour l'offre {offer_id}")
        return Response({'message': 'Candidature envoyée'}, status=status.HTTP_201_CREATED)


class WithdrawApplicationView(APIView):
    """
    Retirer une candidature (étudiant uniquement, si statut PENDING).
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != 'STUDENT':
            return Response({'error': 'Seuls les étudiants peuvent retirer leurs candidatures'}, status=status.HTTP_403_FORBIDDEN)
            
        # Vérifier propriété et statut
        check = execute_query(queries['check_application_ownership'], (pk, request.user.id), fetch_one=True)
        if not check:
            return Response({'error': 'Candidature non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        
        # Vérifier le statut (ne peut retirer que si PENDING)
        app = execute_query("SELECT status FROM applications WHERE id = %s", (pk,), fetch_one=True)
        if app and app['status'] != 'PENDING':
            return Response({'error': 'Impossible de retirer une candidature déjà traitée'}, status=status.HTTP_400_BAD_REQUEST)
            
        execute_query(queries['delete_application'], (pk,), commit=True)
        log_action(request.user.id, "WITHDRAW_APPLICATION", f"Candidature retirée: {pk}")
        return Response({'message': 'Candidature retirée'})


class UpdateApplicationStatusView(APIView):
    """
    Mettre à jour le statut d'une candidature (entreprise uniquement).
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Seules les entreprises peuvent modifier le statut'}, status=status.HTTP_403_FORBIDDEN)
            
        new_status = request.data.get('status')
        note = request.data.get('internal_note')
        
        valid_statuses = ['PENDING', 'PRESELECTED', 'ACCEPTED', 'REJECTED', 'ARCHIVED']
        if new_status and new_status.upper() not in valid_statuses:
            return Response({'error': f'Statut invalide. Utilisez: {", ".join(valid_statuses)}'}, status=status.HTTP_400_BAD_REQUEST)
            
        check = execute_query(queries['get_application_for_update'], (pk, request.user.id), fetch_one=True)
        
        if not check:
            return Response({'error': 'Candidature non trouvée ou non autorisé'}, status=status.HTTP_404_NOT_FOUND)
            
        updates = []
        params = []
        
        if new_status:
            updates.append("status = %s")
            params.append(new_status.upper())
        
        if note is not None:
            updates.append("internal_note = %s")
            params.append(note)
            
        if not updates:
            return Response({'message': 'Aucune modification'})
            
        params.append(pk)
        query = f"UPDATE applications SET {', '.join(updates)} WHERE id = %s"
        execute_query(query, tuple(params), commit=True)
        
        # Notifier l'étudiant du changement de statut
        if new_status:
            # Get offer title for notification
            app_info = execute_query(
                "SELECT o.title FROM applications a JOIN offers o ON a.offer_id = o.id WHERE a.id = %s",
                (pk,), fetch_one=True
            )
            offer_title = app_info['title'] if app_info else 'votre candidature'
            
            create_notification(
                check['student_id'], 
                "Mise à jour candidature", 
                f"Le statut de votre candidature pour '{offer_title}' a changé: {new_status.upper()}"
            )
            
            # Get student email for email notification
            student_info = execute_query(
                "SELECT u.email FROM users u WHERE u.id = %s",
                (check['student_id'],), fetch_one=True
            )
            if student_info:
                send_status_update_email(student_info['email'], offer_title, new_status.upper())
            
            log_action(request.user.id, "UPDATE_APP_STATUS", f"Candidature {pk} -> {new_status.upper()}")
        
        return Response({'message': 'Candidature mise à jour'})


class ApplicationDetailView(APIView):
    """
    Détail d'une candidature.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if request.user.role == 'STUDENT':
            app = execute_query(
                """SELECT a.*, o.title as offer_title, o.description as offer_description,
                   c.name as company_name, c.logo_path as company_logo
                   FROM applications a 
                   JOIN offers o ON a.offer_id = o.id 
                   JOIN companies c ON o.company_id = c.user_id 
                   WHERE a.id = %s AND a.student_id = %s""",
                (pk, request.user.id), fetch_one=True
            )
        elif request.user.role == 'COMPANY':
            app = execute_query(
                """SELECT a.*, o.title as offer_title, 
                   s.first_name, s.last_name, s.title as student_title, s.bio, s.skills, s.cv_path,
                   s.linkedin_url, s.github_url, u.email as student_email
                   FROM applications a 
                   JOIN offers o ON a.offer_id = o.id 
                   JOIN students s ON a.student_id = s.user_id
                   JOIN users u ON s.user_id = u.id
                   WHERE a.id = %s AND o.company_id = %s""",
                (pk, request.user.id), fetch_one=True
            )
        else:
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
            
        if not app:
            return Response({'error': 'Candidature non trouvée'}, status=status.HTTP_404_NOT_FOUND)
            
        return Response(app)


class ApplicationStatsView(APIView):
    """
    Statistiques des candidatures.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'STUDENT':
            stats = execute_query(
                """SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'PRESELECTED' THEN 1 ELSE 0 END) as preselected,
                    SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted,
                    SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
                    SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) as archived
                FROM applications WHERE student_id = %s""",
                (request.user.id,), fetch_one=True
            )
        elif request.user.role == 'COMPANY':
            stats = execute_query(
                """SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN a.status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN a.status = 'PRESELECTED' THEN 1 ELSE 0 END) as preselected,
                    SUM(CASE WHEN a.status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted,
                    SUM(CASE WHEN a.status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
                    SUM(CASE WHEN a.status = 'ARCHIVED' THEN 1 ELSE 0 END) as archived
                FROM applications a
                JOIN offers o ON a.offer_id = o.id
                WHERE o.company_id = %s""",
                (request.user.id,), fetch_one=True
            )
        else:
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
            
        return Response(stats)
