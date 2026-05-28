from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependency import get_db
from app.models.complaint_model import Complaint
from app.schemas.complaint_schema import ComplaintCreate
from app.services.auth_handler import get_current_user
from fastapi import File, UploadFile
import shutil

router = APIRouter()


@router.post("/complaints")
def create_complaint(
    title: str,
    description: str,
    category: str,
    location: str,
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
   # current_user: str = Depends(get_current_user)
):

    image_path = None

    if image:

        image_path = f"uploads/{image.filename}"

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(
                image.file,
                buffer
            )

    new_complaint = Complaint(
        title=title,
        description=description,
        category=category,
        location=location,
        image=image_path
    )

    db.add(new_complaint)

    db.commit()

    db.refresh(new_complaint)

    return {
        "message": "Complaint created successfully",
        "image": image_path
    }


@router.get("/complaints")
def get_complaints(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):

    complaints = db.query(Complaint).all()

    return complaints


@router.put("/complaints/{complaint_id}")
def update_complaint_status(
    complaint_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        return {
            "message": "Complaint not found"
        }

    complaint.status = status

    db.commit()

    db.refresh(complaint)

    return {
        "message": "Complaint status updated",
        "updated_status": complaint.status
    }


@router.delete("/complaints/{complaint_id}")
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        return {
            "message": "Complaint not found"
        }

    db.delete(complaint)

    db.commit()

    return {
        "message": "Complaint deleted successfully"
    }