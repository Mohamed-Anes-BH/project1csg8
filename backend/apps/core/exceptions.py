"""Custom exceptions for core app"""
from rest_framework.exceptions import APIException


class CustomAPIException(APIException):
    """Base custom exception"""
    status_code = 400
    default_detail = 'A server error occurred.'
    default_code = 'error'
