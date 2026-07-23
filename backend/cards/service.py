from datetime import datetime
from typing import Optional
from database import getconnection
from cards.models import Createcard, Updatecard



def createcard(card):
    time = datetime.now().isoformat()


    cur = getconnection()
    cur.execute(
        "INSERT INTO medicine_cards (profile_name, product_name, strength, directions, warnings, personal_notes, reminder_times, ocr_text, image_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (card.profile_name, card.product_name, card.strength, card.directions, card.warnings, card.personal_notes, card.reminder_times, card.ocr_text, card.image_path, time)
    )




    cur.commit()
    id2  = cur.lastrowid

    d = dict(cur.fetchall())

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

    cur = getconnection()

    if profile is None:
        cur.execute("SELECT * FROM medicine_cards ORDER BY created_at DESC")

    else:
        cur.execute("SELECT * FROM medicine_cards WHERE profile_name = ? ORDER BY created_at DESC", (profile,))

    results = cur.fetchall()

    d = [dict(row) for row in results]

    cur.close()

    return d


def getcardbyid(cardid):
    cur = getconnection()

    cur.execute("SELECT * FROM medicine_cards WHERE id = ?", (cardid,))

    result = cur.fetchone()

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

    cur = getconnection()


    for i in fields.keys():

        cur.execute("UPDATE cards SET " + i + " = ? WHERE id = ?", (fields[i], cardid))


    cur.commit()

    d = dict(cur.fetchall())

    cur.close()

    return d

def deletecard(cardid):
    cur = getconnection()

    cur.execute("DELETE FROM medicine_cards WHERE id = ?", (cardid,))

    rowcount = cur.rowcount

    cur.commit()

    cur.close()

    return rowcount > 0