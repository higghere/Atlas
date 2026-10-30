// ─────────────────────────────────────────────────────────────
// Medical Named Entity Recognition (NER) Extractor
// Parses Demographics, Vitals, Diagnoses, Lab Tests, and Medications
// Supports Markdown Tables, Structured Forms, and Clinical Narratives
// ─────────────────────────────────────────────────────────────

import {
  ExtractedDemographics,
  ExtractedDiagnosis,
  ExtractedLabItem,
  ExtractedMedication,
  ExtractedAllergy,
  ExtractedSurgicalProcedure,
  ExtractedSocialHistory
} from '../../types/medicalDocument';
import { ConditionCategory, MedicationFrequency, MedicationRoute, MedicationUnit } from '../../types/patientEHR';
import { UnitNormalizer } from './UnitNormalizer';

export class MedicalEntityExtractor {
  /**
   * Extract patient demographics, anthropometrics, and vital signs
   */
  public static extractDemographics(text: string): ExtractedDemographics {
    const demographics: ExtractedDemographics = {};

    // 1. Patient Name (handles single names, full names, dots, hyphens, and Markdown table cells)
    const nameMatch =
      text.match(/Patient\s*Name\s*[:|]\s*([A-Za-z\s\.\-']+?)(?=\s{2,}|[\|\n\r]|Date\s*of\s*Birth|Age|DOB|MRN|$)/i) ||
      text.match(/Name\s*[:|]\s*([A-Za-z\s\.\-']+?)(?=\s{2,}|[\|\n\r]|Age|DOB|$)/i);
    if (nameMatch) {
      const cleanName = nameMatch[1].replace(/^[|\s]+|[|\s]+$/g, '').trim();
      if (cleanName.length > 1 && !cleanName.toLowerCase().includes('date of birth')) {
        demographics.patientName = cleanName;
      }
    }

    // 2. MRN
    const mrnMatch = text.match(/MRN\s*[:|]\s*([A-Za-z0-9\-_]+)/i);
    if (mrnMatch) {
      demographics.mrn = mrnMatch[1].trim();
    }

    // 3. Date of Birth
    const dobMatch = text.match(/(?:Date\s*of\s*Birth|DOB)\s*[:|]\s*(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/i);
    if (dobMatch) {
      demographics.dob = dobMatch[1].trim();
    }

    // 4. Age
    const ageMatch =
      text.match(/(?:Age|Age\s*in\s*years)\s*[:|]?\s*(\d{1,3})/i) ||
      text.match(/\(Age\s*(\d{1,3})\)/i) ||
      text.match(/(\d{1,3})[\s-]*(?:yo|y\/o|year[\s-]*old|years?\s*old)/i);
    if (ageMatch) {
      demographics.age = parseInt(ageMatch[1], 10);
    }

    // 5. Sex
    const sexMatch =
      text.match(/Sex\s*[:|]\s*(Male|Female|Other)/i) ||
      text.match(/Gender\s*[:|]\s*(Male|Female|Other)/i) ||
      text.match(/\|\s*(Male|Female)\s*\|/i);
    if (sexMatch) {
      demographics.sex = sexMatch[1].toLowerCase() as 'male' | 'female' | 'other';
    } else if (/\b(female|woman|lady)\b/i.test(text)) {
      demographics.sex = 'female';
    } else if (/\bmale\b/i.test(text)) {
      demographics.sex = 'male';
    }

    // 6. Height (cm)
    const heightMatch =
      text.match(/Height\s*[:|]\s*(\d{2,3}(?:\.\d+)?)\s*cm/i) ||
      text.match(/\|\s*(\d{2,3})\s*cm\s*\|/i) ||
      text.match(/(\d{2,3})\s*cm\b/i);
    if (heightMatch) {
      demographics.heightCm = parseInt(heightMatch[1], 10);
    }

    // 7. Weight (kg)
    const weightMatch =
      text.match(/Weight\s*[:|]\s*(?:envir\s+)?(\d{2,3}(?:\.\d+)?)\s*kg/i) ||
      text.match(/\|\s*(?:envir\s+)?(\d{2,3}(?:\.\d+)?)\s*kg\s*\|/i) ||
      text.match(/(\d{2,3}(?:\.\d+)?)\s*kg\b/i);
    if (weightMatch) {
      demographics.weightKg = parseFloat(weightMatch[1]);
    }

    // 8. BMI
    const bmiMatch =
      text.match(/BMI\s*[:|]\s*(\d{1,2}(?:\.\d+)?)/i) ||
      text.match(/\|\s*(\d{1,2}\.\d+)\s*\|/i);
    if (bmiMatch) {
      demographics.bmi = parseFloat(bmiMatch[1]);
    }

    // 9. Blood Group
    const bgMatch = text.match(/Blood\s*(?:Group|Type)\s*[:|]\s*([ABO][+-])/i);
    if (bgMatch) {
      demographics.bloodGroup = bgMatch[1];
    }

    // 10. Vital Signs Parsing
    const bpMatch = text.match(/(?:BP|Blood\s*Pressure)\s*[:|]?\s*(\d{2,3}\s*\/\s*\d{2,3})\s*(?:mmHg)?/i) || text.match(/(\d{2,3}\/\d{2,3})\s*mmHg/i);
    const hrMatch = text.match(/(?:HR|Heart\s*Rate|Pulse)\s*[:|]?\s*(\d{2,3})\s*(?:bpm|beats\/min)?/i) || text.match(/(\d{2,3})\s*bpm/i);
    const rrMatch = text.match(/(?:RR|Resp(?:iratory)?\s*Rate)\s*[:|]?\s*(\d{1,2})\s*(?:\/min|rpm)?/i) || text.match(/(\d{1,2})\s*\/min/i);
    const spo2Match = text.match(/(?:SpO2|O2\s*Sat(?:uration)?)\s*[:|]?\s*(\d{2,3})\s*%/i) || text.match(/(\d{2,3})\s*%\s*(?=\||\n|$)/i);
    const tempFMatch = text.match(/(\d{2,3}(?:\.\d+)?)\s*°?\s*F\b/i);
    const tempCMatch = text.match(/(\d{2}(?:\.\d+)?)\s*°?\s*C\b/i);

    let tempCelsius: number | undefined;
    if (tempFMatch) {
      tempCelsius = parseFloat((((parseFloat(tempFMatch[1]) - 32) * 5) / 9).toFixed(1));
    } else if (tempCMatch) {
      tempCelsius = parseFloat(tempCMatch[1]);
    }

    if (bpMatch || hrMatch || rrMatch || spo2Match || tempCelsius !== undefined) {
      let systolic = 120;
      let diastolic = 80;
      if (bpMatch) {
        const parts = bpMatch[1].split('/');
        systolic = parseInt(parts[0].trim(), 10);
        diastolic = parseInt(parts[1].trim(), 10);
      }

      demographics.vitals = {
        systolicBp: systolic,
        diastolicBp: diastolic,
        heartRateBpm: hrMatch ? parseInt(hrMatch[1], 10) : 72,
        respiratoryRateBpm: rrMatch ? parseInt(rrMatch[1], 10) : 16,
        temperatureC: tempCelsius !== undefined ? tempCelsius : 37.0,
        spo2Percent: spo2Match ? Math.min(100, parseInt(spo2Match[1], 10)) : 98
      };
    }

    return demographics;
  }

  /**
   * Extract diagnoses from Assessment, Past Medical History, ICD-10 codes, and clinical text
   */
  public static extractDiagnoses(text: string): ExtractedDiagnosis[] {
    const diagnoses: ExtractedDiagnosis[] = [];
    const lower = text.toLowerCase();
    const seenNames = new Set<string>();

    // 1. Explicit ICD-10 Pattern matching: e.g. "Type 2 Diabetes Mellitus... (ICD-10: E11.42)"
    const icdRegex = /([A-Za-z0-9\s,\-\/]+?)\s*\((?:ICD-10|ICD10)[:\s]*([A-Z0-9\.]+)\)/gi;
    let icdMatch: RegExpExecArray | null;
    while ((icdMatch = icdRegex.exec(text)) !== null) {
      const rawCondition = icdMatch[1].replace(/^\d+\.\s*/, '').trim();
      const icdCode = icdMatch[2].trim();
      const condLower = rawCondition.toLowerCase();

      let category: ConditionCategory = 'endocrine';
      if (condLower.includes('hyperten') || condLower.includes('cardio') || condLower.includes('heart')) {
        category = 'cardiovascular';
      } else if (condLower.includes('diabet')) {
        category = 'endocrine';
      } else if (condLower.includes('lipid') || condLower.includes('cholesterol')) {
        category = 'endocrine';
      } else if (condLower.includes('kidney') || condLower.includes('renal')) {
        category = 'renal';
      } else if (condLower.includes('neuro') || condLower.includes('neuropathy') || condLower.includes('stroke')) {
        category = 'neurological';
      } else if (condLower.includes('osteo') || condLower.includes('arthrit') || condLower.includes('joint')) {
        category = 'musculoskeletal';
      }

      if (!seenNames.has(rawCondition.toLowerCase())) {
        seenNames.add(rawCondition.toLowerCase());
        diagnoses.push({
          id: `diag_icd_${Date.now()}_${diagnoses.length}`,
          name: rawCondition,
          category,
          stage: condLower.includes('mild') ? 'Mild' : condLower.includes('severe') ? 'Severe' : 'Active',
          icd10: icdCode,
          severity: condLower.includes('severe') ? 'severe' : 'moderate',
          confidence: 0.98,
          sourceSnippet: icdMatch[0]
        });
      }
    }

    // 2. Structured Past Medical History / Assessment lines
    const pmhSection = text.match(/(?:PAST MEDICAL HISTORY|ASSESSMENT|PROBLEMS? LIST|DIAGNOSIS)[\s\S]*?(?=(?:CURRENT MEDICATIONS|ALLERGIES|FAMILY HISTORY|PHYSICAL EXAMINATION|PLAN|SOCIAL HISTORY|$))/i);
    const searchScope = pmhSection ? pmhSection[0] : text;

    const conditionCatalog: Array<{
      key: RegExp;
      name: string;
      category: ConditionCategory;
      defaultStage: string;
    }> = [
      { key: /type\s*2\s*diabetes|t2dm|diabetes\s*mellitus/i, name: 'Type 2 Diabetes Mellitus', category: 'endocrine', defaultStage: 'Sub-optimal' },
      { key: /essential\s*hypertension|hypertension|high\s*blood\s*pressure/i, name: 'Essential Hypertension', category: 'cardiovascular', defaultStage: 'Stage 1' },
      { key: /hyperlipidemia|dyslipidemia|high\s*cholesterol/i, name: 'Hyperlipidemia', category: 'endocrine', defaultStage: 'Controlled' },
      { key: /peripheral\s*neuropathy|diabetic\s*neuropathy/i, name: 'Diabetic Peripheral Neuropathy', category: 'neurological', defaultStage: 'Mild' },
      { key: /osteoarthritis/i, name: 'Osteoarthritis', category: 'musculoskeletal', defaultStage: 'Bilateral Knees' },
      { key: /chronic\s*kidney\s*disease|ckd/i, name: 'Chronic Kidney Disease (CKD)', category: 'renal', defaultStage: 'Stage 3' },
      { key: /heart\s*failure|chf|cardiomyopathy/i, name: 'Heart Failure', category: 'cardiovascular', defaultStage: 'NYHA Class II' },
      { key: /asthma/i, name: 'Bronchial Asthma', category: 'respiratory', defaultStage: 'Mild Intermittent' },
      { key: /copd|chronic\s*obstructive/i, name: 'Chronic Obstructive Pulmonary Disease', category: 'respiratory', defaultStage: 'GOLD Stage II' },
      { key: /cirrhosis/i, name: 'Hepatic Cirrhosis', category: 'hepatic', defaultStage: 'Compensated' }
    ];

    conditionCatalog.forEach((cond, idx) => {
      // Avoid negative statements like "denies chest pain", "no ckd", etc.
      if (cond.name.includes('Kidney') && (lower.includes('no ckd') || lower.includes('no chronic kidney disease') || lower.includes('normal renal'))) {
        return;
      }

      if (cond.key.test(searchScope) && !seenNames.has(cond.name.toLowerCase())) {
        seenNames.add(cond.name.toLowerCase());
        diagnoses.push({
          id: `diag_${Date.now()}_${idx}`,
          name: cond.name,
          category: cond.category,
          stage: cond.defaultStage,
          severity: 'moderate',
          confidence: 0.95,
          sourceSnippet: `Extracted clinical diagnosis: ${cond.name}`
        });
      }
    });

    return diagnoses;
  }

  /**
   * Extract laboratory test values from Markdown tables or clinical report lines
   */
  public static extractLabs(text: string): ExtractedLabItem[] {
    const labs: ExtractedLabItem[] = [];
    const seenKeys = new Set<string>();

    const labKeyAliases: Array<{ key: string; name: string; patterns: RegExp[] }> = [
      { key: 'glucose', name: 'Fasting Plasma Glucose', patterns: [/fasting\s*(?:plasma\s*)?glucose/i, /fast\s*blood\s*glucose/i, /blood\s*glucose/i, /\bglucose\b/i] },
      { key: 'hba1c', name: 'Hemoglobin A1c', patterns: [/hemoglobin\s*a1c/i, /hba1c/i, /\ba1c\b/i] },
      { key: 'total_cholesterol', name: 'Total Cholesterol', patterns: [/total\s*cholesterol/i, /\bcholesterol\b/i] },
      { key: 'ldl', name: 'LDL Cholesterol', patterns: [/ldl\s*(?:cholesterol)?/i, /\bldl\b/i] },
      { key: 'hdl', name: 'HDL Cholesterol', patterns: [/hdl\s*(?:cholesterol)?/i, /\bhdl\b/i] },
      { key: 'triglycerides', name: 'Triglycerides', patterns: [/triglycerides/i, /\btrig\b/i] },
      { key: 'creatinine', name: 'Serum Creatinine', patterns: [/serum\s*creatinine/i, /\bcreatinine\b/i] },
      { key: 'egfr', name: 'eGFR', patterns: [/egfr/i, /\bgfr\b/i] },
      { key: 'urine_microalbumin', name: 'Urine Microalbumin/Creatinine', patterns: [/urine\s*microalbumin/i, /microalbumin\s*\/\s*creatinine/i, /\bmicroalbumin\b/i] },
      { key: 'vitamin_b12', name: 'Vitamin B12', patterns: [/vitamin\s*b12/i, /vit\s*b12/i, /\bb12\b/i] },
      { key: 'hemoglobin', name: 'Hemoglobin', patterns: [/\bhemoglobin\b(?!\s*a1c)/i, /\bhgb\b(?!\s*a1c)/i] },
      { key: 'bun', name: 'Blood Urea Nitrogen (BUN)', patterns: [/\bbun\b/i, /blood\s*urea\s*nitrogen/i] },
      { key: 'potassium', name: 'Serum Potassium', patterns: [/serum\s*potassium/i, /\bpotassium\b/i, /\bk\+\b/i] },
      { key: 'sodium', name: 'Serum Sodium', patterns: [/serum\s*sodium/i, /\bsodium\b/i, /\bna\+\b/i] },
      { key: 'alt', name: 'ALT (SGPT)', patterns: [/\balt\b/i, /\bsgpt\b/i] },
      { key: 'ast', name: 'AST (SGOT)', patterns: [/\bast\b/i, /\bsgot\b/i] },
      { key: 'albumin', name: 'Albumin', patterns: [/\balbumin\b(?!\s*\/)/i] }
    ];

    const lines = text.split('\n');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Case A: Markdown Table Row (e.g. "| Fasting Plasma Glucose | 132 mg/dL | 70–99 mg/dL | HIGH |")
      if (line.includes('|')) {
        const columns = line.split('|').map(c => c.trim()).filter(Boolean);
        if (columns.length >= 2) {
          const col0 = columns[0];
          const col1 = columns[1];

          // Check if this row matches one of our known lab keys
          for (const item of labKeyAliases) {
            if (seenKeys.has(item.key)) continue;

            const matchesKey = item.patterns.some(p => p.test(col0));
            if (matchesKey) {
              // Extract numeric value and optional unit from col1
              const valMatch = col1.match(/([<>]?\s*\d+(?:\.\d+)?)\s*([a-zA-Z%/\^²2\-]*)/);
              if (valMatch) {
                const numOnly = parseFloat(valMatch[1].replace(/[<>]/g, '').trim());
                if (!isNaN(numOnly)) {
                  const rawUnit = valMatch[2] || '';
                  const norm = UnitNormalizer.normalize(item.key, numOnly, rawUnit);

                  // Extract reference range if present in col2
                  let refLow = norm.refLow;
                  let refHigh = norm.refHigh;
                  if (columns.length >= 3) {
                    const refRangeMatch = columns[2].match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
                    if (refRangeMatch) {
                      refLow = parseFloat(refRangeMatch[1]);
                      refHigh = parseFloat(refRangeMatch[2]);
                    }
                  }

                  seenKeys.add(item.key);
                  labs.push({
                    id: `lab_${item.key}_${Date.now()}`,
                    testName: item.name,
                    standardKey: item.key,
                    rawValue: numOnly,
                    rawUnit: rawUnit || norm.normalizedUnit,
                    normalizedValue: norm.normalizedValue,
                    normalizedUnit: norm.normalizedUnit,
                    refLow,
                    refHigh,
                    status: norm.status,
                    confidence: 0.98,
                    sourceSnippet: line
                  });
                  break;
                }
              }
            }
          }
        }
      }

      // Case B: Non-table colon or space-separated format (e.g. "Fasting Glucose: 132 mg/dL" or "HbA1c 7.1%")
      for (const item of labKeyAliases) {
        if (seenKeys.has(item.key)) continue;

        for (const p of item.patterns) {
          const regex = new RegExp(`(?:${p.source})\\s*[:|\\s]+\\s*([<>]?\\s*\\d+(?:\\.\\d+)?)\\s*([a-zA-Z%\\/\\^²2\\-]*)`, 'i');
          const m = line.match(regex);
          if (m) {
            const numOnly = parseFloat(m[1].replace(/[<>]/g, '').trim());
            if (!isNaN(numOnly)) {
              const rawUnit = m[2] || '';
              const norm = UnitNormalizer.normalize(item.key, numOnly, rawUnit);

              seenKeys.add(item.key);
              labs.push({
                id: `lab_${item.key}_${Date.now()}`,
                testName: item.name,
                standardKey: item.key,
                rawValue: numOnly,
                rawUnit: rawUnit || norm.normalizedUnit,
                normalizedValue: norm.normalizedValue,
                normalizedUnit: norm.normalizedUnit,
                refLow: norm.refLow,
                refHigh: norm.refHigh,
                status: norm.status,
                confidence: 0.95,
                sourceSnippet: line
              });
              break;
            }
          }
        }
      }
    }

    return labs;
  }

  /**
   * Extract medications from Markdown tables, prescription lists, and clinical notes
   */
  public static extractMedications(text: string): ExtractedMedication[] {
    const meds: ExtractedMedication[] = [];
    const seenMeds = new Set<string>();

    const normalizeFreq = (freqStr: string): MedicationFrequency => {
      const lower = freqStr.toLowerCase();
      if (lower.includes('twice') || lower.includes('bid') || lower.includes('b.i.d')) return 'BD';
      if (lower.includes('three') || lower.includes('tid') || lower.includes('t.i.d') || lower.includes('tds')) return 'TDS';
      if (lower.includes('four') || lower.includes('qid') || lower.includes('q.i.d')) return 'QID';
      if (lower.includes('as needed') || lower.includes('prn') || lower.includes('p.r.n')) return 'PRN';
      return 'OD';
    };

    // Check if there is an explicit MEDICATIONS section
    const medSectionMatch = text.match(/(?:CURRENT\s*MEDICATIONS|MEDICATIONS|PRESCRIPTIONS)[\s\S]*?(?=(?:ALLERGIES|LABORATORY|LABS|FAMILY\s*HISTORY|PHYSICAL\s*EXAMINATION|ASSESSMENT|PLAN|SOCIAL\s*HISTORY|$))/i);
    const scopeText = medSectionMatch ? medSectionMatch[0] : text;

    const lines = scopeText.split('\n');

    // 1. Parse Markdown Table Rows (e.g. "| Metformin | 1000 mg | Twice daily with meals | Type 2 diabetes |")
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.includes('|')) continue;

      const cols = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 2) {
        const drugCol = cols[0];
        const doseCol = cols[1];
        const freqCol = cols.length >= 3 ? cols[2] : 'Once daily';
        const reasonCol = cols.length >= 4 ? cols[3] : 'Clinical Indication';

        // Check if header row or lab test row
        if (/medication|drug|rx\b/i.test(drugCol) && /dose|strength/i.test(doseCol)) {
          continue;
        }
        if (/\b(glucose|cholesterol|creatinine|hemoglobin|egfr|triglycerides|microalbumin|b12|potassium|sodium|alt|ast|urine|bun)\b/i.test(drugCol)) {
          continue;
        }

        const doseMatch = doseCol.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|units?|ml)?/i);
        if (doseMatch) {
          const doseNum = parseFloat(doseMatch[1]);
          const unit = (doseMatch[2]?.toLowerCase() || 'mg') as MedicationUnit;
          const genericName = drugCol.trim();

          if (genericName && !seenMeds.has(genericName.toLowerCase())) {
            seenMeds.add(genericName.toLowerCase());
            meds.push({
              id: `med_${Date.now()}_${meds.length}`,
              genericName,
              dose: doseNum,
              unit,
              frequency: normalizeFreq(freqCol),
              route: 'oral',
              reason: reasonCol,
              confidence: 0.98,
              sourceSnippet: line
            });
          }
        }
      }
    }

    // 2. Fallback Narrative/Rx catalog search (only if table didn't find meds or looking outside table)
    if (meds.length === 0) {
      const knownMeds = [
        { name: 'Metformin', reason: 'Type 2 Diabetes Mellitus' },
        { name: 'Glipizide', reason: 'Type 2 Diabetes Mellitus' },
        { name: 'Amlodipine', reason: 'Essential Hypertension' },
        { name: 'Rosuvastatin', reason: 'Hyperlipidemia' },
        { name: 'Atorvastatin', reason: 'Hyperlipidemia' },
        { name: 'Lisinopril', reason: 'Essential Hypertension' },
        { name: 'Losartan', reason: 'Hypertension' },
        { name: 'Acetaminophen', reason: 'Pain Relief / Osteoarthritis' },
        { name: 'Loratadine', reason: 'Allergic Rhinitis' },
        { name: 'Furosemide', reason: 'Diuresis / Heart Failure' },
        { name: 'Levothyroxine', reason: 'Hypothyroidism' },
        { name: 'Omeprazole', reason: 'GERD / Gastric Protection' }
      ];

      knownMeds.forEach(drug => {
        if (seenMeds.has(drug.name.toLowerCase())) return;

        const regex = new RegExp(`\\b${drug.name}\\s*[:\\-]?\\s*(\\d+(?:\\.\\d+)?)\\s*(mg|mcg|g)?(?:\\s*([a-zA-Z\\s]+))?`, 'i');
        const match = text.match(regex);
        if (match) {
          const dose = parseFloat(match[1]);
          const unit = (match[2]?.toLowerCase() || 'mg') as MedicationUnit;
          const trailing = match[3] || 'OD';

          seenMeds.add(drug.name.toLowerCase());
          meds.push({
            id: `med_${Date.now()}_${meds.length}`,
            genericName: drug.name,
            dose,
            unit,
            frequency: normalizeFreq(trailing),
            route: 'oral',
            reason: drug.reason,
            confidence: 0.92,
            sourceSnippet: match[0]
          });
        }
      });
    }

    return meds;
  }

  /**
   * Extract allergies from ALLERGIES section
   */
  public static extractAllergies(text: string): ExtractedAllergy[] {
    const allergies: ExtractedAllergy[] = [];
    const match = text.match(/ALLERGIES\s*[:\n\r]+([^\n\r]+)/i);
    if (match) {
      const line = match[1].trim();
      if (!/no known|nkda|none\b/i.test(line)) {
        // e.g. "Sulfa drugs — hives (mild severity)" or "Penicillin — rash (moderate severity)"
        const parts = line.split(/[—–\-]/);
        const allergen = parts[0].replace(/no known.*$/i, '').trim();
        const reactionPart = parts[1] || '';
        const severityMatch = reactionPart.match(/(mild|moderate|severe)/i);

        if (allergen) {
          allergies.push({
            allergen,
            reaction: reactionPart.replace(/\(.*?\)/g, '').trim() || 'Allergic reaction',
            severity: severityMatch ? severityMatch[1].toLowerCase() : 'moderate'
          });
        }
      }
    }
    return allergies;
  }

  /**
   * Extract surgical history
   */
  public static extractSurgeries(text: string): ExtractedSurgicalProcedure[] {
    const surgeries: ExtractedSurgicalProcedure[] = [];
    const matches = text.matchAll(/(?:Status\s*post|s\/p|history\s*of)\s*([A-Za-z\s]+?)(?:\s*\((\d{4})\)|\n|\r|,|;|$)/gi);
    for (const m of matches) {
      const name = m[1].trim();
      const year = m[2];
      if (name && !/diabetes|hypertension|hyperlipidemia/i.test(name)) {
        surgeries.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          year
        });
      }
    }
    return surgeries;
  }

  /**
   * Extract social history
   */
  public static extractSocialHistory(text: string): ExtractedSocialHistory {
    const lower = text.toLowerCase();
    const history: ExtractedSocialHistory = {};

    if (lower.includes('non-smoker') || lower.includes('denies tobacco') || lower.includes('no smoking')) {
      history.smoking = 'never';
    } else if (lower.includes('smoker') || lower.includes('tobacco use')) {
      history.smoking = 'daily';
    }

    if (lower.includes('no alcohol') || lower.includes('does not drink')) {
      history.alcohol = 'never';
    } else if (lower.includes('socially') || lower.includes('occasional alcohol') || lower.includes('2-3 drinks')) {
      history.alcohol = 'social';
    }

    if (lower.includes('active') || lower.includes('walking 20-30') || lower.includes('150 minutes')) {
      history.exercise = 'moderate';
    } else if (lower.includes('sedentary')) {
      history.exercise = 'none';
    }

    return history;
  }
}
