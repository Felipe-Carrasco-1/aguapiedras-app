import MySQLdb
try:
    conn = MySQLdb.connect(host="localhost", user="root", passwd="admin")
    cursor = conn.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS aguapiedras_db;")
    conn.close()
    print("Database aguapiedras_db created successfully.")
except Exception as e:
    print(f"Error: {e}")
