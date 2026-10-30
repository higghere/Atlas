// ─────────────────────────────────────────────────────────────
// Dynamic Mock Clinical NLP Scenario Parser Engine
// Parses natural language prompts or uploaded medical documents
// into structured, actionable simulation scenarios.
// ─────────────────────────────────────────────────────────────

export interface ParsedScenarioDraft {
  title: string;
  icon: string;
  severity: 'Critical' | 'Severe' | 'Moderate' | 'Stable';
  confidence: number;
  events: string[];
  vitals: {
    hr: number;
    bp: string;
    rr: number;
    spo2: number;
    bloodVolume: number;
  };
  demographics: {
    age: number;
    sex: 'male' | 'female';
    weightKg: number;
  };
  diseases: string[];
  hasBleeding: boolean;
  bleedRateMlMin?: number;
  organImpacts?: string[];
  recommendations?: string[];
}

export class ScenarioParserEngine {
  /**
   * Parse clinical case description or document text into a structured simulation scenario
   */
  public static parse(rawText: string): ParsedScenarioDraft {
    const text = (rawText || '').trim();
    const lower = text.toLowerCase();

    // 1. Demographics Extraction
    const ageMatch = text.match(/(\d{1,3})[\s-]*(?:yo|y\/o|year[\s-]*old|years?\s*old)/i) || text.match(/age[:\s]*(\d{1,3})/i);
    const age = ageMatch ? Math.min(100, Math.max(1, parseInt(ageMatch[1]))) : 42;

    const isFemale = /\b(female|woman|girl|lady)\b/i.test(text) || /\bsex[:\s]*f/i.test(text);
    const sex: 'male' | 'female' = isFemale ? 'female' : 'male';

    const weightMatch = text.match(/(\d{2,3})\s*(?:kg|kilos?)/i) || text.match(/weight[:\s]*(\d{2,3})/i);
    const weightKg = weightMatch ? parseInt(weightMatch[1]) : (sex === 'male' ? 82 : 65);

    // 2. Underlying Chronic Diseases Detection
    const diseases: string[] = [];
    if (lower.includes('diabet') || lower.includes('glucose') || lower.includes('hba1c') || lower.includes('dka') || lower.includes('sugar')) {
      diseases.push('diabetes');
    }
    if (lower.includes('heart failure') || lower.includes('chf') || lower.includes('hfref') || lower.includes('cardiomyopathy') || lower.includes('mi ') || lower.includes('infarct') || lower.includes('coronary')) {
      diseases.push('heart_failure');
    }
    if (lower.includes('sepsis') || lower.includes('septic') || lower.includes('infection') || lower.includes('bacteremia') || lower.includes('cytokine storm')) {
      diseases.push('sepsis');
    }
    if (lower.includes('kidney') || lower.includes('renal') || lower.includes('ckd') || lower.includes('creatinine') || lower.includes('nephropathy')) {
      diseases.push('ckd');
    }

    // 3. Trauma & Acute Clinical Events Detection
    const events: string[] = [];
    let hasBleeding = false;
    let bleedRateMlMin = 0;
    let icon = '🚑';
    let title = 'Acute Clinical Case';

    // Penetrating or Laceration Trauma
    if (lower.includes('stab') || lower.includes('knife') || lower.includes('blade') || lower.includes('puncture')) {
      events.push('TraumaEvent: Penetrating Abdominal Wound (Blade / Knife)');
      title = 'Penetrating Abdominal Trauma';
      icon = '🗡️';
    } else if (lower.includes('gunshot') || lower.includes('bullet') || lower.includes('gsw') || lower.includes('shrapnel')) {
      events.push('TraumaEvent: Ballistic / Shrapnel Penetration');
      title = 'Ballistic Penetrating Trauma';
      icon = '💥';
    }

    // Hemorrhage
    if (lower.includes('bleed') || lower.includes('hemorrhag') || lower.includes('blood loss') || lower.includes('lacerat') || lower.includes('arterial')) {
      hasBleeding = true;
      bleedRateMlMin = 180;
      const bleedLoc = lower.includes('thigh') || lower.includes('femur')
        ? 'Left Femoral Artery'
        : lower.includes('abdomen')
        ? 'Renal / Mesenteric Vessel'
        : 'Systemic Arterial Laceration';
      events.push(`HemorrhageEvent: Active Bleeding (${bleedLoc}, Est. 180 mL/min)`);
      events.push('Hemodynamics: Class III Hemorrhagic Shock Cascade');
      if (title === 'Acute Clinical Case') title = 'Acute Hemorrhagic Shock';
      icon = '🩸';
    }

    // Blunt Impact / Collision
    if (lower.includes('motorcycle') || lower.includes('vehicle') || lower.includes('collision') || lower.includes('car crash') || lower.includes('fall')) {
      events.push('TraumaEvent: High-Velocity Blunt Impact');
      if (title === 'Acute Clinical Case') title = 'Motor Vehicle Collision Trauma';
      icon = '🏍️';
    }

    // Thoracic / Pulmonary
    if (lower.includes('chest') || lower.includes('pneumothorax') || lower.includes('rib') || lower.includes('lung') || lower.includes('thoracic') || lower.includes('breath') || lower.includes('dyspnea')) {
      events.push('Pathology: Rib Contusion & Bilateral Flail Segments');
      events.push('Complication: Tension Pneumothorax (Impaired Venous Return)');
      events.push('Respiratory: Severe V/Q Mismatch & Alveolar Hypoventilation');
      if (title === 'Acute Clinical Case') title = 'Thoracic Trauma & Pneumothorax';
      icon = '🫁';
    }

    // Neurological / Head Trauma
    if (lower.includes('head') || lower.includes('skull') || lower.includes('concussion') || lower.includes('tbi') || lower.includes('intracranial') || lower.includes('unconscious')) {
      events.push('NeurologyEvent: Closed Cranial Impact & Elevated ICP');
      if (title === 'Acute Clinical Case') title = 'Traumatic Brain Injury';
      icon = '🧠';
    }

    // Sepsis / Infection
    if (lower.includes('sepsis') || lower.includes('septic shock') || lower.includes('fever') || lower.includes('temp 39') || lower.includes('temp 40')) {
      events.push('Pathology: Systemic Inflammatory Response Syndrome (SIRS)');
      events.push('Hemodynamics: Severe Vasodilation & Endothelial Capillary Leak');
      title = 'Septic Shock & Cytokine Surge';
      icon = '🦠';
    }

    // Cardiac Arrest / Infarction
    if (lower.includes('cardiac arrest') || lower.includes('myocardial') || lower.includes('heart attack') || lower.includes('asystole') || lower.includes('ventricular')) {
      events.push('CardiologyEvent: Acute Anterior Wall ST-Elevation Infarction');
      events.push('Hemodynamics: Cardiogenic Collapse & Hypoperfusion');
      title = 'Acute Myocardial Infarction';
      icon = '🫀';
    }

    // Default Fallback Events if prompt is very brief
    if (events.length === 0) {
      if (diseases.length > 0) {
        events.push(`ChronicPathology: Active Decompensation (${diseases.join(', ').toUpperCase()})`);
        events.push('Metabolic: End-Organ Perfusion Stress');
        title = `Decompensated ${diseases[0].toUpperCase()} Crisis`;
      } else {
        events.push('ClinicalAssessment: General Emergency Department Intake');
        events.push('Hemodynamics: Baseline Homeostatic Stress Protocol');
        title = 'Acute Medical Intake';
      }
    }

    // Add chronic conditions as events if present
    diseases.forEach(d => {
      const dName = d === 'diabetes' ? 'Type 2 Diabetes Mellitus' : d === 'heart_failure' ? 'Congestive Heart Failure' : d === 'sepsis' ? 'Systemic Sepsis' : 'Chronic Kidney Disease';
      if (!events.some(e => e.includes(dName))) {
        events.push(`Comorbidity: ${dName}`);
      }
    });

    // 4. Extract Explicit Vitals from Text (if provided by user / EHR note)
    const hrMatch = text.match(/(?:hr|heart\s*rate|pulse)[:\s]*(\d{2,3})/i);
    const bpMatch = text.match(/(?:bp|blood\s*pressure)[:\s]*(\d{2,3}\s*\/\s*\d{2,3})/i);
    const rrMatch = text.match(/(?:rr|resp(?:iratory)?\s*rate)[:\s]*(\d{1,2})/i);
    const spo2Match = text.match(/(?:spo2|o2\s*sat|saturation)[:\s]*(\d{2,3})%?/i);

    const isHypotensive = bpMatch ? parseInt(bpMatch[1].split('/')[0]) < 90 : false;
    const isSevereHypoxia = spo2Match ? parseInt(spo2Match[1]) < 90 : false;

    // 5. Determine Severity & Vitals
    let severity: 'Critical' | 'Severe' | 'Moderate' | 'Stable' = 'Moderate';
    let baseHr = 75;
    let baseBp = '120/80';
    let baseRr = 16;
    let baseSpo2 = 98;
    let bloodVol = 5000;

    if (hasBleeding || lower.includes('pneumothorax') || lower.includes('septic shock') || lower.includes('severe sepsis') || lower.includes('cardiac arrest') || lower.includes('unconscious') || isHypotensive || isSevereHypoxia) {
      severity = 'Critical';
      baseHr = 124;
      baseBp = hasBleeding ? '92/58' : '88/54';
      baseRr = 28;
      baseSpo2 = 88;
      bloodVol = hasBleeding ? 4100 : 4700;
    } else if (diseases.includes('sepsis') || diseases.includes('heart_failure') || lower.includes('chest pain') || lower.includes('fracture')) {
      severity = 'Severe';
      baseHr = 104;
      baseBp = '145/95';
      baseRr = 22;
      baseSpo2 = 93;
      bloodVol = 4900;
    } else if (diseases.includes('diabetes') || diseases.includes('ckd')) {
      severity = 'Moderate';
      baseHr = 82;
      baseBp = '135/86';
      baseRr = 18;
      baseSpo2 = 97;
    }

    const finalVitals = {
      hr: hrMatch ? parseInt(hrMatch[1]) : baseHr,
      bp: bpMatch ? bpMatch[1].replace(/\s+/g, '') : baseBp,
      rr: rrMatch ? parseInt(rrMatch[1]) : baseRr,
      spo2: spo2Match ? Math.min(100, parseInt(spo2Match[1])) : baseSpo2,
      bloodVolume: bloodVol
    };

    // Calculate confidence based on tokens matched
    const tokenScore = (ageMatch ? 1 : 0) + (weightMatch ? 1 : 0) + (events.length > 2 ? 2 : 1) + (diseases.length > 0 ? 1 : 0);
    const confidence = Math.min(0.98, Math.max(0.85, 0.85 + tokenScore * 0.03));

    return {
      title,
      icon,
      severity,
      confidence,
      events,
      vitals: finalVitals,
      demographics: {
        age,
        sex,
        weightKg
      },
      diseases,
      hasBleeding,
      bleedRateMlMin: hasBleeding ? bleedRateMlMin : undefined,
      organImpacts: hasBleeding ? ['Heart', 'Lungs', 'Kidneys', 'Liver'] : diseases.length > 0 ? ['Pancreas', 'Kidneys'] : ['Systemic Tissues'],
      recommendations: hasBleeding
        ? ['Apply direct arterial pressure', 'Rapid IV crystalloid resuscitation', 'Crossmatch 4 units PRBCs', 'Surgical exploratory laparotomy']
        : ['Continuous telemetry monitoring', 'Order complete blood count & metabolic panel', 'Establish peripheral IV access']
    };
  }
}
