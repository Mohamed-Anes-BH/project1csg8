import os
import sys
import django
from django.conf import settings

# Setup Django environment
# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.db import execute_query, get_db_connection
from core.security import hash_password

def init_admin_db():
    print("Initializing Admin Panel Database...")
    
    # Read schema file
    file_path = os.path.join(settings.BASE_DIR, 'sql', 'admin_schema.sql')
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found!")
        return

    with open(file_path, 'r') as f:
        schema_sql = f.read()

    # Split statements (naive split by semicolon, but works for simple schemas)
    # We need to handle DELIMITER if present, or just Execute line by line if suitable
    # Here we will attempt to execute the whole script but execute_query executes one statement.
    # We'll use get_db_connection to execute multi-queries if possible, or split manually.
    
    # Better approach: Iterate and split by ';', filtering empty statements
    statements = schema_sql.split(';')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("Executing schema queries...")
    import mysql.connector
    for statement in statements:
        if statement.strip():
            try:
                cursor.execute(statement)
            except mysql.connector.Error as e:
                # 1050: Table already exists
                # 1060: Duplicate column name
                # 1061: Duplicate key name
                # 1062: Duplicate entry
                if e.errno in (1050, 1060, 1061, 1062):
                    print(f"Info: {e.msg} (Skipping)")
                else:
                    print(f"Warning executing statement: {e}")
            except Exception as e:
                print(f"Error executing statement: {e}")
    
    conn.commit()
    print("Admin tables created.")

    # Create admin user
    admin_email = "admin@dz-stagiaire.dz"
    admin_pass = "admin123"
    
    # Check if admin exists
    existing = execute_query("SELECT id FROM users WHERE email = %s", (admin_email,), fetch_one=True)
    
    if not existing:
        print(f"Creating super admin user: {admin_email}")
        hashed = hash_password(admin_pass)
        
        user_id = execute_query(
            "INSERT INTO users (email, password_hash, role, is_verified, created_at) VALUES (%s, %s, 'ADMIN', TRUE, NOW())",
            (admin_email, hashed), commit=True
        )
        print(f"Admin user created with ID: {user_id}")
        
    else:
        print("Admin user already exists.")
        
        # Ensure role is ADMIN
        execute_query("UPDATE users SET role = 'ADMIN', is_verified = TRUE WHERE email = %s", (admin_email,), commit=True)
        print("Admin privileges verified.")

    print("\nInitialization Complete!")
    print(f"Admin Login: {admin_email}")
    print(f"Password: {admin_pass}")

if __name__ == "__main__":
    init_admin_db()
