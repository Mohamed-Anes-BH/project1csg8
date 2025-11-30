"""Utility functions for core app"""
from datetime import datetime


def format_date(date_obj, format_str='%Y-%m-%d'):
    """Format date object to string"""
    if isinstance(date_obj, datetime):
        return date_obj.strftime(format_str)
    return str(date_obj)
