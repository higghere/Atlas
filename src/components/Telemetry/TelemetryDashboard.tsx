import React, { useState } from 'react';
import { LabReport, Blood, OrganNode } from '../../types/physiology';
import { ExplainerEngine } from '../../engine/AI/ExplainerEngine';
import { Line } from 'react-chartjs-2';
import { FileText, BrainCircuit, Activity, ListCollapse, Stethoscope, ShieldAlert, Zap, Heart, Activity as PulseIcon } from 'lucide-react';
import { ClinicalTimeFormatter } from '../../utils/clinicalTimeFormatter';

interface TelemetryDashboardProps {
  blood: Blood;
  organs: Record<string, OrganNode>;
  history: any[];
  currentLabs: LabReport | null;
  onOrderLabs: () => void;
  logs: string[];
  isDeceased?: boolean;
  clinicalDeathCause?: string;
  clinicalDeathTime?: string;
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  blood,
  organs,
  history,
  currentLabs,
  onOrderLabs,
  logs,
  isDeceased,
  clinicalDeathCause,
  clinicalDeathTime
}) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'status' | 'labs' | 'explainer' | 'timeline'>('vitals');
  const [explainQuery, setExplainQuery] = useState('');
  const [explainResult, setExplainResult] = useState<{ title: string; steps: string[]; warning: string | null } | null>(null);

  const handleExplain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!explainQuery.trim()) return;
    const res = ExplainerEngine.explainQuery(explainQuery, blood, organs);
    setExplainResult(res);
  };

  // Compile last 15 history ticks
  const recentHistory = history.slice(-15);
  const chartLabels = recentHistory.map(h => `Tick ${h.tick}`);

  const isLight = document.body.classList.contains('theme-light');
  const buildChartOptions = (title: string, color: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 6, bottom: 6, left: 6, right: 6 }
    },
    plugins: {
      legend: { display: false },
      title: { 
        display: true, 
        text: title.toUpperCase(), 
        color: isLight ? '#0284c7' : '#00D4FF', 
        font: { size: 10, weight: 'bold' as const, family: 'monospace' } 
      }
    },
    scales: {
      x: { display: false },
      y: {
        grid: { color: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: isLight ? '#475569' : '#64748b', font: { size: 9, family: 'monospace' } }
      }
    }
  });

  const getVitalDataset = (label: string, data: number[], color: string) => ({
    labels: chartLabels,
    datasets: [{
      label,
      data,
      borderColor: color,
      backgroundColor: `${color}15`,
      tension: 0.25,
      borderWidth: 2,
      pointRadius: 1.5,
      pointHoverRadius: 3
    }]
  });

  // Extract separate streams for vitals
  const hrData = recentHistory.map(h => {
    const hr = 70 + (h.blood.substances.adrenaline * 0.05) + (h.organs.heart.temporary.stress * 0.3);
    return Math.round(hr);
  });
  
  const bpData = recentHistory.map(h => {
    const rawCo = h.organs.heart.temporary.bloodSupply;
    const co = (rawCo && rawCo > 1000) ? rawCo : 4900;
    const adrenalineVasoconstriction = 1 + (h.blood.substances.adrenaline / 1000);
    const map = (co / 4900) * 117 * adrenalineVasoconstriction;
    return Math.round(map);
  });

  const o2Data = recentHistory.map(h => Math.round(h.blood.substances.oxygen));
  const tempData = recentHistory.map(h => parseFloat(h.blood.substances.heat.toFixed(1)));

  // Extract key simulation logs (filtering to show event timeline)
  const timelineEvents = logs.filter(log =>
    log.includes('triggered') ||
    log.includes('Condition') ||
    log.includes('ischemia') ||
    log.includes('metabolized') ||
    log.includes('shock') ||
    log.includes('compensate') ||
    log.includes('restored') ||
    log.includes('hypoxia')
  ).slice(-8); // show last 8 events in vertical chain

  return (
    <div className="glass-panel p-3.5 flex flex-col h-full overflow-hidden font-sans">
      {/* Navigation tabs with cyan active underline */}
      <div className="flex border-b border-slate-900 mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <button
          onClick={() => setActiveTab('vitals')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all relative ${
            activeTab === 'vitals' ? 'border-[#00D4FF] text-[#00D4FF] bg-[#00D4FF]/10 font-black shadow-sm' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Vitals
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all relative ${
            activeTab === 'status' ? 'border-[#00D4FF] text-[#00D4FF] bg-[#00D4FF]/10 font-black shadow-sm' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          Body Status
        </button>
        <button
          onClick={() => setActiveTab('labs')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all relative ${
            activeTab === 'labs' ? 'border-[#00D4FF] text-[#00D4FF] bg-[#00D4FF]/10 font-black shadow-sm' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Labs Panel
        </button>
        <button
          onClick={() => setActiveTab('explainer')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all relative ${
            activeTab === 'explainer' ? 'border-[#00D4FF] text-[#00D4FF] bg-[#00D4FF]/10 font-black shadow-sm' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          Study AI
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all relative ${
            activeTab === 'timeline' ? 'border-[#00D4FF] text-[#00D4FF] bg-[#00D4FF]/10 font-black shadow-sm' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <ListCollapse className="w-3.5 h-3.5" />
          Events
        </button>
      </div>

      {/* Content panel */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* VITALS MONITORS (Point 6 & v21.1 Clinical Death) */}
        {activeTab === 'vitals' && (
          <div className="flex flex-col gap-2.5 h-full">
            {/* Clinical Death Info Panel & Outcome Summary Card (v21.2) */}
            {isDeceased && (
              <div className="flex flex-col gap-2">
                {/* Outcome Summary Card */}
                <div className="p-3 bg-slate-950/80 border border-red-900/60 rounded-xl flex flex-col gap-2 font-mono text-[9px] shadow-xl">
                  <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider border-b border-slate-900 pb-1 flex justify-between">
                    <span>OUTCOME SUMMARY</span>
                    <span className="text-red-500">✖ Patient Deceased</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
                    <div>Cause: <strong className="text-slate-100">{clinicalDeathCause || 'Hemorrhagic Shock'}</strong></div>
                    <div>Survival Time: <strong className="text-slate-100">12 min 43 sec</strong></div>
                    <div>Est. Blood Loss: <strong className="text-red-400">2.6 L</strong></div>
                    <div>Lowest MAP: <strong className="text-amber-400">18 mmHg</strong></div>
                    <div>Lowest SpO₂: <strong className="text-red-400">41%</strong></div>
                    <div>Peak Lactate: <strong className="text-red-400">12.4 mmol/L</strong></div>
                  </div>
                  <div className="text-[8px] text-slate-400 border-t border-slate-900 pt-1 flex justify-between">
                    <span>Interventions: <strong>6 attempted</strong> / <strong className="text-emerald-400">2 successful</strong></span>
                  </div>
                </div>

                {/* Live Status Summary */}
                <div className="p-2.5 bg-red-950/30 border border-red-900/40 rounded-lg flex flex-col gap-1 font-mono text-[9px]">
                  <div className="flex items-center justify-between text-red-400 font-bold border-b border-red-900/40 pb-1">
                    <span>CLINICAL STATUS OBSERVER</span>
                    <span>Declared at: {clinicalDeathTime || '08:43:17'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-slate-300">
                    <div>Cardiac Rhythm: <strong className="text-red-300">Asystole</strong></div>
                    <div>Brain Status: <strong className="text-red-300">Brain Death</strong></div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Heart Rate monitor */}
              <div className="bg-slate-950/80 p-3 border-2 border-slate-800/80 rounded-2xl flex flex-col h-38 relative shadow-lg shadow-black/40 hover:border-red-500/40 transition-all">
                <div className="flex justify-between items-start border-b border-slate-900 pb-1.5">
                  <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Heart Rate</span>
                  <span className="text-sm font-black text-red-500 font-mono tracking-widest">
                    {isDeceased ? 0 : (hrData[hrData.length - 1] || 70)} <span className="text-[9px] font-semibold text-slate-400">BPM</span>
                  </span>
                </div>
                <div className="flex-1 w-full h-full min-h-[96px] mt-1.5">
                  <Line data={getVitalDataset('HR', isDeceased ? hrData.map(() => 0) : hrData, '#ef4444')} options={buildChartOptions('HR wave', '#ef4444')} />
                </div>
              </div>

              {/* Blood Pressure monitor */}
              <div className="bg-slate-950/80 p-3 border-2 border-slate-800/80 rounded-2xl flex flex-col h-38 relative shadow-lg shadow-black/40 hover:border-blue-500/40 transition-all">
                <div className="flex justify-between items-start border-b border-slate-900 pb-1.5">
                  <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Blood Pressure</span>
                  <span className="text-sm font-black text-blue-400 font-mono tracking-widest">
                    {isDeceased ? '0/0' : (bpData[bpData.length - 1] ? `${Math.round(bpData[bpData.length - 1] * 1.05)}/${Math.round(bpData[bpData.length - 1] * 0.7)}` : '120/80')}{' '}
                    <span className="text-[9px] font-semibold text-slate-400">mmHg</span>
                  </span>
                </div>
                <div className="flex-1 w-full h-full min-h-[96px] mt-1.5">
                  <Line data={getVitalDataset('BP', isDeceased ? bpData.map(() => 0) : bpData, '#3b82f6')} options={buildChartOptions('BP wave', '#3b82f6')} />
                </div>
              </div>

              {/* Oxygen saturation monitor */}
              <div className="bg-slate-950/80 p-3 border-2 border-slate-800/80 rounded-2xl flex flex-col h-38 relative shadow-lg shadow-black/40 hover:border-emerald-500/40 transition-all">
                <div className="flex justify-between items-start border-b border-slate-900 pb-1.5">
                  <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Oxygenation</span>
                  <span className="text-sm font-black text-emerald-400 font-mono tracking-widest">{isDeceased ? 0 : (o2Data[o2Data.length - 1] || 98)}% <span className="text-[9px] font-semibold text-slate-400">SpO₂</span></span>
                </div>
                <div className="flex-1 w-full h-full min-h-[96px] mt-1.5">
                  <Line data={getVitalDataset('O2', isDeceased ? o2Data.map(() => 0) : o2Data, '#10b981')} options={buildChartOptions('O2 saturation', '#10b981')} />
                </div>
              </div>

              {/* Temperature monitor */}
              <div className="bg-slate-950/80 p-3 border-2 border-slate-800/80 rounded-2xl flex flex-col h-38 relative shadow-lg shadow-black/40 hover:border-amber-500/40 transition-all">
                <div className="flex justify-between items-start border-b border-slate-900 pb-1.5">
                  <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Temperature</span>
                  <span className="text-sm font-black text-amber-500 font-mono tracking-widest">{(tempData[tempData.length - 1] || 37.0).toFixed(1)}° <span className="text-[9px] font-semibold text-slate-400">C</span></span>
                </div>
                <div className="flex-1 w-full h-full min-h-[90px] mt-1">
                  <Line data={getVitalDataset('TEMP', tempData, '#f59e0b')} options={buildChartOptions('Core Temperature', '#f59e0b')} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIVE BODY STATUS & ORGAN FUNCTIONAL RESERVES (v22.1) */}
        {activeTab === 'status' && (() => {
          const mapVal = isDeceased ? 0 : ((blood as any)?.pressure?.map ?? 93.33);
          const brainHealth = isDeceased ? 0 : Math.round(organs['brain']?.temporary?.health ?? (mapVal < 40 ? 32 : 95));
          const heartHealth = isDeceased ? 0 : Math.round(organs['heart']?.temporary?.health ?? (mapVal < 50 ? 45 : 92));
          const lungHealth = isDeceased ? 0 : Math.round(organs['lungs_l']?.temporary?.health ?? 98);
          const kidneyHealth = isDeceased ? 0 : Math.round(organs['kidney_l']?.temporary?.health ?? (mapVal < 60 ? 58 : 96));
          const liverHealth = isDeceased ? 0 : Math.round(organs['liver']?.temporary?.health ?? 94);
          
          const cellularAtp = isDeceased ? 0 : Math.round(Math.min(100, Math.max(0, (brainHealth + heartHealth + lungHealth) / 3)));

          return (
            <div className="flex flex-col gap-3 font-sans text-xs">
              {/* Systemic Status Overview Header */}
              <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-medical-400" />
                    Systemic Compensatory State
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${
                    isDeceased ? 'bg-red-950/60 text-red-400 border-red-900' :
                    (mapVal < 50 ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' :
                    (mapVal < 75 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'))
                  }`}>
                    {isDeceased ? 'DECEASED' : (mapVal < 50 ? 'CRITICAL DECOMPENSATION' : (mapVal < 75 ? 'COMPENSATING STRESS' : 'STABLE HOMEOSTASIS'))}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                  <div>
                    <span className="text-slate-500 block">Cellular ATP Level</span>
                    <strong className={cellularAtp < 30 ? 'text-red-400' : 'text-emerald-400'}>{cellularAtp}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ischemia Status</span>
                    <strong className={isDeceased || mapVal < 50 ? 'text-red-400' : 'text-slate-300'}>{isDeceased ? 'Complete Failure' : (mapVal < 50 ? 'Hypoperfusion' : 'Normal Flow')}</strong>
                  </div>
                </div>
              </div>

              {/* Organ Functional Reserves (100% -> 0%) */}
              <div className="flex flex-col gap-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-medical-400" />
                  Organ Functional Reserves
                </h3>

                {[
                  { name: 'Brain (Neurological)', key: 'brain', icon: '🧠', reserve: brainHealth, detail: 'CPP: ' + (isDeceased ? 0 : Math.round(mapVal - 10)) + ' mmHg' },
                  { name: 'Myocardium (Heart)', key: 'heart', icon: '❤️', reserve: heartHealth, detail: 'Contractility: ' + (isDeceased ? '0.0' : (heartHealth > 70 ? '1.0x' : '0.6x')) },
                  { name: 'Lungs (Pulmonary)', key: 'lungs', icon: '🫁', reserve: lungHealth, detail: 'Oxygenation: ' + (isDeceased ? 0 : Math.round(organs['lungs_l']?.temporary?.oxygenation ?? 98)) + '%' },
                  { name: 'Kidneys (Renal)', key: 'kidney', icon: '🩸', reserve: kidneyHealth, detail: 'Perfusion: ' + (isDeceased ? 0 : Math.round(organs['kidney_l']?.temporary?.perfusion ?? 90)) + '%' },
                  { name: 'Liver (Hepatic)', key: 'liver', icon: '🧪', reserve: liverHealth, detail: 'Clearance: ' + (isDeceased ? 0 : Math.round(liverHealth)) + '%' }
                ].map((org) => (
                  <div key={org.key} className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span>{org.icon}</span>
                        {org.name}
                      </span>
                      <span className={`font-mono font-bold text-[10px] ${
                        org.reserve < 10 ? 'text-red-500' : (org.reserve < 50 ? 'text-amber-400' : 'text-emerald-400')
                      }`}>
                        {org.reserve}% <span className="text-[8px] text-slate-500 font-normal">Reserve</span>
                      </span>
                    </div>

                    {/* Progress Bar Gauge */}
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          org.reserve < 10 ? 'bg-red-500' : (org.reserve < 50 ? 'bg-amber-500' : 'bg-emerald-500')
                        }`}
                        style={{ width: `${org.reserve}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pt-0.5">
                      <span>{org.detail}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[8px] border ${
                        org.reserve < 10 ? 'bg-red-950/40 text-red-400 border-red-900' : (org.reserve < 50 ? 'bg-amber-950/40 text-amber-400 border-amber-900' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900')
                      }`}>
                        {org.reserve < 10 ? 'FAILURE' : (org.reserve < 50 ? 'SYMPTOMATIC' : 'NORMAL')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* LAB REPORTS EMERGENT */}
        {activeTab === 'labs' && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 border border-slate-900 rounded-lg text-[10px] text-slate-400">
              <span>Order full chemistry panel output from active physiology.</span>
              <button
                onClick={onOrderLabs}
                className="px-3 py-1 bg-medical-600 hover:bg-medical-500 text-white rounded text-[10px] font-semibold transition-all"
              >
                Order Blood Panels
              </button>
            </div>

            {currentLabs ? (
              <div className="bg-slate-950/60 p-3 border border-slate-900 rounded-lg font-mono text-[10px] flex flex-col gap-3 relative shadow-md">
                <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-medical-400 font-bold text-xs tracking-wider">METROPOLITAN LABORATORIES</h4>
                    <span className="text-[8px] text-slate-600 block">Report ID: {currentLabs.id}</span>
                  </div>
                  <div className="text-right text-[8px] text-slate-500">
                    <div>Collected: {currentLabs.timestamp}</div>
                    <div>Tick: {currentLabs.tickNumber}</div>
                  </div>
                </div>

                {/* CBC */}
                <div>
                  <h5 className="font-bold text-slate-400 border-b border-slate-900 pb-0.5 uppercase mb-1">
                    I. CBC Panel
                  </h5>
                  {Object.entries(currentLabs.cbc).slice(0, 3).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-4 py-0.5 border-b border-slate-900/20 text-slate-300">
                      <span className="uppercase text-[9px]">{key}</span>
                      <span className={`text-right font-bold ${
                        val.status === 'high' ? 'text-red-400' : val.status === 'low' ? 'text-blue-400' : 'text-slate-300'
                      }`}>
                        {val.value}
                      </span>
                      <span className="text-right text-slate-600">{val.unit}</span>
                      <span className="text-right text-slate-600">{val.range}</span>
                    </div>
                  ))}
                </div>

                {/* Metabolic */}
                <div>
                  <h5 className="font-bold text-slate-400 border-b border-slate-900 pb-0.5 uppercase mb-1">
                    II. CMP Panel
                  </h5>
                  {Object.entries(currentLabs.metabolic).slice(3, 7).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-4 py-0.5 border-b border-slate-900/20 text-slate-300">
                      <span className="uppercase text-[9px]">{key}</span>
                      <span className={`text-right font-bold ${
                        val.status === 'high' ? 'text-red-400' : val.status === 'low' ? 'text-blue-400' : 'text-slate-300'
                      }`}>
                        {val.value}
                      </span>
                      <span className="text-right text-slate-600">{val.unit}</span>
                      <span className="text-right text-slate-600">{val.range}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-600 text-xs">
                No active lab reports. Click "Order Blood Panels" to generate.
              </div>
            )}
          </div>
        )}

        {/* STUDY AI EXPLAINER */}
        {activeTab === 'explainer' && (
          <div className="flex flex-col gap-3">
            <form onSubmit={handleExplain} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Ask e.g. Why is creatinine high?"
                value={explainQuery}
                onChange={(e) => setExplainQuery(e.target.value)}
                className="glass-input flex-1 text-xs"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-purple-900/40 border border-purple-800 hover:bg-purple-800 text-purple-200 text-xs font-semibold rounded-lg"
              >
                Explain
              </button>
            </form>

            {explainResult ? (
              <div className="bg-slate-950/40 p-3 border border-slate-900 rounded-lg flex flex-col gap-2 animate-fade-in text-xs">
                <div className="font-bold text-purple-400 uppercase border-b border-slate-900 pb-1.5 flex items-center gap-1.5">
                  🧠 AI Case Pathway
                </div>
                <ol className="list-decimal list-inside flex flex-col gap-2 text-slate-300 pl-1 leading-normal text-[11px]">
                  {explainResult.steps.map((step, idx) => (
                    <li key={idx} className="marker:text-purple-400 marker:font-bold">
                      {step}
                    </li>
                  ))}
                </ol>
                {explainResult.warning && (
                  <div className="mt-1.5 p-2 bg-red-950/20 border border-red-900/40 rounded text-red-400 font-semibold text-[10px]">
                    ⚠️ CLINICAL ALERT: {explainResult.warning}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-600 text-xs text-center p-4">
                Ask metabolic/hemodynamic query to trace autonomic compensation loops.
              </div>
            )}
          </div>
        )}

        {/* CHRONOLOGICAL EVENT TIMELINE (Point 13 & v21.3 Acute Formatting) */}
        {activeTab === 'timeline' && (
          <div className="flex flex-col gap-3">
            {timelineEvents.length > 0 ? (
              <div className="relative border-l-2 border-medical-500/30 pl-4 ml-2 flex flex-col gap-4 font-mono text-[10px] text-slate-400 select-text">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="relative">
                    {/* Node indicator */}
                    <div className="absolute -left-[21.5px] top-0.5 w-2.5 h-2.5 rounded-full bg-medical-500 border border-slate-950 shadow-md shadow-medical-500/20" />
                    <div className="text-[9px] font-bold text-medical-400 font-mono">
                      {ClinicalTimeFormatter.formatClinicalTimestamp(idx * 35)}
                    </div>
                    <div className="text-slate-300 leading-normal mt-0.5">
                      {event.replace(/\[Tick \d+\] /g, '')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-600 text-xs">
                Timeline is currently empty. Run simulation ticks to record events.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
