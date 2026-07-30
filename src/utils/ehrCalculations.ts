import { PatientEHR, CalculatedMetrics } from '../types/patientEHR';

// ─────────────────────────────────────────────────────────────
// Real-time Medical & Physiological Calculation Engine
// ─────────────────────────────────────────────────────────────

export class EHRCalculationsEngine {
  public static calculate(ehr: Omit<PatientEHR, 'calculatedMetrics'> | PatientEHR): CalculatedMetrics {
    const { demographics, anthropometrics, pregnancy, lifestyle, nutrition } = ehr;
    const { age, sex } = demographics;
    const { heightCm, weightKg } = anthropometrics;

    // Safety checks
    const hM = heightCm > 0 ? heightCm / 100 : 1.75;
    const wKg = weightKg > 0 ? weightKg : 70;
    const safeAge = Math.max(1, age);

    // 1. Body Mass Index (BMI)
    const bmi = parseFloat((wKg / (hM * hM)).toFixed(1));

    let bmiCategory = 'Normal Weight';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25.0) bmiCategory = 'Normal Weight';
    else if (bmi < 30.0) bmiCategory = 'Overweight';
    else if (bmi < 35.0) bmiCategory = 'Obesity Class I';
    else if (bmi < 40.0) bmiCategory = 'Obesity Class II';
    else bmiCategory = 'Obesity Class III (Severe)';

    // 2. Basal Metabolic Rate (BMR — Mifflin-St Jeor)
    let bmr = (10 * wKg) + (6.25 * heightCm) - (5 * safeAge);
    if (sex === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    const bmrKcal = Math.round(Math.max(500, bmr));

    // 3. Activity Level Multiplier & TDEE
    let activityMultiplier = 1.2; // Sedentary
    const freq = lifestyle.exerciseFrequencyDaysPerWeek || 0;
    const intensity = lifestyle.exerciseIntensity;

    if (freq >= 5 || intensity === 'extreme') activityMultiplier = 1.725;
    else if (freq >= 3 || intensity === 'vigorous') activityMultiplier = 1.55;
    else if (freq >= 1 || intensity === 'moderate') activityMultiplier = 1.375;

    let tdee = bmrKcal * activityMultiplier;

    // Calorie adjustment based on nutrition mode/category
    if (nutrition.mode === 'estimated') {
      if (nutrition.dailyCalorieIntakeCategory === 'severe_deficit') tdee -= 500;
      else if (nutrition.dailyCalorieIntakeCategory === 'moderate_deficit') tdee -= 300;
      else if (nutrition.dailyCalorieIntakeCategory === 'mild_surplus') tdee += 250;
      else if (nutrition.dailyCalorieIntakeCategory === 'high_surplus') tdee += 500;
    }
    const tdeeKcal = Math.round(Math.max(800, tdee));

    // 4. Estimated Blood Volume (Nadler's Formula + Pregnancy Hypervolemia)
    // Male: 0.3669 * H^3 + 0.03219 * W + 0.6041
    // Female: 0.3561 * H^3 + 0.03308 * W + 0.1833
    let ebv = 0;
    if (sex === 'male') {
      ebv = (0.3669 * Math.pow(hM, 3)) + (0.03219 * wKg) + 0.6041;
    } else {
      ebv = (0.3561 * Math.pow(hM, 3)) + (0.03308 * wKg) + 0.1833;
    }

    // Pregnancy physiological expansion (+30% to 45%)
    if (sex === 'female' && pregnancy?.isPregnant) {
      const trimester = pregnancy.trimester || 2;
      const expansion = trimester === 1 ? 0.15 : trimester === 2 ? 0.35 : 0.45;
      ebv *= (1 + expansion);
    }
    const bloodVolumeLiters = parseFloat(Math.max(1.5, ebv).toFixed(2));

    // 5. Body Surface Area (BSA — Mosteller)
    // sqrt((heightCm * weightKg) / 3600)
    const bsa = Math.sqrt((heightCm * wKg) / 3600);
    const bodySurfaceAreaM2 = parseFloat(bsa.toFixed(2));

    // 6. Healthy / Ideal Weight Range (BMI 18.5 – 24.9)
    const minW = parseFloat((18.5 * hM * hM).toFixed(1));
    const maxW = parseFloat((24.9 * hM * hM).toFixed(1));
    const idealWeightRangeKg: [number, number] = [minW, maxW];

    // 7. Daily Water Requirement
    // 35 ml per kg body mass
    let waterReqLiters = (wKg * 35) / 1000;
    if (lifestyle.exerciseIntensity === 'vigorous' || lifestyle.exerciseIntensity === 'extreme') {
      waterReqLiters += 0.75;
    }
    if (pregnancy?.isPregnant) waterReqLiters += 0.5;
    if (pregnancy?.isLactating) waterReqLiters += 0.8;
    const dailyWaterRequirementLiters = parseFloat(waterReqLiters.toFixed(1));

    // 8. Daily Protein Requirement
    // Base 0.8g/kg; athletes 1.6 - 2.2g/kg
    let proteinFactor = 0.8;
    if (lifestyle.exerciseIntensity === 'vigorous' || lifestyle.exerciseIntensity === 'extreme') {
      proteinFactor = 1.8;
    } else if (lifestyle.exerciseIntensity === 'moderate') {
      proteinFactor = 1.2;
    }
    if (pregnancy?.isPregnant || pregnancy?.isLactating) {
      proteinFactor += 0.3;
    }
    const dailyProteinRequirementGrams = Math.round(wKg * proteinFactor);

    // 9. Lean Body Mass (Boer Formula)
    // Male: (0.407 * W) + (0.267 * H) - 19.2
    // Female: (0.252 * W) + (0.473 * H) - 48.3
    let lbm = 0;
    if (sex === 'male') {
      lbm = (0.407 * wKg) + (0.267 * heightCm) - 19.2;
    } else {
      lbm = (0.252 * wKg) + (0.473 * heightCm) - 48.3;
    }
    const leanBodyMassKg = parseFloat(Math.max(20, Math.min(wKg, lbm)).toFixed(1));

    // 10. Estimated GFR (CKD-EPI 2021 approximation)
    // Standard baseline eGFR assumes normal creatinine ~ 0.9 mg/dL
    const scr = ehr.labResults?.cmp?.creatinineMgDl || 0.9;
    const kappa = sex === 'female' ? 0.7 : 0.9;
    const alpha = sex === 'female' ? -0.241 : -0.302;
    const minVal = Math.min(scr / kappa, 1);
    const maxVal = Math.max(scr / kappa, 1);
    const egfr = 142 * Math.pow(minVal, alpha) * Math.pow(maxVal, -1.2) * Math.pow(0.9938, safeAge) * (sex === 'female' ? 1.012 : 1.0);
    const estimatedGfrMlMin = Math.round(Math.max(10, Math.min(140, egfr)));

    return {
      bmi,
      bmiCategory,
      bmrKcal,
      tdeeKcal,
      bloodVolumeLiters,
      bodySurfaceAreaM2,
      idealWeightRangeKg,
      dailyWaterRequirementLiters,
      dailyProteinRequirementGrams,
      estimatedGfrMlMin,
      leanBodyMassKg,
    };
  }

  /** Default baseline profile template */
  public static createDefaultProfile(name = 'John Doe (Baseline)'): PatientEHR {
    const defaultData: Omit<PatientEHR, 'calculatedMetrics'> = {
      id: `patient_${Date.now()}`,
      patientName: name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      demographics: {
        age: 42,
        sex: 'male',
        ethnicity: 'Caucasian',
        dominantHand: 'right',
        bloodGroup: 'O+',
      },
      anthropometrics: {
        heightCm: 178,
        weightKg: 84,
        bodyFatPercentage: 22,
        waistCircumferenceCm: 92,
        hipCircumferenceCm: 100,
      },
      pregnancy: {
        isPregnant: false,
        isLactating: false,
      },
      lifestyle: {
        smoking: 'never',
        alcohol: 'social',
        sleepHours: '7-8',
        stressLevel: 'moderate',
        exerciseFrequencyDaysPerWeek: 2,
        exerciseDurationMinutes: 30,
        exerciseIntensity: 'light',
      },
      nutrition: {
        mode: 'estimated',
        dailyCalorieIntakeCategory: 'maintenance',
        proteinIntakeCategory: 'normal',
        carbIntakeCategory: 'moderate_carb',
        fatIntakeCategory: 'balanced',
        fiberIntakeCategory: 'average',
        waterIntakeCategory: '2-3L',
        saltIntakeCategory: 'normal',
        fruitVegFrequency: 'sometimes',
      },
      medicalConditions: [
        {
          id: 'cond_htn',
          name: 'Hypertension',
          category: 'cardiovascular',
          stage: 'Stage 1',
          severity: 'mild',
          diagnosedOn: '2024-01-15',
          notes: 'Managed with low-dose ARB',
          active: true,
        },
      ],
      surgicalHistory: [
        {
          id: 'surg_app',
          name: 'Appendectomy',
          datePerformed: '2015-06-12',
          hospital: 'St. Jude Memorial',
          notes: 'Laparoscopic appendectomy, un-complicated',
        },
      ],
      familyHistory: [
        { id: 'fam_1', relation: 'Father', condition: 'Coronary Artery Disease' },
        { id: 'fam_2', relation: 'Mother', condition: 'Type 2 Diabetes' },
      ],
      allergies: [
        { id: 'alg_1', category: 'drug', allergen: 'Penicillin', reaction: 'Hives, Urticaria', severity: 'moderate' },
      ],
      medications: [
        {
          id: 'med_losartan',
          genericName: 'Losartan',
          brandName: 'Cozaar',
          dose: 50,
          unit: 'mg',
          frequency: 'OD',
          route: 'oral',
          startedOn: '2024-01-20',
          reason: 'Primary Hypertension management',
        },
      ],
      vaccinations: [
        { id: 'vac_covid', vaccineName: 'COVID-19 mRNA', dateAdministered: '2023-11-01', status: 'completed' },
        { id: 'vac_flu', vaccineName: 'Annual Influenza', dateAdministered: '2025-10-15', status: 'completed' },
      ],
      vitals: {
        systolicBp: 128,
        diastolicBp: 82,
        heartRateBpm: 72,
        respiratoryRateBpm: 14,
        temperatureC: 36.8,
        spo2Percent: 98,
      },
      labResults: {
        cbc: { hemoglobinGDl: 14.5, wbcKUl: 6.8, hematocritPercent: 43, plateletsKUl: 240 },
        cmp: { glucoseMgDl: 94, creatinineMgDl: 0.9, sodiumMEqL: 140, potassiumMEqL: 4.2 },
        lipid: { totalCholesterolMgDl: 185, hdlMgDl: 48, ldlMgDl: 112, triglyceridesMgDl: 125 },
        hba1cPercent: 5.4,
      },
      wearableData: {
        restingHeartRateBpm: 65,
        averageHeartRateBpm: 74,
        dailySteps: 7200,
        vo2Max: 38,
        sleepScore: 78,
      },
      healthGoals: {
        primaryGoalType: 'weight_loss',
        targetWeightKg: 78,
        targetCalorieKcal: 2000,
        targetProteinGrams: 120,
        targetSystolicBp: 120,
        targetDiastolicBp: 80,
      },
    };

    const calculatedMetrics = EHRCalculationsEngine.calculate(defaultData);
    return {
      ...defaultData,
      calculatedMetrics,
    };
  }
}
