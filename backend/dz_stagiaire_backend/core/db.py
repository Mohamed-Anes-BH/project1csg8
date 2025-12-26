import mysql.connector
from django.conf import settings

def get_db_connection():
    """
    Establishes and returns a connection to the MySQL database.
    Using mysql-connector-python as requested (No ORM).
    """
    try:
        connection = mysql.connector.connect(**settings.MYSQL_CONFIG)
        return connection
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        return None

def execute_query(query, params=None, fetch_one=False, fetch_all=False, commit=False):
    """
    Helper function to execute raw SQL queries.
    """
    connection = get_db_connection()
    if not connection:
        return None

    cursor = connection.cursor(dictionary=True) # Return results as dicts
    try:
        cursor.execute(query, params or ())
        
        if commit:
            connection.commit()
            result = cursor.lastrowid
        elif fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        else:
            result = None
            
        return result
    except mysql.connector.Error as err:
        print(f"Query Error: {err}")
        print(f"Query: {query}")
        return None
    finally:
        cursor.close()
        connection.close()

def fetch_one(query, params=None):
    """
    Wrapper for execute_query to fetch a single row.
    """
    return execute_query(query, params, fetch_one=True)

def fetch_all(query, params=None):
    """
    Wrapper for execute_query to fetch all rows.
    """
    return execute_query(query, params, fetch_all=True)

def commit_transaction(queries_with_params):
    """
    Executes multiple queries in a single transaction.
    queries_with_params: List of tuples (query, params)
    """
    connection = get_db_connection()
    if not connection:
        return False
        
    cursor = connection.cursor()
    try:
        connection.start_transaction()
        for query, params in queries_with_params:
            cursor.execute(query, params)
        connection.commit()
        return True
    except mysql.connector.Error as err:
        print(f"Transaction Error: {err}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()

import os

def load_queries():
    """
    Loads SQL queries from sql/query.sql file.
    Parses queries based on '-- name: query_name' tags.
    """
    queries = {}
    sql_file_path = os.path.join(settings.BASE_DIR, 'sql', 'query.sql')
    
    if not os.path.exists(sql_file_path):
        print(f"Warning: {sql_file_path} not found.")
        return queries

    with open(sql_file_path, 'r') as f:
        current_query_name = None
        current_query_lines = []
        
        for line in f:
            if line.startswith('-- name:'):
                # Save previous query if exists
                if current_query_name:
                    queries[current_query_name] = " ".join(current_query_lines).strip()
                
                # Start new query
                current_query_name = line.replace('-- name:', '').strip()
                current_query_lines = []
            elif current_query_name:
                # Add line to current query (skip comments and empty lines)
                clean_line = line.strip()
                if clean_line and not clean_line.startswith('--'):
                    current_query_lines.append(clean_line)
        
        # Save last query
        if current_query_name:
            queries[current_query_name] = " ".join(current_query_lines).strip()
            
    return queries

# Global queries dictionary
queries = load_queries()
