
import os
import sys
import mysql.connector
from django.conf import settings

# Setup Django setup to get settings
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

def fix_view_counts():
    print("Connecting to database...")
    try:
        connection = mysql.connector.connect(**settings.MYSQL_CONFIG)
        cursor = connection.cursor()
        
        print("Recalculating view counts based on unique offer_views...")
        # Update views count for all offers to match the count in offer_views table
        query = """
        UPDATE offers 
        SET views = (
            SELECT COUNT(*) 
            FROM offer_views 
            WHERE offer_views.offer_id = offers.id
        );
        """
        
        cursor.execute(query)
        connection.commit()
        print(f"View counts corrected. {cursor.rowcount} offers updated.")
        
        cursor.close()
        connection.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_view_counts()
