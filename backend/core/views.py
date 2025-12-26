from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .db_utils import execute_query, execute_query_one, execute_update

def get_universities(request):
    """Récupère la liste des universités"""
    try:
        universities = execute_query("SELECT id, name, city FROM universities ORDER BY name")
        return JsonResponse({'universities': universities})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_domains(request):
    """Récupère la liste des domaines"""
    try:
        domains = execute_query("SELECT id, name FROM domains ORDER BY name")
        return JsonResponse({'domains': domains})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_specialties(request, domain_id):
    """Récupère les spécialités d'un domaine"""
    try:
        specialties = execute_query(
            "SELECT id, name FROM specialties WHERE domain_id = %s ORDER BY name",
            [domain_id]
        )
        return JsonResponse({'specialties': specialties})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# ============================================
# NOTIFICATIONS
# ============================================

def create_notification(user_id, message, notification_type='APPLICATION_STATUS'):
    """Helper function to create a notification"""
    try:
        execute_update(
            """
            INSERT INTO notifications (user_id, message, notification_type)
            VALUES (%s, %s, %s)
            """,
            [user_id, message, notification_type]
        )
        return True
    except Exception as e:
        print(f"Error creating notification: {e}")
        return False

def get_notifications(request):
    """Récupère les notifications d'un utilisateur"""
    try:
        # Sécurité: Utiliser l'ID du token
        if not hasattr(request, 'user_id'):
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        user_id = request.user_id
        
        # Récupérer toutes les notifications (non lues en premier)
        notifications = execute_query(
            """
            SELECT id, message, notification_type, is_read, created_at
            FROM notifications
            WHERE user_id = %s
            ORDER BY is_read ASC, created_at DESC
            """,
            [user_id]
        )
        
        # Compter les non lues
        unread_count = sum(1 for n in notifications if not n['is_read'])
        
        return JsonResponse({
            'notifications': notifications,
            'unread_count': unread_count
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def mark_notification_read(request, notification_id):
    """Marquer une notification comme lue"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        if not hasattr(request, 'user_id'):
            return JsonResponse({'error': 'Unauthorized'}, status=401)
            
        # Vérifier que la notif appartient à l'utilisateur
        notif = execute_query_one("SELECT id FROM notifications WHERE id = %s AND user_id = %s", [notification_id, request.user_id])
        if not notif:
            return JsonResponse({'error': 'Notification not found or permission denied'}, status=404)

        execute_update(
            "UPDATE notifications SET is_read = TRUE WHERE id = %s",
            [notification_id]
        )
        return JsonResponse({'success': True, 'message': 'Notification marked as read'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def mark_all_notifications_read(request):
    """Marquer toutes les notifications comme lues"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        if not hasattr(request, 'user_id'):
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        
        execute_update(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = %s AND is_read = FALSE",
            [request.user_id]
        )
        return JsonResponse({'success': True, 'message': 'All notifications marked as read'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
