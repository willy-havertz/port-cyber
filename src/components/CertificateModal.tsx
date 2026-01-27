import React from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
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
  const [zoom, setZoom] = React.useState(100);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative w-full h-full max-w-[95vw] max-h-[95vh] bg-white dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col m-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate pr-4">
              {title}
            </h2>
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                aria-label="Close certificate viewer"
              >
                <X className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Certificate Content - Scrollable */}
          <div
            className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 p-4"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div
              className="min-h-full flex flex-col items-center justify-start gap-4"
              onContextMenu={(e) => e.preventDefault()}
            >
              {certificateUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${title} - Page ${index + 1}`}
                  className="rounded-lg shadow-lg transition-transform duration-200"
                  style={{
                    width: `${zoom}%`,
                    maxWidth: "none",
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
