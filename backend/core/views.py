from django.http import JsonResponse
from .db_utils import execute_query

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
