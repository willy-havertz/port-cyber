import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Clock, Trophy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WriteupComments from "../components/WriteupComments";
import { fetchWriteup, type Writeup } from "../lib/api";
import { Link } from "react-router-dom";

export default function WriteupDetail() {
  const { id } = useParams<{ id: string }>();
  const [writeup, setWriteup] = useState<Writeup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid writeup ID");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchWriteup(id, { refresh: true });
        setWriteup(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load writeup");
        setWriteup(null);
      } finally {
        setLoading(false);
      }
    };

    load();

    // Poll for updates every 10 seconds to show changes made by admin
    const pollInterval = setInterval(async () => {
      try {
        const updatedData = await fetchWriteup(id, { refresh: true });
        setWriteup((prev) => {
          // Only update if data has changed to avoid unnecessary re-renders
          if (JSON.stringify(prev) !== JSON.stringify(updatedData)) {
            return updatedData;
          }
          return prev;
        });
      } catch (err) {
        console.error("Error polling for updates:", err);
      }
    }, 10000); // 10 second interval

    return () => {
      clearInterval(pollInterval);
    };
  }, [id]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col"
      >
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="text-center text-slate-600 dark:text-slate-400">
            Loading writeup...
          </p>
        </main>
        <Footer />
      </motion.div>
    );
  }

  if (error || !writeup) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col"
      >
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="text-center text-red-600 dark:text-red-400 mb-6">
            {error || "Writeup not found"}
          </p>
          <Navigate to="/writeups" replace />
        </main>
        <Footer />
      </motion.div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Insane":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
      case "Hard":
        return "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300";
      case "Medium":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
      case "Easy":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
    }
  };

  // Helper to safely parse AI-generated fields
  const parseAIField = (field: any): string[] | null => {
    if (!field) return null;
    if (Array.isArray(field)) return field;
    if (typeof field === "string") {
      // Try JSON first
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore parse errors and fall back to splitting
      }
      // Fallback: split plain string by newline or comma
      const parts = field
        .split(/\r?\n|,/) // newline or comma
        .map((s) => s.trim())
        .filter(Boolean);
      return parts.length ? parts : null;
    }
    return null;
  };

  // Generate methodology steps from title
  const generateMethodology = (): string[] => {
    // Use AI-generated content if available
    const aiMethodology = parseAIField(writeup.methodology);
    if (aiMethodology && aiMethodology.length > 0) {
      return aiMethodology;
    }

    // Fall back to hardcoded logic
    const category = writeup.category || "";
    if (category.toLowerCase().includes("linux")) {
      return [
        "Perform comprehensive port scanning to identify open services",
        "Enumerate services and extract useful information",
        "Identify and exploit vulnerabilities in discovered services",
        "Gain initial access and establish foothold",
        "Escalate privileges using discovered misconfigurations",
        "Access sensitive files and flags",
        "Document findings and exploitation techniques",
      ];
    } else if (category.toLowerCase().includes("web")) {
      return [
        "Perform reconnaissance and gather target information",
        "Map application functionality and identify entry points",
        "Test for common web vulnerabilities (OWASP Top 10)",
        "Exploit identified vulnerabilities to gain access",
        "Extract sensitive data and credentials",
        "Escalate privileges if possible",
        "Document and report findings",
      ];
    } else if (category.toLowerCase().includes("windows")) {
      return [
        "Scan and enumerate Windows services",
        "Identify vulnerable services and misconfigurations",
        "Exploit vulnerabilities to gain initial access",
        "Perform privilege escalation enumeration",
        "Execute privilege escalation exploit",
        "Establish persistence and access system",
      ];
    } else if (category.toLowerCase().includes("active directory")) {
      return [
        "Enumerate domain users and groups",
        "Collect Kerberos authentication information",
        "Perform enumeration using BloodHound",
        "Identify attack paths and delegation issues",
        "Execute lateral movement attacks",
        "Escalate to domain admin privileges",
        "Maintain persistence in the domain",
      ];
    }
    return [
      "Reconnaissance and information gathering",
      "Vulnerability identification and analysis",
      "Exploitation and initial access",
      "Privilege escalation",
      "Post-exploitation and data extraction",
    ];
  };

  // Generate key findings based on category and difficulty
  const generateKeyFindings = (): string[] => {
    // Use AI-generated content if available
    const aiFindings = parseAIField(writeup.key_findings);
    if (aiFindings && aiFindings.length > 0) {
      return aiFindings;
    }

    // Fall back to hardcoded logic
    const category = writeup.category || "";
    const difficulty = writeup.difficulty || "";

    const findings = [
      `${difficulty} difficulty challenge requiring solid understanding of ${category}`,
      "Multiple exploitation paths available for privilege escalation",
      "Default credentials and misconfigurations present in the system",
      "Insufficient access controls allowing unauthorized data access",
    ];

    if (category.toLowerCase().includes("linux")) {
      findings.push(
        "Vulnerable SUID binaries found allowing privilege escalation"
      );
      findings.push("Kernel vulnerability present in system configuration");
    } else if (category.toLowerCase().includes("web")) {
      findings.push("SQL injection vulnerability in login form");
      findings.push("Cross-Site Scripting (XSS) in user input fields");
    } else if (category.toLowerCase().includes("windows")) {
      findings.push("Unpatched Windows service with known exploits");
      findings.push("Clear-text credentials stored in configuration files");
    }

    return findings;
  };

  // Generate tools used based on category
  const generateTools = (): string[] => {
    // Use AI-generated content if available
    const aiTools = parseAIField(writeup.tools_used);
    if (aiTools && aiTools.length > 0) {
      return aiTools;
    }

    // Fall back to hardcoded logic
    const category = writeup.category || "";
    const commonTools = ["Nmap", "Burp Suite", "Metasploit", "Wireshark"];

    const categoryTools: { [key: string]: string[] } = {
      linux: [
        "nmap",
        "netcat",
        "python",
        "bash scripting",
        "privilege escalation tools",
      ],
      web: ["Burp Suite", "OWASP ZAP", "SQLmap", "curl", "browser DevTools"],
      windows: ["nmap", "impacket", "mimikatz", "PowerShell", "Metasploit"],
      "active directory": [
        "BloodHound",
        "Responder",
        "Impacket",
        "PowerView",
        "Kerberoasting tools",
      ],
    };

    for (const [key, tools] of Object.entries(categoryTools)) {
      if (category.toLowerCase().includes(key)) {
        return [...commonTools, ...tools];
      }
    }

    return commonTools;
  };

  // Generate lessons learned based on difficulty and category
  const generateLessonsLearned = (): string[] => {
    // Use AI-generated content if available
    const aiLessons = parseAIField(writeup.lessons_learned);
    if (aiLessons && aiLessons.length > 0) {
      return aiLessons;
    }

    // Fall back to hardcoded logic
    return [
      "Importance of thorough reconnaissance before exploitation",
      "Multiple privilege escalation vectors should be tested",
      "Proper input validation prevents common vulnerabilities",
      "System hardening and regular patching is critical",
      "Documentation of exploitation steps aids in reproducibility",
      `${writeup.difficulty} challenges require attention to detail and persistence`,
    ];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col"
    >
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          to="/writeups"
          className="inline-flex items-center text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Writeups
        </Link>

        {/* Header Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {writeup.title}
          </h1>

          <div className="flex flex-wrap gap-3 mb-6">
            <span
              className={`px-4 py-2 rounded-lg font-medium ${getDifficultyColor(
                writeup.difficulty
              )}`}
            >
              {writeup.difficulty}
            </span>
            <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium">
              {writeup.platform}
            </span>
            <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium">
              {writeup.category}
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-slate-600 dark:text-slate-400">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>{writeup.time_spent || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              <span>{writeup.date || "N/A"}</span>
            </div>
          </div>
        </motion.div>

        {/* Overview Section */}
        {writeup.overview && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Overview
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
              {writeup.overview}
            </p>
          </motion.div>
        )}

        {/* Methodology Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Methodology
          </h2>
          <ol className="space-y-3">
            {(parseAIField(writeup.methodology) || generateMethodology()).map(
              (step, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold mr-4">
                    {index + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 pt-1">
                    {step}
                  </span>
                </li>
              )
            )}
          </ol>
        </motion.div>

        {/* Key Findings Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Key Findings
          </h2>
          <ul className="space-y-3">
            {(parseAIField(writeup.key_findings) || generateKeyFindings()).map(
              (finding, index) => (
                <li
                  key={index}
                  className="flex items-start p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                >
                  <span className="flex-shrink-0 h-2 w-2 rounded-full bg-gray-900 dark:bg-white mt-2 mr-3"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {finding}
                  </span>
                </li>
              )
            )}
          </ul>
        </motion.div>

        {/* Tools Used Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Tools Used
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(parseAIField(writeup.tools_used) || generateTools()).map(
              (tool, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-white font-semibold mr-3">
                    ⚙️
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {tool}
                  </span>
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* Lessons Learned Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Lessons Learned
          </h2>
          <ul className="space-y-3">
            {(
              parseAIField(writeup.lessons_learned) || generateLessonsLearned()
            ).map((lesson, index) => (
              <li
                key={index}
                className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-500"
              >
                <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></span>
                <span className="text-slate-700 dark:text-slate-300">
                  {lesson}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Tags Section */}
        {writeup.tags && writeup.tags.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Skills & Techniques
            </h2>
            <div className="flex flex-wrap gap-2">
              {writeup.tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Markdown Content Section */}
        {writeup.content_type === "markdown" && writeup.writeup_content && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8 prose dark:prose-invert max-w-none"
          >
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6 mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-slate-700 dark:text-slate-300">
                      {children}
                    </li>
                  ),
                  code: ({ children, node }: any) => {
                    const match = (node?.data?.meta || "")?.match(
                      /language-(\w+)/
                    );
                    const isInline = !match;
                    return isInline ? (
                      <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-900 dark:text-white font-mono text-sm">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 dark:text-slate-400 my-4">
                      {children}
                    </blockquote>
                  ),
                  img: ({ src, alt }) => {
                    // Convert relative paths to absolute backend URLs with proper URL encoding
                    let imageSrc = src;
                    if (imageSrc && !imageSrc.startsWith("http")) {
                      // If it starts with /uploads, use the backend URL
                      if (imageSrc.startsWith("/uploads")) {
                        const apiUrl =
                          import.meta.env.VITE_API_URL ||
                          "http://localhost:8000/api";
                        const backendBaseUrl = apiUrl.replace("/api", "");
                        // URL-encode the path component to handle spaces and special characters
                        const parts = imageSrc.split("/");
                        const encodedParts = parts.map((part, idx) => {
                          // Don't encode the empty first part from the leading /
                          if (idx === 0 || idx === 1) return part;
                          // URL-encode each path segment
                          return encodeURIComponent(part);
                        });
                        imageSrc = backendBaseUrl + encodedParts.join("/");
                      }
                    }
                    return (
                      <img
                        src={imageSrc}
                        alt={alt}
                        className="max-w-full h-auto rounded-lg my-4 shadow-lg"
                        onError={(e) => {
                          // If image still fails to load, try alternative paths
                          const target = e.currentTarget as HTMLImageElement;
                          if (!target.src.includes("/uploads")) {
                            const apiUrl =
                              import.meta.env.VITE_API_URL ||
                              "http://localhost:8000/api";
                            const backendBaseUrl = apiUrl.replace("/api", "");
                            target.src =
                              backendBaseUrl +
                              `/uploads/writeups/${writeup.title.replace(
                                / /g,
                                "_"
                              )}/${alt || ""}`;
                          }
                        }}
                      />
                    );
                  },
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {writeup.writeup_content}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}

        {/* PDF Link Section - only show for PDF writeups */}
        {(writeup.content_type === "pdf" || !writeup.content_type) &&
          writeup.writeup_url && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 rounded-lg shadow-lg p-8 text-center"
            >
              <h3 className="text-xl font-bold text-white dark:text-gray-900 mb-4">
                Full Writeup with Screenshots
              </h3>
              <a
                href={writeup.writeup_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                <FileText className="h-5 w-5 mr-2" />
                View PDF Writeup
              </a>
            </motion.div>
          )}

        {/* Comments Section */}
        <WriteupComments writeupId={String(writeup.id)} />
      </main>

      <Footer />
    </motion.div>
  );
}
