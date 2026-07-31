// ─────────────────────────────────────────────────────────────
// Medical Named Entity Recognition (NER) Extractor
// Parses Demographics, Diagnoses, Lab Tests, and Medications
// ─────────────────────────────────────────────────────────────

import { ExtractedDemographics, ExtractedDiagnosis, ExtractedLabItem, ExtractedMedication } from '../../types/medicalDocument';
import { ConditionCategory } from '../../types/patientEHR';
import { UnitNormalizer } from './UnitNormalizer';

export class MedicalEntityExtractor {
  public static extractDemographics(text: string): ExtractedDemographics {
    const demographics: ExtractedDemographics = {};

    const nameMatch = text.match(/Patient Name:\s*([A-Za-z\s]+?)(?=\s{2,}|\n|Age:|$)/i);
    if (nameMatch) demographics.patientName = nameMatch[1].trim();

    const ageMatch = text.match(/Age:\s*(\d+)/i);
    if (ageMatch) demographics.age = parseInt(ageMatch[1], 10);

    const sexMatch = text.match(/Sex:\s*(Male|Female|Other)/i);
    if (sexMatch) demographics.sex = sexMatch[1].toLowerCase() as 'male' | 'female' | 'other';

    const heightMatch = text.match(/Height:\s*(\d+)\s*cm/i);
    if (heightMatch) demographics.heightCm = parseInt(heightMatch[1], 10);

    const weightMatch = text.match(/Weight:\s*(\d+)\s*kg/i);
    if (weightMatch) demographics.weightKg = parseInt(weightMatch[1], 10);

    const bgMatch = text.match(/Blood Group:\s*([ABO][+-])/i);
    if (bgMatch) demographics.bloodGroup = bgMatch[1];

    return demographics;
  }

  public static extractDiagnoses(text: string): ExtractedDiagnosis[] {
    const diagnoses: ExtractedDiagnosis[] = [];
    const lower = text.toLowerCase();

    const patterns: Array<{ key: string; name: string; category: ConditionCategory; stage?: string }> = [
      { key: 'hyperlipidemia', name: 'Hyperlipidemia', category: 'endocrine', stage: 'Controlled' },
      { key: 'heart failure', name: 'Heart Failure', category: 'cardiovascular', stage: 'NYHA Class III' },
      { key: 'hypertension', name: 'Essential Hypertension', category: 'cardiovascular', stage: 'Stage 1' },
      { key: 'diabetes', name: 'Type 2 Diabetes Mellitus', category: 'endocrine', stage: 'Sub-optimal' },
      { key: 'chronic kidney disease', name: 'Chronic Kidney Disease (CKD)', category: 'renal', stage: 'Stage 3b' },
      { key: 'ckd', name: 'Chronic Kidney Disease (CKD)', category: 'renal', stage: 'Stage 3' },
      { key: 'cirrhosis', name: 'Hepatic Cirrhosis', category: 'hepatic', stage: 'Compensated' },
      { key: 'copd', name: 'Chronic Obstructive Pulmonary Disease', category: 'respiratory', stage: 'GOLD Stage II' },
      { key: 'stroke', name: 'Ischemic Stroke', category: 'neurological' },
    ];

    patterns.forEach((pat, idx) => {
      // Check negative presence before matching CKD
      if (pat.key.includes('ckd') || pat.key.includes('kidney')) {
        if (lower.includes('no ckd') || lower.includes('no chronic kidney disease') || lower.includes('no evidence of chronic kidney disease') || lower.includes('normal renal')) {
          return;
        }
      }

      if (lower.includes(pat.key)) {
        diagnoses.push({
          id: `diag_${Date.now()}_${idx}`,
          name: pat.name,
          category: pat.category,
          stage: pat.stage,
          severity: lower.includes('severe') || lower.includes('stage 3') ? 'severe' : 'moderate',
          confidence: 0.95,
          sourceSnippet: `Matched condition: "${pat.name}" from clinical report notes.`,
        });
      }
    });

    return diagnoses;
  }

  public static extractLabs(text: string): ExtractedLabItem[] {
    const labs: ExtractedLabItem[] = [];
    const lines = text.split('\n');

    const labMatchers = [
      { key: 'hemoglobin', pattern: /(?:Hemoglobin|Hgb)\s+(\d+\.?\d*)\s*(g\/dL|g\/L)?/i },
      { key: 'creatinine', pattern: /(?:Serum Creatinine|Creatinine)\s+(\d+\.?\d*)\s*(mg\/dL|umol\/L)?/i },
      { key: 'bun', pattern: /(?:BUN|Blood Urea Nitrogen)\s+(\d+\.?\d*)\s*(mg\/dL)?/i },
      { key: 'egfr', pattern: /(?:eGFR|GFR)\s+(\d+\.?\d*)\s*(mL\/min)?/i },
      { key: 'urine_microalbumin', pattern: /(?:Urine Microalbumin|Microalbumin)\s+(\d+\.?\d*)\s*(mg\/L)?/i },
      { key: 'hba1c', pattern: /(?:HbA1c|A1C)\s+(\d+\.?\d*)\s*(%)?/i },
      { key: 'glucose', pattern: /(?:Fast Blood Glucose|Fasting Glucose|Glucose)\s+(\d+\.?\d*)\s*(mg\/dL|mmol\/L)?/i },
      { key: 'potassium', pattern: /(?:Serum Potassium|Potassium|K\+)\s+(\d+\.?\d*)\s*(mEq\/L|mmol\/L)?/i },
      { key: 'alt', pattern: /(?:ALT|SGPT)\s+(\d+\.?\d*)\s*(U\/L)?/i },
      { key: 'ast', pattern: /(?:AST|SGOT)\s+(\d+\.?\d*)\s*(U\/L)?/i },
      { key: 'total_cholesterol', pattern: /(?:Total Cholesterol|Cholesterol)\s+(\d+\.?\d*)\s*(mg\/dL)?/i },
      { key: 'ldl', pattern: /(?:LDL Cholesterol|LDL)\s+(\d+\.?\d*)\s*(mg\/dL)?/i },
      { key: 'hdl', pattern: /(?:HDL Cholesterol|HDL)\s+(\d+\.?\d*)\s*(mg\/dL)?/i },
      { key: 'triglycerides', pattern: /(?:Triglycerides)\s+(\d+\.?\d*)\s*(mg\/dL)?/i },
    ];

    labMatchers.forEach((matcher, idx) => {
      for (const line of lines) {
        const m = line.match(matcher.pattern);
        if (m) {
          const rawVal = parseFloat(m[1]);
          const rawUnit = m[2] || '';

          const norm = UnitNormalizer.normalize(matcher.key, rawVal, rawUnit);

          labs.push({
            id: `lab_${Date.now()}_${idx}`,
            testName: matcher.key.toUpperCase().replace('_', ' '),
            standardKey: norm.standardKey,
            rawValue: rawVal,
            rawUnit: rawUnit || norm.normalizedUnit,
            normalizedValue: norm.normalizedValue,
            normalizedUnit: norm.normalizedUnit,
            refLow: norm.refLow,
            refHigh: norm.refHigh,
            status: norm.status,
            confidence: 0.96,
            sourceSnippet: line.trim(),
          });
          break;
        }
      }
    });

    return labs;
  }

  public static extractMedications(text: string): ExtractedMedication[] {
    const meds: ExtractedMedication[] = [];

    const medCatalog = [
      { generic: 'Metformin', brand: 'Glucophage', defaultDose: 500, unit: 'mg' as const, freq: 'BD' as const, route: 'oral' as const, reason: 'Type 2 Diabetes Mellitus' },
      { generic: 'Lisinopril', brand: 'Zestril', defaultDose: 10, unit: 'mg' as const, freq: 'OD' as const, route: 'oral' as const, reason: 'Essential Hypertension' },
      { generic: 'Atorvastatin', brand: 'Lipitor', defaultDose: 40, unit: 'mg' as const, freq: 'OD' as const, route: 'oral' as const, reason: 'Hyperlipidemia' },
      { generic: 'Furosemide', brand: 'Lasix', defaultDose: 40, unit: 'mg' as const, freq: 'OD' as const, route: 'oral' as const, reason: 'Diuresis' },
      { generic: 'Amlodipine', brand: 'Norvasc', defaultDose: 5, unit: 'mg' as const, freq: 'OD' as const, route: 'oral' as const, reason: 'Hypertension' },
    ];

    medCatalog.forEach((item, idx) => {
      const lower = text.toLowerCase();
      if (lower.includes(item.generic.toLowerCase())) {
        meds.push({
          id: `med_${Date.now()}_${idx}`,
          genericName: item.generic,
          brandName: item.brand,
          dose: item.defaultDose,
          unit: item.unit,
          frequency: item.freq,
          route: item.route,
          reason: item.reason,
          confidence: 0.95,
          sourceSnippet: `Extracted prescription: ${item.generic} ${item.defaultDose}${item.unit}`,
        });
      }
    });

    return meds;
  }
}
