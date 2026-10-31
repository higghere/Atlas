import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { DOCXTextExtractor } from '../Parsers/DOCXTextExtractor';
import { OCREngine } from '../OCREngine';
import { DocumentPipeline } from '../DocumentPipeline';

describe('DOCX Real Upload File Tests', () => {
  const docxPath = 'C:/Users/VANSH/.gemini/antigravity/brain/9d1e7332-8af8-4751-850e-30520525d027/.user_uploaded/media_1793403615692_bd01b2d6.docx';

  it('should parse real docx file using DOCXTextExtractor without binary artifacts', async () => {
    if (!fs.existsSync(docxPath)) {
      console.warn('Docx file not found at:', docxPath);
      return;
    }
    const buffer = fs.readFileSync(docxPath);
    const file = new File([buffer], 'Mock_Clinic_Note_Type2Diabetes.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const text = await DOCXTextExtractor.extractTextFromFile(file);
    console.log('DOCXTextExtractor extracted length:', text.length);
    console.log('Extracted sample:\n', text.slice(0, 300));

    expect(text).not.toContain('PK\x03\x04');
    expect(text).not.toContain('word/_rels');
    expect(text.toLowerCase()).toContain('patient');
  });

  it('should process file through OCREngine and extract structured clinical data via DocumentPipeline', async () => {
    if (!fs.existsSync(docxPath)) return;
    const buffer = fs.readFileSync(docxPath);
    const file = new File([buffer], 'Mock_Clinic_Note_Type2Diabetes.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const ocrResult = await OCREngine.processFile(file);
    expect(ocrResult.text).not.toContain('PK\x03\x04');
    expect(ocrResult.text).not.toContain('word/_rels');

    const docRecord = await DocumentPipeline.processDocument(file);
    console.log('Integrated diagnoses count:', docRecord.extractedDiagnoses.length);
    console.log('Integrated medications count:', docRecord.extractedMedications.length);
    console.log('Integrated labs count:', docRecord.extractedLabs.length);

    expect(docRecord.extractedDiagnoses.length).toBeGreaterThan(0);
    expect(docRecord.extractedMedications.length).toBeGreaterThan(0);
    expect(docRecord.extractedLabs.length).toBeGreaterThan(0);
  });
});
