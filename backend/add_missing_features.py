#!/usr/bin/env python
"""
Script de migration pour ajouter les nouvelles tables
- notifications
- offer_views
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dzstagiaire.settings')
django.setup()

from core.db_utils import execute_script

def run_migration():
    """Exécute les scripts SQL pour créer les nouvelles tables"""
    
    print("=" * 60)
    print("Migration: Ajout des tables manquantes")
    print("=" * 60)
    
    # 1. Créer la table notifications
    print("\n1. Création de la table 'notifications'...")
    try:
        execute_script('core/sql/create_notifications.sql')
        print("   ✅ Table 'notifications' créée avec succès")
    except Exception as e:
        print(f"   ⚠️  Erreur (table existe peut-être déjà): {e}")
    
    # 2. Créer la table offer_views
    print("\n2. Création de la table 'offer_views'...")
    try:
        execute_script('offers/sql/create_offer_views.sql')
        print("   ✅ Table 'offer_views' créée avec succès")
    except Exception as e:
        print(f"   ⚠️  Erreur (table existe peut-être déjà): {e}")
    
    print("\n" + "=" * 60)
    print("✅ Migration terminée avec succès !")
    print("=" * 60)
    print("\nNouvelles fonctionnalités disponibles:")
    print("  - Système de notifications")
    print("  - Dashboard étudiant")
    print("  - Gestion des offres (modifier/archiver)")
    print("  - Statistiques d'offres")
    print("  - Recherche de profils étudiants")
    print("\nVoir endpoints.txt pour les nouveaux endpoints.")

if __name__ == "__main__":
    run_migration()
