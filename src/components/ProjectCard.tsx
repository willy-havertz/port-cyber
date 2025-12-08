import React from "react";
import { ExternalLink, Github, Calendar } from "lucide-react";
import { motion } from "framer-motion";

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
  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={`${title} project screenshot`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
            {category}
          </span>
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            {date}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex space-x-3">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Github className="h-4 w-4 mr-1" />
              Code
            </a>
          )}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-md hover:bg-black dark:hover:bg-gray-100 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              OWASP Guide
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default ProjectCard;
