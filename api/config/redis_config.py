import redis
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
import logging
import os
import hashlib

load_dotenv()

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str
    PORT: int = 80

    class Config:
        env_file = ".env"

settings = Settings()

def get_redis_connection():
    try:
        return redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            db=0,
            ssl=True,
            decode_responses=True,
            socket_timeout=5,
            retry_on_timeout=True,
        )
    except redis.ConnectionError as e:
        logger.error(f"Redis connection failed: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error connecting to Redis: {e}")
        raise

r = get_redis_connection()

def create_cache_key_from_parameters(filename: str, class_pattern: str, is_exam: bool) -> str:
    """Generate a consistent cache key including the timetable type."""
    return f"{filename}-{class_pattern.replace(' ', '')}-{'exam' if is_exam else 'lecture'}"

def get_table_from_cache(filename: str, class_pattern: str, is_exam: bool) -> str | None:
    """
    Get a timetable (lecture or exam) from the cache.

    Parameters
    ----------
    filename : str
        The name of the file for the timetable
    class_pattern : str
        The pattern for the class
    is_exam : bool
        Whether the request is for an exam timetable

    Returns
    -------
    str | None
        The table string from the cache or None if not found
    """
    try:
        # Get the current file hash
        file_path = os.path.join("api/drafts", f"{filename}.xlsx")
        with open(file_path, "rb") as f:
            current_hash = hashlib.md5(f.read()).hexdigest()

        # Get cached hash and data
        cache_key = create_cache_key_from_parameters(filename, class_pattern, is_exam)
        hash_key = f"{cache_key}_hash"

        cached_hash = r.get(hash_key)
        cached_data = r.get(cache_key)

        # Return data only if hash matches
        if cached_hash and cached_data and cached_hash == current_hash:
            return cached_data
        return None

    except redis.RedisError as e:
        logger.error(f"Error retrieving from cache: {e}")
        return None

def add_table_to_cache(table: str, filename: str, class_pattern: str, is_exam: bool, expire_seconds: int = 3600):
    """
    Add a timetable (lecture or exam) to the cache.

    Parameters
    ----------
    table : str
        The table string to add to the cache
    filename : str
        The name of the file for the timetable
    class_pattern : str
        The pattern for the class
    is_exam : bool
        Whether the timetable is an exam timetable
    expire_seconds : int
        Number of seconds until the cache entry expires (default: 1 hour)
    """
    try:
        # Calculate file hash
        file_path = os.path.join("api/drafts", f"{filename}.xlsx")
        with open(file_path, "rb") as f:
            current_hash = hashlib.md5(f.read()).hexdigest()

        cache_key = create_cache_key_from_parameters(filename, class_pattern, is_exam)
        hash_key = f"{cache_key}_hash"

        # Store both data and hash with same expiration
        pipe = r.pipeline()
        pipe.setex(cache_key, expire_seconds, table)
        pipe.setex(hash_key, expire_seconds, current_hash)
        pipe.execute()

    except redis.RedisError as e:
        logger.error(f"Error adding to cache: {e}")
