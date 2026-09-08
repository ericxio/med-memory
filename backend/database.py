import sqlite3
from backend.config import db_path, data_dir


def getconnection():

    con = sqlite3.connect(str(db_path))

    con.row_factory = sqlite3.Row

    return con


def initdatabase():
    data_dir.mkdir(parents=True, exist_ok=True)
    con = getconnection()
    cur = con.cursor()
    try:
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_name TEXT,
            strength TEXT,
            directions TEXT,
            warnings TEXT,
            personal_notes TEXT,
            reminder_times TEXT,
            ocr_text TEXT,
            image_path TEXT,
            created_at TEXT,
            updated_at TEXT
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS usage_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            card_id INTEGER NOT NULL,
            event_type TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            notes TEXT
        )
        """)

        con.commit()
    finally:
        con.close()











