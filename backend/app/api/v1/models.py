from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.ai_model import AIModel
from app.schemas.ai_model import AIModelResponse, AIModelUpdate

router = APIRouter()

@router.get("/", response_model=List[AIModelResponse])
async def get_all_models(db: Session = Depends(get_db)):
    """Get all AI models"""
    models = db.query(AIModel).all()
    return models

@router.get("/enabled", response_model=List[AIModelResponse])
async def get_enabled_models(db: Session = Depends(get_db)):
    """Get only enabled AI models"""
    models = db.query(AIModel).filter(AIModel.enabled == True).all()
    return models

@router.put("/{model_id}", response_model=AIModelResponse)
async def update_model(model_id: int, update_data: AIModelUpdate, db: Session = Depends(get_db)):
    """Update model settings (enabled, threshold, camera assignment)"""
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Update fields
    if update_data.enabled is not None:
        model.enabled = update_data.enabled
    if update_data.confidence_threshold is not None:
        model.confidence_threshold = update_data.confidence_threshold
    if update_data.camera_ids is not None:
        model.camera_ids = update_data.camera_ids
    
    db.commit()
    db.refresh(model)
    return model

@router.get("/cameras/{camera_id}", response_model=List[AIModelResponse])
async def get_models_for_camera(camera_id: int, db: Session = Depends(get_db)):
    """Get all enabled models assigned to a specific camera"""
    models = db.query(AIModel).filter(
        AIModel.enabled == True,
        AIModel.camera_ids.contains([camera_id])
    ).all()
    return models