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

    // Helper: Check if a phrase is explicitly denied (e.g. "denies chest pain")
    const isDenied = (phrase: string): boolean => {
      const regex = new RegExp(`(?:denies|no|without|negative\\s+for|non-)[^\\.\\n;]*?\\b${phrase}\\b`, 'i');
      return regex.test(text);
    };

    // 1. Demographics Extraction
    const ageMatch =
      text.match(/\b(?:Age|Age\s*in\s*years)\b\s*[:|]?\s*(\d{1,3})/i) ||
      text.match(/\(Age\s*(\d{1,3})\)/i) ||
      text.match(/(\d{1,3})[\s-]*(?:yo|y\/o|year[\s-]*old|years?\s*old)/i);
    const age = ageMatch ? Math.min(100, Math.max(1, parseInt(ageMatch[1], 10))) : 42;

    const isFemale =
      text.match(/Sex\s*[:|]\s*Female/i) !== null ||
      text.match(/\|\s*Female\s*\|/i) !== null ||
      /\b(female|woman|girl|lady)\b/i.test(text) ||
      /\bsex[:\s]*f\b/i.test(text);
    const sex: 'male' | 'female' = isFemale ? 'female' : 'male';

    const weightMatch =
      text.match(/Weight\s*[:|]\s*(?:envir\s+)?(\d{2,3}(?:\.\d+)?)\s*kg/i) ||
      text.match(/\|\s*(?:envir\s+)?(\d{2,3}(?:\.\d+)?)\s*kg\s*\|/i) ||
      text.match(/(\d{2,3})\s*(?:kg|kilos?)\b/i);
    const weightKg = weightMatch ? parseInt(weightMatch[1], 10) : (sex === 'male' ? 82 : 65);

    // 2. Underlying Chronic Diseases Detection
    const diseases: string[] = [];
    if (lower.includes('diabet') || lower.includes('glucose') || lower.includes('hba1c') || lower.includes('sugar')) {
      diseases.push('diabetes');
    }
    if ((lower.includes('heart failure') || lower.includes('chf') || lower.includes('cardiomyopathy') || lower.includes('infarct') || lower.includes('myocardial')) && !isDenied('heart failure')) {
      diseases.push('heart_failure');
    }
    if (lower.includes('sepsis') || lower.includes('septic') || lower.includes('cytokine storm')) {
      diseases.push('sepsis');
    }
    if ((lower.includes('kidney') || lower.includes('renal') || lower.includes('ckd') || lower.includes('nephropathy')) && !isDenied('ckd') && !lower.includes('normal renal') && !lower.includes('no ckd')) {
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
    if ((lower.includes('bleed') || lower.includes('hemorrhag') || lower.includes('blood loss') || lower.includes('arterial bleed')) && !isDenied('bleeding')) {
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
    if (lower.includes('motorcycle') || lower.includes('collision') || lower.includes('car crash') || (lower.includes('fall') && (lower.includes('high speed') || lower.includes('height')))) {
      events.push('TraumaEvent: High-Velocity Blunt Impact');
      if (title === 'Acute Clinical Case') title = 'Motor Vehicle Collision Trauma';
      icon = '🏍️';
    }

    // Thoracic / Pulmonary Trauma (ensure not negated: e.g. "denies chest pain or shortness of breath")
    if (
      (lower.includes('pneumothorax') || lower.includes('rib fracture') || lower.includes('flail chest') || (lower.includes('striking') && lower.includes('chest'))) &&
      !isDenied('chest')
    ) {
      events.push('Pathology: Rib Contusion & Bilateral Flail Segments');
      events.push('Complication: Tension Pneumothorax (Impaired Venous Return)');
      events.push('Respiratory: Severe V/Q Mismatch & Alveolar Hypoventilation');
      if (title === 'Acute Clinical Case') title = 'Thoracic Trauma & Pneumothorax';
      icon = '🫁';
    }

    // Neurological / Head Trauma
    if (
      (lower.includes('skull') || lower.includes('concussion') || lower.includes('tbi') || lower.includes('intracranial') || lower.includes('unconscious')) &&
      !isDenied('head')
    ) {
      events.push('NeurologyEvent: Closed Cranial Impact & Elevated ICP');
      if (title === 'Acute Clinical Case') title = 'Traumatic Brain Injury';
      icon = '🧠';
    }

    // Sepsis / Infection
    if (lower.includes('septic shock') || (lower.includes('sepsis') && (lower.includes('fever') || lower.includes('shock') || lower.includes('hypotension')))) {
      events.push('Pathology: Systemic Inflammatory Response Syndrome (SIRS)');
      events.push('Hemodynamics: Severe Vasodilation & Endothelial Capillary Leak');
      title = 'Septic Shock & Cytokine Surge';
      icon = '🦠';
    }

    // Cardiac Arrest / Infarction
    if ((lower.includes('cardiac arrest') || lower.includes('myocardial infarction') || lower.includes('heart attack') || lower.includes('asystole')) && !isDenied('chest pain')) {
      events.push('CardiologyEvent: Acute Anterior Wall ST-Elevation Infarction');
      events.push('Hemodynamics: Cardiogenic Collapse & Hypoperfusion');
      title = 'Acute Myocardial Infarction';
      icon = '🫀';
    }

    // Outpatient Chronic Disease Consultations (handles notes like Riverbend Family Health Clinic)
    const isOutpatientClinicNote =
      lower.includes('outpatient') ||
      lower.includes('clinic note') ||
      lower.includes('follow-up') ||
      lower.includes('regular diabetes check');

    if (isOutpatientClinicNote && !hasBleeding && !lower.includes('motorcycle') && !lower.includes('stab')) {
      icon = '🩸';
      title = diseases.includes('diabetes') ? 'Type 2 Diabetes & Hypertension Management' : 'Clinical Outpatient Follow-up';
      events.push('ClinicalAssessment: Outpatient Comprehensive Metabolic Evaluation');

      if (diseases.includes('diabetes')) {
        const hba1cMatch = text.match(/Hemoglobin\s*A1c\s*[:|]?\s*(\d+\.?\d*)\s*%/i) || text.match(/A1c[:\s]*(\d+\.?\d*)/i);
        const a1cText = hba1cMatch ? ` (HbA1c ${hba1cMatch[1]}%)` : '';
        events.push(`Comorbidity: Type 2 Diabetes Mellitus${a1cText}`);
      }
      if (lower.includes('hypertension') || lower.includes('bp')) {
        events.push('Comorbidity: Essential Hypertension');
      }
      if (lower.includes('hyperlipidemia')) {
        events.push('Comorbidity: Hyperlipidemia');
      }
      if (lower.includes('neuropathy') || lower.includes('tingling')) {
        events.push('Pathology: Diabetic Distal Peripheral Neuropathy (ICD-10: E11.42)');
      }
    }

    // Default Fallback Events if prompt is very brief
    if (events.length === 0) {
      if (diseases.length > 0) {
        events.push(`ChronicPathology: Active Decompensation (${diseases.join(', ').toUpperCase()})`);
        events.push('Metabolic: End-Organ Perfusion Stress');
        title = `Decompensated ${diseases[0].toUpperCase()} Case`;
        icon = '🩸';
      } else {
        events.push('ClinicalAssessment: General Emergency Department Intake');
        events.push('Hemodynamics: Baseline Homeostatic Stress Protocol');
        title = 'Acute Medical Intake';
      }
    }

    // Add chronic conditions as events if not already added
    diseases.forEach(d => {
      const dName = d === 'diabetes' ? 'Type 2 Diabetes Mellitus' : d === 'heart_failure' ? 'Congestive Heart Failure' : d === 'sepsis' ? 'Systemic Sepsis' : 'Chronic Kidney Disease';
      if (!events.some(e => e.includes(dName))) {
        events.push(`Comorbidity: ${dName}`);
      }
    });

    // 4. Extract Explicit Vitals from Text (supports Markdown table rows and colon labels)
    const bpMatch =
      text.match(/(\d{2,3}\s*\/\s*\d{2,3})\s*(?:mmHg)?/i) ||
      text.match(/(?:bp|blood\s*pressure)[:\s|]*(\d{2,3}\s*\/\s*\d{2,3})/i);

    const hrMatch =
      text.match(/(\d{2,3})\s*bpm/i) ||
      text.match(/(?:hr|heart\s*rate|pulse)[:\s|]*(\d{2,3})/i);

    const rrMatch =
      text.match(/(\d{1,2})\s*\/min/i) ||
      text.match(/(?:rr|resp(?:iratory)?\s*rate)[:\s|]*(\d{1,2})/i);

    const spo2Match =
      text.match(/(\d{2,3})\s*%\s*(?=[\|,\n\r]|$)/i) ||
      text.match(/(?:spo2|o2\s*sat|saturation)[:\s|]*(\d{2,3})%?/i);

    const isHypotensive = bpMatch ? parseInt(bpMatch[1].split('/')[0], 10) < 90 : false;
    const isSevereHypoxia = spo2Match ? parseInt(spo2Match[1], 10) < 90 : false;

    // 5. Determine Severity & Starting Vitals
    let severity: 'Critical' | 'Severe' | 'Moderate' | 'Stable' = 'Moderate';
    let baseHr = 74;
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
    } else if (diseases.includes('sepsis') || diseases.includes('heart_failure') || (lower.includes('chest pain') && !isDenied('chest pain')) || lower.includes('fracture')) {
      severity = 'Severe';
      baseHr = 104;
      baseBp = '145/95';
      baseRr = 22;
      baseSpo2 = 93;
      bloodVol = 4900;
    } else if (isOutpatientClinicNote) {
      severity = 'Stable';
      baseHr = 74;
      baseBp = '132/78';
      baseRr = 15;
      baseSpo2 = 99;
      bloodVol = 5000;
    } else if (diseases.includes('diabetes') || diseases.includes('ckd')) {
      severity = 'Moderate';
      baseHr = 82;
      baseBp = '135/86';
      baseRr = 18;
      baseSpo2 = 97;
    }

    const finalVitals = {
      hr: hrMatch ? parseInt(hrMatch[1], 10) : baseHr,
      bp: bpMatch ? bpMatch[1].replace(/\s+/g, '') : baseBp,
      rr: rrMatch ? parseInt(rrMatch[1], 10) : baseRr,
      spo2: spo2Match ? Math.min(100, parseInt(spo2Match[1], 10)) : baseSpo2,
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
      bleedRateMlMin: hasBleeding ? bleedRateMlMin : undefined
    };
  }
}
