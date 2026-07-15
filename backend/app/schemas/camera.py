from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class CameraBase(BaseModel):
    name: str
    rtsp_url: str
    location: Optional[str] = None
    status: Optional[str] = "offline"
    is_recording: Optional[bool] = False
    confidence_threshold: Optional[float] = 0.5
    assigned_models: Optional[List[int]] = []

class CameraCreate(CameraBase):
    pass

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    rtsp_url: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    is_recording: Optional[bool] = None
    confidence_threshold: Optional[float] = None
    assigned_models: Optional[List[int]] = None

class CameraResponse(CameraBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)