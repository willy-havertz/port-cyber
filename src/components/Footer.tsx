import React from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-4xl text-white mb-4"
              style={{
                fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                fontWeight: 700,
              }}
            >
              Wiltord Ichingwa
            </h2>
            <p className="text-slate-400 max-w-md">
              Cybersecurity professional dedicated to protecting digital assets
              and sharing knowledge through detailed security analyses and
              project documentation.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/projects"
                  className="hover:text-blue-400 transition-colors"
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="/experience"
                  className="hover:text-blue-400 transition-colors"
                >
                  Experience
                </a>
              </li>
              <li>
                <a
                  href="/analyses"
                  className="hover:text-blue-400 transition-colors"
                >
                  Security Analyses
                </a>
              </li>
              <li>
                <a
                  href="/writeups"
                  className="hover:text-blue-400 transition-colors"
                >
                  CTF Writeups
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-blue-400 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-white mb-4">Connect</h3>
            <div className="flex space-x-4 mb-6">
              <a
                href="https://github.com/willy-havertz"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                aria-label="GitHub Profile"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/wiltord-ichingwa-5927aa292"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:devhavertz@gmail.com"
                className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                aria-label="Email Contact"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>

            {/* WI logo - X-style geometric design */}
            <svg
              viewBox="0 0 48 32"
              className="h-12 w-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* W - Geometric with heavy strokes */}
              <g>
                {/* Outer white W */}
                <path
                  d="M2 4 L6 4 L10 24 L14 4 L18 4 L22 24 L26 4 L30 4 L24 28 L20 28 L16 10 L12 28 L8 28 Z"
                  fill="#ffffff"
                />
                {/* Inner dark W for contrast */}
                <path
                  d="M4 6 L8 6 L11 22 L14 6 L18 6 L21 22 L24 6 L28 6 L23 26 L19 26 L16 12 L13 26 L9 26 Z"
                  fill="#1e293b"
                />
              </g>

              {/* I - Solid bar with spacing */}
              <g>
                {/* Outer white I */}
                <rect x="36" y="4" width="6" height="24" fill="#ffffff" />
                {/* Inner dark I for contrast */}
                <rect x="37" y="6" width="4" height="20" fill="#1e293b" />
              </g>
            </svg>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-slate-800 mt-8 pt-8 text-center"
        >
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Wiltord's Portfolio. All rights
            reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
