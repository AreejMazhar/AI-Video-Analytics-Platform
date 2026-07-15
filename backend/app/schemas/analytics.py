from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DashboardStats(BaseModel):
    total_cameras: int
    active_cameras: int
    active_models: int
    total_detections: int
    todays_alerts: int
    total_alerts: int
    total_users: int

class RecentEvent(BaseModel):
    id: int
    timestamp: datetime
    camera_name: str
    model_name: str
    detection_type: str
    confidence: float
    is_alert: bool

class CameraHealth(BaseModel):
    id: int
    name: str
    status: str
    uptime: Optional[str] = None
    last_detection: Optional[datetime] = None

class AlertSummary(BaseModel):
    id: int
    timestamp: datetime
    message: str
    severity: str
    camera_name: str
    is_resolved: bool

class ModelPerformance(BaseModel):
    model_name: str
    detection_count: int
    avg_confidence: float
    alert_count: int