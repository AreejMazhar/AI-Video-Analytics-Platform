# test_db.py
import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        database="invexal_db",
        user="postgres",
        password="admin321",  # Use the password you set
        port="5432"
    )
    print("✅ Connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")