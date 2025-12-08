import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Trash2, AlertCircle } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import {
  fetchWriteups,
  fetchComments,
  approveComment,
  deleteComment,
  type Writeup,
  type Comment,
} from "../lib/api";

export default function AdminComments() {
  const [comments, setComments] = useState<
    (Comment & { writeup_title?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">(
    "pending"
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const writeups = await fetchWriteups();
      const allComments: (Comment & { writeup_title?: string })[] = [];

      for (const writeup of writeups) {
        try {
          const writeupComments = await fetchComments(writeup.id);
          writeupComments.forEach((comment) => {
            allComments.push({
              ...comment,
              writeup_title: writeup.title,
            });
          });
        } catch (err) {
          console.error(
            `Failed to fetch comments for writeup ${writeup.id}:`,
            err
          );
        }
      }

      setComments(allComments);
    } catch (err) {
      console.error(err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const filteredComments = comments.filter((comment) => {
    if (filter === "pending") return !comment.is_approved;
    if (filter === "approved") return comment.is_approved;
    return true;
  });

  const handleApprove = async (id: number) => {
    try {
      setError(null);
      await approveComment(id);
      setSuccess("Comment approved!");
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to approve comment");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      setError(null);
      await deleteComment(id);
      setSuccess("Comment deleted!");
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to delete comment");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Moderate Comments
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Review and manage comments on your writeups
          </p>
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
          >
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
          >
            <p className="text-green-600 dark:text-green-400">{success}</p>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex gap-3">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              Loading comments...
            </p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
            <p className="text-slate-600 dark:text-slate-400">
              {filter === "pending"
                ? "No pending comments"
                : filter === "approved"
                ? "No approved comments"
                : "No comments"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {comment.user_name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {comment.user_email} • On "{comment.writeup_title}"
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      comment.is_approved
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                    }`}
                  >
                    {comment.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-4">
                  {comment.content}
                </p>

                <div className="flex gap-2">
                  {!comment.is_approved && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(comment.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(comment.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
