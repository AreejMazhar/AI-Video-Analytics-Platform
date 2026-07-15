from app.core.database import SessionLocal
from app.models.detection_log import DetectionLog
from app.models.alert import Alert
from app.models.camera import Camera
from datetime import datetime, timedelta
import random

def add_sample_detections():
    db = SessionLocal()
    
    try:
        # Get cameras
        cameras = db.query(Camera).all()
        if not cameras:
            print("❌ No cameras found. Please run seed_data.py first.")
            return
        
        camera_ids = [c.id for c in cameras]
        
        # Sample detection types
        detection_types = ['face', 'person', 'vehicle', 'ppe', 'fire', 'license', 'fall']
        model_names = ['Face Detection', 'Face Recognition', 'Person Detection', 'Vehicle Detection', 'PPE Detection', 'Fire & Smoke', 'License Plate', 'Fall Detection']
        
        # Generate detections for the last 7 days
        for day in range(7):
            date = datetime.utcnow() - timedelta(days=day)
            num_detections = random.randint(5, 20)
            
            for _ in range(num_detections):
                timestamp = date + timedelta(hours=random.randint(0, 23), minutes=random.randint(0, 59))
                confidence = round(random.uniform(0.5, 0.98), 2)
                is_alert = random.random() < 0.1  # 10% chance of being an alert
                
                detection = DetectionLog(
                    timestamp=timestamp,
                    camera_id=random.choice(camera_ids),
                    model_name=random.choice(model_names),
                    detection_type=random.choice(detection_types),
                    confidence=confidence,
                    is_alert=is_alert,
                    bbox=[random.randint(100, 500), random.randint(100, 500), random.randint(100, 500), random.randint(100, 500)]
                )
                db.add(detection)
                
                # Create alert for some detections
                if is_alert:
                    alert_types = ['Intrusion detected', 'PPE violation', 'Fire detected', 'Fall detected', 'Unknown person']
                    severities = ['low', 'medium', 'high', 'critical']
                    
                    alert = Alert(
                        timestamp=timestamp,
                        camera_id=random.choice(camera_ids),
                        alert_type=random.choice(alert_types),
                        severity=random.choice(severities),
                        message=f"{random.choice(alert_types)} in {random.choice(['Zone A', 'Zone B', 'Entrance', 'Parking'])}",
                        is_resolved=random.random() < 0.3
                    )
                    db.add(alert)
        
        db.commit()
        print("✅ Sample detections and alerts added successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_detections()