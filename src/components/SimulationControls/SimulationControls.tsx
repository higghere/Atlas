import React from 'react';
import { Play, Pause, RotateCcw, HelpCircle, Eye } from 'lucide-react';
import { ClinicalTimeFormatter } from '../../utils/clinicalTimeFormatter';

interface SimulationControlsProps {
  tickCount: number;
  maxTicks: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onSeek: (tick: number) => void;
  studyMode: boolean;
  onToggleStudyMode: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  tickCount,
  maxTicks,
  isPlaying,
  onTogglePlay,
  onStep,
  onReset,
  onSeek,
  studyMode,
  onToggleStudyMode
}) => {
  return (
    <div className="glass-panel p-4 flex flex-col md:flex-row gap-6 justify-between items-center z-10 font-sans border border-slate-800 rounded-2xl shadow-xl">
      {/* Clock indicators & Mode toggles */}
      <div className="flex gap-4 items-center shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">CLINICAL TIME</span>
          <span className="text-xl font-mono font-extrabold tracking-wider text-[#00D4FF]">
            {ClinicalTimeFormatter.formatClock(tickCount)}
          </span>
        </div>

        <div className="h-8 w-px bg-slate-800" />

        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">RUNNING MODE</span>
          <button
            onClick={onToggleStudyMode}
            className={`mt-0.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border ${
              studyMode
                ? 'bg-purple-950/40 text-purple-300 border-purple-800/80 shadow-md shadow-purple-500/5'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {studyMode ? (
              <>
                <HelpCircle className="w-3.5 h-3.5" />
                Study Mode
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Telemetry Only
              </>
            )}
          </button>
        </div>
      </div>

      {/* Central transport controls */}
      <div className="flex gap-3 items-center shrink-0">
        <button
          onClick={onReset}
          title="Reset Simulation"
          className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all duration-200 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg active:scale-95 ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-slate-950 shadow-[#00D4FF]/25'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </button>

        <button
          onClick={onStep}
          disabled={isPlaying}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 active:scale-95"
        >
          Step (+1s)
        </button>
      </div>

      {/* Slider seeker with enlarged scrubber handle (v24.2) */}
      <div className="flex-1 w-full md:w-auto flex gap-4 items-center bg-slate-950/60 p-2.5 px-4 rounded-xl border border-slate-900">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Seek</span>
        <input
          type="range"
          min="0"
          max={Math.max(1, maxTicks)}
          value={tickCount}
          onChange={(e) => onSeek(parseInt(e.target.value) || 0)}
          className="flex-1 accent-[#00D4FF] h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs font-mono font-bold text-slate-300 tracking-wider shrink-0">
          {tickCount} / {maxTicks} ticks
        </span>
      </div>
    </div>
  );
};
