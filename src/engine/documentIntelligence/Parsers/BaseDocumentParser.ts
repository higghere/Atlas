// ─────────────────────────────────────────────────────────────
// DocumentRecord Data Contract & BaseDocumentParser Plugin Interface
// ─────────────────────────────────────────────────────────────

export interface DocumentRecord {
  documentId: string;
  sha256: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  owner: string;
  status: 'Waiting' | 'Uploading' | 'Uploaded' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  parserUsed: string;
  parserVersion: string;
  processingTimeMs: number;
  attachedPatientId: string | null;
  tags: string[];
  knowledgeEntities: any[];
  warnings: string[];
  errors: string[];
  documentVersion: string;
  engineVersion: string;
  rawText?: string;
  metadata?: Record<string, any>;
}

export interface DocumentResult {
  title: string;
  rawText: string;
  metadata: Record<string, any>;
  pageCount: number;
  warnings: string[];
  errors: string[];
}

export abstract class BaseDocumentParser {
  abstract parse(file: File, content?: string): Promise<DocumentResult>;
  abstract extractMetadata(file: File): Promise<Record<string, any>>;
  abstract validate(file: File): boolean;
  abstract supportedTypes(): string[];
}
