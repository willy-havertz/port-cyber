# ZIP to Markdown Writeup Implementation

## Overview

This implementation adds support for uploading writeups as ZIP files containing a README.md and images, alongside the existing PDF support.

## Files Created/Modified

### New Files

1. **backend/app/utils/zip_processor.py**
   - `extract_and_process_zip()`: Extracts zip file, validates structure, returns README content and images
   - `validate_readme_structure()`: Validates README.md exists and has adequate content

### Modified Files

1. **backend/app/models/writeup.py**

   - Added `writeup_content` field (Text) - stores markdown content
   - Added `content_type` field (String) - 'pdf' or 'markdown'
   - Made `writeup_url` nullable for markdown-based writeups

2. **backend/app/api/writeups.py**

   - Updated `create_writeup()` endpoint to handle both PDF and ZIP files
   - Added `extract_summary_from_markdown()` helper function
   - Added `/writeups/{id}/content` endpoint to retrieve markdown content
   - ZIP upload flow:
     1. Validates zip file structure
     2. Extracts README.md and images
     3. Saves images locally to `/uploads/writeups/{title}/`
     4. Stores markdown content in database
     5. Updates image references in markdown to point to public URLs

3. **backend/alembic/versions/add_markdown_support.py** (New Migration)
   - Adds `writeup_content` column
   - Adds `content_type` column
   - Makes `writeup_url` nullable

## Usage

### Uploading a Markdown Writeup

Users should create a ZIP file with this structure:

```
writeup.zip
├── README.md
├── images/
│   ├── image1.png
│   ├── image2.jpg
│   └── screenshots/
│       └── screenshot.png
```

The README.md can reference images using relative paths:

```markdown
# Writeup Title

## Introduction

Some content here...

![Screenshot](images/screenshot.png)
```

### API Endpoints

#### Create Writeup (PDF or ZIP)

```
POST /api/writeups/
Content-Type: multipart/form-data

- title: string
- platform: string
- difficulty: string
- category: string
- date: string
- time_spent: string
- summary: string (optional)
- tags: string (comma-separated, optional)
- file: binary (PDF or ZIP file)
```

#### Get Writeup Details

```
GET /api/writeups/{writeup_id}
```

#### Get Markdown Content

```
GET /api/writeups/{writeup_id}/content
```

Returns:

```json
{
  "id": 1,
  "title": "HTB Machine Name",
  "content": "# Markdown content here...",
  "content_type": "markdown"
}
```

## Frontend Integration (Next Steps)

The frontend WriteupDetail page should:

1. Check `content_type` field from writeup details
2. If `content_type === "markdown"`:
   - Fetch content from `/api/writeups/{id}/content`
   - Render using a markdown renderer (react-markdown, remark, etc.)
   - Serve images from `/public/writeups/{title}/`
3. If `content_type === "pdf"`:
   - Continue with existing PDF viewer logic

## Notes

- Images are stored locally in the filesystem at `/uploads/writeups/{title}/`
- Image references in markdown are automatically updated to point to public URLs
- Auto-generated summaries are extracted from the first paragraph of the README
- Both PDF and ZIP uploads are validated with virus scanning
