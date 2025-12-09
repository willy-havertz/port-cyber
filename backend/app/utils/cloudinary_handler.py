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


async def upload_pdf_to_cloudinary(file_content: bytes, filename: str) -> tuple[str, str]:
    """
    Upload a PDF file to Cloudinary and return (inline_pdf_url, thumbnail_url).
    """
    try:
        public_id = filename.replace(".pdf", "")
        from cloudinary.utils import cloudinary_url

        # Upload PDF as raw resource type (standard PDF upload)
        result = cloudinary.uploader.upload(
            file_content,
            resource_type="raw",
            folder="writeups",
            public_id=public_id,
            overwrite=True,
            use_filename=True,
            unique_filename=False
        )

        # Get the base URL - use it directly for viewing
        pdf_url = result["secure_url"]

        # For thumbnail, upload a copy as image type to enable page extraction
        # This creates a separate asset for thumbnail generation
        try:
            thumb_result = cloudinary.uploader.upload(
                file_content,
                resource_type="image",
                folder="writeups/thumbs",
                public_id=public_id,
                overwrite=True,
                format="pdf"
            )
            
            # Generate thumbnail from first page
            thumb_url, _ = cloudinary_url(
                f"writeups/thumbs/{public_id}",
                resource_type="image",
                format="png",
                page=1,
                transformation=[{"width": 800, "crop": "scale", "quality": "auto"}]
            )
        except Exception as thumb_error:
            logger.warning(f"Thumbnail generation failed: {thumb_error}, using placeholder")
            thumb_url = ""

        logger.info(f"Successfully uploaded {filename} to Cloudinary")
        return pdf_url, thumb_url

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
        
        # Generate signed URL for raw PDF
        url, options = cloudinary_url(
            public_id,
            resource_type="raw",
            type="upload",
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
        # Format: https://res.cloudinary.com/{cloud_name}/raw/upload/v{version}/{public_id}
        if "cloudinary.com" not in file_url:
            return False
            
        # Extract the public ID from the URL
        parts = file_url.split("/")
        public_id = parts[-1].replace(".pdf", "")
        
        # If there's a folder, include it
        if len(parts) > 5 and parts[-2] != "upload":
            folder = parts[-2]
            public_id = f"{folder}/{public_id}"
        
        # Delete the main PDF
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="raw"
        )
        
        # Also try to delete thumbnail copy if it exists
        try:
            cloudinary.uploader.destroy(
                f"writeups/thumbs/{public_id.split('/')[-1]}",
                resource_type="image"
            )
        except:
            pass
        
        logger.info(f"Successfully deleted {file_url} from Cloudinary")
        return result.get("result") == "ok"
        
    except Exception as e:
        logger.error(f"Error deleting from Cloudinary: {str(e)}")
        return False
