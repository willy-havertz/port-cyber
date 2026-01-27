import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateUrls: string[];
  title: string;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificateUrls,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative bg-white dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col"
          style={{ maxWidth: "95vw", maxHeight: "95vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              aria-label="Close certificate viewer"
            >
              <X className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Certificate Content - Scrollable in both directions */}
          <div
            className="overflow-auto bg-slate-50 dark:bg-slate-900 p-4"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div
              className="flex flex-col items-center gap-4"
              onContextMenu={(e) => e.preventDefault()}
            >
              {certificateUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${title} - Page ${index + 1}`}
                  className="rounded-lg shadow-lg"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CertificateModal;
