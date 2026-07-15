from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

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
    created_at: datetime  # Keep as datetime
    updated_at: datetime  # Keep as datetime
    
    model_config = ConfigDict(from_attributes=True)  # This handles the conversion