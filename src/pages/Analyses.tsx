import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AnalysisCard from "../components/AnalysisCard";
import { useTheme } from "../contexts/useTheme";

export default function Analyses() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredAnalyses = analyses.filter((analysis) => {
    const searchMatch =
      searchQuery === "" ||
      analysis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const categoryMatch =
      selectedCategory === "All" || analysis.category === selectedCategory;
    return searchMatch && categoryMatch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      <Header />

      <main className="py-12 pt-32 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span
                className={theme === "dark" ? "text-white" : "text-gray-900"}
              >
                Security{" "}
              </span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Analyses
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              In-depth security research, threat analysis, and incident
              investigations. Sharing knowledge and insights from real-world
              cybersecurity scenarios.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mb-8"
          >
            <div className="relative w-full md:w-96 mx-auto">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all ${
                  theme === "dark"
                    ? "bg-slate-900/50 border-slate-700 text-white placeholder-gray-500 focus:border-green-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500"
                } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                    theme === "dark"
                      ? "text-gray-500 hover:text-gray-300"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Filter/Category Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                      : theme === "dark"
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-white text-slate-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredAnalyses.slice(0, visibleCount).map((analysis, index) => (
              <AnalysisCard key={index} {...analysis} />
            ))}
          </motion.div>

          {visibleCount < filteredAnalyses.length && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleCount(visibleCount + 6)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/25"
              >
                Load More Analyses
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
