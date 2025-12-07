import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Comment {
  id: string;
  author_name: string;
  comment_text: string;
  created_at: string;
}

interface WriteupCommentsProps {
  writeupId: string;
}

const WriteupComments: React.FC<WriteupCommentsProps> = ({ writeupId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    author_email: "",
    comment_text: "",
  });

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("writeup_comments")
        .select("id, author_name, comment_text, created_at")
        .eq("writeup_id", writeupId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [writeupId]);

  // Fetch comments on mount
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.author_name ||
      !formData.author_email ||
      !formData.comment_text
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("writeup_comments").insert([
        {
          writeup_id: writeupId,
          author_name: formData.author_name,
          author_email: formData.author_email,
          comment_text: formData.comment_text,
        },
      ]);

      if (error) throw error;

      setFormData({
        author_name: "",
        author_email: "",
        comment_text: "",
      });

      // Refresh comments
      fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Error submitting comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            value={formData.author_name}
            onChange={(e) =>
              setFormData({ ...formData, author_name: e.target.value })
            }
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.author_email}
            onChange={(e) =>
              setFormData({ ...formData, author_email: e.target.value })
            }
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <textarea
          placeholder="Share your thoughts, questions, or insights about this writeup..."
          value={formData.comment_text}
          onChange={(e) =>
            setFormData({ ...formData, comment_text: e.target.value })
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
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {comment.author_name}
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {comment.comment_text}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </motion.section>
  );
};

export default WriteupComments;
