# 🔐 Security Best Practices Guide

## Overview

This document outlines security best practices for the port-cyber application.

---

## 1. Environment Variables & Secrets Management

### ✅ DO:

```bash
# Store all secrets in .env files (not in git)
.env
.env.local
backend/.env

# Use .env.example files for documentation
.env.example
backend/.env.example
```

### ❌ DON'T:

```javascript
// ❌ Don't hardcode API keys
const API_KEY = "AIzaSy...";

// ❌ Don't commit .env files
git add .env

// ❌ Don't expose in console.log in production
console.log("Secret key:", SECRET_KEY);
```

### Setup Instructions:

**For New Developers:**
```bash
# 1. Copy example files
cp .env.example .env.local
cp backend/.env.example backend/.env

# 2. Ask maintainers for actual values
# 3. Keep .env files out of git (already in .gitignore)
```

**For CI/CD Deployments:**
```yaml
# Use GitHub Secrets for sensitive data
# Settings → Secrets and variables → Actions

env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
```

---

## 2. API Key Rotation

### When to Rotate:
- ✅ **Immediately** if you suspect exposure
- ✅ **Quarterly** for production keys
- ✅ **After** any security incident
- ✅ **Before** deployment if newly generated

### How to Rotate:

**Google Gemini API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. API & Services → Credentials
4. Delete old key
5. Create new key
6. Update `.env` files

**Supabase Keys:**
1. Go to Supabase Dashboard
2. Project Settings → API
3. Copy new anon key
4. Update `.env` files

**Cloudinary:**
1. Go to Cloudinary Dashboard
2. Account Settings → Security
3. Regenerate API Secret
4. Update `.env` files

**PostgreSQL:**
```bash
# Connect to database as admin
ALTER USER portcyber WITH PASSWORD 'new_strong_password';
# Update DATABASE_URL in .env
```

---

## 3. Git Security

### Verify No Secrets Leaked:

```bash
# Search git history for API keys
git log -p --all -S "AIzaSy" | head -50

# Check current tracked files
git ls-files | grep -E "\.(env|key|secret|pem)$"

# Both commands should return NOTHING
```

### Pre-commit Hook (Optional):

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Prevent committing .env files

if git diff --cached --name-only | grep -E "(\.env|\.secrets|\.key)$"; then
    echo "❌ ERROR: Attempting to commit sensitive files!"
    echo "Remember: .env files should NEVER be committed"
    exit 1
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 4. Frontend Security

### XSS Prevention:
```typescript
// ✅ Safe - React escapes by default
<div>{userInput}</div>

// ❌ Unsafe - Never use dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ Safe for markdown - Use libraries
import ReactMarkdown from 'react-markdown'
<ReactMarkdown children={markdown} />
```

### CSRF Protection:
```typescript
// ✅ Always send CSRF tokens with state-changing requests
const response = await fetch('/api/writeups', {
  method: 'POST',
  credentials: 'include',  // Include cookies
  headers: {
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data),
})
```

### Content Security Policy:
```html
<!-- In index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://apis.google.com; 
               img-src 'self' https:; 
               style-src 'self' 'unsafe-inline'">
```

---

## 5. Backend Security

### SQL Injection Prevention:
```python
# ✅ Safe - Use parameterized queries
user = session.query(User).filter(User.id == user_id).first()

# ❌ Unsafe - String concatenation
user = session.execute(f"SELECT * FROM users WHERE id = {user_id}")
```

### Authentication:
```python
# ✅ Use JWT with strong secret
SECRET_KEY = "generate-with: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ✅ Always hash passwords
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed_password = pwd_context.hash(password)

# ❌ Never store plain text passwords
user.password = raw_password  # WRONG!
```

### File Upload Security:
```python
# ✅ Validate file types and size
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

if file.filename.split('.')[-1].lower() not in ALLOWED_EXTENSIONS:
    raise HTTPException(400, "Invalid file type")

if file.size > MAX_FILE_SIZE:
    raise HTTPException(413, "File too large")

# ✅ Use secure filenames
from werkzeug.utils import secure_filename
filename = secure_filename(file.filename)
```

### Rate Limiting:
```python
# ✅ Implement rate limiting on sensitive endpoints
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@router.post("/api/auth/login")
@limiter.limit("5/minute")
async def login(credentials: LoginRequest):
    # Limit to 5 login attempts per minute
    pass
```

---

## 6. Deployment Security

### Docker Security:
```dockerfile
# ✅ Use specific versions, not 'latest'
FROM python:3.11-slim

# ✅ Run as non-root user
RUN useradd -m appuser
USER appuser

# ❌ Never COPY .env files into image
# ❌ Never RUN commands that expose secrets

# ✅ Use secrets or environment variable injection
# When running: docker run -e DATABASE_URL=$DATABASE_URL
```

### Environment Variables in Production:
```bash
# ✅ Use platform-provided secret management

# Render.com
# Dashboard → Environment → Add from .env

# GitHub Actions
# Settings → Secrets → Add GEMINI_API_KEY, etc.

# Vercel
# Project Settings → Environment Variables

# ❌ Never paste secrets into deployment scripts
```

---

## 7. Monitoring & Logging

### What to Log:
```python
# ✅ Log security events
logger.info(f"User {user_id} login successful")
logger.warning(f"Failed login attempt for user {email}")
logger.error(f"Database connection failed")

# ❌ Never log sensitive data
logger.info(f"User password: {password}")  # WRONG!
logger.debug(f"API Key: {api_key}")  # WRONG!
```

### Sensitive Data in Errors:
```python
# ❌ Don't expose sensitive data in error messages
try:
    db.query(User).filter(User.email == email).first()
except Exception as e:
    return {"error": str(e)}  # Might contain SQL

# ✅ Return generic errors to users
except Exception:
    logger.error(f"Database error", exc_info=True)  # Log details internally
    return {"error": "An error occurred"}  # Generic to user
```

---

## 8. Regular Security Tasks

### Weekly:
- [ ] Review recent commits for potential secret leaks
- [ ] Check error logs for suspicious activity

### Monthly:
- [ ] Update dependencies (`npm audit`, `pip audit`)
- [ ] Review access controls and permissions
- [ ] Test rate limiting and DDoS protections

### Quarterly:
- [ ] Rotate API keys
- [ ] Audit database access logs
- [ ] Review user account activity
- [ ] Penetration testing

### Annually:
- [ ] Full security audit
- [ ] Code review for vulnerabilities
- [ ] Update security policies
- [ ] Team security training

---

## 9. Incident Response

### If Secrets Are Leaked:

1. **IMMEDIATELY:**
   ```bash
   # Stop all services
   docker-compose down
   ```

2. **Rotate all exposed keys:**
   - Google Gemini API
   - Supabase tokens
   - Cloudinary credentials
   - Database passwords
   - JWT secrets

3. **Investigate:**
   ```bash
   # Check git history
   git log --all -p | grep -i "AIzaSy"
   
   # Check containers
   docker logs [container] | grep -i "password"
   
   # Check environment
   env | grep -i "secret"
   ```

4. **Notify:**
   - Team members
   - Users (if PII affected)
   - Cloud provider

5. **Commit & Deploy:**
   - Push new `.env` files to production
   - Verify new keys work
   - Update all services

---

## 10. Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Secure Coding Practices](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Python Security](https://python.readthedocs.io/en/latest/library/security_warnings.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## Questions?

Ask the security team or open an issue in the repository.

**Last Updated:** December 26, 2025
