import { Blood, OrganNode, SystemNode, UserProfile, LabReport, SimulationEvent } from '../../types/physiology';
import { EventQueue } from './EventQueue';
import { HomeostasisEngine } from './HomeostasisEngine';
import { HealingEngine } from './HealingEngine';
import { SimulationRecorder } from './SimulationRecorder';
import { LaboratoryEngine } from '../labs/LaboratoryEngine';
import { CardiovascularSystem } from '../systems/cardiovascular';
import { RespiratorySystem } from '../systems/respiratory';
import { RenalSystem } from '../systems/renal';
import { HepaticSystem } from '../systems/hepatic';
import { EndocrineSystem } from '../systems/endocrine';
import { NervousSystem } from '../systems/nervous';
import { ImmuneSystem } from '../systems/immune';

// Import JSON rules dynamically as static records
import diabetesData from '../../data/diseases/diabetes.json';
import ckdData from '../../data/diseases/ckd.json';
import sepsisData from '../../data/diseases/sepsis.json';
import heartFailureData from '../../data/diseases/heart_failure.json';

const DISEASES: Record<string, any> = {
  diabetes: diabetesData,
  ckd: ckdData,
  sepsis: sepsisData,
  heart_failure: heartFailureData
};

export class SimulationClock {
  public tickCount = 0;
  public blood!: Blood;
  public organs: Record<string, OrganNode> = {};
  public systems: Record<string, SystemNode> = {};
  public eventQueue = new EventQueue();
  public recorder = new SimulationRecorder();
  public logs: string[] = [];
  
  public lifestyle: UserProfile['lifestyle'] = {
    smoking: 'none',
    alcohol: 'none',
    exercise: 'moderate',
    sleep: 8,
    diet: 'balanced'
  };

  public activeDisease: string | null = null;
  public activeDiseaseSeverity = 0.0; // 0 to 1.0
  public activeMeds: Record<string, number> = {}; // drugId -> dose remaining

  constructor() {
    this.resetToHealthy();
  }

  public resetToHealthy(): void {
    this.tickCount = 0;
    this.logs = ["Patient initialized in normal physiological status."];
    this.activeDisease = null;
    this.activeDiseaseSeverity = 0.0;
    this.activeMeds = {};
    this.eventQueue.clear();
    this.recorder.clear();

    // 1. Initialize Blood Pool
    this.blood = {
      volume: 5000,
      substances: {
        oxygen: 98,
        carbonDioxide: 40,
        glucose: 85,
        insulin: 5.0,
        adrenaline: 20,
        cortisol: 10,
        water: 100,
        platelets: 250,
        whiteCells: 6.0,
        urea: 12,
        creatinine: 0.8,
        sodium: 140,
        potassium: 4.2,
        calcium: 9.5,
        heat: 37.0,
        toxins: 0,
        metformin: 0,
        ibuprofen: 0,
        ph: 7.4
      }
    };

    // 2. Initialize Organs
    const createOrgan = (
      id: string,
      name: string,
      sysId: string,
      compId: string,
      size: number,
      inputs: string[] = [],
      outputs: string[] = []
    ): OrganNode => ({
      id,
      name,
      systemId: sysId,
      compartmentId: compId,
      permanent: { id, name, organSize: size, genetics: 'normal', congenitalConditions: [], age: 30, baselineFunction: 100 },
      temporary: {
        health: 100, integrity: 100, perfusion: 100, oxygenation: 100, metabolicDemand: 40,
        bloodSupply: 100, venousDrainage: 100, neuralInput: 10, hormoneInput: 10,
        inflammation: 0, healing: 0, scarTissue: 0, functionalCapacity: 100, pain: 0,
        temperature: 37.0, infection: 0, immuneActivity: 5, stress: 0
      },
      inputs,
      outputs
    });

    this.organs = {
      heart: createOrgan('heart', 'Heart', 'cardiovascular', 'thoracic', 300, ["oxygen", "glucose", "adrenaline"], ["carbonDioxide", "heat"]),
      lungs: createOrgan('lungs', 'Lungs', 'respiratory', 'thoracic', 850, ["oxygen", "carbonDioxide"], ["oxygen", "carbonDioxide", "heat"]),
      kidney: createOrgan('kidney', 'Kidneys', 'renal', 'abdominal', 150, ["oxygen", "water", "sodium", "potassium", "urea", "creatinine"], ["carbonDioxide", "urine"]),
      liver: createOrgan('liver', 'Liver', 'hepatic', 'abdominal', 1500, ["oxygen", "glucose", "toxins"], ["urea", "glucose", "heat"]),
      pancreas: createOrgan('pancreas', 'Pancreas', 'endocrine', 'abdominal', 80, ["oxygen", "glucose"], ["insulin", "carbonDioxide"]),
      brain: createOrgan('brain', 'Brain', 'nervous', 'cranial', 1400, ["oxygen", "glucose"], ["carbonDioxide", "heat"])
    };

    // 3. Initialize Systems
    this.systems = {
      cardiovascular: { id: 'cardiovascular', name: 'Cardiovascular System', organIds: ['heart'], functionalStatus: 100, failureThreshold: 20 },
      respiratory: { id: 'respiratory', name: 'Respiratory System', organIds: ['lungs'], functionalStatus: 100, failureThreshold: 20 },
      renal: { id: 'renal', name: 'Renal System', organIds: ['kidney'], functionalStatus: 100, failureThreshold: 20 },
      hepatic: { id: 'hepatic', name: 'Hepatic System', organIds: ['liver'], functionalStatus: 100, failureThreshold: 20 },
      endocrine: { id: 'endocrine', name: 'Endocrine System', organIds: ['pancreas'], functionalStatus: 100, failureThreshold: 20 },
      nervous: { id: 'nervous', name: 'Nervous System', organIds: ['brain'], functionalStatus: 100, failureThreshold: 20 },
      immune: { id: 'immune', name: 'Immune System', organIds: [], functionalStatus: 100, failureThreshold: 20 }
    };

    // Save initial state
    this.recorder.record(0, "Hour 0", this.organs, this.systems, this.blood, [], this.getLabReport(), this.logs);
  }

  public loadScenario(scenario: any): void {
    this.resetToHealthy();
    this.lifestyle = { ...scenario.profile.lifestyle };
    
    // Set demographics
    Object.values(this.organs).forEach(org => {
      org.permanent.age = scenario.profile.composition.age;
      org.permanent.genetics = scenario.profile.composition.sex;
    });

    if (scenario.profile.history.diseases.includes('diabetes')) {
      this.activeDisease = 'diabetes';
      this.activeDiseaseSeverity = 0.5;
      this.logs.push("Loaded Clinical Case: Uncontrolled Type II Diabetes.");
    } else if (scenario.profile.history.diseases.includes('heart_failure')) {
      this.activeDisease = 'heart_failure';
      this.activeDiseaseSeverity = 0.5;
      this.logs.push("Loaded Clinical Case: Decompensated Heart Failure.");
    } else if (scenario.profile.history.diseases.includes('sepsis')) {
      this.activeDisease = 'sepsis';
      this.activeDiseaseSeverity = 0.5;
      this.logs.push("Loaded Clinical Case: Systemic Septic Shock.");
    } else if (scenario.profile.history.diseases.includes('ckd')) {
      this.activeDisease = 'ckd';
      this.activeDiseaseSeverity = 0.5;
      this.logs.push("Loaded Clinical Case: Severe Chronic Kidney Disease & Stroke Sclerosis.");
    }
    
    this.recorder.record(0, "Scenario Load", this.organs, this.systems, this.blood, [], this.getLabReport(), this.logs);
  }

  public getLabReport(): LabReport {
    return LaboratoryEngine.generateReport(this.blood, this.organs, this.tickCount);
  }

  public step(): void {
    this.tickCount++;
    const stepLogs: string[] = [`[Tick ${this.tickCount}] Clock incremented.`];

    // 1. Process Event Queue
    this.eventQueue.tick();
    const activeEvents = this.eventQueue.getActiveEvents();
    activeEvents.forEach(e => {
      // Execute the associated action if defined
      if (e.action) {
        e.action(this);
      }
      stepLogs.push(`Event triggered: ${e.name} (${e.description})`);
    });

    // 2. Active Disease Progression
    if (this.activeDisease && DISEASES[this.activeDisease]) {
      const diseaseData = DISEASES[this.activeDisease];
      // Slowly progress disease severity over ticks
      this.activeDiseaseSeverity = Math.min(1.0, this.activeDiseaseSeverity + 0.005);
      
      // Find current stage based on severity threshold
      const stage = diseaseData.stages.find((s: any) => this.activeDiseaseSeverity <= s.threshold) || diseaseData.stages[diseaseData.stages.length - 1];
      stepLogs.push(`Active Condition: ${diseaseData.name} (${stage.name})`);

      // Apply disease modifiers to blood chemistry
      if (stage.effects.glucoseModifier) {
        this.blood.substances.glucose = Math.min(600, this.blood.substances.glucose * 1.01 + stage.effects.glucoseModifier);
      }
      if (stage.effects.filtrationModifier) {
        // lower renal filtration
        const kidney = this.organs['kidney'];
        if (kidney) {
          kidney.temporary.functionalCapacity = Math.max(5, kidney.temporary.functionalCapacity * 0.99);
        }
      }
      if (stage.effects.vasodilationModifier) {
        // vasodilation in sepsis drops blood pressure
        this.blood.volume = Math.max(2500, this.blood.volume - stage.effects.vasodilationModifier * 2);
      }

      // Apply disease organ stress
      if (stage.effects.organStress) {
        Object.entries(stage.effects.organStress).forEach(([orgId, stressConfig]: [string, any]) => {
          const org = this.organs[orgId];
          if (org) {
            if (stressConfig.stress) org.temporary.stress = Math.min(100, org.temporary.stress + stressConfig.stress * 0.1);
            if (stressConfig.inflammation) org.temporary.inflammation = Math.min(100, org.temporary.inflammation + stressConfig.inflammation * 0.1);
            if (stressConfig.functionalCapacity) org.temporary.functionalCapacity = Math.max(5, org.temporary.functionalCapacity - (100 - stressConfig.functionalCapacity) * 0.05);
            if (stressConfig.scarTissue) org.temporary.scarTissue = Math.min(90, org.temporary.scarTissue + stressConfig.scarTissue * 0.05);
          }
        });
      }
    }

    // 3. Apply Medications decay & actions
    Object.keys(this.activeMeds).forEach(medId => {
      if (medId === 'metformin') {
        this.blood.substances.metformin = Math.min(10, this.blood.substances.metformin + 1.0);
        // metfomrin action: improves insulin sensitivity, lowers liver glucose
        this.blood.substances.glucose = Math.max(65, this.blood.substances.glucose - 8);
        this.activeMeds[medId] = Math.max(0, this.activeMeds[medId] - 0.1);
      } else if (medId === 'ibuprofen') {
        this.blood.substances.ibuprofen = Math.min(20, this.blood.substances.ibuprofen + 2.0);
        // Ibuprofen action: reduces pain and inflammation across all organs, but stresses kidneys
        Object.values(this.organs).forEach(org => {
          org.temporary.inflammation = Math.max(0, org.temporary.inflammation - 5);
          org.temporary.pain = Math.max(0, org.temporary.pain - 6);
        });
        const kidney = this.organs['kidney'];
        if (kidney) {
          kidney.temporary.stress = Math.min(100, kidney.temporary.stress + 5);
          kidney.temporary.perfusion = Math.max(40, kidney.temporary.perfusion - 2);
        }
        this.activeMeds[medId] = Math.max(0, this.activeMeds[medId] - 0.2);
      }

      if (this.activeMeds[medId] <= 0) {
        delete this.activeMeds[medId];
        stepLogs.push(`Medication ${medId} fully metabolized and cleared.`);
      }
    });

    // 4. Resolve Homeostasis
    const homeo = HomeostasisEngine.regulate(this.blood, this.organs);
    stepLogs.push(...homeo.log);

    // 5. Update Physiological Systems in hierarchical order
    const cardiovascularLogs = CardiovascularSystem.update(this.systems.cardiovascular, this.organs, this.blood, this.lifestyle);
    const respiratoryLogs = RespiratorySystem.update(this.systems.respiratory, this.organs, this.blood, this.lifestyle, homeo.rrAdjust);
    const renalLogs = RenalSystem.update(this.systems.renal, this.organs, this.blood, this.lifestyle);
    const hepaticLogs = HepaticSystem.update(this.systems.hepatic, this.organs, this.blood, this.lifestyle);
    const endocrineLogs = EndocrineSystem.update(this.systems.endocrine, this.organs, this.blood, this.lifestyle);
    const nervousLogs = NervousSystem.update(this.systems.nervous, this.organs, this.blood, this.lifestyle);
    const immuneLogs = ImmuneSystem.update(this.systems.immune, this.organs, this.blood, this.lifestyle);

    stepLogs.push(...cardiovascularLogs, ...respiratoryLogs, ...renalLogs, ...hepaticLogs, ...endocrineLogs, ...nervousLogs, ...immuneLogs);

    // 6. Healing and remodeling
    const healingLogs = HealingEngine.process(this.organs);
    stepLogs.push(...healingLogs);

    // Save logs
    this.logs.push(...stepLogs);

    // 7. Dynamic laboratory updates
    const currentLabs = this.getLabReport();

    // 8. Record tick state
    this.recorder.record(
      this.tickCount,
      `Hour ${this.tickCount}`,
      this.organs,
      this.systems,
      this.blood,
      this.eventQueue.getAll(),
      currentLabs,
      stepLogs
    );
  }

  public administerMedication(medId: string, dose: number): void {
    this.activeMeds[medId] = (this.activeMeds[medId] || 0) + dose;
    this.logs.push(`Administered drug: ${medId} (${dose}mg). Entered clearance queue.`);
  }

  public triggerInjury(injuryId: string): void {
    if (injuryId === 'bleeding') {
      // Create a continuous event for bleeding
      const bleedEvent: SimulationEvent = {
        id: 'active_bleeding',
        name: 'Active Internal Bleeding',
        priority: 'continuous',
        targetType: 'blood',
        targetId: 'volume',
        ticksRemaining: 0,
        description: 'Vascular laceration in abdominal cavity causing continuous volume depletion.',
        action: (clock: SimulationClock) => {
          clock.blood.volume = Math.max(1000, clock.blood.volume - 150); // Lose 150ml per tick
          const spleen = clock.organs['liver']; // liver laceration trauma
          if (spleen) {
            spleen.temporary.integrity = Math.max(30, spleen.temporary.integrity - 3);
            spleen.temporary.pain = Math.min(100, spleen.temporary.pain + 8);
          }
        }
      };
      this.eventQueue.addEvent(bleedEvent);
      this.logs.push("Emergency triggered: Laceration with Active Bleeding.");
    }
  }

  public restoreTick(tick: number): void {
    const saved = this.recorder.getStateAtTick(tick);
    if (!saved) return;

    this.tickCount = saved.tick;
    this.organs = JSON.parse(JSON.stringify(saved.organs));
    this.systems = JSON.parse(JSON.stringify(saved.systems));
    this.blood = JSON.parse(JSON.stringify(saved.blood));
    this.logs = [...saved.logs];
    
    // Clear and restore event queue
    this.eventQueue.clear();
    saved.events.forEach(e => {
      this.eventQueue.addEvent({
        id: e.id,
        name: e.name,
        priority: e.priority,
        targetType: e.targetType,
        targetId: e.targetId,
        ticksRemaining: e.ticksRemaining,
        description: e.description,
        action: e.id === 'active_bleeding' ? (clock: SimulationClock) => {
          clock.blood.volume = Math.max(1000, clock.blood.volume - 150);
          const liver = clock.organs['liver'];
          if (liver) {
            liver.temporary.integrity = Math.max(30, liver.temporary.integrity - 3);
          }
        } : () => {}
      });
    });
  }
}
