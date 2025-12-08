# Port Cyber Backend Integration Guide

Complete guide for integrating the FastAPI backend with your React frontend.

## Backend Overview

### Completed Components

✅ **Authentication System**

- JWT-based auth with password hashing (bcrypt)
- Register/Login/Logout endpoints
- Admin role-based access control
- Token management with expiration

✅ **Writeup Management System**

- PDF upload with file validation
- Automatic metadata extraction (author, title, summary)
- Auto-suggestion of tags based on PDF content analysis
- CRUD operations (Create, Read, Update, Delete)
- Full-text search across writeups
- Filtering by platform, difficulty, category

✅ **Comment System**

- Real-time comments with Supabase integration
- Spam detection and filtering
- Admin moderation tools (approve/reject/delete)
- Profanity checking placeholder

✅ **Security Scanner API**

- Port scanning with Nmap
- SQL injection detection
- XSS vulnerability checks
- Security header analysis
- Rate limiting per user
- Async scan support with background tasks

✅ **Database Setup**

- PostgreSQL models for Users, Writeups, Comments, Tags
- Many-to-many relationship between Writeups and Tags
- Alembic migrations configured

✅ **Deployment Ready**

- Docker & Docker Compose configuration
- Environment variable management
- Health checks and service dependencies

## Frontend Integration Steps

### 1. Install Required Dependencies

```bash
npm install axios react-query
```

### 2. Create API Client

Create `/src/lib/api.ts`:

```typescript
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. Create Admin Pages

#### Admin Login Page (`/src/pages/AdminLogin.tsx`)

```typescript
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../lib/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await apiClient.post("/auth/login", formData);
      localStorage.setItem("access_token", response.data.access_token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Login failed. Check credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Admin Login
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-6 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
          required
        />

        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-black transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
}
```

#### Admin Dashboard (`/src/pages/AdminDashboard.tsx`)

```typescript
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate("/admin/writeups")}
            className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-bold mb-2">Manage Writeups</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Upload, edit, and delete writeups
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/comments")}
            className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-bold mb-2">Moderate Comments</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve comments
            </p>
          </button>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Security Scanner</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Perform security scans
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

#### Writeup Management (`/src/pages/AdminWriteups.tsx`)

```typescript
import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import apiClient from "../lib/api";

export default function AdminWriteups() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("Try Hack Me");
  const [difficulty, setDifficulty] = useState("Easy");
  const [category, setCategory] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [tags, setTags] = useState("");

  const { data: writeups, refetch } = useQuery("writeups", async () => {
    const response = await apiClient.get("/writeups/");
    return response.data.items;
  });

  const uploadMutation = useMutation(
    async (formData: FormData) => {
      const response = await apiClient.post("/writeups/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        setFile(null);
        setTitle("");
        setTags("");
        refetch();
      },
    }
  );

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("platform", platform);
    formData.append("difficulty", difficulty);
    formData.append("category", category);
    formData.append("date", new Date().toLocaleDateString());
    formData.append("time_spent", timeSpent);
    formData.append("tags", tags);
    formData.append("file", file);

    uploadMutation.mutate(formData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Writeups</h1>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow mb-8"
      >
        <h2 className="text-xl font-bold mb-4">Upload New Writeup</h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg dark:bg-slate-700"
          required
        />

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg dark:bg-slate-700"
        >
          <option>Try Hack Me</option>
          <option>Hack The Box</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg dark:bg-slate-700"
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
          <option>Insane</option>
        </select>

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg dark:bg-slate-700"
          required
        />

        <input
          type="text"
          placeholder="Time Spent (e.g., 2 hours)"
          value={timeSpent}
          onChange={(e) => setTimeSpent(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg dark:bg-slate-700"
          required
        />

        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg dark:bg-slate-700"
        />

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.files?.[0] || null)}
          className="w-full px-4 py-2 mb-4 border rounded-lg"
          required
        />

        <button
          type="submit"
          disabled={uploadMutation.isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploadMutation.isLoading ? "Uploading..." : "Upload Writeup"}
        </button>
      </form>

      {/* Writeups List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <h2 className="text-xl font-bold p-8 pb-4">Existing Writeups</h2>
        {writeups?.map((writeup: any) => (
          <div
            key={writeup.id}
            className="border-t p-6 flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{writeup.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {writeup.platform} - {writeup.difficulty}
              </p>
            </div>
            <button className="text-red-600 hover:text-red-800">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Update Frontend Data Source

Modify `/src/pages/Writeups.tsx` to fetch from API:

```typescript
import { useQuery } from "react-query";
import apiClient from "../lib/api";

export default function Writeups() {
  const { data: writeups, isLoading } = useQuery("writeups", async () => {
    const response = await apiClient.get("/writeups/?limit=100");
    return response.data.items;
  });

  if (isLoading) return <div>Loading...</div>;

  // Rest of the component...
}
```

### 5. Connect Comments to Backend

Update `/src/components/WriteupComments.tsx`:

```typescript
import apiClient from "../lib/api";
import { useMutation, useQuery } from "react-query";

export default function WriteupComments({ writeupId }: { writeupId: string }) {
  const { data: comments, refetch } = useQuery(
    ["comments", writeupId],
    async () => {
      const response = await apiClient.get(`/comments/${writeupId}`);
      return response.data;
    }
  );

  const createCommentMutation = useMutation(
    async (data) => {
      const response = await apiClient.post("/comments/", {
        writeup_id: writeupId,
        ...data,
      });
      return response.data;
    },
    {
      onSuccess: () => refetch(),
    }
  );

  // Rest of component...
}
```

## Running the Full Stack

### Development

**Terminal 1 - Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**

```bash
npm run dev
# Add to .env.local:
VITE_API_URL=http://localhost:8000/api
```

### Production with Docker

```bash
# Backend + Database + Redis
cd backend
docker-compose up -d

# Frontend
npm run build
# Deploy to Vercel
```

## Next Steps

1. **Create `.env.local`** in frontend with `VITE_API_URL`
2. **Create `.env`** in backend with database credentials
3. **Run migrations**: `alembic upgrade head` (or auto-run in Docker)
4. **Create admin user**: Use login endpoint to register
5. **Connect components**: Update imports to use API client
6. **Test auth flow**: Login → token stored → API requests include token

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Revert migrations
alembic downgrade -1
```

## Security Checklist

- [ ] Change `SECRET_KEY` in production
- [ ] Use HTTPS only in production
- [ ] Set up rate limiting properly
- [ ] Configure CORS for production domain
- [ ] Validate all file uploads
- [ ] Use environment variables for secrets
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Implement proper error handling
- [ ] Add API request logging

## Troubleshooting

### CORS Errors

Update `FRONTEND_URL` in backend `.env` to your frontend domain

### Database Connection Errors

Verify `DATABASE_URL` format: `postgresql://user:password@host:port/dbname`

### File Upload Issues

Check `UPLOAD_DIR` exists and is writable, verify `MAX_FILE_SIZE`

### Auth Failures

Clear browser storage, verify JWT secret matches between frontend and backend

## Support Resources

- FastAPI Docs: https://fastapi.tiangolo.com/
- SQLAlchemy ORM: https://docs.sqlalchemy.org/
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- JWT Authentication: https://pyjwt.readthedocs.io/
