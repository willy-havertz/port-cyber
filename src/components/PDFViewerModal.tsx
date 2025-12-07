import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react";
import { motion } from "framer-motion";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up the PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  const [pageNumber, setPageNumber] = useState(1);

  if (!isOpen) return null;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (numPages) {
      setPageNumber((prev) => Math.min(numPages, prev + 1));
    }
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
              Page {pageNumber} {numPages ? `of ${numPages}` : ""}
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

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="text-slate-600 dark:text-slate-400">
                Loading PDF...
              </div>
            }
            error={
              <div className="text-red-600 dark:text-red-400">
                Failed to load PDF
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={1.5}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="bg-white shadow-lg"
            />
          </Document>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={handlePrevPage}
            disabled={pageNumber <= 1}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-black dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={numPages || 1}
              value={pageNumber}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= (numPages || 1)) {
                  setPageNumber(page);
                }
              }}
              className="w-16 px-2 py-2 text-center border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              / {numPages || "?"}
            </span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={!numPages || pageNumber >= numPages}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-black dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PDFViewerModal;
