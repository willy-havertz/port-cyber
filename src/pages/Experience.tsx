import React from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ExperienceCard from "../components/ExperienceCard";

export default function Experience() {
  const experiences = [
    {
      title: "Senior Security Consultant",
      company: "CyberGuard Solutions",
      location: "San Francisco, CA",
      duration: "Jan 2022 - Present",
      description: [
        "Lead penetration testing engagements for Fortune 500 clients, identifying critical vulnerabilities and providing strategic remediation guidance",
        "Developed custom security tools and frameworks that improved assessment efficiency by 40%",
        "Mentored junior security analysts and conducted security awareness training for client organizations",
        "Collaborated with development teams to implement secure coding practices and conduct code reviews",
      ],
      technologies: [
        "Metasploit",
        "Burp Suite",
        "Nessus",
        "Python",
        "PowerShell",
        "Kali Linux",
        "OWASP Top 10",
      ],
    },
    {
      title: "Cybersecurity Analyst",
      company: "SecureNet Technologies",
      location: "Austin, TX",
      duration: "Mar 2020 - Dec 2021",
      description: [
        "Monitored security events and incidents using SIEM tools, reducing mean time to detection by 35%",
        "Conducted vulnerability assessments and managed remediation efforts across enterprise infrastructure",
        "Developed incident response procedures and participated in tabletop exercises",
        "Implemented security controls and compliance measures for SOC 2 and ISO 27001 certifications",
      ],
      technologies: [
        "Splunk",
        "QRadar",
        "Nmap",
        "Wireshark",
        "Ansible",
        "AWS Security",
        "MITRE ATT&CK",
      ],
    },
    {
      title: "Information Security Specialist",
      company: "TechCorp Industries",
      location: "Denver, CO",
      duration: "Jun 2018 - Feb 2020",
      description: [
        "Performed security risk assessments and developed risk mitigation strategies for business operations",
        "Managed security awareness training programs, achieving 95% employee completion rate",
        "Coordinated with IT teams to implement security patches and configuration changes",
        "Maintained security documentation and policies in compliance with industry standards",
      ],
      technologies: [
        "Nessus",
        "OpenVAS",
        "Active Directory",
        "Group Policy",
        "Firewalls",
        "VPN",
        "NIST Framework",
      ],
    },
    {
      title: "Junior Security Analyst",
      company: "DataShield Corp",
      location: "Phoenix, AZ",
      duration: "Aug 2016 - May 2018",
      description: [
        "Assisted in security monitoring and incident response activities within the SOC environment",
        "Conducted initial triage of security alerts and escalated critical incidents to senior analysts",
        "Participated in vulnerability management processes and patch deployment coordination",
        "Supported forensic investigations and evidence collection for security incidents",
      ],
      technologies: [
        "LogRhythm",
        "Symantec",
        "McAfee",
        "Windows Server",
        "Linux",
        "TCP/IP",
        "DNS",
      ],
    },
  ];

  const certifications = [
    "Certified Ethical Hacker (CEH)",
    "CISSP - Certified Information Systems Security Professional",
    "GCIH - GIAC Certified Incident Handler",
    "OSCP - Offensive Security Certified Professional",
    "AWS Certified Security - Specialty",
    "CompTIA Security+",
  ];

  const education = [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of Embu",
      year: "2023 - 2027",
    },
    {
      degree: "Ethical Hacker (Cisco Academy)",
      school: "Cisco Academy",
      year: "12 weeks",
    },
    {
      degree: "Software Engineering (Power Learn Project)",
      school: "Power Learn Project",
      year: "14 weeks",
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

      <main className="py-12 pt-16 md:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Professional Experience
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Over 8 years of experience in cybersecurity, from junior analyst
              to senior consultant, with expertise spanning multiple domains of
              information security.
            </p>
          </motion.div>

          {/* Experience Timeline */}
          <section className="mb-16">
            <motion.h2
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-slate-900 dark:text-white mb-8"
            >
              Work Experience
            </motion.h2>
            <div className="space-y-8">
              {experiences.map((experience, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Certifications
              </h2>
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <ul className="space-y-3">
                  {certifications.map((cert, index) => (
                    <li
                      key={index}
                      className="flex items-center text-slate-700 dark:text-slate-300"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>

            {/* Education */}
            <motion.section
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {edu.degree}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
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
