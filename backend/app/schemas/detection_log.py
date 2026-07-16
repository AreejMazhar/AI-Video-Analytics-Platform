from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class DetectionLogBase(BaseModel):
    camera_id: Optional[int] = None
    model_name: str
    detection_type: str
    confidence: float
    bbox: Optional[List[int]] = None
    snapshot_path: Optional[str] = None
    extra_data: Optional[dict] = {}
    is_alert: bool = False

class DetectionLogCreate(DetectionLogBase):
    pass

class DetectionLogResponse(DetectionLogBase):
    id: int
    timestamp: datetime
    camera_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class DetectionLogFilter(BaseModel):
    search: Optional[str] = None
    status: Optional[str] = None  # matched, unknown, detected, alert
    model_name: Optional[str] = None
    camera_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class PaginatedResponse(BaseModel):
    items: List[DetectionLogResponse]
    total: int
    page: int
    pages: int
    per_page: int