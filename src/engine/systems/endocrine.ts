import { Blood, OrganNode, SystemNode } from '../../types/physiology';

export class EndocrineSystem {
  public static update(
    system: SystemNode,
    organs: Record<string, OrganNode>,
    blood: Blood,
    lifestyle: any
  ): string[] {
    const logs: string[] = [];
    const pancreas = organs['pancreas'];
    if (!pancreas) return logs;

    const temp = pancreas.temporary;
    const perm = pancreas.permanent;

    // 1. Calculate endocrine capability
    const pancreasFunction = temp.functionalCapacity / 100;
    const perfusionFactor = temp.perfusion / 100;
    const secretionRatio = pancreasFunction * perfusionFactor; // 1.0 is healthy

    // 2. High blood glucose triggers insulin production
    // Insulin decays over time (half-life of insulin is ~5 minutes, in our hourly tick we decay it rapidly)
    blood.substances.insulin = Math.max(2.0, blood.substances.insulin - blood.substances.insulin * 0.8);

    // Pancreatic burnout rules in chronic hyperglycemia
    if (blood.substances.glucose > 180) {
      temp.stress = Math.min(100, temp.stress + 5);
      if (temp.stress > 80 && Math.random() < 0.08) {
        temp.functionalCapacity = Math.max(10, temp.functionalCapacity - 1.0);
        logs.push(`Chronic hyperglycemia causing pancreatic beta-cell exhaustion and stress.`);
      }
    } else {
      temp.stress = Math.max(0, temp.stress - 2);
    }

    // 3. System status
    system.functionalStatus = Math.min(100, Math.round(temp.health));

    // Consume local resources
    const localO2Cost = 0.5 * (temp.stress / 50 + 1);
    if (blood.substances.oxygen > localO2Cost) {
      blood.substances.oxygen -= localO2Cost;
      temp.oxygenation = Math.min(100, temp.oxygenation + 1);
    } else {
      temp.oxygenation = Math.max(10, temp.oxygenation - 1);
      temp.health = Math.max(15, temp.health - 0.5);
    }

    return logs;
  }
}
