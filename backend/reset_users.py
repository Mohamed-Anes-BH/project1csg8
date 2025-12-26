#!/usr/bin/env python
"""
Script pour réinitialiser les utilisateurs (nécessaire après passage à Bcrypt)
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dzstagiaire.settings')
django.setup()

from core.db_utils import execute_update

def reset_users():
    print("=" * 60)
    print("⚠️  RÉINITIALISATION DES UTILISATEURS (BCRYPT MIGRATION)")
    print("=" * 60)
    
    confirm = input("Êtes-vous sûr de vouloir supprimer TOUS les utilisateurs ? (y/N): ")
    if confirm.lower() != 'y':
        print("Annulé.")
        return

    try:
        # Désactiver les contraintes de clé étrangère temporairement
        execute_update("SET FOREIGN_KEY_CHECKS = 0")
        
        print("Suppression des données...")
        # Ordre important pour respecter les contraintes (enfants d'abord)
        execute_update("DELETE FROM notifications")
        execute_update("DELETE FROM applications")
        execute_update("DELETE FROM offer_views")
        execute_update("DELETE FROM offer_specialties")
        execute_update("DELETE FROM offer_universities")
        execute_update("DELETE FROM offers")
        execute_update("DELETE FROM verification_tokens")
        execute_update("DELETE FROM student_profiles")
        execute_update("DELETE FROM company_profiles")
        execute_update("DELETE FROM users")
        
        # Réactiver les contraintes
        execute_update("SET FOREIGN_KEY_CHECKS = 1")
        
        print("✅ Base de données nettoyée avec succès !")
        print("Vous pouvez maintenant créer de nouveaux comptes avec des mots de passe sécurisés (Bcrypt).")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    reset_users()
