"use client";

import { useEffect, useState } from "react";
import { X, File, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { downloadFile } from "../../lib/download";

import dynamic from "next/dynamic";

// Dynamically import PdfViewer to prevent SSR issues with DOMMatrix/pdfjs
const PdfViewer = dynamic(() => import("./PdfViewer"), { 
  ssr: false,
  loading: () => (
    <div className="mt-20 flex flex-col items-center gap-3">
      <span className="animate-spin h-8 w-8 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full block" />
      <p className="text-xs font-medium text-gray-500 dark:text-zinc-500">Loading viewer...</p>
    </div>
  )
});

// Syntax Highlighter
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FilePreviewModalProps {
  fileId: string;
  fileName: string;
  onClose: () => void;
}

const SUPPORTED_CODE_EXTENSIONS: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  json: "json",
  md: "markdown",
  css: "css",
  html: "html",
  py: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  cs: "csharp",
  go: "go",
  rs: "rust",
  txt: "text",
  sql: "sql",
  sh: "bash"
};

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

export default function FilePreviewModal({ fileId, fileName, onClose }: FilePreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const isCode = Object.keys(SUPPORTED_CODE_EXTENSIONS).includes(extension);
  const isImage = IMAGE_EXTENSIONS.includes(extension);
  const isHtml = extension === "html" || extension === "htm";
  const isPdf = extension === "pdf";

  const isPreviewable = isCode || isImage || isHtml || isPdf;

  useEffect(() => {
    async function fetchFile() {
      try {
        setLoading(true);
        // Fallback to direct download if we don't know how to render it, saving bandwidth
        if (!isPreviewable) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/files/${fileId}`);
        if (!res.ok) throw new Error("Failed to load file");
        
        if (isCode || isHtml) { // Render code/text/html as string
          const text = await res.text();
          setTextContent(text);
          setLoading(false);
          return;
        }

        // Render Images, PDFs via Blob URL
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err: any) {
        setError(err.message || "An error occurred fetching the file.");
      } finally {
        setLoading(false);
      }
    }

    fetchFile();

    return () => {
      // Cleanup Object URL on unmount
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, isPreviewable]); // Only run on mount or file change, purposely ignore blobUrl dependency

  function handleDownload() {
    downloadFile(`/api/files/${fileId}`, fileName);
  }

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#111111] dark:border dark:border-white/10 w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <File className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
              {fileName}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto relative bg-gray-50/50 dark:bg-black/20">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="animate-spin h-6 w-6 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <X className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-900 dark:text-white font-semibold mb-1">Failed to load preview</p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">{error}</p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/20 transition"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            </div>
          ) : !isPreviewable ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <File className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-zinc-700" />
              <p className="text-gray-900 dark:text-white font-medium text-lg mb-1">Preview not available</p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">This file type ({extension.toUpperCase()}) cannot be previewed within the browser.</p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition"
              >
                <Download className="w-4 h-4" />
                Download to view
              </button>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center">
              
              {/* === PDF RENDERER === */}
              {isPdf && blobUrl && (
                <PdfViewer fileUrl={blobUrl} />
              )}

              {/* === HTML RENDERER === */}
              {isHtml && textContent !== null && (
                <div className="w-full h-full flex flex-col">
                  <iframe 
                    srcDoc={textContent}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    className="w-full flex-1 bg-white border-0"
                    style={{ minHeight: "100%" }}
                    title="HTML Preview"
                  />
                </div>
              )}

              {/* === IMAGE RENDERER === */}
              {isImage && blobUrl && (
                <div className="w-full h-full flex items-center justify-center p-6">
                  <img src={blobUrl} alt={fileName} className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                </div>
              )}

              {/* === CODE / TEXT RENDERER === */}
              {isCode && !isHtml && textContent !== null && (
                <div className="w-full h-full bg-[#1E1E1E] overflow-auto">
                  {/* Syntax highlighter uses pre tags, we drop margin and pad container */}
                  <SyntaxHighlighter
                    language={SUPPORTED_CODE_EXTENSIONS[extension] || "text"}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: "1.5rem",
                      minHeight: "100%",
                      fontSize: "13px",
                      borderRadius: 0,
                      backgroundColor: "transparent"
                    }}
                    showLineNumbers={true}
                    wrapLines={true}
                  >
                    {textContent}
                  </SyntaxHighlighter>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
