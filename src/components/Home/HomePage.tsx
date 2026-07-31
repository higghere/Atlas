import React from 'react';
import { 
  Play, 
  FlaskConical, 
  FolderOpen, 
  Box, 
  Zap, 
  Sliders, 
  RotateCcw, 
  BookOpen, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Layers,
  Heart,
  ChevronRight,
  Sparkles,
  Clock
} from 'lucide-react';
import { NavTabId } from '../Navigation/Navbar';

interface HomePageProps {
  onNavigate: (tab: NavTabId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const quickAccessCards = [
    {
      id: 'anatomy' as NavTabId,
      title: 'Anatomy Explorer',
      description: 'Explore bones, muscles, organs, vessels, and nerves in interactive 3D with precise anatomical accuracy.',
      icon: <Box className="w-6 h-6 text-[#00D4FF]" />,
      accent: 'from-[#00D4FF]/20 to-transparent',
      borderColor: 'group-hover:border-[#00D4FF]/50'
    },
    {
      id: 'simulation' as NavTabId,
      title: 'Trauma Simulation',
      description: 'Create realistic trauma scenarios, injuries, severe hemorrhages, and emergency resuscitation protocols.',
      icon: <Zap className="w-6 h-6 text-[#FF4D5A]" />,
      accent: 'from-[#FF4D5A]/20 to-transparent',
      borderColor: 'group-hover:border-[#FF4D5A]/50'
    },
    {
      id: 'laboratory' as NavTabId,
      title: 'Predictive Laboratory',
      description: 'Predict medications, procedures, cosmetic surgery, and long-term physiological outcomes in a read-only sandbox.',
      icon: <FlaskConical className="w-6 h-6 text-[#00FFA8]" />,
      accent: 'from-[#00FFA8]/20 to-transparent',
      borderColor: 'group-hover:border-[#00FFA8]/50'
    },
    {
      id: 'simulation' as NavTabId,
      title: 'Scenario Builder',
      description: 'Build emergency cases with custom patients, specific injuries, and environmental baseline conditions.',
      icon: <Sliders className="w-6 h-6 text-[#00D4FF]" />,
      accent: 'from-[#00D4FF]/20 to-transparent',
      borderColor: 'group-hover:border-[#00D4FF]/50'
    },
    {
      id: 'timeline' as NavTabId,
      title: 'Replay & Analytics',
      description: 'Review step-by-step timelines, clinical event chains, organ failure orders, and treatment outcome comparisons.',
      icon: <RotateCcw className="w-6 h-6 text-[#00FFA8]" />,
      accent: 'from-[#00FFA8]/20 to-transparent',
      borderColor: 'group-hover:border-[#00FFA8]/50'
    },
    {
      id: 'study' as NavTabId,
      title: 'Knowledge Library',
      description: 'Browse compiled diseases, drugs, surgical procedures, laboratory reference values, and medical guidelines.',
      icon: <BookOpen className="w-6 h-6 text-[#00D4FF]" />,
      accent: 'from-[#00D4FF]/20 to-transparent',
      borderColor: 'group-hover:border-[#00D4FF]/50'
    }
  ];

  const engineStats = [
    { label: 'Knowledge Assets', value: '12,000+' },
    { label: 'Physiology Variables', value: '18,000+' },
    { label: 'Simulation Modules', value: '42' },
    { label: 'Medical Procedures', value: '900+' },
    { label: 'Drugs', value: '5,000+' },
    { label: 'Diseases', value: '2,500+' }
  ];

  const recentSimulations = [
    { title: 'Penetrating Chest Trauma', status: 'Completed', statusColor: 'text-[#00FFA8] bg-[#00FFA8]/10 border-[#00FFA8]/30', time: '12 mins ago' },
    { title: 'Septic Shock & MOF', status: 'Completed', statusColor: 'text-[#00FFA8] bg-[#00FFA8]/10 border-[#00FFA8]/30', time: '1 hour ago' },
    { title: 'Acute Cardiac Arrest', status: 'In Progress', statusColor: 'text-[#00D4FF] bg-[#00D4FF]/10 border-[#00D4FF]/30', time: 'Active' },
    { title: 'Polytrauma & Hemorrhage', status: 'Completed', statusColor: 'text-[#00FFA8] bg-[#00FFA8]/10 border-[#00FFA8]/30', time: '3 hours ago' }
  ];

  const engineCapabilities = [
    'Anatomy', 'Physiology', 'Trauma', 'Disease Progression', 'Pharmacology',
    'Surgery', 'Predictive Laboratory', 'Clinical Analytics', 'Replay', 'Multi-Patient',
    'Explainability', 'Timeline Analysis', 'Organ Interaction', 'Mortality Engine', 'Scenario Builder'
  ];

  return (
    <div className="min-h-full bg-[#050816] text-slate-100 font-sans relative overflow-x-hidden p-6 md:p-8 flex flex-col gap-12 select-none">
      
      {/* Background Animated Subtle Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#00d4ff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00D4FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[600px] h-[600px] bg-[#00FFA8]/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container Grid with Right Floating Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 max-w-7xl mx-auto w-full">
        
        {/* Main Content (9 Cols) */}
        <div className="lg:col-span-9 flex flex-col gap-14">
          
          {/* HERO SECTION */}
          <section className="relative bg-[#0B1220] border border-slate-800/80 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl shadow-black/80 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 flex flex-col gap-5 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] text-xs font-mono tracking-wider uppercase font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Deterministic Medical Simulation Engine
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Human Atlas
              </h1>
              
              <h2 className="text-lg md:text-xl font-medium text-slate-300 leading-snug">
                Advanced Human Anatomy, Physiology, Trauma & Clinical Simulation Platform
              </h2>

              <p className="text-xs md:text-sm text-slate-400 max-w-xl leading-relaxed">
                Explore anatomy in three dimensions, simulate trauma, predict treatments, analyze physiological organ cascades, and investigate complex medical scenarios using a deterministic simulation engine.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => onNavigate('simulation')}
                  className="px-6 py-3 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-slate-950 font-bold rounded-xl flex items-center gap-2.5 transition-all shadow-lg shadow-[#00D4FF]/25 hover:shadow-[#00D4FF]/40 text-xs uppercase tracking-wider"
                >
                  <Play className="w-4 h-4 fill-current" />
                  New Simulation
                </button>
                <button
                  onClick={() => onNavigate('laboratory')}
                  className="px-5 py-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold rounded-xl flex items-center gap-2 transition-all hover:border-[#00FFA8]/50 text-xs"
                >
                  <FlaskConical className="w-4 h-4 text-[#00FFA8]" />
                  Predictive Laboratory
                </button>
                <button
                  onClick={() => onNavigate('patient-profile')}
                  className="px-5 py-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold rounded-xl flex items-center gap-2 transition-all hover:border-[#00D4FF]/50 text-xs"
                >
                  <FolderOpen className="w-4 h-4 text-[#00D4FF]" />
                  Open Existing Case
                </button>
              </div>
            </div>

            {/* Procedural Animated 3D HUD Representation */}
            <div className="w-full lg:w-72 h-72 relative flex items-center justify-center bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4 shrink-0 overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00D4FF]/10 via-transparent to-[#00FFA8]/10 animate-pulse" />
              {/* Animated Rotating Holographic Ring */}
              <div className="w-48 h-48 rounded-full border border-dashed border-[#00D4FF]/40 animate-[spin_20s_linear_infinite] flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border border-dotted border-[#00FFA8]/40 animate-[spin_12s_linear_infinite_reverse]" />
              </div>
              
              <div className="absolute flex flex-col items-center gap-2">
                <Heart className="w-16 h-16 text-[#FF4D5A] animate-pulse drop-shadow-[0_0_15px_rgba(255,77,90,0.6)]" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  Live Vitals Engine
                </span>
              </div>

              {/* HUD ECG Waveform Line at bottom */}
              <div className="absolute bottom-2 inset-x-4 h-6 flex items-center">
                <svg className="w-full h-full stroke-[#00D4FF] fill-none opacity-80" viewBox="0 0 200 40">
                  <path d="M 0,20 L 40,20 L 50,5 L 60,35 L 70,10 L 80,25 L 90,20 L 200,20" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </section>

          {/* QUICK ACCESS DASHBOARD (6 Cards) */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00D4FF]" /> Quick Access Dashboard
              </h3>
              <span className="text-xs text-slate-500 font-mono">Select a module to launch</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickAccessCards.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate(card.id)}
                  className={`group relative bg-[#0B1220] border border-slate-800/80 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 ${card.borderColor} flex flex-col justify-between overflow-hidden`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.accent} rounded-bl-full pointer-events-none opacity-50 transition-opacity group-hover:opacity-100`} />
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-[#00D4FF] transition-colors mb-2">
                      {card.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 group-hover:text-slate-300 mt-5 pt-3 border-t border-slate-800/60 transition-colors">
                    Launch Module <ChevronRight className="w-3.5 h-3.5 text-[#00D4FF] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* STATISTICS & RECENT SIMULATIONS SECTION */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Statistics Counters (7 cols) */}
            <div className="lg:col-span-7 bg-[#0B1220] border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00FFA8]" /> Engine Knowledge Base Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {engineStats.map((st, i) => (
                  <div key={i} className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{st.label}</span>
                    <span className="text-xl font-extrabold text-white font-mono tracking-tight">{st.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Simulations (5 cols) */}
            <div className="lg:col-span-5 bg-[#0B1220] border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00D4FF]" /> Recent Simulation Cases
              </h3>
              <div className="flex flex-col gap-2.5">
                {recentSimulations.map((sim, i) => (
                  <div 
                    key={i} 
                    onClick={() => onNavigate('simulation')}
                    className="flex items-center justify-between p-2.5 bg-slate-950/40 hover:bg-slate-900/80 border border-slate-900 rounded-xl transition-all cursor-pointer group"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-200 group-hover:text-[#00D4FF] transition-colors">{sim.title}</h5>
                      <span className="text-[10px] text-slate-500">{sim.time}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-bold border ${sim.statusColor}`}>
                      {sim.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* ENGINE CAPABILITIES GRID */}
          <section className="bg-[#0B1220] border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00FFA8]" /> Core Engine Capabilities
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {engineCapabilities.map((cap, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-950/50 border border-slate-900 rounded-xl text-xs text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#00FFA8] shrink-0" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT SIDEBAR — ENGINE STATUS (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4 sticky top-6">
          <div className="bg-[#0B1220] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
              <Cpu className="w-5 h-5 text-[#00D4FF]" />
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider">Engine Status</h4>
                <span className="text-[10px] text-emerald-400 font-mono">100% Operational</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
                <span className="text-slate-500">Engine Version</span>
                <strong className="text-[#00D4FF]">v23.2</strong>
              </div>

              <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
                <span className="text-slate-500">Simulation Status</span>
                <strong className="text-[#00FFA8]">Operational</strong>
              </div>

              <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
                <span className="text-slate-500">Knowledge Database</span>
                <strong className="text-slate-200">Loaded</strong>
              </div>

              <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
                <span className="text-slate-500">Medical Assets</span>
                <strong className="text-[#00D4FF]">Ready</strong>
              </div>

              <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
                <span className="text-slate-500">Build Target</span>
                <strong className="text-emerald-400">Stable</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-800/80 pt-8 pb-6 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto w-full text-slate-500 text-xs">
        <div>
          <h4 className="font-bold text-slate-300 uppercase tracking-wider">Human Atlas</h4>
          <p className="mt-1 text-slate-500 max-w-md">
            Advanced Human Physiology & Trauma Simulation Platform. Built for education, research, and clinical simulation.
          </p>
        </div>
        <div className="font-mono text-[11px] text-slate-600">
          © 2026 Human Atlas Core Team. Engine Architecture v23.2.
        </div>
      </footer>

    </div>
  );
};
