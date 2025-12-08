# Backend Quick Start Guide

Get your FastAPI backend running in minutes!

## Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis
- Docker & Docker Compose (optional, recommended)

## Option 1: Quick Start with Docker (Recommended)

### 1. Setup Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in:

```env
DATABASE_URL=postgresql://portcyber:portcyber123@db:5432/portcyber
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
SECRET_KEY=your-secret-key-change-this
```

### 2. Start Backend

```bash
docker-compose up --build
```

This starts:

- ✅ FastAPI backend on http://localhost:8000
- ✅ PostgreSQL on port 5432
- ✅ Redis on port 6379
- ✅ API docs on http://localhost:8000/docs

### 3. Create Admin User

```bash
# Via API
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 4. Test Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'username=admin&password=password123'
```

---

## Option 2: Local Development Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Setup Database

Install PostgreSQL:

```bash
# macOS
brew install postgresql@15

# Ubuntu
sudo apt-get install postgresql postgresql-contrib

# Windows: Download from https://www.postgresql.org/download/windows/
```

Create database:

```bash
createdb portcyber
```

### 4. Setup Environment

```bash
cp .env.example .env
```

Update `.env`:

```env
DATABASE_URL=postgresql://postgres@localhost:5432/portcyber
SECRET_KEY=dev-secret-key-123
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
REDIS_URL=redis://localhost:6379/0
```

### 5. Start Redis

```bash
# macOS
brew install redis
redis-server

# Ubuntu
sudo apt-get install redis-server
redis-server

# Or Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 6. Run Migrations

```bash
alembic upgrade head
```

### 7. Start Backend

```bash
uvicorn main:app --reload
```

Backend running on http://localhost:8000

---

## Test the API

### Interactive Docs

Open http://localhost:8000/docs in your browser

### Try Upload Writeup

```bash
# 1. Get auth token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -d 'username=admin&password=password123' | jq -r '.access_token')

# 2. Create a test PDF (or use an existing one)
# 3. Upload writeup
curl -X POST http://localhost:8000/api/writeups/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Test Writeup" \
  -F "platform=Try Hack Me" \
  -F "difficulty=Easy" \
  -F "category=Linux" \
  -F "date=2024-01-01" \
  -F "time_spent=1 hour" \
  -F "tags=linux,test" \
  -F "file=@path/to/writeup.pdf"

# 4. Get all writeups
curl http://localhost:8000/api/writeups/
```

---

## Connect Frontend to Backend

### Update Frontend Configuration

Create/update `.env.local`:

```env
VITE_API_URL=http://localhost:8000/api
```

### Install Dependencies

```bash
npm install axios react-query
```

### Update Writeups Component

In `/src/pages/Writeups.tsx`:

```typescript
import { useQuery } from "react-query";
import apiClient from "../lib/api";

const { data: writeups } = useQuery("writeups", async () => {
  const response = await apiClient.get("/writeups/");
  return response.data.items;
});
```

See `BACKEND_INTEGRATION_GUIDE.md` for complete frontend integration.

---

## Common Issues

### PostgreSQL Connection Error

```
Error: could not translate host name "db" to address
```

Solution: Make sure database is running and DATABASE_URL is correct

### Redis Connection Error

```
Error: Cannot connect to Redis
```

Solution: Start Redis or update REDIS_URL

### Port Already in Use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### CORS Errors

Update FRONTEND_URL in .env:

```env
FRONTEND_URL=http://localhost:5173
```

---

## Database Schema

### Users Table

- id (integer, PK)
- username (string, unique)
- email (string, unique)
- hashed_password (string)
- is_admin (boolean)
- is_active (boolean)
- created_at (datetime)

### Writeups Table

- id (integer, PK)
- title (string)
- platform (string)
- difficulty (string)
- category (string)
- date (string)
- time_spent (string)
- writeup_url (string)
- summary (text)
- created_at (datetime)
- updated_at (datetime)

### Comments Table

- id (integer, PK)
- writeup_id (string)
- user_name (string)
- user_email (string)
- content (text)
- is_approved (boolean)
- is_spam (boolean)
- created_at (datetime)

### Tags Table

- id (integer, PK)
- name (string, unique)

### Writeup_Tags (Junction Table)

- writeup_id (FK to writeups)
- tag_id (FK to tags)

---

## Useful Commands

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add new column"

# Apply migrations
alembic upgrade head

# Check migration status
alembic current

# Revert to previous
alembic downgrade -1
```

### Docker Commands

```bash
# View logs
docker-compose logs backend

# Execute command in container
docker-compose exec backend python -c "print('hello')"

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

### Reset Database

```bash
# Drop all tables
alembic downgrade base

# Recreate
alembic upgrade head
```

---

## Next Steps

1. ✅ Backend running
2. ⏳ Connect frontend to API
3. ⏳ Create admin panel components
4. ⏳ Test all features
5. ⏳ Deploy to production

See `BACKEND_INTEGRATION_GUIDE.md` for detailed frontend integration.

---

## Support

For issues:

1. Check `backend/README.md` for full documentation
2. Review `API_SPECIFICATION.md` for endpoint details
3. Check `http://localhost:8000/docs` for interactive API docs
4. Review logs: `docker-compose logs`

---

## Production Deployment

### Railway

1. Connect GitHub repo
2. Add PostgreSQL add-on
3. Add Redis add-on
4. Set environment variables
5. Deploy!

### Render

1. Create new service from GitHub
2. Add PostgreSQL database
3. Add Redis cache
4. Configure environment
5. Deploy!

### DigitalOcean App Platform

1. Create app from GitHub
2. Add PostgreSQL component
3. Add Redis component
4. Set environment variables
5. Deploy!
