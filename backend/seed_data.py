from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.ai_model import AIModel
from app.models.camera import Camera
from app.core.security import get_password_hash

def seed_database():
    print("🌱 Seeding database...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Add these to the seed_data.py
        # Create sample users
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

        for user_data in sample_users:
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing:
                user = User(
                    name=user_data["name"],
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"]),
                    role=user_data["role"],
                    is_active=user_data["is_active"]
                )
                db.add(user)
                print(f"✅ User created: {user_data['email']} ({user_data['role'].value})")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()