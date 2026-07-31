/**
 * Adaptive Clinical Time Formatter (v21.3)
 * Provides unified acute vs chronic duration, clock formatting (MM:SS / HH:MM:SS), and survival confidence outputs.
 */

export class ClinicalTimeFormatter {
  /**
   * Formats duration in seconds into acute (32s, 1m 12s, 14h 22m) or chronic (1d 4h) strings.
   */
  static formatDuration(seconds: number, isAcuteMode: boolean = true): string {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}m ${s.toString().padStart(2, '0')}s`;
    }
    if (seconds < 43200 || isAcuteMode) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m.toString().padStart(2, '0')}m`;
    }
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    return `${d}d ${h}h`;
  }

  /**
   * Formats acute clock: MM:SS if under 1 hour, HH:MM:SS after 1 hour.
   */
  static formatClock(seconds: number): string {
    if (seconds < 3600) {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /**
   * Formats acute clinical timestamp for event feeds (e.g. 00:18, 03:12, 08:39).
   */
  static formatClinicalTimestamp(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /**
   * Formats estimated survival with confidence rating to prevent false precision.
   */
  static formatSurvivalEstimate(seconds: number | null, confidencePct: number = 85): { text: string; confidenceText: string } {
    if (seconds === null || confidencePct < 40) {
      return { text: 'Unknown', confidenceText: 'Condition Unstable' };
    }
    return {
      text: this.formatDuration(seconds, true),
      confidenceText: `${Math.round(confidencePct)}% Confidence`
    };
  }
}
