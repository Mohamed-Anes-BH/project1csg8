from django.db import models


class Experience(models.Model):
    """Work or internship experience"""
    
    EXPERIENCE_TYPE_CHOICES = (
        ('internship', 'Internship'),
        ('job', 'Job'),
        ('freelance', 'Freelance'),
        ('volunteer', 'Volunteer'),
        ('project', 'Project'),
    )
    
    student = models.ForeignKey(
        'profiles.StudentProfile',
        on_delete=models.CASCADE,
        related_name='experiences'
    )
    
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    experience_type = models.CharField(max_length=20, choices=EXPERIENCE_TYPE_CHOICES)
    location = models.CharField(max_length=200, blank=True)
    
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # Null if current
    is_current = models.BooleanField(default=False)
    
    description = models.TextField(blank=True)
    skills_used = models.ManyToManyField('skills.Skill', blank=True, related_name='experiences')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'experiences'
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.title} at {self.company}"
