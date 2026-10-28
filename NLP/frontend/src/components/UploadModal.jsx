import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, completed, error
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(Array.from(e.target.files));
    }
  };

  const validateAndAddFiles = (files) => {
    setErrorMessage('');
    const validPdfs = [];

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage(`"${file.name}" is not a PDF file. Please select academic PDF documents.`);
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the 50MB size limit.`);
        return;
      }
      validPdfs.push(file);
    }

    setSelectedFiles(prev => [...prev, ...validPdfs]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploadStatus('uploading');
    setStatusMessage('Uploading PDF files to server...');
    setErrorMessage('');

    try {
      // Simulate status progression UX
      setTimeout(() => {
        setUploadStatus('extracting');
        setStatusMessage('Extracting pages, typography, and section headers...');
      }, 700);

      setTimeout(() => {
        setUploadStatus('embedding');
        setStatusMessage('Computing dense semantic vectors & chunk indexing...');
      }, 1600);

      const response = await api.uploadPapers(selectedFiles);

      setUploadStatus('completed');
      setStatusMessage('Ingestion complete! All papers successfully indexed.');

      if (onUploadSuccess) {
        onUploadSuccess(response);
      }

      setTimeout(() => {
        onClose();
        setSelectedFiles([]);
        setUploadStatus('idle');
      }, 1200);
    } catch (err) {
      setUploadStatus('error');
      setErrorMessage(err.message || 'Failed to process PDF documents.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              Upload Research Papers
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={uploadStatus !== 'idle' && uploadStatus !== 'completed' && uploadStatus !== 'error'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${
              dragActive
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-brand-400 bg-slate-50/60 dark:bg-slate-800/40'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={handleChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Drop scientific PDF papers here, or <span className="text-brand-600 dark:text-brand-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400">
                Supports single or multi-PDF upload (up to 50MB per paper)
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Selected Files ({selectedFiles.length})
              </span>
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  {uploadStatus === 'idle' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Status Progression Bar */}
          {uploadStatus !== 'idle' && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                {uploadStatus === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : uploadStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                )}
                <span>{statusMessage}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    uploadStatus === 'completed'
                      ? 'w-full bg-emerald-500'
                      : uploadStatus === 'error'
                      ? 'w-full bg-red-500'
                      : 'w-3/4 bg-brand-500 animate-pulse'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            disabled={uploadStatus !== 'idle' && uploadStatus !== 'completed' && uploadStatus !== 'error'}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartUpload}
            disabled={selectedFiles.length === 0 || (uploadStatus !== 'idle' && uploadStatus !== 'error')}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {uploadStatus !== 'idle' && uploadStatus !== 'completed' && uploadStatus !== 'error' && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            <span>Process & Index</span>
          </button>
        </div>
      </div>
    </div>
  );
};
