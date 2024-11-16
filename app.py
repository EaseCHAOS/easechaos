from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from api.routes.timetable import router as timetable_router

app = FastAPI()

app_router = APIRouter(prefix="/api/v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"Hello": "World"}

app.include_router(router=app_router)
app.include_router(timetable_router, prefix="/api/v1")