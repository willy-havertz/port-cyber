import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface NewsletterSubscribeProps {
  variant?: "footer" | "inline" | "modal";
  className?: string;
}

const NewsletterSubscribe: React.FC<NewsletterSubscribeProps> = ({
  variant = "footer",
  className = "",
}) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${apiUrl}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Welcome! Check your inbox for a confirmation email.");
        setEmail("");
      } else if (response.status === 409) {
        setStatus("error");
        setMessage("This email is already subscribed.");
      } else {
        throw new Error("Subscription failed");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setMessage("");
  };

  if (variant === "footer") {
    return (
      <div className={className}>
        <h3 className="font-semibold text-white mb-3">Newsletter</h3>
        <p className="text-slate-400 text-sm mb-4">
          Get CTF writeups, security tips & updates straight to your inbox.
        </p>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-green-400 text-sm"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{message}</span>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") resetForm();
                    }}
                    placeholder="your@email.com"
                    className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    disabled={status === "loading"}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-4 py-2 bg-gray-900 hover:bg-black disabled:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>

              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-1 text-red-400 text-xs"
                >
                  <AlertCircle className="h-3 w-3" />
                  {message}
                </motion.p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Inline variant (for pages)
  if (variant === "inline") {
    return (
      <div
        className={`bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 sm:p-8 ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-semibold text-white mb-1">
              Subscribe to my Newsletter
            </h3>
            <p className="text-slate-400 text-sm">
              Get the latest CTF writeups, security tips, and project updates
              directly in your inbox.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 text-green-400 bg-green-900/30 px-4 py-2 rounded-lg"
              >
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Subscribed!</span>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") resetForm();
                  }}
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[220px]"
                  disabled={status === "loading"}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-6 py-2 bg-gray-900 hover:bg-black disabled:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center sm:text-right text-red-400 text-sm flex items-center justify-center sm:justify-end gap-1"
          >
            <AlertCircle className="h-4 w-4" />
            {message}
          </motion.p>
        )}
      </div>
    );
  }

  return null;
};

export default NewsletterSubscribe;
