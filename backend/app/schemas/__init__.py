from app.schemas.user import UserBase, UserCreate, UserLogin, UserResponse, Token, UserUpdate
from app.schemas.ai_model import AIModelBase, AIModelCreate, AIModelUpdate, AIModelResponse
from app.schemas.camera import CameraBase, CameraCreate, CameraUpdate, CameraResponse
from app.schemas.analytics import DashboardStats, RecentEvent, CameraHealth, AlertSummary, ModelPerformance
from app.schemas.detection_log import DetectionLogBase, DetectionLogCreate, DetectionLogResponse, DetectionLogFilter, PaginatedResponse
from app.schemas.report import ReportBase, ReportCreate, ReportUpdate, ReportResponse, ReportStats