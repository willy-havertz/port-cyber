import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTheme } from "../contexts/useTheme";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://port-cyber-backend.onrender.com";

const NewsletterUnsubscribe: React.FC = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-email">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = async () => {
      if (!email) {
        setStatus("no-email");
        setMessage("No email address provided.");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`, {
          method: "POST",
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("You have been successfully unsubscribed from the newsletter.");
        } else {
          setStatus("error");
          setMessage(data.detail || "Failed to unsubscribe. Please try again.");
        }
      } catch {
        setStatus("error");
        setMessage("An error occurred. Please try again later.");
      }
    };

    unsubscribe();
  }, [email]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <div
            className={`rounded-2xl border p-8 text-center ${
              theme === "dark"
                ? "bg-slate-900/50 border-slate-800"
                : "bg-white border-gray-200 shadow-lg"
            }`}
          >
            {/* Icon */}
            <div
              className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
                status === "loading"
                  ? "bg-blue-500/10"
                  : status === "success"
                  ? "bg-green-500/10"
                  : "bg-red-500/10"
              }`}
            >
              {status === "loading" && (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              )}
              {status === "success" && (
                <CheckCircle className="w-8 h-8 text-green-500" />
              )}
              {(status === "error" || status === "no-email") && (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
            </div>

            {/* Title */}
            <h1
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {status === "loading" && "Processing..."}
              {status === "success" && "Unsubscribed!"}
              {status === "error" && "Oops!"}
              {status === "no-email" && "Missing Email"}
            </h1>

            {/* Message */}
            <p
              className={`mb-6 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {message}
            </p>

            {/* Email display */}
            {email && status === "success" && (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6 ${
                  theme === "dark"
                    ? "bg-slate-800 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">{email}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                    : "bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800"
                }`}
              >
                Return to Homepage
              </Link>

              {status === "success" && (
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Changed your mind?{" "}
                  <Link
                    to="/#newsletter"
                    className="text-green-500 hover:underline"
                  >
                    Subscribe again
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsletterUnsubscribe;
