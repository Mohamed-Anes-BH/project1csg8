from rest_framework import serializers
from .models import Domain, Specialty, University


class DomainSerializer(serializers.ModelSerializer):
    """Serializer for Domain model"""
    
    class Meta:
        model = Domain
        fields = '__all__'


class SpecialtySerializer(serializers.ModelSerializer):
    """Serializer for Specialty model"""
    
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    
    class Meta:
        model = Specialty
        fields = '__all__'


class SpecialtyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing specialties"""
    
    class Meta:
        model = Specialty
        fields = ('id', 'name', 'domain')


class UniversitySerializer(serializers.ModelSerializer):
    """Serializer for University model"""
    
    class Meta:
        model = University
        fields = '__all__'