"""Permissions for applications app"""
from rest_framework import permissions


class CanChangeApplicationStatus(permissions.BasePermission):
    """
    CRITICAL: Permission to change application status
    Only offer owner can change status
    """
    def has_object_permission(self, request, view, obj):
        return obj.offer.company == request.user
