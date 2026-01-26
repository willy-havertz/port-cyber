from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from collections import defaultdict
from time import time
import os

from app.api import auth, writeups, comments, scanner, contact, newsletter
from app.core.config import settings

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Port Cyber API",
    description="Backend API for Wiltord's Portfolio",
    version="1.0.0"
)

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:;"
        return response

# Simple in-memory rate limiter
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_limit: int = 5, window: int = 60):
        super().__init__(app)
        self.rate_limit = rate_limit
        self.window = window
        self.requests = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next):
        # Only rate limit auth endpoints
        if not request.url.path.startswith("/api/auth/login"):
            return await call_next(request)
        
        client_ip = request.client.host
        current_time = time()
        
        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if current_time - req_time < self.window
        ]
        
        # Check rate limit
        if len(self.requests[client_ip]) >= self.rate_limit:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later."
            )
        
        # Add current request
        self.requests[client_ip].append(current_time)
        
        return await call_next(request)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add rate limiting middleware
if settings.RATE_LIMIT_ENABLED:
    app.add_middleware(RateLimitMiddleware)

# CORS Configuration - restrict to allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
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
app.include_router(contact.router, tags=["Contact"])
app.include_router(newsletter.router, tags=["Newsletter"])

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

print("Starting main.py")

if __name__ == "__main__":
    print("Running as __main__")
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
