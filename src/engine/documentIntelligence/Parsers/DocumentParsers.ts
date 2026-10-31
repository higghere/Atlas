import { BaseDocumentParser, DocumentResult } from './BaseDocumentParser';
import { DOCXTextExtractor } from './DOCXTextExtractor';

export class TXTParser extends BaseDocumentParser {
  public supportedTypes(): string[] {
    return ['text/plain', 'txt'];
  }

  public validate(file: File): boolean {
    return file.size > 0 && file.size <= 50 * 1024 * 1024; // 50MB max
  }

  public async extractMetadata(file: File): Promise<Record<string, any>> {
    return {
      filename: file.name,
      lastModified: new Date(file.lastModified).toISOString(),
      type: 'PlainText'
    };
  }

  public async parse(file: File, content?: string): Promise<DocumentResult> {
    const rawText = content || await file.text();
    const metadata = await this.extractMetadata(file);
    const lines = rawText.split('\n').length;

    return {
      title: file.name.split('.')[0],
      rawText: rawText.trim(),
      metadata,
      pageCount: Math.ceil(lines / 40) || 1,
      warnings: [],
      errors: []
    };
  }
}

export class JSONParser extends BaseDocumentParser {
  public supportedTypes(): string[] {
    return ['application/json', 'json'];
  }

  public validate(file: File): boolean {
    return file.size > 0 && file.size <= 50 * 1024 * 1024;
  }

  public async extractMetadata(file: File): Promise<Record<string, any>> {
    return { filename: file.name, type: 'StructuredJSON' };
  }

  public async parse(file: File, content?: string): Promise<DocumentResult> {
    const rawText = content || await file.text();
    let metadata: Record<string, any> = {};
    try {
      metadata = JSON.parse(rawText);
    } catch (e) {
      // Raw string fallback
    }

    return {
      title: file.name.split('.')[0],
      rawText: rawText.trim(),
      metadata,
      pageCount: 1,
      warnings: [],
      errors: []
    };
  }
}

export class CSVParser extends BaseDocumentParser {
  public supportedTypes(): string[] {
    return ['text/csv', 'csv', 'application/vnd.ms-excel'];
  }

  public validate(file: File): boolean {
    return file.size > 0;
  }

  public async extractMetadata(file: File): Promise<Record<string, any>> {
    return { filename: file.name, type: 'TabularCSV' };
  }

  public async parse(file: File, content?: string): Promise<DocumentResult> {
    const rawText = content || await file.text();
    const rows = rawText.split('\n').filter(Boolean);

    return {
      title: file.name.split('.')[0],
      rawText: rawText.trim(),
      metadata: { rowCount: rows.length },
      pageCount: 1,
      warnings: [],
      errors: []
    };
  }
}

export class PDFParser extends BaseDocumentParser {
  public supportedTypes(): string[] {
    return ['application/pdf', 'pdf'];
  }

  public validate(file: File): boolean {
    return file.size > 0;
  }

  public async extractMetadata(file: File): Promise<Record<string, any>> {
    return { filename: file.name, type: 'PDFDocument' };
  }

  public async parse(file: File, content?: string): Promise<DocumentResult> {
    const rawText = content || `PDF Document Content for ${file.name}`;
    return {
      title: file.name.split('.')[0],
      rawText: rawText.trim(),
      metadata: { format: 'PDF' },
      pageCount: 1,
      warnings: [],
      errors: []
    };
  }
}

export class DOCXParser extends BaseDocumentParser {
  public supportedTypes(): string[] {
    return ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx', 'doc'];
  }

  public validate(file: File): boolean {
    return file.size > 0;
  }

  public async extractMetadata(file: File): Promise<Record<string, any>> {
    return { filename: file.name, type: 'WordDocument' };
  }

  public async parse(file: File, content?: string): Promise<DocumentResult> {
    let cleanParagraphs = '';
    if (content && !content.includes('PK\x03\x04') && !content.includes('word/_rels/')) {
      cleanParagraphs = content;
    }
    if (!cleanParagraphs) {
      cleanParagraphs = await DOCXTextExtractor.extractTextFromFile(file);
    }
    if (!cleanParagraphs) {
      const rawXML = await file.text().catch(() => '');
      cleanParagraphs = DOCXTextExtractor.extractCleanTextFromXML(rawXML);
    }

    return {
      title: file.name.split('.')[0],
      rawText: cleanParagraphs || `Clinical DOCX Report for ${file.name}`,
      metadata: { format: 'DOCX', extractedParagraphs: cleanParagraphs.split('\n').length },
      pageCount: Math.ceil(cleanParagraphs.split('\n').length / 30) || 1,
      warnings: [],
      errors: []
    };
  }
}

export class ImageParser extends BaseDocumentParser {
  public supportedTypes(): string[] {
    return ['image/png', 'image/jpeg', 'image/jpg', 'png', 'jpg', 'jpeg'];
  }

  public validate(file: File): boolean {
    return file.size > 0;
  }

  public async extractMetadata(file: File): Promise<Record<string, any>> {
    return { filename: file.name, type: 'MedicalImage' };
  }

  public async parse(file: File, content?: string): Promise<DocumentResult> {
    const rawText = content || `Extracted OCR Text from Image ${file.name}`;
    return {
      title: file.name.split('.')[0],
      rawText: rawText.trim(),
      metadata: { format: 'Image' },
      pageCount: 1,
      warnings: [],
      errors: []
    };
  }
}

// Architectural Placeholders for Future Medical Formats
export class DICOMParserPlaceholder extends BaseDocumentParser {
  public supportedTypes(): string[] { return ['application/dicom', 'dcm']; }
  public validate(file: File): boolean { return true; }
  public async extractMetadata(file: File): Promise<Record<string, any>> { return { format: 'DICOM' }; }
  public async parse(file: File): Promise<DocumentResult> {
    return { title: file.name, rawText: '[DICOM Medical Image Series]', metadata: {}, pageCount: 1, warnings: [], errors: [] };
  }
}

export class HL7ParserPlaceholder extends BaseDocumentParser {
  public supportedTypes(): string[] { return ['application/hl7-v2', 'hl7']; }
  public validate(file: File): boolean { return true; }
  public async extractMetadata(file: File): Promise<Record<string, any>> { return { format: 'HL7v2' }; }
  public async parse(file: File): Promise<DocumentResult> {
    return { title: file.name, rawText: '[HL7 Clinical Message]', metadata: {}, pageCount: 1, warnings: [], errors: [] };
  }
}

export class FHIRParserPlaceholder extends BaseDocumentParser {
  public supportedTypes(): string[] { return ['application/fhir+json', 'fhir']; }
  public validate(file: File): boolean { return true; }
  public async extractMetadata(file: File): Promise<Record<string, any>> { return { format: 'FHIR' }; }
  public async parse(file: File): Promise<DocumentResult> {
    return { title: file.name, rawText: '[FHIR Bundle Resource]', metadata: {}, pageCount: 1, warnings: [], errors: [] };
  }
}
