from fastapi import FastAPI
from app.routes import auth
from app.database.db import engine, Base
from app.models import user_model
from app.routes import complaint
from app.models import complaint_model
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.include_router(auth.router)
app.include_router(complaint.router)


@app.get("/")
def home():
    return {"message": "Smart Complaint System API Running"}