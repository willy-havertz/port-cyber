# Port Cyber API Specification

Complete API documentation for backend integration.

## Base URL
```
http://localhost:8000/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "user@example.com",
  "password": "string"
}

Response: 201 Created
{
  "id": 1,
  "username": "string",
  "email": "user@example.com",
  "is_admin": false,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Login
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=string&password=string

Response: 200 OK
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "username": "string",
  "email": "user@example.com",
  "is_admin": false,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Writeup Endpoints

### List Writeups
```http
GET /writeups/?skip=0&limit=100&platform=Try Hack Me&category=Linux&difficulty=Easy&search=keyword

Query Parameters:
- skip: int (default: 0)
- limit: int (default: 100)
- platform: string (optional) - "Try Hack Me" or "Hack The Box"
- category: string (optional)
- difficulty: string (optional) - "Easy", "Medium", "Hard", "Insane"
- search: string (optional)

Response: 200 OK
{
  "items": [
    {
      "id": 1,
      "title": "string",
      "platform": "Try Hack Me",
      "difficulty": "Easy",
      "category": "Linux",
      "date": "2024-01-01",
      "time_spent": "2 hours",
      "writeup_url": "/uploads/writeups/...",
      "summary": "string",
      "tags": [
        {"id": 1, "name": "linux"},
        {"id": 2, "name": "privesc"}
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "page_size": 100
}
```

### Get Single Writeup
```http
GET /writeups/{id}

Response: 200 OK
{
  "id": 1,
  "title": "string",
  "platform": "Try Hack Me",
  "difficulty": "Easy",
  "category": "Linux",
  "date": "2024-01-01",
  "time_spent": "2 hours",
  "writeup_url": "/uploads/writeups/...",
  "summary": "string",
  "tags": [...],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": null
}
```

### Create Writeup (Admin Only)
```http
POST /writeups/
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Form Data:
- title: string (required)
- platform: string (required) - "Try Hack Me" or "Hack The Box"
- difficulty: string (required)
- category: string (required)
- date: string (required) - format: YYYY-MM-DD
- time_spent: string (required) - e.g., "2 hours"
- summary: string (optional)
- tags: string (comma-separated, optional)
- file: binary (required) - PDF file

Response: 201 Created
{
  "id": 1,
  "title": "string",
  "platform": "Try Hack Me",
  ...
}

Note: Tags are auto-suggested from PDF content
```

### Update Writeup (Admin Only)
```http
PUT /writeups/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "string" (optional),
  "platform": "string" (optional),
  "difficulty": "string" (optional),
  "category": "string" (optional),
  "date": "string" (optional),
  "time_spent": "string" (optional),
  "summary": "string" (optional),
  "tags": ["tag1", "tag2"] (optional)
}

Response: 200 OK
{ writeup object }
```

### Delete Writeup (Admin Only)
```http
DELETE /writeups/{id}
Authorization: Bearer {admin_token}

Response: 204 No Content
```

### Search Writeups
```http
GET /writeups/search/?q=keyword&skip=0&limit=50

Query Parameters:
- q: string (required) - search query
- skip: int (default: 0)
- limit: int (default: 50)

Response: 200 OK
{
  "items": [...],
  "total": 5,
  "page": 1,
  "page_size": 50
}
```

---

## Comment Endpoints

### Get Comments for Writeup
```http
GET /comments/{writeup_id}

Response: 200 OK
[
  {
    "id": 1,
    "writeup_id": "fowsniff",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "content": "Great writeup!",
    "is_approved": true,
    "is_spam": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": null
  }
]
```

### Create Comment
```http
POST /comments/
Content-Type: application/json

{
  "writeup_id": "fowsniff",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "content": "Great writeup!"
}

Response: 201 Created
{
  "id": 1,
  "writeup_id": "fowsniff",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "content": "Great writeup!",
  "is_approved": true,
  "is_spam": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": null
}

Note: Auto-checked for spam. Approved unless flagged.
```

### Get Pending Comments (Admin Only)
```http
GET /comments/admin/pending
Authorization: Bearer {admin_token}

Response: 200 OK
[
  {
    "id": 1,
    "writeup_id": "fowsniff",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "content": "CLICK HERE TO WIN FREE MONEY!!!",
    "is_approved": false,
    "is_spam": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Moderate Comment (Admin Only)
```http
PATCH /comments/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "is_approved": true,
  "is_spam": false
}

Response: 200 OK
{ updated comment object }
```

### Delete Comment (Admin Only)
```http
DELETE /comments/{id}
Authorization: Bearer {admin_token}

Response: 204 No Content
```

---

## Security Scanner Endpoints

### Perform Scan
```http
POST /scanner/scan
Authorization: Bearer {token}
Content-Type: application/json

{
  "target_url": "https://example.com",
  "scan_type": "basic"
}

Query Parameters:
- scan_type: string - "basic", "full", or "aggressive"

Response: 200 OK
{
  "target": "https://example.com",
  "status": "completed",
  "vulnerabilities": [
    {
      "type": "Missing Security Header",
      "severity": "Low",
      "header": "X-Frame-Options",
      "description": "Missing X-Frame-Options header"
    },
    {
      "type": "Open Port",
      "severity": "Info",
      "port": 22,
      "service": "ssh",
      "description": "Port 22 is open running ssh"
    }
  ],
  "scan_type": "basic",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Get Scanner Disclaimer
```http
GET /scanner/disclaimer

Response: 200 OK
{
  "message": "Security Scanner Disclaimer",
  "terms": [
    "Only scan targets you own or have explicit permission to test",
    "Unauthorized scanning may be illegal in your jurisdiction",
    "This tool is for educational purposes only",
    "Rate limits apply: 5 scans per user session",
    "Results are basic and may contain false positives/negatives"
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Only PDF files are allowed"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Writeup not found"
}
```

### 429 Too Many Requests
```json
{
  "detail": "Scan limit exceeded. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Scan failed: Connection timeout"
}
```

---

## Rate Limiting

- Scanner: 5 scans per user per session
- Comments: No limit (spam filtered automatically)
- General: No explicit limit (implement as needed)

---

## Auto-Suggested Tags

When uploading a writeup PDF, the system automatically detects and suggests tags:

Common Tags (auto-detected):
- `sql-injection` - SQL injection vulnerabilities
- `xss` - Cross-site scripting
- `privesc` - Privilege escalation
- `buffer-overflow` - Buffer overflow exploits
- `reverse-shell` - Reverse shell techniques
- `port-scanning` - Network reconnaissance
- `web` - Web application testing
- `linux` - Linux systems
- `windows` - Windows systems
- `network` - Network penetration testing
- `forensics` - Digital forensics
- `cryptography` - Cryptographic challenges
- `steganography` - Steganography techniques
- `enumeration` - System enumeration
- `exploit` - Exploit development
- `metasploit` - Metasploit framework
- `nmap` - Nmap tool usage
- `burp-suite` - Burp Suite usage
- `wireshark` - Network analysis
- `password-cracking` - Password cracking
- `brute-force` - Brute force attacks
- `directory-bruteforce` - Directory enumeration
- `docker` - Docker containers
- `kubernetes` - Kubernetes orchestration

---

## Swagger Documentation

Access interactive API docs:
```
http://localhost:8000/docs
```

Redoc alternative docs:
```
http://localhost:8000/redoc
```

---

## Example Usage with cURL

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "securepassword"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'username=admin&password=securepassword'
```

### Upload Writeup
```bash
TOKEN="your_access_token"
curl -X POST http://localhost:8000/api/writeups/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Linux Privilege Escalation" \
  -F "platform=Try Hack Me" \
  -F "difficulty=Easy" \
  -F "category=Linux" \
  -F "date=2024-01-01" \
  -F "time_spent=2 hours" \
  -F "tags=linux,privesc,enumeration" \
  -F "file=@writeup.pdf"
```

### Get Writeups
```bash
curl http://localhost:8000/api/writeups/?limit=10
```

### Create Comment
```bash
curl -X POST http://localhost:8000/api/comments/ \
  -H "Content-Type: application/json" \
  -d '{
    "writeup_id": "fowsniff",
    "user_name": "Jane Doe",
    "user_email": "jane@example.com",
    "content": "Very helpful writeup, thanks!"
  }'
```

---

## Integration Checklist

- [ ] Set up environment variables (`.env`)
- [ ] Install Python dependencies: `pip install -r requirements.txt`
- [ ] Run database migrations: `alembic upgrade head`
- [ ] Create admin user via register endpoint
- [ ] Test all endpoints with cURL or Postman
- [ ] Set up frontend API client
- [ ] Connect React components to API endpoints
- [ ] Implement authentication state management
- [ ] Test file uploads with PDFs
- [ ] Verify comment system works
- [ ] Test security scanner
- [ ] Set up CORS correctly for production domain
- [ ] Deploy to production environment
