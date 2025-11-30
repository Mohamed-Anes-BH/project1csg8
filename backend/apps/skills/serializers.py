from rest_framework import serializers
from .models import Skill, StudentSkill


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for Skill model"""
    
    class Meta:
        model = Skill
        fields = '__all__'


class StudentSkillSerializer(serializers.ModelSerializer):
    """Serializer for StudentSkill"""
    
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_category = serializers.CharField(source='skill.category', read_only=True)
    
    class Meta:
        model = StudentSkill
        fields = '__all__'
        read_only_fields = ('student', 'created_at', 'updated_at')


class StudentSkillCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating StudentSkill"""
    
    class Meta:
        model = StudentSkill
        exclude = ('student', 'created_at', 'updated_at')