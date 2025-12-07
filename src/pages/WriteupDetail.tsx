import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Clock, Trophy } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WriteupComments from "../components/WriteupComments";
import { getWriteupDetail } from "../data/writeups";
import { Link } from "react-router-dom";

export default function WriteupDetail() {
  const { id } = useParams<{ id: string }>();
  const writeup = id ? getWriteupDetail(id) : undefined;

  if (!writeup) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col"
      >
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Navigate to="/writeups" replace />
        </main>
        <Footer />
      </motion.div>
    );
  }

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col"
    >
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          to="/writeups"
          className="inline-flex items-center text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Writeups
        </Link>

        {/* Header Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {writeup.title}
          </h1>

          <div className="flex flex-wrap gap-3 mb-6">
            <span
              className={`px-4 py-2 rounded-lg font-medium ${getDifficultyColor(
                writeup.difficulty
              )}`}
            >
              {writeup.difficulty}
            </span>
            <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium">
              {writeup.platform}
            </span>
            <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium">
              {writeup.category}
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-slate-600 dark:text-slate-400">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>{writeup.timeSpent}</span>
            </div>
            <div className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              <span>{writeup.date}</span>
            </div>
          </div>
        </motion.div>

        {/* Overview Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Overview
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
            {writeup.overview}
          </p>
        </motion.div>

        {/* Methodology Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Methodology
          </h2>
          <ol className="space-y-3">
            {writeup.methodology.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold mr-4">
                  {index + 1}
                </span>
                <span className="text-slate-700 dark:text-slate-300 pt-1">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Key Findings Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Key Findings
          </h2>
          <ul className="space-y-3">
            {writeup.keyFindings.map((finding, index) => (
              <li
                key={index}
                className="flex items-start p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <span className="flex-shrink-0 h-2 w-2 rounded-full bg-gray-900 dark:bg-white mt-2 mr-3"></span>
                <span className="text-slate-700 dark:text-slate-300">
                  {finding}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Tools Used Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Tools Used
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {writeup.toolsUsed.map((tool, index) => (
              <div
                key={index}
                className="flex items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <span className="text-gray-900 dark:text-white font-semibold mr-3">
                  ⚙️
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {tool}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lessons Learned Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Lessons Learned
          </h2>
          <ul className="space-y-3">
            {writeup.lessonsLearned.map((lesson, index) => (
              <li
                key={index}
                className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-500"
              >
                <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></span>
                <span className="text-slate-700 dark:text-slate-300">
                  {lesson}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Tags Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Skills & Techniques
          </h2>
          <div className="flex flex-wrap gap-2">
            {writeup.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* PDF Link Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 rounded-lg shadow-lg p-8 text-center"
        >
          <h3 className="text-xl font-bold text-white dark:text-gray-900 mb-4">
            Full Writeup with Screenshots
          </h3>
          <a
            href={writeup.writeupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
          >
            <FileText className="h-5 w-5 mr-2" />
            Open PDF Writeup
          </a>
        </motion.div>

        {/* Comments Section */}
        <WriteupComments writeupId={writeup.id} />
      </main>

      <Footer />
    </motion.div>
  );
}
