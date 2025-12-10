import zipfile
import os
import tempfile
from typing import Tuple, Optional, List
import shutil

async def extract_and_process_zip(file_content: bytes) -> Tuple[str, List[bytes], dict]:
    """
    Extract zip file containing README.md and images.
    
    Returns:
        Tuple of:
        - readme_content: The content of README.md as string
        - images: List of image file contents as bytes
        - metadata: Dict with image names and their paths
    
    Raises:
        ValueError: If zip is invalid or README.md not found
    """
    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        
        # Write zip to temp file and extract
        zip_path = os.path.join(temp_dir, "upload.zip")
        with open(zip_path, "wb") as f:
            f.write(file_content)
        
        # Extract zip
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        
        # Find README.md
        readme_path = None
        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                if file.lower() == "readme.md":
                    readme_path = os.path.join(root, file)
                    break
        
        if not readme_path:
            shutil.rmtree(temp_dir)
            raise ValueError("README.md not found in zip file")
        
        # Read README content
        with open(readme_path, 'r', encoding='utf-8') as f:
            readme_content = f.read()
        
        # Find all images
        images = {}
        image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'}
        
        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                if os.path.splitext(file)[1].lower() in image_extensions:
                    file_path = os.path.join(root, file)
                    # Get relative path from temp_dir
                    rel_path = os.path.relpath(file_path, temp_dir)
                    with open(file_path, 'rb') as img_f:
                        images[rel_path] = img_f.read()
        
        # Cleanup
        shutil.rmtree(temp_dir)
        
        return readme_content, images, {"readme_path": readme_path}
    
    except zipfile.BadZipFile:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise ValueError("Invalid zip file")
    except Exception as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise ValueError(f"Error processing zip file: {str(e)}")


def validate_readme_structure(readme_content: str) -> Tuple[bool, Optional[str]]:
    """
    Basic validation of README structure.
    Ensures it has at least some content.
    """
    if not readme_content or not readme_content.strip():
        return False, "README.md is empty"
    
    if len(readme_content) < 50:
        return False, "README.md content is too short (minimum 50 characters)"
    
    return True, None
