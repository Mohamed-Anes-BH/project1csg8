from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import IsAdmin
from core.db import execute_query, queries
from core.logs import get_logs, log_action
from core.notifications import create_notification
from core.utils import paginate_results


class AdminStatsView(APIView):
    """
    Statistiques globales pour l'admin.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        stats = execute_query(queries['admin_get_stats'], fetch_one=True)
        
        # Stats additionnelles
        additional = execute_query(
            """SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') as total_students,
                (SELECT COUNT(*) FROM users WHERE role = 'COMPANY') as total_companies,
                (SELECT COUNT(*) FROM users WHERE is_verified = TRUE) as verified_users,
                (SELECT COUNT(*) FROM users WHERE is_verified = FALSE) as unverified_users,
                (SELECT COUNT(*) FROM conversations) as total_conversations,
                (SELECT COUNT(*) FROM messages) as total_messages
            """, fetch_one=True
        )
        
        return Response({
            **stats,
            **additional
        })


class AdminUserListView(APIView):
    """
    Liste de tous les utilisateurs.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        page = request.query_params.get('page', 1)
        limit = request.query_params.get('limit', 20)
        role_filter = request.query_params.get('role')
        verified_filter = request.query_params.get('verified')
        search = request.query_params.get('search')
        
        query = "SELECT id, email, role, is_verified, created_at FROM users WHERE 1=1"
        params = []
        
        if role_filter:
            query += " AND role = %s"
            params.append(role_filter.upper())
        
        if verified_filter is not None:
            query += " AND is_verified = %s"
            params.append(verified_filter.lower() == 'true')
        
        if search:
            query += " AND email LIKE %s"
            params.append(f"%{search}%")
        
        query += " ORDER BY created_at DESC"
        
        users = execute_query(query, tuple(params), fetch_all=True) or []
        paginated = paginate_results(users, page, limit)
        
        return Response({
            'count': len(users),
            'page': int(page),
            'limit': int(limit),
            'results': paginated
        })


class AdminUserDetailView(APIView):
    """
    Détail d'un utilisateur.
    """
    permission_classes = [IsAdmin]

    def get(self, request, pk):
        user = execute_query(
            "SELECT id, email, role, is_verified, email_alerts, created_at FROM users WHERE id = %s",
            (pk,), fetch_one=True
        )
        
        if not user:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get profile info
        if user['role'] == 'STUDENT':
            profile = execute_query(
                "SELECT * FROM students WHERE user_id = %s",
                (pk,), fetch_one=True
            )
        elif user['role'] == 'COMPANY':
            profile = execute_query(
                "SELECT * FROM companies WHERE user_id = %s",
                (pk,), fetch_one=True
            )
        else:
            profile = None
        
        user['profile'] = profile
        return Response(user)


class AdminToggleUserView(APIView):
    """
    Activer/désactiver un utilisateur (vérification email).
    """
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        user = execute_query(queries['admin_get_user_status'], (pk,), fetch_one=True)
        if not user:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
            
        new_val = not user['is_verified']
        execute_query(queries['admin_update_user_status'], (new_val, pk), commit=True)
        
        log_action(request.user.id, "ADMIN_TOGGLE_USER", f"Utilisateur {pk} -> is_verified={new_val}")
        
        return Response({
            'message': f"Utilisateur {'activé' if new_val else 'désactivé'}",
            'is_verified': new_val
        })


class AdminSuspendUserView(APIView):
    """
    Suspendre un utilisateur (désactiver son compte).
    """
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        reason = request.data.get('reason', 'Violation des conditions d\'utilisation')
        
        # Désactiver le compte
        execute_query(
            "UPDATE users SET is_verified = FALSE WHERE id = %s",
            (pk,), commit=True
        )
        
        # Notifier l'utilisateur
        create_notification(pk, "Compte suspendu", f"Votre compte a été suspendu. Raison: {reason}")
        
        log_action(request.user.id, "ADMIN_SUSPEND_USER", f"Utilisateur {pk} suspendu. Raison: {reason}")
        
        return Response({'message': 'Utilisateur suspendu'})


class AdminOfferListView(APIView):
    """
    Liste de toutes les offres.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        page = request.query_params.get('page', 1)
        limit = request.query_params.get('limit', 20)
        status_filter = request.query_params.get('status')
        
        query = queries['admin_list_offers']
        params = []
        
        if status_filter:
            query = query.replace("WHERE o.deleted_at IS NULL", f"WHERE o.deleted_at IS NULL AND o.status = %s")
            params.append(status_filter.upper())
        
        query += " ORDER BY o.created_at DESC"
        
        offers = execute_query(query, tuple(params), fetch_all=True) or []
        paginated = paginate_results(offers, page, limit)
        
        return Response({
            'count': len(offers),
            'page': int(page),
            'limit': int(limit),
            'results': paginated
        })


class AdminOfferDetailView(APIView):
    """
    Détail d'une offre (admin).
    """
    permission_classes = [IsAdmin]

    def get(self, request, pk):
        offer = execute_query(queries['get_offer_detail'], (pk,), fetch_one=True)
        if not offer:
            return Response({'error': 'Offre non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        
        # Stats de l'offre
        stats = execute_query(
            "SELECT COUNT(*) as applications_count FROM applications WHERE offer_id = %s",
            (pk,), fetch_one=True
        )
        offer['applications_count'] = stats['applications_count'] if stats else 0
        
        return Response(offer)


class AdminDeleteOfferView(APIView):
    """
    Supprimer une offre (modération).
    """
    permission_classes = [IsAdmin]

    def delete(self, request, pk):
        reason = request.data.get('reason', 'Contenu inapproprié')
        
        # Get offre info for notification
        offer = execute_query("SELECT company_id, title FROM offers WHERE id = %s", (pk,), fetch_one=True)
        
        execute_query(queries['delete_offer_logical'], (pk,), commit=True)
        
        # Notifier l'entreprise
        if offer:
            create_notification(
                offer['company_id'], 
                "Offre supprimée", 
                f"Votre offre '{offer['title']}' a été supprimée par un administrateur. Raison: {reason}"
            )
        
        log_action(request.user.id, "ADMIN_DELETE_OFFER", f"Offre {pk} supprimée. Raison: {reason}")
        
        return Response({'message': 'Offre supprimée par admin'})


class AdminLogsView(APIView):
    """
    Logs métier.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        page = request.query_params.get('page', 1)
        limit = request.query_params.get('limit', 50)
        
        logs = get_logs(limit=500)
        paginated = paginate_results(logs or [], page, limit)
        
        return Response({
            'count': len(logs or []),
            'page': int(page),
            'limit': int(limit),
            'results': paginated
        })


class AdminSendNotificationView(APIView):
    """
    Envoyer une notification à un utilisateur ou à tous.
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        user_id = request.data.get('user_id')  # None pour tous
        title = request.data.get('title')
        message = request.data.get('message')
        role_filter = request.data.get('role')  # Optionnel: STUDENT, COMPANY
        
        if not title or not message:
            return Response({'error': 'title et message requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user_id:
            # Un seul utilisateur
            create_notification(user_id, title, message)
            count = 1
        else:
            # Tous les utilisateurs (ou filtrés par rôle)
            query = "SELECT id FROM users WHERE is_verified = TRUE"
            params = []
            
            if role_filter:
                query += " AND role = %s"
                params.append(role_filter.upper())
            
            users = execute_query(query, tuple(params), fetch_all=True) or []
            
            for user in users:
                create_notification(user['id'], title, message)
            
            count = len(users)
        
        log_action(request.user.id, "ADMIN_SEND_NOTIFICATION", f"Notification envoyée à {count} utilisateur(s)")
        
        return Response({
            'message': f'Notification envoyée à {count} utilisateur(s)',
            'count': count
        })


class AdminIncompleteProfilesView(APIView):
    """
    Liste des profils incomplets (pour rappels).
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        students = execute_query(queries['get_incomplete_student_profiles'], fetch_all=True) or []
        companies = execute_query(queries['get_incomplete_company_profiles'], fetch_all=True) or []
        
        return Response({
            'incomplete_students': len(students),
            'incomplete_companies': len(companies),
            'students': students,
            'companies': companies
        })
