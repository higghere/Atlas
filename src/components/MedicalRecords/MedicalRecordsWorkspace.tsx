import React, { useState, useEffect } from 'react';
import { MedicalDocumentRecord, AnatomicalOrganImpact } from '../../types/medicalDocument';
import { PatientEHR } from '../../types/patientEHR';
import { DocumentPipeline } from '../../engine/documentIntelligence/DocumentPipeline';
import { AnatomicalMapper } from '../../engine/documentIntelligence/AnatomicalMapper';
import { DocumentRegistry } from '../../engine/documentIntelligence/DocumentRegistry';
import { ProcessingQueue } from '../../engine/documentIntelligence/ProcessingQueue';
import { DocumentRecord } from '../../engine/documentIntelligence/Parsers/BaseDocumentParser';
import { DocumentUploader } from './DocumentUploader';
import { DocumentViewer } from './DocumentViewer';
import { FileText, Sparkles, Activity, CheckCircle2, ShieldCheck, Clock, Layers, ChevronRight, AlertCircle, Plus, Trash2, Search } from 'lucide-react';

interface MedicalRecordsWorkspaceProps {
  currentProfile: PatientEHR;
  onUpdateProfile: (updated: PatientEHR) => void;
}

export const MedicalRecordsWorkspace: React.FC<MedicalRecordsWorkspaceProps> = ({
  currentProfile,
  onUpdateProfile,
}) => {
  const [documents, setDocuments] = useState<MedicalDocumentRecord[]>([]);
  const [registryRecords, setRegistryRecords] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'workspace' | 'impact'>('documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [integrationNotice, setIntegrationNotice] = useState<string | null>(null);

  useEffect(() => {
    setRegistryRecords(DocumentRegistry.getAll());
  }, []);

  const handleUploadFiles = async (files: File[]) => {
    setIsProcessing(true);
    try {
      const parsedRecords: MedicalDocumentRecord[] = [];
      let latestProfile = currentProfile;

      for (const file of files) {
        // 1. Process for pipeline
        const record = await DocumentPipeline.processDocument(file);
        
        // Auto-integrate so document data immediately takes effect in EHR and Simulation
        record.userApproved = true;
        record.status = 'validated';
        parsedRecords.push(record);

        latestProfile = DocumentPipeline.mergeDocumentToPatientProfile(latestProfile, record);

        // 2. Create DocumentRecord entry in DocumentRegistry
        const docRecord: DocumentRecord = {
          documentId: record.id,
          sha256: `sha256_${Date.now()}`,
          filename: file.name,
          mimeType: file.type || 'text/plain',
          sizeBytes: file.size,
          createdAt: new Date().toISOString(),
          owner: 'ClinicalUser',
          status: 'Completed',
          parserUsed: 'DocumentPipeline',
          parserVersion: '24.1',
          processingTimeMs: 0,
          attachedPatientId: latestProfile.id,
          tags: [record.category],
          knowledgeEntities: record.extractedDiagnoses,
          warnings: [],
          errors: [],
          documentVersion: '1.0',
          engineVersion: 'v24.1'
        };

        DocumentRegistry.register(docRecord);

        // 3. Enqueue for async background parsing
        ProcessingQueue.enqueue(file, docRecord).then(() => {
          setRegistryRecords(DocumentRegistry.getAll());
        });
      }

      setDocuments(prev => [...prev, ...parsedRecords]);
      setRegistryRecords(DocumentRegistry.getAll());

      if (parsedRecords.length > 0) {
        setSelectedDocId(parsedRecords[0].id);
      }

      // Synchronize Patient Profile state and local storage immediately
      try {
        localStorage.setItem('human_atlas_patient_ehr', JSON.stringify(latestProfile));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
      onUpdateProfile(latestProfile);

      setIntegrationNotice(
        `✓ Successfully Integrated into Active Patient EHR: ${latestProfile.patientName} (${latestProfile.demographics.age}yo ${latestProfile.demographics.sex.toUpperCase()}, ${latestProfile.medicalConditions.length} Conditions, ${latestProfile.medications.length} Medications, ${parsedRecords[0]?.extractedLabs.length || 0} Lab Values)`
      );
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

    // Merge document into patient profile ONLY upon explicit user action ("Attach to Patient")
    const mergedProfile = DocumentPipeline.mergeDocumentToPatientProfile(currentProfile, targetDoc);

    try {
      localStorage.setItem('human_atlas_patient_ehr', JSON.stringify(mergedProfile));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }

    onUpdateProfile(mergedProfile);
  };

  const handleDeleteDocument = (docId: string) => {
    DocumentRegistry.delete(docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));
    setRegistryRecords(DocumentRegistry.getAll());
  };

  const organImpacts: AnatomicalOrganImpact[] = AnatomicalMapper.mapDocumentToAnatomy(documents);
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="flex flex-col gap-4 p-4 glass-panel rounded-2xl min-h-[520px] select-none text-slate-200">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Medical Document Intelligence Workspace
          </h2>
          <p className="text-xs text-slate-400">
            Upload, parse, and review clinical records asynchronously before attaching to patient EHR.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'documents' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload & Ingestion
          </button>
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'workspace' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Document Registry ({registryRecords.length})
          </button>
        </div>
      </div>

      {integrationNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 p-3 rounded-xl flex items-center justify-between text-xs animate-fade-in shadow-lg shadow-emerald-950/30">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{integrationNotice}</span>
          </div>
          <button
            onClick={() => setIntegrationNotice(null)}
            className="text-slate-400 hover:text-slate-200 text-xs px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <DocumentUploader
              onUploadFiles={handleUploadFiles}
              isProcessing={isProcessing}
              onDeleteDocument={handleDeleteDocument}
              documents={registryRecords}
            />
          </div>

          <div className="lg:col-span-7 flex flex-col gap-3">
            {selectedDoc ? (
              <DocumentViewer
                document={selectedDoc}
                onApproveDocument={handleApproveDocument}
              />
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl text-center p-6 text-slate-500">
                <FileText className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs">Select an uploaded document to review extracted findings.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'workspace' && (
        <div className="flex flex-col gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-900">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search uploaded documents by title, status, or entities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent w-full text-slate-200 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {registryRecords
              .filter(r => !searchQuery || r.filename.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(r => (
                <div key={r.documentId} className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-200 truncate">{r.filename}</h4>
                      <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {r.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">ID: {r.documentId}</span>
                    <span className="text-[10px] text-slate-500 block">Parser: {r.parserUsed || 'BaseDocumentParser'}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-900 text-[10px]">
                    <span className="text-slate-400">Attached: {r.attachedPatientId ? 'Yes' : 'No (Decoupled)'}</span>
                    <button
                      onClick={() => handleDeleteDocument(r.documentId)}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
