import { Blood, OrganNode, SystemNode } from '../../types/physiology';

export class NervousSystem {
  public static update(
    system: SystemNode,
    organs: Record<string, OrganNode>,
    blood: Blood,
    lifestyle: any
  ): string[] {
    const logs: string[] = [];
    const brain = organs['brain'];
    if (!brain) return logs;

    const temp = brain.temporary;
    const perm = brain.permanent;

    // 1. Brain is extremely sensitive to oxygenation
    // If blood oxygenation is low, brain oxygenation falls immediately
    const bloodOxygen = blood.substances.oxygen;
    const brainPerfusion = temp.perfusion / 100;

    // Set oxygenation state
    temp.oxygenation = Math.min(100, Math.round(bloodOxygen * brainPerfusion));

    if (temp.oxygenation < 70) {
      temp.health = Math.max(0, temp.health - (70 - temp.oxygenation) * 0.1);
      temp.pain = Math.min(100, temp.pain + 5);
      temp.stress = Math.min(100, temp.stress + 8);
      logs.push(`Cerebral ischemia! Brain tissue is oxygen-deprived (Oxygenation: ${temp.oxygenation}%).`);
    } else {
      temp.stress = Math.max(0, temp.stress - 2);
      temp.pain = Math.max(0, temp.pain - 1);
    }

    // 2. Autonomic Neural output
    // Brain sets neural tone for organs (0-100) based on systemic stress and adrenaline
    const neuralTone = Math.min(100, Math.round(temp.stress * 0.8 + blood.substances.adrenaline * 0.05));
    Object.values(organs).forEach(org => {
      if (org.id !== 'brain') {
        org.temporary.neuralInput = neuralTone;
      }
    });

    // 3. System status
    system.functionalStatus = Math.min(100, Math.round(temp.health));

    // Consume local resources
    // Brain consumes 20% of resting oxygen! Extremely high metabolic demand
    const localO2Cost = 3.0 * (temp.stress / 50 + 1);
    if (blood.substances.oxygen > localO2Cost) {
      blood.substances.oxygen -= localO2Cost;
    } else {
      temp.health = Math.max(5, temp.health - 3);
      logs.push(`Brain cell death occurring due to total exhaustion of circulating oxygen.`);
    }

    return logs;
  }
}
