import { Blood, OrganNode } from '../../types/physiology';

export class HomeostasisEngine {
  public static regulate(blood: Blood, organs: Record<string, OrganNode>): {
    hrAdjust: number;
    rrAdjust: number;
    adrenalineReleased: number;
    insulinReleased: number;
    log: string[];
  } {
    const log: string[] = [];
    let hrAdjust = 0;
    let rrAdjust = 0;
    let adrenalineReleased = 0;
    let insulinReleased = 0;

    const sub = blood.substances;

    // 1. Temperature Regulation (Target: 37°C)
    if (sub.heat > 37.5) {
      log.push(`Core temperature high (${sub.heat.toFixed(1)}°C). Triggering cutaneous vasodilation & sweating.`);
      sub.heat -= 0.1; // cooling
    } else if (sub.heat < 36.5) {
      log.push(`Core temperature low (${sub.heat.toFixed(1)}°C). Triggering shivering metabolic response.`);
      sub.heat += 0.1; // warming
      hrAdjust += 5;   // shivering increases heart rate slightly
    }

    // 2. Blood Sugar Regulation (Target: 70 - 100 mg/dL)
    const pancreas = organs['pancreas'];
    const liver = organs['liver'];
    const pancreasFunc = pancreas ? (pancreas.temporary.functionalCapacity / 100) : 0.5;
    const liverFunc = liver ? (liver.temporary.functionalCapacity / 100) : 0.5;

    if (sub.glucose > 100) {
      // Pancreas secretes insulin
      const excess = sub.glucose - 100;
      const secretion = Math.min(excess * 0.1 * pancreasFunc, 15);
      if (secretion > 0.1) {
        insulinReleased = secretion;
        sub.insulin += secretion;
        sub.glucose -= secretion * 4.0; // insulin drives glucose into cells
        log.push(`Hyperglycemia detected (${sub.glucose.toFixed(0)} mg/dL). Pancreas secretes ${secretion.toFixed(1)} uIU/mL insulin.`);
      }
    } else if (sub.glucose < 70) {
      // Liver releases glucose (glycogenolysis)
      const deficit = 70 - sub.glucose;
      const release = Math.min(deficit * 0.3 * liverFunc, 20);
      if (release > 0.1) {
        sub.glucose += release;
        log.push(`Hypoglycemia detected (${sub.glucose.toFixed(0)} mg/dL). Liver releases stored glycogen.`);
      }
    }

    // 3. pH Regulation (Target: 7.35 - 7.45)
    // High CO2 causes acidosis, low CO2 causes alkalosis
    if (sub.carbonDioxide > 45) {
      // Acidosis: increase respiration rate to blow off CO2
      const excessCO2 = sub.carbonDioxide - 45;
      rrAdjust += Math.min(excessCO2 * 1.5, 10);
      sub.carbonDioxide -= Math.min(excessCO2 * 0.3, 2.0);
      sub.ph = Math.max(7.35, sub.ph - 0.01);
      log.push(`Respiratory acidosis detected (CO2: ${sub.carbonDioxide.toFixed(0)} mmHg). Respiration rate increased.`);
    } else if (sub.carbonDioxide < 35) {
      // Alkalosis: decrease respiration rate to retain CO2
      const deficitCO2 = 35 - sub.carbonDioxide;
      rrAdjust -= Math.min(deficitCO2 * 1.0, 5);
      sub.carbonDioxide += Math.min(deficitCO2 * 0.2, 1.0);
      sub.ph = Math.min(7.45, sub.ph + 0.01);
    } else {
      // Stabilize ph to 7.4
      sub.ph += (7.4 - sub.ph) * 0.1;
    }

    // 4. Blood Volume & Pressure Regulation (Target Volume ~5000ml)
    const kidney = organs['kidney'];
    const kidneyFunc = kidney ? (kidney.temporary.functionalCapacity / 100) : 0.5;

    if (blood.volume < 4500) {
      // Hypotension / Hypovolemia: trigger baroreceptors -> Adrenaline
      const volumeLossFraction = (5000 - blood.volume) / 5000;
      adrenalineReleased = Math.min(volumeLossFraction * 1500, 800); // released pg/ml
      sub.adrenaline += adrenalineReleased;
      
      // Vasoconstriction: raise heart rate
      hrAdjust += Math.min(volumeLossFraction * 80, 50);
      
      // Kidneys retain water (RAAS)
      if (kidney) {
        kidney.temporary.stress = Math.min(95, kidney.temporary.stress + volumeLossFraction * 50);
        // urine output decreases
        log.push(`Hypovolemia detected (Vol: ${blood.volume.toFixed(0)} ml). Baroreceptors release adrenaline. Vasoconstriction triggered.`);
      }
    } else if (blood.volume > 5500) {
      // Overload: Increase renal excretion of water
      const excessVolume = blood.volume - 5000;
      const excretion = Math.min(excessVolume * 0.05 * kidneyFunc, 100);
      blood.volume -= excretion;
      log.push(`Fluid overload (Vol: ${blood.volume.toFixed(0)} ml). Kidneys increase urine output to compensate.`);
    }

    return { hrAdjust, rrAdjust, adrenalineReleased, insulinReleased, log };
  }
}
