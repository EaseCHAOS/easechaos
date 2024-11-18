import redis
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
import logging

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

def create_cache_key_from_parameters(filename: str, class_pattern: str) -> str:
    """Generate a consistent cache key."""     
    return f"{filename}-{class_pattern.replace(' ', '')}"


def get_table_from_cache(filename: str, class_pattern: str) -> str | None:
    """
    Get a table from the cache.

    Parameters
    ----------
    class_pattern : str
        The pattern for the class.
    filename : str
        The name of the file for the timetable

    Returns
    -------
    str | None
        The table string from the cache or None if not found.
    """
    try:
        return r.get(create_cache_key_from_parameters(filename, class_pattern))
    except redis.RedisError as e:
        logger.error(f"Error retrieving from cache: {e}")
        return None


def add_table_to_cache(table: str, filename: str, class_pattern: str, expire_seconds: int = 3600):
    """
    Add a table to the cache.

    Parameters
    ----------
    table : str
        The table string to add to the cache.
    class_pattern : str
        The pattern for the class.
    filename : str
        The name of the file for the timetable.
    expire_seconds : int
        Number of seconds until the cache entry expires (default: 1 hour)
    """
    try:
        r.setex(
            create_cache_key_from_parameters(filename, class_pattern),
            expire_seconds,
            table
        )
    except redis.RedisError as e:
        logger.error(f"Error adding to cache: {e}")
