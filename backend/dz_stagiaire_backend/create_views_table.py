
import os
import sys
import mysql.connector
from django.conf import settings

# Setup Django setup to get settings
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

def create_table():
    print("Connecting to database...")
    try:
        connection = mysql.connector.connect(**settings.MYSQL_CONFIG)
        cursor = connection.cursor()
        
        print("Creating offer_views table...")
        query = """
        CREATE TABLE IF NOT EXISTS offer_views (
            offer_id INT NOT NULL,
            student_id INT NOT NULL,
            viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (offer_id, student_id),
            FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
        
        cursor.execute(query)
        connection.commit()
        print("Table offer_views created successfully.")
        
        cursor.close()
        connection.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_table()
