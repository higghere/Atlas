// ─────────────────────────────────────────────────────────────
// Medical Document Classifier & Subtype Detector
// ─────────────────────────────────────────────────────────────

import { DocumentCategory, DocumentSubtype } from '../../types/medicalDocument';

export interface ClassificationResult {
  category: DocumentCategory;
  subtype: DocumentSubtype;
  confidenceScore: number;
}

export class DocumentClassifier {
  public static classify(text: string, filename: string): ClassificationResult {
    const content = (text + ' ' + filename).toLowerCase();

    // 1. Laboratory Detection
    if (
      content.includes('blood count') ||
      content.includes('cbc') ||
      content.includes('hemoglobin') ||
      content.includes('creatinine') ||
      content.includes('hba1c') ||
      content.includes('lipid') ||
      content.includes('laboratory') ||
      content.includes('lft') ||
      content.includes('kft')
    ) {
      let subtype: DocumentSubtype = 'cbc';
      if (content.includes('creatinine') || content.includes('urea') || content.includes('egfr')) subtype = 'kft';
      else if (content.includes('alt') || content.includes('ast') || content.includes('bilirubin')) subtype = 'lft';
      else if (content.includes('hba1c') || content.includes('glucose')) subtype = 'hba1c';
      else if (content.includes('cholesterol') || content.includes('triglycerides')) subtype = 'lipid_panel';

      return { category: 'laboratory', subtype, confidenceScore: 0.96 };
    }

    // 2. Clinical & Discharge Summaries
    if (
      content.includes('discharge summary') ||
      content.includes('prescription') ||
      content.includes('operative report') ||
      content.includes('admission note') ||
      content.includes('hospital course')
    ) {
      let subtype: DocumentSubtype = 'discharge_summary';
      if (content.includes('prescription') || content.includes('rx')) subtype = 'prescription';
      else if (content.includes('operative')) subtype = 'operative_report';

      return { category: 'clinical', subtype, confidenceScore: 0.94 };
    }

    // 3. Cardiology Reports
    if (
      content.includes('ecg') ||
      content.includes('echocardiogram') ||
      content.includes('ejection fraction') ||
      content.includes('sinus rhythm') ||
      content.includes('holter')
    ) {
      return {
        category: 'cardiology',
        subtype: content.includes('ecg') ? 'ecg' : 'echo',
        confidenceScore: 0.95,
      };
    }

    // 4. Imaging Reports
    if (
      content.includes('ct scan') ||
      content.includes('mri') ||
      content.includes('x-ray') ||
      content.includes('ultrasound') ||
      content.includes('radiology')
    ) {
      let subtype: DocumentSubtype = 'xray_report';
      if (content.includes('ct')) subtype = 'ct_report';
      else if (content.includes('mri')) subtype = 'mri_report';
      else if (content.includes('ultrasound')) subtype = 'ultrasound';

      return { category: 'imaging', subtype, confidenceScore: 0.92 };
    }

    return { category: 'other', subtype: 'unknown', confidenceScore: 0.75 };
  }
}
