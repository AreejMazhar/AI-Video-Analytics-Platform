import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import router as api_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise-grade AI video analytics platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS - Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Vite dev server
        "http://localhost:3000",      # Alternative dev server
        "http://127.0.0.1:5173",      # Localhost alternative
        "http://127.0.0.1:3000",      # Localhost alternative
        "https://your-vercel-app.vercel.app",  # Production URL (update later)
    ],
    allow_credentials=True,
    allow_methods=["*"],              # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],              # Allow all headers
    expose_headers=["Content-Disposition"],  # Expose so frontend can read filename
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Serve annotated thumbnail images (used by VideoProcessing results panel)
_thumb_dir = Path("uploads/thumbnails")
_thumb_dir.mkdir(parents=True, exist_ok=True)
app.mount("/thumbnails", StaticFiles(directory=str(_thumb_dir)), name="thumbnails")

@app.get("/")
async def root():
    return {"message": "Invexal AI Video Analytics API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}