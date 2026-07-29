export interface Substances {
  oxygen: number;         // partial pressure/saturation relative (e.g. 95-100)
  carbonDioxide: number;  // relative concentration (e.g. 35-45)
  glucose: number;        // mg/dL
  insulin: number;        // uIU/mL
  adrenaline: number;     // pg/mL
  cortisol: number;       // mcg/dL
  water: number;          // ml of excess/depleted (relative index, e.g. 100 is normal)
  platelets: number;      // 10^3/mcL
  whiteCells: number;     // 10^3/mcL
  urea: number;           // mg/dL (BUN)
  creatinine: number;     // mg/dL
  sodium: number;         // mEq/L
  potassium: number;      // mEq/L
  calcium: number;        // mg/dL
  heat: number;           // temperature in °C
  toxins: number;         // arbitrary toxicity level (0 = healthy, 100 = septic shock)
  metformin: number;      // drug concentration (mg/L)
  ibuprofen: number;      // drug concentration (mg/L)
  ph: number;             // blood pH level
}

export interface OrganPermanentState {
  id: string;
  name: string;
  organSize: number;       // grams
  genetics: string;
  congenitalConditions: string[];
  age: number;
  baselineFunction: number;// 0-100%
}

export interface OrganTemporaryState {
  health: number;             // 0-100%
  integrity: number;          // 0-100% (structural damage indicator)
  perfusion: number;          // 0-100% (blood flow delivery efficiency)
  oxygenation: number;        // 0-100% (cellular oxygen status)
  metabolicDemand: number;    // 0-100%
  bloodSupply: number;        // ml/min
  venousDrainage: number;     // ml/min
  neuralInput: number;        // sympathetic autonomic stimulation (0-100)
  hormoneInput: number;       // metabolic endocrine input (0-100)
  inflammation: number;       // 0-100%
  healing: number;            // 0-100% (active regeneration effort)
  scarTissue: number;         // 0-100% (permanent replacement tissue)
  functionalCapacity: number; // 0-100% (current capability)
  pain: number;               // 0-100%
  temperature: number;        // localized °C
  infection: number;          // 0-100% (bacterial/viral load)
  immuneActivity: number;     // 0-100%
  stress: number;             // 0-100%
}

export interface OrganNode {
  id: string;
  name: string;
  systemId: string;
  compartmentId: string;
  permanent: OrganPermanentState;
  temporary: OrganTemporaryState;
  inputs: string[];
  outputs: string[];
}

export interface SystemNode {
  id: string;
  name: string;
  organIds: string[];
  functionalStatus: number; // 0-100%
  failureThreshold: number; // status below which system fails
}

export interface Blood {
  volume: number;           // ml (standard ~5000ml)
  substances: Substances;
}

export interface BodyComposition {
  weightKg: number;
  heightCm: number;
  sex: 'male' | 'female';
  age: number;
  bodyFatPercentage: number;
  muscleMassKg: number;
  waterPercentage: number;
  boneDensityScore: number; // T-score
  bmi: number;
  bmr: number;             // kcal/day
}

export type EdgeType = 'Blood' | 'Hormone' | 'Nerve' | 'Mechanical' | 'Lymph' | 'Dependency';

export interface KnowledgeEdge {
  from: string;
  to: string;
  type: EdgeType;
  description: string;
}

export type EventPriority = 'critical' | 'immediate' | 'continuous' | 'delayed' | 'scheduled';

export interface SimulationEvent {
  id: string;
  name: string;
  priority: EventPriority;
  targetType: 'organ' | 'system' | 'blood' | 'global';
  targetId: string;
  ticksRemaining: number;
  action: (state: any) => void;
  description: string;
}

export interface LabValue {
  value: number;
  unit: string;
  range: string;
  status: 'normal' | 'high' | 'low';
}

export interface LabReport {
  id: string;
  timestamp: string;
  tickNumber: number;
  cbc: {
    wbc: LabValue;
    rbc: LabValue;
    hemoglobin: LabValue;
    hematocrit: LabValue;
    platelets: LabValue;
  };
  metabolic: {
    sodium: LabValue;
    potassium: LabValue;
    calcium: LabValue;
    glucose: LabValue;
    bun: LabValue;
    creatinine: LabValue;
    hba1c: LabValue;
  };
  enzymes: {
    alt: LabValue;
    ast: LabValue;
  };
}

export interface UserProfile {
  composition: BodyComposition;
  lifestyle: {
    smoking: 'none' | 'light' | 'heavy';
    alcohol: 'none' | 'light' | 'heavy';
    exercise: 'sedentary' | 'moderate' | 'active';
    sleep: number;
    diet: 'poor' | 'balanced' | 'healthy';
  };
  history: {
    diseases: string[];
    allergies: string[];
    surgeries: string[];
    medications: string[];
  };
}

export interface ClinicalScenario {
  id: string;
  name: string;
  description: string;
  profile: UserProfile;
  initialEvents: Omit<SimulationEvent, 'action'>[];
}
