from django.db import models
from django.conf import settings


class Offer(models.Model):
    """Job offer posted by companies"""
    
    TYPE_CHOICES = (
        ('Stage', 'Stage'),
        ('PFE', 'PFE'),
        ('Premier Emploi', 'Premier Emploi'),
    )
    
    company = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='offers',
        limit_choices_to={'role': 'company'}
    )
    
    # Basic Information
    title = models.CharField(max_length=255)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # Location
    location = models.CharField(max_length=200)
    is_remote = models.BooleanField(default=False)
    
    # Duration & Dates
    duration = models.CharField(max_length=100, blank=True)  # e.g., "3 months", "6 months"
    start_date = models.DateField(null=True, blank=True)
    expiration_date = models.DateField()  # Application deadline
    
    # Requirements
    required_skills = models.ManyToManyField(
        'skills.Skill',
        related_name='required_in_offers',
        blank=True
    )
    preferred_skills = models.ManyToManyField(
        'skills.Skill',
        related_name='preferred_in_offers',
        blank=True
    )
    
    # Targeting
    targeted_universities = models.ManyToManyField(
        'academic.University',
        related_name='offers',
        blank=True
    )
    targeted_specialties = models.ManyToManyField(
        'academic.Specialty',
        related_name='offers',
        blank=True
    )
    
    # Additional Information
    salary_range = models.CharField(max_length=100, blank=True)
    benefits = models.TextField(blank=True)
    requirements = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_published = models.BooleanField(default=True)
    
    # Stats
    views_count = models.IntegerField(default=0)
    applications_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'offers'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.company.company_profile.company_name}"
    
    @property
    def is_expired(self):
        from django.utils import timezone
        return self.expiration_date < timezone.now().date()
