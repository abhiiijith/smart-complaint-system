from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependency import get_db
from app.models.complaint_model import Complaint
from app.schemas.complaint_schema import ComplaintCreate

router = APIRouter()


@router.post("/complaints")
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db)
):

    new_complaint = Complaint(
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        location=complaint.location
    )

    db.add(new_complaint)

    db.commit()

    db.refresh(new_complaint)

    return {
        "message": "Complaint created successfully"
    }


@router.get("/complaints")
def get_complaints(
    db: Session = Depends(get_db)
):

    complaints = db.query(Complaint).all()

    return complaints


@router.put("/complaints/{complaint_id}")
def update_complaint_status(
    complaint_id: int,
    status: str,
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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