from django.db import models


class Domain(models.Model):
    """Academic domain (e.g., Engineering, Medicine, Business)"""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'domains'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Specialty(models.Model):
    """Academic specialty within a domain"""
    
    name = models.CharField(max_length=150)
    domain = models.ForeignKey(
        Domain,
        on_delete=models.CASCADE,
        related_name='specialties'
    )
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'specialties'
        ordering = ['domain', 'name']
        verbose_name_plural = 'Specialties'
        unique_together = ['domain', 'name']
    
    def __str__(self):
        return f"{self.domain.name} - {self.name}"


class University(models.Model):
    """University/Educational Institution"""
    
    name = models.CharField(max_length=255, unique=True)
    short_name = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Algeria')
    website = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'universities'
        ordering = ['name']
        verbose_name_plural = 'Universities'
    
    def __str__(self):
        return self.short_name or self.name
