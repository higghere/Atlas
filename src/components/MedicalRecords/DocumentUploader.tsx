import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, FolderPlus } from 'lucide-react';

interface DocumentUploaderProps {
  onUploadFiles: (files: File[]) => void;
  isProcessing: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadFiles, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative overflow-hidden ${
        isDragOver
          ? 'border-cyan-400 bg-cyan-950/30'
          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/40'
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.tiff,.dicom,.txt,.docx"
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50 animate-pulse">
          {isProcessing ? <Sparkles className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-200 flex items-center justify-center gap-1.5">
            <span>Upload Medical Documents</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
              AI Powered
            </span>
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
            Drag & drop lab reports, discharge summaries, prescriptions, imaging reports, DICOMs, or handwritten notes to build your Patient Digital Twin.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono border-t border-slate-900 pt-3 w-full justify-center">
          <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-cyan-400" /> PDF, JPG, PNG, TIFF, DICOM</span>
          <span>•</span>
          <span className="flex items-center gap-1"><FolderPlus className="w-3 h-3 text-emerald-400" /> Batch & Folder Upload</span>
          <span>•</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-cyan-400" /> HIPAA / Local Sandbox</span>
        </div>
      </div>
    </div>
  );
};
