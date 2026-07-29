import { Blood, OrganNode, SystemNode } from '../../types/physiology';

export class HepaticSystem {
  public static update(
    system: SystemNode,
    organs: Record<string, OrganNode>,
    blood: Blood,
    lifestyle: any
  ): string[] {
    const logs: string[] = [];
    const liver = organs['liver'];
    if (!liver) return logs;

    const temp = liver.temporary;
    const perm = liver.permanent;

    // 1. Calculate clearance efficiency
    const liverFunction = temp.functionalCapacity / 100;
    const perfusionFactor = temp.perfusion / 100;
    const clearanceRatio = liverFunction * perfusionFactor; // 1.0 is healthy

    // 2. Clear circulating toxins
    if (blood.substances.toxins > 0) {
      const cleared = Math.min(blood.substances.toxins * 0.15 * clearanceRatio, 10);
      blood.substances.toxins -= cleared;
      // Toxins converted to urea
      blood.substances.urea += cleared * 0.5;
    }

    // 3. Metabolize drugs (ADME)
    if (blood.substances.metformin > 0) {
      // Metformin is excreted unchanged by kidneys, so liver clearance is minimal
      const decay = blood.substances.metformin * 0.02 * clearanceRatio;
      blood.substances.metformin = Math.max(0, blood.substances.metformin - decay);
    }

    if (blood.substances.ibuprofen > 0) {
      // Ibuprofen is heavily metabolized in liver
      const decay = blood.substances.ibuprofen * 0.25 * clearanceRatio; // half-life 2h
      blood.substances.ibuprofen = Math.max(0, blood.substances.ibuprofen - decay);
    }

    // Alcohol damage
    if (lifestyle.alcohol === 'heavy') {
      if (Math.random() < 0.05) {
        temp.integrity = Math.max(20, temp.integrity - 0.2);
        temp.scarTissue = Math.min(80, temp.scarTissue + 0.1);
        temp.inflammation = Math.min(100, temp.inflammation + 2);
        logs.push(`Chronic alcohol intake causing hepatic steatosis and inflammation.`);
      }
    }

    // 4. System status
    system.functionalStatus = Math.min(100, Math.round(temp.health));

    // Consume local resources
    const localO2Cost = 1.0 * (lifestyle.alcohol === 'heavy' ? 1.5 : 1.0);
    if (blood.substances.oxygen > localO2Cost) {
      blood.substances.oxygen -= localO2Cost;
      temp.oxygenation = Math.min(100, temp.oxygenation + 1);
    } else {
      temp.oxygenation = Math.max(10, temp.oxygenation - 2);
      temp.health = Math.max(10, temp.health - 1);
      logs.push(`Hepatic hypoxia. Metabolic detoxification is compromised.`);
    }

    return logs;
  }
}
