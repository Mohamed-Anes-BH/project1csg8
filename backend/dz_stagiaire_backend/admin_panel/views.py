from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import IsAdmin
from core.db import execute_query, queries
from core.logs import get_logs, log_action
from core.notifications import create_notification
from core.utils import paginate_results
from core.security import hash_password
import json


class AdminDashboardStatsView(APIView):
    """
    Statistiques complètes pour le dashboard admin.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        # Stats principales
        stats = execute_query(
            """SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') as total_students,
                (SELECT COUNT(*) FROM users WHERE role = 'COMPANY') as total_companies,
                (SELECT COUNT(*) FROM offers WHERE deleted_at IS NULL AND status = 'OPEN') as active_offers,
                (SELECT COUNT(*) FROM applications WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as new_applications_24h,
                (SELECT COUNT(*) FROM users WHERE is_verified = FALSE) as pending_verifications,
                (SELECT COUNT(*) FROM applications) as total_applications
            """, fetch_one=True
        )
        
        # Calculer les pourcentages de croissance (dernier mois vs mois précédent)
        growth = execute_query(
            """SELECT 
                (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_users_month,
                (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                    AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)) as prev_users_month,
                (SELECT COUNT(*) FROM offers WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND deleted_at IS NULL) as new_offers_month,
                (SELECT COUNT(*) FROM applications WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_apps_month
            """, fetch_one=True
        )
        
        return Response({
            **stats,
            'growth': growth
        })


class AdminGrowthStatsView(APIView):
    """
    Statistiques de croissance pour le graphique (6 derniers mois).
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        months = request.query_params.get('months', 6)
        
        user_growth = execute_query(
            """SELECT 
                YEAR(created_at) as year,
                MONTH(created_at) as month,
                COUNT(*) as count
            FROM users
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL %s MONTH)
            GROUP BY YEAR(created_at), MONTH(created_at)
            ORDER BY year, month""",
            (int(months),), fetch_all=True
        ) or []
        
        offer_growth = execute_query(
            """SELECT 
                YEAR(created_at) as year,
                MONTH(created_at) as month,
                COUNT(*) as count
            FROM offers
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL %s MONTH) AND deleted_at IS NULL
            GROUP BY YEAR(created_at), MONTH(created_at)
            ORDER BY year, month""",
            (int(months),), fetch_all=True
        ) or []
        
        application_growth = execute_query(
            """SELECT 
                YEAR(created_at) as year,
                MONTH(created_at) as month,
                COUNT(*) as count
            FROM applications
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL %s MONTH)
            GROUP BY YEAR(created_at), MONTH(created_at)
            ORDER BY year, month""",
            (int(months),), fetch_all=True
        ) or []
        
        return Response({
            'users': user_growth,
            'offers': offer_growth,
            'applications': application_growth
        })


class AdminRecentActivityView(APIView):
    """
    Activité récente pour le dashboard.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        limit = request.query_params.get('limit', 10)
        
        # Récupérer les activités récentes (nouveaux utilisateurs, offres, candidatures)
        activities = []
        
        # Nouveaux utilisateurs
        new_users = execute_query(
            """SELECT u.id, u.email, u.role, u.created_at,
                CASE 
                    WHEN u.role = 'STUDENT' THEN CONCAT(s.first_name, ' ', s.last_name)
                    WHEN u.role = 'COMPANY' THEN c.name
                    ELSE u.email
                END as name
            FROM users u
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN companies c ON u.id = c.user_id
            ORDER BY u.created_at DESC LIMIT 5""",
            fetch_all=True
        ) or []
        
        for user in new_users:
            activities.append({
                'type': 'NEW_USER',
                'icon': 'user-plus',
                'title': f"Nouveau {'étudiant' if user['role'] == 'STUDENT' else 'entreprise'}",
                'description': f"{user.get('name', user['email'])} vient de s'inscrire.",
                'created_at': user['created_at']
            })
        
        # Nouvelles offres
        new_offers = execute_query(
            """SELECT o.id, o.title, o.created_at, c.name as company_name
            FROM offers o
            JOIN companies c ON o.company_id = c.user_id
            WHERE o.deleted_at IS NULL
            ORDER BY o.created_at DESC LIMIT 5""",
            fetch_all=True
        ) or []
        
        for offer in new_offers:
            activities.append({
                'type': 'NEW_OFFER',
                'icon': 'briefcase',
                'title': 'Nouvelle Offre',
                'description': f"{offer['company_name']} a publié : '{offer['title']}'",
                'created_at': offer['created_at']
            })
        
        # Entreprises vérifiées récemment
        verified_companies = execute_query(
            """SELECT c.user_id, c.name, u.created_at
            FROM companies c
            JOIN users u ON c.user_id = u.id
            WHERE u.is_verified = TRUE
            ORDER BY u.created_at DESC LIMIT 3""",
            fetch_all=True
        ) or []
        
        for company in verified_companies:
            activities.append({
                'type': 'COMPANY_VERIFIED',
                'icon': 'check-circle',
                'title': 'Entreprise Vérifiée',
                'description': f"{company['name']} a été approuvée.",
                'created_at': company['created_at']
            })
        
        # Trier par date et limiter
        activities.sort(key=lambda x: x['created_at'], reverse=True)
        activities = activities[:int(limit)]
        
        return Response(activities)


class AdminRecentApplicationsView(APIView):
    """
    Dernières candidatures pour le dashboard.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        limit = request.query_params.get('limit', 10)
        
        applications = execute_query(
            """SELECT a.id, a.status, a.created_at,
                s.first_name, s.last_name,
                o.title as offer_title, o.type as offer_type,
                c.name as company_name
            FROM applications a
            JOIN students s ON a.student_id = s.user_id
            JOIN offers o ON a.offer_id = o.id
            JOIN companies c ON o.company_id = c.user_id
            ORDER BY a.created_at DESC
            LIMIT %s""",
            (int(limit),), fetch_all=True
        ) or []
        
        return Response(applications)


class AdminStatsView(APIView):
    """
    Statistiques globales pour l'admin (legacy).
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        stats = execute_query(queries['admin_get_stats'], fetch_one=True)
        
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
    Liste de tous les utilisateurs avec profils.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        page = request.query_params.get('page', 1)
        limit = request.query_params.get('limit', 20)
        role_filter = request.query_params.get('role')
        verified_filter = request.query_params.get('verified')
        search = request.query_params.get('search')
        
        query = """SELECT u.id, u.email, u.role, u.is_verified, u.created_at,
            CASE 
                WHEN u.role = 'STUDENT' THEN s.first_name
                WHEN u.role = 'COMPANY' THEN c.name
                ELSE NULL
            END as name,
            CASE 
                WHEN u.role = 'STUDENT' THEN s.last_name
                ELSE NULL
            END as last_name,
            CASE 
                WHEN u.role = 'STUDENT' THEN s.avatar_path
                WHEN u.role = 'COMPANY' THEN c.logo_path
                ELSE NULL
            END as avatar
        FROM users u
        LEFT JOIN students s ON u.id = s.user_id AND u.role = 'STUDENT'
        LEFT JOIN companies c ON u.id = c.user_id AND u.role = 'COMPANY'
        WHERE 1=1"""
        params = []
        
        if role_filter:
            query += " AND u.role = %s"
            params.append(role_filter.upper())
        
        if verified_filter is not None:
            if verified_filter.lower() == 'true':
                query += " AND u.is_verified = TRUE"
            elif verified_filter.lower() == 'false':
                query += " AND u.is_verified = FALSE"
            elif verified_filter.lower() == 'suspended':
                query += " AND u.is_verified = FALSE"
        
        if search:
            query += " AND (u.email LIKE %s OR s.first_name LIKE %s OR s.last_name LIKE %s OR c.name LIKE %s)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param, search_param])
        
        query += " ORDER BY u.created_at DESC"
        
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


class AdminCreateUserView(APIView):
    """
    Créer un nouvel utilisateur (admin).
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'STUDENT')
        name = request.data.get('name')
        
        if not email or not password:
            return Response({'error': 'Email et mot de passe requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier si email existe déjà
        existing = execute_query("SELECT id FROM users WHERE email = %s", (email,), fetch_one=True)
        if existing:
            return Response({'error': 'Email déjà utilisé'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Hash password
        password_hash = hash_password(password)
        
        # Créer utilisateur
        execute_query(
            "INSERT INTO users (email, password_hash, role, is_verified, created_at) VALUES (%s, %s, %s, TRUE, NOW())",
            (email, password_hash, role.upper()), commit=True
        )
        
        # Récupérer l'ID
        new_user = execute_query("SELECT id FROM users WHERE email = %s", (email,), fetch_one=True)
        
        # Créer le profil
        if role.upper() == 'STUDENT':
            first_name = name.split()[0] if name else ''
            last_name = ' '.join(name.split()[1:]) if name and len(name.split()) > 1 else ''
            execute_query(
                "INSERT INTO students (user_id, first_name, last_name) VALUES (%s, %s, %s)",
                (new_user['id'], first_name, last_name), commit=True
            )
        elif role.upper() == 'COMPANY':
            execute_query(
                "INSERT INTO companies (user_id, name) VALUES (%s, %s)",
                (new_user['id'], name or 'Nouvelle Entreprise'), commit=True
            )
        
        log_action(request.user.id, "ADMIN_CREATE_USER", f"Utilisateur créé: {email}")
        
        return Response({'message': 'Utilisateur créé', 'id': new_user['id']}, status=status.HTTP_201_CREATED)


class AdminToggleUserView(APIView):
    """
    Activer/désactiver un utilisateur.
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
    Suspendre un utilisateur.
    """
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        reason = request.data.get('reason', 'Violation des conditions d\'utilisation')
        
        execute_query(
            "UPDATE users SET is_verified = FALSE WHERE id = %s",
            (pk,), commit=True
        )
        
        create_notification(pk, "Compte suspendu", f"Votre compte a été suspendu. Raison: {reason}")
        
        log_action(request.user.id, "ADMIN_SUSPEND_USER", f"Utilisateur {pk} suspendu. Raison: {reason}")
        
        return Response({'message': 'Utilisateur suspendu'})


class AdminRestoreUserView(APIView):
    """
    Réactiver un utilisateur suspendu.
    """
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        execute_query(
            "UPDATE users SET is_verified = TRUE WHERE id = %s",
            (pk,), commit=True
        )
        
        create_notification(pk, "Compte réactivé", "Votre compte a été réactivé. Bienvenue de retour !")
        
        log_action(request.user.id, "ADMIN_RESTORE_USER", f"Utilisateur {pk} réactivé")
        
        return Response({'message': 'Utilisateur réactivé'})


class AdminOfferListView(APIView):
    """
    Liste des offres pour modération.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        page = request.query_params.get('page', 1)
        limit = request.query_params.get('limit', 20)
        status_filter = request.query_params.get('status')
        approval_filter = request.query_params.get('approved')
        search = request.query_params.get('search')
        
        query = """SELECT o.*, c.name as company_name, c.logo_path as company_logo,
            (SELECT COUNT(*) FROM applications WHERE offer_id = o.id) as applications_count
        FROM offers o
        JOIN companies c ON o.company_id = c.user_id
        WHERE o.deleted_at IS NULL"""
        params = []
        
        if status_filter:
            query += " AND o.status = %s"
            params.append(status_filter.upper())
        
        if approval_filter is not None:
            if approval_filter.lower() == 'pending':
                query += " AND (o.is_approved = FALSE OR o.is_approved IS NULL)"
            elif approval_filter.lower() == 'approved':
                query += " AND o.is_approved = TRUE"
        
        if search:
            query += " AND (o.title LIKE %s OR c.name LIKE %s)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param])
        
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
    Détail d'une offre.
    """
    permission_classes = [IsAdmin]

    def get(self, request, pk):
        offer = execute_query(queries['get_offer_detail'], (pk,), fetch_one=True)
        if not offer:
            return Response({'error': 'Offre non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        
        stats = execute_query(
            "SELECT COUNT(*) as applications_count FROM applications WHERE offer_id = %s",
            (pk,), fetch_one=True
        )
        offer['applications_count'] = stats['applications_count'] if stats else 0
        
        return Response(offer)


class AdminApproveOfferView(APIView):
    """
    Approuver une offre.
    """
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        execute_query(
            "UPDATE offers SET is_approved = TRUE, status = 'OPEN' WHERE id = %s",
            (pk,), commit=True
        )
        
        # Notifier l'entreprise
        offer = execute_query("SELECT company_id, title FROM offers WHERE id = %s", (pk,), fetch_one=True)
        if offer:
            create_notification(
                offer['company_id'],
                "Offre approuvée",
                f"Votre offre '{offer['title']}' a été approuvée et est maintenant visible."
            )
        
        log_action(request.user.id, "ADMIN_APPROVE_OFFER", f"Offre {pk} approuvée")
        
        return Response({'message': 'Offre approuvée'})


class AdminRejectOfferView(APIView):
    """
    Rejeter une offre.
    """
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        reason = request.data.get('reason', 'Non conforme aux règles de la plateforme')
        
        execute_query(
            "UPDATE offers SET status = 'ARCHIVED', deleted_at = NOW() WHERE id = %s",
            (pk,), commit=True
        )
        
        # Notifier l'entreprise
        offer = execute_query("SELECT company_id, title FROM offers WHERE id = %s", (pk,), fetch_one=True)
        if offer:
            create_notification(
                offer['company_id'],
                "Offre rejetée",
                f"Votre offre '{offer['title']}' a été rejetée. Raison: {reason}"
            )
        
        log_action(request.user.id, "ADMIN_REJECT_OFFER", f"Offre {pk} rejetée. Raison: {reason}")
        
        return Response({'message': 'Offre rejetée'})


class AdminDeleteOfferView(APIView):
    """
    Supprimer une offre.
    """
    permission_classes = [IsAdmin]

    def delete(self, request, pk):
        reason = request.data.get('reason', 'Contenu inapproprié')
        
        offer = execute_query("SELECT company_id, title FROM offers WHERE id = %s", (pk,), fetch_one=True)
        
        execute_query(queries['delete_offer_logical'], (pk,), commit=True)
        
        if offer:
            create_notification(
                offer['company_id'],
                "Offre supprimée",
                f"Votre offre '{offer['title']}' a été supprimée par un administrateur. Raison: {reason}"
            )
        
        log_action(request.user.id, "ADMIN_DELETE_OFFER", f"Offre {pk} supprimée. Raison: {reason}")
        
        return Response({'message': 'Offre supprimée par admin'})


class AdminBulkApproveOffersView(APIView):
    """
    Approuver plusieurs offres en une fois.
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        offer_ids = request.data.get('offer_ids', [])
        
        if not offer_ids:
            return Response({'error': 'Aucune offre sélectionnée'}, status=status.HTTP_400_BAD_REQUEST)
        
        for offer_id in offer_ids:
            execute_query(
                "UPDATE offers SET is_approved = TRUE, status = 'OPEN' WHERE id = %s",
                (offer_id,), commit=True
            )
            
            offer = execute_query("SELECT company_id, title FROM offers WHERE id = %s", (offer_id,), fetch_one=True)
            if offer:
                create_notification(
                    offer['company_id'],
                    "Offre approuvée",
                    f"Votre offre '{offer['title']}' a été approuvée."
                )
        
        log_action(request.user.id, "ADMIN_BULK_APPROVE", f"{len(offer_ids)} offres approuvées")
        
        return Response({'message': f'{len(offer_ids)} offres approuvées'})


class AdminSettingsView(APIView):
    """
    Paramètres système.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        category = request.query_params.get('category')
        
        query = "SELECT * FROM admin_settings"
        params = []
        
        if category:
            query += " WHERE category = %s"
            params.append(category.upper())
        
        query += " ORDER BY category, setting_key"
        
        settings = execute_query(query, tuple(params), fetch_all=True) or []
        
        # Grouper par catégorie
        grouped = {}
        for setting in settings:
            cat = setting['category']
            if cat not in grouped:
                grouped[cat] = []
            grouped[cat].append(setting)
        
        return Response({
            'settings': settings,
            'grouped': grouped
        })

    def patch(self, request):
        settings_to_update = request.data.get('settings', {})
        
        for key, value in settings_to_update.items():
            execute_query(
                "UPDATE admin_settings SET setting_value = %s, updated_by = %s, updated_at = NOW() WHERE setting_key = %s",
                (str(value), request.user.id, key), commit=True
            )
        
        log_action(request.user.id, "ADMIN_UPDATE_SETTINGS", f"Paramètres mis à jour: {list(settings_to_update.keys())}")
        
        return Response({'message': 'Paramètres mis à jour'})


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
    Envoyer une notification.
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        user_id = request.data.get('user_id')
        title = request.data.get('title')
        message = request.data.get('message')
        role_filter = request.data.get('role')
        
        if not title or not message:
            return Response({'error': 'title et message requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user_id:
            create_notification(user_id, title, message)
            count = 1
        else:
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
    Profils incomplets.
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


class AdminOfferStatsView(APIView):
    """
    Statistiques des offres pour modération.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        stats = execute_query(
            """SELECT 
                (SELECT COUNT(*) FROM offers WHERE deleted_at IS NULL AND (is_approved = FALSE OR is_approved IS NULL) AND status = 'OPEN') as pending_count,
                (SELECT COUNT(*) FROM offers WHERE deleted_at IS NULL AND is_approved = TRUE AND status = 'OPEN') as approved_count,
                (SELECT COUNT(*) FROM offers WHERE deleted_at IS NULL AND status = 'ARCHIVED') as archived_count,
                (SELECT COUNT(*) FROM offers WHERE deleted_at IS NULL AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_this_month
            """, fetch_one=True
        )
        
        return Response(stats)
