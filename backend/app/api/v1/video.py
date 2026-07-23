from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import cv2
import os
import uuid
import shutil
from pathlib import Path
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.models.detection_log import DetectionLog
from app.models.camera import Camera
from app.models.user import User
from app.api.v1.auth import get_current_user_dependency
from app.ai_engine.detectors.face_detector import FaceDetector

router = APIRouter()

# ─── Paths ────────────────────────────────────────────────────────────────────
UPLOAD_DIR = Path("uploads/videos")
THUMBNAIL_DIR = Path("uploads/thumbnails")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)

# Shared detector instance (loaded once at startup)
face_detector = FaceDetector()

# ─── Helper ───────────────────────────────────────────────────────────────────
def _get_or_create_upload_camera(db: Session) -> Camera:
    camera = db.query(Camera).filter(Camera.name == "Video Upload").first()
    if not camera:
        camera = Camera(
            name="Video Upload",
            rtsp_url="upload",
            location="Uploaded Videos",
            status="online",
        )
        db.add(camera)
        db.commit()
        db.refresh(camera)
    return camera


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/process")
async def process_video(
    video: UploadFile = File(...),
    models: str = Form(default='["Face Detection"]'),
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db),
):
    """
    Upload and process a video file with the face detection model.
    Returns detection statistics and URLs of annotated thumbnail frames.
    """
    job_id = str(uuid.uuid4())

    # Save the uploaded video temporarily
    video_path = UPLOAD_DIR / f"{job_id}_{video.filename}"
    with open(video_path, "wb") as f:
        shutil.copyfileobj(video.file, f)

    # Directory to store annotated thumbnails for this job
    thumb_dir = THUMBNAIL_DIR / job_id
    thumb_dir.mkdir(parents=True, exist_ok=True)

    try:
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video file.")

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Sample every 15 frames
        FRAME_INTERVAL = 15
        CONF_THRESHOLD = 0.45
        MAX_THUMBNAILS = 30          # cap thumbnails returned to UI

        print(f"📹 Processing '{video.filename}' | {total_frames} frames | {fps:.1f} fps")

        frame_count = 0
        all_detections: List[dict] = []
        thumbnail_urls: List[str] = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1
            if frame_count % FRAME_INTERVAL != 0:
                continue

            # Run face detection on this frame
            detections = face_detector.detect_faces_frame(frame, confidence_threshold=CONF_THRESHOLD)

            if not detections:
                continue

            timestamp_sec = frame_count / fps

            for det in detections:
                all_detections.append({
                    "frame": frame_count,
                    "timestamp": round(timestamp_sec, 2),
                    "bbox": det["bbox"],
                    "confidence": round(det["confidence"], 4),
                })

            # Save annotated thumbnail (up to MAX_THUMBNAILS)
            if len(thumbnail_urls) < MAX_THUMBNAILS:
                annotated = FaceDetector.draw_detections(frame, detections)
                thumb_filename = f"frame_{frame_count:06d}.jpg"
                thumb_path = thumb_dir / thumb_filename
                cv2.imwrite(str(thumb_path), annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
                thumbnail_urls.append(f"/api/v1/video/thumbnail/{job_id}/{thumb_filename}")

        cap.release()

        print(f"✅ Done — {len(all_detections)} detections across {len(thumbnail_urls)} frames")

        # ── Persist to DB ──────────────────────────────────────────────────
        camera = _get_or_create_upload_camera(db)

        for det in all_detections:
            log = DetectionLog(
                timestamp=datetime.utcnow(),
                camera_id=camera.id,
                model_name="Face Detection",
                detection_type="face",
                confidence=det["confidence"],
                bbox=det["bbox"],
                extra_data={
                    "job_id": job_id,
                    "frame": det["frame"],
                    "timestamp_seconds": det["timestamp"],
                    "video_file": video.filename,
                },
                is_alert=det["confidence"] > 0.90,
            )
            db.add(log)
        db.commit()

        # ── Build summary stats ────────────────────────────────────────────
        confidences = [d["confidence"] for d in all_detections]
        avg_confidence = round(sum(confidences) / len(confidences), 4) if confidences else 0.0
        high_conf_count = sum(1 for c in confidences if c >= 0.85)
        processed_frames = total_frames // FRAME_INTERVAL

        return {
            "success": True,
            "job_id": job_id,
            "video_name": video.filename,
            "total_frames": total_frames,
            "processed_frames": processed_frames,
            "detections_count": len(all_detections),
            "high_confidence_count": high_conf_count,
            "avg_confidence": avg_confidence,
            "thumbnail_urls": thumbnail_urls,
            "results": all_detections[:50],   # first 50 raw detections for the UI table
        }

    except HTTPException:
        raise
    except Exception as exc:
        print(f"❌ Error processing video: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        # Remove the original upload immediately (thumbnails are kept until cleaned up)
        if video_path.exists():
            video_path.unlink()


@router.get("/thumbnail/{job_id}/{filename}")
async def serve_thumbnail(
    job_id: str,
    filename: str,
    current_user: User = Depends(get_current_user_dependency),
):
    """Serve a saved annotated thumbnail image."""
    thumb_path = THUMBNAIL_DIR / job_id / filename
    if not thumb_path.exists():
        raise HTTPException(status_code=404, detail="Thumbnail not found.")
    return FileResponse(str(thumb_path), media_type="image/jpeg")


@router.delete("/cleanup/{job_id}")
async def cleanup_job_thumbnails(
    job_id: str,
    current_user: User = Depends(get_current_user_dependency),
):
    """
    Delete all saved thumbnail images for a specific processing job.
    Call this when the user navigates away or explicitly dismisses the results.
    """
    thumb_dir = THUMBNAIL_DIR / job_id
    if not thumb_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found or already cleaned up.")

    shutil.rmtree(str(thumb_dir))
    print(f"🗑️  Cleaned up thumbnails for job {job_id}")
    return {"success": True, "job_id": job_id, "message": "Thumbnails deleted."}


@router.get("/results/{video_id}")
async def get_video_results(
    video_id: str,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db),
):
    """Get all detection log entries associated with a processing job."""
    detections = (
        db.query(DetectionLog)
        .filter(DetectionLog.extra_data["job_id"].astext == video_id)
        .all()
    )
    return {"count": len(detections), "detections": detections}