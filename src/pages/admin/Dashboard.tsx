import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, MessageSquare, Eye } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import {
  fetchWriteups,
  fetchComments,
  type Writeup,
  type Comment,
} from "../../lib/api";

export default function AdminDashboard() {
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [writeupsData] = await Promise.all([fetchWriteups()]);
        setWriteups(writeupsData);

        // Get comments from all writeups
        const allComments: Comment[] = [];
        for (const writeup of writeupsData) {
          try {
            const writeupComments = await fetchComments(writeup.id);
            allComments.push(...writeupComments);
          } catch (err) {
            console.error(
              `Failed to fetch comments for writeup ${writeup.id}:`,
              err
            );
          }
        }
        setComments(allComments);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingComments = comments.filter((c) => !c.is_approved);
  const stats = [
    {
      icon: FileText,
      label: "Total Writeups",
      value: writeups.length,
      color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    },
    {
      icon: MessageSquare,
      label: "Total Comments",
      value: comments.length,
      color:
        "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    },
    {
      icon: Eye,
      label: "Pending Comments",
      value: pendingComments.length,
      color:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-600 dark:text-slate-400">
            Loading dashboard...
          </p>
        </div>
      ) : (
        <div className="space-y-6 lg:space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
                      {stat.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Writeups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                Recent Writeups
              </h3>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {writeups.slice(0, 5).map((writeup) => (
                <div
                  key={writeup.id}
                  className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <h4 className="font-medium text-sm sm:text-base text-slate-900 dark:text-white">
                    {writeup.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {writeup.platform} • {writeup.difficulty}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Comments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                Recent Comments
              </h3>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {comments.slice(0, 5).map((comment) => (
                <div
                  key={comment.id}
                  className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {comment.user_name}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {comment.content}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                        comment.is_approved
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                      }`}
                    >
                      {comment.is_approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
