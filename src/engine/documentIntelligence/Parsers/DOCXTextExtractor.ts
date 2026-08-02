// ─────────────────────────────────────────────────────────────
// Robust DOCX XML Stripper & Paragraph Extractor
// Strips word/document.xml tags, w:p, w:t, and returns clean paragraphs
// ─────────────────────────────────────────────────────────────

export class DOCXTextExtractor {
  public static extractCleanTextFromXML(xmlContent: string): string {
    if (!xmlContent) return '';

    // If it's already plain text (doesn't contain XML structure), return clean
    if (!xmlContent.includes('<') || !xmlContent.includes('>')) {
      return xmlContent.trim();
    }

    try {
      // 1. DOMParser attempt if in browser
      if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlContent, 'text/xml');
        const paragraphs = doc.getElementsByTagName('w:p');

        if (paragraphs.length > 0) {
          const lines: string[] = [];
          for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i];
            const textNodes = p.getElementsByTagName('w:t');
            let pText = '';
            for (let j = 0; j < textNodes.length; j++) {
              pText += textNodes[j].textContent || '';
            }
            if (pText.trim()) {
              lines.push(pText.trim());
            }
          }
          if (lines.length > 0) {
            return lines.join('\n');
          }
        }
      }
    } catch (e) {
      console.warn('[DOCXTextExtractor] DOMParser failed, using regex fallback:', e);
    }

    // 2. Regex Fallback: extract contents of <w:t> or <w:p>
    const paragraphs: string[] = [];
    const pRegex = /<w:p[^>]*>(.*?)<\/w:p>/gs;
    let match;

    while ((match = pRegex.exec(xmlContent)) !== null) {
      const pInner = match[1];
      const tRegex = /<w:t[^>]*>(.*?)<\/w:t>/gs;
      let tMatch;
      let paragraphText = '';
      while ((tMatch = tRegex.exec(pInner)) !== null) {
        paragraphText += tMatch[1];
      }
      if (paragraphText.trim()) {
        paragraphs.push(paragraphText.trim());
      }
    }

    if (paragraphs.length > 0) {
      return paragraphs.join('\n');
    }

    // 3. Last fallback: strip all XML tags
    return xmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
