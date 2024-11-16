import redis
import os
from dotenv import load_dotenv

load_dotenv()

r = redis.Redis(
    host=os.environ.get("REDIS_HOST"), 
    port=os.environ.get("REDIS_PORT"),
    password=os.environ.get("REDIS_PASSWORD"),
    db=0,
    ssl=True,
)


def create_cache_key_from_parameters(filename: str, class_pattern: str) -> str:
    filename = filename.split(".")[0]  # DRAFT_4
    class_pattern = class_pattern.replace(" ", "")  # EL3

    return f"{filename}-{class_pattern}"


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
    pandas.DataFrame
        The table from the cache.
    """

    return r.get(create_cache_key_from_parameters(filename, class_pattern))


def add_table_to_cache(table: str, filename: str, class_pattern: str):
    """
    Add a table to the cache.

    Parameters
    ----------
    table : pandas.DataFrame
        The table to add to the cache.
    class_pattern : str
        The pattern for the class.
    filename : str
        The name of the file for the timetable.
    """

    r.set(create_cache_key_from_parameters(filename, class_pattern), table)


# def create_cache_key_from_filename(filename: str) -> str:
#     """
#     Create a cache key based on the provided filename.

#     Parameters:
#         filename (str): The name of the file to generate the cache key from.

#     Returns:
#         str: The cache key created from the filename.
#     """

#     return f"{filename}"


# def get_file_from_cache(filename: str) -> bytes | None:
#     """
#     Get a file from the cache.

#     Parameters:
#         filename (str): The name of the file to retrieve from the cache.

#     Returns:
#         bytes | None: The contents of the file if it exists in the cache, or None if it does not.
#     """
#     return r.get(create_cache_key_from_filename(filename))


# def add_file_to_cache(file_content: bytes, filename: str):
#     return r.set(create_cache_key_from_filename(filename), file_content)
