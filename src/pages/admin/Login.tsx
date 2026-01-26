import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, AlertCircle } from "lucide-react";
import { loginAdmin } from "../../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await loginAdmin(username, password);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 transition-colors"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg shadow-green-500/25">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
            Enter your credentials to access the admin panel
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50"
              >
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-green-500/25"
            >
              {loading ? "Logging in..." : "Log In"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
