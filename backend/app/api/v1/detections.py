from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from typing import List, Optional
import traceback
import csv
import io
from datetime import datetime, timedelta
from fastapi.responses import StreamingResponse
from app.core.database import get_db
from app.models.detection_log import DetectionLog
from app.models.camera import Camera
from app.models.user import User
from app.schemas.detection_log import DetectionLogResponse, DetectionLogFilter, PaginatedResponse
from app.api.v1.auth import get_current_user_dependency

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_detections(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    model_name: Optional[str] = None,
    camera_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get paginated detection logs with filters"""
    try:
        # Build query
        query = db.query(DetectionLog)
        
        # Apply filters
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    DetectionLog.detection_type.ilike(search_term),
                    DetectionLog.model_name.ilike(search_term)
                )
            )
        
        if status:
            if status == "alert":
                query = query.filter(DetectionLog.is_alert == True)
            elif status == "matched":
                query = query.filter(DetectionLog.detection_type == "face")
            elif status == "unknown":
                query = query.filter(DetectionLog.detection_type == "unknown")
            elif status == "detected":
                query = query.filter(DetectionLog.is_alert == False)
        
        if model_name:
            query = query.filter(DetectionLog.model_name == model_name)
        
        if camera_id:
            query = query.filter(DetectionLog.camera_id == camera_id)
        
        if start_date:
            try:
                start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                query = query.filter(DetectionLog.timestamp >= start)
            except:
                pass
        
        if end_date:
            try:
                end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                query = query.filter(DetectionLog.timestamp <= end)
            except:
                pass
        
        # Get total count
        total = query.count()
        
        # Get paginated results
        offset = (page - 1) * per_page
        detections = query.order_by(
            DetectionLog.timestamp.desc()
        ).offset(offset).limit(per_page).all()
        
        # Get camera names
        camera_ids = list(set([d.camera_id for d in detections if d.camera_id]))
        cameras = {}
        if camera_ids:
            camera_query = db.query(Camera).filter(Camera.id.in_(camera_ids)).all()
            cameras = {c.id: c.name for c in camera_query}
        
        # Build response
        items = []
        for detection in detections:
            items.append(DetectionLogResponse(
                id=detection.id,
                timestamp=detection.timestamp,
                camera_id=detection.camera_id,
                camera_name=cameras.get(detection.camera_id, "Unknown"),
                model_name=detection.model_name,
                detection_type=detection.detection_type,
                confidence=detection.confidence,
                bbox=detection.bbox,
                snapshot_path=detection.snapshot_path,
                extra_data=detection.extra_data,
                is_alert=detection.is_alert
            ))
        
        # Calculate pages
        pages = (total + per_page - 1) // per_page if total > 0 else 1
        
        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            pages=pages,
            per_page=per_page
        )
    except Exception as e:
        print(f"❌ Error in get_detections: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/export")
async def export_detections_csv(
    search: Optional[str] = None,
    status: Optional[str] = None,
    model_name: Optional[str] = None,
    camera_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 1000,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Export detection logs as CSV"""
    try:
        # Build query (same filters as above)
        query = db.query(DetectionLog)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    DetectionLog.detection_type.ilike(search_term),
                    DetectionLog.model_name.ilike(search_term)
                )
            )
        
        if status:
            if status == "alert":
                query = query.filter(DetectionLog.is_alert == True)
            elif status == "matched":
                query = query.filter(DetectionLog.detection_type == "face")
            elif status == "unknown":
                query = query.filter(DetectionLog.detection_type == "unknown")
            elif status == "detected":
                query = query.filter(DetectionLog.is_alert == False)
        
        if model_name:
            query = query.filter(DetectionLog.model_name == model_name)
        
        if camera_id:
            query = query.filter(DetectionLog.camera_id == camera_id)
        
        if start_date:
            try:
                start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                query = query.filter(DetectionLog.timestamp >= start)
            except:
                pass
        
        if end_date:
            try:
                end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                query = query.filter(DetectionLog.timestamp <= end)
            except:
                pass
        
        detections = query.order_by(
            DetectionLog.timestamp.desc()
        ).limit(limit).all()
        
        # Get camera names
        camera_ids = list(set([d.camera_id for d in detections if d.camera_id]))
        cameras = {}
        if camera_ids:
            camera_query = db.query(Camera).filter(Camera.id.in_(camera_ids)).all()
            cameras = {c.id: c.name for c in camera_query}
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow([
            'ID', 'Timestamp', 'Camera', 'Model', 'Detection Type', 
            'Confidence', 'Is Alert', 'BBox'
        ])
        
        for detection in detections:
            camera_name = cameras.get(detection.camera_id, "Unknown")
            writer.writerow([
                detection.id,
                detection.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                camera_name,
                detection.model_name,
                detection.detection_type,
                f"{detection.confidence:.2f}",
                "Yes" if detection.is_alert else "No",
                str(detection.bbox) if detection.bbox else ""
            ])
        
        output.seek(0)
        filename = f"detection_logs_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        print(f"❌ Error in export_detections_csv: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/stats")
async def get_detection_stats(
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get detection statistics"""
    try:
        total = db.query(DetectionLog).count()
        alerts = db.query(DetectionLog).filter(DetectionLog.is_alert == True).count()
        today = datetime.utcnow().date()
        today_count = db.query(DetectionLog).filter(
            func.date(DetectionLog.timestamp) == today
        ).count()
        
        return {
            "total": total,
            "alerts": alerts,
            "today": today_count,
            "alert_percentage": round((alerts / total * 100) if total > 0 else 0, 2)
        }
    except Exception as e:
        print(f"❌ Error in get_detection_stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )