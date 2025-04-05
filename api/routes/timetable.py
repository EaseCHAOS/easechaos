import os
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from api.extract.extract_lectures_table import get_time_table
from api.extract.extract_exam_table import get_exam_timetable
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

router = APIRouter()

class TimeTableRequest(BaseModel):
    """
    Represents a request for a timetable (lecture or exam).

    Attributes:
    - filename (str): The name of the file for the timetable (without extension).
    - class_pattern (str): The pattern for the class.
    - is_exam (bool): Whether to process as exam timetable (default: False)
    """
    filename: str
    class_pattern: str
    is_exam: bool = False

def get_json_table(request: TimeTableRequest):
    """
    Get the timetable in JSON format (either lecture or exam).

    Parameters:
    - request: TimeTableRequest - the request object containing filename, class pattern, and type

    Returns:
    - dict: a dictionary containing the table in JSON format
    """
    # Use is_exam in cache key
    table = get_table_from_cache(request.filename, request.class_pattern, request.is_exam)

    if table is None:
        # Append .xlsx extension if not provided
        filename = request.filename
        if not filename.endswith('.xlsx'):
            filename += '.xlsx'
        full_path = os.path.join(DRAFTS_FOLDER, filename)

        if not os.path.exists(full_path):
            raise FileNotFoundError(f"Timetable file not found: {full_path}")

        if request.is_exam:
            table = get_exam_timetable(full_path, request.class_pattern).to_json(orient="records")
        else:
            table = get_time_table(full_path, request.class_pattern).to_json(orient="records")
        add_table_to_cache(table, request.filename, request.class_pattern, request.is_exam)

    return json.loads(table)

# Set up logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

def convert_to_24hour(time_str: str, previous_was_pm: bool = False) -> str:
    """Convert time to 24-hour format based on class schedule rules."""
    if not time_str or not time_str.strip():
        raise ValueError("Time string cannot be empty")

    try:
        # Handle AM/PM suffixes
        time_str = time_str.strip().upper()
        is_pm = 'PM' in time_str
        time_clean = time_str.replace('AM', '').replace('PM', '').strip()
        hours, minutes = map(int, time_clean.split(':'))

        if is_pm and hours != 12:
            hours += 12
        elif not is_pm and hours == 12:
            hours = 0

        return f"{hours:02d}:{minutes:02d}"
    except ValueError as e:
        logger.error(f"Error converting time: {time_str} - {e}")
        raise

@router.post("/get_time_table")
async def get_time_table_endpoint(request: TimeTableRequest):
    """Endpoint for generating a parsed JSON timetable (lecture or exam) and recording clashes"""
    # Use is_exam in cache check
    _ = get_table_from_cache(request.filename, request.class_pattern, request.is_exam)

    # Generate a hash based on the file content
    filename = request.filename
    if not filename.endswith('.xlsx'):
        filename += '.xlsx'
    file_path = os.path.join(DRAFTS_FOLDER, filename)

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Timetable file not found: {file_path}")

    with open(file_path, "rb") as f:
        content_hash = hashlib.md5(f.read()).hexdigest()

    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    json_data = get_json_table(request)

    if request.is_exam:
        table_data = []
        for entry in json_data:
            date = entry.get('DATE')
            if not date:
                continue

            try:
                start_24h = convert_to_24hour(entry.get('START', ''))
                end_24h = convert_to_24hour(entry.get('END', ''))
            except ValueError as e:
                logger.error(f"Invalid time format in exam entry: {entry} - {e}")
                continue


            table_data.append({
                "day": date,
                "data": [{
                    "start": start_24h,
                    "end": end_24h,
                    "value": entry.get('COURSE NAME', ''),
                    "class": entry.get('CLASS', ''),
                    "location": entry.get('LECTURE HALL', ''),
                    "invigilator": entry.get('INVIGILATOR (UPDATED)', '')
                }]
            })
    else:
        # Process lecture timetable
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
                    logger.error(f"Error processing lecture time slot {key}: {e}")
                    continue

            if current_slot:
                day_data.append(current_slot)

            table_data.append({"day": days[index], "data": day_data})

    return {
        "data": table_data,
        "version": content_hash,
    }
