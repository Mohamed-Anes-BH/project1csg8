from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.db import execute_query, queries
from core.notifications import create_notification


class ConversationListView(APIView):
    """
    Liste des conversations.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'STUDENT':
            convs = execute_query(
                queries['list_conversations_student'], 
                (request.user.id, request.user.id), 
                fetch_all=True
            )
        else:
            convs = execute_query(
                queries['list_conversations_company'], 
                (request.user.id, request.user.id), 
                fetch_all=True
            )
            
        return Response(convs or [])


class MessageListView(APIView):
    """
    Liste des messages d'une conversation.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        # Vérifier l'accès à la conversation
        check = execute_query(
            queries['check_conversation_access'], 
            (conversation_id, request.user.id, request.user.id), 
            fetch_one=True
        )
        
        if not check:
            return Response({'error': 'Conversation non trouvée ou accès refusé'}, status=status.HTTP_404_NOT_FOUND)
            
        # Marquer les messages comme lus
        execute_query(queries['mark_messages_read'], (conversation_id, request.user.id), commit=True)
        
        messages = execute_query(queries['list_messages'], (conversation_id,), fetch_all=True)
        return Response(messages or [])


class SendMessageView(APIView):
    """
    Envoyer un message.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        recipient_id = request.data.get('recipient_id')
        content = request.data.get('content')
        conversation_id = request.data.get('conversation_id')
        
        if not content:
            return Response({'error': 'Message requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not recipient_id and not conversation_id:
            return Response({'error': 'recipient_id ou conversation_id requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        if conversation_id:
            # Vérifier l'accès à la conversation existante
            check = execute_query(
                queries['check_conversation_access'], 
                (conversation_id, request.user.id, request.user.id), 
                fetch_one=True
            )
            if not check:
                return Response({'error': 'Conversation non trouvée ou accès refusé'}, status=status.HTTP_404_NOT_FOUND)
            
            conv_id = conversation_id
            
            # Trouver le destinataire
            conv = execute_query(
                "SELECT student_id, company_id FROM conversations WHERE id = %s",
                (conversation_id,), fetch_one=True
            )
            if conv:
                recipient_id = conv['company_id'] if request.user.role == 'STUDENT' else conv['student_id']
        else:
            # Créer ou trouver la conversation
            if request.user.role == 'STUDENT':
                student_id = request.user.id
                company_id = recipient_id
            else:
                student_id = recipient_id
                company_id = request.user.id
                
            conv = execute_query(queries['find_conversation'], (student_id, company_id), fetch_one=True)
            
            if not conv:
                conv_id = execute_query(queries['create_conversation'], (student_id, company_id), commit=True)
            else:
                conv_id = conv['id']
            
        # Envoyer le message
        execute_query(queries['create_message'], (conv_id, request.user.id, content), commit=True)
        
        # Notifier le destinataire
        create_notification(recipient_id, "Nouveau message", "Vous avez reçu un nouveau message.")
        
        return Response({
            'message': 'Message envoyé',
            'conversation_id': conv_id
        })


class ConversationDetailView(APIView):
    """
    Détail d'une conversation avec tous les messages.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # Vérifier l'accès
        check = execute_query(
            queries['check_conversation_access'], 
            (pk, request.user.id, request.user.id), 
            fetch_one=True
        )
        
        if not check:
            return Response({'error': 'Conversation non trouvée ou accès refusé'}, status=status.HTTP_404_NOT_FOUND)
        
        # Infos de la conversation
        if request.user.role == 'STUDENT':
            conv_info = execute_query(
                """SELECT c.id, c.created_at, com.name as other_party_name, com.logo_path as other_party_image
                FROM conversations c
                JOIN companies com ON c.company_id = com.user_id
                WHERE c.id = %s""",
                (pk,), fetch_one=True
            )
        else:
            conv_info = execute_query(
                """SELECT c.id, c.created_at, CONCAT(s.first_name, ' ', s.last_name) as other_party_name
                FROM conversations c
                JOIN students s ON c.student_id = s.user_id
                WHERE c.id = %s""",
                (pk,), fetch_one=True
            )
        
        # Marquer comme lu
        execute_query(queries['mark_messages_read'], (pk, request.user.id), commit=True)
        
        # Messages
        messages = execute_query(queries['list_messages'], (pk,), fetch_all=True)
        
        return Response({
            'conversation': conv_info,
            'messages': messages or []
        })

    def delete(self, request, pk):
        """
        Supprimer une conversation (et ses messages).
        """
        check = execute_query(
            queries['check_conversation_access'], 
            (pk, request.user.id, request.user.id), 
            fetch_one=True
        )
        
        if not check:
            return Response({'error': 'Conversation non trouvée ou accès refusé'}, status=status.HTTP_404_NOT_FOUND)
        
        # Supprimer les messages d'abord, puis la conversation
        execute_query("DELETE FROM messages WHERE conversation_id = %s", (pk,), commit=True)
        execute_query("DELETE FROM conversations WHERE id = %s", (pk,), commit=True)
        
        return Response({'message': 'Conversation supprimée'})


class UnreadCountView(APIView):
    """
    Nombre de messages non lus.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = execute_query(
            queries['get_unread_messages_count'], 
            (request.user.id, request.user.id, request.user.id), 
            fetch_one=True
        )
        return Response({'unread_messages': count['count'] if count else 0})


class StartConversationView(APIView):
    """
    Démarrer une nouvelle conversation.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        recipient_id = request.data.get('recipient_id')
        
        if not recipient_id:
            return Response({'error': 'recipient_id requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        if request.user.role == 'STUDENT':
            student_id = request.user.id
            company_id = recipient_id
        else:
            student_id = recipient_id
            company_id = request.user.id
        
        # Vérifier si la conversation existe déjà
        existing = execute_query(queries['find_conversation'], (student_id, company_id), fetch_one=True)
        
        if existing:
            return Response({
                'message': 'Conversation existante',
                'conversation_id': existing['id'],
                'is_new': False
            })
        
        # Créer la conversation
        conv_id = execute_query(queries['create_conversation'], (student_id, company_id), commit=True)
        
        return Response({
            'message': 'Conversation créée',
            'conversation_id': conv_id,
            'is_new': True
        }, status=status.HTTP_201_CREATED)
