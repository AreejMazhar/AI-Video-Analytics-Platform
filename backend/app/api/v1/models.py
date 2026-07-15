from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import traceback
from app.core.database import get_db
from app.models.ai_model import AIModel
from app.schemas.ai_model import AIModelResponse, AIModelUpdate

router = APIRouter()

@router.get("/", response_model=List[AIModelResponse])
async def get_all_models(db: Session = Depends(get_db)):
    """Get all AI models"""
    try:
        models = db.query(AIModel).all()
        print(f"✅ Found {len(models)} models")
        return models
    except Exception as e:
        print(f"❌ Error in get_all_models: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/enabled", response_model=List[AIModelResponse])
async def get_enabled_models(db: Session = Depends(get_db)):
    """Get only enabled AI models"""
    try:
        models = db.query(AIModel).filter(AIModel.enabled == True).all()
        return models
    except Exception as e:
        print(f"❌ Error in get_enabled_models: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/{model_id}", response_model=AIModelResponse)
async def update_model(model_id: int, update_data: AIModelUpdate, db: Session = Depends(get_db)):
    """Update model settings"""
    try:
        model = db.query(AIModel).filter(AIModel.id == model_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        if update_data.enabled is not None:
            model.enabled = update_data.enabled
        if update_data.confidence_threshold is not None:
            model.confidence_threshold = update_data.confidence_threshold
        if update_data.camera_ids is not None:
            model.camera_ids = update_data.camera_ids
        
        db.commit()
        db.refresh(model)
        return model
    except Exception as e:
        print(f"❌ Error in update_model: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/cameras/{camera_id}", response_model=List[AIModelResponse])
async def get_models_for_camera(camera_id: int, db: Session = Depends(get_db)):
    """Get all enabled models assigned to a specific camera"""
    try:
        models = db.query(AIModel).filter(
            AIModel.enabled == True,
            AIModel.camera_ids.contains([camera_id])
        ).all()
        return models
    except Exception as e:
        print(f"❌ Error in get_models_for_camera: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )