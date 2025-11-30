from rest_framework import serializers
from .models import Experience
from apps.skills.serializers import SkillSerializer


class ExperienceSerializer(serializers.ModelSerializer):
    """Serializer for Experience model"""
    
    skills_used = SkillSerializer(many=True, read_only=True)
    skills_used_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=__import__('apps.skills.models', fromlist=['Skill']).Skill.objects.all(),
        source='skills_used'
    )
    
    class Meta:
        model = Experience
        fields = '__all__'
        read_only_fields = ('student', 'created_at', 'updated_at')


class ExperienceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Experience"""
    
    class Meta:
        model = Experience
        exclude = ('student', 'created_at', 'updated_at')