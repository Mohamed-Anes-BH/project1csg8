"""Permissions for accounts app"""
from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """Permission to check if user is a student"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'


class IsCompany(permissions.BasePermission):
    """Permission to check if user is a company"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'company'


class IsOwner(permissions.BasePermission):
    """Permission to check if user is the owner of the object"""
    def has_object_permission(self, request, view, obj):
        return obj == request.user or obj.user == request.user
