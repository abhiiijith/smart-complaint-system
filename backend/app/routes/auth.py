from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.security import hash_password
from app.schemas.user_schema import UserLogin
from app.services.security import verify_password
from app.schemas.user_schema import UserCreate
from app.models.user_model import User
from app.database.dependency import get_db
from app.services.security import create_access_token

router = APIRouter()


@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }
@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        return {
            "message": "User not found"
        }

    if not verify_password(
        user.password,
        existing_user.password
    ):
        return {
            "message": "Invalid password"
        }
    


    token = create_access_token(
    data={"sub": existing_user.email}
    )
    return {
    "access_token": token,
    "token_type": "bearer"
    }


    