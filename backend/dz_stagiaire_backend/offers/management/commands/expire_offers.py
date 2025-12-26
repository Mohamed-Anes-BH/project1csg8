from django.core.management.base import BaseCommand
from core.db import execute_query, queries
import datetime

class Command(BaseCommand):
    help = 'Expires offers that have passed their expiration date'

    def handle(self, *args, **options):
        now = datetime.datetime.now()
        rows_affected = execute_query(queries['system_expire_offers'], (now,), commit=True)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully expired {rows_affected} offers'))

