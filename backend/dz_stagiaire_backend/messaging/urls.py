from django.urls import path
from .views import (
    ConversationListView, MessageListView, SendMessageView, 
    UnreadCountView, ConversationDetailView, StartConversationView
)

urlpatterns = [
    # Conversations
    path('conversations/', ConversationListView.as_view(), name='conversations'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/messages/', MessageListView.as_view(), name='messages'),
    
    # Actions
    path('send/', SendMessageView.as_view(), name='send-message'),
    path('start/', StartConversationView.as_view(), name='start-conversation'),
    
    # Compteur
    path('unread-count/', UnreadCountView.as_view(), name='unread-count'),
]
