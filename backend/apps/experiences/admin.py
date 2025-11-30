from django.contrib import admin
from .models import Experience


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'student', 'experience_type', 'start_date', 'end_date', 'is_current')
    list_filter = ('experience_type', 'is_current')
    search_fields = ('title', 'company', 'student__user__first_name', 'student__user__last_name')
    ordering = ('-start_date',)
    filter_horizontal = ('skills_used',)
