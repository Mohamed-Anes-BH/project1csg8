import pymysql

DB_CONFIG = {
    'host': 'localhost',
    'user': 'dzstagiaire_user',
    'password': 'dzstagiaire_pass',
    'database': 'dzstagiaire',
    'charset': 'utf8mb4',
    'port': 3307,
    'cursorclass': pymysql.cursors.DictCursor
}

def test_data():
    conn = pymysql.connect(**DB_CONFIG)
    try:
        with conn.cursor() as cursor:
            print("\n🏫 Liste des universités:")
            cursor.execute("SELECT * FROM universities LIMIT 5")
            for uni in cursor.fetchall():
                print(f"- {uni['name']} ({uni['city']})")
            
            print("\n📚 Liste des domaines:")
            cursor.execute("SELECT * FROM domains LIMIT 5")
            for dom in cursor.fetchall():
                print(f"- {dom['name']}")
                
    finally:
        conn.close()

if __name__ == "__main__":
    test_data()
