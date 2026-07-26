from datetime import datetime
from typing import Optional
from backend.database import getconnection
from .models import Createcard, Updatecard



def createcard(card):
    time = datetime.now().isoformat()


    table = getconnection()
    cur = table.cursor()
    cur.execute(
        "INSERT INTO cards (profile_name, product_name, strength, directions, warnings, personal_notes, reminder_times, ocr_text, image_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (card.profile_name, card.product_name, card.strength, card.directions, card.warnings, card.personal_notes, card.reminder_times, card.ocr_text, card.image_path, time, time)
    )




    table.commit()
    id2  = cur.lastrowid

    cur.execute("SELECT * FROM cards")
    allresuots = cur.fetchone()



    d = dict(allresuots)

    cur.close()

    d["id"] = id2

    return d

    # return {
    #     "id": id2,
    #     "profile_name": card.profile_name,
    #     "product_name": card.product_name,
    #     "strength": card.strength,
    #     "directions": card.directions,
    #     "warnings": card.warnings,
    #     "personal_notes": card.personal_notes,
    #     "reminder_times": card.reminder_times,
    #     "ocr_text": card.ocr_text,
    #     "image_path": card.image_path,
    #     "created_at": time,
    #
    # }

def getallcards(profile: Optional[str] = None):
    table = getconnection()
    cur = table.cursor()


    if profile is None:
        cur.execute("SELECT * FROM cards ORDER BY created_at DESC")

    else:
        cur.execute("SELECT * FROM cards WHERE profile_name = ? ORDER BY created_at DESC", (profile,))

    results = cur.fetchall()

    d = [dict(row) for row in results]

    table.close()

    return d


def getcardbyid(cardid):
    table = getconnection()
    cur = table.cursor()

    cur.execute("SELECT * FROM cards WHERE id = ?", (cardid,))

    result = cur.fetchone()

    table.close()

    if result is None: return None

    else:
        return dict(result)


def updatecard(cardid, update):
    card = getcardbyid(cardid)
    if card is None:
        return None

    fields = update.model_dump(exclude_none=True)

    if len(fields) == 0:
        return card

    fields["updated_at"] = datetime.now().isoformat()

    table = getconnection()
    cur = table.cursor()


    for i in fields.keys():

        cur.execute("UPDATE cards SET " + i + " = ? WHERE id = ?", (fields[i], cardid))


    table.commit()

    cur.execute("SELECT * FROM cards WHERE id = ?", (cardid,))
    d = dict(r for r in cur.fetchall())
    print(d)
    table.close()

    return d

def deletecard(cardid):
    table = getconnection()
    cur = table.cursor()

    cur.execute("DELETE FROM cards WHERE id = ?", (cardid,))

    rowcount = cur.rowcount

    table.commit()

    table.close()

    return rowcount > 0

