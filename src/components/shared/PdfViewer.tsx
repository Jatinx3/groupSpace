"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Configure react-pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  fileUrl: string;
}

export default function PdfViewer({ fileUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div className="w-full h-full overflow-auto flex flex-col items-center p-6 bg-black/5 dark:bg-black/20">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="mt-20 flex flex-col items-center gap-3">
            <span className="animate-spin h-8 w-8 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full block" />
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-500">Preparing PDF...</p>
          </div>
        }
        className="max-w-full shadow-2xl rounded-lg overflow-hidden"
      >
        <Page 
          pageNumber={pageNumber} 
          renderTextLayer={true}
          renderAnnotationLayer={true}
          className="bg-white max-w-full"
          width={Math.min(window.innerWidth * 0.8, 800)}
        />
      </Document>
      
      {/* PDF Controls */}
      {numPages && (
        <div className="sticky bottom-6 mt-8 flex items-center justify-center gap-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 px-6 py-3 rounded-full shadow-xl z-10 transition-all hover:scale-105">
          <button
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(prev => prev - 1)}
            className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col items-center">
             <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-white">
              {pageNumber} <span className="text-gray-400 dark:text-zinc-600 font-medium mx-1">/</span> {numPages}
            </span>
          </div>

          <button
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(prev => prev + 1)}
            className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white disabled:opacity-30 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
