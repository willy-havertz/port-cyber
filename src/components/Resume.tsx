import React from "react";
import { Mail, Phone, Linkedin, Github, MapPin } from "lucide-react";

const Resume: React.FC = () => {
  return (
    <div className="bg-white text-gray-900 min-h-screen p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-4xl font-bold mb-2">Wiltord Ichingwa</h1>
        <p className="text-xl text-gray-600 mb-4">
          Cybersecurity Professional & Penetration Tester
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <a href="mailto:devhavertz@gmail.com" className="hover:underline">
              devhavertz@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span>+254 700 000 000</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>Kenya</span>
          </div>
          <div className="flex items-center gap-1">
            <Github className="h-4 w-4" />
            <a
              href="https://github.com/willy-havertz"
              className="hover:underline"
            >
              github.com/willy-havertz
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Linkedin className="h-4 w-4" />
            <a
              href="https://linkedin.com/in/wiltord-ichingwa"
              className="hover:underline"
            >
              LinkedIn Profile
            </a>
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
          Professional Summary
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Dedicated cybersecurity professional with expertise in penetration
          testing, vulnerability assessment, and security infrastructure
          hardening. Passionate about identifying and mitigating security risks
          while mentoring junior security professionals. Proven track record of
          conducting comprehensive security assessments and implementing
          effective remediation strategies across diverse IT environments.
        </p>
      </section>

      {/* Core Competencies */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
          Core Competencies
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Penetration Testing (Web, Network, Mobile)</li>
            <li>Vulnerability Assessment & Management</li>
            <li>Security Architecture & Design</li>
            <li>Threat Intelligence & Analysis</li>
            <li>Incident Response & Forensics</li>
          </ul>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Security Compliance (GDPR, ISO 27001)</li>
            <li>Network Security & Hardening</li>
            <li>Application Security (OWASP)</li>
            <li>Secure Code Review</li>
            <li>CTF & Red Team Operations</li>
          </ul>
        </div>
      </section>

      {/* Professional Experience */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
          Professional Experience
        </h2>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Senior Security Analyst
              </h3>
              <p className="text-gray-600">Cybersecurity Firm | Kenya</p>
            </div>
            <span className="text-gray-600">2024 - Present</span>
          </div>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
            <li>
              Conduct comprehensive penetration tests and vulnerability
              assessments for enterprise clients
            </li>
            <li>
              Develop and execute security testing strategies aligned with OWASP
              and NIST frameworks
            </li>
            <li>
              Lead security architecture reviews and provide hardening
              recommendations
            </li>
            <li>
              Mentor junior security professionals and conduct security
              awareness training
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Security Researcher
              </h3>
              <p className="text-gray-600">Independent | Kenya</p>
            </div>
            <span className="text-gray-600">2023 - 2024</span>
          </div>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
            <li>
              Completed 50+ CTF challenges across HackTheBox and TryHackMe
              platforms
            </li>
            <li>
              Published detailed security research and writeups on vulnerability
              exploitation
            </li>
            <li>
              Developed scripts and tools for automated vulnerability scanning
            </li>
          </ul>
        </div>

        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                IT Support Specialist
              </h3>
              <p className="text-gray-600">Tech Solutions Ltd | Kenya</p>
            </div>
            <span className="text-gray-600">2022 - 2023</span>
          </div>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
            <li>
              Provided technical support and maintained network infrastructure
              security
            </li>
            <li>
              Implemented security patches and user access management systems
            </li>
            <li>
              Developed basic security policies and documentation for compliance
            </li>
          </ul>
        </div>
      </section>

      {/* Skills & Technologies */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
          Technical Skills
        </h2>
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Tools & Frameworks:
            </h4>
            <p>
              Burp Suite, Metasploit, Nmap, Wireshark, Kali Linux, OWASP Top 10,
              Maltego
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Programming Languages:
            </h4>
            <p>Python, Bash, JavaScript, SQL, PowerShell</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Platforms & Systems:
            </h4>
            <p>Linux, Windows, macOS, AWS, Azure, Docker, Kubernetes</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Certifications (In Progress):
            </h4>
            <p>OSCP, CEH, Security+</p>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
          Education
        </h2>
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Bachelor of Science in Computer Science
              </h3>
              <p className="text-gray-600">University of Nairobi</p>
            </div>
            <span className="text-gray-600">2020 - 2024</span>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Continuous Learning
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>HackTheBox & TryHackMe - Advanced Security Challenges</li>
            <li>Coursera - Cybersecurity Specialization</li>
            <li>SANS Cybersecurity Training Programs</li>
          </ul>
        </div>
      </section>

      {/* Achievements */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
          Notable Achievements
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            Completed 50+ cybersecurity challenges on HackTheBox and TryHackMe
          </li>
          <li>
            Identified and reported critical vulnerabilities affecting 100+
            users
          </li>
          <li>
            Developed automated security scanning tools reducing assessment time
            by 40%
          </li>
          <li>Successfully led incident response on active security breach</li>
          <li>Created comprehensive security documentation and runbooks</li>
        </ul>
      </section>
    </div>
  );
};

export default Resume;
