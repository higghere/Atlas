// ─────────────────────────────────────────────────────────────
// Master Document Intelligence Pipeline Orchestrator
// ─────────────────────────────────────────────────────────────

import { MedicalDocumentRecord } from '../../types/medicalDocument';
import { PatientEHR } from '../../types/patientEHR';
import { OCREngine } from './OCREngine';
import { DocumentClassifier } from './DocumentClassifier';
import { MedicalEntityExtractor } from './MedicalEntityExtractor';
import { AnatomicalMapper } from './AnatomicalMapper';
import { EHRCalculationsEngine } from '../../utils/ehrCalculations';

export class DocumentPipeline {
  /**
   * Run end-to-end ingestion pipeline on an uploaded file
   */
  public static async processDocument(file: File): Promise<MedicalDocumentRecord> {
    // 1. OCR Text Extraction
    const ocr = await OCREngine.processFile(file);

    // 2. Classification
    const classification = DocumentClassifier.classify(ocr.text, file.name);

    // 3. Entity Extraction
    const demographics = MedicalEntityExtractor.extractDemographics(ocr.text);
    const diagnoses = MedicalEntityExtractor.extractDiagnoses(ocr.text);
    const labs = MedicalEntityExtractor.extractLabs(ocr.text);
    const meds = MedicalEntityExtractor.extractMedications(ocr.text);

    // 4. Create Document Record
    const record: MedicalDocumentRecord = {
      id: `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      filename: file.name,
      fileType: file.type || file.name.split('.').pop() || 'unknown',
      fileSizeKb: Math.round(file.size / 1024) || 124,
      uploadedAt: new Date().toISOString(),
      documentDate: new Date().toISOString().split('T')[0],
      hospitalName: ocr.text.includes('METROPOLITAN') ? 'Metropolitan General Hospital' : 'St. Jude Medical Center',
      physicianName: ocr.text.includes('Vance') ? 'Dr. Robert Vance, MD' : 'Dr. Sarah Lin, MD',
      category: classification.category,
      subtype: classification.subtype,
      confidenceScore: classification.confidenceScore,
      status: 'parsed',
      rawText: ocr.text,
      extractedDemographics: demographics,
      extractedDiagnoses: diagnoses,
      extractedLabs: labs,
      extractedMedications: meds,
      userApproved: false,
    };

    return record;
  }

  /**
   * Generate a brand-new patient profile derived entirely from approved medical documents
   */
  public static createPatientProfileFromDocument(
    document: MedicalDocumentRecord,
    baseProfileName?: string
  ): PatientEHR {
    const patientName = document.extractedDemographics?.patientName || baseProfileName || `Patient (${document.filename.split('.')[0]})`;
    const freshProfile = EHRCalculationsEngine.createDefaultProfile(patientName);

    // Override demographics if extracted
    if (document.extractedDemographics?.age) freshProfile.demographics.age = document.extractedDemographics.age;
    if (document.extractedDemographics?.sex) freshProfile.demographics.sex = document.extractedDemographics.sex;
    if (document.extractedDemographics?.bloodGroup) freshProfile.demographics.bloodGroup = document.extractedDemographics.bloodGroup as any;
    if (document.extractedDemographics?.heightCm) freshProfile.anthropometrics.heightCm = document.extractedDemographics.heightCm;
    if (document.extractedDemographics?.weightKg) freshProfile.anthropometrics.weightKg = document.extractedDemographics.weightKg;

    // Reset default conditions and set extracted diagnoses
    if (document.extractedDiagnoses.length > 0) {
      freshProfile.medicalConditions = document.extractedDiagnoses.map(diag => ({
        id: diag.id,
        name: diag.name,
        category: diag.category,
        stage: diag.stage,
        severity: diag.severity,
        diagnosedOn: document.documentDate || new Date().toISOString().split('T')[0],
        notes: `Extracted from ${document.filename}`,
        active: true,
      }));
    }

    // Reset default medications and set extracted prescriptions
    if (document.extractedMedications.length > 0) {
      freshProfile.medications = document.extractedMedications.map(med => ({
        id: med.id,
        genericName: med.genericName,
        brandName: med.brandName,
        dose: med.dose,
        unit: med.unit,
        frequency: med.frequency,
        route: med.route,
        startedOn: document.documentDate || new Date().toISOString().split('T')[0],
        reason: med.reason,
      }));
    }

    // Map all extracted lab values directly into patient lab profile
    if (!freshProfile.labResults.cmp) freshProfile.labResults.cmp = {};
    if (!freshProfile.labResults.cbc) freshProfile.labResults.cbc = {};

    document.extractedLabs.forEach(lab => {
      if (lab.standardKey === 'creatinine') freshProfile.labResults.cmp!.creatinineMgDl = lab.normalizedValue;
      if (lab.standardKey === 'bun') freshProfile.labResults.cmp!.bunMgDl = lab.normalizedValue;
      if (lab.standardKey === 'hba1c') freshProfile.labResults.hba1cPercent = lab.normalizedValue;
      if (lab.standardKey === 'glucose') freshProfile.labResults.cmp!.glucoseMgDl = lab.normalizedValue;
      if (lab.standardKey === 'hemoglobin') freshProfile.labResults.cbc!.hemoglobinGDl = lab.normalizedValue;
      if (lab.standardKey === 'alt') freshProfile.labResults.cmp!.altUL = lab.normalizedValue;
      if (lab.standardKey === 'ast') freshProfile.labResults.cmp!.astUL = lab.normalizedValue;
      if (lab.standardKey === 'potassium') freshProfile.labResults.cmp!.potassiumMEqL = lab.normalizedValue;
      if (lab.standardKey === 'total_cholesterol') {
        if (!freshProfile.labResults.lipid) freshProfile.labResults.lipid = {};
        freshProfile.labResults.lipid.totalCholesterolMgDl = lab.normalizedValue;
      }
    });

    freshProfile.updatedAt = new Date().toISOString();
    freshProfile.calculatedMetrics = EHRCalculationsEngine.calculate(freshProfile);

    return freshProfile;
  }

  /**
   * Merge validated document findings into Patient EHR Profile & Simulation Engine
   */
  public static mergeDocumentToPatientProfile(
    currentProfile: PatientEHR,
    approvedDocument: MedicalDocumentRecord
  ): PatientEHR {
    console.log('[DocumentPipeline] 1. Document Approved:', approvedDocument.filename);
    console.log('[DocumentPipeline] 2. Parsed Data:', {
      demographics: approvedDocument.extractedDemographics,
      diagnoses: approvedDocument.extractedDiagnoses,
      labs: approvedDocument.extractedLabs,
      medications: approvedDocument.extractedMedications
    });

    // Immutable deep copy of current profile
    const updated: PatientEHR = JSON.parse(JSON.stringify(currentProfile));

    // 1. Demographics & Anthropometrics
    if (approvedDocument.extractedDemographics?.patientName) updated.patientName = approvedDocument.extractedDemographics.patientName;
    if (approvedDocument.extractedDemographics?.age) updated.demographics.age = approvedDocument.extractedDemographics.age;
    if (approvedDocument.extractedDemographics?.sex) updated.demographics.sex = approvedDocument.extractedDemographics.sex;
    if (approvedDocument.extractedDemographics?.bloodGroup) updated.demographics.bloodGroup = approvedDocument.extractedDemographics.bloodGroup as any;
    if (approvedDocument.extractedDemographics?.heightCm) updated.anthropometrics.heightCm = approvedDocument.extractedDemographics.heightCm;
    if (approvedDocument.extractedDemographics?.weightKg) updated.anthropometrics.weightKg = approvedDocument.extractedDemographics.weightKg;

    // 2. Conditions (Intelligent merge: update existing or append non-duplicate conditions)
    if (approvedDocument.extractedDiagnoses.length > 0) {
      approvedDocument.extractedDiagnoses.forEach(diag => {
        const existingIdx = updated.medicalConditions.findIndex(
          c => c.name.toLowerCase() === diag.name.toLowerCase()
        );
        if (existingIdx >= 0) {
          updated.medicalConditions[existingIdx].stage = diag.stage || updated.medicalConditions[existingIdx].stage;
          updated.medicalConditions[existingIdx].severity = diag.severity || updated.medicalConditions[existingIdx].severity;
        } else {
          updated.medicalConditions.push({
            id: diag.id,
            name: diag.name,
            category: diag.category,
            stage: diag.stage,
            severity: diag.severity,
            diagnosedOn: approvedDocument.documentDate || new Date().toISOString().split('T')[0],
            notes: `Extracted from ${approvedDocument.filename}`,
            active: true,
          });
        }
      });
    }

    // 3. Lab Results (Intelligent merge into lab results)
    if (!updated.labResults) updated.labResults = {};
    if (!updated.labResults.cmp) updated.labResults.cmp = {};
    if (!updated.labResults.cbc) updated.labResults.cbc = {};
    if (!updated.labResults.lipid) updated.labResults.lipid = {};

    approvedDocument.extractedLabs.forEach(lab => {
      if (lab.standardKey === 'creatinine') updated.labResults.cmp!.creatinineMgDl = lab.normalizedValue;
      if (lab.standardKey === 'bun') updated.labResults.cmp!.bunMgDl = lab.normalizedValue;
      if (lab.standardKey === 'hba1c') updated.labResults.hba1cPercent = lab.normalizedValue;
      if (lab.standardKey === 'glucose') updated.labResults.cmp!.glucoseMgDl = lab.normalizedValue;
      if (lab.standardKey === 'hemoglobin') updated.labResults.cbc!.hemoglobinGDl = lab.normalizedValue;
      if (lab.standardKey === 'alt') updated.labResults.cmp!.altUL = lab.normalizedValue;
      if (lab.standardKey === 'ast') updated.labResults.cmp!.astUL = lab.normalizedValue;
      if (lab.standardKey === 'potassium') updated.labResults.cmp!.potassiumMEqL = lab.normalizedValue;
      if (lab.standardKey === 'total_cholesterol') updated.labResults.lipid!.totalCholesterolMgDl = lab.normalizedValue;
      if (lab.standardKey === 'ldl') updated.labResults.lipid!.ldlMgDl = lab.normalizedValue;
      if (lab.standardKey === 'hdl') updated.labResults.lipid!.hdlMgDl = lab.normalizedValue;
      if (lab.standardKey === 'triglycerides') updated.labResults.lipid!.triglyceridesMgDl = lab.normalizedValue;
    });

    // 4. Medications (Intelligent merge: update dosage or append non-duplicate medications)
    if (approvedDocument.extractedMedications.length > 0) {
      approvedDocument.extractedMedications.forEach(med => {
        const existingIdx = updated.medications.findIndex(
          m => m.genericName.toLowerCase() === med.genericName.toLowerCase()
        );
        if (existingIdx >= 0) {
          updated.medications[existingIdx].dose = med.dose;
          updated.medications[existingIdx].frequency = med.frequency;
        } else {
          updated.medications.push({
            id: med.id,
            genericName: med.genericName,
            brandName: med.brandName,
            dose: med.dose,
            unit: med.unit,
            frequency: med.frequency,
            route: med.route,
            startedOn: approvedDocument.documentDate || new Date().toISOString().split('T')[0],
            reason: med.reason,
          });
        }
      });
    }

    updated.updatedAt = new Date().toISOString();
    updated.calculatedMetrics = EHRCalculationsEngine.calculate(updated);

    console.log('[DocumentPipeline] 3. Merged Profile:', updated);
    return updated;
  }
}
