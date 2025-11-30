"""Signals for applications app"""
from django.db.models.signals import post_save
from django.dispatch import receiver
# from .models import Application


# @receiver(post_save, sender=Application)
# def application_status_changed(sender, instance, created, **kwargs):
#     """
#     CRITICAL: Signal triggered when application status changes
#     Creates notification for student
#     """
#     if not created and instance.status:
#         # Create notification
#         pass
