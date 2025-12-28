import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Eye, Shield } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CertificateModal from "../components/CertificateModal";

// Import certificate images

import adventCert from "../assets/advent_cert.png";
import ethicalHackerCert from "../assets/ethical_hacker_cert-1.png";
import mernStackCert1 from "../assets/mern_stack_cert-1.png";
import virtualAssistantCert from "../assets/virtual-assistant-certificate-wiltord-ichingwa.png";

export default function Certifications() {
  const [selectedCertificate, setSelectedCertificate] = useState<{
    urls: string[];
    title: string;
  } | null>(null);

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

  type Certificate = {
    title: string;
    issuer: string;
    date: string;
    description: string;
    imageUrls: string[];
    color: string;
    icon: typeof Award;
  };

  const certificatesData: Certificate[] = [
    {
      title: "Advent of Cyber 2025",
      issuer: "TryHackMe",
      date: "Dec 2025",
      description:
        "Completed TryHackMe's Advent of Cyber 2025 event - 24 days of hands-on cybersecurity challenges covering OPSEC, log analysis, SIEM, RCE, atomic red team, XXE, sandboxes, AWS, shellcodes, GRC, phishing, Wi-Fi attacks, race conditions, WebSockets, Active Directory, Azure, Kubernetes DFIR, reverse engineering, hash cracking, and more.",
      imageUrls: [adventCert],
      color: "from-red-500 to-green-600",
      icon: Award,
    },
    {
      title: "Ethical Hacker",
      issuer: "Cisco Networking Academy",
      date: "Dec 2025",
      description:
        "Comprehensive 12-week training covering ethical hacking methodologies, penetration testing, and cybersecurity fundamentals.",
      imageUrls: [ethicalHackerCert],
      color: "from-green-500 to-emerald-600",
      icon: Shield,
    },
    {
      title: "Software Engineering",
      issuer: "Power Learn Project",
      date: "Nov 2025",
      description:
        "Successfully completed a 16-week program in Software Development covering Python, Web Technologies, Database Management, Startup Building & Employability and Software Engineering Essentials, with a specialization in Full-Stack Development MERN Stack.",
      imageUrls: [mernStackCert1],
      color: "from-yellow-500 to-orange-600",
      icon: Award,
    },
    {
      title: "Virtual Assistance",
      issuer: "ALX Africa",
      date: "Nov 2024",
      description:
        "For successfully completing a 10-week programme in Virtual Assistance Skills in the Digital Age.",
      imageUrls: [virtualAssistantCert],
      color: "from-cyan-500 via-green-400 to-blue-700",
      icon: Award,
    },
  ];

  // Sort certificates by date descending
  const certificates = certificatesData.slice().sort((a, b) => {
    const parse = (d: string) => {
      const [month, year] = d.split(" ");
      const monthNum = new Date(Date.parse(month + " 1, 2000")).getMonth() + 1;
      return new Date(Number(year), monthNum - 1, 1).getTime();
    };
    return parse(b.date) - parse(a.date);
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header />

      <main className="py-12 pt-16 md:pt-12">
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
              Professional certifications, training programs, and
              industry-recognized achievements demonstrating expertise in
              cybersecurity and software development.
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
                className="bg-white dark:bg-white rounded-lg shadow-lg p-8 border border-slate-200 dark:border-slate-300"
                onContextMenu={(e) => e.preventDefault()}
              >
                <div
                  data-iframe-width="150"
                  data-iframe-height="270"
                  data-share-badge-id="7d2b2a3f-3d87-4930-a2c9-33b8ceea0288"
                  data-share-badge-host="https://www.credly.com"
                  className="[&>iframe]:rounded-lg [&>iframe]:shadow-inner"
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
                    <div
                      className={`bg-gradient-to-r ${cert.color} p-6 text-white`}
                    >
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
                      <button
                        onClick={() =>
                          setSelectedCertificate({
                            urls: cert.imageUrls,
                            title: cert.title,
                          })
                        }
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View Certificate
                      </button>
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
              <h2 className="text-3xl font-bold mb-4">
                Pursuing Advanced Certifications
              </h2>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                Currently working towards industry-leading security
                certifications to further enhance expertise in penetration
                testing and cybersecurity.
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

      {/* Certificate Modal */}
      {selectedCertificate && (
        <CertificateModal
          isOpen={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          certificateUrls={selectedCertificate.urls}
          title={selectedCertificate.title}
        />
      )}
    </div>
  );
}
