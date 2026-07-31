import React, { useState, useEffect, useRef } from 'react';
import { SimulationClock } from './engine/core/SimulationClock';
import { UserProfile, LabReport } from './types/physiology';
import { PatientEHR } from './types/patientEHR';
import { EHRCalculationsEngine } from './utils/ehrCalculations';
import { AnatomyViewer } from './components/AnatomyViewer/AnatomyViewer';
import { ScenarioBuilder } from './components/ScenarioBuilder/ScenarioBuilder';
import { SimulationControls } from './components/SimulationControls/SimulationControls';
import { TelemetryDashboard } from './components/Telemetry/TelemetryDashboard';
import { Navbar, NavTabId } from './components/Navigation/Navbar';
import { PatientProfilePage } from './components/PatientProfile/PatientProfilePage';
import { Heart, Activity, LineChart, Shield, Info, AlertTriangle } from 'lucide-react';
import { Line } from 'react-chartjs-2';

export default function App() {
  const clockRef = useRef<SimulationClock>(new SimulationClock());
  
  // Navigation & Page State
  const [activeTab, setActiveTab] = useState<NavTabId>('patient-profile');

  // Master EHR Patient Profile with persistent storage hydration
  const [patientEHR, setPatientEHR] = useState<PatientEHR>(() => {
    try {
      const saved = localStorage.getItem('human_atlas_patient_ehr');
      if (saved) {
        console.log('[App] Loaded Patient Profile from LocalStorage.');
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('[App] Failed to load Patient Profile from LocalStorage:', e);
    }
    return EHRCalculationsEngine.createDefaultProfile('John Doe (Baseline)');
  });

  // Debug logger for master patientEHR state changes
  useEffect(() => {
    console.log('[App useEffect] Master patientEHR state updated:', {
      name: patientEHR.patientName,
      conditions: patientEHR.medicalConditions.map(c => c.name),
      medications: patientEHR.medications.map(m => m.genericName),
      labs: patientEHR.labResults
    });
  }, [patientEHR]);

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

  // Master EHR update handler that propagates to simulation engine & storage
  const handleMasterEHRUpdate = (updated: PatientEHR) => {
    console.log('[App] 4. Global State Updated:', updated.patientName);
    setPatientEHR(updated);

    // Persist to LocalStorage
    try {
      localStorage.setItem('human_atlas_patient_ehr', JSON.stringify(updated));
      console.log('[App] 5. Storage Updated');
    } catch (e) {
      console.error('[App] Storage update failed:', e);
    }

    // Sync Simulation Clock Engine
    const clock = clockRef.current;
    if (updated.labResults?.cmp?.glucoseMgDl) {
      clock.blood.substances.glucose = updated.labResults.cmp.glucoseMgDl;
    }
    if (updated.labResults?.cmp?.creatinineMgDl) {
      clock.blood.substances.creatinine = updated.labResults.cmp.creatinineMgDl;
    }
    if (updated.labResults?.cbc?.hemoglobinGDl) {
      clock.blood.substances.oxygen = Math.round((updated.labResults.cbc.hemoglobinGDl / 14) * 98);
    }

    // Apply active conditions to simulation clock & reset inactive ones
    const hasDiabetes = updated.medicalConditions.some(c => c.name.toLowerCase().includes('diabetes'));
    const hasCKD = updated.medicalConditions.some(c => c.name.toLowerCase().includes('kidney') || c.name.toLowerCase().includes('ckd'));
    const hasHeartFailure = updated.medicalConditions.some(c => c.name.toLowerCase().includes('heart failure'));

    if (hasHeartFailure) {
      clock.activeDisease = 'heart_failure';
    } else if (hasDiabetes) {
      clock.activeDisease = 'diabetes';
    } else if (hasCKD) {
      clock.activeDisease = 'ckd';
    } else {
      clock.activeDisease = null;
      clock.activeDiseaseSeverity = 0.0;
    }

    // Reset organs if normal renal function
    if (!hasCKD && clock.organs.kidney) {
      clock.organs.kidney.temporary.health = 100;
      clock.organs.kidney.temporary.perfusion = 100;
      clock.organs.kidney.temporary.inflammation = 0;
    }

    // Apply medications to simulation engine
    clock.activeMeds = {};
    updated.medications.forEach(m => {
      clock.activeMeds[m.genericName.toLowerCase()] = m.dose;
    });

    clock.logs.push(`[Digital Twin Integration] Active patient profile updated: ${updated.patientName}`);
    console.log('[App] 6. Simulation Engine & Organs Synchronized');

    syncWithEngine();
    console.log('[App] 7. UI Components Refreshed');
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

  // Determine systemic status descriptor
  const getSystemicStatus = () => {
    const avgHealth = Object.values(organs).reduce((acc, o) => acc + o.temporary.health, 0) / 6;
    if (avgHealth < 40) return { text: 'Critical Shock', color: 'text-red-500' };
    if (avgHealth < 75) return { text: 'Compensating Stress', color: 'text-amber-400' };
    return { text: 'Stable Homeostasis', color: 'text-emerald-400' };
  };

  const profile: UserProfile = {
    composition: {
      weightKg: patientEHR.anthropometrics.weightKg, heightCm: patientEHR.anthropometrics.heightCm, sex: patientEHR.demographics.sex as any, age: patientEHR.demographics.age, bodyFatPercentage: patientEHR.anthropometrics.bodyFatPercentage || 20,
      muscleMassKg: 30, waterPercentage: 60, boneDensityScore: 0.0, bmi: patientEHR.calculatedMetrics?.bmi || 24.5, bmr: patientEHR.calculatedMetrics?.bmrKcal || 1600
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
    <div className="min-h-screen text-slate-100 flex flex-col p-3 md:p-5 gap-3 relative font-sans bg-slate-950 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-medical-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Top Sliding Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        systemicStatusText={currentStatus.text}
        systemicStatusColor={currentStatus.color}
      />

      {/* PAGE SWITCHER */}
      {activeTab === 'patient-profile' ? (
        /* Standalone Patient Profile EHR Page */
        <main className="flex-1 overflow-hidden">
          <PatientProfilePage
            currentProfile={patientEHR}
            onUpdateProfile={handleMasterEHRUpdate}
          />
        </main>
      ) : activeTab === 'anatomy' || activeTab === 'home' || activeTab === 'simulation' ? (
        /* Main Anatomy & Simulation Workspace */
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          {/* Left Side: Scenario Builder & Controls (3 cols) */}
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

          {/* Center: Interactive 3D Anatomy Viewer (6 cols) */}
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

          {/* Right Side: Telemetry Dashboard & Labs (3 cols) */}
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
      ) : (
        /* Fallback placeholder for remaining pages */
        <main className="flex-1 glass-panel p-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-medical-500/10 border border-medical-500/30 flex items-center justify-center mb-3">
            <Activity className="w-6 h-6 text-medical-400" />
          </div>
          <h2 className="text-base font-extrabold uppercase text-slate-200">{activeTab} Workspace</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            This module is connected to the master Patient EHR profile and simulation engine.
          </p>
        </main>
      )}

      {/* Floating Simulation Control Bar */}
      {(activeTab === 'anatomy' || activeTab === 'simulation' || activeTab === 'home') && (
        <footer className="shrink-0 z-20">
          <SimulationControls
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onStep={handleStep}
            onReset={handleReset}
            tickCount={tickCount}
            maxTicks={100}
            onSeek={handleSeek}
            studyMode={studyMode}
            onToggleStudyMode={() => setStudyMode(!studyMode)}
          />
        </footer>
      )}
    </div>
  );
}
