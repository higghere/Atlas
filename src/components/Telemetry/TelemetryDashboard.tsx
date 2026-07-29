import React, { useState } from 'react';
import { LabReport, Blood, OrganNode } from '../../types/physiology';
import { ExplainerEngine } from '../../engine/AI/ExplainerEngine';
import { Line } from 'react-chartjs-2';
import { FileText, BrainCircuit, Activity, ListCollapse } from 'lucide-react';

interface TelemetryDashboardProps {
  blood: Blood;
  organs: Record<string, OrganNode>;
  history: any[];
  currentLabs: LabReport | null;
  onOrderLabs: () => void;
  logs: string[];
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  blood,
  organs,
  history,
  currentLabs,
  onOrderLabs,
  logs
}) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'labs' | 'explainer' | 'timeline'>('vitals');
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

  const buildChartOptions = (title: string, color: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title, color: '#94a3b8', font: { size: 9, weight: 'bold' as const } }
    },
    scales: {
      x: { display: false },
      y: {
        grid: { color: 'rgba(30, 41, 59, 0.4)' },
        ticks: { color: '#475569', font: { size: 8 } }
      }
    }
  });

  const getVitalDataset = (label: string, data: number[], color: string) => ({
    labels: chartLabels,
    datasets: [{
      label,
      data,
      borderColor: color,
      backgroundColor: `${color}10`,
      tension: 0.25,
      borderWidth: 1.5,
      pointRadius: 1
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
      {/* Navigation tabs */}
      <div className="flex border-b border-slate-900 mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <button
          onClick={() => setActiveTab('vitals')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
            activeTab === 'vitals' ? 'border-medical-500 text-medical-400 bg-slate-900/10' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Live Telemetry
        </button>
        <button
          onClick={() => setActiveTab('labs')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
            activeTab === 'labs' ? 'border-medical-500 text-medical-400 bg-slate-900/10' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Labs Panel
        </button>
        <button
          onClick={() => setActiveTab('explainer')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
            activeTab === 'explainer' ? 'border-medical-500 text-medical-400 bg-slate-900/10' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          Study AI
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
            activeTab === 'timeline' ? 'border-medical-500 text-medical-400 bg-slate-900/10' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <ListCollapse className="w-3.5 h-3.5" />
          Event Timeline
        </button>
      </div>

      {/* Content panel */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* VITALS MONITORS (Point 6) */}
        {activeTab === 'vitals' && (
          <div className="grid grid-cols-2 gap-2 h-full min-h-[300px]">
            {/* Heart Rate monitor */}
            <div className="bg-slate-950/40 p-2 border border-slate-900 rounded-lg flex flex-col h-32 relative">
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Heart Rate</span>
                <span className="text-sm font-black text-red-500 font-mono tracking-widest">{hrData[hrData.length - 1] || 70} <span className="text-[8px] font-normal text-slate-600">BPM</span></span>
              </div>
              <div className="flex-1 mt-1">
                <Line data={getVitalDataset('HR', hrData, '#ef4444')} options={buildChartOptions('HR wave', '#ef4444')} />
              </div>
            </div>

            {/* Blood Pressure monitor */}
            <div className="bg-slate-950/40 p-2 border border-slate-900 rounded-lg flex flex-col h-32 relative">
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Blood Pressure</span>
                <span className="text-sm font-black text-blue-400 font-mono tracking-widest">
                  {bpData[bpData.length - 1] ? `${Math.round(bpData[bpData.length - 1] * 1.05)}/${Math.round(bpData[bpData.length - 1] * 0.7)}` : '120/80'}{' '}
                  <span className="text-[8px] font-normal text-slate-600">mmHg</span>
                </span>
              </div>
              <div className="flex-1 mt-1">
                <Line data={getVitalDataset('BP', bpData, '#3b82f6')} options={buildChartOptions('BP wave', '#3b82f6')} />
              </div>
            </div>

            {/* Oxygen saturation monitor */}
            <div className="bg-slate-950/40 p-2 border border-slate-900 rounded-lg flex flex-col h-32 relative">
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Oxygenation</span>
                <span className="text-sm font-black text-emerald-400 font-mono tracking-widest">{o2Data[o2Data.length - 1] || 98}% <span className="text-[8px] font-normal text-slate-600">SpO₂</span></span>
              </div>
              <div className="flex-1 mt-1">
                <Line data={getVitalDataset('O2', o2Data, '#10b981')} options={buildChartOptions('O2 saturation', '#10b981')} />
              </div>
            </div>

            {/* Temperature monitor */}
            <div className="bg-slate-950/40 p-2 border border-slate-900 rounded-lg flex flex-col h-32 relative">
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Temperature</span>
                <span className="text-sm font-black text-amber-500 font-mono tracking-widest">{(tempData[tempData.length - 1] || 37.0).toFixed(1)}° <span className="text-[8px] font-normal text-slate-600">C</span></span>
              </div>
              <div className="flex-1 mt-1">
                <Line data={getVitalDataset('TEMP', tempData, '#f59e0b')} options={buildChartOptions('Core Temperature', '#f59e0b')} />
              </div>
            </div>
          </div>
        )}

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

        {/* CHRONOLOGICAL EVENT TIMELINE (Point 13) */}
        {activeTab === 'timeline' && (
          <div className="flex flex-col gap-3">
            {timelineEvents.length > 0 ? (
              <div className="relative border-l-2 border-medical-500/30 pl-4 ml-2 flex flex-col gap-4 font-mono text-[10px] text-slate-400 select-text">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="relative">
                    {/* Node indicator */}
                    <div className="absolute -left-[21.5px] top-0.5 w-2.5 h-2.5 rounded-full bg-medical-500 border border-slate-950 shadow-md shadow-medical-500/20" />
                    <div className="text-[9px] font-bold text-medical-400">
                      {new Date().toLocaleTimeString()}
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
