from fastapi import APIRouter
from app.api.v1 import auth, models, cameras, analytics

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(models.router, prefix="/models", tags=["AI Models"])
router.include_router(cameras.router, prefix="/cameras", tags=["Cameras"])
router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])