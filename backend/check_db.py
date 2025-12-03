import pymysql

DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'dzstagiaire_user',
    'password': 'dzstagiaire_pass',
    'database': 'dzstagiaire',
    'port': 3307,
    'charset': 'utf8mb4',
}

try:
    print(f"Connecting to {DB_CONFIG['host']}:{DB_CONFIG['port']} as {DB_CONFIG['user']}...")
    conn = pymysql.connect(**DB_CONFIG)
    print("✅ Connected successfully!")
    
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM universities LIMIT 5")
        rows = cursor.fetchall()
        print(f"Found {len(rows)} universities.")
        for row in rows:
            print(row)
            
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
