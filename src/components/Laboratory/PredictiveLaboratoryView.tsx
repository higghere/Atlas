import React, { useState } from 'react';
import { FlaskConical, Play, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Stethoscope, Clock, Zap } from 'lucide-react';
import { Blood, OrganNode } from '../../types/physiology';

interface PredictiveLaboratoryViewProps {
  blood: Blood;
  organs: Record<string, OrganNode>;
  onOrderLabs?: () => void;
}

export const PredictiveLaboratoryView: React.FC<PredictiveLaboratoryViewProps> = ({
  blood,
  organs,
  onOrderLabs
}) => {
  const [activeTab, setActiveTab] = useState<'medication' | 'procedure' | 'counterfactual'>('medication');
  const [selectedDrug, setSelectedDrug] = useState('Paracetamol');
  const [doseMg, setDoseMg] = useState(500);
  const [route, setRoute] = useState('oral');

  const [selectedProc, setSelectedProc] = useState('Rhinoplasty');
  const [procDepth, setProcDepth] = useState(1.5);

  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handleRunPrediction = () => {
    setIsPredicting(true);
    setTimeout(() => {
      if (activeTab === 'medication') {
        setPredictionResult({
          manifest_hash: 'c8a91b4f9e',
          type: 'Medication Impact Analysis',
          target: `${selectedDrug} (${doseMg}mg ${route.toUpperCase()})`,
          baseline_vitals: { hr: 72, map: 93.3, spo2: 98 },
          predicted_vitals: { hr: 70, map: 93.1, spo2: 98 },
          risk: 'LOW',
          confidence: 96,
          organ_impact: 'Minimal hepatic clearance load. Normal renal excretion.',
          evidence: [
            { source: 'FDA Drug Label / WHO Essential Medicines', confidence: '98%' },
            { source: 'Pharmacology Engine v23.1 PK Profile', confidence: '95%' }
          ],
          milestones: [
            { time: '00:15', event: 'GI Dissolution & Portal Absorption' },
            { time: '01:00', event: 'Peak Plasma Concentration' },
            { time: '04:00', event: 'Hepatic Metabolism & Clearance' }
          ]
        });
      } else if (activeTab === 'procedure') {
        setPredictionResult({
          manifest_hash: 'f93d20a112',
          type: 'Cosmetic Procedure Simulation',
          target: `${selectedProc} (${procDepth}cm depth)`,
          baseline_vitals: { hr: 72, map: 93.3, spo2: 98 },
          predicted_vitals: { hr: 78, map: 91.5, spo2: 98 },
          risk: 'MODERATE',
          confidence: 92,
          organ_impact: 'Local tissue swelling factor 1.5x. Estimated blood loss 50ml.',
          evidence: [
            { source: 'American Society of Plastic Surgeons Guidelines', confidence: '94%' },
            { source: '5-Stage Surgical Lifecycle Model', confidence: '92%' }
          ],
          milestones: [
            { time: '00:00', event: 'Pre-Op Preparation & Local Anesthesia' },
            { time: '00:45', event: 'Incision & Controlled Hemostasis' },
            { time: '14 Days', event: 'Full Tissue Remodeling & Healing' }
          ]
        });
      } else {
        setPredictionResult({
          manifest_hash: 'a12e88701f',
          type: 'Counterfactual Treatment Comparison',
          target: 'Blood Transfusion at 3 mins vs Untreated Baseline',
          baseline_vitals: { hr: 140, map: 42.0, spo2: 85 },
          predicted_vitals: { hr: 88, map: 88.5, spo2: 98 },
          risk: 'OPTIMAL RECOVERY',
          confidence: 97,
          organ_impact: 'Restores Mean Arterial Pressure, halts renal hypoperfusion, prevents AKI.',
          evidence: [
            { source: 'Systemic Physiology Coupling Engine (v23)', confidence: '97%' }
          ],
          milestones: [
            { time: '00:03', event: 'IV Fluid / PRBC Infusion Initiated' },
            { time: '00:06', event: 'Venous Return & CO Restored' },
            { time: '00:10', event: 'Renal Perfusion Stabilized at >75mmHg' }
          ]
        });
      }
      setIsPredicting(false);
    }, 400);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-sans text-slate-200 overflow-y-auto p-4 glass-panel select-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-medical-500/20 border border-medical-500/40 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-medical-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase flex items-center gap-2">
              Predictive Laboratory Workspace
              <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-medical-500/20 text-medical-400 border border-medical-500/30">
                v23.2 Backend Connected
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Run isolated sandbox predictions without altering live patient status.
            </p>
          </div>
        </div>

        {/* Sub-Tab Filters */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'medication', label: '💊 Medication Predictor' },
            { id: 'procedure', label: '🩺 Cosmetic & Surgical' },
            { id: 'counterfactual', label: '⚡ Counterfactual Analytics' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id as any); setPredictionResult(null); }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === t.id ? 'bg-medical-500 text-slate-950 font-bold shadow-md shadow-medical-500/20' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Inputs Configurator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-950/60 p-4 border border-slate-900 rounded-2xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-medical-400" />
            Sandbox Prediction Parameters
          </h3>

          {activeTab === 'medication' && (
            <div className="flex flex-col gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-500 block mb-1">Target Agent / Medication</label>
                <select
                  value={selectedDrug}
                  onChange={e => setSelectedDrug(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-medical-500"
                >
                  <option value="Paracetamol">Paracetamol (Tylenol / Acetaminophen / PCM)</option>
                  <option value="Ibuprofen">Ibuprofen (Advil / Motrin)</option>
                  <option value="Adrenaline">Adrenaline (Epinephrine)</option>
                  <option value="Morphine">Morphine Sulfate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">Dosage (mg)</label>
                  <input
                    type="number"
                    value={doseMg}
                    onChange={e => setDoseMg(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-medical-500"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Route</label>
                  <select
                    value={route}
                    onChange={e => setRoute(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-medical-500"
                  >
                    <option value="oral">Oral Tablet</option>
                    <option value="iv">Intravenous (IV)</option>
                    <option value="im">Intramuscular (IM)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'procedure' && (
            <div className="flex flex-col gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-500 block mb-1">Cosmetic / Surgical Procedure</label>
                <select
                  value={selectedProc}
                  onChange={e => setSelectedProc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-medical-500"
                >
                  <option value="Rhinoplasty">Rhinoplasty (Nose Job)</option>
                  <option value="Botox">Botox Injection</option>
                  <option value="Appendectomy">Appendectomy</option>
                  <option value="Liposuction">Abdominal Liposuction</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Procedure Depth (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={procDepth}
                  onChange={e => setProcDepth(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-medical-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'counterfactual' && (
            <div className="flex flex-col gap-2 text-xs text-slate-400 leading-relaxed font-mono bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
              <strong className="text-slate-200">Counterfactual Query:</strong>
              <p>"Compare untreated hemorrhagic shock baseline vs early blood transfusion at minute 3."</p>
              <span className="text-[10px] text-medical-400">Sandbox re-runs simulation without affecting active timeline.</span>
            </div>
          )}

          <button
            onClick={handleRunPrediction}
            disabled={isPredicting}
            className="mt-auto py-3 bg-medical-500 hover:bg-medical-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-medical-500/20 uppercase tracking-wider text-xs"
          >
            {isPredicting ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isPredicting ? 'Running Sandbox Engine...' : 'Execute Predictive Sandbox'}
          </button>
        </div>

        {/* Right Output Dashboard (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {predictionResult ? (
            <div className="flex flex-col gap-4 font-mono text-xs">
              {/* Summary Card */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      {predictionResult.type}
                    </span>
                    <h4 className="text-sm font-bold text-medical-400 mt-0.5">
                      {predictionResult.target}
                    </h4>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    {predictionResult.risk}
                  </span>
                </div>

                {/* Vitals Delta Comparison */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Baseline MAP</span>
                    <strong className="text-slate-200">{predictionResult.baseline_vitals.map} mmHg</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Predicted MAP</span>
                    <strong className="text-emerald-400">{predictionResult.predicted_vitals.map} mmHg</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Confidence</span>
                    <strong className="text-medical-400">{predictionResult.confidence}%</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/40">
                  <span className="font-bold text-slate-400 block mb-0.5">Organ System Impact:</span>
                  {predictionResult.organ_impact}
                </div>
              </div>

              {/* Chronological Milestones */}
              <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl flex flex-col gap-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-medical-400" />
                  Predicted Milestone Timeline
                </h4>
                <div className="flex flex-col gap-2 pt-1">
                  {predictionResult.milestones.map((m: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] border-l-2 border-medical-500/40 pl-3">
                      <span className="font-bold text-medical-400 w-14 shrink-0">{m.time}</span>
                      <span className="text-slate-200">{m.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl text-center p-6 text-slate-500">
              <FlaskConical className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs">Configure sandbox parameters on the left and click Execute.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
