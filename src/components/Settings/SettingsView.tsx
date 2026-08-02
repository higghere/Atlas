import React from 'react';
import { Settings as SettingsIcon, Sun, Moon, Monitor, Shield, Sparkles, Database, Sliders, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  theme: 'dark' | 'light';
  onToggleTheme: (theme: 'dark' | 'light') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ theme, onToggleTheme }) => {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 select-none">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#00D4FF] flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6" />
            Application Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure system themes, display options, simulation parameters, and master engine defaults.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Human Atlas v24.4
        </div>
      </div>

      {/* Theme Customization Section */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="border-b border-slate-800/80 pb-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" /> Visual Appearance & Color Theme
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose between Dark Mode (HUD/Scientific ICU style) and Light Mode (Clinical Laboratory style).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {/* Dark Mode Card */}
          <div
            onClick={() => onToggleTheme('dark')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 ${
              theme === 'dark'
                ? 'bg-slate-900 border-[#00D4FF] shadow-lg shadow-[#00D4FF]/10 ring-1 ring-[#00D4FF]/40'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-[#00D4FF]">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Dark Mode (Default)</h4>
                  <span className="text-[10px] text-slate-400">Futuristic JARVIS / ICU HUD</span>
                </div>
              </div>
              {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-[#00D4FF]" />}
            </div>
            <div className="h-16 rounded-lg bg-[#050816] border border-slate-800 p-2 flex gap-2">
              <div className="w-1/3 bg-[#0B1220] rounded border border-slate-800/60" />
              <div className="w-2/3 bg-slate-950/80 rounded border border-slate-800/60" />
            </div>
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => onToggleTheme('light')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 ${
              theme === 'light'
                ? 'bg-slate-900 border-[#00D4FF] shadow-lg shadow-[#00D4FF]/10 ring-1 ring-[#00D4FF]/40'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Light Mode</h4>
                  <span className="text-[10px] text-slate-400">High-Contrast Clinical Laboratory</span>
                </div>
              </div>
              {theme === 'light' && <CheckCircle2 className="w-5 h-5 text-[#00D4FF]" />}
            </div>
            <div className="h-16 rounded-lg bg-slate-100 border border-slate-300 p-2 flex gap-2">
              <div className="w-1/3 bg-white rounded border border-slate-200" />
              <div className="w-2/3 bg-slate-50 rounded border border-slate-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Master Engine Status & Presets */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="border-b border-slate-800/80 pb-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-[#00FFA8]" /> Engine & Knowledge Provenance
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase">Deterministic Analytics</span>
            <span className="font-bold text-emerald-400">100% Zero-AI Enabled</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase">Knowledge Registry</span>
            <span className="font-bold text-cyan-400">12,000+ Verified Assets</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase">Simulation Solver</span>
            <span className="font-bold text-purple-400">12-Phase Multi-Subsystem</span>
          </div>
        </div>
      </div>
    </div>
  );
};
