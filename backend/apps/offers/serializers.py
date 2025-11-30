from rest_framework import serializers
from .models import Offer
from apps.skills.serializers import SkillSerializer
from apps.academic.serializers import UniversitySerializer, SpecialtySerializer
from apps.profiles.serializers import CompanyProfileListSerializer


class OfferSerializer(serializers.ModelSerializer):
    """Detailed serializer for Offer model"""
    
    company_name = serializers.CharField(source='company.company_profile.company_name', read_only=True)
    company_logo = serializers.ImageField(source='company.company_profile.logo', read_only=True)
    company_verified = serializers.BooleanField(source='company.company_profile.is_verified', read_only=True)
    
    required_skills = SkillSerializer(many=True, read_only=True)
    preferred_skills = SkillSerializer(many=True, read_only=True)
    targeted_universities = UniversitySerializer(many=True, read_only=True)
    targeted_specialties = SpecialtySerializer(many=True, read_only=True)
    
    required_skills_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=__import__('apps.skills.models', fromlist=['Skill']).Skill.objects.all(),
        source='required_skills',
        required=False
    )
    preferred_skills_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=__import__('apps.skills.models', fromlist=['Skill']).Skill.objects.all(),
        source='preferred_skills',
        required=False
    )
    targeted_universities_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=__import__('apps.academic.models', fromlist=['University']).University.objects.all(),
        source='targeted_universities',
        required=False
    )
    targeted_specialties_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=__import__('apps.academic.models', fromlist=['Specialty']).Specialty.objects.all(),
        source='targeted_specialties',
        required=False
    )
    
    class Meta:
        model = Offer
        fields = '__all__'
        read_only_fields = (
            'company', 'created_at', 'updated_at',
            'views_count', 'applications_count'
        )


class OfferListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing offers"""
    
    company_name = serializers.CharField(source='company.company_profile.company_name', read_only=True)
    company_logo = serializers.ImageField(source='company.company_profile.logo', read_only=True)
    company_verified = serializers.BooleanField(source='company.company_profile.is_verified', read_only=True)
    required_skills = SkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = Offer
        fields = (
            'id', 'title', 'type', 'location', 'is_remote',
            'duration', 'expiration_date', 'company_name',
            'company_logo', 'company_verified', 'required_skills',
            'applications_count', 'created_at'
        )


class OfferCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating offers"""
    
    class Meta:
        model = Offer
        exclude = (
            'company', 'created_at', 'updated_at',
            'views_count', 'applications_count'
        )