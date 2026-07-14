from pydantic import BaseModel
from typing import Optional, List

class AIModelBase(BaseModel):
    name: str
    enabled: bool = False
    mode: str = "video"
    confidence_threshold: float = 0.5
    camera_ids: Optional[List[int]] = []
    description: Optional[str] = None
    icon: Optional[str] = None

class AIModelCreate(AIModelBase):
    pass

class AIModelUpdate(BaseModel):
    enabled: Optional[bool] = None
    confidence_threshold: Optional[float] = None
    camera_ids: Optional[List[int]] = None

class AIModelResponse(AIModelBase):
    id: int
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True