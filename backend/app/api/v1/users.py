from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import traceback
from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.core.security import get_password_hash
from app.api.v1.auth import get_current_user_dependency

router = APIRouter()

# GET all users (Admin only)
@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get all users - Admin only"""
    try:
        # Check if admin
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can view all users"
            )
        
        users = db.query(User).all()
        print(f"✅ Found {len(users)} users")
        return users
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_all_users: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# GET single user
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get a single user by ID"""
    try:
        # Check if admin or viewing self
        if current_user.role != UserRole.ADMIN and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this user"
            )
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_user: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# POST create new user (Admin only)
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Create a new user - Admin only"""
    try:
        # Check if admin
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can create users"
            )
        
        # Check if email exists
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed_password,
            role=user_data.role or UserRole.VIEWER,
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"✅ User created: {new_user.email}")
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in create_user: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# PUT update user
@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Update a user"""
    try:
        # Check if admin or updating self
        if current_user.role != UserRole.ADMIN and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this user"
            )
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update fields
        if update_data.name is not None:
            user.name = update_data.name
        if update_data.email is not None:
            # Check if email is taken
            existing = db.query(User).filter(
                User.email == update_data.email,
                User.id != user_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already taken"
                )
            user.email = update_data.email
        if update_data.role is not None:
            # Only admin can change roles
            if current_user.role != UserRole.ADMIN:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only admins can change roles"
                )
            user.role = update_data.role
        if update_data.is_active is not None:
            # Only admin can change active status
            if current_user.role != UserRole.ADMIN:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only admins can change active status"
                )
            user.is_active = update_data.is_active
        if update_data.password is not None:
            user.hashed_password = get_password_hash(update_data.password)
        
        db.commit()
        db.refresh(user)
        print(f"✅ User updated: {user.email}")
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in update_user: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# DELETE user (Admin only)
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Delete a user - Admin only"""
    try:
        # Check if admin
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can delete users"
            )
        
        # Prevent deleting self
        if current_user.id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        db.delete(user)
        db.commit()
        print(f"✅ User deleted: {user.email}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in delete_user: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )