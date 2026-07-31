// ─────────────────────────────────────────────────────────────
// Centralized Document Registry (v24.1)
// Manages uploaded DocumentRecord lifecycles independently of Patient EHR.
// ─────────────────────────────────────────────────────────────

import { DocumentRecord } from './Parsers/BaseDocumentParser';

export class DocumentRegistry {
  private static registry: Map<string, DocumentRecord> = new Map();

  public static register(record: DocumentRecord): DocumentRecord {
    this.registry.set(record.documentId, record);
    this.persist();
    return record;
  }

  public static updateStatus(documentId: string, status: DocumentRecord['status'], extra: Partial<DocumentRecord> = {}) {
    const doc = this.registry.get(documentId);
    if (doc) {
      const updated = { ...doc, status, ...extra };
      this.registry.set(documentId, updated);
      this.persist();
    }
  }

  public static get(documentId: string): DocumentRecord | undefined {
    return this.registry.get(documentId);
  }

  public static getAll(): DocumentRecord[] {
    if (this.registry.size === 0) {
      this.hydrate();
    }
    return Array.from(this.registry.values());
  }

  public static delete(documentId: string) {
    this.registry.delete(documentId);
    this.persist();
  }

  private static persist() {
    try {
      localStorage.setItem('human_atlas_document_registry', JSON.stringify(Array.from(this.registry.values())));
    } catch (e) {
      console.error('[DocumentRegistry] Failed to persist registry to localStorage:', e);
    }
  }

  private static hydrate() {
    try {
      const saved = localStorage.getItem('human_atlas_document_registry');
      if (saved) {
        const records: DocumentRecord[] = JSON.parse(saved);
        records.forEach(r => this.registry.set(r.documentId, r));
      }
    } catch (e) {
      console.error('[DocumentRegistry] Failed to hydrate registry from localStorage:', e);
    }
  }
}
