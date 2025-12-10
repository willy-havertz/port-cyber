# Contact Form Security Implementation Guide

## Overview

Comprehensive security enhancements have been implemented for the contact form to protect against spam, bots, and abuse.

## Security Features Implemented

### 1. **hCaptcha Integration**

- **Purpose**: Prevent automated bot submissions
- **Implementation**:
  - hCaptcha widget loaded from `https://js.hcaptcha.com/1/api.js`
  - Token validation on backend with hCaptcha API
  - User must complete CAPTCHA before submission
- **Environment Variables Required**:
  ```
  VITE_HCAPTCHA_SITE_KEY=<your_hcaptcha_site_key>
  HCAPTCHA_SECRET_KEY=<your_hcaptcha_secret_key>
  ```
- **Frontend**: `src/pages/Contact.tsx`
- **Backend**: `backend/app/api/contact.py` - `verify_hcaptcha()` function

### 2. **Rate Limiting**

- **Purpose**: Prevent spam and DOS attacks
- **Implementation**:
  - **Per-IP**: 5 requests per hour
  - **Per-Email**: 3 requests per hour
  - In-memory cache with automatic cleanup
- **Enforcement**: Both frontend and backend
  - Frontend: Submit button disabled until CAPTCHA passes
  - Backend: HTTP 429 (Too Many Requests) response
- **Backend Logic**: `backend/app/api/contact.py` - `check_rate_limit()` function

### 3. **Honeypot Field**

- **Purpose**: Catch automated bots that auto-fill forms
- **Implementation**:
  - Hidden input field (`display: none`)
  - Validators expect the field to be empty
  - If filled, submission is blocked
- **Frontend**: `src/pages/Contact.tsx` - honeypot form field
- **Validation**: Zod schema requires empty string (`.max(0)`)

### 4. **Input Validation & Sanitization**

- **Field Length Limits**:
  - Name: 2-100 characters
  - Email: Valid email format, max 255 characters
  - Subject: 5-200 characters
  - Message: 10-5000 characters
- **Zod Schema**: `src/pages/Contact.tsx` - `contactSchema`
- **Backend Validation**: Pydantic `ContactRequest` model in `backend/app/api/contact.py`

### 5. **Spam Detection**

- **Keyword Detection**: Blocks messages containing common spam keywords:
  - "viagra", "casino", "lottery", "claim prize", "bitcoin"
  - Silently rejects without revealing detection
- **Implementation**: `backend/app/api/contact.py` - spam keywords check

### 6. **Suspicious Activity Logging**

- **Purpose**: Track and analyze spam patterns
- **Tables**:
  - `contact_messages`: Legitimate messages
  - `spam_logs`: Failed submission attempts
- **Logged Information**:
  - IP address
  - Email address
  - Name
  - Reason for rejection
  - Full submission data (stored as JSON)
  - Timestamp
- **Database Migration**: `backend/alembic/versions/add_contact_tables.py`

### 7. **Safe Error Handling**

- **Purpose**: Don't expose internal errors to users
- **Frontend**:
  - Generic error messages: "Failed to send message. Please try again later."
  - Rate limit specific: "Too many requests. Please try again in 1 hour."
  - CAPTCHA specific: "CAPTCHA verification failed"
- **Backend**:
  - 400: Invalid input or CAPTCHA failure
  - 429: Rate limit exceeded
  - 500: Configuration error (safe message)
- **Logging**: All errors logged server-side for debugging

## Database Schema

### contact_messages table

```sql
CREATE TABLE contact_messages (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  ip_address VARCHAR(45),  -- Supports IPv6
  created_at DATETIME DEFAULT NOW()
);

CREATE INDEX ix_contact_messages_email ON contact_messages(email);
CREATE INDEX ix_contact_messages_ip_address ON contact_messages(ip_address);
CREATE INDEX ix_contact_messages_created_at ON contact_messages(created_at);
```

### spam_logs table

```sql
CREATE TABLE spam_logs (
  id INTEGER PRIMARY KEY,
  ip_address VARCHAR(45),
  email VARCHAR(255),
  name VARCHAR(100),
  reason VARCHAR(255) NOT NULL,
  contact_data JSON,
  created_at DATETIME DEFAULT NOW()
);

CREATE INDEX ix_spam_logs_ip_address ON spam_logs(ip_address);
CREATE INDEX ix_spam_logs_email ON spam_logs(email);
CREATE INDEX ix_spam_logs_reason ON spam_logs(reason);
CREATE INDEX ix_spam_logs_created_at ON spam_logs(created_at);
```

## API Endpoints

### POST /api/contact

**Request**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Security Inquiry",
  "message": "I would like to discuss security services...",
  "captchaToken": "<hcaptcha_token>"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "Contact message received successfully",
  "id": 123
}
```

**Error Responses**:

- 400: Invalid input or failed CAPTCHA verification
- 429: Rate limit exceeded
- 500: Server configuration error

### GET /api/contact/stats (Admin)

Returns spam statistics for the last 24 hours.

**Response**:

```json
{
  "total_messages": 150,
  "spam_logs_24h": 23,
  "spam_by_reason": [
    { "reason": "Rate limit exceeded", "count": 12 },
    { "reason": "Failed CAPTCHA verification", "count": 8 },
    { "reason": "Spam keywords detected", "count": 3 }
  ]
}
```

## Environment Configuration

### Frontend (.env or .env.local)

```env
VITE_API_URL=https://api.example.com  # Backend API URL
VITE_HCAPTCHA_SITE_KEY=your_site_key  # hCaptcha public key
```

### Backend (.env)

```env
HCAPTCHA_SECRET_KEY=your_secret_key   # hCaptcha private key
DATABASE_URL=postgresql://...          # PostgreSQL connection
```

## Security Best Practices

### For Developers

1. **Never log sensitive data** (passwords, full messages with PII)
2. **Always validate on backend** - don't trust frontend validation
3. **Use HTTPS only** - never send tokens over HTTP
4. **Monitor spam_logs** regularly for patterns
5. **Update keyword list** as new spam patterns emerge

### For Administrators

1. **Review spam logs daily** for false positives
2. **Adjust rate limits** if legitimate users report issues
3. **Backup contact messages** for compliance/audits
4. **Monitor hCaptcha scores** for effectiveness
5. **Update CAPTCHA secret keys** periodically

### For Users

1. **Don't use bots** to fill forms - they will be rejected
2. **Complete the CAPTCHA** - it's required for verification
3. **One legitimate message per hour** from each email
4. **Include descriptive messages** - vague messages may be flagged

## Testing

### Manual Testing Checklist

- [ ] Submit valid form - should succeed
- [ ] Submit form twice quickly - second should be rate-limited
- [ ] Fill honeypot field - should fail silently
- [ ] Skip CAPTCHA - submit button should be disabled
- [ ] Submit with spam keywords - should fail silently
- [ ] Check database for contact_messages entry
- [ ] Check spam_logs for rejection reasons

### Automated Testing

```bash
# Test rate limiting
for i in {1..6}; do
  curl -X POST http://localhost:8000/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","subject":"Test","message":"Testing message","captchaToken":"valid_token"}'
done
# Should see rate limit error after 5 requests
```

## Migration Steps

1. **Apply database migration**:

   ```bash
   cd backend
   alembic upgrade head
   ```

2. **Set environment variables** on deployment platform (Render, Vercel, etc.)

3. **Test in staging** before production deployment

4. **Monitor spam_logs** after deployment for accuracy

5. **Adjust rate limits** based on legitimate user patterns

## Monitoring & Maintenance

### Key Metrics

- Total legitimate contact submissions per day
- Spam rejection rate
- False positives (legitimate messages marked as spam)
- Response times

### Regular Checks

- Weekly: Review spam logs for new patterns
- Monthly: Update spam keyword list if needed
- Quarterly: Review and adjust rate limits
- Annually: Security audit of contact system

## Troubleshooting

### hCaptcha not rendering

- Check VITE_HCAPTCHA_SITE_KEY is set correctly
- Verify hCaptcha CDN is accessible
- Check browser console for errors

### All submissions being rate-limited

- Check server time is synchronized
- Verify RATE_LIMIT_PER_IP and RATE_LIMIT_PER_EMAIL settings
- Check IP extraction logic for load-balanced deployments

### High false positive rate

- Review spam keywords - may be too aggressive
- Check if legitimate messages contain flagged keywords
- Consider adjusting or removing certain keywords

### Database migration errors

- Verify PostgreSQL version compatibility
- Check all environment variables are set
- Ensure backup before migration on production

## References

- [hCaptcha Documentation](https://docs.hcaptcha.com/)
- [OWASP Form Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Rate Limiting Best Practices](https://www.cloudflare.com/learning/bbb/what-is-rate-limiting/)
