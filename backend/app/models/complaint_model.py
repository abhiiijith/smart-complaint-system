from sqlalchemy import Column, Integer, String
from app.database.db import Base


class Complaint(Base):

    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String)

    description = Column(String)

    category = Column(String)

    location = Column(String)

    status = Column(String, default="Pending")