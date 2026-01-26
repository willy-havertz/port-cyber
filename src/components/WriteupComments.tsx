import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, Reply, User } from "lucide-react";
import { fetchComments, postComment, type Comment } from "../lib/api";

interface WriteupCommentsProps {
  writeupId: string;
}

// Component to render a single comment with its replies
const CommentItem: React.FC<{
  comment: Comment;
  index: number;
  depth?: number;
}> = ({ comment, index, depth = 0 }) => {
  const isAdminReply =
    comment.user_name.toLowerCase().includes("admin") ||
    comment.user_name.toLowerCase().includes("wiltord");

  return (
    <div className={depth > 0 ? "ml-6 sm:ml-10 mt-3" : ""}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`rounded-lg p-4 border ${
          isAdminReply
            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                isAdminReply
                  ? "bg-blue-500 text-white"
                  : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
              }`}
            >
              {isAdminReply ? "A" : <User className="h-4 w-4" />}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {comment.user_name}
                {isAdminReply && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </h4>
              {depth > 0 && (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Reply className="h-3 w-3" /> Reply
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(comment.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-10">
          {comment.content}
        </p>
      </motion.div>

      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="border-l-2 border-slate-200 dark:border-slate-700">
          {comment.replies.map((reply, replyIndex) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              index={index + replyIndex + 1}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const WriteupComments: React.FC<WriteupCommentsProps> = ({ writeupId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    content: "",
  });

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchComments(writeupId);
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [writeupId]);

  // Fetch comments on mount
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_name || !formData.user_email || !formData.content) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Create optimistic comment (show immediately)
      const optimisticComment: Comment = {
        id: Date.now(), // Temporary ID
        writeup_id: parseInt(writeupId),
        user_name: formData.user_name,
        user_email: formData.user_email,
        content: formData.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add comment to UI immediately
      setComments((prev) => [optimisticComment, ...prev]);

      // Clear form
      setFormData({
        user_name: "",
        user_email: "",
        content: "",
      });

      // Post to backend
      const postedComment = await postComment(writeupId, {
        user_name: formData.user_name,
        user_email: formData.user_email,
        content: formData.content,
      });

      // Replace optimistic comment with real one from backend
      if (postedComment) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === optimisticComment.id
              ? {
                  ...postedComment,
                  created_at:
                    postedComment.created_at || new Date().toISOString(),
                }
              : c,
          ),
        );
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError("Error submitting comment. Please try again.");
      // Remove optimistic comment on error
      setComments((prev) => prev.filter((c) => c.id !== Date.now()));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Leave a Comment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Your Name"
            value={formData.user_name}
            onChange={(e) =>
              setFormData({ ...formData, user_name: e.target.value })
            }
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.user_email}
            onChange={(e) =>
              setFormData({ ...formData, user_email: e.target.value })
            }
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <textarea
          placeholder="Share your thoughts, questions, or insights about this writeup..."
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          rows={4}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-md hover:bg-black dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
          {submitting ? "Posting..." : "Post Comment"}
        </motion.button>
      </motion.form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-600 dark:text-slate-400">
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment, index) => (
            <CommentItem key={comment.id} comment={comment} index={index} />
          ))
        )}
      </div>
    </motion.section>
  );
};

export default WriteupComments;
