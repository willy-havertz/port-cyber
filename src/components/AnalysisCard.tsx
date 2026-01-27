import React from "react";
import { Calendar, Clock, Shield, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/useTheme";

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

// Category colors for badges (like Blog's source badges)
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Threat Intelligence": { bg: "bg-purple-500", text: "text-white" },
  "Vulnerability Research": { bg: "bg-red-500", text: "text-white" },
  "Incident Response": { bg: "bg-orange-500", text: "text-white" },
  "Cloud Security": { bg: "bg-blue-500", text: "text-white" },
  "Malware Analysis": { bg: "bg-rose-500", text: "text-white" },
  "Social Engineering": { bg: "bg-amber-500", text: "text-white" },
  "Supply Chain Security": { bg: "bg-indigo-500", text: "text-white" },
  "Mobile Security": { bg: "bg-cyan-500", text: "text-white" },
};

// Severity colors for badges
const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  Critical: { bg: "bg-red-500", text: "text-white" },
  High: { bg: "bg-orange-500", text: "text-white" },
  Medium: { bg: "bg-yellow-500", text: "text-white" },
  Low: { bg: "bg-emerald-500", text: "text-white" },
};

// Category-based images
const getCategoryImage = (category: string): string => {
  const categoryImages: Record<string, string> = {
    "Threat Intelligence":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "Vulnerability Research":
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    "Incident Response":
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80",
    "Cloud Security":
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    "Malware Analysis":
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80",
    "Social Engineering":
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    "Supply Chain Security":
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    "Mobile Security":
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
  };
  return (
    categoryImages[category] ||
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
  );
};

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
  const { theme } = useTheme();
  const categoryColor = CATEGORY_COLORS[category] || {
    bg: "bg-gray-500",
    text: "text-white",
  };
  const severityColor = severity
    ? SEVERITY_COLORS[severity]
    : { bg: "bg-gray-500", text: "text-white" };
  const imageUrl = getCategoryImage(category);

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
          alt={`${category} analysis`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80";
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Category Badge */}
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1 ${categoryColor.bg} ${categoryColor.text}`}
        >
          <Shield className="w-3 h-3" />
          {category}
        </div>

        {/* Severity Badge */}
        {severity && (
          <div
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${severityColor.bg} ${severityColor.text}`}
          >
            {severity}
          </div>
        )}

        {/* External Link Icon on Hover */}
        {resourceLink && (
          <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3
          className={`text-lg font-semibold mb-2 line-clamp-2 group-hover:text-green-500 transition-colors ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>

        <p
          className={`text-sm mb-4 line-clamp-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {summary}
        </p>

        {/* Tags - Display all */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 text-xs rounded ${
                  theme === "dark"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {tag.replace(/^#/, "")}
              </span>
            ))}
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
              {readTime}
            </span>
          </div>

          {resourceLink && (
            <a
              href={resourceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              View Research
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default AnalysisCard;
