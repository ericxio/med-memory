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
    return {"id": logid, "card_id": cardid, "event_type": eventtype,
            "timestamp": timestamp, "notes": notes}


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

def usagesummary(cardid: int) -> dict:
    con = getconnection()
    cursor = con.cursor()
    cursor.execute(
        "SELECT timestamp FROM usage_log "
        "WHERE card_id = ? AND event_type = 'taken' "
        "ORDER BY timestamp DESC LIMIT 1",
        (cardid,)
    )
    row = cursor.fetchone()
    lasttaken = row["timestamp"] if row else None

    con.close(
    )

    return dict(row)


def deletehistory(cardid:int):
    con= getconnection()
    cursor = con.cursor()
    cursor.execute(
        "DELETE FROM usage_log WHERE card_id = ?",
        (cardid,)
    )
    count = cursor.rowcount

    con.commit()
    con.close();
    return count

def usagesummary(cardid: int) -> dict:
    con = getconnection(); cur = con.cursor()
    def lastof(evt):
        cur.execute(
            "SELECT timestamp FROM usage_log WHERE card_id = ? AND event_type = ? "
            "ORDER BY timestamp DESC LIMIT 1", (cardid, evt))
        row = cur.fetchone()
        return row["timestamp"] if row else None
    result = {"last_taken_at": lastof("taken"), "last_scanned_at": lastof("scanned")}
    con.close()
    return result


def getuserhistory(limit: int = 100, event_type: str = None) -> list:
    con = getconnection()

    cur = con.cursor()

    sql = ("SELECT u.id, u.card_id, c.product_name, u.event_type, u.timestamp, u.notes "
           "FROM usage_log u JOIN cards c ON u.card_id = c.id ")

    #cur.execute(sql)

    p=[]

    if event_type:
        sql += ("AND " if "WHERE" in sql else "WHERE ") + "u.event_type = ? "
        p.append(event_type)

    sql += "ORDER BY u.timestamp DESC LIMIT ?"
    p.append(limit)

    cur.execute(sql, p)

    rows = cur.fetchall()
    con.close()

    return [dict(r) for r in rows]




