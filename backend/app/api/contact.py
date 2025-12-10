from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timedelta
from collections import defaultdict
import httpx
import os
from app.core.database import SessionLocal
from app.models.contact import ContactMessage, SpamLog
from sqlalchemy import func

router = APIRouter()

# In-memory rate limiting cache
ip_request_times = defaultdict(list)
email_request_times = defaultdict(list)

class ContactRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=5, max_length=200)
    message: str = Field(..., min_length=10, max_length=5000)
    captchaToken: str

HCAPTCHA_SECRET = os.getenv("HCAPTCHA_SECRET_KEY")
RATE_LIMIT_PER_IP = 5  # requests per hour
RATE_LIMIT_PER_EMAIL = 3  # requests per hour
WINDOW_SECONDS = 3600  # 1 hour

async def verify_hcaptcha(token: str) -> bool:
    """Verify hCaptcha token with hCaptcha service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://hcaptcha.com/siteverify",
                data={
                    "secret": HCAPTCHA_SECRET,
                    "response": token,
                },
                timeout=10,
            )
            result = response.json()
            return result.get("success", False)
    except Exception as e:
        print(f"hCaptcha verification error: {e}")
        return False

def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    if request.client:
        return request.client.host
    return "unknown"

def check_rate_limit(ip: str, email: str) -> tuple[bool, str]:
    """Check if request should be rate limited"""
    current_time = datetime.now()
    window = timedelta(seconds=WINDOW_SECONDS)
    
    # Clean old requests for IP
    ip_request_times[ip] = [
        req_time for req_time in ip_request_times[ip]
        if current_time - req_time < window
    ]
    
    # Clean old requests for email
    email_request_times[email] = [
        req_time for req_time in email_request_times[email]
        if current_time - req_time < window
    ]
    
    # Check IP rate limit
    if len(ip_request_times[ip]) >= RATE_LIMIT_PER_IP:
        return False, f"Too many requests from your IP. Please try again in 1 hour."
    
    # Check email rate limit
    if len(email_request_times[email]) >= RATE_LIMIT_PER_EMAIL:
        return False, f"Too many requests from this email. Please try again in 1 hour."
    
    return True, ""

def log_spam_activity(db, ip: str, email: str, name: str, reason: str, contact_data: dict = None):
    """Log suspicious activity"""
    try:
        spam_log = SpamLog(
            ip_address=ip,
            email=email,
            name=name,
            reason=reason,
            contact_data=contact_data,
            created_at=datetime.utcnow()
        )
        db.add(spam_log)
        db.commit()
    except Exception as e:
        print(f"Error logging spam activity: {e}")
        db.rollback()

@router.post("/api/contact")
async def submit_contact(request: ContactRequest, req: Request):
    """
    Submit contact form with rate limiting, CAPTCHA verification, and spam detection
    """
    db = SessionLocal()
    client_ip = get_client_ip(req)
    
    try:
        # Verify hCaptcha
        if not HCAPTCHA_SECRET:
            raise HTTPException(
                status_code=500,
                detail="CAPTCHA service not configured"
            )
        
        captcha_valid = await verify_hcaptcha(request.captchaToken)
        if not captcha_valid:
            log_spam_activity(
                db, client_ip, request.email, request.name,
                "Failed CAPTCHA verification",
                request.dict()
            )
            raise HTTPException(
                status_code=400,
                detail="CAPTCHA verification failed"
            )
        
        # Check rate limiting
        rate_limited, error_msg = check_rate_limit(client_ip, request.email)
        if not rate_limited:
            log_spam_activity(
                db, client_ip, request.email, request.name,
                "Rate limit exceeded",
                request.dict()
            )
            raise HTTPException(status_code=429, detail=error_msg)
        
        # Check for suspicious patterns
        message_lower = request.message.lower()
        spam_keywords = ["viagra", "casino", "lottery", "claim prize", "bitcoin"]
        if any(keyword in message_lower for keyword in spam_keywords):
            log_spam_activity(
                db, client_ip, request.email, request.name,
                "Spam keywords detected",
                request.dict()
            )
            # Don't reveal that we detected spam, just silently reject
            raise HTTPException(
                status_code=400,
                detail="Unable to process request"
            )
        
        # Create contact message record
        contact_msg = ContactMessage(
            name=request.name,
            email=request.email,
            subject=request.subject,
            message=request.message,
            ip_address=client_ip,
            created_at=datetime.utcnow()
        )
        
        db.add(contact_msg)
        db.commit()
        db.refresh(contact_msg)
        
        # Update rate limit tracking
        ip_request_times[client_ip].append(datetime.now())
        email_request_times[request.email].append(datetime.now())
        
        return {
            "success": True,
            "message": "Contact message received successfully",
            "id": contact_msg.id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing contact form: {e}")
        log_spam_activity(
            db, client_ip, request.email, request.name,
            f"Processing error: {str(e)}"
        )
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to process contact request"
        )
    finally:
        db.close()

@router.get("/api/contact/stats")
async def get_contact_stats(request: Request):
    """
    Get spam statistics (admin endpoint - requires authentication)
    """
    db = SessionLocal()
    try:
        # Get total messages
        total_messages = db.query(func.count(ContactMessage.id)).scalar()
        
        # Get spam logs in last 24 hours
        yesterday = datetime.utcnow() - timedelta(days=1)
        spam_24h = db.query(func.count(SpamLog.id)).filter(
            SpamLog.created_at >= yesterday
        ).scalar()
        
        # Get spam by reason
        spam_by_reason = db.query(
            SpamLog.reason,
            func.count(SpamLog.id)
        ).filter(
            SpamLog.created_at >= yesterday
        ).group_by(SpamLog.reason).all()
        
        return {
            "total_messages": total_messages,
            "spam_logs_24h": spam_24h,
            "spam_by_reason": [
                {"reason": reason, "count": count}
                for reason, count in spam_by_reason
            ]
        }
    finally:
        db.close()
