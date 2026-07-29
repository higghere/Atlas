import { Blood, OrganNode, SystemNode } from '../../types/physiology';

export class CardiovascularSystem {
  public static update(
    system: SystemNode,
    organs: Record<string, OrganNode>,
    blood: Blood,
    lifestyle: any
  ): string[] {
    const logs: string[] = [];
    const heart = organs['heart'];
    if (!heart) return logs;

    const temp = heart.temporary;
    const perm = heart.permanent;

    // 1. Calculate Heart Rate (Base: 70 bpm)
    let baseHR = 70;
    
    // Lifestyle factors
    if (lifestyle.exercise === 'active') baseHR = 60; // athletic bradycardia
    else if (lifestyle.exercise === 'sedentary') baseHR = 75;

    if (lifestyle.smoking === 'heavy') baseHR += 5;

    // Autonomic/Endocrine influence: adrenaline, pain, stress
    const adrenalineEffect = Math.min(blood.substances.adrenaline * 0.05, 70);
    const stressEffect = temp.stress * 0.3;
    const painEffect = temp.pain * 0.2;

    let hr = baseHR + adrenalineEffect + stressEffect + painEffect;
    
    // Heart failure diminishes rate limits
    const heartCapacity = temp.functionalCapacity / 100;
    if (heartCapacity < 0.4) {
      // heart is failing, tachycardic compensation attempt
      hr = Math.min(hr + 20, 150) * (0.5 + heartCapacity * 0.5);
    }

    // Set temporary state variables
    temp.neuralInput = Math.min(100, (adrenalineEffect + stressEffect) / 2);
    temp.temperature = blood.substances.heat;

    // 2. Stroke Volume (Base: 70ml per beat)
    const baseSV = 70;
    // Stroke volume drops as integrity and functional capacity decline
    const sv = baseSV * (temp.integrity / 100) * (temp.functionalCapacity / 100);

    // 3. Cardiac Output (ml/min) = HR * SV
    const co = hr * sv; // normal ~4900 ml/min
    temp.bloodSupply = co;
    temp.venousDrainage = co;

    // 4. Calculate Blood Pressure (Mean Arterial Pressure, MAP)
    // MAP = CO * Total Peripheral Resistance (TPR)
    // Adrenaline and stress raise TPR
    const baseTPR = 0.024; // mmHg per ml/min
    const adrenalineVasoconstriction = 1 + (blood.substances.adrenaline / 1000);
    const activeDiseaseVasodilation = 1.0; // modified by sepsis later
    const tpr = baseTPR * adrenalineVasoconstriction / activeDiseaseVasodilation;
    
    const map = co * tpr; // normal MAP ~117 mmHg (corresponds to ~120/80)
    
    // 5. System status
    system.functionalStatus = Math.min(100, Math.round(heart.temporary.health));

    // Consume energy/oxygen
    const oxygenCost = 1.5 * (hr / 70) * (temp.stress / 50 + 1);
    if (blood.substances.oxygen > oxygenCost) {
      blood.substances.oxygen -= oxygenCost;
      temp.oxygenation = Math.min(100, temp.oxygenation + 2);
    } else {
      temp.oxygenation = Math.max(10, temp.oxygenation - 3);
      temp.health = Math.max(5, temp.health - 2);
      logs.push(`Myocardial oxygen supply is insufficient! Heart ischemia occurring.`);
    }

    // Produce CO2 and heat
    blood.substances.carbonDioxide += oxygenCost * 0.8;
    blood.substances.heat += 0.001 * oxygenCost;

    // Propagate perfusion: all organs temporary perfusion is tied to cardiac output
    const systemicPerfusionRatio = co / 4900;
    Object.values(organs).forEach(org => {
      if (org.id !== 'heart') {
        org.temporary.perfusion = Math.min(100, Math.round(100 * systemicPerfusionRatio * (org.temporary.bloodSupply > 0 ? 1 : 0.8)));
      }
    });

    return logs;
  }
}
