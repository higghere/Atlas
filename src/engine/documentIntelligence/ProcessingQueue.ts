// ─────────────────────────────────────────────────────────────
// Asynchronous Processing Queue & Worker Dispatcher (v24.1)
// ─────────────────────────────────────────────────────────────

import { DocumentRecord } from './Parsers/BaseDocumentParser';
import { DocumentRegistry } from './DocumentRegistry';
import { DocumentIndex } from './DocumentIndex';
import { OCREngine } from './OCREngine';
import { 
  TXTParser, 
  JSONParser, 
  CSVParser, 
  PDFParser, 
  DOCXParser, 
  ImageParser 
} from './Parsers/DocumentParsers';

export class ProcessingQueue {
  private static parsers = [
    new TXTParser(),
    new JSONParser(),
    new CSVParser(),
    new PDFParser(),
    new DOCXParser(),
    new ImageParser()
  ];

  public static async enqueue(file: File, record: DocumentRecord): Promise<void> {
    // 1. Mark as Processing
    DocumentRegistry.updateStatus(record.documentId, 'Processing');

    const startTime = performance.now();

    try {
      // 2. Select matching parser plugin
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const parser = this.parsers.find(p => p.supportedTypes().includes(file.type) || p.supportedTypes().includes(ext)) || new TXTParser();

      // 3. Extract text / parse
      let rawText = '';
      if (file.type.startsWith('image/') || ext === 'pdf' || ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'tiff' || ext === 'bmp') {
        const ocr = await OCREngine.processFile(file);
        rawText = ocr.text;
      } else {
        rawText = await file.text().catch(() => `Extracted raw content from ${file.name}`);
      }
      const result = await parser.parse(file, rawText);

      const processingTimeMs = Math.round(performance.now() - startTime);

      // 4. Add to DocumentIndex
      DocumentIndex.addDocument(record.documentId, result.title, result.rawText);

      // 5. Update Registry to Completed
      DocumentRegistry.updateStatus(record.documentId, 'Completed', {
        rawText: result.rawText,
        metadata: result.metadata,
        parserUsed: parser.constructor.name,
        processingTimeMs,
        warnings: result.warnings,
        errors: result.errors
      });

    } catch (err: any) {
      console.error('[ProcessingQueue] Processing failed for document:', record.documentId, err);
      DocumentRegistry.updateStatus(record.documentId, 'Failed', {
        errors: [err?.message || 'Processing failed']
      });
    }
  }
}
