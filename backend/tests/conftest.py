"""
Test configuration and fixtures for pytest
"""
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def student_user(db):
    """Create a test student user"""
    return User.objects.create_user(
        email='student@test.com',
        password='testpass123',
        role='student',
        first_name='Test',
        last_name='Student'
    )


@pytest.fixture
def company_user(db):
    """Create a test company user"""
    return User.objects.create_user(
        email='company@test.com',
        password='testpass123',
        role='company',
        first_name='Test',
        last_name='Company'
    )


@pytest.fixture
def api_client():
    """Return API client"""
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def authenticated_student_client(api_client, student_user):
    """Return authenticated API client for student"""
    api_client.force_authenticate(user=student_user)
    return api_client


@pytest.fixture
def authenticated_company_client(api_client, company_user):
    """Return authenticated API client for company"""
    api_client.force_authenticate(user=company_user)
    return api_client
