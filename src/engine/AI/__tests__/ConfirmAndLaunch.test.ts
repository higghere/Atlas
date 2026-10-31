import { describe, it, expect } from 'vitest';
import { ScenarioParserEngine } from '../ScenarioParserEngine';
import { SimulationClock } from '../../core/SimulationClock';

describe('Confirm and Launch Integration Test', () => {
  it('should parse prompt, load scenario into SimulationClock, and update vitals', () => {
    const prompt = 'A 42-year-old diabetic male falls from a motorcycle at high speed, striking the left side of his chest and suffering heavy bleeding from the left thigh.';
    const draft = ScenarioParserEngine.parse(prompt);

    expect(draft.severity).toBe('Critical');
    expect(draft.hasBleeding).toBe(true);
    expect(draft.vitals.hr).toBeGreaterThanOrEqual(118);
    expect(draft.vitals.bloodVolume).toBe(4100);

    const clock = new SimulationClock();
    
    // Simulate what handleConfirmAIDraft produces:
    const customScenario = {
      id: `ai_${Date.now()}`,
      name: draft.title,
      icon: draft.icon,
      desc: prompt.slice(0, 100),
      difficulty: draft.severity,
      profile: {
        composition: {
          weightKg: draft.demographics.weightKg,
          heightCm: 178,
          sex: draft.demographics.sex,
          age: draft.demographics.age,
          bodyFatPercentage: 20,
          muscleMassKg: 35,
          waterPercentage: 60,
          boneDensityScore: 0,
          bmi: 25,
          bmr: 1700,
        },
        lifestyle: clock.lifestyle,
        history: {
          diseases: draft.diseases,
          allergies: [],
          surgeries: [],
          medications: []
        }
      },
      injury: draft.hasBleeding ? 'bleeding' : undefined,
      initialVitals: {
        hr: draft.vitals.hr,
        bp: draft.vitals.bp,
        rr: draft.vitals.rr,
        spo2: draft.vitals.spo2,
        bloodVolume: draft.vitals.bloodVolume
      },
      events: draft.events,
      autoPlay: true
    };

    clock.loadScenario(customScenario);
    clock.step();

    console.log('Clock blood volume after step:', clock.blood.volume);
    console.log('Clock heart stress after step:', clock.organs.heart.temporary.stress);
    console.log('Clock adrenaline after step:', clock.blood.substances.adrenaline);
    console.log('Clock active disease:', clock.activeDisease);
    console.log('Clock active injury:', clock.activeInjury);

    expect(clock.blood.volume).toBeLessThan(4500);
    expect(clock.blood.substances.adrenaline).toBeGreaterThan(100);
    expect(clock.activeDisease).toBe('diabetes');
    expect(clock.activeInjury).toBe('bleeding');
  });
});
