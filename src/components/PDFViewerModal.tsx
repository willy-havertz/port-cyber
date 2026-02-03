import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import { motion } from "framer-motion";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up the PDF worker using CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  title,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.2);

  if (!isOpen) return null;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
              {title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {numPages ? `${numPages} pages` : "Loading..."} • Zoom:{" "}
              {Math.round(scale * 100)}%
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              download
              className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Download PDF"
            >
              <Download className="h-5 w-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Content - Continuous Scroll */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 p-4">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-full text-slate-600 dark:text-slate-400">
                Loading PDF...
              </div>
            }
            error={
              <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400">
                Failed to load PDF
              </div>
            }
            className="flex flex-col items-center gap-4"
          >
            {numPages &&
              Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="bg-white shadow-lg"
                />
              ))}
          </Document>
        </div>

        {/* Zoom Controls Footer */}
        <div className="flex justify-center items-center gap-4 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-black dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>

          <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-black dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PDFViewerModal;
