from fastapi import FastAPI
from app.routes import auth
from app.database.db import engine, Base
from app.models import user_model
from app.routes import complaint
from app.models import complaint_model
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)

app = FastAPI()

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