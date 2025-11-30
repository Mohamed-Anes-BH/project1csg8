from django.contrib import admin
from .models import StudentProfile, CompanyProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'university', 'specialty', 'year_of_study', 'graduation_year', 'profile_views')
    list_filter = ('university', 'specialty', 'year_of_study')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'bio')
    ordering = ('-created_at',)
    

@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'user', 'city', 'is_verified', 'total_offers_posted', 'total_hires')
    list_filter = ('is_verified', 'company_size', 'city')
    search_fields = ('company_name', 'user__email', 'description')
    ordering = ('-created_at',)
