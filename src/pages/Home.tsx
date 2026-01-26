import React, { useState, useEffect } from "react";
import { Shield, Code, Search, Users, ExternalLink, Eye } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ResumeModal from "../components/ResumeModal";
import FeaturedCarousel from "../components/FeaturedCarousel";
import { Link } from "react-router-dom";
import CTFStatsDashboard from "../components/CTFStatsDashboard";
import { fetchWriteups, type Writeup } from "../lib/api";
import { useTheme } from "../contexts/useTheme";

export default function Home() {
  const { theme } = useTheme();
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [featuredWriteups, setFeaturedWriteups] = useState<any[]>();

  useEffect(() => {
    const loadFeaturedWriteups = async () => {
      try {
        const writeups = await fetchWriteups();
        // Get the 3 most recent writeups for featured carousel
        const featured = writeups.slice(0, 3).map((w: Writeup) => ({
          id: String(w.id),
          title: w.title,
          platform: w.platform as "Hack The Box" | "Try Hack Me",
          difficulty: w.difficulty as "Easy" | "Medium" | "Hard" | "Insane",
          category: w.category,
          date: w.date,
          timeSpent: w.time_spent,
          tags: (w.tags || [])
            .map((tag) => (typeof tag === "string" ? tag : tag.name))
            .filter(Boolean),
        }));
        setFeaturedWriteups(featured);
      } catch (error) {
        console.error("Failed to load featured writeups:", error);
        // Set empty array on error
        setFeaturedWriteups([]);
      }
    };

    loadFeaturedWriteups();
  }, []);

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
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      <Header />

      <main className="pt-16 md:pt-0">
        {/* Hero Section */}
        <section className="relative py-20">
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
                  <span className="block bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
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
                  <Link
                    to="/blog"
                    className="inline-flex items-center px-6 py-3 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors shadow-sm"
                    style={{ marginTop: "0.5rem" }}
                  >
                    Visit Blog
                  </Link>
                  <div className="flex gap-2">
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
              {/* 3D Cybersecurity Spline Embed */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center items-center w-full h-[350px] md:h-[450px] lg:h-[500px]"
              >
                <iframe
                  src="https://my.spline.design/genkubgreetingrobot-LfKBHI4bGfDtr3cw5ycRxoa7/"
                  frameBorder="0"
                  width="100%"
                  height="100%"
                  className="w-full h-full rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
                  style={{ minHeight: 300, background: "transparent" }}
                ></iframe>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                  Security{" "}
                </span>
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Services
                </span>
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
                  className={`text-center p-6 rounded-2xl border transition-all hover:scale-105 hover:shadow-xl ${
                    theme === "dark"
                      ? "bg-slate-900/50 border-slate-800 hover:border-green-500/50"
                      : "bg-white border-gray-200 hover:border-green-500"
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-2xl mb-4">
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
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                  CTF{" "}
                </span>
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Statistics
                </span>
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
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                    Core{" "}
                  </span>
                  <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Expertise
                  </span>
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
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"></div>
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
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                  Featured{" "}
                </span>
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Writeups
                </span>
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
              <FeaturedCarousel writeups={featuredWriteups || []} />
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
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/25"
              >
                View All Writeups
                <ExternalLink className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-20 ${
          theme === "dark"
            ? "bg-gradient-to-r from-slate-900 via-green-950/20 to-slate-900"
            : "bg-gradient-to-r from-gray-50 via-green-50 to-gray-50"
        }`}>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                Ready to Secure Your{" "}
              </span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Digital Assets?
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
              Let's discuss how we can strengthen your security posture and
              protect your organization from cyber threats.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/25 text-lg"
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
