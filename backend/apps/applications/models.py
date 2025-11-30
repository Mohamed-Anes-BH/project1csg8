from django.db import models
from django.conf import settings


class Application(models.Model):
    """Student application to a job offer"""
    
    STATUS_CHOICES = (
        ('RECEIVED', 'Received'),
        ('UNDER_REVIEW', 'Under Review'),
        ('INTERVIEW_SCHEDULED', 'Interview Scheduled'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
    )
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications',
        limit_choices_to={'role': 'student'}
    )
    offer = models.ForeignKey(
        'offers.Offer',
        on_delete=models.CASCADE,
        related_name='applications'
    )
    
    # Application Details
    cover_letter = models.TextField(blank=True)
    resume = models.FileField(upload_to='applications/resumes/', blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='RECEIVED')
    
    # Interview Information
    interview_date = models.DateTimeField(null=True, blank=True)
    interview_location = models.CharField(max_length=255, blank=True)
    interview_notes = models.TextField(blank=True)
    
    # Company Notes
    company_notes = models.TextField(blank=True)
    
    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status_changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'applications'
        ordering = ['-applied_at']
        unique_together = ['student', 'offer']  # One application per student per offer
    
    def __str__(self):
        return f"{self.student.get_full_name()} -> {self.offer.title} ({self.status})"
    
    def save(self, *args, **kwargs):
        # Update status_changed_at when status changes
        if self.pk:
            old_instance = Application.objects.get(pk=self.pk)
            if old_instance.status != self.status:
                from django.utils import timezone
                self.status_changed_at = timezone.now()
        super().save(*args, **kwargs)
