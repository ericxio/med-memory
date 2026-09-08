from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashpassword(plain: str):
    return pwd.hash(plain)

def verifypassword(plain: str, hashed: str):
    return pwd.verify(plain, hashed)

from datetime import datetime

from sqlite3 import IntegrityError

from backend.database import getconnection

from datetime import datetime
from sqlite3 import IntegrityError
from backend.database import getconnection

def getuserbyemail(email: str):
    con = getconnection(); cur = con.cursor()
    cur.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cur.fetchone(); con.close()
    return dict(row) if row else None

def getuserbyid(userid: int):
    con = getconnection(); cur = con.cursor()
    cur.execute("SELECT * FROM users WHERE id = ?", (userid,))
    row = cur.fetchone(); con.close()
    return dict(row) if row else None

def createuser(email: str, password: str):
    time = datetime.now().isoformat()
    con = getconnection(); cur = con.cursor()
    try:
        cur.execute(
            "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)",
            (email, hashpassword(password), time),
        )
        con.commit()
        userid = cur.lastrowid
    except IntegrityError:
        con.close()
        return None
    con.close()
    return {"id": userid, "email": email, "created_at": time}



from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from backend.config import jwt_secret, jwt_algorithm, jwt_expire_minutes


def createtoken(userid: int) :
    expire = datetime.now(timezone.utc) + timedelta(minutes=jwt_expire_minutes)
    claims = {"sub": str(userid), "exp": expire}
    return jwt.encode(claims, jwt_secret, algorithm=jwt_algorithm)


def decodetoken(token:str):
    try:

        payload = jwt.decode(token, jwt_secret, algorithms=[jwt_algorithm])
        return int(payload["sub"])


    except:
        return






