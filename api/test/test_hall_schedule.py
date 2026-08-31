from datetime import datetime

import pytest
from api.routes.timetable import (
    _normalize_hall,
    _parse_exam_date_label,
    _period_from_start,
    get_hall_schedule_endpoint,
    get_halls_endpoint,
    HallScheduleRequest,
)


class TestNormalizeHall:
    def test_strips_and_uppercases(self):
        assert _normalize_hall("ff 1") == "FF1"

    def test_handles_variant_spacing(self):
        assert _normalize_hall("FF  1") == "FF1"
        assert _normalize_hall("FF1") == "FF1"

    def test_empty_string(self):
        assert _normalize_hall("") == ""


class TestParseExamDateLabel:
    def test_parses_ordinal_day(self):
        result = _parse_exam_date_label("Monday, 17th August 2026")
        assert result == datetime(2026, 8, 17)

    def test_parses_st_nd_rd(self):
        assert _parse_exam_date_label("Tuesday, 1st September 2026") == datetime(
            2026, 9, 1
        )
        assert _parse_exam_date_label("Wednesday, 2nd September 2026") == datetime(
            2026, 9, 2
        )
        assert _parse_exam_date_label("Thursday, 3rd September 2026") == datetime(
            2026, 9, 3
        )

    def test_raises_on_garbage(self):
        with pytest.raises(ValueError):
            _parse_exam_date_label("not a date")


class TestPeriodFromStart:
    def test_maps_morning_afternoon_evening(self):
        assert _period_from_start("7:00 AM") == "M"
        assert _period_from_start("11:00 AM") == "A"
        assert _period_from_start("3:00 PM") == "E"

    def test_empty_and_unknown(self):
        assert _period_from_start("") == ""
        assert _period_from_start("9:00 PM") == ""


def _build_exam_xlsx(tmp_path):
    import openpyxl

    wb = openpyxl.Workbook()
    ws = wb.active
    assert ws is not None
    ws.append(["DATE", "COURSE NO", "COURSE NAME", "CLASS", "LECTURE HALL", "PERIOD"])
    ws.append([45000, "CE 472", "Control Systems", "CE 4B", "FF 1", "M"])
    ws.append([45001, "LA 256", "Critical Thinking", "LA 2B", "FF 1", "A"])
    ws.append([45001, "CE 256", "Critical Thinking", "CE 2B", "FF1", "E"])
    ws.append([45001, "CH 256", "Critical Thinking", "CH 2A", "FI A2", "M"])
    xlsx = tmp_path / "exam.xlsx"
    wb.save(xlsx)
    return xlsx


class TestGetHallsEndpoint:
    def test_returns_distinct_halls(self, mocker, tmp_path):
        mocker.patch("api.routes.timetable._get_latest_draft")
        from api.routes import timetable as t

        t._get_latest_draft.return_value = _build_exam_xlsx(tmp_path)

        result = get_halls_endpoint()
        assert "FF 1" in result["halls"]
        assert "FF1" not in result["halls"] or "FF 1" in result["halls"]
        assert "FI A2" in result["halls"]


class TestGetHallScheduleEndpoint:
    def test_returns_all_classes_in_hall(self, mocker, tmp_path):
        from api.routes import timetable as t

        mocker.patch.object(t, "_get_latest_draft", return_value=_build_exam_xlsx(tmp_path))

        result = get_hall_schedule_endpoint(
            HallScheduleRequest(hall="FF 1")
        )

        assert result["hall"] == "FF 1"
        assert len(result["data"]) == 2

        day1 = next(d for d in result["data"] if d["date"] == "2023-03-15")
        assert [e["class"] for e in day1["data"]] == ["CE 4B"]
        assert day1["data"][0]["course_no"] == "CE 472"
        assert day1["data"][0]["start"] == "7:00 AM"

        day2 = next(d for d in result["data"] if d["date"] == "2023-03-16")
        assert {e["class"] for e in day2["data"]} == {"LA 2B", "CE 2B"}

    def test_filters_by_period(self, mocker, tmp_path):
        from api.routes import timetable as t

        mocker.patch.object(t, "_get_latest_draft", return_value=_build_exam_xlsx(tmp_path))

        result = get_hall_schedule_endpoint(
            HallScheduleRequest(hall="FF 1", period="M")
        )
        assert len(result["data"]) == 1
        assert result["data"][0]["data"][0]["class"] == "CE 4B"

    def test_returns_empty_for_unknown_hall(self, mocker, tmp_path):
        from api.routes import timetable as t

        mocker.patch.object(t, "_get_latest_draft", return_value=_build_exam_xlsx(tmp_path))

        result = get_hall_schedule_endpoint(
            HallScheduleRequest(hall="ZZ 9")
        )
        assert result["data"] == []

    def test_rejects_empty_hall(self, mocker, tmp_path):
        from api.routes import timetable as t

        mocker.patch.object(t, "_get_latest_draft", return_value=_build_exam_xlsx(tmp_path))

        with pytest.raises(Exception) as exc_info:
            get_hall_schedule_endpoint(HallScheduleRequest(hall="   "))
        assert exc_info.value.status_code == 400

    def test_normalizes_variant_hall_spelling(self, mocker, tmp_path):
        from api.routes import timetable as t

        mocker.patch.object(t, "_get_latest_draft", return_value=_build_exam_xlsx(tmp_path))

        result = get_hall_schedule_endpoint(HallScheduleRequest(hall="ff1"))
        classes = {
            e["class"]
            for day in result["data"]
            for e in day["data"]
        }
        assert "CE 4B" in classes
        assert "LA 2B" in classes
        assert "CE 2B" in classes
