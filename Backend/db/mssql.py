import pyodbc
from config import Config


def get_connection():
    conn = pyodbc.connect(
        f"DRIVER={Config.DB_DRIVER};"
        f"SERVER={Config.DB_SERVER};"
        f"UID={Config.DB_USER};"
        f"PWD={Config.DB_PASSWORD};"
        "TrustServerCertificate=yes;"
    )

    cursor = conn.cursor()
    cursor.execute(f"USE {Config.DB_NAME}")

    return conn
