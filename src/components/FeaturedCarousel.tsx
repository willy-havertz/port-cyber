import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Trophy, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface FeaturedWriteup {
  id: string;
  title: string;
  platform: "Hack The Box" | "Try Hack Me";
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  category: string;
  date: string;
  timeSpent: string;
  tags: string[];
  description?: string;
}

interface FeaturedCarouselProps {
  writeups: FeaturedWriteup[];
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ writeups }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % writeups.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [autoPlay, writeups.length]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % writeups.length);
    setAutoPlay(false);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + writeups.length) % writeups.length);
    setAutoPlay(false);
  };

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

  const getPlatformColor = (platform: string) => {
    return platform === "Hack The Box"
      ? "text-green-600 dark:text-green-400"
      : "text-blue-600 dark:text-blue-400";
  };

  if (writeups.length === 0) return null;

  const current = writeups[currentIndex];

  return (
    <div className="relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="p-8 md:p-12"
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy
                className={`h-5 w-5 ${getPlatformColor(current.platform)}`}
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {current.platform}
              </span>
              <span
                className={`ml-auto px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(
                  current.difficulty
                )}`}
              >
                {current.difficulty}
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {current.title}
            </h3>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <span className="font-medium">{current.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{current.timeSpent}</span>
              </div>
              <div>
                <span>{current.date}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {current.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link
            to={`/writeups/${current.id}`}
            className="inline-block px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-black dark:hover:bg-gray-100 transition-colors"
          >
            Read Full Writeup
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {writeups.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prev}
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
            aria-label="Previous writeup"
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={next}
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
            aria-label="Next writeup"
          >
            <ChevronRight className="h-6 w-6" />
          </motion.button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {writeups.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setAutoPlay(false);
                }}
                animate={{
                  width: index === currentIndex ? 24 : 8,
                  backgroundColor:
                    index === currentIndex ? "#3b82f6" : "#94a3b8",
                }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full transition-all dark:opacity-70"
                aria-label={`Go to writeup ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FeaturedCarousel;
