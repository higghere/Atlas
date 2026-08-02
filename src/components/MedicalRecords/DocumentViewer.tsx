import React from 'react';
import { MedicalDocumentRecord } from '../../types/medicalDocument';
import { FileText, CheckCircle2, AlertTriangle, Activity, Pill, User, Building, Calendar, ShieldCheck } from 'lucide-react';

interface DocumentViewerProps {
  document: MedicalDocumentRecord;
  onApproveDocument: (docId: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onApproveDocument }) => {
  return (
    <div className="flex flex-col gap-4 text-slate-300 text-xs">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/80 border border-cyan-800 text-cyan-400 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <span>{document.filename}</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono uppercase">
                {document.subtype}
              </span>
            </h3>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5 font-mono">
              <span className="flex items-center gap-1"><Building className="w-3 h-3 text-slate-500" /> {document.hospitalName || 'Hospital'}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-500" /> {document.documentDate}</span>
              <span>•</span>
              <span className="text-emerald-400">Confidence: {Math.round(document.confidenceScore * 100)}%</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onApproveDocument(document.id)}
          disabled={document.userApproved}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
            document.userApproved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {document.userApproved ? 'Approved & Integrated' : 'Approve & Integrate'}
        </button>
      </div>

      {/* Phase 7: Document Validation & Extraction Report Banner */}
      <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
        <div className="flex flex-col">
          <span className="text-slate-500 uppercase text-[9px]">Medical Conditions</span>
          <span className="text-emerald-400 font-bold text-xs">{document.extractedDiagnoses.length} Detected</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 uppercase text-[9px]">Medications</span>
          <span className="text-cyan-400 font-bold text-xs">{document.extractedMedications.length} Prescriptions</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 uppercase text-[9px]">Lab Parameters</span>
          <span className="text-amber-400 font-bold text-xs">{document.extractedLabs.length} Values</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 uppercase text-[9px]">Confidence</span>
          <span className="text-emerald-400 font-bold text-xs">{Math.round(document.confidenceScore * 100)}% Verified</span>
        </div>
      </div>

      {/* Grid Layout: Extracted Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Laboratory Extractions */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900 flex flex-col gap-2">
          <h4 className="font-bold text-slate-300 text-xs flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
            <Activity className="w-4 h-4 text-cyan-400" /> Parsed Laboratory Tests ({document.extractedLabs.length})
          </h4>
          {document.extractedLabs.length === 0 ? (
            <div className="text-[11px] text-amber-400/80 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 flex flex-col gap-1">
              <span className="font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> No laboratory values were detected.</span>
              <span className="text-[10px] text-slate-400">Reason: The document contained no structured lab tabular data or matching parameter keywords.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {document.extractedLabs.map(lab => (
                <div key={lab.id} className="p-2 rounded bg-slate-900/60 border border-slate-850 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-semibold text-slate-200">{lab.testName}</div>
                    <div className="text-[9px] text-slate-500 font-mono">Ref: {lab.refLow || 0} - {lab.refHigh || 100} {lab.normalizedUnit}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-100">{lab.normalizedValue} {lab.normalizedUnit}</div>
                    <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                      lab.status === 'normal' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {lab.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diagnoses & Conditions */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900 flex flex-col gap-2">
          <h4 className="font-bold text-slate-300 text-xs flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
            <Activity className="w-4 h-4 text-rose-400" /> Extracted Diagnoses ({document.extractedDiagnoses.length})
          </h4>
          {document.extractedDiagnoses.length === 0 ? (
            <div className="text-[11px] text-amber-400/80 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 flex flex-col gap-1">
              <span className="font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Diagnosis extraction yielded 0 items.</span>
              <span className="text-[10px] text-slate-400">Reason: No explicit ICD or clinical diagnostic keywords were detected in the parsed text.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {document.extractedDiagnoses.map(diag => (
                <div key={diag.id} className="p-2 rounded bg-slate-900/60 border border-slate-850 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-rose-300">{diag.name}</div>
                    <div className="text-[9px] text-slate-400">{diag.stage || 'Active'} • Category: {diag.category}</div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-900 font-bold uppercase">
                    {diag.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OCR Raw Text Inspection */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900 flex flex-col gap-1.5">
        <h4 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Document OCR Layout Text</h4>
        <pre className="p-2.5 rounded bg-slate-900/90 text-slate-300 font-mono text-[10px] leading-relaxed overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap select-text">
          {document.rawText}
        </pre>
      </div>
    </div>
  );
};
