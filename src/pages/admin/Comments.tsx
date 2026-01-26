import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Trash2, AlertCircle, Reply, Send, X } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import {
  fetchWriteups,
  fetchComments,
  approveComment,
  deleteComment,
  replyToComment,
  type Comment,
} from "../../lib/api";

export default function AdminComments() {
  const [comments, setComments] = useState<
    (Comment & { writeup_title?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">(
    "pending",
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

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
            err,
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
      // Update comment immediately (optimistic update)
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === id ? { ...comment, is_approved: true } : comment,
        ),
      );

      // Approve on backend
      await approveComment(id);
      setSuccess("Comment approved!");
    } catch (err) {
      console.error(err);
      setError("Failed to approve comment");
      // Reload to revert the optimistic update if approval failed
      await load();
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      setError(null);
      // Remove comment immediately from UI (optimistic deletion)
      setComments((prev) => prev.filter((comment) => comment.id !== id));

      // Delete from backend
      await deleteComment(id);
      setSuccess("Comment deleted!");
    } catch (err) {
      console.error(err);
      setError("Failed to delete comment");
      // Reload to restore the comment if deletion failed
      await load();
    }
  };

  const handleReply = async (comment: Comment & { writeup_title?: string }) => {
    if (!replyContent.trim()) return;

    try {
      setSubmittingReply(true);
      setError(null);

      await replyToComment(comment.id, {
        writeup_id: String(comment.writeup_id),
        user_name: "Wiltord (Admin)",
        user_email: "devhavertz@gmail.com",
        content: replyContent,
      });

      setSuccess(`Reply sent! The user will be notified via email.`);
      setReplyContent("");
      setReplyingTo(null);

      // Reload comments to show the new reply
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to send reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Moderate Comments
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
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
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors capitalize text-sm sm:text-base ${
                filter === f
                  ? "bg-black dark:bg-slate-800 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
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
          <div className="space-y-3 sm:space-y-4">
            {filteredComments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                      {comment.user_name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 break-words">
                      {comment.user_email} • On "{comment.writeup_title}"
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start ${
                      comment.is_approved
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                    }`}
                  >
                    {comment.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-3 sm:mb-4">
                  {comment.content}
                </p>

                {/* Reply Form */}
                <AnimatePresence>
                  {replyingTo === comment.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Reply as Admin
                        </span>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent("");
                          }}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        >
                          <X className="h-4 w-4 text-slate-500" />
                        </button>
                      </div>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-end mt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleReply(comment)}
                          disabled={submittingReply || !replyContent.trim()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="h-4 w-4" />
                          {submittingReply ? "Sending..." : "Send Reply"}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row gap-2">
                  {!comment.is_approved && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(comment.id)}
                      className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id,
                      );
                      setReplyContent("");
                    }}
                    className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(comment.id)}
                    className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
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
