from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.ai_model import AIModel
from app.core.security import get_password_hash

def seed_database():
    print("🌱 Seeding database...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if admin exists
        existing_admin = db.query(User).filter(User.email == "admin@invexal.com").first()
        if not existing_admin:
            # Create admin user
            admin = User(
                name="Admin User",
                email="admin@invexal.com",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            print("✅ Admin user created")
        
        # Create default AI Models
        models_data = [
            {"name": "Face Detection", "icon": "👤", "mode": "both", "enabled": True, "description": "Detect faces in live and video"},
            {"name": "Face Recognition", "icon": "🪪", "mode": "both", "enabled": True, "description": "Identify known faces"},
            {"name": "Person Detection", "icon": "🚶", "mode": "video", "enabled": True, "description": "Detect people in videos"},
            {"name": "Vehicle Detection", "icon": "🚗", "mode": "video", "enabled": False, "description": "Detect vehicles in videos"},
            {"name": "PPE Detection", "icon": "⛑️", "mode": "video", "enabled": False, "description": "Detect PPE compliance"},
            {"name": "Fire & Smoke", "icon": "🔥", "mode": "video", "enabled": False, "description": "Detect fire and smoke"},
            {"name": "Intrusion Detection", "icon": "🚫", "mode": "video", "enabled": False, "description": "Detect restricted access"},
            {"name": "Crowd Detection", "icon": "👥", "mode": "video", "enabled": False, "description": "Count people in crowds"},
            {"name": "Fall Detection", "icon": "⚠️", "mode": "video", "enabled": False, "description": "Detect falls"},
            {"name": "Abandoned Object", "icon": "🧳", "mode": "video", "enabled": False, "description": "Detect unattended objects"},
            {"name": "License Plate", "icon": "📋", "mode": "video", "enabled": False, "description": "Read license plates"},
        ]
        
        for model_data in models_data:
            existing = db.query(AIModel).filter(AIModel.name == model_data["name"]).first()
            if not existing:
                model = AIModel(
                    name=model_data["name"],
                    icon=model_data["icon"],
                    mode=model_data["mode"],
                    enabled=model_data["enabled"],
                    confidence_threshold=0.5,
                    camera_ids=[],
                    description=model_data["description"]
                )
                db.add(model)
                print(f"✅ Model created: {model_data['name']}")
        
        db.commit()
        print("\n✅ Database seeded successfully!")
        print("\n📋 Default Login Credentials:")
        print("   Email: admin@invexal.com")
        print("   Password: admin123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()