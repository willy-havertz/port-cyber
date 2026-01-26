import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Users,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";

interface NewsletterStats {
  active_subscribers: number;
}

interface SendResult {
  success: boolean;
  sent_count: number;
  failed_count: number;
  total_subscribers: number;
}

export default function AdminNewsletter() {
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${apiUrl}/newsletter/subscribers/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subscriber stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching newsletter stats:", err);
      setError("Failed to load newsletter statistics");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !htmlContent.trim()) {
      setError("Please fill in both subject and content");
      return;
    }

    setSending(true);
    setError(null);
    setSendResult(null);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${apiUrl}/newsletter/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          html_content: htmlContent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to send newsletter");
      }

      const result = await response.json();
      setSendResult(result);
      setSubject("");
      setHtmlContent("");
    } catch (err: any) {
      setError(err.message || "Failed to send newsletter");
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Newsletter
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage subscribers and send newsletters
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Active Subscribers
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  (stats?.active_subscribers ?? 0)
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Success Result */}
        {sendResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">
                  Newsletter sent successfully!
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Sent to {sendResult.sent_count} of{" "}
                  {sendResult.total_subscribers} subscribers
                  {sendResult.failed_count > 0 &&
                    ` (${sendResult.failed_count} failed)`}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Send Newsletter Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow"
        >
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Compose Newsletter
            </h2>
          </div>

          <form onSubmit={handleSendNewsletter} className="p-6 space-y-6">
            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter newsletter subject..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Content (HTML supported)
              </label>
              <textarea
                id="content"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Write your newsletter content here... You can use HTML for formatting."
                rows={12}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Tip: Your content will be wrapped in a professional email
                template automatically.
              </p>
            </div>

            {/* Preview Section */}
            {htmlContent && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Preview
                </label>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Will be sent to{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  {stats?.active_subscribers ?? 0}
                </strong>{" "}
                subscribers
              </p>
              <button
                type="submit"
                disabled={sending || !subject.trim() || !htmlContent.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Newsletter
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
