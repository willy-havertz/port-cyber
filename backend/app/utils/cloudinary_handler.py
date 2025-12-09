"""
Cloudinary file upload handler for PDFs
"""
import cloudinary
import cloudinary.uploader
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Configure cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)


async def upload_pdf_to_cloudinary(file_content: bytes, filename: str) -> str:
    """
    Upload a PDF file to Cloudinary and return the URL
    
    Args:
        file_content: The file bytes to upload
        filename: Original filename
        
    Returns:
        The secure URL of the uploaded file
        
    Raises:
        Exception: If upload fails
    """
    try:
        # Upload to Cloudinary with resource_type 'raw' for PDFs
        # Force public delivery (type="upload") so the PDF is world-accessible.
        # "raw" resource_type keeps the PDF intact.
        result = cloudinary.uploader.upload(
            file_content,
            resource_type="raw",
            type="upload",
            access_mode="public",
            folder="writeups",
            public_id=filename.replace(".pdf", ""),
            overwrite=True,
            use_filename=True,
            unique_filename=False,
            format="pdf"
        )
        
        logger.info(f"Successfully uploaded {filename} to Cloudinary")
        return result["secure_url"]
        
    except Exception as e:
        logger.error(f"Error uploading to Cloudinary: {str(e)}")
        raise


def generate_signed_url(public_id: str, expiration_hours: int = 1) -> str:
    """
    Generate a time-limited signed URL for a PDF on Cloudinary.
    URL expires after specified hours.
    
    Args:
        public_id: Cloudinary public ID (e.g., \"writeups/Fowsniff_ctf\")
        expiration_hours: URL expiration time in hours (default 1 hour)
        
    Returns:
        A signed URL valid for the specified duration
    """
    try:
        from cloudinary.utils import cloudinary_url
        from time import time
        
        # Calculate expiration timestamp
        expiration = int(time()) + (expiration_hours * 3600)
        
        # Generate signed URL
        url, options = cloudinary_url(
            public_id,
            resource_type="raw",
            type="authenticated",
            sign_url=True,
            secure=True,
            expires_at=expiration
        )
        
        logger.info(f"Generated signed URL for {public_id}, expires in {expiration_hours} hours")
        return url
        
    except Exception as e:
        logger.error(f"Error generating signed URL: {str(e)}")
        raise


async def delete_pdf_from_cloudinary(file_url: str) -> bool:
    """
    Delete a PDF from Cloudinary
    
    Args:
        file_url: The Cloudinary URL of the file
        
    Returns:
        True if deleted successfully, False otherwise
    """
    try:
        # Extract public ID from URL
        # Format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}
        if "cloudinary.com" not in file_url:
            return False
            
        # Extract the public ID from the URL
        parts = file_url.split("/")
        public_id = parts[-1].replace(".pdf", "")
        
        # If there's a folder, include it
        if len(parts) > 5 and parts[-2] != "upload":
            folder = parts[-2]
            public_id = f"{folder}/{public_id}"
        
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="raw"
        )
        
        logger.info(f"Successfully deleted {file_url} from Cloudinary")
        return result.get("result") == "ok"
        
    except Exception as e:
        logger.error(f"Error deleting from Cloudinary: {str(e)}")
        return False
