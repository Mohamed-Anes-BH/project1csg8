from rest_framework import serializers
from .models import StudentProfile, CompanyProfile
from apps.accounts.serializers import UserSerializer


class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer for StudentProfile"""
    
    user = UserSerializer(read_only=True)
    university_name = serializers.CharField(source='university.name', read_only=True)
    specialty_name = serializers.CharField(source='specialty.name', read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at', 'profile_views')


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating StudentProfile"""
    
    class Meta:
        model = StudentProfile
        exclude = ('user', 'created_at', 'updated_at', 'profile_views')


class StudentProfileListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing students"""
    
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    photo = serializers.ImageField(source='user.photo', read_only=True)
    university_name = serializers.CharField(source='university.name', read_only=True)
    specialty_name = serializers.CharField(source='specialty.name', read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = (
            'id', 'first_name', 'last_name', 'email', 'photo',
            'university', 'university_name', 'specialty', 'specialty_name',
            'year_of_study', 'bio'
        )


class CompanyProfileSerializer(serializers.ModelSerializer):
    """Serializer for CompanyProfile"""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CompanyProfile
        fields = '__all__'
        read_only_fields = (
            'user', 'created_at', 'updated_at',
            'is_verified', 'total_offers_posted', 'total_hires'
        )


class CompanyProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating CompanyProfile"""
    
    class Meta:
        model = CompanyProfile
        exclude = (
            'user', 'created_at', 'updated_at',
            'is_verified', 'total_offers_posted', 'total_hires'
        )


class CompanyProfileListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing companies"""
    
    class Meta:
        model = CompanyProfile
        fields = (
            'id', 'company_name', 'industry', 'city',
            'logo', 'is_verified', 'total_offers_posted'
        )