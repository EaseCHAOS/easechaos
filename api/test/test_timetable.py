from fastapi.testclient import TestClient
from fastapi import FastAPI
from routes.timetable import router as timetable_router, TimeTableRequest
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
    return mocker.patch("extract.extract_table.get_time_table")

def test_get_time_table_endpoint(mock_get_table_from_cache, mock_add_table_to_cache, mock_get_time_table):
    # Arrange
    request = TimeTableRequest(filename="test.xlsx", class_pattern="class1")
    mock_get_table_from_cache.return_value = None
    mock_get_time_table.return_value.to_json.return_value = '{"column1": "value1"}'

    # Act
    response = client.post("/get_time_table", json=request.dict())

    # Assert
    assert response.status_code == 200
    assert response.json() == {"column1": "value1"}
    mock_get_table_from_cache.assert_called_once_with("class1", "test.xlsx")
    mock_add_table_to_cache.assert_called_once_with(table='{"column1": "value1"}', class_pattern="class1", filename="test.xlsx")