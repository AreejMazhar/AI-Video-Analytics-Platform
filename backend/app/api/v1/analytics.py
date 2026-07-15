from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime, timedelta
import traceback
import csv
import io
from fastapi.responses import StreamingResponse
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.camera import Camera
from app.models.ai_model import AIModel
from app.models.detection_log import DetectionLog
from app.models.alert import Alert
from app.models.user import User
from app.schemas.analytics import DashboardStats, RecentEvent, CameraHealth, AlertSummary, ModelPerformance

router = APIRouter()

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get all dashboard statistics"""
    try:
        # Count cameras
        total_cameras = db.query(Camera).count()
        active_cameras = db.query(Camera).filter(Camera.status == "online").count()
        
        # Count active AI models
        active_models = db.query(AIModel).filter(AIModel.enabled == True).count()
        
        # Count total detections
        total_detections = db.query(DetectionLog).count()
        
        # Count today's alerts
        today = datetime.utcnow().date()
        todays_alerts = db.query(Alert).filter(
            func.date(Alert.timestamp) == today
        ).count()
        
        # Count total alerts
        total_alerts = db.query(Alert).count()
        
        # Count total users
        total_users = db.query(User).count()
        
        return DashboardStats(
            total_cameras=total_cameras,
            active_cameras=active_cameras,
            active_models=active_models,
            total_detections=total_detections,
            todays_alerts=todays_alerts,
            total_alerts=total_alerts,
            total_users=total_users
        )
    except Exception as e:
        print(f"❌ Error in get_dashboard_stats: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/dashboard/events", response_model=List[RecentEvent])
async def get_recent_events(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get recent detection events"""
    try:
        events = db.query(DetectionLog).order_by(
            DetectionLog.timestamp.desc()
        ).limit(limit).all()
        
        result = []
        for event in events:
            camera_name = "Unknown"
            if event.camera_id:
                camera = db.query(Camera).filter(Camera.id == event.camera_id).first()
                if camera:
                    camera_name = camera.name
            
            result.append(RecentEvent(
                id=event.id,
                timestamp=event.timestamp,
                camera_name=camera_name,
                model_name=event.model_name,
                detection_type=event.detection_type,
                confidence=event.confidence,
                is_alert=event.is_alert
            ))
        
        return result
    except Exception as e:
        print(f"❌ Error in get_recent_events: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/dashboard/alerts", response_model=List[AlertSummary])
async def get_recent_alerts(
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get recent alerts"""
    try:
        alerts = db.query(Alert).order_by(
            Alert.timestamp.desc()
        ).limit(limit).all()
        
        result = []
        for alert in alerts:
            camera_name = "Unknown"
            if alert.camera_id:
                camera = db.query(Camera).filter(Camera.id == alert.camera_id).first()
                if camera:
                    camera_name = camera.name
            
            result.append(AlertSummary(
                id=alert.id,
                timestamp=alert.timestamp,
                message=alert.message,
                severity=alert.severity,
                camera_name=camera_name,
                is_resolved=alert.is_resolved
            ))
        
        return result
    except Exception as e:
        print(f"❌ Error in get_recent_alerts: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/dashboard/camera-health", response_model=List[CameraHealth])
async def get_camera_health(db: Session = Depends(get_db)):
    """Get camera health status"""
    try:
        cameras = db.query(Camera).all()
        
        result = []
        for camera in cameras:
            # Get last detection for this camera
            last_detection = db.query(DetectionLog).filter(
                DetectionLog.camera_id == camera.id
            ).order_by(DetectionLog.timestamp.desc()).first()
            
            # Calculate uptime (simplified - would need actual uptime tracking)
            uptime = "99.8%" if camera.status == "online" else "0%"
            
            result.append(CameraHealth(
                id=camera.id,
                name=camera.name,
                status=camera.status,
                uptime=uptime,
                last_detection=last_detection.timestamp if last_detection else None
            ))
        
        return result
    except Exception as e:
        print(f"❌ Error in get_camera_health: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/dashboard/model-performance", response_model=List[ModelPerformance])
async def get_model_performance(db: Session = Depends(get_db)):
    """Get performance metrics for all models"""
    try:
        models = db.query(AIModel).filter(AIModel.enabled == True).all()
        
        result = []
        for model in models:
            # Count detections for this model
            detection_count = db.query(DetectionLog).filter(
                DetectionLog.model_name == model.name
            ).count()
            
            # Calculate average confidence
            avg_confidence = db.query(func.avg(DetectionLog.confidence)).filter(
                DetectionLog.model_name == model.name
            ).scalar() or 0
            
            # Count alerts for this model
            alert_count = db.query(Alert).filter(
                Alert.alert_type == model.name
            ).count()
            
            result.append(ModelPerformance(
                model_name=model.name,
                detection_count=detection_count,
                avg_confidence=float(avg_confidence) if avg_confidence else 0,
                alert_count=alert_count
            ))
        
        return result
    except Exception as e:
        print(f"❌ Error in get_model_performance: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
@router.get("/detection-breakdown")
async def get_detection_breakdown(
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get breakdown of detections by type for analytics page"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get count of detections by type
        breakdown = db.query(
            DetectionLog.detection_type,
            func.count(DetectionLog.id).label('count')
        ).filter(
            DetectionLog.timestamp >= cutoff_date
        ).group_by(
            DetectionLog.detection_type
        ).all()
        
        # Color mapping for types
        color_map = {
            'face': '#4a90d9',
            'person': '#22c55e',
            'vehicle': '#f59e0b',
            'ppe': '#ef4444',
            'fire': '#dc2626',
            'license': '#8b5cf6',
            'fall': '#f97316',
            'intrusion': '#ec4899',
            'abandoned': '#14b8a6',
            'crowd': '#6366f1'
        }
        
        result = []
        for item in breakdown:
            detection_type = item[0] or 'unknown'
            result.append({
                'type': detection_type,
                'count': item[1],
                'color': color_map.get(detection_type, '#6b7280')
            })
        
        return result
    except Exception as e:
        print(f"❌ Error in get_detection_breakdown: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/daily-trends")
async def get_daily_trends(
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get daily detection and alert trends for analytics page"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        result = []
        
        for i in range(days):
            date = datetime.utcnow().date() - timedelta(days=(days - 1 - i))
            start_date = datetime.combine(date, datetime.min.time())
            end_date = datetime.combine(date, datetime.max.time())
            
            # Count detections for this day
            detections_count = db.query(DetectionLog).filter(
                DetectionLog.timestamp >= start_date,
                DetectionLog.timestamp <= end_date
            ).count()
            
            # Count alerts for this day
            alerts_count = db.query(Alert).filter(
                Alert.timestamp >= start_date,
                Alert.timestamp <= end_date
            ).count()
            
            # Get days of week
            days_of_week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            day_name = days_of_week[date.weekday()]
            
            result.append({
                'date': date.strftime('%Y-%m-%d'),
                'day': day_name,
                'detections': detections_count,
                'alerts': alerts_count
            })
        
        return result
    except Exception as e:
        print(f"❌ Error in get_daily_trends: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/export/csv")
async def export_analytics_csv(
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Export analytics data as CSV"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get detection data
        detections = db.query(DetectionLog).filter(
            DetectionLog.timestamp >= cutoff_date
        ).order_by(DetectionLog.timestamp.desc()).all()
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Timestamp', 
            'Camera', 
            'Model', 
            'Detection Type', 
            'Confidence', 
            'Is Alert'
        ])
        
        # Write data
        for detection in detections:
            camera_name = "Unknown"
            if detection.camera_id:
                camera = db.query(Camera).filter(Camera.id == detection.camera_id).first()
                if camera:
                    camera_name = camera.name
            
            writer.writerow([
                detection.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                camera_name,
                detection.model_name,
                detection.detection_type,
                f"{detection.confidence:.2f}",
                "Yes" if detection.is_alert else "No"
            ])
        
        # Prepare response
        output.seek(0)
        filename = f"analytics_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        print(f"❌ Error in export_analytics_csv: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/export/pdf")
async def export_analytics_pdf(
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Export analytics data as PDF"""
    try:
        # For PDF, we'll use a simple HTML to PDF approach
        # Or we can use reportlab - for now, let's return a nicely formatted HTML
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get stats
        total_cameras = db.query(Camera).count()
        active_cameras = db.query(Camera).filter(Camera.status == "online").count()
        active_models = db.query(AIModel).filter(AIModel.enabled == True).count()
        total_detections = db.query(DetectionLog).count()
        total_alerts = db.query(Alert).count()
        
        # Get recent detections
        recent_detections = db.query(DetectionLog).filter(
            DetectionLog.timestamp >= cutoff_date
        ).order_by(DetectionLog.timestamp.desc()).limit(50).all()
        
        # Build HTML report
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                h1 {{ color: #1a3a5c; border-bottom: 2px solid #1a3a5c; padding-bottom: 10px; }}
                h2 {{ color: #1a3a5c; margin-top: 30px; }}
                .stats {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }}
                .stat-card {{ background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e8edf2; text-align: center; }}
                .stat-number {{ font-size: 28px; font-weight: bold; color: #1a3a5c; }}
                .stat-label {{ color: #6b7280; font-size: 14px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                th {{ background: #1a3a5c; color: white; padding: 10px; text-align: left; }}
                td {{ padding: 10px; border-bottom: 1px solid #e8edf2; }}
                .footer {{ margin-top: 40px; color: #6b7280; font-size: 12px; border-top: 1px solid #e8edf2; padding-top: 10px; }}
                .alert {{ color: #ef4444; }}
                .confidence {{ font-weight: bold; }}
            </style>
        </head>
        <body>
            <h1>Invexal AI Analytics Report</h1>
            <p>Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}</p>
            
            <h2>Summary Statistics</h2>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">{total_cameras}</div>
                    <div class="stat-label">Total Cameras ({active_cameras} online)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{active_models}</div>
                    <div class="stat-label">Active AI Models</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{total_detections}</div>
                    <div class="stat-label">Total Detections</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{total_alerts}</div>
                    <div class="stat-label">Total Alerts</div>
                </div>
            </div>
            
            <h2>Recent Detections</h2>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Camera</th>
                        <th>Model</th>
                        <th>Type</th>
                        <th>Confidence</th>
                        <th>Alert</th>
                    </tr>
                </thead>
                <tbody>
        """
        
        for detection in recent_detections:
            camera_name = "Unknown"
            if detection.camera_id:
                camera = db.query(Camera).filter(Camera.id == detection.camera_id).first()
                if camera:
                    camera_name = camera.name
            
            html += f"""
                <tr>
                    <td>{detection.timestamp.strftime('%Y-%m-%d %H:%M:%S')}</td>
                    <td>{camera_name}</td>
                    <td>{detection.model_name}</td>
                    <td>{detection.detection_type}</td>
                    <td class="confidence">{detection.confidence:.2f}</td>
                    <td class="alert">{'⚠️ Yes' if detection.is_alert else 'No'}</td>
                </tr>
            """
        
        html += """
                </tbody>
            </table>
            <div class="footer">
                Generated by Invexal AI Video Analytics Platform
            </div>
        </body>
        </html>
        """
        
        filename = f"analytics_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.html"
        
        return StreamingResponse(
            iter([html]),
            media_type="text/html",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        print(f"❌ Error in export_analytics_pdf: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )