from django.urls import path
from .views import (
    OfferListView, OfferDetailView, ArchiveOfferView, 
    ImportOffersView, DeleteOfferView, PublishOfferView,
    CloseOfferView, DuplicateOfferView
)

urlpatterns = [
    # Liste et création
    path('', OfferListView.as_view(), name='offer-list'),
    
    # Détail et modification
    path('<int:pk>/', OfferDetailView.as_view(), name='offer-detail'),
    
    # Actions sur les offres
    path('<int:pk>/publish/', PublishOfferView.as_view(), name='publish-offer'),
    path('<int:pk>/close/', CloseOfferView.as_view(), name='close-offer'),
    path('<int:pk>/archive/', ArchiveOfferView.as_view(), name='archive-offer'),
    path('<int:pk>/delete/', DeleteOfferView.as_view(), name='delete-offer'),
    path('<int:pk>/duplicate/', DuplicateOfferView.as_view(), name='duplicate-offer'),
    
    # Import Excel
    path('import/', ImportOffersView.as_view(), name='import-offers'),
]
