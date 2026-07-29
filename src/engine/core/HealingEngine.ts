import { OrganNode } from '../../types/physiology';

export class HealingEngine {
  public static process(organs: Record<string, OrganNode>): string[] {
    const logs: string[] = [];

    Object.values(organs).forEach(organ => {
      const temp = organ.temporary;
      const perm = organ.permanent;

      // Only process organs that have suffered integrity loss or inflammation
      if (temp.integrity < 100 || temp.inflammation > 0 || temp.infection > 0) {
        // Can this organ heal?
        // E.g., Brain neurons and heart muscle have extremely low regeneration capacity.
        const isCriticalNerveOrHeart = organ.id === 'brain' || organ.id === 'heart';
        
        if (isCriticalNerveOrHeart && temp.oxygenation < 60) {
          // Hypoxia in brain/heart leads to irreversible tissue death (cannot heal)
          temp.integrity = Math.max(10, temp.integrity - 2.0);
          temp.scarTissue = Math.min(90, temp.scarTissue + 1.5);
          temp.health = Math.max(5, temp.health - 2.5);
          temp.functionalCapacity = Math.max(5, temp.functionalCapacity - 2.0);
          logs.push(`Critical hypoxia in ${organ.name}. Severe tissue necrosis occurring; permanent functional loss.`);
          return;
        }

        // Standard healing decision tree
        if (temp.infection > 0) {
          // Infection active: Immune system battles it
          const defense = temp.immuneActivity / 100;
          temp.infection = Math.max(0, temp.infection - (defense * 5.0 - 1.0));
          temp.inflammation = Math.min(100, temp.inflammation + 2.0);
          temp.pain = Math.min(100, temp.pain + 1.0);
          temp.health = Math.max(10, temp.health - 1.0);
          logs.push(`${organ.name} is fighting active infection (Infection level: ${temp.infection.toFixed(0)}%).`);
        } else if (temp.inflammation > 10) {
          // Inflammation phase: prepping for repair
          temp.inflammation = Math.max(0, temp.inflammation - 1.5);
          temp.healing = Math.min(100, temp.healing + 2.0);
          temp.pain = Math.max(0, temp.pain - 0.5);
          logs.push(`${organ.name} inflammation is resolving; initiating active cellular repair phase.`);
        } else if (temp.healing > 0) {
          // Repair phase: rebuild integrity
          const recoveryFactor = (perm.baselineFunction / 100) * (temp.perfusion / 100);
          const repairRate = 1.5 * recoveryFactor;
          
          if (temp.integrity < 100) {
            temp.integrity = Math.min(100, temp.integrity + repairRate);
            // Rebuilding tissue leads to some scar tissue
            temp.scarTissue = Math.min(50, temp.scarTissue + repairRate * 0.2);
            temp.pain = Math.max(0, temp.pain - 1.0);
          }
          
          temp.healing = Math.max(0, temp.healing - 1.0);
          
          // Re-evaluate functional capacity based on integrity and scar tissue
          temp.functionalCapacity = Math.min(
            perm.baselineFunction,
            temp.integrity - (temp.scarTissue * 0.4)
          );
          
          temp.health = Math.min(100, (temp.integrity + temp.functionalCapacity) / 2);
          
          if (temp.integrity >= 100) {
            logs.push(`${organ.name} structural integrity fully restored. Functional capacity stabilized at ${temp.functionalCapacity.toFixed(0)}% (Scar tissue: ${temp.scarTissue.toFixed(0)}%).`);
          } else {
            logs.push(`${organ.name} is actively healing structural tissue (Integrity: ${temp.integrity.toFixed(0)}%).`);
          }
        } else {
          // Stable with some damage: initiate mild inflammation to kickstart repair
          temp.healing = 10;
        }
      }
    });

    return logs;
  }
}
