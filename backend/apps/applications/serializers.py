from rest_framework import serializers
from .models import Application
from apps.offers.serializers import OfferListSerializer
from apps.profiles.serializers import StudentProfileListSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    """Detailed serializer for Application model"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    student_phone = serializers.CharField(source='student.phone', read_only=True)
    student_photo = serializers.ImageField(source='student.photo', read_only=True)
    
    offer_title = serializers.CharField(source='offer.title', read_only=True)
    company_name = serializers.CharField(source='offer.company.company_profile.company_name', read_only=True)
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = (
            'student', 'applied_at', 'updated_at', 'status_changed_at'
        )


class ApplicationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with nested objects"""
    
    offer = OfferListSerializer(read_only=True)
    student_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = (
            'student', 'applied_at', 'updated_at', 'status_changed_at'
        )
    
    def get_student_profile(self, obj):
        if hasattr(obj.student, 'student_profile'):
            return StudentProfileListSerializer(obj.student.student_profile).data
        return None


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating applications"""
    
    class Meta:
        model = Application
        fields = ('offer', 'cover_letter', 'resume')


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating application status"""
    
    class Meta:
        model = Application
        fields = ('status', 'interview_date', 'interview_location', 'interview_notes', 'company_notes')