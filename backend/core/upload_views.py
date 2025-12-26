import os
import uuid
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

@csrf_exempt
def upload_file(request):
    """
    Endpoint pour uploader des fichiers (CVs, Logos).
    Attends:
    - file: Le fichier binaire
    - type: 'cv' ou 'logo'
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        # 1. Vérifier si un fichier est présent
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file provided'}, status=400)
            
        uploaded_file = request.FILES['file']
        upload_type = request.POST.get('type')
        
        # 2. Validation du type d'upload
        if upload_type not in ['cv', 'logo']:
            return JsonResponse({'error': 'Invalid upload type. Must be "cv" or "logo"'}, status=400)
            
        # 3. Validation de la taille (Max 5MB)
        if uploaded_file.size > 5 * 1024 * 1024:
            return JsonResponse({'error': 'File too large. Max size is 5MB'}, status=400)
            
        # 4. Validation de l'extension
        file_extension = os.path.splitext(uploaded_file.name)[1].lower()
        
        if upload_type == 'cv':
            if file_extension not in ['.pdf', '.doc', '.docx']:
                return JsonResponse({'error': 'Invalid file format for CV. Allowed: .pdf, .doc, .docx'}, status=400)
            upload_dir = 'cvs'
            
        elif upload_type == 'logo':
            if file_extension not in ['.png', '.jpg', '.jpeg', '.gif']:
                return JsonResponse({'error': 'Invalid file format for Logo. Allowed: .png, .jpg, .jpeg'}, status=400)
            upload_dir = 'logos'
            
        # 5. Sauvegarde avec un nom unique
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Sauvegarder le fichier
        saved_path = default_storage.save(file_path, ContentFile(uploaded_file.read()))
        
        # 6. Retourner l'URL publique
        file_url = settings.MEDIA_URL + saved_path
        
        return JsonResponse({
            'success': True,
            'url': file_url,
            'message': 'File uploaded successfully'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
