// ─────────────────────────────────────────────────────────────
// Medical Document Intelligence Engine — TypeScript Definitions
// ─────────────────────────────────────────────────────────────

import { ConditionCategory, ConditionSeverity, MedicationFrequency, MedicationRoute, MedicationUnit } from './patientEHR';

export type DocumentCategory = 'laboratory' | 'clinical' | 'imaging' | 'cardiology' | 'other';

export type DocumentSubtype =
  // Laboratory
  | 'cbc'
  | 'kft'
  | 'lft'
  | 'lipid_panel'
  | 'hba1c'
  | 'electrolytes'
  | 'thyroid'
  | 'urinalysis'
  // Clinical
  | 'discharge_summary'
  | 'prescription'
  | 'operative_report'
  | 'progress_note'
  // Imaging & Cardiology
  | 'ct_report'
  | 'mri_report'
  | 'xray_report'
  | 'ultrasound'
  | 'ecg'
  | 'echo'
  | 'unknown';

export type LabResultStatus = 'critical_low' | 'low' | 'normal' | 'high' | 'critical_high';

export interface ExtractedDemographics {
  patientName?: string;
  age?: number;
  sex?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  bloodGroup?: string;
  dob?: string;
}

export interface ExtractedDiagnosis {
  id: string;
  name: string;
  category: ConditionCategory;
  severity?: ConditionSeverity;
  stage?: string;
  diagnosedOn?: string;
  confidence: number; // 0.0 to 1.0
  sourceSnippet: string;
}

export interface ExtractedLabItem {
  id: string;
  testName: string;
  standardKey: string; // e.g. 'hemoglobin', 'creatinine', 'hba1c'
  rawValue: number;
  rawUnit: string;
  normalizedValue: number;
  normalizedUnit: string;
  refLow?: number;
  refHigh?: number;
  status: LabResultStatus;
  confidence: number;
  sourceSnippet: string;
}

export interface ExtractedMedication {
  id: string;
  genericName: string;
  brandName?: string;
  dose: number;
  unit: MedicationUnit;
  frequency: MedicationFrequency;
  route: MedicationRoute;
  reason: string;
  confidence: number;
  sourceSnippet: string;
}

export interface MedicalDocumentRecord {
  id: string;
  filename: string;
  fileType: string;
  fileSizeKb: number;
  uploadedAt: string;
  documentDate?: string;
  hospitalName?: string;
  physicianName?: string;
  category: DocumentCategory;
  subtype: DocumentSubtype;
  confidenceScore: number;
  status: 'pending' | 'parsed' | 'validated' | 'error';
  rawText: string;
  extractedDemographics?: ExtractedDemographics;
  extractedDiagnoses: ExtractedDiagnosis[];
  extractedLabs: ExtractedLabItem[];
  extractedMedications: ExtractedMedication[];
  userApproved: boolean;
}

export interface AnatomicalOrganImpact {
  organId: string;
  organName: string;
  system: 'cardiovascular' | 'renal' | 'hepatic' | 'respiratory' | 'endocrine' | 'digestive' | 'nervous';
  severityScore: number; // 0 to 100
  statusColor: 'emerald' | 'amber' | 'rose' | 'red';
  triggerReason: string;
  affectedParameters: Record<string, number | string>;
}
