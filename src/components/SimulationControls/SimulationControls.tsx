import React from 'react';
import { Play, Pause, RotateCcw, HelpCircle, Eye } from 'lucide-react';
import { Timeline } from '../../engine/core/Timeline';

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
    <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 justify-between items-center z-10">
      {/* Clock indicators & Mode toggles */}
      <div className="flex gap-4 items-center">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">SIMULATION TIME</span>
          <span className="text-xl font-bold tracking-wider text-medical-400">
            {Timeline.tickToTimeStr(tickCount)}
          </span>
        </div>

        <div className="h-8 w-px bg-slate-900" />

        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">RUNNING MODE</span>
          <button
            onClick={onToggleStudyMode}
            className={`mt-0.5 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border ${
              studyMode
                ? 'bg-purple-950/40 text-purple-300 border-purple-800/80 shadow-md shadow-purple-500/5'
                : 'bg-slate-950/40 text-slate-400 border-slate-900 hover:border-slate-800 hover:text-slate-200'
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
      <div className="flex gap-2.5 items-center">
        <button
          onClick={onReset}
          title="Reset Simulation"
          className="w-10 h-10 rounded-lg bg-slate-950/60 border border-slate-900 hover:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/10'
              : 'bg-medical-600 hover:bg-medical-500 text-white shadow-medical-500/10'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
        </button>

        <button
          onClick={onStep}
          disabled={isPlaying}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
        >
          Step (+1h)
        </button>
      </div>

      {/* Slider seeker */}
      <div className="flex-1 w-full md:w-auto flex gap-4 items-center">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seek</span>
        <input
          type="range"
          min="0"
          max={Math.max(1, maxTicks)}
          value={tickCount}
          onChange={(e) => onSeek(parseInt(e.target.value) || 0)}
          className="flex-1 accent-medical-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs font-semibold text-slate-400 tracking-wider">
          {tickCount} / {maxTicks} ticks
        </span>
      </div>
    </div>
  );
};
