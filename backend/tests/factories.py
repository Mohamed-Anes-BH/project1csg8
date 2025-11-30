"""
Factory classes for generating test data
"""
import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model

User = get_user_model()


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
    
    email = factory.Faker('email')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    role = 'student'
    is_active = True


class StudentUserFactory(UserFactory):
    role = 'student'


class CompanyUserFactory(UserFactory):
    role = 'company'
