import { Blood, OrganNode, SystemNode } from '../../types/physiology';

export class ImmuneSystem {
  public static update(
    system: SystemNode,
    organs: Record<string, OrganNode>,
    blood: Blood,
    lifestyle: any
  ): string[] {
    const logs: string[] = [];

    // 1. Maintain White Blood Cell baseline (4.5 - 11.0 x10^3/mcL)
    // Sepsis or active infection triggers high WBC production
    let targetWBC = 6.0;
    
    // Check if any organ has infection
    let totalInfection = 0;
    Object.values(organs).forEach(org => {
      totalInfection += org.temporary.infection;
    });

    if (totalInfection > 0) {
      targetWBC += Math.min(totalInfection * 0.3, 25);
      blood.substances.whiteCells += (targetWBC - blood.substances.whiteCells) * 0.2;
      logInfection(logs, blood.substances.whiteCells, totalInfection);
    } else {
      // Return to baseline
      blood.substances.whiteCells += (targetWBC - blood.substances.whiteCells) * 0.1;
    }

    // 2. System Status
    system.functionalStatus = Math.min(100, Math.round(100 - (blood.substances.toxins * 0.8)));

    return logs;
  }
}

function logInfection(logs: string[], wbc: number, totalInfection: number) {
  if (wbc > 12.0 && Math.random() < 0.1) {
    logs.push(`Leukocytosis detected (WBC: ${wbc.toFixed(1)} x10^3/mcL) in response to active infection.`);
  }
}
