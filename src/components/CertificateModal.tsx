import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateUrl: string;
  title: string;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificateUrl,
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
          className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
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

          {/* Certificate Content */}
          <div 
            className="overflow-auto max-h-[calc(90vh-80px)] bg-slate-50 dark:bg-slate-900"
            onContextMenu={(e) => e.preventDefault()} // Prevent right-click
          >
            <div className="p-4 flex justify-center">
              <object
                data={certificateUrl}
                type="application/pdf"
                className="w-full h-[calc(90vh-120px)] rounded-lg"
                style={{ 
                  pointerEvents: 'none', // Prevent download on right-click
                  userSelect: 'none' 
                }}
                onContextMenu={(e) => e.preventDefault()}
              >
                <iframe
                  src={`${certificateUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-[calc(90vh-120px)] rounded-lg"
                  title={title}
                  style={{ 
                    border: 'none',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </object>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CertificateModal;
