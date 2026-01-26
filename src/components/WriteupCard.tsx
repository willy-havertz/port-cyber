import React from "react";
import { ExternalLink, Trophy, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/useTheme";

interface WriteupCardProps {
  id: string;
  title: string;
  platform: "Hack The Box" | "Try Hack Me";
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  category: string;
  date: string;
  timeSpent: string;
  writeupUrl: string;
  thumbnailUrl?: string;
  summary?: string;
  tags: string[];
}

// Platform colors for badges (like Blog's source badges)
const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  "Hack The Box": { bg: "bg-green-500", text: "text-white" },
  "Try Hack Me": { bg: "bg-blue-500", text: "text-white" },
};

// Difficulty colors for badges
const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  Easy: { bg: "bg-emerald-500", text: "text-white" },
  Medium: { bg: "bg-yellow-500", text: "text-white" },
  Hard: { bg: "bg-orange-500", text: "text-white" },
  Insane: { bg: "bg-red-500", text: "text-white" },
};

// Default CTF-themed images based on category
const getCategoryImage = (category: string): string => {
  const categoryImages: Record<string, string> = {
    "Web Exploitation":
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80",
    "Binary Exploitation":
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    "Reverse Engineering":
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80",
    Cryptography:
      "https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=800&q=80",
    Forensics:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "Privilege Escalation":
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    OSINT:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    Steganography:
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
  };
  return (
    categoryImages[category] ||
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
  );
};

const WriteupCard: React.FC<WriteupCardProps> = ({
  id,
  title,
  platform,
  difficulty,
  category,
  date,
  timeSpent,
  thumbnailUrl,
  summary,
  tags,
}) => {
  const { theme } = useTheme();
  const platformColor = PLATFORM_COLORS[platform] || {
    bg: "bg-gray-500",
    text: "text-white",
  };
  const difficultyColor = DIFFICULTY_COLORS[difficulty] || {
    bg: "bg-gray-500",
    text: "text-white",
  };
  const imageUrl = thumbnailUrl || getCategoryImage(category);

  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`group block rounded-2xl overflow-hidden border transition-all duration-300 ${
        theme === "dark"
          ? "bg-slate-900/50 border-slate-800 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10"
          : "bg-white border-gray-200 hover:border-green-500/50 hover:shadow-xl"
      }`}
    >
      {/* Image Section - Matching Blog Style */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${title} thumbnail`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80";
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Platform Badge (like source badge on Blog) */}
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1 ${platformColor.bg} ${platformColor.text}`}
        >
          <Trophy className="w-3 h-3" />
          {platform}
        </div>

        {/* Difficulty Badge */}
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${difficultyColor.bg} ${difficultyColor.text}`}
        >
          {difficulty}
        </div>

        {/* External Link Icon on Hover */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <Link to={`/writeups/${id}`}>
          <h3
            className={`text-lg font-semibold mb-2 line-clamp-2 group-hover:text-green-500 transition-colors ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
        </Link>

        {/* Category Badge */}
        <span
          className={`inline-block px-2 py-1 text-xs font-medium rounded mb-3 ${
            theme === "dark"
              ? "bg-slate-700 text-slate-300"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {category}
        </span>

        {/* Summary */}
        {summary && (
          <p
            className={`text-sm mb-4 line-clamp-2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {summary}
          </p>
        )}

        {/* Tags - Compact with overflow indicator */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 text-xs rounded ${
                  theme === "dark"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-green-50 text-green-600"
                }`}
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span
                className={`px-2 py-0.5 text-xs rounded ${
                  theme === "dark"
                    ? "bg-slate-700 text-slate-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer with meta info */}
        <div
          className={`flex items-center justify-between pt-3 border-t ${
            theme === "dark" ? "border-slate-700" : "border-gray-100"
          }`}
        >
          <div
            className={`flex items-center gap-3 text-xs ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {timeSpent}
            </span>
          </div>

          <Link
            to={`/writeups/${id}`}
            className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            Read More
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default React.memo(WriteupCard);
