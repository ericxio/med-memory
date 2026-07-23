import sqlite3
from config import db_path, data_dir


def getconnection():

    con = sqlite3.connect(db_path)

    rowfactory = sqlite3.Row

    return con


def createdatabase():
    data_dir.mkdir(parents=True, exist_ok=True)

    try:

        table = getconnection()

        table.execute("""
        CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_name TEXT NOT NULL,
        product_name TEXT NOT NULL,
        strength TEXT,
        directions TEXT,
        warnings TEXT,
        personal_notes TEXT,
        reminder_times TEXT,
        ocr_text TEXT,
        image_path TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
        )
        """)




        table.commit()

    finally:
                table.close()



createdatabase()






