# Port Cyber Backend API

FastAPI backend for Wiltord's cybersecurity portfolio.

## Features

- **Authentication System**: JWT-based auth with admin roles
- **Writeup Management**: Upload PDFs with automatic metadata extraction and tag suggestion
- **Comment System**: Real-time comments with Supabase integration and spam filtering
- **Security Scanner**: Live vulnerability scanning demo with Nmap integration
- **Full-Text Search**: Search across writeups by title, tags, and content

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis (for Celery tasks)
- Docker & Docker Compose (optional)

### Local Development

1. **Clone and navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

5. **Run database migrations**

   ```bash
   alembic upgrade head
   ```

6. **Start the server**

   ```bash
   uvicorn main:app --reload
   ```

   API will be available at: http://localhost:8000
   API docs: http://localhost:8000/docs

### Docker Setup

1. **Build and run with Docker Compose**

   ```bash
   docker-compose up --build
   ```

   This starts:

   - FastAPI backend on port 8000
   - PostgreSQL on port 5432
   - Redis on port 6379

2. **Run migrations in Docker**

   ```bash
   docker-compose exec backend alembic upgrade head
   ```

3. **Create admin user**
   ```bash
   docker-compose exec backend python scripts/create_admin.py
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Writeups

- `GET /api/writeups/` - List all writeups (with filtering)
- `GET /api/writeups/{id}` - Get specific writeup
- `POST /api/writeups/` - Upload new writeup (admin only)
- `PUT /api/writeups/{id}` - Update writeup (admin only)
- `DELETE /api/writeups/{id}` - Delete writeup (admin only)
- `GET /api/writeups/search/?q=query` - Search writeups

### Comments

- `GET /api/comments/{writeup_id}` - Get comments for writeup
- `POST /api/comments/` - Create new comment
- `GET /api/comments/admin/pending` - Get pending comments (admin)
- `PATCH /api/comments/{id}` - Moderate comment (admin)
- `DELETE /api/comments/{id}` - Delete comment (admin)

### Security Scanner

- `POST /api/scanner/scan` - Perform security scan
- `GET /api/scanner/disclaimer` - Get scanner disclaimer

## Project Structure

```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   ├── auth.py
│   │   ├── writeups.py
│   │   ├── comments.py
│   │   └── scanner.py
│   ├── core/             # Core configuration
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py
│   │   ├── writeup.py
│   │   └── comment.py
│   ├── schemas/          # Pydantic schemas
│   │   ├── user.py
│   │   ├── writeup.py
│   │   └── comment.py
│   └── utils/            # Utility functions
│       ├── pdf_processor.py
│       └── spam_filter.py
├── alembic/              # Database migrations
├── uploads/              # Uploaded files
├── main.py               # FastAPI app entry point
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/portcyber
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:5173
UPLOAD_DIR=uploads/writeups
MAX_FILE_SIZE=10485760
```

## Deployment

### Railway / Render

1. Create new service from GitHub repo
2. Set environment variables
3. Add PostgreSQL and Redis addons
4. Deploy!

### AWS / DigitalOcean

1. Set up EC2 / Droplet with Docker
2. Clone repo and copy `.env`
3. Run `docker-compose up -d`
4. Configure nginx as reverse proxy

## Security Notes

- Only scan targets you have permission to test
- Rate limiting is enforced on scanner endpoints
- Admin endpoints require JWT authentication
- Spam filtering is basic - enhance for production use

## License

MIT
