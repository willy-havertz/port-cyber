# Wiltord Ichingwa - Cybersecurity Portfolio

A modern, responsive portfolio website showcasing ethical hacking, penetration testing projects, security analyses, and CTF writeups.

## 🚀 Features

- **Modern Tech Stack**: Built with Vite, React, and TypeScript
- **Dark Mode Support**: Seamless theme switching with persistent preferences
- **Responsive Design**: Optimized for all devices using Tailwind CSS
- **Backend Integration**: Supabase for contact form and data management
- **Email Notifications**: Automated email delivery using Resend API
- **Custom Branding**: Unique geometric WI logo design
- **Interactive UI**: Smooth animations with Framer Motion
- **CTF Writeup Detail Pages**: Dedicated web pages for each writeup with structured content (methodology, findings, tools, lessons learned)
- **PDF Integration**: Embedded PDF viewer with page navigation and download functionality
- **Professional Resume**: Interactive resume modal with contact information and skill sections

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Email**: Resend API
- **Routing**: React Router
- **Form Handling**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PDF Handling**: react-pdf + pdfjs-dist

## 📋 Prerequisites

### Option 1: Docker (Recommended)

- Docker and Docker Compose installed

### Option 2: Manual Setup

- Node.js 20+
- npm or yarn
- Supabase account (optional - for contact form)
- Resend API key (optional - for email notifications)

## 🔧 Installation

### Using Docker (Quick Start)

1. Clone the repository:

```bash
git clone https://github.com/willy-havertz/port-cyber.git
cd port-cyber
```

2. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key
```

3. Build and run with Docker Compose:

```bash
docker-compose up -d
```

4. Access the application at `http://localhost:3000`

To stop the container:

```bash
docker-compose down
```

### Manual Installation

1. Clone the repository:

```bash
git clone https://github.com/willy-havertz/port-cyber.git
cd port-cyber
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key
```

4. Start the development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## 🗄️ Database Setup (Optional - for Contact Form)

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Run this SQL to create the contacts table:

```sql
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

3. Enable Row Level Security and create a policy:

```sql
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts"
ON contacts FOR INSERT
TO anon
WITH CHECK (true);
```

4. Set up the email trigger (requires Resend API key):

```sql
CREATE OR REPLACE FUNCTION notify_owner_on_new_contact()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM http_post(
    'https://api.resend.com/emails',
    json_build_object(
      'from', 'Portfolio Contact <onboarding@resend.dev>',
      'to', array['your-email@example.com'],
      'subject', 'New Contact Form Submission',
      'html', '<html>...</html>'
    )::text,
    'application/json',
    ARRAY[http_header('Authorization', 'Bearer ' || current_setting('app.resend_api_key'))]
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_contact_created
AFTER INSERT ON contacts
FOR EACH ROW
EXECUTE FUNCTION notify_owner_on_new_contact();
```

## 📁 Project Structure

```
port-cyber/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── writeups/          # PDF writeup files
├── src/
│   ├── components/
│   │   ├── AnalysisCard.tsx
│   │   ├── ExperienceCard.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── PDFViewerModal.tsx     # Custom PDF viewer with navigation
│   │   ├── ProjectCard.tsx
│   │   ├── Resume.tsx              # Professional resume component
│   │   ├── ResumeModal.tsx         # Resume display modal
│   │   ├── WriteupCard.tsx
│   │   ├── WriteupContentModal.tsx # Writeup metadata display
│   │   └── XIcon.tsx
│   ├── contexts/
│   │   ├── ThemeContext.tsx
│   │   ├── ThemeContextType.ts
│   │   └── useTheme.ts
│   ├── data/
│   │   └── writeups.ts            # Writeup detail data (extracted from PDFs)
│   ├── lib/
│   │   └── supabase.ts
│   └── pages/
│       ├── Analyses.tsx
│       ├── Contact.tsx
│       ├── Experience.tsx
│       ├── Home.tsx
│       ├── NotFound.tsx
│       ├── Projects.tsx
│       ├── Writeups.tsx           # Writeup listing page
│       └── WriteupDetail.tsx      # Individual writeup detail page
├── App.tsx
├── index.tsx
├── styles.css
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── vercel.json
└── README.md
```

## 📝 Adding New Writeups

To add a new CTF writeup to your portfolio:

1. **Add writeup data** to `src/data/writeups.ts`:

```typescript
export const newWriteup: WriteupDetail = {
  id: "unique-id",
  title: "Challenge Title - Description",
  platform: "Hack The Box" | "Try Hack Me",
  difficulty: "Easy" | "Medium" | "Hard" | "Insane",
  category: "Category Name",
  date: "Month DD, YYYY",
  timeSpent: "X hours",
  tags: ["tag1", "tag2", "tag3"],
  writeupUrl: "/writeups/filename.pdf",
  overview: "Brief overview of the challenge",
  methodology: [
    "Step 1: Description",
    "Step 2: Description",
    "Step 3: Description"
  ],
  keyFindings: [
    "Finding 1",
    "Finding 2",
    "Finding 3"
  ],
  toolsUsed: [
    "Tool Name - Description",
    "Tool Name - Description"
  ],
  lessonsLearned: [
    "Lesson 1",
    "Lesson 2",
    "Lesson 3"
  ]
};
```

2. **Add to the writeups map** in `src/data/writeups.ts`:

```typescript
export const writeupDetailsMap: Record<string, WriteupDetail> = {
  "new-id": newWriteup,
  // ... existing writeups
};
```

3. **Add to Writeups.tsx** with the same ID:

```typescript
{
  id: "new-id",
  title: "Challenge Title - Description",
  platform: "Try Hack Me",
  difficulty: "Medium",
  category: "Category",
  date: "Month DD, YYYY",
  timeSpent: "X hours",
  writeupUrl: "/writeups/filename.pdf",
  tags: ["tag1", "tag2", "tag3"]
}
```

4. **Upload PDF** to `public/writeups/` directory

Each writeup will automatically get:
- A dedicated detail page at `/writeups/:id`
- A card on the writeups listing page
- Structured content display (overview, methodology, findings, tools, lessons)
- Link to full PDF with embedded viewer

## 🎨 Customization

- **Colors**: Edit `tailwind.config.js` to customize the color scheme
- **Fonts**: Configured in `index.html` (currently using Dancing Script and Inter from Google Fonts)
- **Content**: Update data arrays in page components and `src/data/writeups.ts`
- **Logo**: Custom SVG components in `src/components/` and `public/favicon.svg`
- **Theme**: Toggle dark mode support in the header

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy with `npm run build` as build command
5. Output directory: `dist`

### Docker Deployment

Build and push Docker image:

```bash
docker build -t your-registry/port-cyber:latest .
docker push your-registry/port-cyber:latest
```

### Other Platforms

The application is a static React build and can be deployed to:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 📦 Build Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## 🔐 Security Notes

- API keys should be in environment variables
- `.env` file is in `.gitignore`
- Contact form uses CORS and server-side validation
- PDF files are served from `public/` directory
- All user input is validated with Zod

## 📄 Features Detail

### CTF Writeup Pages
- Dedicated page for each writeup at `/writeups/:id`
- Sections: Overview, Methodology, Key Findings, Tools Used, Lessons Learned
- Direct link to PDF with custom viewer
- Responsive design with smooth animations
- Dark mode support

### PDF Viewer
- Custom page navigation controls
- Support for large PDFs
- Mobile-friendly interface
- Download button
- Uses pdfjs-dist for reliable PDF rendering

### Professional Resume
- Interactive resume modal
- Professional formatting
- Contact information with working links
- Skills, experience, education sections
- Printable layout

## 📞 Contact & Support

For questions or issues:
1. Open an issue on GitHub
2. Use the contact form on the website
3. Email through the contact page

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Framework**: Vite + React
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **Backend**: Supabase
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Dancing Script, Inter)

---

**Built with ❤️ by Wiltord Ichingwa**

**Last Updated**: December 8, 2025
