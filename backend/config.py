from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

base_dir = Path(__file__).resolve().parent.parent
upload_dir = base_dir / "uploads"

data_dir = base_dir / "data"
db_path = data_dir / "database.db"

openaikey = os.getenv("OPENAI_API_KEY")

openaimodel = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

ocrthreshold = 0.25




