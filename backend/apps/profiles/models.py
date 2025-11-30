from django.db import models
from django.conf import settings


class StudentProfile(models.Model):
    """Extended profile for student users"""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    
    # Academic Information
    university = models.ForeignKey(
        'academic.University',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students'
    )
    specialty = models.ForeignKey(
        'academic.Specialty',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students'
    )
    year_of_study = models.IntegerField(null=True, blank=True)
    graduation_year = models.IntegerField(null=True, blank=True)
    
    # Personal Information
    bio = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Professional Information
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    portfolio_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    
    # Preferences
    preferred_job_types = models.JSONField(default=list, blank=True)  # ['Stage', 'PFE', 'Premier Emploi']
    preferred_locations = models.JSONField(default=list, blank=True)
    available_from = models.DateField(null=True, blank=True)
    
    # Stats
    profile_views = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_profiles'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Student Profile: {self.user.get_full_name()}"


class CompanyProfile(models.Model):
    """Extended profile for company users"""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='company_profile'
    )
    
    # Company Information
    company_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ('1-10', '1-10 employees'),
            ('11-50', '11-50 employees'),
            ('51-200', '51-200 employees'),
            ('201-500', '201-500 employees'),
            ('500+', '500+ employees'),
        ]
    )
    
    # Contact Information
    website = models.URLField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Description
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='companies/logos/', blank=True, null=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verification_document = models.FileField(
        upload_to='companies/verification/',
        blank=True,
        null=True
    )
    
    # Stats
    total_offers_posted = models.IntegerField(default=0)
    total_hires = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'company_profiles'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Company Profile: {self.company_name}"
