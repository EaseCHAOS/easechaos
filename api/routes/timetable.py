import hashlib
import json
import logging
import re
from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from api.config.redis_config import (
    _get_latest_draft,
    add_table_to_cache,
    get_table_from_cache,
)
from api.extract.extract_exam_table import get_exam_timetable
from api.extract.extract_lectures_table import get_time_table

router = APIRouter()


class TimeTableRequest(BaseModel):
    class_pattern: str
    is_exam: bool = False


class HallScheduleRequest(BaseModel):
    hall: str
    date: str | None = None
    period: str | None = None


def get_json_table(request: TimeTableRequest):
    file_path = _get_latest_draft(request.is_exam)
    content = file_path.read_bytes()

    table = get_table_from_cache(request.class_pattern, request.is_exam)

    if table is None:
        if request.is_exam:
            table = get_exam_timetable(content, request.class_pattern).to_json(
                orient="records"
            )
        else:
            table = get_time_table(content, request.class_pattern).to_json(
                orient="records"
            )
        assert table is not None
        add_table_to_cache(table, request.class_pattern, request.is_exam)

    assert table is not None
    return json.loads(table)


def _normalize_hall(hall: str) -> str:
    """Normalize a hall name for matching (case-insensitive, whitespace-insensitive)."""
    return "".join(hall.upper().split())


def _parse_exam_date_label(label: str) -> datetime:
    """Parse a formatted exam date label like 'Monday, 17th August 2026'."""
    cleaned = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", str(label))
    return datetime.strptime(cleaned, "%A, %d %B %Y")


def _period_from_start(start: str) -> str:
    """Map a start time back to a session period code (M/A/E)."""
    if not start:
        return ""
    start_clean = start.strip().upper()
    return {"7:00 AM": "M", "11:00 AM": "A", "3:00 PM": "E"}.get(start_clean, "")


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
def get_time_table_endpoint(request: TimeTableRequest):
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
    content_hash = hashlib.md5(
        _get_latest_draft(request.is_exam).read_bytes()
    ).hexdigest()

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


@router.get("/get_halls")
def get_halls_endpoint():
    """
    Return all distinct lecture halls in the latest exam draft.

    This powers the admin hall-schedule lookup so the hall list is always
    in sync with the current draft.
    """
    content = _get_latest_draft(True).read_bytes()
    table = get_exam_timetable(content, "")
    halls = sorted(
        {
            str(hall).strip()
            for hall in table["LECTURE HALL"].dropna().tolist()
            if str(hall).strip()
        }
    )
    return {"halls": halls}


@router.post("/get_hall_schedule")
def get_hall_schedule_endpoint(request: HallScheduleRequest):
    """
    Admin endpoint: find every class writing in a given lecture hall.

    Returns all exams scheduled in the requested hall, grouped by date.
    Optional filters: date (ISO format, e.g. '2026-08-18') and period (M/A/E).
    """
    content_hash = hashlib.md5(_get_latest_draft(True).read_bytes()).hexdigest()

    normalized = _normalize_hall(request.hall)
    if not normalized:
        raise HTTPException(status_code=400, detail="hall is required")

    # Empty class pattern matches all rows, giving the full exam timetable.
    table = get_exam_timetable(_get_latest_draft(True).read_bytes(), "")

    hall_col = table["LECTURE HALL"].astype(str)
    matches = table[hall_col.map(_normalize_hall) == normalized]

    if matches.empty:
        return {
            "hall": request.hall.strip().upper(),
            "version": content_hash,
            "data": [],
        }

    grouped: dict[str, list[dict]] = defaultdict(list)

    for _, entry in matches.iterrows():
        date_label = str(entry.get("DATE", ""))
        start = entry.get("START", "")
        end = entry.get("END", "")

        try:
            parsed_date = _parse_exam_date_label(date_label)
        except (ValueError, TypeError):
            logger.error(f"Skipping malformed exam date: {date_label}")
            continue

        if request.date:
            request_date = datetime.strptime(request.date, "%Y-%m-%d")
            if request_date.date() != parsed_date.date():
                continue

        if request.period:
            period = _period_from_start(str(start))
            if period != request.period.upper():
                continue

        grouped[date_label].append(
            {
                "course_no": entry.get("COURSE NO", ""),
                "course_name": entry.get("COURSE NAME", ""),
                "class": entry.get("CLASS", ""),
                "start": start,
                "end": end,
                "location": entry.get("LECTURE HALL", ""),
                "invigilator": entry.get("INVIGILATOR (UPDATED)")
                or entry.get("INVIGILATORS")
                or "",
            }
        )

    data = [
        {
            "day": date_label,
            "date": _parse_exam_date_label(date_label).strftime("%Y-%m-%d"),
            "data": sorted(
                rows, key=lambda row: (str(row["start"]), str(row["class"]))
            ),
        }
        for date_label, rows in sorted(
            grouped.items(),
            key=lambda item: _parse_exam_date_label(item[0]),
        )
    ]

    return {
        "hall": request.hall.strip().upper(),
        "version": content_hash,
        "data": data,
    }
