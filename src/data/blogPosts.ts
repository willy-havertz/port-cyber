// Example blog post data
export const blogPosts = [
  {
    id: "1",
    title: "Welcome to the Blog!",
    date: "2026-01-21",
    author: "Admin",
    excerpt:
      "This is the first post on our new blog. Stay tuned for updates on cybersecurity, tech, and more!",
    content: `# Welcome to the Blog!

This is the first post on our new blog. We will share updates, tutorials, and insights on cybersecurity, technology, and our journey. Stay tuned!`,
    coverImage:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    tags: ["announcement", "introduction"],
    readingTime: 2,
    category: "General",
  },
  {
    id: "2",
    title: "How to Stay Safe Online",
    date: "2026-01-20",
    author: "Jane Doe",
    excerpt:
      "Practical tips for protecting your digital life from cyber threats.",
    content: `# How to Stay Safe Online

Here are some practical tips to protect yourself from cyber threats...`,
    coverImage:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    tags: ["guide", "safety", "basics"],
    readingTime: 4,
    category: "How-To",
  },
  {
    id: "3",
    title: "Latest Cybersecurity News: January 2026",
    date: "2026-01-19",
    author: "CyberSec Team",
    excerpt:
      "A roundup of the most important cybersecurity news and threat alerts this month.",
    content: `# Latest Cybersecurity News: January 2026\n\nStay updated with the latest breaches, vulnerabilities, and security trends. This month: new ransomware campaigns, critical software patches, and more.`,
    coverImage:
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
    tags: ["news", "threats", "update"],
    readingTime: 3,
    category: "News",
  },
  {
    id: "4",
    title: "Step-by-Step: Setting Up Two-Factor Authentication (2FA)",
    date: "2026-01-18",
    author: "Admin",
    excerpt: "A practical guide to enabling 2FA for your accounts.",
    content: `# Step-by-Step: Setting Up Two-Factor Authentication (2FA)\n\nLearn how to add an extra layer of security to your online accounts with 2FA. We cover authenticator apps, SMS, and hardware keys.`,
    coverImage:
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80",
    tags: ["2fa", "guide", "security"],
    readingTime: 5,
    category: "How-To",
  },
  {
    id: "5",
    title: "CVE-2026-12345: Deep Dive into a Critical Vulnerability",
    date: "2026-01-17",
    author: "Security Researcher",
    excerpt:
      "Analysis of a recent high-impact vulnerability and how to mitigate it.",
    content: `# CVE-2026-12345: Deep Dive\n\nWe break down the latest critical vulnerability, how it works, and what you can do to stay protected.`,
    coverImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    tags: ["vulnerability", "cve", "deep dive"],
    readingTime: 6,
    category: "Vulnerabilities",
  },
  {
    id: "6",
    title: "Case Study: The 2025 MegaCorp Data Breach",
    date: "2026-01-16",
    author: "Jane Doe",
    excerpt:
      "What happened, how it happened, and lessons learned from a major breach.",
    content: `# Case Study: The 2025 MegaCorp Data Breach\n\nA real-world look at a major data breach, the attack chain, and how organizations can defend against similar threats.`,
    coverImage:
      "https://images.unsplash.com/photo-1463438690606-f6778b8c1d10?auto=format&fit=crop&w=800&q=80",
    tags: ["case study", "breach", "incident"],
    readingTime: 7,
    category: "Case Study",
  },
  {
    id: "7",
    title: "Top 5 Password Managers Reviewed",
    date: "2026-01-15",
    author: "CyberSec Team",
    excerpt: "We review the best password managers for security and usability.",
    content: `# Top 5 Password Managers Reviewed\n\nA comparison of the leading password managers, their features, and which one is right for you.`,
    coverImage:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
    tags: ["review", "tools", "password manager"],
    readingTime: 4,
    category: "Reviews",
  },
  {
    id: "8",
    title: "Penetration Testing Walkthrough: Web App Edition",
    date: "2026-01-14",
    author: "Admin",
    excerpt: "A step-by-step walkthrough of a real web application pentest.",
    content: `# Penetration Testing Walkthrough: Web App Edition\n\nFollow along as we test a sample web app for vulnerabilities, from recon to exploitation.`,
    coverImage:
      "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80",
    tags: ["pentest", "walkthrough", "web app"],
    readingTime: 8,
    category: "Pentesting",
  },
  {
    id: "9",
    title: "Security Best Practices for Small Businesses",
    date: "2026-01-13",
    author: "Jane Doe",
    excerpt: "Essential cybersecurity tips for small business owners.",
    content: `# Security Best Practices for Small Businesses\n\nSimple, actionable steps to help small businesses protect their data and reputation.`,
    coverImage:
      "https://images.unsplash.com/photo-1461344577544-4e5dc9487184?auto=format&fit=crop&w=800&q=80",
    tags: ["best practices", "small business", "tips"],
    readingTime: 3,
    category: "Best Practices",
  },
  {
    id: "10",
    title: "Interview: A Day in the Life of a SOC Analyst",
    date: "2026-01-12",
    author: "CyberSec Team",
    excerpt:
      "We interview a Security Operations Center analyst about their daily work and challenges.",
    content: `# Interview: A Day in the Life of a SOC Analyst\n\nInsights from a SOC analyst on monitoring, incident response, and career advice.`,
    coverImage:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    tags: ["interview", "soc", "career"],
    readingTime: 5,
    category: "Interview",
  },
  {
    id: "11",
    title: "Explained: Phishing, Ransomware, and Other Common Attacks",
    date: "2026-01-11",
    author: "Admin",
    excerpt: "A beginner-friendly guide to the most common cyber attacks.",
    content: `# Explained: Phishing, Ransomware, and Other Common Attacks\n\nLearn how these attacks work and how to defend against them.`,
    coverImage:
      "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80",
    tags: ["explained", "phishing", "ransomware", "attacks"],
    readingTime: 4,
    category: "Explainers",
  },
];
