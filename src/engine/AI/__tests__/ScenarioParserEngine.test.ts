import { describe, it, expect } from 'vitest';
import { ScenarioParserEngine } from '../ScenarioParserEngine';

describe('ScenarioParserEngine Unit Tests', () => {
  it('should parse trauma prompt with hemorrhage and tension pneumothorax', () => {
    const prompt = '42-year-old male falls from motorcycle at high speed, blunt thoracic chest impact with left rib fractures, tension pneumothorax, and heavy arterial bleeding from left femur';
    const draft = ScenarioParserEngine.parse(prompt);

    expect(draft.demographics.age).toBe(42);
    expect(draft.demographics.sex).toBe('male');
    expect(draft.hasBleeding).toBe(true);
    expect(draft.severity).toBe('Critical');
    expect(draft.events.some(e => e.includes('HemorrhageEvent'))).toBe(true);
    expect(draft.events.some(e => e.includes('Pneumothorax'))).toBe(true);
    expect(draft.vitals.hr).toBeGreaterThanOrEqual(115);
    expect(draft.vitals.spo2).toBeLessThanOrEqual(90);
  });

  it('should parse sepsis prompt with fever and tachycardia', () => {
    const prompt = '68-year-old female admitted for severe sepsis and pneumonia, fever 39.5C, HR: 126, BP: 82/48, SpO2: 89%';
    const draft = ScenarioParserEngine.parse(prompt);

    expect(draft.demographics.age).toBe(68);
    expect(draft.demographics.sex).toBe('female');
    expect(draft.diseases).toContain('sepsis');
    expect(draft.vitals.hr).toBe(126);
    expect(draft.vitals.bp).toBe('82/48');
    expect(draft.vitals.spo2).toBe(89);
    expect(draft.severity).toBe('Critical');
  });

  it('should parse chronic diabetes and ckd prompt', () => {
    const prompt = '55yo man with uncontrolled type 2 diabetes and chronic kidney disease stage 3, glucose 280 mg/dL';
    const draft = ScenarioParserEngine.parse(prompt);

    expect(draft.demographics.age).toBe(55);
    expect(draft.demographics.sex).toBe('male');
    expect(draft.diseases).toContain('diabetes');
    expect(draft.diseases).toContain('ckd');
    expect(draft.hasBleeding).toBe(false);
  });

  it('should parse acute myocardial infarction prompt', () => {
    const prompt = '60-year-old male with acute myocardial infarction, crushing substernal chest pain, diaphoresis';
    const draft = ScenarioParserEngine.parse(prompt);

    expect(draft.diseases).toContain('heart_failure');
    expect(draft.title).toContain('Myocardial Infarction');
    expect(draft.events.some(e => e.includes('CardiologyEvent'))).toBe(true);
  });
});
