import React from "react";
import { Calendar, Clock, Shield, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface AnalysisCardProps {
  title: string;
  summary: string;
  category: string;
  date: string;
  readTime: string;
  severity?: "Low" | "Medium" | "High" | "Critical";
  tags: string[];
  resourceLink?: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({
  title,
  summary,
  category,
  date,
  readTime,
  severity,
  tags,
  resourceLink,
}) => {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
      case "High":
        return "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";
      case "Medium":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "Low":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600";
    }
  };

  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {category}
          </span>
        </div>
        {severity && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(
              severity
            )}`}
          >
            {severity}
          </span>
        )}
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
        {title}
      </h3>

      <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
        {summary}
      </p>

      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4 space-x-4">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {date}
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {readTime}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
          >
            #{tag}
          </span>
        ))}
      </div>

      {resourceLink && (
        <a
          href={resourceLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-black dark:hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          View Research
        </a>
      )}
    </motion.article>
  );
};

export default AnalysisCard;
