import { describe, it, expect } from 'vitest';
import { MedicalEntityExtractor } from '../MedicalEntityExtractor';
import { DocumentPipeline } from '../DocumentPipeline';
import { EHRCalculationsEngine } from '../../../utils/ehrCalculations';

const sampleNote1 = `
RIVERBEND FAMILY HEALTH CLINIC
123 Maple Street, Suite 200 · Springfield · (555) 019-2837 · www.riverbendhealth.example
OUTPATIENT CLINIC NOTE
PATIENT INFORMATION
| Patient Name: Maria Elena Delgado-Ruiz   | Date of Birth: 09/22/1964 (Age 61)   |
| MRN: MRN-0057163   | Sex: Female   |
| Visit Date: July 31, 2026   | Visit Type: Follow-up, in-person   |
| Attending Provider: Dr. Elena M. Castillo, MD   | Referring Provider: N/A   |
| Insurance: Coastal Health Alliance — HMO   | Emergency Contact: Luis Delgado (son), (555) 774-2093   |
VITAL SIGNS
| BP   | HR   | RR   | Temp   | SpO2   | Weight   | Height   | BMI   |
| 132/78 mmHg   | 74 bpm   | 15/min   | 98.1°F   | 99%   | 79 kg   | 160 cm   | 30.9   |
CHIEF COMPLAINT
“Here for my regular diabetes check. My blood sugars have been better, but my feet have been tingling at night.”
HISTORY OF PRESENT ILLNESS
Ms. Delgado-Ruiz is a 61-year-old female with a 6-year history of Type 2 diabetes mellitus, hypertension, and hyperlipidemia who presents for a scheduled quarterly follow-up. She reports improved adherence to her diet and medication regimen over the past several months, with home glucose readings generally ranging from 110-150 mg/dL fasting. She notes new intermittent tingling and mild numbness in both feet, worse at night, ongoing for approximately six weeks, without associated pain, weakness, or skin breakdown. She denies polyuria, polydipsia, vision changes, chest pain, or shortness of breath. She has not missed any doses of metformin or glipizide. She reports walking 20-30 minutes most days and denies tobacco or illicit drug use. She does not drink alcohol.
PAST MEDICAL HISTORY
Type 2 diabetes mellitus (diagnosed 2020)
Essential hypertension (diagnosed 2018)
Hyperlipidemia
Osteoarthritis, bilateral knees
Status post cholecystectomy (2015)
CURRENT MEDICATIONS
| Medication   | Dose   | Frequency   | Indication   |
| Metformin   | 1000 mg   | Twice daily with meals   | Type 2 diabetes   |
| Glipizide   | 5 mg   | Once daily, before breakfast   | Type 2 diabetes   |
| Amlodipine   | 5 mg   | Once daily   | Hypertension   |
| Rosuvastatin   | 10 mg   | Once daily, evening   | Hyperlipidemia   |
| Acetaminophen   | 500 mg   | As needed   | Osteoarthritis pain   |
ALLERGIES
Sulfa drugs — hives (mild severity). No known food allergies.
LABORATORY RESULTS (THIS VISIT)
| Test   | Result   | Reference Range   | Flag   |
| Fasting Plasma Glucose   | 132 mg/dL   | 70–99 mg/dL   | HIGH   |
| Hemoglobin A1c   | 7.1 %   | < 5.7 %   | HIGH   |
| Total Cholesterol   | 178 mg/dL   | < 200 mg/dL   | Normal   |
| LDL Cholesterol   | 92 mg/dL   | < 100 mg/dL   | Normal   |
| HDL Cholesterol   | 51 mg/dL   | > 40 mg/dL   | Normal   |
| Triglycerides   | 142 mg/dL   | < 150 mg/dL   | Normal   |
| Serum Creatinine   | 0.8 mg/dL   | 0.6–1.1 mg/dL   | Normal   |
| eGFR   | 84 mL/min/1.73m²   | > 60 mL/min/1.73m²   | Normal   |
| Urine Microalbumin/Creatinine   | 26 mg/g   | < 30 mg/g   | Normal   |
| Vitamin B12   | 298 pg/mL   | 200–900 pg/mL   | Normal   |
ASSESSMENT
1. Type 2 Diabetes Mellitus, with mild peripheral neuropathy (ICD-10: E11.42) — HbA1c improved from prior visit but remains above goal.
2. Essential Hypertension (ICD-10: I10) — At goal today (132/78) on current regimen.
3. Hyperlipidemia (ICD-10: E78.5) — At goal on current statin dose.
`;

const sampleNote2 = `
RIVERBEND FAMILY HEALTH CLINIC
OUTPATIENT CLINIC NOTE
PATIENT INFORMATION
| Patient Name: Jordan A. Whitfield   | Date of Birth: 03/14/1972 (Age 53)   |
| MRN: MRN-0048291   | Sex: Male   |
VITAL SIGNS
| BP   | HR   | RR   | Temp   | SpO2   | Weight   | Height   | BMI   |
| 138/86 mmHg   | 78 bpm   | 16/min   | 98.4°F   | 98%   | envir 96 kg   | 178 cm   | 30.3   |
CURRENT MEDICATIONS
| Medication   | Dose   | Frequency   | Indication   |
| Lisinopril   | 10 mg   | Once daily   | Hypertension   |
| Atorvastatin   | 20 mg   | Once daily, evening   | Hyperlipidemia   |
| Loratadine   | 10 mg   | As needed   | Allergic rhinitis   |
LABORATORY RESULTS (THIS VISIT)
| Test   | Result   | Reference Range   | Flag   |
| Fasting Plasma Glucose   | 148 mg/dL   | 70–99 mg/dL   | HIGH   |
| Hemoglobin A1c   | 7.4 %   | < 5.7 %   | HIGH   |
| Total Cholesterol   | 204 mg/dL   | < 200 mg/dL   | HIGH   |
| LDL Cholesterol   | 128 mg/dL   | < 100 mg/dL   | HIGH   |
| HDL Cholesterol   | 42 mg/dL   | > 40 mg/dL   | Normal   |
| Triglycerides   | 168 mg/dL   | < 150 mg/dL   | HIGH   |
| Serum Creatinine   | 0.9 mg/dL   | 0.7–1.3 mg/dL   | Normal   |
| eGFR   | 92 mL/min/1.73m²   | > 60 mL/min/1.73m²   | Normal   |
| Urine Microalbumin/Creatinine   | 18 mg/g   | < 30 mg/g   | Normal   |
ASSESSMENT
1. Type 2 Diabetes Mellitus, newly diagnosed (ICD-10: E11.9)
2. Essential Hypertension (ICD-10: I10)
3. Hyperlipidemia (ICD-10: E78.5)
`;

describe('MedicalEntityExtractor & Clinical Notes Integration Tests', () => {
  it('should extract complete demographics and vitals for Maria Elena Delgado-Ruiz', () => {
    const demographics = MedicalEntityExtractor.extractDemographics(sampleNote1);

    expect(demographics.patientName).toBe('Maria Elena Delgado-Ruiz');
    expect(demographics.age).toBe(61);
    expect(demographics.sex).toBe('female');
    expect(demographics.heightCm).toBe(160);
    expect(demographics.weightKg).toBe(79);
    expect(demographics.vitals?.systolicBp).toBe(132);
    expect(demographics.vitals?.diastolicBp).toBe(78);
    expect(demographics.vitals?.heartRateBpm).toBe(74);
    expect(demographics.vitals?.spo2Percent).toBe(99);
  });

  it('should extract all 10 laboratory parameters from Note 1', () => {
    const labs = MedicalEntityExtractor.extractLabs(sampleNote1);

    expect(labs.length).toBeGreaterThanOrEqual(9);
    const glucose = labs.find(l => l.standardKey === 'glucose');
    expect(glucose?.normalizedValue).toBe(132);
    const a1c = labs.find(l => l.standardKey === 'hba1c');
    expect(a1c?.normalizedValue).toBe(7.1);
    const creatinine = labs.find(l => l.standardKey === 'creatinine');
    expect(creatinine?.normalizedValue).toBe(0.8);
    const ldl = labs.find(l => l.standardKey === 'ldl');
    expect(ldl?.normalizedValue).toBe(92);
  });

  it('should extract all 5 medications from Note 1 with exact doses', () => {
    const meds = MedicalEntityExtractor.extractMedications(sampleNote1);

    expect(meds.length).toBe(5);
    const metformin = meds.find(m => m.genericName.toLowerCase().includes('metformin'));
    expect(metformin?.dose).toBe(1000);
    expect(metformin?.frequency).toBe('BD');

    const glipizide = meds.find(m => m.genericName.toLowerCase().includes('glipizide'));
    expect(glipizide?.dose).toBe(5);

    const rosuvastatin = meds.find(m => m.genericName.toLowerCase().includes('rosuvastatin'));
    expect(rosuvastatin?.dose).toBe(10);
  });

  it('should extract demographics, labs, and medications for Jordan A. Whitfield', () => {
    const demographics = MedicalEntityExtractor.extractDemographics(sampleNote2);
    expect(demographics.patientName).toBe('Jordan A. Whitfield');
    expect(demographics.age).toBe(53);
    expect(demographics.sex).toBe('male');
    expect(demographics.weightKg).toBe(96);
    expect(demographics.heightCm).toBe(178);

    const labs = MedicalEntityExtractor.extractLabs(sampleNote2);
    const glucose = labs.find(l => l.standardKey === 'glucose');
    expect(glucose?.normalizedValue).toBe(148);
    const a1c = labs.find(l => l.standardKey === 'hba1c');
    expect(a1c?.normalizedValue).toBe(7.4);

    const meds = MedicalEntityExtractor.extractMedications(sampleNote2);
    expect(meds.length).toBe(3);
    expect(meds.some(m => m.genericName.toLowerCase().includes('lisinopril'))).toBe(true);
    expect(meds.some(m => m.genericName.toLowerCase().includes('atorvastatin'))).toBe(true);
  });

  it('should cleanly merge Note 1 into Patient EHR Profile', () => {
    const defaultProfile = EHRCalculationsEngine.createDefaultProfile('Default Patient');
    const demographics = MedicalEntityExtractor.extractDemographics(sampleNote1);
    const diagnoses = MedicalEntityExtractor.extractDiagnoses(sampleNote1);
    const labs = MedicalEntityExtractor.extractLabs(sampleNote1);
    const meds = MedicalEntityExtractor.extractMedications(sampleNote1);
    const allergies = MedicalEntityExtractor.extractAllergies(sampleNote1);

    const docRecord: any = {
      id: 'doc_test',
      filename: 'maria_delgado_clinic_note.txt',
      extractedDemographics: demographics,
      extractedDiagnoses: diagnoses,
      extractedLabs: labs,
      extractedMedications: meds,
      extractedAllergies: allergies
    };

    const merged = DocumentPipeline.mergeDocumentToPatientProfile(defaultProfile, docRecord);

    expect(merged.patientName).toBe('Maria Elena Delgado-Ruiz');
    expect(merged.demographics.age).toBe(61);
    expect(merged.demographics.sex).toBe('female');
    expect(merged.anthropometrics.weightKg).toBe(79);
    expect(merged.anthropometrics.heightCm).toBe(160);
    expect(merged.vitals.systolicBp).toBe(132);
    expect(merged.vitals.heartRateBpm).toBe(74);
    expect(merged.labResults.cmp?.glucoseMgDl).toBe(132);
    expect(merged.labResults.hba1cPercent).toBe(7.1);
    expect(merged.medications.length).toBeGreaterThanOrEqual(5);
    expect(merged.medicalConditions.some(c => c.name.toLowerCase().includes('diabetes'))).toBe(true);
  });
});
