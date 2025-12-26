import datetime

def paginate_results(data, page=1, limit=10):
    """
    Paginates a list of data.
    """
    try:
        page = int(page)
        limit = int(limit)
    except ValueError:
        page = 1
        limit = 10
        
    start = (page - 1) * limit
    end = start + limit
    return data[start:end]

def format_response(data, message="Success"):
    """
    Standardizes API response format.
    """
    return {
        "status": "success",
        "message": message,
        "data": data
    }

def get_current_timestamp():
    """
    Returns current UTC timestamp.
    """
    return datetime.datetime.utcnow()
