import React, { useState, useEffect, useRef } from 'react';
import { SimulationClock } from './engine/core/SimulationClock';
import { UserProfile, LabReport } from './types/physiology';
import { AnatomyViewer } from './components/AnatomyViewer/AnatomyViewer';
import { ScenarioBuilder } from './components/ScenarioBuilder/ScenarioBuilder';
import { SimulationControls } from './components/SimulationControls/SimulationControls';
import { TelemetryDashboard } from './components/Telemetry/TelemetryDashboard';
import { Heart, Activity, LineChart, Shield, Info, AlertTriangle } from 'lucide-react';
import { Line } from 'react-chartjs-2';

export default function App() {
  const clockRef = useRef<SimulationClock>(new SimulationClock());
  
  // React state mirror
  const [tickCount, setTickCount] = useState(0);
  const [blood, setBlood] = useState(clockRef.current.blood);
  const [organs, setOrgans] = useState(clockRef.current.organs);
  const [systems, setSystems] = useState(clockRef.current.systems);
  const [logs, setLogs] = useState(clockRef.current.logs);
  const [activeMeds, setActiveMeds] = useState(clockRef.current.activeMeds);
  const [activeDisease, setActiveDisease] = useState(clockRef.current.activeDisease);
  
  const [selectedOrganId, setSelectedOrganId] = useState<string | null>(null);
  const [activeSystemId, setActiveSystemId] = useState('all');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [studyMode, setStudyMode] = useState(true);
  const [currentLabs, setCurrentLabs] = useState<LabReport | null>(null);

  // Comparison states
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonData, setComparisonData] = useState<{
    labels: number[];
    baseline: number[];
    intervention: number[];
  } | null>(null);

  const syncWithEngine = () => {
    const clock = clockRef.current;
    setTickCount(clock.tickCount);
    setBlood({ ...clock.blood });
    setOrgans({ ...clock.organs });
    setSystems({ ...clock.systems });
    setLogs([...clock.logs]);
    setActiveMeds({ ...clock.activeMeds });
    setActiveDisease(clock.activeDisease);
  };

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        clockRef.current.step();
        syncWithEngine();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const handleStep = () => {
    clockRef.current.step();
    syncWithEngine();
  };

  const handleReset = () => {
    setIsPlaying(false);
    clockRef.current.resetToHealthy();
    syncWithEngine();
    setCurrentLabs(null);
    setComparisonData(null);
  };

  const handleSeek = (tick: number) => {
    setIsPlaying(false);
    clockRef.current.restoreTick(tick);
    syncWithEngine();
  };

  const handleProfileChange = (updatedProfile: UserProfile) => {
    clockRef.current.lifestyle = updatedProfile.lifestyle;
    syncWithEngine();
  };

  const handleSelectDisease = (diseaseId: string | null) => {
    clockRef.current.activeDisease = diseaseId;
    clockRef.current.activeDiseaseSeverity = diseaseId ? 0.3 : 0.0;
    clockRef.current.logs.push(diseaseId ? `Active pathology added: ${diseaseId}` : `Cleared active pathologies.`);
    syncWithEngine();
  };

  const handleTriggerInjury = (injuryId: string) => {
    clockRef.current.triggerInjury(injuryId);
    syncWithEngine();
  };

  const handleAdministerMedication = (medId: string, dose: number) => {
    clockRef.current.administerMedication(medId, dose);
    syncWithEngine();
  };

  const handleLoadPreset = (scenario: any) => {
    setIsPlaying(false);
    clockRef.current.loadScenario(scenario);
    syncWithEngine();
    setCurrentLabs(null);
  };

  const handleOrderLabs = () => {
    const labs = clockRef.current.getLabReport();
    setCurrentLabs(labs);
  };

  // Run comparative trial forecast
  const handleRunComparison = () => {
    setIsComparing(true);
    const simA = new SimulationClock();
    simA.activeDisease = clockRef.current.activeDisease || 'diabetes';
    simA.activeDiseaseSeverity = 0.4;
    simA.lifestyle = { smoking: 'none', alcohol: 'none', exercise: 'sedentary', sleep: 6, diet: 'poor' };
    
    const baselineHealth: number[] = [];
    const labels: number[] = [];

    const simB = new SimulationClock();
    simB.activeDisease = clockRef.current.activeDisease || 'diabetes';
    simB.activeDiseaseSeverity = 0.4;
    simB.lifestyle = { smoking: 'none', alcohol: 'none', exercise: 'active', sleep: 8, diet: 'healthy' };
    
    const interventionHealth: number[] = [];

    for (let t = 0; t <= 24; t++) {
      labels.push(t);
      const healthA = Object.values(simA.organs).reduce((acc, o) => acc + o.temporary.health, 0) / 6;
      baselineHealth.push(Math.round(healthA));

      const healthB = Object.values(simB.organs).reduce((acc, o) => acc + o.temporary.health, 0) / 6;
      interventionHealth.push(Math.round(healthB));

      if (t % 8 === 0) {
        simB.administerMedication('metformin', 500);
      }
      simA.step();
      simB.step();
    }

    setComparisonData({
      labels,
      baseline: baselineHealth,
      intervention: interventionHealth
    });
    setIsComparing(false);
  };

  // Determine systemic status descriptor
  const getSystemicStatus = () => {
    const avgHealth = Object.values(organs).reduce((acc, o) => acc + o.temporary.health, 0) / 6;
    if (avgHealth < 40) return { text: 'Critical Shock', color: 'text-red-500' };
    if (avgHealth < 75) return { text: 'Compensating Stress', color: 'text-amber-400' };
    return { text: 'Stable Homeostasis', color: 'text-emerald-400' };
  };

  const heartPermanent = organs.heart?.permanent || { age: 30, genetics: 'male' };

  const profile: UserProfile = {
    composition: {
      weightKg: 75, heightCm: 175, sex: (heartPermanent.genetics === 'male' || heartPermanent.genetics === 'female') ? heartPermanent.genetics : 'male', age: heartPermanent.age, bodyFatPercentage: 20,
      muscleMassKg: 30, waterPercentage: 60, boneDensityScore: 0.0, bmi: 24.5, bmr: 1600
    },
    lifestyle: clockRef.current.lifestyle,
    history: {
      diseases: activeDisease ? [activeDisease] : [],
      allergies: [],
      surgeries: [],
      medications: Object.keys(activeMeds)
    }
  };

  const currentStatus = getSystemicStatus();

  return (
    <div className="min-h-screen text-slate-100 flex flex-col p-4 md:p-6 gap-4 relative font-sans">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-medical-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Main Header */}
      <header className="flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-900 pb-3.5 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-medical-600/20 border border-medical-500/30 flex items-center justify-center shadow-lg shadow-medical-500/5">
            <Heart className="w-5 h-5 text-medical-400 fill-medical-400/20 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
              Human Atlas
              <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded tracking-widest font-bold">
                PRO SIMULATOR
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-wide">
              Event-Driven Multi-Subsystem Physiology & Anatomy Layering
            </p>
          </div>
        </div>

        {/* Dynamic HUD Details Widget Row (Point 7) */}
        <div className="flex gap-4 bg-slate-950/60 p-2 rounded-xl border border-slate-900 text-[10px] text-slate-400 shadow-md">
          <div className="flex flex-col border-r border-slate-900 pr-3.5 pl-2">
            <span className="text-slate-600 uppercase font-semibold">Active Diseases</span>
            <span className="text-slate-300 font-bold mt-0.5">{activeDisease ? activeDisease.toUpperCase() : 'NONE'}</span>
          </div>
          <div className="flex flex-col border-r border-slate-900 pr-3.5">
            <span className="text-slate-600 uppercase font-semibold">Active Drugs</span>
            <span className="text-slate-300 font-bold mt-0.5">
              {Object.keys(activeMeds).length > 0 ? Object.keys(activeMeds).join(", ").toUpperCase() : 'NONE'}
            </span>
          </div>
          <div className="flex flex-col border-r border-slate-900 pr-3.5">
            <span className="text-slate-600 uppercase font-semibold">Active Injuries</span>
            <span className="text-slate-300 font-bold mt-0.5 flex items-center gap-1">
              {clockRef.current.eventQueue.getAll().length > 0 ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  BLEED ACTIVE
                </>
              ) : 'NONE'}
            </span>
          </div>
          <div className="flex flex-col border-r border-slate-900 pr-3.5">
            <span className="text-slate-600 uppercase font-semibold">Simulation Speed</span>
            <span className="text-slate-300 font-bold mt-0.5">{isPlaying ? '1 TICK/SEC' : 'PAUSED'}</span>
          </div>
          <div className="flex flex-col pr-2">
            <span className="text-slate-600 uppercase font-semibold">Body Status</span>
            <span className={`font-black mt-0.5 uppercase ${currentStatus.color}`}>{currentStatus.text}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRunComparison}
            className="glass-btn bg-purple-950/40 border-purple-800/80 hover:bg-purple-900/40 text-purple-300 shadow-md text-[11px] px-3.5 py-1.5"
          >
            <LineChart className="w-4 h-4" />
            Compare Scenarios
          </button>
        </div>
      </header>

      {/* Main Grid Layout (Point 15) */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Side: Scenario Builder & Patient Profile (3 cols) */}
        <section className="lg:col-span-3 h-full overflow-hidden">
          <ScenarioBuilder
            profile={profile}
            onChangeProfile={handleProfileChange}
            activeDisease={activeDisease}
            onSelectDisease={handleSelectDisease}
            onTriggerInjury={handleTriggerInjury}
            onAdministerMedication={handleAdministerMedication}
            activeMeds={activeMeds}
            onLoadPreset={handleLoadPreset}
          />
        </section>

        {/* Center: Large Anatomy Viewport and Trees (6 cols) */}
        <section className="lg:col-span-6 h-full overflow-hidden">
          <AnatomyViewer
            organs={organs}
            selectedOrganId={selectedOrganId}
            onSelectOrgan={setSelectedOrganId}
            activeSystemId={activeSystemId}
            onSelectSystem={setActiveSystemId}
            activeMeds={activeMeds}
          />
        </section>

        {/* Right Side: Telemetry Metrics & Lab Panels (3 cols) */}
        <section className="lg:col-span-3 h-full overflow-hidden">
          <TelemetryDashboard
            blood={blood}
            organs={organs}
            history={clockRef.current.recorder.getHistory()}
            currentLabs={currentLabs}
            onOrderLabs={handleOrderLabs}
            logs={logs}
          />
        </section>
      </main>

      {/* Comparison Overlay Panel */}
      {comparisonData && (
        <section className="glass-panel p-4 z-20 animate-fade-in flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <LineChart className="w-4 h-4 text-purple-400" />
              Comparative Forecast Chart (24-Hour Forecast)
            </h3>
            <button
              onClick={() => setComparisonData(null)}
              className="text-xs text-slate-500 hover:text-slate-300 font-semibold"
            >
              Close
            </button>
          </div>
          <div className="text-[10px] text-slate-400 flex items-start gap-2 bg-slate-950/40 p-2.5 rounded border border-slate-900">
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              Comparing **Baseline Untreated** (sedentary, poor diet) vs **Intervention Scenario** (active, healthy diet, Metformin 500mg every 8 hours). Plots mean organ health (%) over 24 ticks.
            </div>
          </div>
          <div className="h-44 bg-slate-950/40 p-3 rounded-lg border border-slate-900">
            <Line
              data={{
                labels: comparisonData.labels,
                datasets: [
                  {
                    label: 'Scenario A: Baseline Untreated',
                    data: comparisonData.baseline,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    tension: 0.2,
                    borderWidth: 1.5,
                    pointRadius: 1
                  },
                  {
                    label: 'Scenario B: Metformin + Exercise',
                    data: comparisonData.intervention,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    tension: 0.2,
                    borderWidth: 1.5,
                    pointRadius: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { size: 9 } } }
                },
                scales: {
                  x: { grid: { color: 'rgba(30, 41, 59, 0.5)' }, ticks: { color: '#64748b', font: { size: 8 } } },
                  y: { grid: { color: 'rgba(30, 41, 59, 0.5)' }, ticks: { color: '#64748b', font: { size: 8 } } }
                }
              }}
            />
          </div>
        </section>
      )}

      {/* Bottom Timeline Controls */}
      <footer className="w-full z-10">
        <SimulationControls
          tickCount={tickCount}
          maxTicks={clockRef.current.recorder.getHistory().length - 1}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onStep={handleStep}
          onReset={handleReset}
          onSeek={handleSeek}
          studyMode={studyMode}
          onToggleStudyMode={() => setStudyMode(!studyMode)}
        />
      </footer>
    </div>
  );
}
