from django.contrib import admin
from .models import Domain, Specialty, University


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ('name', 'domain', 'created_at')
    list_filter = ('domain',)
    search_fields = ('name', 'description')
    ordering = ('domain', 'name')


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'short_name', 'city', 'country')
    list_filter = ('city', 'country')
    search_fields = ('name', 'short_name', 'city')
    ordering = ('name',)
