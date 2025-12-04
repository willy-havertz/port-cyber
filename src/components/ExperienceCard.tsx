import React from "react";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface ExperienceCardProps {
  title: string;
  company: string;
  location: string;
  duration: string;
  description: string[];
  technologies: string[];
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  title,
  company,
  location,
  duration,
  description,
  technologies,
}) => {
  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
            {title}
          </h3>
          <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-2">
            {company}
          </p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {duration}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {location}
          </div>
        </div>
      </div>

      <ul className="space-y-2 mb-4">
        {description.map((item, index) => (
          <li
            key={index}
            className="text-slate-700 dark:text-slate-300 flex items-start"
          >
            <span className="text-blue-500 mr-2 mt-2 flex-shrink-0">•</span>
            {item}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        {technologies.map((tech) => (
          <span
            key={tech}
            className="px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full"
          >
            {tech}
          </span>
        ))}
      </div>
    </motion.article>
  );
};

export default ExperienceCard;
