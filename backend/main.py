from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

from app.api import auth, writeups, comments, scanner
from app.core.config import settings

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Port Cyber API",
    description="Backend API for Wiltord's Portfolio",
    version="1.0.0"
)

# CORS Configuration - allow all origins (permissive for development/deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Mount static files for uploaded PDFs
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(writeups.router, prefix="/api/writeups", tags=["Writeups"])
app.include_router(comments.router, prefix="/api/comments", tags=["Comments"])
app.include_router(scanner.router, prefix="/api/scanner", tags=["Security Scanner"])

@app.get("/")
async def root():
    return {
        "message": "Port Cyber API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
