import React, { useState } from 'react';
import { UserProfile } from '../../types/physiology';
import { User, Activity, AlertTriangle, Pill, ShieldAlert, Sparkles, Play, Eye, FileText, CheckCircle2, ChevronRight, Stethoscope, Clock, ShieldCheck } from 'lucide-react';

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
  onSelectDisease,
  onTriggerInjury,
  onAdministerMedication,
  activeMeds,
  onLoadPreset
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'builder' | 'ai'>('preset');
  
  // Guided Builder state
  const [traumaCategory, setTraumaCategory] = useState('penetrating');
  const [traumaLocation, setTraumaLocation] = useState('left_abdomen');
  const [traumaDepth, setTraumaDepth] = useState(7);
  const [traumaWeapon, setTraumaWeapon] = useState('knife');

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('A 42-year-old diabetic male falls from a motorcycle at high speed, striking the left side of his chest and suffering heavy bleeding from the left thigh.');
  const [aiDraft, setAiDraft] = useState<{
    severity: string;
    confidence: number;
    events: string[];
    vitals: { hr: number; bp: string; rr: number; spo2: number };
  } | null>(null);

  // Preset Clinical Cases
  const presetCases = [
    {
      id: 'knife_stab',
      name: 'Knife Stab (Penetrating)',
      icon: '🗡️',
      desc: 'Single penetrating abdominal injury, renal artery bleed',
      difficulty: 'Intermediate',
      lod: 'LOD2_ORGAN',
      profile: {
        composition: { weightKg: 75, heightCm: 178, sex: 'male', age: 34, bodyFatPercentage: 18, muscleMassKg: 34, waterPercentage: 62, boneDensityScore: 0.8, bmi: 23.7, bmr: 1680 },
        lifestyle: { smoking: 'none', alcohol: 'light', exercise: 'active', sleep: 8, diet: 'healthy' },
        history: { diseases: [], allergies: [], surgeries: [], medications: [] }
      }
    },
    {
      id: 'vehicle_collision',
      name: 'Motorcycle Collision',
      icon: '🏍️',
      desc: 'High-speed impact, blunt thoracic trauma & pneumothorax',
      difficulty: 'Advanced',
      lod: 'LOD2_ORGAN',
      profile: {
        composition: { weightKg: 82, heightCm: 180, sex: 'male', age: 42, bodyFatPercentage: 24, muscleMassKg: 35, waterPercentage: 56, boneDensityScore: 0.2, bmi: 25.3, bmr: 1750 },
        lifestyle: { smoking: 'light', alcohol: 'moderate', exercise: 'moderate', sleep: 7, diet: 'balanced' },
        history: { diseases: ['diabetes'], allergies: [], surgeries: [], medications: [] }
      }
    },
    {
      id: 'septic_shock',
      name: 'Septic Shock',
      icon: '🫁',
      desc: 'Systemic cytokine storm, severe arterial vasodilation',
      difficulty: 'Critical',
      lod: 'LOD1_TISSUE',
      profile: {
        composition: { weightKg: 78, heightCm: 176, sex: 'male', age: 40, bodyFatPercentage: 24, muscleMassKg: 31, waterPercentage: 58, boneDensityScore: 0.0, bmi: 25.2, bmr: 1650 },
        lifestyle: { smoking: 'none', alcohol: 'none', exercise: 'moderate', sleep: 7, diet: 'balanced' },
        history: { diseases: ['sepsis'], allergies: [], surgeries: [], medications: [] }
      }
    },
    {
      id: 'diabetes',
      name: 'Uncontrolled Diabetes',
      icon: '🩸',
      desc: '55yo male, glycation & glomerulosclerosis',
      difficulty: 'Intermediate',
      lod: 'LOD1_TISSUE',
      profile: {
        composition: { weightKg: 95, heightCm: 178, sex: 'male', age: 55, bodyFatPercentage: 32, muscleMassKg: 35, waterPercentage: 48, boneDensityScore: -0.5, bmi: 30.0, bmr: 1800 },
        lifestyle: { smoking: 'light', alcohol: 'moderate', exercise: 'sedentary', sleep: 6, diet: 'poor' },
        history: { diseases: ['diabetes'], allergies: [], surgeries: [], medications: [] }
      }
    }
  ];

  const handleParseAI = () => {
    setAiDraft({
      severity: 'Critical',
      confidence: 0.94,
      events: [
        'TraumaEvent: Left Femur Laceration',
        'TraumaEvent: Blunt Thoracic Impact',
        'Pathology: Multiple Rib Fractures',
        'Complication: Tension Pneumothorax (Left)',
        'Hemorrhage: 800 mL Arterial Bleed'
      ],
      vitals: { hr: 118, bp: '95/60', rr: 28, spo2: 89 }
    });
  };

  const handleConfirmAIDraft = () => {
    onLoadPreset(presetCases[1]);
  };

  return (
    <div className="glass-panel p-3 flex flex-col gap-3 h-full overflow-y-auto font-sans">
      {/* Simulation Mode Header & Tab Selector */}
      <div className="border-b border-slate-900 pb-2.5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-medical-400" />
            Simulation Mode Engine
          </h2>
          <span className="text-[9px] bg-medical-500/10 border border-medical-500/30 text-medical-400 px-1.5 py-0.5 rounded font-mono font-bold">
            v16.0
          </span>
        </div>

        {/* 3 Sub-Tabs: Preset Library, Guided Builder, AI Parser */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-900 text-[10px]">
          <button
            onClick={() => setActiveTab('preset')}
            className={`py-1 rounded font-bold transition-all ${
              activeTab === 'preset'
                ? 'bg-medical-500/20 text-medical-300 border border-medical-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`py-1 rounded font-bold transition-all ${
              activeTab === 'builder'
                ? 'bg-medical-500/20 text-medical-300 border border-medical-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Builder
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-1 rounded font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'ai'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            AI Parser
          </button>
        </div>
      </div>

      {/* TAB 1: PRESET SCENARIO LIBRARY */}
      {activeTab === 'preset' && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-medical-400" />
            Clinical Scenario Library
          </h3>
          <div className="flex flex-col gap-2">
            {presetCases.map(c => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-medical-500/50 hover:bg-slate-900/30 transition-all flex flex-col gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl bg-slate-900 p-2 rounded-xl border border-slate-800/80">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-200">{c.name}</div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold border ${
                        c.difficulty === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        c.difficulty === 'Advanced' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-medical-500/10 text-medical-400 border-medical-500/30'
                      }`}>
                        {c.difficulty}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{c.desc}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] border-t border-slate-900/80 pt-2 text-slate-500 font-mono">
                  <span>Recommended: <strong className="text-slate-300">{c.lod}</strong></span>
                  <button
                    onClick={() => onLoadPreset(c)}
                    className="px-2.5 py-1 bg-medical-500/20 hover:bg-medical-500/30 border border-medical-500/40 text-medical-300 font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Play className="w-3 h-3 fill-medical-300" />
                    Launch Scenario
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GUIDED SCENARIO BUILDER */}
      {activeTab === 'builder' && (
        <div className="flex flex-col gap-2.5 text-[10px]">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-medical-400" />
            Guided Event Construction
          </h3>

          <div className="space-y-2">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Trauma Mechanism</label>
              <select
                value={traumaCategory}
                onChange={(e) => setTraumaCategory(e.target.value)}
                className="glass-input w-full py-1 text-xs"
              >
                <option value="penetrating">Penetrating (Stab / Laceration)</option>
                <option value="blunt">Blunt Force Impact</option>
                <option value="burn">Thermal Burn</option>
                <option value="chemical">Chemical / Toxic</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Target Anatomical Region</label>
              <select
                value={traumaLocation}
                onChange={(e) => setTraumaLocation(e.target.value)}
                className="glass-input w-full py-1 text-xs"
              >
                <option value="left_abdomen">Left Abdomen (Renal / Splenic)</option>
                <option value="chest_left">Thoracic Left (Pulmonary / Cardiac)</option>
                <option value="femur_left">Left Femur (Femoral Artery)</option>
                <option value="cranium">Cranium (Neurological)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Penetration Depth (cm)</label>
                <input
                  type="number"
                  value={traumaDepth}
                  onChange={(e) => setTraumaDepth(parseFloat(e.target.value) || 1)}
                  className="glass-input w-full py-1 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Weapon / Instrument</label>
                <select
                  value={traumaWeapon}
                  onChange={(e) => setTraumaWeapon(e.target.value)}
                  className="glass-input w-full py-1 text-xs"
                >
                  <option value="knife">Tactical Knife</option>
                  <option value="shrapnel">Metallic Shrapnel</option>
                  <option value="blunt_rod">Blunt Heavy Bar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-2 rounded-xl border border-slate-900 font-mono text-[9px] text-slate-400 space-y-1">
            <div className="text-medical-400 font-bold uppercase tracking-wider">Generated Event Queue:</div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <ChevronRight className="w-3 h-3 text-red-400" />
              <span>TraumaEvent: {traumaCategory} ({traumaLocation}, {traumaDepth}cm)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <ChevronRight className="w-3 h-3 text-red-400" />
              <span>HemorrhageEvent: Active Bleed (Est. 150 mL/min)</span>
            </div>
          </div>

          <button
            onClick={() => onTriggerInjury('bleeding')}
            className="w-full py-2 bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 text-red-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            Inject Constructed Events
          </button>
        </div>
      )}

      {/* TAB 3: AI NATURAL LANGUAGE SCENARIO PARSER */}
      {activeTab === 'ai' && (
        <div className="flex flex-col gap-2.5 text-[10px]">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI Clinical Scenario Prompt
          </h3>

          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={4}
            className="glass-input w-full p-2 text-xs font-sans leading-relaxed resize-none"
            placeholder="Type clinical scenario description in natural language..."
          />

          <button
            onClick={handleParseAI}
            className="w-full py-2 bg-purple-950/40 border border-purple-900/60 hover:bg-purple-900/40 text-purple-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Parse Natural Language Prompt
          </button>

          {/* AI SCENARIO DRAFT PREVIEW */}
          {aiDraft && (
            <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  ScenarioDraft Preview
                </span>
                <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                  Confidence: {Math.round(aiDraft.confidence * 100)}%
                </span>
              </div>

              <div className="space-y-1 font-mono text-[9px] text-slate-300">
                {aiDraft.events.map((e, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{e}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-1 text-[8px] font-mono bg-slate-900/60 p-1.5 rounded-lg border border-slate-800 text-center">
                <div><span className="text-slate-500 block">HR</span><strong className="text-red-400">{aiDraft.vitals.hr}</strong></div>
                <div><span className="text-slate-500 block">BP</span><strong className="text-amber-400">{aiDraft.vitals.bp}</strong></div>
                <div><span className="text-slate-500 block">RR</span><strong className="text-red-400">{aiDraft.vitals.rr}</strong></div>
                <div><span className="text-slate-500 block">SpO₂</span><strong className="text-red-400">{aiDraft.vitals.spo2}%</strong></div>
              </div>

              <button
                onClick={handleConfirmAIDraft}
                className="w-full py-1.5 bg-emerald-950/40 border border-emerald-900/60 hover:bg-emerald-900/40 text-emerald-300 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all mt-1"
              >
                <Play className="w-3 h-3 fill-emerald-300" />
                Confirm & Launch AI Session
              </button>
            </div>
          )}
        </div>
      )}

      {/* QUICK PATIENT EHR PROFILE PREVIEW AT BOTTOM */}
      <div className="mt-auto border-t border-slate-900 pt-2.5 text-[9px]">
        <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
          <span>Active Patient Baseline</span>
          <span className="font-mono text-slate-500">{profile.composition.age}yo {profile.composition.sex.toUpperCase()}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 font-mono text-[8px] text-slate-400 bg-slate-950 p-1.5 rounded-lg border border-slate-900">
          <div>Weight: <strong className="text-slate-200">{profile.composition.weightKg}kg</strong></div>
          <div>Height: <strong className="text-slate-200">{profile.composition.heightCm}cm</strong></div>
          <div>BMI: <strong className="text-slate-200">{profile.composition.bmi}</strong></div>
        </div>
      </div>
    </div>
  );
};
