import zipfile
import os
import tempfile
from typing import Tuple, Optional, List
import shutil

async def extract_and_process_zip(file_content: bytes) -> Tuple[str, List[bytes], dict]:
    """
    Extract zip file containing markdown and images.
    
    Supports two structures:
    1. README.md (or similar .md file) + images/ folder
    2. [Title].md + [Title]/ folder with images
    
    Returns:
        Tuple of:
        - readme_content: The content of markdown file as string
        - images: Dict of image file contents as bytes (path -> content)
        - metadata: Dict with image names and their paths
    
    Raises:
        ValueError: If zip is invalid or no markdown file found
    """
    temp_dir = None
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
        
        # Find any markdown file (.md, .markdown)
        markdown_path = None
        for root, dirs, files in os.walk(temp_dir):
            # Skip the temp zip itself
            if "upload.zip" in root:
                continue
            for file in files:
                if file.lower().endswith(('.md', '.markdown')):
                    markdown_path = os.path.join(root, file)
                    break
            if markdown_path:
                break
        
        if not markdown_path:
            raise ValueError("No markdown file (.md or .markdown) found in zip file")
        
        # Read markdown content
        with open(markdown_path, 'r', encoding='utf-8') as f:
            markdown_content = f.read()
        
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
        
        return markdown_content, images, {"markdown_path": markdown_path}
    
    except zipfile.BadZipFile:
        raise ValueError("Invalid zip file")
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Error processing zip file: {str(e)}")
    finally:
        if temp_dir:
            shutil.rmtree(temp_dir, ignore_errors=True)


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
