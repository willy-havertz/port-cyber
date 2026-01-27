import React from "react";
import { ExternalLink, Github, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/useTheme";

interface ProjectCardProps {
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  githubUrl?: string;
  liveUrl?: string;
  date: string;
  category: string;
}

// Category colors for badges
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Penetration Testing": { bg: "bg-red-500", text: "text-white" },
  "Tool Development": { bg: "bg-blue-500", text: "text-white" },
  "Incident Response": { bg: "bg-orange-500", text: "text-white" },
  "Threat Intelligence": { bg: "bg-purple-500", text: "text-white" },
  "Secure Development": { bg: "bg-cyan-500", text: "text-white" },
  "Machine Learning": { bg: "bg-pink-500", text: "text-white" },
  "Security Analysis": { bg: "bg-emerald-500", text: "text-white" },
  "Security Testing": { bg: "bg-amber-500", text: "text-white" },
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  technologies,
  imageUrl,
  githubUrl,
  liveUrl,
  date,
  category,
}) => {
  const { theme } = useTheme();
  const categoryColor = CATEGORY_COLORS[category] || {
    bg: "bg-green-500",
    text: "text-white",
  };

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
          alt={`${title} project screenshot`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80";
          }}
        />
        {/* Gradient overlay for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Category Badge */}
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${categoryColor.bg} ${categoryColor.text}`}
        >
          {category}
        </div>

        {/* External Link Icon on Hover */}
        {liveUrl && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
          {description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className={`px-2 py-0.5 text-xs rounded-full ${
                theme === "dark"
                  ? "bg-slate-700/50 text-slate-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {tech}
            </span>
          ))}
          {technologies.length > 4 && (
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                theme === "dark"
                  ? "bg-slate-700/50 text-slate-400"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {/* Removed +N, show all below */}
            </span>
          )}
        </div>

        {/* Footer with Date and Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700/50">
          <span
            className={`flex items-center gap-1 text-xs ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            {date}
          </span>

          <div className="flex gap-2">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  theme === "dark"
                    ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Github className="w-3.5 h-3.5" />
                Code
              </a>
            )}
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default React.memo(ProjectCard);
