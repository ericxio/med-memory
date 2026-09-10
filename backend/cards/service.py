from datetime import datetime
from typing import Optional
from backend.database import getconnection
from .models import Createcard, Updatecard



def createcard(user_id, card):
    time = datetime.now().isoformat()
    con = getconnection(); cur = con.cursor()
    cur.execute(
        "INSERT INTO cards (user_id, product_name, strength, directions, warnings, "
        "personal_notes, reminder_times, ocr_text, image_path, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (user_id, card.product_name, card.strength, card.directions, card.warnings,
         card.personal_notes, card.reminder_times, card.ocr_text, card.image_path, time, time),
    )
    con.commit(); newid = cur.lastrowid; con.close()
    return getcardbyid(newid, user_id)

def getallcards(user_id):
    con = getconnection(); cur = con.cursor()
    cur.execute("SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cur.fetchall(); con.close()
    return [dict(r) for r in rows]

def getcardbyid(cardid, user_id):
    con = getconnection(); cur = con.cursor()
    cur.execute("SELECT * FROM cards WHERE id = ? AND user_id = ?", (cardid, user_id))
    row = cur.fetchone(); con.close()
    return dict(row) if row else None      # not owned -> None -> 404

def updatecard(cardid, user_id, update):
    card = getcardbyid(cardid, user_id)
    if card is None:
        return None

def deletecard(cardid):
    table = getconnection()
    cur = table.cursor()

    cur.execute("DELETE FROM cards WHERE id = ?", (cardid,))

    rowcount = cur.rowcount

    table.commit()

    table.close()

    return rowcount > 0

