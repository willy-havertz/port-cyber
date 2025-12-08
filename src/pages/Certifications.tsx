import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Download, ExternalLink, Shield } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Import certificate PDFs
import ethicalHackerCert from "../assets/Ethical_Hacker_certificate_wiltordichingwa-gmail-com_4095fa46-0c39-4723-af19-0d32afa047eb (1).pdf";
import mernStackCert from "../assets/wiltord Full-Stack Development MERN Stack certificate.pdf";

export default function Certifications() {
  useEffect(() => {
    // Load Credly badge script
    const script = document.createElement("script");
    script.src = "//cdn.credly.com/assets/utilities/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const certificates = [
    {
      title: "Ethical Hacker",
      issuer: "Cisco Networking Academy",
      date: "2024",
      description: "Comprehensive 12-week training covering ethical hacking methodologies, penetration testing, and cybersecurity fundamentals.",
      pdfUrl: ethicalHackerCert,
      color: "from-green-500 to-emerald-600",
      icon: Shield,
    },
    {
      title: "Full-Stack Development - MERN Stack",
      issuer: "Power Learn Project",
      date: "2024",
      description: "14-week intensive program covering MongoDB, Express.js, React, and Node.js for full-stack web application development.",
      pdfUrl: mernStackCert,
      color: "from-blue-500 to-indigo-600",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header />

      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Certifications & Badges
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Professional certifications, training programs, and industry-recognized achievements demonstrating expertise in cybersecurity and software development.
            </p>
          </motion.div>

          {/* Credly Badge Section */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              Digital Badges
            </h2>
            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border border-slate-200 dark:border-slate-700"
              >
                <div
                  data-iframe-width="150"
                  data-iframe-height="270"
                  data-share-badge-id="7d2b2a3f-3d87-4930-a2c9-33b8ceea0288"
                  data-share-badge-host="https://www.credly.com"
                ></div>
              </motion.div>
            </div>
          </motion.section>

          {/* Certificates Section */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              Professional Certificates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {certificates.map((cert, index) => {
                const IconComponent = cert.icon;
                return (
                  <motion.article
                    key={index}
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                  >
                    {/* Gradient Header */}
                    <div className={`bg-gradient-to-r ${cert.color} p-6 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <IconComponent className="h-12 w-12" />
                        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                          {cert.date}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{cert.title}</h3>
                      <p className="text-white/90 font-medium">{cert.issuer}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        {cert.description}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Certificate
                        </a>
                        <a
                          href={cert.pdfUrl}
                          download
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          <Download className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </motion.section>

          {/* Certifications In Progress */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Pursuing Advanced Certifications</h2>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                Currently working towards industry-leading security certifications to further enhance expertise in penetration testing and cybersecurity.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full font-semibold text-lg">
                  OSCP
                </span>
                <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full font-semibold text-lg">
                  CEH
                </span>
                <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full font-semibold text-lg">
                  Security+
                </span>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
