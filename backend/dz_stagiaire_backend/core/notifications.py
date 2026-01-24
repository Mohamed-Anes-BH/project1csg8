from core.db import execute_query, queries
from core.email import send_notification_email

def create_notification(user_id, type, content):
    """
    Creates a notification for a user and sends an email if enabled.
    """
    # Create DB notification
    execute_query(queries['create_notification'], (user_id, type, content), commit=True)
    
    # Check if user wants email alerts
    user = execute_query(queries['get_user_email_and_alerts'], (user_id,), fetch_one=True)
    if user and user['email_alerts']:
        import threading
        email_thread = threading.Thread(
            target=send_notification_email,
            args=(user['email'], f"DZ-Stagiaire : {type}", content)
        )
        email_thread.start()


def get_user_notifications(user_id):
    """
    Fetches all notifications for a user.
    """
    return execute_query(queries['list_notifications'], (user_id,), fetch_all=True)

def mark_notification_as_read(notification_id):
    """
    Marks a notification as read.
    """
    # Note: This helper doesn't have user_id context, so it uses a simpler query if available 
    # or we can just use the one from views if we pass user_id.
    # For now let's keep it simple or add a specific query.
    query = "UPDATE notifications SET is_read = TRUE WHERE id = %s"
    execute_query(query, (notification_id,), commit=True)

