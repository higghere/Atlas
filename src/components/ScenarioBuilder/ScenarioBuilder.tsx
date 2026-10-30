import React, { useState, useRef } from 'react';
import { UserProfile } from '../../types/physiology';
import { User, Activity, AlertTriangle, Pill, ShieldAlert, Sparkles, Play, Eye, FileText, CheckCircle2, ChevronRight, Stethoscope, Clock, ShieldCheck, Upload, FileUp, X, RotateCcw } from 'lucide-react';
import { ScenarioParserEngine, ParsedScenarioDraft } from '../../engine/AI/ScenarioParserEngine';
import { OCREngine } from '../../engine/documentIntelligence/OCREngine';

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

  // AI Prompt & Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiPrompt, setAiPrompt] = useState('A 42-year-old diabetic male falls from a motorcycle at high speed, striking the left side of his chest and suffering heavy bleeding from the left thigh.');
  const [aiDraft, setAiDraft] = useState<ParsedScenarioDraft | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

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

  const handleParseAI = (textToParse?: string) => {
    const targetText = textToParse || aiPrompt;
    if (!targetText.trim()) return;
    const parsed = ScenarioParserEngine.parse(targetText);
    setAiDraft(parsed);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploadingFile(true);
    setUploadedFileName(file.name);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      // Direct JSON import
      if (ext === 'json') {
        const text = await file.text();
        try {
          const json = JSON.parse(text);
          if (json.profile || json.events || json.vitals) {
            onLoadPreset(json);
            setAiPrompt(`Imported scenario file: ${file.name}`);
            handleParseAI(JSON.stringify(json));
            return;
          }
        } catch (e) {
          console.warn('[ScenarioBuilder] Could not parse as structured JSON, extracting as raw text.');
        }
      }

      // Process via OCREngine for text extraction (supports txt, docx, pdf, png, jpg)
      const ocr = await OCREngine.processFile(file);
      const extractedText = ocr.text || `Case document: ${file.name}`;
      setAiPrompt(extractedText);
      handleParseAI(extractedText);
    } catch (err) {
      console.error('[ScenarioBuilder] File upload and parsing failed:', err);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleConfirmAIDraft = () => {
    if (!aiDraft) return;

    // Build complete executable scenario payload
    const customScenario = {
      id: `ai_${Date.now()}`,
      name: aiDraft.title,
      icon: aiDraft.icon,
      desc: aiPrompt.slice(0, 100) + (aiPrompt.length > 100 ? '...' : ''),
      difficulty: aiDraft.severity,
      profile: {
        composition: {
          weightKg: aiDraft.demographics.weightKg || profile.composition.weightKg,
          heightCm: profile.composition.heightCm,
          sex: aiDraft.demographics.sex || profile.composition.sex,
          age: aiDraft.demographics.age || profile.composition.age,
          bodyFatPercentage: profile.composition.bodyFatPercentage,
          muscleMassKg: profile.composition.muscleMassKg,
          waterPercentage: profile.composition.waterPercentage,
          boneDensityScore: profile.composition.boneDensityScore,
          bmi: profile.composition.bmi,
          bmr: profile.composition.bmr,
        },
        lifestyle: { ...profile.lifestyle },
        history: {
          diseases: aiDraft.diseases,
          allergies: [],
          surgeries: [],
          medications: []
        }
      },
      injury: aiDraft.hasBleeding ? 'bleeding' : undefined,
      initialVitals: {
        hr: aiDraft.vitals.hr,
        bp: aiDraft.vitals.bp,
        rr: aiDraft.vitals.rr,
        spo2: aiDraft.vitals.spo2,
        bloodVolume: aiDraft.vitals.bloodVolume
      },
      events: aiDraft.events,
      autoPlay: true // Automatically engage real-time simulation step loop
    };

    onLoadPreset(customScenario);
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

      {/* TAB 3: AI NATURAL LANGUAGE SCENARIO PARSER & FILE INGESTION */}
      {activeTab === 'ai' && (
        <div className="flex flex-col gap-2.5 text-[10px]">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Clinical Scenario & File Parser
            </h3>
            <span className="text-[9px] font-mono text-purple-400 font-bold bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-900/50">
              AI NLP
            </span>
          </div>

          {/* Dedicated File Upload Zone for Simulation Tab */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
                e.target.value = '';
              }
            }}
            accept=".txt,.json,.pdf,.docx,.doc,.png,.jpg,.jpeg"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-purple-500/30 hover:border-purple-400/60 bg-purple-950/20 hover:bg-purple-950/30 p-2.5 rounded-xl cursor-pointer text-center transition-all flex flex-col items-center gap-1.5"
          >
            <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
              {isUploadingFile ? (
                <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
              ) : (
                <Upload className="w-4 h-4 text-purple-400" />
              )}
              <span>{isUploadingFile ? 'Processing Document...' : 'Upload Case File or EHR Document'}</span>
            </div>
            <p className="text-[9px] text-slate-400">
              Drop PDF, DOCX, TXT, JSON, or Image to parse clinical text automatically
            </p>
          </div>

          {uploadedFileName && (
            <div className="flex items-center justify-between p-1.5 bg-slate-900/80 border border-purple-500/30 rounded-lg text-[9px] font-mono text-purple-300">
              <span className="flex items-center gap-1.5 truncate">
                <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">{uploadedFileName}</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedFileName(null);
                  setAiPrompt('');
                  setAiDraft(null);
                }}
                className="text-slate-400 hover:text-red-400 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Scenario Text Prompt */}
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={4}
            className="glass-input w-full p-2 text-xs font-sans leading-relaxed resize-none"
            placeholder="Type clinical scenario description, trauma dispatch, or paste EHR narrative..."
          />

          <div className="flex gap-1.5">
            <button
              onClick={() => handleParseAI()}
              className="flex-1 py-2 bg-purple-950/50 border border-purple-900/80 hover:bg-purple-900/50 text-purple-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Parse Scenario Prompt
            </button>
            <button
              onClick={() => {
                const sample = 'A 42-year-old diabetic male falls from a motorcycle at high speed, striking the left side of his chest and suffering heavy bleeding from the left thigh.';
                setAiPrompt(sample);
                handleParseAI(sample);
              }}
              title="Load Sample Case"
              className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI SCENARIO DRAFT PREVIEW */}
          {aiDraft && (
            <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/40 flex flex-col gap-2 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{aiDraft.icon}</span>
                  <div>
                    <span className="font-bold text-xs text-purple-200 block">
                      {aiDraft.title}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono">
                      {aiDraft.demographics.age}yo {aiDraft.demographics.sex.toUpperCase()} • {aiDraft.demographics.weightKg}kg
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase border ${
                    aiDraft.severity === 'Critical' ? 'bg-red-950/80 text-red-400 border-red-800' :
                    aiDraft.severity === 'Severe' ? 'bg-amber-950/80 text-amber-400 border-amber-800' :
                    'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                  }`}>
                    {aiDraft.severity}
                  </span>
                  <span className="text-[8px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                    {Math.round(aiDraft.confidence * 100)}% Match
                  </span>
                </div>
              </div>

              {/* Extracted Events List */}
              <div className="space-y-1 font-mono text-[9px] text-slate-300 max-h-32 overflow-y-auto pr-1">
                {aiDraft.events.map((e, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{e}</span>
                  </div>
                ))}
              </div>

              {/* Target Starting Vitals */}
              <div className="grid grid-cols-4 gap-1 text-[8px] font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
                <div><span className="text-slate-500 block">HR</span><strong className="text-red-400">{aiDraft.vitals.hr}</strong></div>
                <div><span className="text-slate-500 block">BP</span><strong className="text-amber-400">{aiDraft.vitals.bp}</strong></div>
                <div><span className="text-slate-500 block">RR</span><strong className="text-red-400">{aiDraft.vitals.rr}</strong></div>
                <div><span className="text-slate-500 block">SpO₂</span><strong className="text-emerald-400">{aiDraft.vitals.spo2}%</strong></div>
              </div>

              <button
                onClick={handleConfirmAIDraft}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-950/50 mt-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                Launch Real-Time Scenario
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
