from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import traceback
from app.core.database import get_db
from app.models.camera import Camera
from app.schemas.camera import CameraCreate, CameraUpdate, CameraResponse

router = APIRouter()

# GET all cameras
@router.get("/", response_model=List[CameraResponse])
async def get_all_cameras(db: Session = Depends(get_db)):
    """Get all cameras"""
    try:
        cameras = db.query(Camera).all()
        print(f"✅ Found {len(cameras)} cameras")
        return cameras
    except Exception as e:
        print(f"❌ Error in get_all_cameras: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# GET single camera by ID
@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(camera_id: int, db: Session = Depends(get_db)):
    """Get a single camera by ID"""
    try:
        camera = db.query(Camera).filter(Camera.id == camera_id).first()
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        return camera
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_camera: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# POST create new camera
@router.post("/", response_model=CameraResponse, status_code=status.HTTP_201_CREATED)
async def create_camera(camera_data: CameraCreate, db: Session = Depends(get_db)):
    """Create a new camera"""
    try:
        # Check if camera with same name exists
        existing = db.query(Camera).filter(Camera.name == camera_data.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Camera with this name already exists")
        
        # Create new camera
        new_camera = Camera(
            name=camera_data.name,
            rtsp_url=camera_data.rtsp_url,
            location=camera_data.location,
            status=camera_data.status or "offline",
            is_recording=camera_data.is_recording or False,
            confidence_threshold=camera_data.confidence_threshold or 0.5,
            assigned_models=camera_data.assigned_models or []
        )
        
        db.add(new_camera)
        db.commit()
        db.refresh(new_camera)
        print(f"✅ Camera created: {new_camera.name}")
        return new_camera
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in create_camera: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# PUT update camera
@router.put("/{camera_id}", response_model=CameraResponse)
async def update_camera(camera_id: int, update_data: CameraUpdate, db: Session = Depends(get_db)):
    """Update a camera"""
    try:
        camera = db.query(Camera).filter(Camera.id == camera_id).first()
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        # Update fields if provided
        if update_data.name is not None:
            camera.name = update_data.name
        if update_data.rtsp_url is not None:
            camera.rtsp_url = update_data.rtsp_url
        if update_data.location is not None:
            camera.location = update_data.location
        if update_data.status is not None:
            camera.status = update_data.status
        if update_data.is_recording is not None:
            camera.is_recording = update_data.is_recording
        if update_data.confidence_threshold is not None:
            camera.confidence_threshold = update_data.confidence_threshold
        if update_data.assigned_models is not None:
            camera.assigned_models = update_data.assigned_models
        
        db.commit()
        db.refresh(camera)
        print(f"✅ Camera updated: {camera.name}")
        return camera
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in update_camera: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# DELETE camera
@router.delete("/{camera_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_camera(camera_id: int, db: Session = Depends(get_db)):
    """Delete a camera"""
    try:
        camera = db.query(Camera).filter(Camera.id == camera_id).first()
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        db.delete(camera)
        db.commit()
        print(f"✅ Camera deleted: {camera.name}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in delete_camera: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )