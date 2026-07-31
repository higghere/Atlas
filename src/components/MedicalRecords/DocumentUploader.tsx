import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, FolderPlus, XCircle, RotateCcw, Trash2 } from 'lucide-react';
import { DocumentRecord } from '../../engine/documentIntelligence/Parsers/BaseDocumentParser';

interface DocumentUploaderProps {
  onUploadFiles: (files: File[]) => void;
  isProcessing: boolean;
  onCancelUpload?: (docId: string) => void;
  onRetryUpload?: (docId: string) => void;
  onDeleteDocument?: (docId: string) => void;
  documents?: DocumentRecord[];
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ 
  onUploadFiles, 
  isProcessing,
  onCancelUpload,
  onRetryUpload,
  onDeleteDocument,
  documents = []
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const supportedFormats = ['.pdf', '.docx', '.txt', '.json', '.csv', '.png', '.jpg', '.jpeg'];

  const validateFiles = (files: File[]): File[] => {
    setValidationError(null);
    const valid: File[] = [];

    for (const f of files) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!supportedFormats.includes(ext)) {
        setValidationError(`Unsupported file format "${ext}". Accepted: PDF, DOCX, TXT, JSON, CSV, PNG, JPG.`);
        continue;
      }
      if (f.size > 50 * 1024 * 1024) {
        setValidationError(`File "${f.name}" exceeds 50MB maximum size limit.`);
        continue;
      }
      valid.push(f);
    }
    return valid;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const valid = validateFiles(Array.from(e.target.files));
      if (valid.length > 0) onUploadFiles(valid);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const valid = validateFiles(Array.from(e.dataTransfer.files));
      if (valid.length > 0) onUploadFiles(valid);
    }
  };

  return (
    <div className="flex flex-col gap-3 font-sans text-xs">
      {validationError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button onClick={() => setValidationError(null)} className="text-red-400 hover:text-red-300">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative overflow-hidden ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/30'
            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept=".pdf,.docx,.txt,.json,.csv,.png,.jpg,.jpeg"
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
            {isProcessing ? <Sparkles className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-200 flex items-center justify-center gap-1.5">
              <span>Upload Medical Documents</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
                v24.1 Pipeline
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
              Drag and drop clinical records, lab sheets, images, or JSON/CSV files here.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 text-[9px] font-mono text-slate-500">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">PDF</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">DOCX</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">TXT</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">JSON</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">CSV</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">PNG / JPG</span>
          </div>
        </div>
      </div>

      {/* Uploaded Records Queue List */}
      {documents.length > 0 && (
        <div className="flex flex-col gap-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-900">
          <h5 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <FolderPlus className="w-3.5 h-3.5 text-cyan-400" /> Upload Queue ({documents.length})
          </h5>

          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {documents.map(doc => (
              <div key={doc.documentId} className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-slate-200 block truncate text-[11px]">{doc.filename}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(doc.sizeBytes / 1024).toFixed(1)} KB • {doc.parserUsed || 'Queued'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                    doc.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    doc.status === 'Processing' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse' :
                    doc.status === 'Failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {doc.status}
                  </span>

                  {doc.status === 'Failed' && onRetryUpload && (
                    <button onClick={() => onRetryUpload(doc.documentId)} className="text-cyan-400 hover:text-cyan-300 p-1">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {onDeleteDocument && (
                    <button onClick={() => onDeleteDocument(doc.documentId)} className="text-slate-500 hover:text-red-400 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
