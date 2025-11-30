"""Permissions for offers app"""
from rest_framework import permissions


class IsOfferOwner(permissions.BasePermission):
    """Permission to check if user owns the offer"""
    def has_object_permission(self, request, view, obj):
        return obj.company == request.user
