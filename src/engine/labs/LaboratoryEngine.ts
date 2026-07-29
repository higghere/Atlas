import { Blood, OrganNode, LabReport, LabValue } from '../../types/physiology';

export class LaboratoryEngine {
  public static generateReport(
    blood: Blood,
    organs: Record<string, OrganNode>,
    tickNumber: number
  ): LabReport {
    const sub = blood.substances;
    
    // Alt/Ast enzymes leak into blood when liver cells are inflamed or damaged
    const liver = organs['liver'];
    const liverInflammation = liver ? liver.temporary.inflammation : 0;
    const liverIntegrity = liver ? liver.temporary.integrity : 100;
    const altValue = 25 + (liverInflammation * 1.5) + (100 - liverIntegrity) * 2.0;
    const astValue = 20 + (liverInflammation * 1.0) + (100 - liverIntegrity) * 1.5;

    // Creatinine is a byproduct of muscle and cleared by kidney
    const creatinineVal = sub.creatinine;

    // HbA1c is a 3-month average glucose. We can approximate it from active glucose:
    // HbA1c (%) = (Glucose + 46.7) / 28.7
    const hba1cVal = (sub.glucose + 46.7) / 28.7;

    const buildVal = (value: number, min: number, max: number, unit: string): LabValue => {
      let status: 'normal' | 'high' | 'low' = 'normal';
      if (value > max) status = 'high';
      else if (value < min) status = 'low';
      return {
        value: parseFloat(value.toFixed(2)),
        unit,
        range: `${min} - ${max}`,
        status
      };
    };

    return {
      id: `LAB-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleTimeString(),
      tickNumber,
      cbc: {
        wbc: buildVal(sub.whiteCells, 4.5, 11.0, "x10^3/mcL"),
        rbc: buildVal(4.7, 4.2, 5.4, "x10^6/mcL"),
        hemoglobin: buildVal(14.0, 12.0, 16.0, "g/dL"),
        hematocrit: buildVal(42.0, 37.0, 48.0, "%"),
        platelets: buildVal(sub.platelets, 150, 450, "x10^3/mcL")
      },
      metabolic: {
        sodium: buildVal(sub.sodium, 135, 145, "mEq/L"),
        potassium: buildVal(sub.potassium, 3.5, 5.0, "mEq/L"),
        calcium: buildVal(sub.calcium, 8.5, 10.5, "mg/dL"),
        glucose: buildVal(sub.glucose, 70, 100, "mg/dL"),
        bun: buildVal(sub.urea, 7, 20, "mg/dL"),
        creatinine: buildVal(creatinineVal, 0.6, 1.2, "mg/dL"),
        hba1c: buildVal(hba1cVal, 4.0, 5.6, "%")
      },
      enzymes: {
        alt: buildVal(altValue, 7, 56, "U/L"),
        ast: buildVal(astValue, 10, 40, "U/L")
      }
    };
  }
}
