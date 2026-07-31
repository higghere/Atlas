// ─────────────────────────────────────────────────────────────
// Full-Text Document Search & Indexing Engine (v24.1)
// ─────────────────────────────────────────────────────────────

export interface IndexedDocument {
  documentId: string;
  title: string;
  headings: string[];
  keywords: string[];
  entities: any[];
  contentLower: string;
}

export class DocumentIndex {
  private static index: Map<string, IndexedDocument> = new Map();

  public static addDocument(documentId: string, title: string, content: string, entities: any[] = []) {
    const headings = content
      .split('\n')
      .filter(line => line.trim().startsWith('#') || line.trim().endsWith(':'))
      .map(l => l.replace(/^[#:\s]+/, '').trim());

    const keywords = Array.from(new Set(content.toLowerCase().match(/\b[a-z]{4,}\b/g) || []));

    this.index.set(documentId, {
      documentId,
      title,
      headings,
      keywords,
      entities,
      contentLower: content.toLowerCase(),
    });
  }

  public static search(query: string): IndexedDocument[] {
    const q = query.toLowerCase().trim();
    if (!q) return Array.from(this.index.values());

    return Array.from(this.index.values()).filter(doc => 
      doc.title.toLowerCase().includes(q) ||
      doc.contentLower.includes(q) ||
      doc.keywords.some(k => k.includes(q))
    );
  }

  public static get(documentId: string): IndexedDocument | undefined {
    return this.index.get(documentId);
  }
}
