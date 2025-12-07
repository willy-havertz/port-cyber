import React from "react";
import { X, Printer } from "lucide-react";
import { motion } from "framer-motion";

interface WriteupContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  platform: "Hack The Box" | "Try Hack Me";
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  category: string;
  date: string;
  timeSpent: string;
  tags: string[];
  pdfUrl: string;
}

const WriteupContentModal: React.FC<WriteupContentModalProps> = ({
  isOpen,
  onClose,
  title,
  platform,
  difficulty,
  category,
  date,
  timeSpent,
  tags,
  pdfUrl,
}) => {
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Insane":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
      case "Hard":
        return "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300";
      case "Medium":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
      case "Easy":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            CTF Writeup
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Print Writeup"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 max-w-3xl mx-auto">
            {/* Header Info */}
            <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded ${getDifficultyColor(
                    difficulty
                  )}`}
                >
                  {difficulty}
                </span>
                <span className="px-3 py-1 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                  {platform}
                </span>
                <span className="px-3 py-1 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                  {category}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div>
                  <span className="font-medium">Date:</span> {date}
                </div>
                <div>
                  <span className="font-medium">Time Spent:</span> {timeSpent}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Embedded PDF using iframe */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <iframe
                src={pdfUrl}
                className="w-full h-[600px] border-0 rounded"
                title={title}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WriteupContentModal;
