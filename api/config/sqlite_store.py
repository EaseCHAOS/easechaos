import sqlite3
import logging
from pathlib import Path
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DB_PATH = DATA_DIR / "timetables.db"


def _get_db() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    try:
        conn = _get_db()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS timetables (
                cache_key TEXT NOT NULL,
                file_hash TEXT NOT NULL,
                data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (cache_key, file_hash)
            )
        """)
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        logger.warning(f"SQLite init skipped (readonly or unavailable): {e}")


def get_timetable(cache_key: str, file_hash: str) -> str | None:
    try:
        conn = _get_db()
        row = conn.execute(
            "SELECT data FROM timetables WHERE cache_key = ? AND file_hash = ?",
            (cache_key, file_hash),
        ).fetchone()
        conn.close()
        return row["data"] if row else None
    except sqlite3.Error as e:
        logger.error(f"SQLite read error: {e}")
        return None


def save_timetable(cache_key: str, file_hash: str, data: str):
    try:
        conn = _get_db()
        conn.execute(
            "INSERT OR REPLACE INTO timetables (cache_key, file_hash, data, created_at) VALUES (?, ?, ?, ?)",
            (cache_key, file_hash, data, datetime.now(timezone.utc)),
        )
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        logger.error(f"SQLite write error: {e}")
