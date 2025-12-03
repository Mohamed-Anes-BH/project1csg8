"""
DZ-Stagiaire - Script d'initialisation de la base de données MySQL
Exécute tous les scripts SQL pour créer les tables et insérer les données
"""

import os
import sys
import pymysql

# Configuration de la base de données
DB_CONFIG = {
    'host': 'localhost',
    'user': 'dzstagiaire_user',
    'password': 'dzstagiaire_pass',
    'charset': 'utf8mb4',
    'port': 3307,
}

DB_NAME = 'dzstagiaire'


def create_database():
    """Crée la base de données si elle n'existe pas"""
    print("📦 Création de la base de données...")
    connection = pymysql.connect(**DB_CONFIG)
    try:
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"✅ Base de données '{DB_NAME}' créée avec succès!")
    finally:
        connection.close()


def execute_sql_file(filepath, db_name):
    """Exécute un fichier SQL"""
    print(f"📄 Exécution de {os.path.basename(filepath)}...")
    
    config = DB_CONFIG.copy()
    config['database'] = db_name
    
    connection = pymysql.connect(**config)
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            sql_script = file.read()
        
        with connection.cursor() as cursor:
            # Séparer et exécuter chaque commande SQL
            statements = sql_script.split(';')
            for statement in statements:
                statement = statement.strip()
                if statement:
                    cursor.execute(statement)
            connection.commit()
            print(f"   ✅ {os.path.basename(filepath)} exécuté avec succès!")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        raise
    finally:
        connection.close()


def main():
    """Fonction principale"""
    print("=" * 60)
    print("🚀 Initialisation de la base de données DZ-Stagiaire")
    print("=" * 60)
    
    # Créer la base de données
    create_database()
    
    # Chemin de base
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Liste des fichiers SQL à exécuter dans l'ordre
    sql_files = [
        # Core tables (doivent être créées en premier car référencées par les autres)
        os.path.join(base_dir, 'core', 'sql', 'create_tables.sql'),
        os.path.join(base_dir, 'core', 'sql', 'insert_data.sql'),
        
        # Accounts tables
        os.path.join(base_dir, 'accounts', 'sql', 'create_tables.sql'),
        
        # Offers tables
        os.path.join(base_dir, 'offers', 'sql', 'create_tables.sql'),
    ]
    
    # Exécuter chaque fichier SQL
    print("\n📋 Création des tables...")
    for sql_file in sql_files:
        if os.path.exists(sql_file):
            execute_sql_file(sql_file, DB_NAME)
        else:
            print(f"⚠️  Fichier non trouvé: {sql_file}")
    
    print("\n" + "=" * 60)
    print("✅ Initialisation terminée avec succès!")
    print("=" * 60)
    print("\n💡 Prochaines étapes:")
    print("   1. Vérifiez la connexion MySQL dans settings.py")
    print("   2. Lancez le serveur: python manage.py runserver")
    print("   3. Commencez à développer vos vues!")


if __name__ == '__main__':
    main()
