from django.core.management.base import BaseCommand
from core.db import execute_query, queries
from core.notifications import create_notification
from core.email import send_profile_reminder_email


class Command(BaseCommand):
    help = 'Envoie des rappels aux utilisateurs avec des profils incomplets'

    def handle(self, *args, **options):
        # Étudiants avec profils incomplets
        students = execute_query(queries['get_incomplete_student_profiles'], fetch_all=True) or []
        
        for student in students:
            create_notification(
                student['id'],
                "Complétez votre profil",
                "Votre profil n'est pas complet. Un profil complet augmente vos chances de trouver un stage !"
            )
            send_profile_reminder_email(student['email'], student.get('first_name'), 'STUDENT')
        
        # Entreprises avec profils incomplets
        companies = execute_query(queries['get_incomplete_company_profiles'], fetch_all=True) or []
        
        for company in companies:
            create_notification(
                company['id'],
                "Complétez votre profil entreprise",
                "Votre profil entreprise n'est pas complet. Un profil complet attire plus de candidats !"
            )
            send_profile_reminder_email(company['email'], company.get('name'), 'COMPANY')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Rappels envoyés: {len(students)} étudiants, {len(companies)} entreprises'
            )
        )
