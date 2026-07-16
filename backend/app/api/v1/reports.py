from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import traceback
import csv
import io
import json
from datetime import datetime, timedelta
from fastapi.responses import StreamingResponse
from app.core.database import get_db
from app.models.report import Report
from app.models.detection_log import DetectionLog
from app.models.camera import Camera
from app.models.user import User
from app.schemas.report import ReportCreate, ReportUpdate, ReportResponse, ReportStats
from app.api.v1.auth import get_current_user_dependency

router = APIRouter()

# GET all reports
@router.get("/", response_model=List[ReportResponse])
async def get_all_reports(
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get all reports"""
    try:
        reports = db.query(Report).order_by(Report.created_at.desc()).all()
        print(f"✅ Found {len(reports)} reports")
        return reports
    except Exception as e:
        print(f"❌ Error in get_all_reports: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# GET report stats
@router.get("/stats", response_model=ReportStats)
async def get_report_stats(
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get report statistics"""
    try:
        total = db.query(Report).count()
        generated = db.query(Report).filter(Report.status == "generated").count()
        pending = db.query(Report).filter(Report.status == "pending").count()
        failed = db.query(Report).filter(Report.status == "failed").count()
        
        return ReportStats(
            total=total,
            generated=generated,
            pending=pending,
            failed=failed,
            total_size="0 MB"  # Would calculate from actual files in production
        )
    except Exception as e:
        print(f"❌ Error in get_report_stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# POST generate report
@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(
    report_data: ReportCreate,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Generate a new report"""
    try:
        # Create report record
        new_report = Report(
            name=report_data.name,
            report_type=report_data.report_type,
            date_range=report_data.date_range,
            format=report_data.format,
            status="generated"  # For now, mark as generated immediately
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        
        # In a real implementation, this would trigger a background task
        # For now, we'll just mark it as generated
        print(f"✅ Report created: {new_report.name}")
        return new_report
    except Exception as e:
        print(f"❌ Error in generate_report: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# GET single report
@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get a single report by ID"""
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return report
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_report: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# DOWNLOAD report
@router.get("/{report_id}/download")
async def download_report(
    report_id: int,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Download a report"""
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        if report.status != "generated":
            raise HTTPException(status_code=400, detail="Report not ready for download")
        
        # Generate report content
        try:
            content = generate_report_content(report, db)
        except Exception as e:
            print(f"❌ Error generating report content: {e}")
            traceback.print_exc()
            # Fallback: generate a simple report with default dates
            content = generate_fallback_report(report, db)
        
        # Determine filename and content type
        extension = "csv" if report.format == "csv" else "html"
        filename = f"{report.name}_{datetime.utcnow().strftime('%Y%m%d')}.{extension}"
        media_type = "text/csv" if report.format == "csv" else "text/html"
        
        return StreamingResponse(
            iter([content]),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in download_report: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

def generate_fallback_report(report: Report, db: Session):
    """Generate a fallback report if the main generation fails"""
    # Default to last 7 days
    end = datetime.utcnow()
    start = end - timedelta(days=7)
    
    detections = db.query(DetectionLog).filter(
        DetectionLog.timestamp >= start,
        DetectionLog.timestamp <= end
    ).all()
    
    if report.format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'Timestamp', 'Camera', 'Model', 'Detection Type', 'Confidence', 'Is Alert'
        ])
        
        for detection in detections[:100]:
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
        
        output.seek(0)
        return output.getvalue()
    else:
        return f"""
        <html>
        <body>
            <h1>{report.name}</h1>
            <p>Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>Total Detections: {len(detections)}</p>
            <p>Note: This is a fallback report with default date range.</p>
        </body>
        </html>
        """

# DELETE report
@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Delete a report"""
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        db.delete(report)
        db.commit()
        print(f"✅ Report deleted: {report.name}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in delete_report: {e}")
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Helper function to generate report content
def generate_report_content(report: Report, db: Session):
    """Generate report content based on report type"""
    
    # Determine date range with defaults
    if report.date_range and report.date_range.get("start") and report.date_range.get("end"):
        try:
            start = datetime.fromisoformat(report.date_range.get("start"))
            end = datetime.fromisoformat(report.date_range.get("end"))
        except ValueError:
            # If date parsing fails, use defaults
            end = datetime.utcnow()
            start = end - timedelta(days=7)
    else:
        # Default to last 7 days
        end = datetime.utcnow()
        start = end - timedelta(days=7)
    
    # Get data
    detections = db.query(DetectionLog).filter(
        DetectionLog.timestamp >= start,
        DetectionLog.timestamp <= end
    ).all()
    
    # Get camera names
    camera_ids = list(set([d.camera_id for d in detections if d.camera_id]))
    cameras = {}
    if camera_ids:
        camera_query = db.query(Camera).filter(Camera.id.in_(camera_ids)).all()
        cameras = {c.id: c.name for c in camera_query}
    
    # Generate CSV
    if report.format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'Timestamp', 'Camera', 'Model', 'Detection Type', 'Confidence', 'Is Alert'
        ])
        
        for detection in detections:
            camera_name = cameras.get(detection.camera_id, "Unknown")
            writer.writerow([
                detection.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                camera_name,
                detection.model_name,
                detection.detection_type,
                f"{detection.confidence:.2f}",
                "Yes" if detection.is_alert else "No"
            ])
        
        output.seek(0)
        return output.getvalue()
    
    # Generate HTML (for PDF or Excel preview)
    else:
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                h1 {{ color: #1a3a5c; border-bottom: 2px solid #1a3a5c; padding-bottom: 10px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                th {{ background: #1a3a5c; color: white; padding: 10px; text-align: left; }}
                td {{ padding: 10px; border-bottom: 1px solid #e8edf2; }}
                .footer {{ margin-top: 40px; color: #6b7280; font-size: 12px; border-top: 1px solid #e8edf2; padding-top: 10px; }}
            </style>
        </head>
        <body>
            <h1>{report.name}</h1>
            <p>Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>Date Range: {start.strftime('%Y-%m-%d')} to {end.strftime('%Y-%m-%d')}</p>
            
            <h2>Summary</h2>
            <p>Total Detections: {len(detections)}</p>
            <p>Alerts: {len([d for d in detections if d.is_alert])}</p>
            
            <h2>Detection Logs</h2>
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
        
        for detection in detections[:100]:  # Limit to 100 for preview
            camera_name = cameras.get(detection.camera_id, "Unknown")
            html += f"""
                <tr>
                    <td>{detection.timestamp.strftime('%Y-%m-%d %H:%M:%S')}</td>
                    <td>{camera_name}</td>
                    <td>{detection.model_name}</td>
                    <td>{detection.detection_type}</td>
                    <td>{detection.confidence:.2f}</td>
                    <td>{'Yes' if detection.is_alert else 'No'}</td>
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
        
        return html