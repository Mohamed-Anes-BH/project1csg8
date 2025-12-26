from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.db import execute_query, queries
from core.utils import paginate_results


class NotificationListView(APIView):
    """
    Liste des notifications de l'utilisateur.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        page = request.query_params.get('page', 1)
        limit = request.query_params.get('limit', 20)
        unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
        
        if unread_only:
            notifs = execute_query(
                "SELECT * FROM notifications WHERE user_id = %s AND is_read = FALSE ORDER BY created_at DESC",
                (request.user.id,), fetch_all=True
            )
        else:
            notifs = execute_query(queries['list_notifications'], (request.user.id,), fetch_all=True)
        
        notifs = notifs or []
        paginated = paginate_results(notifs, page, limit)
        
        return Response({
            'count': len(notifs),
            'page': int(page),
            'limit': int(limit),
            'results': paginated
        })


class MarkReadView(APIView):
    """
    Marquer une notification comme lue, ou toutes les notifications.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk=None):
        if pk:
            # Marquer une seule notification
            execute_query(queries['mark_notification_read'], (pk, request.user.id), commit=True)
            return Response({'message': 'Notification marquée comme lue'})
        else:
            # Marquer toutes les notifications
            execute_query(queries['mark_all_notifications_read'], (request.user.id,), commit=True)
            return Response({'message': 'Toutes les notifications marquées comme lues'})


class DeleteNotificationView(APIView):
    """
    Supprimer une notification ou toutes les notifications lues.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk=None):
        if pk:
            # Supprimer une seule notification
            execute_query(
                "DELETE FROM notifications WHERE id = %s AND user_id = %s",
                (pk, request.user.id), commit=True
            )
            return Response({'message': 'Notification supprimée'})
        else:
            # Supprimer toutes les notifications lues
            execute_query(
                "DELETE FROM notifications WHERE user_id = %s AND is_read = TRUE",
                (request.user.id,), commit=True
            )
            return Response({'message': 'Notifications lues supprimées'})


class NotificationStatsView(APIView):
    """
    Statistiques des notifications (compteur non lues).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = execute_query(
            queries['get_unread_notifications_count'], 
            (request.user.id,), 
            fetch_one=True
        )
        
        # Get recent notifications for badge
        recent = execute_query(
            "SELECT id, title, message, created_at FROM notifications WHERE user_id = %s AND is_read = FALSE ORDER BY created_at DESC LIMIT 5",
            (request.user.id,), fetch_all=True
        )
        
        return Response({
            'unread_count': count['count'] if count else 0,
            'recent_unread': recent or []
        })


class NotificationPreferencesView(APIView):
    """
    Préférences de notification.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prefs = execute_query(queries['get_email_alerts_status'], (request.user.id,), fetch_one=True)
        return Response({
            'email_alerts': prefs['email_alerts'] if prefs else True
        })

    def patch(self, request):
        email_alerts = request.data.get('email_alerts')
        if email_alerts is None:
            return Response({'error': 'email_alerts requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        execute_query(queries['update_email_alerts_status'], (email_alerts, request.user.id), commit=True)
        return Response({
            'message': 'Préférences mises à jour',
            'email_alerts': email_alerts
        })
