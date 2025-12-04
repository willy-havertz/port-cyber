import React, { useState } from "react";
import {
  Shield,
  Code,
  Search,
  Users,
  ArrowRight,
  Download,
  Eye,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

export default function Home() {
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);

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
                    <ArrowRight className="ml-2 h-5 w-5" />
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
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* CV Modal */}
      {isCVModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                CV - Cybersecurity Professional
              </h2>
              <button
                onClick={() => setIsCVModalOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <iframe
                src="/cv.pdf" // Placeholder PDF path
                className="w-full h-[70vh] border-0"
                title="CV"
              />
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </motion.div>
  );
}
