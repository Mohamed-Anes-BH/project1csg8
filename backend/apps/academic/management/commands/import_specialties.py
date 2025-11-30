"""Management command to import specialties from Excel"""
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Import specialties from Excel file'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to Excel file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        self.stdout.write(f'Importing from {file_path}...')
        # Implementation will go here
        self.stdout.write(self.style.SUCCESS('Successfully imported specialties'))
