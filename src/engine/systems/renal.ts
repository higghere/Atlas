import { Blood, OrganNode, SystemNode } from '../../types/physiology';

export class RenalSystem {
  public static update(
    system: SystemNode,
    organs: Record<string, OrganNode>,
    blood: Blood,
    lifestyle: any
  ): string[] {
    const logs: string[] = [];
    const kidney = organs['kidney'];
    if (!kidney) return logs;

    const temp = kidney.temporary;
    const perm = kidney.permanent;

    // 1. Calculate filtration rate (GFR equivalent)
    // GFR depends directly on kidney perfusion and kidney functional capacity
    const perfusionFactor = temp.perfusion / 100;
    const capacityFactor = temp.functionalCapacity / 100;
    const gfrRatio = perfusionFactor * capacityFactor; // 1.0 is healthy

    // 2. Filtration of substances
    const baseCreatinineClearance = 0.15; // mg/dL per tick
    const baseUreaClearance = 3.0; // mg/dL per tick
    const baseToxinClearance = 4.0; // arbitrary clearance per tick

    // Clear Creatinine, Urea, Toxins
    if (blood.substances.creatinine > 0.6) {
      blood.substances.creatinine = Math.max(
        0.5,
        blood.substances.creatinine - baseCreatinineClearance * gfrRatio
      );
    } else {
      // Metabolic production
      blood.substances.creatinine += 0.05;
    }

    if (blood.substances.urea > 7) {
      blood.substances.urea = Math.max(
        5,
        blood.substances.urea - baseUreaClearance * gfrRatio
      );
    } else {
      // Production
      blood.substances.urea += 1.0;
    }

    if (blood.substances.toxins > 0) {
      blood.substances.toxins = Math.max(
        0,
        blood.substances.toxins - baseToxinClearance * gfrRatio
      );
    }

    // 3. Regulate Potassium (Target: 3.5 - 5.0 mEq/L)
    if (blood.substances.potassium > 4.0) {
      const excessK = blood.substances.potassium - 4.0;
      blood.substances.potassium = Math.max(
        3.8,
        blood.substances.potassium - excessK * 0.1 * gfrRatio
      );
    }

    // 4. Excrete Excess Water (relative blood volume adjustment)
    // Excrete water to match intake/infusions. In CKD, water accumulates
    if (blood.volume > 5000) {
      const excessVol = blood.volume - 5000;
      const excreteVol = Math.min(excessVol * 0.2 * gfrRatio, 150);
      blood.volume -= excreteVol;
      blood.substances.water = Math.max(100, blood.substances.water - excreteVol * 0.01);
    }

    // 5. System status
    system.functionalStatus = Math.min(100, Math.round(temp.health));

    // Consume local resources
    const localO2Cost = 1.2 * (temp.stress / 50 + 1);
    if (blood.substances.oxygen > localO2Cost) {
      blood.substances.oxygen -= localO2Cost;
      temp.oxygenation = Math.min(100, temp.oxygenation + 1);
    } else {
      temp.oxygenation = Math.max(10, temp.oxygenation - 2);
      temp.health = Math.max(10, temp.health - 2);
      logs.push(`Renal hypoxia detected! Nephron damage occurring.`);
    }

    // Severe kidney stress/inflammation causes direct functional capacity drop
    if (temp.stress > 80 && Math.random() < 0.1) {
      temp.integrity = Math.max(10, temp.integrity - 0.5);
      temp.scarTissue = Math.min(90, temp.scarTissue + 0.3);
      logs.push(`High renal workload is inducing glomerulosclerosis (scar tissue).`);
    }

    return logs;
  }
}
