import React from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ExperienceCard from "../components/ExperienceCard";
import { useTheme } from "../contexts/useTheme";

export default function Experience() {
  const { theme } = useTheme();

  const experiences = [
    {
      title: "Hoperation Eggsploit - Web Exploitation with cURL",
      company: "TryHackMe",
      location: "Easy",
      duration: "Dec 2025",
      description: [
        "Exploited a web control panel operated by evil Easter bunnies holding a wormhole open; identified vulnerable API endpoints using reconnaissance techniques.",
        "Utilized cURL to craft and send HTTP requests, bypassing authentication and exploiting insecure direct object references (IDOR) vulnerabilities.",
        "Demonstrated proficiency in HTTP methods (GET, POST, PUT, DELETE) and header manipulation to interact with RESTful APIs.",
        "Successfully shut down the wormhole by exploiting web application logic flaws and documented the complete exploitation methodology.",
      ],
      technologies: [
        "cURL",
        "HTTP Methods",
        "API Exploitation",
        "IDOR",
        "Web Reconnaissance",
        "Bash",
      ],
    },
    {
      title: "Malhare.exe - Malware Analysis & Forensics",
      company: "TryHackMe",
      location: "Medium",
      duration: "Dec 2025",
      description: [
        "Performed static and dynamic malware analysis on a suspicious HTA file (Malhare.exe) using sandbox environments and reverse engineering tools.",
        "Analyzed malicious behavior patterns including persistence mechanisms, network communications, and payload delivery techniques.",
        "Extracted indicators of compromise (IOCs) including file hashes, registry modifications, and C2 server communications.",
        "Documented forensic findings and remediation strategies, demonstrating proficiency in malware triage and incident response.",
      ],
      technologies: [
        "Malware Analysis",
        "Sandbox",
        "Reverse Engineering",
        "IOC Extraction",
        "Forensics",
        "HTA Analysis",
      ],
    },
    {
      title: "Race Conditions - Toy to The World",
      company: "TryHackMe",
      location: "Medium",
      duration: "Dec 2025",
      description: [
        "Exploited race condition vulnerabilities in an e-commerce web application to bypass stock validation and oversell limited-edition items.",
        "Demonstrated understanding of concurrency bugs, time-of-check to time-of-use (TOCTOU) flaws, and their impact on application integrity.",
        "Utilized multi-threading techniques and Burp Suite Turbo Intruder to send parallel requests and trigger the race condition reliably.",
        "Documented exploitation methodology and secure coding practices to prevent race conditions in production applications.",
      ],
      technologies: [
        "Burp Suite",
        "Race Conditions",
        "TOCTOU",
        "Python",
        "Multi-threading",
        "Web Security",
      ],
    },
    {
      title: "Fowsniff CTF - Linux Privilege Escalation",
      company: "TryHackMe",
      location: "Easy",
      duration: "Nov 2025",
      description: [
        "Conducted reconnaissance using Nmap to identify open services (HTTP, POP3, IMAP) and analyzed breach disclosures to trace exposed social media accounts.",
        "Retrieved and analyzed leaked credential dumps from public GitHub repositories; cracked MD5 password hashes using online tools.",
        "Gained access via POP3 using Hydra, extracted emails revealing temporary SSH credentials, and escalated to root by exploiting a misconfigured MOTD script (/opt/cube/cube.sh).",
        "Captured final flag and documented full penetration testing workflow, showcasing skills in enumeration, credential attacks, and privilege escalation.",
      ],
      technologies: [
        "Nmap",
        "Hydra",
        "POP3",
        "SSH",
        "MD5 Cracking",
        "MOTD Exploitation",
      ],
    },
  ];

  const certifications = [
    {
      name: "Advent of Cyber 2025",
      issuer: "TryHackMe",
      date: "Dec 2025",
    },
    {
      name: "Ethical Hacker",
      issuer: "Cisco Networking Academy",
      date: "Dec 2025",
    },
    {
      name: "Software Engineering (MERN Stack)",
      issuer: "Power Learn Project",
      date: "Nov 2025",
    },
    {
      name: "Virtual Assistance",
      issuer: "ALX Africa",
      date: "Nov 2024",
    },
  ];

  const pursuing = ["OSCP", "CEH", "CompTIA Security+"];

  const education = [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of Embu",
      year: "2023 - 2027",
    },
    {
      degree: "Ethical Hacker",
      school: "Cisco Academy",
      year: "12 weeks",
    },
    {
      degree: "Software Engineering",
      school: "Power Learn Project",
      year: "16 weeks",
    },
    {
      degree: "Virtual Assistance",
      school: "ALX Africa",
      year: "10 weeks",
    },
  ];

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
                Professional{" "}
              </span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Experience
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Hands-on cybersecurity experience through penetration testing,
              security research, and real-world security work across multiple
              platforms.
            </p>
          </motion.div>

          {/* Experience Timeline */}
          <section className="mb-16">
            <motion.h2
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-2xl font-bold mb-8"
            >
              <span
                className={theme === "dark" ? "text-white" : "text-gray-900"}
              >
                Work{" "}
              </span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Experience
              </span>
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experiences.map((experience, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ExperienceCard {...experience} />
                </motion.div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Certifications */}
            <motion.section
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-6">
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Certifications
                </span>
              </h2>
              <div
                className={`rounded-2xl border p-6 ${
                  theme === "dark"
                    ? "bg-slate-900/50 border-slate-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <ul className="space-y-4">
                  {certifications.map((cert, index) => (
                    <li
                      key={index}
                      className="flex items-start text-slate-700 dark:text-slate-300"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {cert.issuer} • {cert.date}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    Currently Pursuing:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pursuing.map((cert, index) => (
                      <span
                        key={index}
                        className={`text-xs px-3 py-1 rounded-full ${
                          theme === "dark"
                            ? "bg-slate-800 text-green-400"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Education */}
            <motion.section
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-6">
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Education
                </span>
              </h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl border p-6 transition-all hover:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-slate-900/50 border-slate-800 hover:border-green-500/50"
                        : "bg-white border-gray-200 hover:border-green-500"
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {edu.degree}
                    </h3>
                    <p className="text-green-600 dark:text-green-400 font-medium mb-1">
                      {edu.school}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {edu.year}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
