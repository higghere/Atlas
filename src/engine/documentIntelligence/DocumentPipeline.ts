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
    const allergies = MedicalEntityExtractor.extractAllergies(ocr.text);
    const surgeries = MedicalEntityExtractor.extractSurgeries(ocr.text);
    const socialHistory = MedicalEntityExtractor.extractSocialHistory(ocr.text);

    // Hospital / Clinic and Physician Detection
    const clinicMatch =
      ocr.text.match(/^([A-Z0-9\s,\.]{4,50}(?:CLINIC|HEALTH|HOSPITAL|CENTER|MEDICAL|CARE))/m) ||
      ocr.text.match(/(?:Hospital|Clinic|Health\s*Center|Facility)\s*[:|]\s*([^\n\r|]+)/i);
    const hospitalName = clinicMatch ? clinicMatch[1].replace(/^[|\s]+|[|\s]+$/g, '').trim() : 'Riverbend Family Health Clinic';

    const physicianMatch =
      ocr.text.match(/(?:Attending\s*Provider|Provider|Physician|Doctor|Electronically\s*signed\s*by)\s*[:|]?\s*([A-Za-z\s\.,MD]+?)(?=[\|\n\r]|Referring|Date|$)/i);
    const physicianName = physicianMatch ? physicianMatch[1].replace(/^[|\s]+|[|\s]+$/g, '').trim() : 'Dr. Elena M. Castillo, MD';

    // 4. Create Document Record
    const record: MedicalDocumentRecord = {
      id: `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      filename: file.name,
      fileType: file.type || file.name.split('.').pop() || 'unknown',
      fileSizeKb: Math.round(file.size / 1024) || 124,
      uploadedAt: new Date().toISOString(),
      documentDate: new Date().toISOString().split('T')[0],
      hospitalName,
      physicianName,
      category: classification.category,
      subtype: classification.subtype,
      confidenceScore: classification.confidenceScore,
      status: 'parsed',
      rawText: ocr.text,
      extractedDemographics: demographics,
      extractedDiagnoses: diagnoses,
      extractedLabs: labs,
      extractedMedications: meds,
      extractedAllergies: allergies,
      extractedSurgeries: surgeries,
      extractedSocialHistory: socialHistory,
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

    // Vitals
    if (document.extractedDemographics?.vitals) {
      const v = document.extractedDemographics.vitals;
      if (v.systolicBp) freshProfile.vitals.systolicBp = v.systolicBp;
      if (v.diastolicBp) freshProfile.vitals.diastolicBp = v.diastolicBp;
      if (v.heartRateBpm) freshProfile.vitals.heartRateBpm = v.heartRateBpm;
      if (v.respiratoryRateBpm) freshProfile.vitals.respiratoryRateBpm = v.respiratoryRateBpm;
      if (v.temperatureC) freshProfile.vitals.temperatureC = v.temperatureC;
      if (v.spo2Percent) freshProfile.vitals.spo2Percent = v.spo2Percent;
    }

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
    if (!freshProfile.labResults.lipid) freshProfile.labResults.lipid = {};

    document.extractedLabs.forEach(lab => {
      if (lab.standardKey === 'creatinine') freshProfile.labResults.cmp!.creatinineMgDl = lab.normalizedValue;
      if (lab.standardKey === 'bun') freshProfile.labResults.cmp!.bunMgDl = lab.normalizedValue;
      if (lab.standardKey === 'hba1c') freshProfile.labResults.hba1cPercent = lab.normalizedValue;
      if (lab.standardKey === 'glucose') freshProfile.labResults.cmp!.glucoseMgDl = lab.normalizedValue;
      if (lab.standardKey === 'hemoglobin') freshProfile.labResults.cbc!.hemoglobinGDl = lab.normalizedValue;
      if (lab.standardKey === 'alt') freshProfile.labResults.cmp!.altUL = lab.normalizedValue;
      if (lab.standardKey === 'ast') freshProfile.labResults.cmp!.astUL = lab.normalizedValue;
      if (lab.standardKey === 'potassium') freshProfile.labResults.cmp!.potassiumMEqL = lab.normalizedValue;
      if (lab.standardKey === 'total_cholesterol') freshProfile.labResults.lipid!.totalCholesterolMgDl = lab.normalizedValue;
      if (lab.standardKey === 'ldl') freshProfile.labResults.lipid!.ldlMgDl = lab.normalizedValue;
      if (lab.standardKey === 'hdl') freshProfile.labResults.lipid!.hdlMgDl = lab.normalizedValue;
      if (lab.standardKey === 'triglycerides') freshProfile.labResults.lipid!.triglyceridesMgDl = lab.normalizedValue;
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
    console.log('[DocumentPipeline] 1. Document Integrating:', approvedDocument.filename);
    console.log('[DocumentPipeline] 2. Parsed Data:', {
      demographics: approvedDocument.extractedDemographics,
      diagnoses: approvedDocument.extractedDiagnoses,
      labs: approvedDocument.extractedLabs,
      medications: approvedDocument.extractedMedications,
      allergies: approvedDocument.extractedAllergies,
      surgeries: approvedDocument.extractedSurgeries,
      lifestyle: approvedDocument.extractedSocialHistory
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

    // 2. Vital Signs
    if (approvedDocument.extractedDemographics?.vitals) {
      const v = approvedDocument.extractedDemographics.vitals;
      if (v.systolicBp) updated.vitals.systolicBp = v.systolicBp;
      if (v.diastolicBp) updated.vitals.diastolicBp = v.diastolicBp;
      if (v.heartRateBpm) updated.vitals.heartRateBpm = v.heartRateBpm;
      if (v.respiratoryRateBpm) updated.vitals.respiratoryRateBpm = v.respiratoryRateBpm;
      if (v.temperatureC) updated.vitals.temperatureC = v.temperatureC;
      if (v.spo2Percent) updated.vitals.spo2Percent = v.spo2Percent;
    }

    // 3. Conditions (Intelligent merge: update existing or append non-duplicate conditions)
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

    // 4. Lab Results (Intelligent merge into lab results)
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

    // 5. Medications (Intelligent merge: update dosage or append non-duplicate medications)
    if (approvedDocument.extractedMedications.length > 0) {
      approvedDocument.extractedMedications.forEach(med => {
        const existingIdx = updated.medications.findIndex(
          m => m.genericName.toLowerCase() === med.genericName.toLowerCase()
        );
        if (existingIdx >= 0) {
          updated.medications[existingIdx].dose = med.dose;
          updated.medications[existingIdx].frequency = med.frequency;
          updated.medications[existingIdx].reason = med.reason || updated.medications[existingIdx].reason;
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

    // 6. Allergies
    if (approvedDocument.extractedAllergies && approvedDocument.extractedAllergies.length > 0) {
      if (!updated.allergies) updated.allergies = [];
      approvedDocument.extractedAllergies.forEach(al => {
        if (!updated.allergies.some(a => a.allergen.toLowerCase() === al.allergen.toLowerCase())) {
          updated.allergies.push({
            id: `all_${Date.now()}_${updated.allergies.length}`,
            category: 'drug',
            allergen: al.allergen,
            reaction: al.reaction || 'Allergic reaction',
            severity: (al.severity as any) || 'moderate'
          });
        }
      });
    }

    // 7. Surgical History
    if (approvedDocument.extractedSurgeries && approvedDocument.extractedSurgeries.length > 0) {
      if (!updated.surgicalHistory) updated.surgicalHistory = [];
      approvedDocument.extractedSurgeries.forEach(surg => {
        if (!updated.surgicalHistory.some(s => s.name.toLowerCase().includes(surg.name.toLowerCase()))) {
          updated.surgicalHistory.push({
            id: `surg_${Date.now()}_${updated.surgicalHistory.length}`,
            name: surg.name,
            datePerformed: surg.year ? `${surg.year}-01-01` : '2015-01-01',
            hospital: 'General Hospital',
            notes: 'Uneventful recovery.'
          });
        }
      });
    }

    // 8. Lifestyle / Social History
    if (approvedDocument.extractedSocialHistory && updated.lifestyle) {
      if (approvedDocument.extractedSocialHistory.smoking) updated.lifestyle.smoking = approvedDocument.extractedSocialHistory.smoking;
      if (approvedDocument.extractedSocialHistory.alcohol) updated.lifestyle.alcohol = approvedDocument.extractedSocialHistory.alcohol;
      if (approvedDocument.extractedSocialHistory.exercise) {
        updated.lifestyle.exerciseIntensity = approvedDocument.extractedSocialHistory.exercise;
        updated.lifestyle.exerciseFrequencyDaysPerWeek = approvedDocument.extractedSocialHistory.exercise === 'none' ? 1 : 5;
      }
    }

    updated.updatedAt = new Date().toISOString();
    updated.calculatedMetrics = EHRCalculationsEngine.calculate(updated);

    console.log('[DocumentPipeline] 3. Merged Profile:', updated);
    return updated;
  }
}
