from datetime import datetime, timezone
from backend.database import getconnection


def logevent(cardid: int, eventtype: str, notes: str = None) -> dict:
    if eventtype not in ['scanned', 'taken']:
        raise ValueError(f"invalid eventtype: '{eventtype}'")

    timestamp = datetime.now(timezone.utc).isoformat()

    con = getconnection()
    cursor = con.cursor()
    cursor.execute(
        "INSERT INTO usage_log (card_id, event_type, timestamp, notes) ",
        "VALUES (?, ?, ?, ?)", (cardid, eventtype, timestamp, notes))
    con.commit()

    logid = cursor.lastrowid

    con.close()


def gethistory(cardid: int, limit:int=20) -> list:
    con = getconnection()
    cursor = con.cursor()


    cursor.execute(
        "SELECT id, event_type, timestamp, notes "
        "FROM usage_log "
        "WHERE card_id = ? "
        "ORDER BY timestamp DESC "
        "LIMIT ?",
        (cardid, limit)
    )

    rows = cursor.fetchall()

    return list(rows)

