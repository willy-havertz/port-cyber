import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Eye, Shield } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CertificateModal from "../components/CertificateModal";
import { useTheme } from "../contexts/useTheme";

// Import certificate images

import adventCert from "../assets/advent_cert.png";
import ethicalHackerCert from "../assets/ethical_hacker_cert-1.png";
import mernStackCert1 from "../assets/mern_stack_cert-1.png";
import virtualAssistantCert from "../assets/virtual-assistant-certificate-wiltord-ichingwa.png";

export default function Certifications() {
  const { theme } = useTheme();
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
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      <Header />

      <main className="py-12 pt-32 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
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
                Certifications &{" "}
              </span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Badges
              </span>
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
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span
                className={theme === "dark" ? "text-white" : "text-gray-900"}
              >
                Digital{" "}
              </span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Badges
              </span>
            </h2>
            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl shadow-lg p-8 border ${
                  theme === "dark"
                    ? "bg-white border-slate-300"
                    : "bg-white border-gray-200"
                }`}
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
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span
                className={theme === "dark" ? "text-white" : "text-gray-900"}
              >
                Professional{" "}
              </span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Certificates
              </span>
            </h2>

            {/* Results Count */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {certificates.length}{" "}
              {certificates.length === 1 ? "certificate" : "certificates"}{" "}
              earned
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert, index) => {
                const IconComponent = cert.icon;
                return (
                  <motion.article
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`group rounded-2xl overflow-hidden border transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-slate-900/50 border-slate-800 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10"
                        : "bg-white border-gray-200 hover:border-green-500/50 hover:shadow-xl"
                    }`}
                  >
                    {/* Certificate Image Preview */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={cert.imageUrls[0]}
                        alt={cert.title}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      {/* Gradient overlay */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${cert.color} opacity-60`}
                      />

                      {/* Issuer Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg bg-white/90 text-gray-900 flex items-center gap-1">
                        <IconComponent className="w-3 h-3" />
                        {cert.issuer}
                      </div>

                      {/* Date Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg bg-black/50 text-white">
                        {cert.date}
                      </div>

                      {/* View Icon on Hover */}
                      <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Eye className="w-5 h-5 text-gray-900" />
                      </div>

                      {/* Title on Image */}
                      <div className="absolute bottom-3 left-3 right-14">
                        <h3 className="text-lg font-bold text-white drop-shadow-lg line-clamp-1">
                          {cert.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <p
                        className={`text-sm mb-4 line-clamp-3 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {cert.description}
                      </p>

                      {/* Action Button */}
                      <button
                        onClick={() =>
                          setSelectedCertificate({
                            urls: cert.imageUrls,
                            title: cert.title,
                          })
                        }
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
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
