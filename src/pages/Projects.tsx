import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProjectCard from "../components/ProjectCard";
import FilterBar from "../components/FilterBar";

type Project = {
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  githubUrl?: string;
  liveUrl?: string;
  date?: string;
  category?: string;
  stars?: number;
  updated_at?: string;
};

const CACHE_KEY = "pc_projects_cache_v2"; // bump to invalidate stale caches
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

const defaultProjects: Project[] = [
  {
    title: "Advanced Security Tools Suite",
    description:
      "Comprehensive suite of interactive security testing tools: Password strength analyzer with breach detection, Phishing email detector, SSL/TLS certificate analyzer, Code review scanner, Network security assessment, Threat intelligence CVE dashboard, API audit platform, and Incident response orchestrator. All tools feature real-time toast notifications and are fully functional with live backend integration.",
    technologies: [
      "React",
      "FastAPI",
      "Python",
      "TypeScript",
      "Tailwind CSS",
      "sonner",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/willy-havertz/port-cyber-experiments",
    liveUrl: "https://port-cyber-experiments.onrender.com",
    date: "Dec 2025",
    category: "Tool Development",
  },
  {
    title: "Enterprise Network Security Assessment",
    description:
      "Comprehensive security assessment of a Fortune 500 company's network infrastructure, identifying critical vulnerabilities and providing remediation strategies.",
    technologies: ["Nmap", "Metasploit", "Burp Suite", "Wireshark", "Python"],
    imageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/willy-havertz/port-cyber-network-security",
    liveUrl: "https://port-cyber-experiments.onrender.com?tab=network",
    date: "Dec 2025",
    category: "Penetration Testing",
  },
  {
    title: "Automated Vulnerability Scanner",
    description:
      "Production-ready FastAPI scanner with SSRF-safe IP validation, security header audits, XSS/SQLi detection, CORS analysis, per-user rate limiting, and Docker deployment.",
    technologies: ["Python", "FastAPI", "Docker", "JWT", "SQLAlchemy"],
    imageUrl:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/willy-havertz/port-cyber-scanner",
    liveUrl: "https://port-cyber-experiments.onrender.com?tab=scanner",
    date: "Dec 2025",
    category: "Tool Development",
  },
  {
    title: "Incident Response Playbook",
    description:
      "Comprehensive incident response framework and playbook for handling various types of security incidents, including malware infections and data breaches.",
    technologies: ["MITRE ATT&CK", "NIST Framework", "PowerShell", "Splunk"],
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/willy-havertz/port-cyber-incident-response",
    liveUrl: "https://port-cyber-experiments.onrender.com?tab=incident",
    date: "Dec 2025",
    category: "Incident Response",
  },
  {
    title: "Threat Intelligence Platform",
    description:
      "Real-time threat intelligence aggregation platform that collects, analyzes, and correlates threat data from multiple sources to provide actionable insights.",
    technologies: ["Python", "Elasticsearch", "Kibana", "Redis", "Docker"],
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/willy-havertz/port-cyber-threat-intel",
    liveUrl: "https://port-cyber-experiments.onrender.com?tab=threat",
    date: "Dec 2025",
    category: "Threat Intelligence",
  },
  {
    title: "Secure Code Review Framework",
    description:
      "Automated static code analysis framework for identifying security vulnerabilities in web applications during the development lifecycle.",
    technologies: ["SonarQube", "OWASP ZAP", "Jenkins", "Python", "JavaScript"],
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/willy-havertz/port-cyber-code-review",
    liveUrl: "https://port-cyber-experiments.onrender.com?tab=code",
    date: "Dec 2025",
    category: "Secure Development",
  },
  {
    title: "Phishing Detection System",
    description:
      "Machine learning-based system for detecting and classifying phishing emails using natural language processing and behavioral analysis techniques.",
    technologies: [
      "Python",
      "TensorFlow",
      "scikit-learn",
      "NLTK",
      "PostgreSQL",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/willy-havertz/port-cyber-phishing-detection",
    liveUrl: "https://port-cyber-experiments.onrender.com?tab=phishing",
    date: "Dec 2025",
    category: "Machine Learning",
  },
  {
    title: "Advanced Web Vulnerability Scanner",
    description:
      "Enterprise-grade web application security scanner with TLS/SSL inspection, security header analysis, cookie security flags, OPTIONS method probing, and optional nmap integration for comprehensive vulnerability detection.",
    technologies: ["FastAPI", "Python", "SSL/TLS", "Nmap", "React"],
    imageUrl:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/willy-havertz/port-cyber-advanced-scanner",
    liveUrl: "https://port-cyber-experiments.onrender.com?tab=scanner",
    date: "Dec 2025",
    category: "Tool Development",
  },
  {
    title: "API Security Audit Tool",
    description:
      "Lightweight API security audit platform for testing endpoint authentication, HTTP/HTTPS enforcement, CORS configuration, excessive HTTP methods, and stack trace leakage detection.",
    technologies: ["FastAPI", "Python", "HTTP Methods", "CORS", "React"],
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/willy-havertz/port-cyber-api-audit",
    liveUrl: "https://port-cyber-experiments.onrender.com?tab=api-audit",
    date: "Dec 2025",
    category: "Tool Development",
  },
  {
    title: "CVE Intelligence Dashboard",
    description:
      "Real-time CVE search and intelligence platform with NVD API integration, CVSS severity scoring, publication tracking, and intelligent fallback for offline environments.",
    technologies: ["Python", "NVD API", "FastAPI", "React", "TypeScript"],
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/willy-havertz/port-cyber-cve-intel",
    liveUrl: "https://port-cyber-experiments.onrender.com?tab=cve",
    date: "Dec 2025",
    category: "Threat Intelligence",
  },
  {
    title: "SSL/TLS Certificate Analyzer",
    description:
      "Deep inspection tool for SSL/TLS certificate validation, chain analysis, expiration tracking, signature verification, and modern protocol enforcement (TLS 1.2+).",
    technologies: ["Python", "OpenSSL", "FastAPI", "React", "Cryptography"],
    imageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/willy-havertz/port-cyber-cert-analyzer",
    liveUrl: "https://port-cyber-experiments.onrender.com?tab=certificate",
    date: "Dec 2025",
    category: "Security Analysis",
  },
  {
    title: "Password Strength Analyzer",
    description:
      "Advanced password security assessment tool with entropy calculation, pattern detection, breach database checking, policy compliance validation, and NIST guidelines alignment.",
    technologies: ["Python", "FastAPI", "Regex", "ZXCVBN", "React"],
    imageUrl:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/willy-havertz/port-cyber-password-analyzer",
    liveUrl: "https://port-cyber-experiments.onrender.com?tab=password",
    date: "Dec 2025",
    category: "Security Analysis",
  },
];

export default function Projects() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    []
  );

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const isFresh = parsed?.ts && Date.now() - parsed.ts < CACHE_TTL_MS;
        if (isFresh && Array.isArray(parsed.data)) {
          // merge cached projects with defaults to ensure baseline items exist
          const byKey = new Map<string, Project>();
          for (const p of defaultProjects) {
            const key = p.githubUrl || p.title;
            byKey.set(key, p);
          }
          for (const p of parsed.data as Project[]) {
            const key = p.githubUrl || p.title;
            const base = byKey.get(key) || p;
            byKey.set(key, { ...base, ...p });
          }
          return Array.from(byKey.values());
        }
      }
    } catch {
      // ignore cache errors
    }
    return defaultProjects;
  });

  useEffect(() => {
    let cancelled = false;
    const token = (import.meta.env as any).VITE_GITHUB_TOKEN;

    const load = async () => {
      try {
        const updated = await Promise.all(
          defaultProjects.map(async (p) => {
            if (!p.githubUrl) return p;
            const m = p.githubUrl.match(/github\.com\/([^/]+\/[^/]+)(?:\/|$)/);
            if (!m) return p;
            const repo = m[1];
            try {
              const headers: Record<string, string> = {
                Accept: "application/vnd.github.v3+json",
              };
              if (token) headers["Authorization"] = `token ${token}`;
              const res = await fetch(`https://api.github.com/repos/${repo}`, {
                headers,
              });
              if (!res.ok) return p;
              const data = await res.json();
              const merged: Project = {
                ...p,
                description: data.description || p.description,
                githubUrl: data.html_url || p.githubUrl,
                stars: data.stargazers_count,
                updated_at: data.updated_at,
              };
              return merged;
            } catch {
              return p;
            }
          })
        );

        if (!cancelled) {
          setProjects(updated);
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ ts: Date.now(), data: updated })
            );
          } catch {
            // ignore localStorage errors
          }
        }
      } catch {
        // Ignore fetch/metadata loading errors
      }
    };

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const needRefresh = (() => {
        if (!raw) return true;
        try {
          const parsed = JSON.parse(raw);
          const fresh = parsed?.ts && Date.now() - parsed.ts < CACHE_TTL_MS;
          const cached: Project[] = Array.isArray(parsed?.data)
            ? (parsed.data as Project[])
            : [];
          const lengthMismatch = cached.length < defaultProjects.length;
          const hasScanner = cached.some(
            (p) => p.title === "Automated Vulnerability Scanner"
          );
          return !fresh || lengthMismatch || !hasScanner;
        } catch {
          return true;
        }
      })();
      if (needRefresh) load();
    } catch {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const allCategories = useMemo(
    () => [...new Set(projects.map((p) => p.category).filter(Boolean))],
    [projects]
  );

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        (project.category && selectedCategories.includes(project.category));
      const techMatch =
        selectedTechnologies.length === 0 ||
        selectedTechnologies.some((tech) =>
          project.technologies.includes(tech)
        );
      return categoryMatch && techMatch;
    });
  }, [projects, selectedCategories, selectedTechnologies]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedTechnologies([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors"
    >
      <Header />

      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Security Projects
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              A collection of cybersecurity projects showcasing expertise in
              penetration testing, tool development, incident response, and
              security research.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <FilterBar
              categories={allCategories as string[]}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              onReset={handleReset}
            />
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProjectCard
                    {...project}
                    date={project.date ?? ""}
                    category={project.category ?? ""}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  No projects match your filters. Try adjusting your selection.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
