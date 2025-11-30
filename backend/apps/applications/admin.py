from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'offer', 'status', 'applied_at', 'status_changed_at')
    list_filter = ('status', 'applied_at', 'status_changed_at')
    search_fields = (
        'student__first_name',
        'student__last_name',
        'student__email',
        'offer__title',
        'offer__company__company_profile__company_name'
    )
    ordering = ('-applied_at',)
    readonly_fields = ('applied_at', 'updated_at', 'status_changed_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student',
            'offer',
            'offer__company__company_profile'
        )
