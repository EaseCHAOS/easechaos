import os
import logging

from fastapi import APIRouter
from pydantic import BaseModel
from api.extract.extract_table import get_time_table
import json
from pathlib import Path
import hashlib

from api.config.redis_config import (
    get_table_from_cache,
    add_table_to_cache,
)


# Find the path of the drafts
current_script_path = Path(__file__)
project_root_path = current_script_path.parents[1]
DRAFTS_FOLDER = project_root_path / "drafts"

# Update the project paths

router = APIRouter()


class TimeTableRequest(BaseModel):
    """
    Represents a request for a timetable.

    Attributes:
    - filename (str): The name of the file for the timetable.
    - class_pattern (str): The pattern for the class.
    """

    filename: str
    class_pattern: str   


def get_json_table(request: TimeTableRequest):
    """
    A function to get the time table in JSON format.

    Parameters:
    - request: TimeTableRequest - the request object containing the filename and class pattern

    Returns:
    - dict: a dictionary containing the table in JSON format
    """
    table = get_table_from_cache(request.filename, request.class_pattern)

    if table is None:
        filename = os.path.join(DRAFTS_FOLDER, request.filename)
        table = get_time_table(filename, request.class_pattern).to_json(
            orient="records"
        )
        add_table_to_cache(table, request.filename, request.class_pattern)

    return json.loads(table)


# Set up logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

# Track unique problematic entries

def convert_to_24hour(time_str: str, previous_was_pm: bool = False) -> str:
    """Convert time to 24-hour format based on class schedule rules."""
    if not time_str or not time_str.strip():
        raise ValueError("Time string cannot be empty")
        
    try:
        hours, minutes = map(int, time_str.strip().split(':'))
    except ValueError as e:
        raise e
    
    if not previous_was_pm:
        if 7 <= hours <= 11:
            return f"{hours}:{minutes:02d}"
        elif hours == 12:
            return f"12:{minutes:02d}"
        else:
            return f"{hours + 12}:{minutes:02d}"
    else:
        if hours == 12:
            return f"12:{minutes:02d}"
        elif hours <= 7:
            return f"{hours + 12}:{minutes:02d}"
        return f"{hours}:{minutes:02d}"

@router.post("/get_time_table")
async def get_time_table_endpoint(request: TimeTableRequest):
    """Endpoint for generating a parsed json time table and recording clashes"""
    _ = get_table_from_cache(request.filename, request.class_pattern)
    
    # Generate a hash based on the file content and request parameters
    file_path = os.path.join(DRAFTS_FOLDER, f"{request.filename}.xlsx")
    with open(file_path, "rb") as f:
        content_hash = hashlib.md5(f.read()).hexdigest()
    
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

    json_data = get_json_table(request)
    
    table_data = []
    for index, day in enumerate(json_data):
        day_data = []
        current_slot = None
        previous_was_pm = False
        
        for key, value in day.items():
            if not key or not isinstance(key, str):
                continue
                    
            time_parts = key.split("-")
            if len(time_parts) < 2:
                continue
                    
            start = time_parts[0].strip()
            end = time_parts[-1].strip()
                
            if not start or not end:
                continue
                
            try:
                start_24h = convert_to_24hour(start)
                start_hour = int(start_24h.split(':')[0])
                is_pm = start_hour >= 12
                end_24h = convert_to_24hour(end, previous_was_pm)
                    
                if current_slot and current_slot["value"] == value and current_slot["end"] == start_24h:
                    current_slot["end"] = end_24h
                else:
                    if current_slot:
                        day_data.append(current_slot)
                    current_slot = {"start": start_24h, "end": end_24h, "value": value}
                    
                previous_was_pm = is_pm
            except ValueError as e:
                raise e
                    
        if current_slot:
            day_data.append(current_slot)
            
        table_data.append({"day": days[index], "data": day_data})


    return {
        "data": table_data,
        "version": content_hash,
    }