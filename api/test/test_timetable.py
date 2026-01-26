from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.routes.timetable import router as timetable_router, TimeTableRequest
import pytest

app = FastAPI()
app.include_router(timetable_router)

client = TestClient(app)


@pytest.fixture
def mock_get_table_from_cache(mocker):
    return mocker.patch("api.config.redis_config.get_table_from_cache")


@pytest.fixture
def mock_add_table_to_cache(mocker):
    return mocker.patch("api.config.redis_config.add_table_to_cache")


@pytest.fixture
def mock_get_time_table(mocker):
    """Mock lecture timetable extraction function."""
    return mocker.patch("api.extract.extract_lectures_table.get_time_table")


@pytest.fixture
def mock_get_exam_timetable(mocker):
    """Mock exam timetable extraction function."""
    return mocker.patch("api.extract.extract_exam_table.get_exam_timetable")


def test_get_lecture_time_table_endpoint(
    mock_get_table_from_cache, mock_add_table_to_cache, mock_get_time_table
):
    """Test lecture timetable endpoint with cache miss."""
    # Arrange
    request = TimeTableRequest(
        filename="test.xlsx", class_pattern="MECH 3", is_exam=False
    )
    mock_get_table_from_cache.return_value = None
    mock_get_time_table.return_value.to_json.return_value = (
        '[{"day": "Monday", "data": []}]'
    )

    # Act
    response = client.post("/get_time_table", json=request.dict())

    # Assert
    assert response.status_code == 200
    assert "data" in response.json()
    assert "version" in response.json()
    mock_get_table_from_cache.assert_called_once_with("test", "MECH 3", False)
    mock_add_table_to_cache.assert_called_once_with(
        table='[{"day": "Monday", "data": []}]',
        filename="test",
        class_pattern="MECH 3",
        is_exam=False,
    )


def test_get_exam_time_table_endpoint(
    mock_get_table_from_cache, mock_add_table_to_cache, mock_get_exam_timetable
):
    """Test exam timetable endpoint with cache miss."""
    # Arrange
    request = TimeTableRequest(
        filename="exam_test.xlsx", class_pattern="CE 4", is_exam=True
    )
    mock_get_table_from_cache.return_value = None
    mock_get_exam_timetable.return_value.to_json.return_value = (
        '[{"DATE": "2024-01-15", "COURSE": "MATH 301"}]'
    )

    # Act
    response = client.post("/get_time_table", json=request.dict())

    # Assert
    assert response.status_code == 200
    assert "data" in response.json()
    assert "version" in response.json()
    mock_get_table_from_cache.assert_called_once_with("exam_test", "CE 4", True)
    mock_add_table_to_cache.assert_called_once_with(
        table='[{"DATE": "2024-01-15", "COURSE": "MATH 301"}]',
        filename="exam_test",
        class_pattern="CE 4",
        is_exam=True,
    )


def test_get_time_table_cache_hit(mock_get_table_from_cache, mock_add_table_to_cache):
    """Test timetable endpoint with cache hit."""
    # Arrange
    request = TimeTableRequest(
        filename="cached.xlsx", class_pattern="EL 3", is_exam=False
    )
    mock_get_table_from_cache.return_value = '[{"day": "Monday", "data": []}]'

    # Act
    response = client.post("/get_time_table", json=request.dict())

    # Assert
    assert response.status_code == 200
    assert "data" in response.json()
    mock_get_table_from_cache.assert_called_once_with("cached", "EL 3", False)
    # Cache add should not be called on hit
    mock_add_table_to_cache.assert_not_called()


def test_get_time_table_file_not_found(mock_get_table_from_cache):
    """Test timetable endpoint with missing file."""
    # Arrange
    request = TimeTableRequest(
        filename="missing.xlsx", class_pattern="COMP 2", is_exam=False
    )
    mock_get_table_from_cache.return_value = None

    # Act
    response = client.post("/get_time_table", json=request.dict())

    # Assert
    assert response.status_code == 404
    assert "Timetable file not found" in response.json()["detail"]
