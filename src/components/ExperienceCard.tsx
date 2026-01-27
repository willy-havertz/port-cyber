import React from "react";
import { Calendar, MapPin, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/useTheme";

interface ExperienceCardProps {
  title: string;
  company: string;
  location: string;
  duration: string;
  description: string[];
  technologies: string[];
}

// Company type colors (like platform badges)
const getCompanyColor = (company: string): { bg: string; text: string } => {
  // Generate a consistent color based on company name
  const colors = [
    { bg: "bg-blue-500", text: "text-white" },
    { bg: "bg-purple-500", text: "text-white" },
    { bg: "bg-cyan-500", text: "text-white" },
    { bg: "bg-indigo-500", text: "text-white" },
  ];
  const index = company.length % colors.length;
  return colors[index];
};

// Role-based images
const getRoleImage = (title: string): string => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("senior") || titleLower.includes("lead")) {
    return "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80";
  } else if (titleLower.includes("consultant")) {
    return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80";
  } else if (titleLower.includes("analyst")) {
    return "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80";
  } else if (titleLower.includes("specialist")) {
    return "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80";
  }
  return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80";
};

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  title,
  company,
  location,
  duration,
  description,
  technologies,
}) => {
  const { theme } = useTheme();
  const companyColor = getCompanyColor(company);
  const imageUrl = getRoleImage(title);

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
      {/* Image Section */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${title} at ${company}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80";
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Company Badge */}
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1 ${companyColor.bg} ${companyColor.text}`}
        >
          <Briefcase className="w-3 h-3" />
          {company}
        </div>

        {/* Duration Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg bg-black/50 text-white flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {duration}
        </div>

        {/* Title on Image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-semibold text-white drop-shadow-lg line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-gray-200 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Description */}
        <ul className="space-y-2 mb-4">
          {description.slice(0, 2).map((item, index) => (
            <li
              key={index}
              className={`text-sm flex items-start ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <span className="text-green-500 mr-2 mt-1 flex-shrink-0">•</span>
              <span className="line-clamp-2">{item}</span>
            </li>
          ))}
        </ul>

        {/* Technologies - Compact with overflow indicator */}
        <div className="flex flex-wrap gap-1.5">
          {technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className={`px-2 py-0.5 text-xs rounded ${
                theme === "dark"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
};

export default ExperienceCard;
