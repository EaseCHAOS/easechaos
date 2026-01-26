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

current_script_path = Path(__file__)
project_root_path = current_script_path.parents[1]
DRAFTS_FOLDER = project_root_path / "drafts"

router = APIRouter()


class TimeTableRequest(BaseModel):
    """
    Represents a request for a timetable (lecture or exam).
    """

    filename: str
    class_pattern: str
    is_exam: bool = False


def get_json_table(request: TimeTableRequest):
    """
    Get the timetable in JSON format (either lecture or exam) with caching.

    This function implements a caching strategy to improve performance:
    1. Check Redis cache first using filename, class pattern, and exam flag as key
    2. If cache miss, process Excel file and store result in cache
    3. Return parsed JSON data for API response

    Args:
        request: TimeTableRequest containing filename, class_pattern, and is_exam flag

    Returns:
        Parsed JSON data from Excel file or cache

    Raises:
        FileNotFoundError: If Excel file doesn't exist in drafts folder
    """
    # Normalize filename once here to ensure consistency
    base_filename = request.filename.replace(".xlsx", "")  # Strip any .xlsx
    filename = f"{base_filename}.xlsx"  # Add it back once

    # Check cache first for performance
    table = get_table_from_cache(base_filename, request.class_pattern, request.is_exam)

    if table is None:
        # Cache miss - process Excel file
        full_path = os.path.join(DRAFTS_FOLDER, filename)
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"Timetable file not found: {full_path}")

        # Process based on timetable type
        if request.is_exam:
            table = get_exam_timetable(full_path, request.class_pattern).to_json(
                orient="records"
            )
        else:
            table = get_time_table(full_path, request.class_pattern).to_json(
                orient="records"
            )

        # Store in cache for future requests
        add_table_to_cache(table, base_filename, request.class_pattern, request.is_exam)

    return json.loads(table)


logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)


def lectures_convert_to_24hour(time_str: str, previous_was_pm: bool = False) -> str:
    """
    Convert lecture time to 24-hour format based on class schedule rules.

    Lecture timetables don't use AM/PM markers, so we infer based on context:
    - 7:00-11:59 are morning (no conversion needed)
    - 12:00 is noon (no conversion needed)
    - 1:00-6:59 are afternoon (add 12 hours)
    - If previous slot was PM, current slot might be morning continuation

    Args:
        time_str: Time string in format "HH:MM"
        previous_was_pm: Whether the previous time slot was in PM

    Returns:
        Time string in 24-hour format "HH:MM"

    Raises:
        ValueError: If time string is empty or malformed
    """
    if not time_str or not time_str.strip():
        raise ValueError("Time string cannot be empty")

    try:
        hours, minutes = map(int, time_str.strip().split(":"))
    except ValueError as e:
        raise e

    if not previous_was_pm:
        # Morning hours (7:00-11:59) stay the same
        if 7 <= hours <= 11:
            return f"{hours}:{minutes:02d}"
        # Noon stays the same
        elif hours == 12:
            return f"12:{minutes:02d}"
        # Afternoon hours (1:00-6:59) convert to PM
        else:
            return f"{hours + 12}:{minutes:02d}"
    else:
        # If previous was PM, this might be a morning continuation
        if hours == 12:
            return f"12:{minutes:02d}"
        elif hours <= 7:
            return f"{hours + 12}:{minutes:02d}"
        return f"{hours}:{minutes:02d}"


def exams_convert_to_24hour(time_str: str, previous_was_pm: bool = False) -> str:
    """
    Convert exam time to 24-hour format with explicit AM/PM markers.

    Exam timetables include explicit AM/PM markers, so conversion is straightforward:
    - AM times: 12:00 AM → 00:00, other AM times stay the same
    - PM times: Add 12 hours (except 12:00 PM)

    Args:
        time_str: Time string with AM/PM marker (e.g., "9:00 AM", "2:00 PM")
        previous_was_pm: Unused parameter for API consistency

    Returns:
        Time string in 24-hour format "HH:MM"

    Raises:
        ValueError: If time string is empty or malformed
    """
    if not time_str or not time_str.strip():
        raise ValueError("Time string cannot be empty")

    try:
        time_str = time_str.strip().upper()
        is_pm = "PM" in time_str
        time_clean = time_str.replace("AM", "").replace("PM", "").strip()
        hours, minutes = map(int, time_clean.split(":"))

        # Convert to 24-hour format
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
    """
    Main endpoint for generating parsed JSON timetable (lecture or exam).

    This endpoint processes Excel timetable files and returns structured JSON data.
    It implements file change detection via content hashing and supports both
    lecture and exam timetable formats.

    Args:
        request: TimeTableRequest with filename, class_pattern, and is_exam flag

    Returns:
        Dictionary containing:
        - data: Structured timetable information
        - version: MD5 hash of source file for change detection

    Raises:
        FileNotFoundError: If Excel file doesn't exist
    """
    # Normalize filename for consistency
    base_filename = request.filename.replace(".xlsx", "")
    filename = f"{base_filename}.xlsx"

    # Pre-check cache to trigger file processing if needed
    _ = get_table_from_cache(base_filename, request.class_pattern, request.is_exam)

    # Generate content hash for version tracking and change detection
    file_path = os.path.join(DRAFTS_FOLDER, filename)
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Timetable file not found: {file_path}")

    with open(file_path, "rb") as f:
        content_hash = hashlib.md5(f.read()).hexdigest()

    # Get processed JSON data
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    json_data = get_json_table(request)

    if request.is_exam:
        table_data = []
        for entry in json_data:
            date = entry.get("DATE")
            if not date:
                continue

            try:
                start_24h = exams_convert_to_24hour(entry.get("START", ""))
                end_24h = exams_convert_to_24hour(entry.get("END", ""))
            except ValueError as e:
                logger.error(f"Invalid time format in exam entry: {entry} - {e}")
                continue

            table_data.append(
                {
                    "day": date,
                    "data": [
                        {
                            "start": start_24h,
                            "end": end_24h,
                            "value": entry.get("COURSE NAME", ""),
                            "class": entry.get("CLASS", ""),
                            "location": entry.get("LECTURE HALL", ""),
                            "invigilator": entry.get("INVIGILATOR (UPDATED)", ""),
                        }
                    ],
                }
            )
    else:
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
                    start_24h = lectures_convert_to_24hour(start)
                    start_hour = int(start_24h.split(":")[0])
                    is_pm = start_hour >= 12
                    end_24h = lectures_convert_to_24hour(end, previous_was_pm)

                    if (
                        current_slot
                        and current_slot["value"] == value
                        and current_slot["end"] == start_24h
                    ):
                        current_slot["end"] = end_24h
                    else:
                        if current_slot:
                            day_data.append(current_slot)
                        current_slot = {
                            "start": start_24h,
                            "end": end_24h,
                            "value": value,
                        }

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
