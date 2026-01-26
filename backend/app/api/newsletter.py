from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import logging

from ..core.database import get_db
from ..core.config import settings
from ..models.newsletter import Newsletter
from ..models.user import User
from ..schemas.newsletter import NewsletterCreate, NewsletterResponse, NewsletterSendRequest
from ..core.security import get_current_admin_user

router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])
logger = logging.getLogger(__name__)

# Initialize Resend client
try:
    import resend
    resend.api_key = settings.RESEND_API_KEY
    RESEND_CLIENT = resend
except Exception as e:
    logger.warning(f"Resend client initialization failed: {e}")
    RESEND_CLIENT = None


@router.post("/subscribe", response_model=NewsletterResponse, status_code=status.HTTP_201_CREATED)
async def subscribe_newsletter(request: NewsletterCreate, db: Session = Depends(get_db)):
    """Subscribe email to newsletter"""
    try:
        # Check if already subscribed
        existing = db.query(Newsletter).filter(Newsletter.email == request.email).first()
        if existing:
            if existing.is_active:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already subscribed to newsletter"
                )
            # Reactivate if previously unsubscribed
            existing.is_active = True
            existing.unsubscribed_at = None
            db.commit()
            return existing

        # Create new subscription
        newsletter = Newsletter(email=request.email)
        db.add(newsletter)
        db.commit()
        db.refresh(newsletter)
        
        return newsletter
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already subscribed"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error subscribing to newsletter: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to subscribe to newsletter"
        )


@router.post("/unsubscribe")
async def unsubscribe_newsletter(email: str, db: Session = Depends(get_db)):
    """Unsubscribe email from newsletter"""
    try:
        newsletter = db.query(Newsletter).filter(Newsletter.email == email).first()
        if not newsletter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email not found in newsletter"
            )

        from datetime import datetime
        newsletter.is_active = False
        newsletter.unsubscribed_at = datetime.utcnow()
        db.commit()

        return {"success": True, "message": "Unsubscribed from newsletter"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error unsubscribing from newsletter: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unsubscribe from newsletter"
        )


@router.post("/send")
async def send_newsletter(request: NewsletterSendRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """Send newsletter to all subscribers (admin only)"""
    if not RESEND_CLIENT:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service not configured"
        )

    try:
        # Get all active subscribers
        subscribers = db.query(Newsletter).filter(Newsletter.is_active == True).all()
        
        if not subscribers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active subscribers"
            )

        sent_count = 0
        failed_count = 0

        # Send to each subscriber
        for subscriber in subscribers:
            try:
                RESEND_CLIENT.Emails.send({
                    "from": "notifications@resend.dev",
                    "to": subscriber.email,
                    "subject": request.subject,
                    "html": request.html_content,
                })
                sent_count += 1
            except Exception as e:
                logger.error(f"Error sending newsletter to {subscriber.email}: {e}")
                failed_count += 1

        return {
            "success": True,
            "sent_count": sent_count,
            "failed_count": failed_count,
            "total_subscribers": len(subscribers)
        }
    except Exception as e:
        logger.error(f"Error sending newsletter: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send newsletter"
        )


@router.get("/subscribers/count")
async def get_subscriber_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """Get active subscriber count (admin only)"""
    try:
        count = db.query(Newsletter).filter(Newsletter.is_active == True).count()
        return {"active_subscribers": count}
    except Exception as e:
        logger.error(f"Error getting subscriber count: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get subscriber count"
        )