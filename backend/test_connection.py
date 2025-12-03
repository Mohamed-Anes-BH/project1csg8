import pymysql

try:
    conn = pymysql.connect(
        host='127.0.0.1',
        user='root',
        password='root123',
        charset='utf8mb4'
    )
    print("Connected as root!")
    with conn.cursor() as cursor:
        cursor.execute("SELECT User, Host FROM mysql.user")
        users = cursor.fetchall()
        print("Users:", users)
    conn.close()
except Exception as e:
    print("Error connecting as root:", e)

try:
    conn = pymysql.connect(
        host='localhost',
        user='dzstagiaire_user',
        password='pass',
        database='dzstagiaire',
        charset='utf8mb4'
    )
    print("Connected as dzstagiaire_user!")
    conn.close()
except Exception as e:
    print("Error connecting as dzstagiaire_user:", e)
