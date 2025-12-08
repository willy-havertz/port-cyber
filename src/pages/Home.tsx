import React, { useState } from "react";
import {
  Shield,
  Code,
  Search,
  Users,
  ExternalLink,
  Download,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ResumeModal from "../components/ResumeModal";
import FeaturedCarousel from "../components/FeaturedCarousel";
import { Link } from "react-router-dom";
import CTFStatsDashboard from "../components/CTFStatsDashboard";

export default function Home() {
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);

  const featuredWriteups = [
    {
      id: "fowsniff",
      title: "Fowsniff - Linux Privilege Escalation via Misconfigured MOTD",
      platform: "Try Hack Me" as const,
      difficulty: "Easy" as const,
      category: "Linux",
      date: "Nov 20, 2025",
      timeSpent: "1hr 30min",
      tags: [
        "port scanning",
        "email service exploitation",
        "password cracking",
        "privilege escalation",
      ],
    },
    {
      id: "lame",
      title: "Lame - Classic Linux Privilege Escalation",
      platform: "Hack The Box" as const,
      difficulty: "Easy" as const,
      category: "Linux",
      date: "Jan 18, 2025",
      timeSpent: "1.5 hours",
      tags: ["linux", "samba", "exploit", "privesc"],
    },
    {
      id: "cybernetics",
      title: "Cybernetics - Advanced Web Exploitation",
      platform: "Hack The Box" as const,
      difficulty: "Hard" as const,
      category: "Web Security",
      date: "Jan 15, 2025",
      timeSpent: "8 hours",
      tags: ["web", "sql-injection", "xxe", "deserialization"],
    },
  ];

  const skills = [
    { name: "Penetration Testing", level: 95 },
    { name: "Vulnerability Assessment", level: 90 },
    { name: "Incident Response", level: 85 },
    { name: "Security Architecture", level: 88 },
    { name: "Threat Intelligence", level: 82 },
    { name: "Compliance & Auditing", level: 78 },
  ];

  const services = [
    {
      icon: Shield,
      title: "Security Assessments",
      description:
        "Comprehensive security evaluations to identify vulnerabilities and strengthen your defense posture.",
    },
    {
      icon: Code,
      title: "Secure Development",
      description:
        "Code reviews, secure architecture design, and implementation of security best practices.",
    },
    {
      icon: Search,
      title: "Threat Analysis",
      description:
        "Advanced threat hunting, malware analysis, and security incident investigation.",
    },
    {
      icon: Users,
      title: "Security Training",
      description:
        "Educational workshops and training programs to enhance team security awareness.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors"
    >
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  Ethical Hacking and
                  <span className="block text-black dark:text-white">
                    Penetration Testing
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl">
                  Identifying vulnerabilities and securing systems through
                  expert penetration testing, ethical hacking techniques, and
                  comprehensive security assessments. Explore my research and
                  testing methodologies.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/projects"
                    className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-black dark:hover:bg-gray-100 transition-colors"
                  >
                    View Projects
                    <ExternalLink className="ml-2 h-5 w-5" />
                  </Link>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center px-6 py-3 border-2 border-gray-900 text-gray-900 dark:border-white dark:text-white font-semibold rounded-lg hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors">
                      <Download className="mr-2 h-5 w-5" />
                      Download CV
                    </button>
                    <button
                      onClick={() => setIsCVModalOpen(true)}
                      className="inline-flex items-center px-6 py-3 border-2 border-gray-900 text-gray-900 dark:border-white dark:text-white font-semibold rounded-lg hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors"
                    >
                      <Eye className="mr-2 h-5 w-5" />
                      Read Resume
                    </button>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <img
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Cybersecurity professional workspace"
                  className="rounded-lg shadow-2xl"
                  width="800"
                  height="600"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-white dark:bg-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Security Services
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Comprehensive cybersecurity solutions tailored to protect your
                organization from evolving threats.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg mb-4">
                    <service.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTF Statistics Dashboard */}
        <section className="py-20 bg-white dark:bg-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                CTF Statistics
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Live statistics from Hack The Box and Try Hack Me platforms,
                showcasing completed challenges and earned achievements.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <CTFStatsDashboard />
            </motion.div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  Core Expertise
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                  Years of experience in cybersecurity have equipped me with a
                  comprehensive skill set spanning multiple domains of
                  information security.
                </p>
                <div className="space-y-6">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {skill.name}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <img
                  src="https://images.unsplash.com/photo-1563206767-5b18f218e8de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Cybersecurity analysis dashboard"
                  className="rounded-lg shadow-lg"
                  width="800"
                  height="600"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Writeups Carousel */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Featured Writeups
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Explore my latest CTF challenges, security research, and
                exploitation techniques from platforms like Hack The Box and Try
                Hack Me.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <FeaturedCarousel writeups={featuredWriteups} />
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link
                to="/writeups"
                className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-black dark:hover:bg-gray-100 transition-colors"
              >
                View All Writeups
                <ExternalLink className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white dark:bg-slate-800 transition-colors">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Ready to Secure Your Digital Assets?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
              Let's discuss how we can strengthen your security posture and
              protect your organization from cyber threats.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-gray-900 text-white dark:bg-black dark:text-white font-semibold rounded-lg hover:bg-black dark:hover:bg-gray-800 transition-colors text-lg"
            >
              Get In Touch
              <ExternalLink className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Resume Modal */}
      <ResumeModal
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
      />

      <Footer />
    </motion.div>
  );
}
