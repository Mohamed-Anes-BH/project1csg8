from core.db import execute_query, queries

def log_action(user_id, action, details=None):
    """
    Logs a business action.
    """
    execute_query(queries['log_business_action'], (user_id, action, details), commit=True)

def get_logs(limit=100):
    """
    Fetches recent business logs.
    """
    return execute_query(queries['get_business_logs'], (limit,), fetch_all=True)

