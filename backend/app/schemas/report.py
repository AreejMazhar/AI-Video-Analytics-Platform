from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ReportBase(BaseModel):
    name: str
    report_type: str  # daily, weekly, monthly, custom
    date_range: Optional[dict] = None  # {"start": "2024-01-01", "end": "2024-01-31"}
    format: str  # pdf, excel, csv

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None  # pending, generated, failed
    file_path: Optional[str] = None
    generated_at: Optional[datetime] = None

class ReportResponse(ReportBase):
    id: int
    status: str
    file_path: Optional[str] = None
    generated_at: Optional[datetime] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ReportStats(BaseModel):
    total: int
    generated: int
    pending: int
    failed: int
    total_size: Optional[str] = None