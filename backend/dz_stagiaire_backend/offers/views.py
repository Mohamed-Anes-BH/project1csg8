from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from core.db import execute_query, queries
from core.excel import parse_excel_file, insert_offers_from_excel, validate_excel_columns
from core.utils import paginate_results
from core.logs import log_action
from core.notifications import create_notification


class OfferListView(APIView):
    """
    Liste et recherche des offres (public) + création d'offres (entreprise).
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        """Recherche et filtrage des offres."""
        search = request.query_params.get('search')
        type_filter = request.query_params.get('type')
        location_filter = request.query_params.get('location')
        duration_filter = request.query_params.get('duration')
        sort = request.query_params.get('sort', 'recent')
        page = request.query_params.get('page', 1)
        limit = request.query_params.get('limit', 10)
        
        query = queries['list_offers_base']
        params = []
        
        if search:
            query += " AND (o.title LIKE %s OR o.description LIKE %s OR o.skills LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
            
        if type_filter:
            query += " AND o.type = %s"
            params.append(type_filter.upper())
            
        if location_filter:
            query += " AND o.location LIKE %s"
            params.append(f"%{location_filter}%")

        if duration_filter:
            query += " AND o.duration LIKE %s"
            params.append(f"%{duration_filter}%")
            
        if sort == 'popular':
            query += " ORDER BY o.views DESC"
        else:
            query += " ORDER BY o.created_at DESC"
        
        offers = execute_query(query, tuple(params), fetch_all=True) or []
        
        # Pagination
        paginated_offers = paginate_results(offers, page, limit)
        
        return Response({
            'count': len(offers),
            'page': int(page),
            'limit': int(limit),
            'results': paginated_offers
        })

    def post(self, request):
        """Créer une nouvelle offre."""
        if request.user.role != 'COMPANY':
            return Response({'error': 'Seules les entreprises peuvent créer des offres'}, status=status.HTTP_403_FORBIDDEN)
            
        data = request.data
        title = data.get('title')
        description = data.get('description')
        type_ = data.get('type')
        
        if not title or not description or not type_:
            return Response({'error': 'Champs obligatoires manquants'}, status=status.HTTP_400_BAD_REQUEST)

        if type_.upper() not in ['STAGE', 'PFE']:
            return Response({'error': 'Type invalide. Utilisez STAGE ou PFE'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Par défaut, créer en mode brouillon
        is_draft = data.get('is_draft', True)
        status_value = 'DRAFT' if is_draft else 'OPEN'
        
        params = (
            request.user.id, title, description, type_.upper(), 
            data.get('duration'), data.get('location'), data.get('skills')
        )
        
        if is_draft:
            offer_id = execute_query(queries['create_offer_draft'], params, commit=True)
        else:
            offer_id = execute_query(queries['create_offer'], params, commit=True)
        
        log_action(request.user.id, "CREATE_OFFER", f"Offre créée: {offer_id} - {title}")
        
        return Response({
            'message': 'Offre créée' + (' (brouillon)' if is_draft else ''),
            'id': offer_id,
            'status': status_value
        }, status=status.HTTP_201_CREATED)


class OfferDetailView(APIView):
    """
    Détail d'une offre (GET public, PUT entreprise propriétaire).
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        """Voir le détail d'une offre."""
        # Incrémenter les vues
        execute_query(queries['increment_offer_views'], (pk,), commit=True)
        
        offer = execute_query(queries['get_offer_detail'], (pk,), fetch_one=True)
        if not offer:
            return Response({'error': 'Offre non trouvée'}, status=status.HTTP_404_NOT_FOUND)
            
        return Response(offer)

    def put(self, request, pk):
        """Modifier une offre."""
        if not request.user.is_authenticated or request.user.role != 'COMPANY':
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
            
        check = execute_query(queries['check_offer_ownership'], (pk, request.user.id), fetch_one=True)
        if not check:
            return Response({'error': 'Offre non trouvée ou non autorisé'}, status=status.HTTP_404_NOT_FOUND)
            
        data = request.data
        fields = ['title', 'description', 'type', 'duration', 'location', 'skills', 'status']
        updates = []
        params = []
        
        for field in fields:
            if field in data:
                value = data[field]
                if field == 'type' and value:
                    value = value.upper()
                if field == 'status' and value:
                    value = value.upper()
                    if value not in ['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED']:
                        return Response({'error': 'Statut invalide'}, status=status.HTTP_400_BAD_REQUEST)
                updates.append(f"{field} = %s")
                params.append(value)
                
        if not updates:
            return Response({'message': 'Aucune modification'})
            
        params.append(pk)
        query = f"UPDATE offers SET {', '.join(updates)} WHERE id = %s"
        execute_query(query, tuple(params), commit=True)
        log_action(request.user.id, "UPDATE_OFFER", f"Offre modifiée: {pk}")
        
        return Response({'message': 'Offre mise à jour'})


class PublishOfferView(APIView):
    """
    Publier une offre (passer de brouillon à publié).
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
            
        result = execute_query(queries['publish_offer'], (pk, request.user.id), commit=True)
        
        if result == 0:
            return Response({'error': 'Offre non trouvée ou déjà publiée'}, status=status.HTTP_400_BAD_REQUEST)
        
        log_action(request.user.id, "PUBLISH_OFFER", f"Offre publiée: {pk}")
        
        return Response({'message': 'Offre publiée', 'status': 'OPEN'})


class ArchiveOfferView(APIView):
    """
    Archiver une offre.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
            
        check = execute_query(queries['check_offer_ownership'], (pk, request.user.id), fetch_one=True)
        if not check:
            return Response({'error': 'Offre non trouvée ou non autorisé'}, status=status.HTTP_404_NOT_FOUND)
            
        execute_query(queries['archive_offer'], (pk,), commit=True)
        log_action(request.user.id, "ARCHIVE_OFFER", f"Offre archivée: {pk}")
        
        return Response({'message': 'Offre archivée', 'status': 'ARCHIVED'})


class CloseOfferView(APIView):
    """
    Clôturer une offre (désactiver les candidatures).
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
            
        check = execute_query(queries['check_offer_ownership'], (pk, request.user.id), fetch_one=True)
        if not check:
            return Response({'error': 'Offre non trouvée ou non autorisé'}, status=status.HTTP_404_NOT_FOUND)
        
        query = "UPDATE offers SET status = 'CLOSED' WHERE id = %s"
        execute_query(query, (pk,), commit=True)
        log_action(request.user.id, "CLOSE_OFFER", f"Offre clôturée: {pk}")
        
        return Response({'message': 'Offre clôturée', 'status': 'CLOSED'})


class DeleteOfferView(APIView):
    """
    Supprimer une offre (suppression logique).
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
            
        check = execute_query(queries['check_offer_ownership'], (pk, request.user.id), fetch_one=True)
        if not check:
            return Response({'error': 'Offre non trouvée ou non autorisé'}, status=status.HTTP_404_NOT_FOUND)
            
        execute_query(queries['delete_offer_logical'], (pk,), commit=True)
        log_action(request.user.id, "DELETE_OFFER", f"Offre supprimée: {pk}")
        
        return Response({'message': 'Offre supprimée'})


class ImportOffersView(APIView):
    """
    Importer des offres depuis un fichier Excel.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Accès réservé aux entreprises'}, status=status.HTTP_403_FORBIDDEN)
            
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Aucun fichier fourni'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file extension
        if not file.name.lower().endswith('.xlsx'):
            return Response({'error': 'Seuls les fichiers Excel (.xlsx) sont acceptés'}, status=status.HTTP_400_BAD_REQUEST)
            
        offers = parse_excel_file(file)
        if offers is None:
            return Response({'error': 'Erreur lors de la lecture du fichier'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(offers) == 0:
            return Response({'error': 'Aucune offre trouvée dans le fichier'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not validate_excel_columns(offers):
            return Response({'error': 'Colonnes invalides. Requis: title, type, description'}, status=status.HTTP_400_BAD_REQUEST)
            
        count = insert_offers_from_excel(request.user.id, offers)
        log_action(request.user.id, "IMPORT_OFFERS", f"{count} offres importées via Excel")
        
        return Response({
            'message': f'{count} offre(s) importée(s) avec succès',
            'count': count
        })


class DuplicateOfferView(APIView):
    """
    Dupliquer une offre existante.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'COMPANY':
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
            
        check = execute_query(queries['check_offer_ownership'], (pk, request.user.id), fetch_one=True)
        if not check:
            return Response({'error': 'Offre non trouvée ou non autorisé'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get original offer
        original = execute_query(queries['get_offer_detail'], (pk,), fetch_one=True)
        if not original:
            return Response({'error': 'Offre non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        
        # Create duplicate as draft
        params = (
            request.user.id, 
            f"{original['title']} (copie)",
            original['description'],
            original['type'],
            original.get('duration'),
            original.get('location'),
            original.get('skills')
        )
        
        new_id = execute_query(queries['create_offer_draft'], params, commit=True)
        log_action(request.user.id, "DUPLICATE_OFFER", f"Offre dupliquée: {pk} -> {new_id}")
        
        return Response({
            'message': 'Offre dupliquée (brouillon)',
            'id': new_id
        }, status=status.HTTP_201_CREATED)
