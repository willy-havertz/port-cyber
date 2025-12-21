import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface FilterBarProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
  onReset,
}) => {
  const hasActiveFilters = selectedCategories.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-8"
    >
      <div className="flex flex-col gap-6">
        {/* Categories Filter */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedCategories.includes(category)
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Technologies Filter */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Technologies
          </animate={{ opacity: 1 }}
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors w-fit"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default FilterBar;
