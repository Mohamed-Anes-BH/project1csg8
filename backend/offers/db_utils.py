"""
DZ-Stagiaire - Database Utilities
Fonctions helper pour exécuter des requêtes SQL avec PyMySQL
"""

import pymysql
from django.conf import settings


def get_db_connection():
    """
    Crée et retourne une connexion à la base de données MySQL
    """
    db_config = settings.DATABASES['default']
    return pymysql.connect(
        host=db_config.get('HOST', 'localhost'),
        user=db_config.get('USER', 'root'),
        password=db_config.get('PASSWORD', ''),
        database=db_config.get('NAME', 'dzstagiaire'),
        port=int(db_config.get('PORT', 3306)),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )


def execute_query(query, params=None):
    """
    Exécute une requête SELECT et retourne les résultats sous forme de liste de dictionnaires
    
    Args:
        query (str): Requête SQL SELECT
        params (tuple/list): Paramètres pour la requête (optionnel)
    
    Returns:
        list: Liste de dictionnaires représentant les lignes
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            result = cursor.fetchall()
            return result
    finally:
        connection.close()


def execute_query_one(query, params=None):
    """
    Exécute une requête SELECT et retourne un seul résultat
    
    Args:
        query (str): Requête SQL SELECT
        params (tuple/list): Paramètres pour la requête (optionnel)
    
    Returns:
        dict: Dictionnaire représentant la ligne ou None
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            result = cursor.fetchone()
            return result
    finally:
        connection.close()


def execute_update(query, params=None):
    """
    Exécute une requête INSERT/UPDATE/DELETE
    
    Args:
        query (str): Requête SQL INSERT/UPDATE/DELETE
        params (tuple/list): Paramètres pour la requête (optionnel)
    
    Returns:
        int: ID de la dernière ligne insérée (pour INSERT) ou nombre de lignes affectées
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            connection.commit()
            return cursor.lastrowid if cursor.lastrowid else cursor.rowcount
    finally:
        connection.close()


def execute_many(query, params_list):
    """
    Exécute plusieurs requêtes INSERT/UPDATE en batch
    
    Args:
        query (str): Requête SQL INSERT/UPDATE
        params_list (list): Liste de tuples de paramètres
    
    Returns:
        int: Nombre de lignes affectées
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.executemany(query, params_list)
            connection.commit()
            return cursor.rowcount
    finally:
        connection.close()


def execute_script(sql_file_path):
    """
    Exécute un fichier SQL complet
    
    Args:
        sql_file_path (str): Chemin vers le fichier SQL
    
    Returns:
        bool: True si succès
    """
    connection = get_db_connection()
    try:
        with open(sql_file_path, 'r', encoding='utf-8') as file:
            sql_script = file.read()
        
        with connection.cursor() as cursor:
            # Séparer les commandes SQL
            for statement in sql_script.split(';'):
                statement = statement.strip()
                if statement:
                    cursor.execute(statement)
            connection.commit()
            return True
    except Exception as e:
        print(f"Erreur lors de l'exécution du script SQL: {e}")
        return False
    finally:
        connection.close()
