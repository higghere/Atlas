// ─────────────────────────────────────────────────────────────
// Lab Unit Normalization Engine & Reference Threshold Evaluator
// ─────────────────────────────────────────────────────────────

import { LabResultStatus } from '../../types/medicalDocument';

export interface NormalizedLabResult {
  standardKey: string;
  normalizedValue: number;
  normalizedUnit: string;
  refLow: number;
  refHigh: number;
  status: LabResultStatus;
}

export class UnitNormalizer {
  private static LAB_THRESHOLDS: Record<
    string,
    { unit: string; low: number; high: number; criticalLow?: number; criticalHigh?: number }
  > = {
    hemoglobin: { unit: 'g/dL', low: 13.5, high: 17.5, criticalLow: 8.0, criticalHigh: 20.0 },
    creatinine: { unit: 'mg/dL', low: 0.7, high: 1.3, criticalHigh: 4.0 },
    bun: { unit: 'mg/dL', low: 7, high: 20, criticalHigh: 60 },
    egfr: { unit: 'mL/min', low: 60, high: 120, criticalLow: 15 },
    hba1c: { unit: '%', low: 4.0, high: 5.7, criticalHigh: 10.0 },
    glucose: { unit: 'mg/dL', low: 70, high: 99, criticalLow: 50, criticalHigh: 250 },
    potassium: { unit: 'mEq/L', low: 3.5, high: 5.0, criticalLow: 2.8, criticalHigh: 6.2 },
    sodium: { unit: 'mEq/L', low: 135, high: 145, criticalLow: 120, criticalHigh: 160 },
    alt: { unit: 'U/L', low: 7, high: 56, criticalHigh: 300 },
    ast: { unit: 'U/L', low: 10, high: 40, criticalHigh: 300 },
    albumin: { unit: 'g/dL', low: 3.5, high: 5.0, criticalLow: 2.0 },
    total_cholesterol: { unit: 'mg/dL', low: 100, high: 199, criticalHigh: 300 },
    ldl: { unit: 'mg/dL', low: 50, high: 99, criticalHigh: 190 },
    hdl: { unit: 'mg/dL', low: 40, high: 80, criticalLow: 25 },
    triglycerides: { unit: 'mg/dL', low: 50, high: 149, criticalHigh: 500 },
    urine_microalbumin: { unit: 'mg/L', low: 0, high: 29, criticalHigh: 300 },
  };

  public static normalize(key: string, rawVal: number, rawUnit: string): NormalizedLabResult {
    const stdKey = key.toLowerCase();
    const config = this.LAB_THRESHOLDS[stdKey] || {
      unit: rawUnit || 'unit',
      low: 0,
      high: 100,
    };

    let normVal = rawVal;
    let normUnit = config.unit;

    // Unit Conversions
    if (stdKey === 'creatinine' && rawUnit.includes('umol')) {
      normVal = parseFloat((rawVal / 88.4).toFixed(2));
      normUnit = 'mg/dL';
    } else if (stdKey === 'glucose' && rawUnit.includes('mmol')) {
      normVal = Math.round(rawVal * 18.0182);
      normUnit = 'mg/dL';
    }

    // Status Evaluation
    let status: LabResultStatus = 'normal';
    if (config.criticalLow !== undefined && normVal <= config.criticalLow) {
      status = 'critical_low';
    } else if (config.criticalHigh !== undefined && normVal >= config.criticalHigh) {
      status = 'critical_high';
    } else if (normVal < config.low) {
      status = 'low';
    } else if (normVal > config.high) {
      status = 'high';
    }

    return {
      standardKey: stdKey,
      normalizedValue: normVal,
      normalizedUnit: normUnit,
      refLow: config.low,
      refHigh: config.high,
      status,
    };
  }
}
