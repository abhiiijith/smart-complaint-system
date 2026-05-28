from fastapi import FastAPI
from app.routes import auth
from app.database.db import engine, Base
from app.models import user_model

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)


@app.get("/")
def home():
    return {"message": "Smart Complaint System API Running"}