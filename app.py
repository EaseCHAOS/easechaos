from fastapi import FastAPI, APIRouter
from api.routes.timetable import router as timetable_router

app = FastAPI()

app_router = APIRouter(prefix="/api/v1")

@app.get("/")
def root():
    return {"Hello": "World"}

app.include_router(router=app_router)
app.include_router(timetable_router, prefix="/api/v1")