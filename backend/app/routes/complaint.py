from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
    Form,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.dependency import (
    get_db,
    get_current_user
)

from app.models.complaint_model import Complaint
from app.models.user_model import User

import shutil


router = APIRouter()


# =========================
# CREATE COMPLAINT
# =========================

@router.post("/complaints")
def create_complaint(

    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    location: str = Form(...),

    image: UploadFile = File(None),

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)
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


# =========================
# GET ALL COMPLAINTS
# =========================

@router.get("/complaints")
def get_complaints(

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)
):

    complaints = db.query(Complaint).all()

    return complaints


# =========================
# UPDATE COMPLAINT STATUS
# =========================

@router.put("/complaints/{complaint_id}")
def update_complaint_status(

    complaint_id: int,

    status: str,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)
):

    # ONLY OPERATOR CAN UPDATE

    if current_user.role != "operator":

        raise HTTPException(

            status_code=403,

            detail="Only operators can update complaint status"
        )

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


# =========================
# DELETE COMPLAINT
# =========================

@router.delete("/complaints/{complaint_id}")
def delete_complaint(

    complaint_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)
):

    # ONLY OPERATOR CAN DELETE

    if current_user.role != "operator":

        raise HTTPException(

            status_code=403,

            detail="Only operators can delete complaints"
        )

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