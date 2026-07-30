import React from 'react';
import { VesselComponent } from '../entities/VesselComponent';
import { CirculationGraph } from '../graph/CirculationGraph';
import { Heart, Activity, Stethoscope, ChevronRight, Share2, Layers, AlertCircle } from 'lucide-react';

interface CardiovascularInspectorProps {
  vessel: VesselComponent;
  onSelectVessel: (id: string | null) => void;
  highlightMode: 'none' | 'upstream' | 'downstream' | 'both';
  onToggleHighlightMode: (mode: 'none' | 'upstream' | 'downstream' | 'both') => void;
}

export const CardiovascularInspector: React.FC<CardiovascularInspectorProps> = ({
  vessel,
  onSelectVessel,
  highlightMode,
  onToggleHighlightMode,
}) => {
  const upstreamPath = CirculationGraph.traceUpstreamSupply(vessel.id);
  const downstreamPath = CirculationGraph.traceDownstreamFlow(vessel.id);

  return (
    <div className="text-[10px] text-slate-300 flex flex-col gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-900 shadow-xl max-h-[480px] overflow-y-auto select-text scrollbar-thin">
      {/* Header Title & Type Badge */}
      <div className="flex justify-between items-start border-b border-slate-900 pb-2">
        <div>
          <div className="font-extrabold text-rose-400 text-xs leading-tight flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            {vessel.displayName}
          </div>
          <div className="text-[8.5px] text-slate-500 uppercase font-semibold font-mono tracking-wider">
            {vessel.latinName}
          </div>
        </div>
        <span
          className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
            vessel.vesselType === 'artery'
              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
              : vessel.vesselType === 'vein'
              ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
              : 'bg-amber-950/80 text-amber-300 border border-amber-800'
          }`}
        >
          {vessel.vesselType}
        </span>
      </div>

      {/* Pathway Trace Controls */}
      <div className="grid grid-cols-3 gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-850 text-[8px] font-bold">
        <button
          onClick={() => onToggleHighlightMode(highlightMode === 'upstream' ? 'none' : 'upstream')}
          className={`py-1 rounded uppercase transition-all ${
            highlightMode === 'upstream' || highlightMode === 'both'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Upstream
        </button>
        <button
          onClick={() => onToggleHighlightMode(highlightMode === 'downstream' ? 'none' : 'downstream')}
          className={`py-1 rounded uppercase transition-all ${
            highlightMode === 'downstream' || highlightMode === 'both'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Downstream
        </button>
        <button
          onClick={() => onSelectVessel(null)}
          className="py-1 rounded uppercase text-slate-500 hover:text-slate-300"
        >
          Clear
        </button>
      </div>

      {/* Physical Parameters */}
      <div className="grid grid-cols-3 gap-1.5 text-[9px]">
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900">
          <span className="text-slate-500 block uppercase text-[7.5px]">Diameter:</span>
          <span className="font-bold text-slate-200 font-mono">{vessel.diameter} mm</span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900">
          <span className="text-slate-500 block uppercase text-[7.5px]">Region:</span>
          <span className="font-bold text-slate-200 capitalize">{vessel.region}</span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900">
          <span className="text-slate-500 block uppercase text-[7.5px]">LOD Level:</span>
          <span className="font-bold text-slate-200 font-mono">LOD {vessel.lodLevel}</span>
        </div>
      </div>

      {/* Anatomical Landmarks */}
      <div className="flex flex-col gap-1 border-t border-slate-900 pt-2 text-[9px]">
        <div>
          <span className="text-slate-500 font-semibold uppercase text-[7.5px] block">Start Landmark:</span>
          <span className="text-slate-300 block">{vessel.startLandmark}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold uppercase text-[7.5px] block">End Landmark:</span>
          <span className="text-slate-300 block">{vessel.endLandmark}</span>
        </div>
      </div>

      {/* Branch Hierarchy (Parent & Children) */}
      <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-2 text-[9px]">
        {vessel.parent && (
          <div>
            <span className="text-slate-500 font-semibold uppercase text-[7.5px] block">Parent Vessel:</span>
            <button
              onClick={() => onSelectVessel(vessel.parent)}
              className="text-cyan-400 font-bold hover:underline"
            >
              {vessel.parent}
            </button>
          </div>
        )}
        {vessel.children.length > 0 && (
          <div>
            <span className="text-slate-500 font-semibold uppercase text-[7.5px] block">Branch Children:</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {vessel.children.map((cId) => (
                <button
                  key={cId}
                  onClick={() => onSelectVessel(cId)}
                  className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 text-[8px] font-mono"
                >
                  {cId}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Organ Connectivity */}
      {vessel.connectedOrgans.length > 0 && (
        <div className="border-t border-slate-900 pt-2 text-[9px]">
          <span className="text-amber-400 font-semibold uppercase text-[7.5px] block">Connected Organs:</span>
          <span className="text-slate-200 block font-bold">{vessel.connectedOrgans.join(', ')}</span>
        </div>
      )}

      {/* Clinical Notes & Pathology */}
      <div className="flex flex-col gap-1 border-t border-slate-900 pt-2 text-[9px]">
        <div>
          <span className="text-rose-400 font-semibold uppercase text-[7.5px] block flex items-center gap-1">
            <Stethoscope className="w-3 h-3 text-rose-400" /> Clinical Importance:
          </span>
          <span className="text-slate-300 block italic leading-relaxed">{vessel.clinicalImportance}</span>
        </div>
        {vessel.commonDiseases.length > 0 && (
          <div>
            <span className="text-amber-400 font-semibold uppercase text-[7.5px] block">Associated Pathologies:</span>
            <span className="text-slate-400 block">{vessel.commonDiseases.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
