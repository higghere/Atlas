import React, { useState } from 'react';
import { MedicalDocumentRecord, AnatomicalOrganImpact } from '../../types/medicalDocument';
import { PatientEHR } from '../../types/patientEHR';
import { DocumentPipeline } from '../../engine/documentIntelligence/DocumentPipeline';
import { AnatomicalMapper } from '../../engine/documentIntelligence/AnatomicalMapper';
import { DocumentUploader } from './DocumentUploader';
import { DocumentViewer } from './DocumentViewer';
import { FileText, Sparkles, Activity, CheckCircle2, ShieldCheck, Clock, Layers, ChevronRight, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface MedicalRecordsWorkspaceProps {
  currentProfile: PatientEHR;
  onUpdateProfile: (updated: PatientEHR) => void;
}

export const MedicalRecordsWorkspace: React.FC<MedicalRecordsWorkspaceProps> = ({
  currentProfile,
  onUpdateProfile,
}) => {
  const [documents, setDocuments] = useState<MedicalDocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'impact' | 'timeline'>('documents');

  const handleUploadFiles = async (files: File[]) => {
    setIsProcessing(true);
    try {
      const parsedRecords: MedicalDocumentRecord[] = [];
      for (const file of files) {
        const record = await DocumentPipeline.processDocument(file);
        parsedRecords.push(record);
      }

      setDocuments(prev => [...prev, ...parsedRecords]);
      if (parsedRecords.length > 0) {
        setSelectedDocId(parsedRecords[0].id);
      }
    } catch (err) {
      console.error('Failed to process uploaded medical records:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveDocument = (docId: string) => {
    const targetDoc = documents.find(d => d.id === docId);
    if (!targetDoc) return;

    const updatedDocs = documents.map(d => (d.id === docId ? { ...d, userApproved: true, status: 'validated' as const } : d));
    setDocuments(updatedDocs);

    // Merge document into existing patient profile intelligently
    const mergedProfile = DocumentPipeline.mergeDocumentToPatientProfile(currentProfile, targetDoc);

    console.log('[MedicalRecordsWorkspace] 4. Dispatching State Update to Global App:', mergedProfile);

    // Persist to LocalStorage
    try {
      localStorage.setItem('human_atlas_patient_ehr', JSON.stringify(mergedProfile));
      console.log('[MedicalRecordsWorkspace] 5. Storage Updated in LocalStorage');
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }

    // Trigger central state propagation
    onUpdateProfile(mergedProfile);
  };

  const organImpacts: AnatomicalOrganImpact[] = AnatomicalMapper.mapDocumentToAnatomy(documents);
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="flex flex-col gap-4 p-4 glass-panel rounded-2xl min-h-[520px] select-none">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Medical Document Intelligence Workspace
          </h2>
          <p className="text-xs text-slate-400">
            Convert medical records into structured Patient Digital Twin parameters & 3D organ simulation states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 text-xs font-bold">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'documents' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Documents ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'impact' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Organ Impact ({organImpacts.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Left Column: Upload & Document List */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <DocumentUploader onUploadFiles={handleUploadFiles} isProcessing={isProcessing} />

            <div className="flex flex-col gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-900 flex-1 overflow-hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-900 pb-2">
                <span>Uploaded Documents</span>
                <span className="text-[10px] text-slate-500 font-mono">{documents.length} files</span>
              </h3>

              {documents.length === 0 ? (
                <div className="text-xs text-slate-500 italic text-center py-8">
                  No medical records uploaded yet. Upload PDFs or images above.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin">
                  {documents.map(doc => {
                    const isSelected = selectedDocId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-950/30'
                            : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900/80 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <div className="truncate">
                            <div className="font-bold text-xs text-slate-200 truncate">{doc.filename}</div>
                            <div className="text-[9px] text-slate-400 font-mono">{doc.subtype} • {doc.fileSizeKb} KB</div>
                          </div>
                        </div>

                        {doc.userApproved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-900 uppercase">
                            Pending
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Document Inspector & Validation */}
          <div className="lg:col-span-8 bg-slate-950/60 p-4 rounded-2xl border border-slate-900 overflow-y-auto max-h-[580px] scrollbar-thin">
            {selectedDoc ? (
              <DocumentViewer document={selectedDoc} onApproveDocument={handleApproveDocument} />
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-slate-500 py-20 gap-3">
                <FileText className="w-10 h-10 text-slate-700 animate-bounce" />
                <div>
                  <h4 className="text-sm font-bold text-slate-300">No Document Selected</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Select a parsed document from the left panel to inspect OCR text, confidence scores, and approved parameters.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Organ Impact Tab */}
      {activeTab === 'impact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {organImpacts.length === 0 ? (
            <div className="col-span-2 text-center text-slate-500 text-xs py-16 italic">
              No anatomical organ impacts registered. Upload lab or clinical documents to trigger live organ state updates.
            </div>
          ) : (
            organImpacts.map(impact => (
              <div key={impact.organId} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-900 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-rose-400" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-100">{impact.organName}</h4>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">{impact.system} System</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase bg-rose-950 text-rose-300 border border-rose-800`}>
                    Severity: {impact.severityScore}/100
                  </span>
                </div>

                <div className="text-xs text-rose-300 font-semibold bg-rose-950/20 p-2 rounded-lg border border-rose-950">
                  ⚠️ {impact.triggerReason}
                </div>

                <div className="flex flex-col gap-1 text-[11px] text-slate-400 border-t border-slate-900 pt-2">
                  <div className="font-bold text-slate-300 text-xs mb-1">Affected Physiology Parameters:</div>
                  {Object.entries(impact.affectedParameters).map(([k, v]) => (
                    <div key={k} className="flex justify-between font-mono bg-slate-900/60 p-1.5 rounded">
                      <span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-cyan-300 font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
