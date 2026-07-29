import { Blood, OrganNode } from '../../types/physiology';

export class ExplainerEngine {
  public static explainQuery(
    query: string,
    blood: Blood,
    organs: Record<string, OrganNode>
  ): { title: string; steps: string[]; warning: string | null } {
    const q = query.toLowerCase();
    const sub = blood.substances;
    
    // Check key organ states
    const kidney = organs['kidney'];
    const heart = organs['heart'];
    const liver = organs['liver'];
    const pancreas = organs['pancreas'];

    // 1. Creatinine
    if (q.includes('creatinine') || q.includes('kidney') || q.includes('bun')) {
      const gfr = kidney ? kidney.temporary.functionalCapacity : 100;
      if (gfr < 60) {
        return {
          title: "Elevated Blood Creatinine & BUN",
          steps: [
            "Creatinine and Urea are cellular waste products constantly released by skeletal muscles and metabolic activity.",
            `The kidneys currently have a reduced functional capacity of ${gfr.toFixed(0)}% (Glomerular Filtration Rate is impaired).`,
            "Due to this glomerular filtration deficit, the nephrons cannot clear these wastes from the blood pool.",
            `As a result, waste accumulates, raising serum creatinine to ${sub.creatinine.toFixed(2)} mg/dL and BUN to ${sub.urea.toFixed(0)} mg/dL.`
          ],
          warning: "High creatinine indicates progressive renal insufficiency. Watch for uremic complications, acid-base imbalances, and fluid retention."
        };
      } else {
        return {
          title: "Normal Renal Filtration",
          steps: [
            "Renal filtration is functioning at baseline.",
            `Current creatinine is ${sub.creatinine.toFixed(2)} mg/dL (Normal reference: 0.6 - 1.2 mg/dL).`,
            "Glomerular capillary pressure and tubular excretion are successfully balancing muscle waste production."
          ],
          warning: null
        };
      }
    }

    // 2. Heart Rate / Pulse
    if (q.includes('heart') || q.includes('pulse') || q.includes('bpm') || q.includes('cardiac')) {
      const adrenaline = sub.adrenaline;
      const heartHealth = heart ? heart.temporary.health : 100;
      
      if (adrenaline > 100) {
        return {
          title: "Sinus Tachycardia (Elevated Heart Rate)",
          steps: [
            "Systemic stressors (such as hypovolemia, infection, or trauma) have activated the sympathetic nervous system.",
            `The adrenal medulla has secreted adrenaline into the bloodstream, raising circulating levels to ${adrenaline.toFixed(0)} pg/mL.`,
            "Adrenaline binds to Beta-1 adrenergic receptors on the heart's sinoatrial (SA) node.",
            "This increases calcium influx during action potentials, speeding depolarization and increasing heart rate to compensate for systemic stress."
          ],
          warning: "Sustained tachycardia increases myocardial oxygen demand, putting cardiac tissue at risk of ischemia if coronary supply is restricted."
        };
      } else if (heartHealth < 60) {
        return {
          title: "Compensatory Tachycardia in Heart Failure",
          steps: [
            `Myocardial tissue is weakened (Heart health: ${heartHealth.toFixed(0)}%).`,
            "Stroke volume (amount of blood pumped per beat) has declined.",
            "To maintain a stable Cardiac Output (Flow = HR * SV), the autonomic nervous system increases heart rate.",
            "This is a compensation loop to protect perfusion to the brain and other vital organs."
          ],
          warning: "This compensation can eventually exhaust cardiac cells, leading to decompensation and cardiogenic shock."
        };
      }
    }

    // 3. Glucose / Insulin
    if (q.includes('glucose') || q.includes('sugar') || q.includes('insulin') || q.includes('diabetes')) {
      const glucose = sub.glucose;
      const pancreasHealth = pancreas ? pancreas.temporary.health : 100;
      
      if (glucose > 130) {
        return {
          title: "Hyperglycemia (High Blood Glucose)",
          steps: [
            `Blood glucose is elevated at ${glucose.toFixed(0)} mg/dL.`,
            "Under chronic high carbohydrate load or insulin resistance, cells do not absorb glucose from the blood.",
            `The pancreas (Health: ${pancreasHealth.toFixed(0)}%) is under high metabolic stress to produce insulin.`,
            "If glucose remains elevated, non-enzymatic glycation damages microvascular endothelial cells (arterioles)."
          ],
          warning: "Chronic hyperglycemia leads to retinopathy, peripheral nerve damage, and renal glomerular scarring."
        };
      }
    }

    // 4. Potassium
    if (q.includes('potassium') || q.includes('hyperkalemia') || q.includes('electrolyte')) {
      if (sub.potassium > 5.0) {
        return {
          title: "Hyperkalemia (Elevated Blood Potassium)",
          steps: [
            `Serum potassium is elevated at ${sub.potassium.toFixed(1)} mEq/L (Normal: 3.5 - 5.0).`,
            "Impairment in kidney filtration limits the excretion of potassium ions in urine.",
            "Potassium accumulates in extracellular fluid, altering the resting membrane potential of excitable cells, especially cardiomyocytes."
          ],
          warning: "CRITICAL: Severe hyperkalemia (>6.5 mEq/L) can cause cardiac conduction abnormalities, bradycardia, ventricular fibrillation, and cardiac arrest."
        };
      }
    }

    // Default Fallback
    return {
      title: "Physiological Balance (Homeostasis)",
      steps: [
        "The body's self-regulatory feedback loops (baroreceptors, chemo-receptors, and pancreatic islet cells) are actively maintaining homeostasis.",
        "Oxygen levels, blood pH, glucose levels, and body temperature are being stabilized within tight physiological bounds.",
        "Exogenous substances (drugs, toxins) are being cleared by the hepatic and renal filtration systems."
      ],
      warning: null
    };
  }
}
