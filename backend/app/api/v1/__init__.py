from fastapi import APIRouter
from app.api.v1 import auth, models

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(models.router, prefix="/models", tags=["AI Models"])