import React from 'react';
import { UserProfile } from '../../types/physiology';
import { User, Activity, AlertTriangle, Pill, ShieldAlert } from 'lucide-react';

interface ScenarioBuilderProps {
  profile: UserProfile;
  onChangeProfile: (profile: UserProfile) => void;
  activeDisease: string | null;
  onSelectDisease: (id: string | null) => void;
  onTriggerInjury: (id: string) => void;
  onAdministerMedication: (id: string, dose: number) => void;
  activeMeds: Record<string, number>;
  onLoadPreset: (scenario: any) => void;
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  profile,
  onChangeProfile,
  activeDisease,
  onTriggerInjury,
  onAdministerMedication,
  activeMeds,
  onLoadPreset
}) => {
  const handleLifestyleChange = (key: string, value: string | number) => {
    onChangeProfile({
      ...profile,
      lifestyle: {
        ...profile.lifestyle,
        [key]: value
      }
    });
  };

  const handleDemographicsChange = (key: string, value: string | number) => {
    onChangeProfile({
      ...profile,
      composition: {
        ...profile.composition,
        [key]: value
      }
    });
  };

  // Preset Clinical Cases data structures (Point 9)
  const presetCases = [
    {
      id: 'healthy',
      name: 'Healthy',
      icon: '❤️',
      desc: '25yo baseline, active lifestyle',
      profile: {
        composition: { weightKg: 60, heightCm: 168, sex: 'female', age: 25, bodyFatPercentage: 22, muscleMassKg: 24, waterPercentage: 60, boneDensityScore: 1.0, bmi: 21.3, bmr: 1400 },
        lifestyle: { smoking: 'none', alcohol: 'none', exercise: 'active', sleep: 8, diet: 'healthy' },
        history: { diseases: [], allergies: [], surgeries: [], medications: [] }
      }
    },
    {
      id: 'diabetes',
      name: 'Diabetes',
      icon: '🩸',
      desc: '55yo male, uncontrolled glycation',
      profile: {
        composition: { weightKg: 95, heightCm: 178, sex: 'male', age: 55, bodyFatPercentage: 32, muscleMassKg: 35, waterPercentage: 48, boneDensityScore: -0.5, bmi: 30.0, bmr: 1800 },
        lifestyle: { smoking: 'light', alcohol: 'moderate', exercise: 'sedentary', sleep: 6, diet: 'poor' },
        history: { diseases: ['diabetes'], allergies: [], surgeries: [], medications: [] }
      }
    },
    {
      id: 'heart_failure',
      name: 'Heart Failure',
      icon: '🫀',
      desc: '65yo decompensated cardiogenic load',
      profile: {
        composition: { weightKg: 82, heightCm: 172, sex: 'male', age: 65, bodyFatPercentage: 28, muscleMassKg: 29, waterPercentage: 54, boneDensityScore: -0.8, bmi: 27.7, bmr: 1550 },
        lifestyle: { smoking: 'heavy', alcohol: 'light', exercise: 'sedentary', sleep: 6, diet: 'balanced' },
        history: { diseases: ['heart_failure'], allergies: [], surgeries: [], medications: [] }
      }
    },
    {
      id: 'sepsis',
      name: 'Sepsis',
      icon: '🫁',
      desc: '40yo systemic cytokine shock',
      profile: {
        composition: { weightKg: 78, heightCm: 176, sex: 'male', age: 40, bodyFatPercentage: 24, muscleMassKg: 31, waterPercentage: 58, boneDensityScore: 0.0, bmi: 25.2, bmr: 1650 },
        lifestyle: { smoking: 'none', alcohol: 'none', exercise: 'moderate', sleep: 7, diet: 'balanced' },
        history: { diseases: ['sepsis'], allergies: [], surgeries: [], medications: [] }
      }
    },
    {
      id: 'stroke',
      name: 'Stroke',
      icon: '🧠',
      desc: '70yo vascular glomerulosclerosis',
      profile: {
        composition: { weightKg: 88, heightCm: 170, sex: 'female', age: 70, bodyFatPercentage: 34, muscleMassKg: 23, waterPercentage: 45, boneDensityScore: -1.2, bmi: 30.4, bmr: 1300 },
        lifestyle: { smoking: 'heavy', alcohol: 'moderate', exercise: 'sedentary', sleep: 5, diet: 'poor' },
        history: { diseases: ['ckd'], allergies: [], surgeries: [], medications: [] }
      }
    }
  ];

  return (
    <div className="glass-panel p-3 flex flex-col gap-3 h-full overflow-y-auto font-sans">
      {/* 1. Case preset Selectors (Redesigned Point 9) */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-medical-400" />
          Clinical Case Presets
        </h3>
        <div className="flex flex-col gap-1.5">
          {presetCases.map(c => (
            <button
              key={c.id}
              onClick={() => onLoadPreset(c)}
              className="p-2 rounded-lg text-left bg-slate-950/30 border border-slate-900/60 hover:border-medical-500/50 hover:bg-slate-900/20 transition-all flex items-center gap-2.5"
            >
              <span className="text-xl bg-slate-900 p-1.5 rounded-lg border border-slate-800/80">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-200">{c.name}</div>
                <div className="text-[9px] text-slate-500 truncate mt-0.5">{c.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-900" />

      {/* 2. Patient demographics */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
          <User className="w-4 h-4 text-medical-400" />
          Patient Profile
        </h3>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <label className="text-slate-600 block mb-0.5 font-medium">Age</label>
            <input
              type="number"
              value={profile.composition.age}
              onChange={(e) => handleDemographicsChange('age', parseInt(e.target.value) || 30)}
              className="glass-input w-full py-1 text-xs"
            />
          </div>
          <div>
            <label className="text-slate-600 block mb-0.5 font-medium">Sex</label>
            <select
              value={profile.composition.sex}
              onChange={(e) => handleDemographicsChange('sex', e.target.value)}
              className="glass-input w-full py-1 text-xs"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      <hr className="border-slate-900" />

      {/* 3. Lifestyle controls */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-medical-400" />
          Lifestyle Coefficients
        </h3>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <label className="text-slate-600 block mb-0.5 font-medium">Smoking</label>
            <select
              value={profile.lifestyle.smoking}
              onChange={(e) => handleLifestyleChange('smoking', e.target.value)}
              className="glass-input w-full py-1 text-xs"
            >
              <option value="none">None</option>
              <option value="light">Light</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>
          <div>
            <label className="text-slate-600 block mb-0.5 font-medium">Exercise</label>
            <select
              value={profile.lifestyle.exercise}
              onChange={(e) => handleLifestyleChange('exercise', e.target.value)}
              className="glass-input w-full py-1 text-xs"
            >
              <option value="sedentary">Sedentary</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
      </div>

      <hr className="border-slate-900" />

      {/* 4. Trigger trauma */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Trigger Trauma
        </h3>
        <button
          onClick={() => onTriggerInjury('bleeding')}
          className="w-full py-1.5 bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 text-red-400 font-bold rounded-lg text-[10px]"
        >
          Inject Vascular Laceration Bleed
        </button>
      </div>

      <hr className="border-slate-900" />

      {/* 5. Medication Panel */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
          <Pill className="w-4 h-4 text-emerald-400" />
          Administer Meds
        </h3>
        <div className="flex flex-col gap-1 text-[10px]">
          {[
            { id: 'metformin', name: 'Metformin 500mg', desc: 'Antidiabetic' },
            { id: 'ibuprofen', name: 'Ibuprofen 400mg', desc: 'NSAID / Anti-inflam' }
          ].map(med => (
            <button
              key={med.id}
              onClick={() => onAdministerMedication(med.id, med.id === 'metformin' ? 500 : 400)}
              className="p-2 rounded bg-slate-950/30 border border-slate-900 hover:border-emerald-850 hover:bg-slate-900/10 flex justify-between items-center text-left"
            >
              <div>
                <span className="font-bold text-slate-300 block">{med.name}</span>
                <span className="text-[8px] text-slate-500">{med.desc}</span>
              </div>
              {activeMeds[med.id] !== undefined && (
                <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-bold">
                  ACTIVE
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
