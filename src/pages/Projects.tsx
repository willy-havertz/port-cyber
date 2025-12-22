import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProjectCard from "../components/ProjectCard";
import FilterBar from "../components/FilterBar";

export default function Projects() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    []
  );
  
  const projects = useMemo(() => [
    {
      title: "Enterprise Network Security Assessment",
      description:
        "Comprehensive security assessment of a Fortune 500 company's network infrastructure, identifying critical vulnerabilities and providing remediation strategies.",
      technologies: ["Nmap", "Metasploit", "Burp Suite", "Wireshark", "Python"],
      imageUrl:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      githubUrl: "https://github.com",
      date: "Dec 2024",
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
      date: "Dec 2024",
      category: "Tool Development",
    },
    {
      title: "Incident Response Playbook",
      description:
        "Comprehensive incident response framework and playbook for handling various types of security incidents, including malware infections and data breaches.",
      technologies: ["MITRE ATT&CK", "NIST Framework", "PowerShell", "Splunk"],
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      githubUrl: "https://github.com",
      date: "Oct 2024",
      category: "Incident Response",
    },
    {
      title: "Threat Intelligence Platform",
      description:
        "Real-time threat intelligence aggregation platform that collects, analyzes, and correlates threat data from multiple sources to provide actionable insights.",
      technologies: ["Python", "Elasticsearch", "Kibana", "Redis", "Docker"],
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      githubUrl: "https://github.com",
      date: "Sep 2024",
      category: "Threat Intelligence",
    },
    {
      title: "Secure Code Review Framework",
      description:
        "Automated static code analysis framework for identifying security vulnerabilities in web applications during the development lifecycle.",
      technologies: [
        "SonarQube",
        "OWASP ZAP",
        "Jenkins",
        "Python",
        "JavaScript",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      githubUrl: "https://github.com",
      date: "Aug 2024",
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
      githubUrl: "https://github.com",
      date: "Jul 2024",
      category: "Machine Learning",
    },
  ], []);

  // Extract unique categories
  const allCategories = [...new Set(projects.map((p) => p.category))];

  // Filter logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(project.category);
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

          {/* Advanced Filters */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <FilterBar
              categories={allCategories}
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
                  <ProjectCard {...project} />
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
