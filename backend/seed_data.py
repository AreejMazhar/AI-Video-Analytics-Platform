from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.ai_model import AIModel
from app.models.camera import Camera
from app.models.detection_log import DetectionLog
from app.models.alert import Alert
from app.models.report import Report
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import random

def seed_database():
    print("Starting database seeding process...")
    
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 1. Clear existing data (in dependency order)
        print("Clearing existing database records...")
        db.query(Alert).delete()
        db.query(DetectionLog).delete()
        db.query(Report).delete()
        db.query(Camera).delete()
        db.query(AIModel).delete()
        db.query(User).delete()
        db.commit()
        print("Database cleared successfully.")

        # 2. Seed Users
        print("Seeding system users...")
        sample_users = [
            {
                "name": "Admin User",
                "email": "admin@invexal.com",
                "password": "admin123",
                "role": UserRole.ADMIN,
                "is_active": True
            },
            {
                "name": "John Operator",
                "email": "john@invexal.com",
                "password": "operator123",
                "role": UserRole.OPERATOR,
                "is_active": True
            },
            {
                "name": "Sarah Viewer",
                "email": "sarah@invexal.com",
                "password": "viewer123",
                "role": UserRole.VIEWER,
                "is_active": True
            }
        ]

        seeded_users = []
        for user_data in sample_users:
            user = User(
                name=user_data["name"],
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"],
                is_active=user_data["is_active"]
            )
            db.add(user)
            seeded_users.append(user)
        db.commit()
        print(f"Users seeded: {len(seeded_users)} users created.")

        # 3. Seed AI Models
        # Rule: ONLY Face Detection & Face Recognition have mode="both" (Live View + Video Upload).
        # The remaining 9 models have mode="video" (Video Upload only).
        print("Seeding AI detection models...")
        sample_models = [
            {
                "name": "Face Detection",
                "enabled": True,
                "mode": "both",
                "confidence_threshold": 0.80,
                "description": "Detect and locate human faces in real-time camera feeds or uploaded video files.",
                "icon": "👤"
            },
            {
                "name": "Face Recognition",
                "enabled": True,
                "mode": "both",
                "confidence_threshold": 0.85,
                "description": "Identify and match detected faces against known database profiles in real-time or recorded video.",
                "icon": "🪪"
            },
            {
                "name": "Person Detection",
                "enabled": True,
                "mode": "video",
                "confidence_threshold": 0.65,
                "description": "Detect, count, and track people in uploaded video footage.",
                "icon": "🚶"
            },
            {
                "name": "Vehicle Detection",
                "enabled": True,
                "mode": "video",
                "confidence_threshold": 0.70,
                "description": "Identify cars, bikes, trucks, and buses in recorded video files.",
                "icon": "🚗"
            },
            {
                "name": "PPE Detection",
                "enabled": True,
                "mode": "video",
                "confidence_threshold": 0.75,
                "description": "Monitor safety equipment compliance (helmets, vests, gloves, masks) in uploaded videos.",
                "icon": "⛑️"
            },
            {
                "name": "Fire & Smoke Detection",
                "enabled": False,
                "mode": "video",
                "confidence_threshold": 0.60,
                "description": "Visual analysis highlighting fire outbreaks and smoke signatures in recorded video.",
                "icon": "🔥"
            },
            {
                "name": "Intrusion Detection",
                "enabled": True,
                "mode": "video",
                "confidence_threshold": 0.70,
                "description": "Monitor restricted zone line-cross events in uploaded video files.",
                "icon": "🚫"
            },
            {
                "name": "Crowd Detection",
                "enabled": False,
                "mode": "video",
                "confidence_threshold": 0.65,
                "description": "Estimate crowd density ratios in recorded video footage.",
                "icon": "👥"
            },
            {
                "name": "Fall Detection",
                "enabled": False,
                "mode": "video",
                "confidence_threshold": 0.70,
                "description": "Identify human fall incidents in uploaded video footage.",
                "icon": "⚠️"
            },
            {
                "name": "Abandoned Object Detection",
                "enabled": False,
                "mode": "video",
                "confidence_threshold": 0.75,
                "description": "Detect unattended bags or items remaining stationary in video recordings.",
                "icon": "🧳"
            },
            {
                "name": "License Plate Recognition",
                "enabled": True,
                "mode": "video",
                "confidence_threshold": 0.85,
                "description": "Extract license plate numbers and text from vehicle footage.",
                "icon": "📋"
            }
        ]

        seeded_models = []
        for model_data in sample_models:
            model = AIModel(
                name=model_data["name"],
                enabled=model_data["enabled"],
                mode=model_data["mode"],
                confidence_threshold=model_data["confidence_threshold"],
                description=model_data["description"]
            )
            db.add(model)
            seeded_models.append(model)
        db.commit()
        print(f"AI Models seeded: {len(seeded_models)} models created.")

        # 4. Seed Cameras
        print("Seeding cameras...")
        sample_cameras = [
            {
                "name": "Laptop Webcam / Direct Stream",
                "rtsp_url": "rtsp://localhost:8554/live",
                "location": "Laptop Direct Connection",
                "status": "online",
                "is_recording": True,
                "confidence_threshold": 0.80,
                "assigned_models": [m.id for m in seeded_models if m.mode == "both"]
            },
            {
                "name": "Secondary RTSP Camera (Future)",
                "rtsp_url": "rtsp://192.168.1.101:554/stream1",
                "location": "Expansion Stream",
                "status": "offline",
                "is_recording": False,
                "confidence_threshold": 0.75,
                "assigned_models": [m.id for m in seeded_models if m.mode == "both"]
            }
        ]

        seeded_cameras = []
        for camera_data in sample_cameras:
            camera = Camera(
                name=camera_data["name"],
                rtsp_url=camera_data["rtsp_url"],
                location=camera_data["location"],
                status=camera_data["status"],
                is_recording=camera_data["is_recording"],
                confidence_threshold=camera_data["confidence_threshold"],
                assigned_models=camera_data["assigned_models"]
            )
            db.add(camera)
            seeded_cameras.append(camera)
        db.commit()
        print(f"Cameras seeded: {len(seeded_cameras)} cameras created.")

        # 5. Seed Detection Logs (Past 7 days)
        print("Seeding detection logs...")
        detection_types = [
            ("Face Detection", "Face", ["John Doe", "Jane Smith", "Unknown Person", "Visitor"]),
            ("Face Recognition", "Recognized Profile", ["John Doe (Admin)", "Jane Smith (Staff)", "Unrecognized Individual"]),
            ("Person Detection", "Person", ["Person #102", "Person #103"]),
            ("Vehicle Detection", "Vehicle", ["Car - ABC 123", "Truck - XYZ 789"]),
            ("PPE Detection", "PPE Compliance", ["Helmet On", "Missing Vest"]),
            ("License Plate Recognition", "License Plate", ["ABC-1234", "XYZ-9876"])
        ]

        now = datetime.utcnow()
        seeded_logs = []
        
        for i in range(150):
            days_ago = random.uniform(0, 7)
            log_time = now - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
            
            model_name, det_type, labels = random.choice(detection_types)
            label = random.choice(labels)
            confidence = round(random.uniform(0.65, 0.98), 2)
            is_alert = confidence < 0.75 or "Unknown" in label or "Missing" in label
            
            log = DetectionLog(
                timestamp=log_time,
                camera_id=random.choice(seeded_cameras).id,
                model_name=model_name,
                detection_type=det_type,
                confidence=confidence,
                bbox={"x": random.randint(100, 400), "y": random.randint(100, 400), "w": random.randint(50, 150), "h": random.randint(50, 150)},
                snapshot_path=f"/media/detections/det_{i+1}.jpg",
                is_alert=is_alert
            )
            db.add(log)
            seeded_logs.append(log)

        db.commit()
        print(f"Detection logs seeded: {len(seeded_logs)} logs created.")

        # 6. Seed Alerts
        print("Seeding alerts...")
        seeded_alerts = []
        alert_logs = [l for l in seeded_logs if l.is_alert]
        
        for log in alert_logs[:40]:
            alert = Alert(
                timestamp=log.timestamp,
                severity=random.choice(["High", "Medium", "Low"]),
                message=f"Security Alert: Low confidence or unrecognized {log.detection_type} at camera {log.camera_id}.",
                detection_id=log.id
            )
            db.add(alert)
            seeded_alerts.append(alert)

        db.commit()
        print(f"Alerts seeded: {len(seeded_alerts)} alerts created.")

        # 7. Seed Reports
        print("Seeding reports...")
        sample_reports = [
            {
                "name": "Weekly Detection Summary",
                "report_type": "weekly",
                "format": "pdf",
                "status": "generated",
                "date_range": {"start": (now - timedelta(days=7)).strftime("%Y-%m-%d"), "end": now.strftime("%Y-%m-%d")}
            },
            {
                "name": "Daily Security Log CSV",
                "report_type": "daily",
                "format": "csv",
                "status": "generated",
                "date_range": {"start": (now - timedelta(days=1)).strftime("%Y-%m-%d"), "end": now.strftime("%Y-%m-%d")}
            }
        ]

        for rep in sample_reports:
            report = Report(
                name=rep["name"],
                report_type=rep["report_type"],
                format=rep["format"],
                status=rep["status"],
                date_range=rep["date_range"]
            )
            db.add(report)

        db.commit()
        print("Reports seeded successfully.")

        print("SUCCESS: Database seeding completed without errors!")

    except Exception as e:
        print(f"ERROR during seeding: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()