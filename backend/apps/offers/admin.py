from django.contrib import admin
from .models import Offer


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'type', 'location', 'expiration_date', 'is_active', 'applications_count', 'views_count')
    list_filter = ('type', 'is_active', 'is_published', 'is_remote', 'created_at')
    search_fields = ('title', 'description', 'company__company_profile__company_name')
    ordering = ('-created_at',)
    filter_horizontal = ('required_skills', 'preferred_skills', 'targeted_universities', 'targeted_specialties')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('company__company_profile')
