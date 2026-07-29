import { Blood, OrganNode, SystemNode } from '../../types/physiology';

export class RespiratorySystem {
  public static update(
    system: SystemNode,
    organs: Record<string, OrganNode>,
    blood: Blood,
    lifestyle: any,
    rrAdjust: number
  ): string[] {
    const logs: string[] = [];
    const lungs = organs['lungs'];
    if (!lungs) return logs;

    const temp = lungs.temporary;
    const perm = lungs.permanent;

    // 1. Calculate Respiration Rate (Base: 12 breaths/min)
    let baseRR = 12;
    if (lifestyle.smoking === 'heavy') baseRR += 2;
    if (lifestyle.exercise === 'active') baseRR -= 1; // stronger lungs

    let rr = baseRR + rrAdjust;
    
    // Oxygen shortage triggers hyperventilation
    if (blood.substances.oxygen < 80) {
      const oxygenDeficit = 80 - blood.substances.oxygen;
      rr = Math.min(rr + oxygenDeficit * 0.4, 35);
    }
    
    // Set temporary values
    temp.stress = Math.min(100, Math.round(rr * 2.5));
    temp.neuralInput = Math.min(100, Math.round(rr * 2));

    // 2. Perform Gas Exchange
    // Lung efficiency is proportional to functional capacity
    const lungEfficiency = temp.functionalCapacity / 100;
    
    // Smoking damages lungs over time
    if (lifestyle.smoking === 'heavy' && Math.random() < 0.05) {
      temp.integrity = Math.max(50, temp.integrity - 0.1);
      temp.scarTissue = Math.min(40, temp.scarTissue + 0.05);
    }

    // Oxygen absorption rate (normal: replenishes oxygen to target level)
    const baseOxygenAbsorption = 15 * lungEfficiency * (rr / 12);
    blood.substances.oxygen = Math.min(100, blood.substances.oxygen + baseOxygenAbsorption);

    // CO2 expiration rate
    const co2Expiration = 12 * lungEfficiency * (rr / 12);
    blood.substances.carbonDioxide = Math.max(25, blood.substances.carbonDioxide - co2Expiration);

    // 3. System status
    system.functionalStatus = Math.min(100, Math.round(temp.health));

    // Consume local resources
    const localO2Cost = 1.0 * (rr / 12);
    if (blood.substances.oxygen > localO2Cost) {
      blood.substances.oxygen -= localO2Cost;
      temp.oxygenation = Math.min(100, temp.oxygenation + 1);
    } else {
      temp.oxygenation = Math.max(10, temp.oxygenation - 2);
      temp.health = Math.max(10, temp.health - 1);
      logs.push(`Lungs are hypoxic. Breathing mechanics failing.`);
    }

    return logs;
  }
}
