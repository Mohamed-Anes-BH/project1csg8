from django.contrib import admin
from .models import Skill, StudentSkill


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_at')
    list_filter = ('category',)
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ('student', 'skill', 'proficiency', 'years_of_experience')
    list_filter = ('proficiency', 'skill__category')
    search_fields = ('student__user__first_name', 'student__user__last_name', 'skill__name')
    ordering = ('-created_at',)
