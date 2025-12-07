import React from "react";
import { ExternalLink, Trophy, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface WriteupCardProps {
  id: string;
  title: string;
  platform: "Hack The Box" | "Try Hack Me";
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  category: string;
  date: string;
  timeSpent: string;
  writeupUrl: string;
  tags: string[];
}

const WriteupCard: React.FC<WriteupCardProps> = ({
  id,
  title,
  platform,
  difficulty,
  category,
  date,
  timeSpent,
  tags,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Insane":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
      case "Hard":
        return "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";
      case "Medium":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "Easy":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600";
    }
  };

  const getPlatformColor = (platform: string) => {
    return platform === "Hack The Box"
      ? "text-green-600 dark:text-green-400"
      : "text-blue-600 dark:text-blue-400";
  };

  return (
    <>
      <motion.article
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Trophy className={`h-5 w-5 ${getPlatformColor(platform)}`} />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {platform}
            </span>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(
              difficulty
            )}`}
          >
            {difficulty}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Category: {category}
        </p>

        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4 space-x-4">
          <div className="flex items-center">
            <Target className="h-4 w-4 mr-1" />
            {date}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {timeSpent}
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

        <Link
          to={`/writeups/${id}`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-md hover:bg-black dark:hover:bg-gray-100 transition-colors"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Read Writeup
        </Link>
      </motion.article>
    </>
  );
};

export default WriteupCard;
