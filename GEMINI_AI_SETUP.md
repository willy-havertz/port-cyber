# Google Gemini AI Integration Setup Guide

## Overview

Your portfolio now supports **AI-generated content** for writeup sections using Google's Gemini AI. When you click the purple sparkle ✨ button in the admin panel, it automatically generates:

- **Methodology** - Step-by-step approach
- **Tools Used** - Relevant cybersecurity tools
- **Key Findings** - Security vulnerabilities discovered
- **Lessons Learned** - Educational takeaways

---

## Setup Steps

### 1. Get a Free Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API key"**
4. Copy your API key (starts with `AIza...`)

**Free Tier Limits:**

- 60 requests per minute
- Completely free, no credit card needed
- Perfect for occasional writeup generation

---

### 2. Add API Key to Your Environment

#### **For Local Development:**

Add to `backend/.env`:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
AI_GENERATION_ENABLED=true
```

#### **For Production (Railway/Render/Vercel):**

Add environment variables in your hosting platform:

- **GEMINI_API_KEY** = `your-api-key-here`
- **AI_GENERATION_ENABLED** = `true`

---

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs `google-generativeai==0.8.0` (already added to requirements.txt)

---

### 4. Run Database Migration

```bash
cd backend
alembic upgrade head
```

This adds the new database columns for storing AI-generated content.

---

### 5. Test the Integration

1. Start your backend:

   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Open admin panel: `http://localhost:5173/admin`

3. Click the **purple sparkle ✨ icon** next to any writeup

4. Wait 3-5 seconds for AI generation

5. View the writeup detail page to see AI-generated sections!

---

## How It Works

### **Data Flow:**

```
Admin clicks ✨ button
      ↓
POST /api/writeups/{id}/generate
      ↓
Backend sends writeup info to Gemini:
  - Title: "Linux Privilege Escalation"
  - Category: "Linux"
  - Difficulty: "Easy"
      ↓
Gemini returns JSON with sections
      ↓
Saved to database (methodology, tools_used, key_findings, lessons_learned)
      ↓
Frontend fetches writeup
      ↓
WriteupDetail.tsx displays AI content if available,
otherwise falls back to hardcoded templates
```

---

## Frontend Display Logic

In [src/pages/WriteupDetail.tsx](../src/pages/WriteupDetail.tsx):

```tsx
const generateMethodology = (): string[] => {
  // Use AI-generated content if available
  if (writeup.methodology && Array.isArray(writeup.methodology)) {
    return writeup.methodology; // ✅ AI-powered
  }

  // Fall back to hardcoded logic
  return [...hardcodedSteps]; // ⚙️ Fallback
};
```

---

## Cost & Limits

### **Google Gemini Free Tier:**

- **60 requests/minute**
- **1,500 requests/day**
- **100% free forever**
- No credit card required

### **Per Writeup:**

- ~1 API call per writeup generation
- Takes 2-5 seconds
- Generates ~500 tokens

You can generate **1,500 writeups per day** for free!

---

## Troubleshooting

### ❌ Error: "AI generation is not enabled or API key not configured"

**Solution:**

1. Check `backend/.env` has `GEMINI_API_KEY` set
2. Restart your backend server
3. Verify `AI_GENERATION_ENABLED=true`

### ❌ Error: "Failed to generate AI content"

**Solution:**

1. Check your API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Verify you're not hitting rate limits (60/min)
3. Check backend logs for detailed error messages

### ✅ Content looks generic?

This is expected! AI only knows:

- Writeup title
- Category
- Difficulty
- Platform

For **more accurate content**, you'd need to:

1. Extract PDF text first
2. Pass actual exploit details to AI
3. This increases cost/latency

Current approach balances quality with speed.

---

## Disabling AI (Use Fallback Only)

If you want to disable AI and only use hardcoded templates:

**Option 1 - Environment Variable:**

```env
AI_GENERATION_ENABLED=false
```

**Option 2 - Remove API Key:**
Delete `GEMINI_API_KEY` from environment

Writeups will still work perfectly with fallback templates!

---

## Database Schema

New columns added to `writeups` table:

| Column            | Type | Description            |
| ----------------- | ---- | ---------------------- |
| `methodology`     | TEXT | JSON array of steps    |
| `tools_used`      | TEXT | JSON array of tools    |
| `key_findings`    | TEXT | JSON array of findings |
| `lessons_learned` | TEXT | JSON array of lessons  |

Stored as JSON strings, parsed automatically by Pydantic.

---

## Next Steps

Want to improve accuracy? Consider:

1. **Extract PDF text** and pass to AI for context
2. **Hybrid approach**: Admin can edit AI-generated content
3. **Prompt engineering**: Customize prompts in `backend/app/utils/ai_generator.py`
4. **Upgrade to Gemini Pro**: More tokens, better quality

---

## Support

If you encounter issues:

1. Check backend logs: `uvicorn main:app --log-level debug`
2. Verify API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Test endpoint manually: `POST http://localhost:8000/api/writeups/1/generate`

Happy hacking! 🚀
