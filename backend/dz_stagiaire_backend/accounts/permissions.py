from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'STUDENT'

class IsCompany(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'COMPANY'

class IsEmailVerified(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_verified

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

def is_student(user):
    return user.role == 'STUDENT'

def is_company(user):
    return user.role == 'COMPANY'

def is_admin(user):
    return user.role == 'ADMIN'

def is_email_verified(user):
    return user.is_verified
