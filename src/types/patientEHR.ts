// ─────────────────────────────────────────────────────────────
// Medical-Grade Electronic Health Record (EHR) Type Definitions
// Source of truth for all simulation engines (Disease, Physiology, PK/PD, Nutrition, Trauma)
// ─────────────────────────────────────────────────────────────

export type ConditionCategory =
  | 'cardiovascular'
  | 'endocrine'
  | 'respiratory'
  | 'renal'
  | 'hepatic'
  | 'gastrointestinal'
  | 'neurological'
  | 'musculoskeletal'
  | 'other';

export type ConditionSeverity = 'mild' | 'moderate' | 'severe';

export interface MedicalCondition {
  id: string;
  name: string;
  category: ConditionCategory;
  stage?: string;
  severity?: ConditionSeverity;
  diagnosedOn?: string;
  notes?: string;
  active: boolean;
}

export type MedicationUnit = 'mg' | 'mcg' | 'g' | 'ml';
export type MedicationFrequency = 'OD' | 'BD' | 'TDS' | 'QID' | 'PRN';
export type MedicationRoute = 'oral' | 'iv' | 'im' | 'subcutaneous' | 'inhaled';

export interface MedicationEntry {
  id: string;
  genericName: string;
  brandName?: string;
  dose: number;
  unit: MedicationUnit;
  frequency: MedicationFrequency;
  route: MedicationRoute;
  startedOn: string;
  reason: string;
}

export interface SurgicalProcedure {
  id: string;
  name: string;
  datePerformed?: string;
  hospital?: string;
  notes?: string;
}

export interface VaccinationEntry {
  id: string;
  vaccineName: string;
  dateAdministered?: string;
  status: 'completed' | 'due' | 'overdue';
}

export interface AllergyEntry {
  id: string;
  category: 'drug' | 'food' | 'latex' | 'contrast' | 'environmental' | 'other';
  allergen: string;
  reaction?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'anaphylactic';
}

export interface FamilyHistoryEntry {
  id: string;
  relation: string; // e.g. 'Father', 'Mother', 'Sibling'
  condition: string;
}

export interface Demographics {
  age: number;
  sex: 'male' | 'female' | 'other';
  ethnicity?: string;
  dominantHand: 'right' | 'left' | 'ambidextrous';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
}

export interface Anthropometrics {
  heightCm: number;
  weightKg: number;
  bodyFatPercentage?: number;
  waistCircumferenceCm?: number;
  hipCircumferenceCm?: number;
}

export interface PregnancyStatus {
  isPregnant: boolean;
  gestationalAgeWeeks?: number;
  trimester?: 1 | 2 | 3;
  isLactating: boolean;
}

export interface PatientLifestyle {
  smoking: 'never' | 'former' | 'occasionally' | 'daily';
  alcohol: 'never' | 'social' | 'weekly' | 'heavy';
  sleepHours: '<5' | '5-6' | '7-8' | '>8';
  stressLevel: 'low' | 'moderate' | 'high';
  exerciseFrequencyDaysPerWeek: number; // 0-7
  exerciseDurationMinutes: number;
  exerciseIntensity: 'none' | 'light' | 'moderate' | 'vigorous' | 'extreme';
}

export interface PatientNutrition {
  mode: 'estimated' | 'manual';
  // Estimated mode categories
  dailyCalorieIntakeCategory?: 'severe_deficit' | 'moderate_deficit' | 'maintenance' | 'mild_surplus' | 'high_surplus';
  proteinIntakeCategory?: 'very_low' | 'low' | 'normal' | 'high' | 'athlete';
  carbIntakeCategory?: 'low_carb' | 'moderate_carb' | 'high_carb';
  fatIntakeCategory?: 'low' | 'balanced' | 'high';
  fiberIntakeCategory?: 'poor' | 'average' | 'excellent';
  waterIntakeCategory?: '<1L' | '1-2L' | '2-3L' | '>3L';
  saltIntakeCategory?: 'low' | 'normal' | 'high';
  fruitVegFrequency?: 'rarely' | 'sometimes' | 'daily';
  // Exact manual mode values
  manualCaloriesKcal?: number;
  manualProteinGrams?: number;
  manualCarbsGrams?: number;
  manualFatGrams?: number;
  manualFiberGrams?: number;
  manualWaterLiters?: number;
  manualSaltGrams?: number;
}

export interface WearableData {
  restingHeartRateBpm?: number;
  averageHeartRateBpm?: number;
  dailySteps?: number;
  vo2Max?: number;
  sleepScore?: number; // 0 - 100
  hrvMs?: number;
}

export interface CompleteBloodCount {
  wbcKUl?: number;         // 4.0 - 11.0 k/uL
  rbcMUl?: number;         // 4.2 - 5.8 M/uL
  hemoglobinGDl?: number;  // 12.0 - 17.5 g/dL
  hematocritPercent?: number; // 36 - 50 %
  plateletsKUl?: number;   // 150 - 450 k/uL
}

export interface ComprehensiveMetabolicPanel {
  sodiumMEqL?: number;     // 135 - 145 mEq/L
  potassiumMEqL?: number;  // 3.5 - 5.0 mEq/L
  chlorideMEqL?: number;   // 96 - 106 mEq/L
  bicarbonateMEqL?: number;// 22 - 29 mEq/L
  bunMgDl?: number;        // 7 - 20 mg/dL
  creatinineMgDl?: number; // 0.6 - 1.2 mg/dL
  glucoseMgDl?: number;    // 70 - 99 mg/dL
  calciumMgDl?: number;    // 8.5 - 10.2 mg/dL
  altUL?: number;          // 7 - 56 U/L
  astUL?: number;          // 10 - 40 U/L
  totalBilirubinMgDl?: number; // 0.1 - 1.2 mg/dL
  alkPhosUL?: number;      // 44 - 147 U/L
}

export interface LipidProfile {
  totalCholesterolMgDl?: number; // < 200 mg/dL
  hdlMgDl?: number;              // > 40 mg/dL
  ldlMgDl?: number;              // < 100 mg/dL
  triglyceridesMgDl?: number;   // < 150 mg/dL
}

export interface LabResults {
  cbc?: CompleteBloodCount;
  cmp?: ComprehensiveMetabolicPanel;
  lipid?: LipidProfile;
  hba1cPercent?: number;       // < 5.7 %
  tshUIuMl?: number;           // 0.4 - 4.0 uIU/mL
  crpMgL?: number;             // < 3.0 mg/L
  esrMmHr?: number;            // 0 - 20 mm/hr
  urinalysisProtein?: 'negative' | 'trace' | '1+' | '2+' | '3+';
  urinalysisGlucose?: 'negative' | 'positive';
}

export interface VitalSigns {
  systolicBp: number;
  diastolicBp: number;
  heartRateBpm: number;
  respiratoryRateBpm: number;
  temperatureC: number;
  spo2Percent: number;
}

export interface HealthGoals {
  primaryGoalType: 'weight_loss' | 'muscle_gain' | 'bp_control' | 'glucose_control' | 'general_wellness';
  targetWeightKg?: number;
  targetCalorieKcal?: number;
  targetProteinGrams?: number;
  targetSystolicBp?: number;
  targetDiastolicBp?: number;
  targetBloodSugarMgDl?: number;
}

export interface CalculatedMetrics {
  bmi: number;
  bmiCategory: string;
  bmrKcal: number;
  tdeeKcal: number;
  bloodVolumeLiters: number;
  bodySurfaceAreaM2: number;
  idealWeightRangeKg: [number, number];
  dailyWaterRequirementLiters: number;
  dailyProteinRequirementGrams: number;
  estimatedGfrMlMin: number;
  leanBodyMassKg: number;
}

// ─────────────────────────────────────────────────────────────
// Root Electronic Health Record Object
// ─────────────────────────────────────────────────────────────
export interface PatientEHR {
  id: string;
  patientName: string;
  createdAt: string;
  updatedAt: string;
  demographics: Demographics;
  anthropometrics: Anthropometrics;
  pregnancy: PregnancyStatus;
  lifestyle: PatientLifestyle;
  nutrition: PatientNutrition;
  medicalConditions: MedicalCondition[];
  surgicalHistory: SurgicalProcedure[];
  familyHistory: FamilyHistoryEntry[];
  allergies: AllergyEntry[];
  medications: MedicationEntry[];
  vaccinations: VaccinationEntry[];
  vitals: VitalSigns;
  labResults: LabResults;
  wearableData: WearableData;
  healthGoals: HealthGoals;
  calculatedMetrics: CalculatedMetrics;
}
