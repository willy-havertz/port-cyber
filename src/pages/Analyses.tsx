import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AnalysisCard from "../components/AnalysisCard";

export default function Analyses() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);

  const analyses = [
    {
      title: "APT29 Campaign Analysis: Cozy Bear's Latest TTPs",
      summary:
        "Deep dive into APT29's recent campaign targeting government entities, analyzing their evolved tactics, techniques, and procedures including new malware variants and persistence mechanisms.",
      category: "Threat Intelligence",
      date: "Dec 1, 2025",
      readTime: "12 min read",
      severity: "Critical" as const,
      tags: ["APT29", "malware-analysis", "government-targets", "persistence"],
      resourceLink: "https://attack.mitre.org/groups/G0007/",
    },
    {
      title: "Zero-Day Vulnerability in Popular CMS Platform",
      summary:
        "Analysis of a recently discovered zero-day vulnerability affecting millions of websites. Includes proof-of-concept, impact assessment, and mitigation strategies.",
      category: "Vulnerability Research",
      date: "Nov 28, 2025",
      readTime: "8 min read",
      severity: "High" as const,
      tags: ["zero-day", "cms", "web-security", "rce"],
      resourceLink: "https://nvd.nist.gov/vuln/search",
    },
    {
      title: "Ransomware Incident Response: LockBit 3.0 Case Study",
      summary:
        "Comprehensive analysis of a LockBit 3.0 ransomware incident, including initial access vectors, lateral movement techniques, and recovery strategies implemented.",
      category: "Incident Response",
      date: "Nov 24, 2025",
      readTime: "15 min read",
      severity: "Critical" as const,
      tags: ["ransomware", "lockbit", "incident-response", "forensics"],
      resourceLink: "https://www.cisa.gov/ransomware",
    },
    {
      title: "Cloud Security Misconfigurations: AWS S3 Bucket Analysis",
      summary:
        "Investigation into common AWS S3 bucket misconfigurations that led to data exposure, including automated detection methods and remediation best practices.",
      category: "Cloud Security",
      date: "Nov 20, 2025",
      readTime: "10 min read",
      severity: "Medium" as const,
      tags: ["aws", "s3", "cloud-security", "data-exposure"],
      resourceLink:
        "https://docs.aws.amazon.com/AmazonS3/latest/userguide/security.html",
    },
    {
      title: "Phishing Campaign Targeting Financial Institutions",
      summary:
        "Analysis of a sophisticated phishing campaign using deepfake technology and social engineering to target banking customers and employees.",
      category: "Social Engineering",
      date: "Nov 15, 2025",
      readTime: "7 min read",
      severity: "High" as const,
      tags: ["phishing", "deepfake", "financial", "social-engineering"],
      resourceLink: "https://www.owasp.org/index.php/Phishing",
    },
    {
      title: "IoT Botnet Analysis: Mirai Variant Targeting Smart Cameras",
      summary:
        "Technical analysis of a new Mirai botnet variant specifically targeting smart security cameras, including C&C infrastructure and mitigation strategies.",
      category: "Malware Analysis",
      date: "Nov 10, 2025",
      readTime: "11 min read",
      severity: "Medium" as const,
      tags: ["iot", "botnet", "mirai", "smart-cameras"],
      resourceLink: "https://www.us-cert.cisa.gov/ncas/alerts/TA21-265A",
    },
    {
      title: "Supply Chain Attack: SolarWinds-Style Compromise Analysis",
      summary:
        "Detailed examination of a supply chain attack similar to SolarWinds, analyzing the attack lifecycle, detection challenges, and prevention strategies.",
      category: "Supply Chain Security",
      date: "Nov 5, 2025",
      readTime: "13 min read",
      severity: "Critical" as const,
      tags: ["supply-chain", "apt", "software-compromise", "detection"],
      resourceLink:
        "https://www.nist.gov/publications/software-supply-chain-security",
    },
    {
      title: "Mobile Banking Trojan: Cerberus Evolution",
      summary:
        "Analysis of the latest Cerberus banking trojan variants, including new evasion techniques, overlay attacks, and mobile security countermeasures.",
      category: "Mobile Security",
      date: "Oct 28, 2025",
      readTime: "9 min read",
      severity: "High" as const,
      tags: ["mobile-malware", "banking-trojan", "cerberus", "android"],
      resourceLink: "https://www.owasp.org/index.php/Mobile_Top_10",
    },
    {
      title: "Kubernetes Security: Container Escape Vulnerabilities",
      summary:
        "In-depth analysis of container escape vulnerabilities in Kubernetes environments, exploring CVEs, exploitation techniques, and defensive strategies for containerized deployments.",
      category: "Cloud Security",
      date: "Oct 20, 2025",
      readTime: "14 min read",
      severity: "Critical" as const,
      tags: ["kubernetes", "containers", "escape", "cve"],
      resourceLink: "https://kubernetes.io/docs/concepts/security/",
    },
    {
      title: "Exploitation of LDAP Injection in Enterprise Networks",
      summary:
        "Technical walkthrough of LDAP injection vulnerabilities in enterprise authentication systems, demonstrating exploitation methods and secure coding practices.",
      category: "Vulnerability Research",
      date: "Oct 15, 2025",
      readTime: "11 min read",
      severity: "High" as const,
      tags: ["ldap", "injection", "authentication", "owasp"],
      resourceLink: "https://owasp.org/www-community/attacks/LDAP_Injection",
    },
    {
      title: "Distributed Denial of Service: Botnet Infrastructure Analysis",
      summary:
        "Comprehensive analysis of modern DDoS botnet infrastructure, including command and control mechanisms, mitigation strategies, and law enforcement coordination.",
      category: "Threat Intelligence",
      date: "Oct 8, 2025",
      readTime: "10 min read",
      severity: "High" as const,
      tags: ["ddos", "botnet", "infrastructure", "c2"],
      resourceLink:
        "https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/",
    },
    {
      title: "Forensic Analysis of Advanced Persistent Threats",
      summary:
        "Detailed forensic examination of APT attack patterns, including log analysis, memory forensics, and timeline reconstruction for incident investigation.",
      category: "Incident Response",
      date: "Oct 1, 2025",
      readTime: "16 min read",
      severity: "Critical" as const,
      tags: ["forensics", "apt", "log-analysis", "investigation"],
      resourceLink: "https://www.sans.org/white-papers/",
    },
  ];

  const categories = [
    "All",
    "Threat Intelligence",
    "Vulnerability Research",
    "Incident Response",
    "Cloud Security",
    "Malware Analysis",
    "Social Engineering",
    "Supply Chain Security",
    "Mobile Security",
  ];

  const filteredAnalyses =
    selectedCategory === "All"
      ? analyses
      : analyses.filter((analysis) => analysis.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header />

      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Security Analyses
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              In-depth security research, threat analysis, and incident
              investigations. Sharing knowledge and insights from real-world
              cybersecurity scenarios.
            </p>
          </div>

          {/* Filter/Category Section */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAnalyses.slice(0, visibleCount).map((analysis, index) => (
              <AnalysisCard key={index} {...analysis} />
            ))}
          </div>

          {visibleCount < filteredAnalyses.length && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleCount(visibleCount + 6)}
                className="px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium rounded-lg hover:bg-black dark:hover:bg-gray-100 transition-colors"
              >
                Load More Analyses
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
