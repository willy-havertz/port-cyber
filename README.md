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

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Email**: Resend API
- **Routing**: React Router
- **Form Handling**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Resend API key (for email functionality)

## 🔧 Installation

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

## 🗄️ Database Setup

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

4. Set up the email trigger (optional - requires Resend API key):

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

## 📦 Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

## 🚀 Deployment

This project can be deployed to:

- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

Make sure to set your environment variables in your deployment platform.

## 📁 Project Structure

```
port-cyber/
├── public/
│   ├── robots.txt
│   └── writeups/
├── src/
│   ├── components/
│   │   ├── AnalysisCard.tsx
│   │   ├── ExperienceCard.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── WriteupCard.tsx
│   │   └── XIcon.tsx
│   ├── contexts/
│   │   └── ThemeContext.tsx
│   ├── lib/
│   │   └── supabase.ts
│   └── pages/
│       ├── Analyses.tsx
│       ├── Contact.tsx
│       ├── Experience.tsx
│       ├── Home.tsx
│       ├── NotFound.tsx
│       ├── Projects.tsx
│       └── Writeups.tsx
├── App.tsx
├── index.tsx
└── styles.css
```

## 🎨 Customization

- **Colors**: Edit `tailwind.config.js` to customize the color scheme
- **Fonts**: Configured in `index.html` (currently using Dancing Script and Inter)
- **Content**: Update data arrays in page components
- **Logo**: SVG components in `src/components/`

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Contact

For inquiries, visit the [Contact Page](https://your-domain.com/contact) or reach out through the form.

---

**Built with ❤️ by Wiltord Ichingwa**
