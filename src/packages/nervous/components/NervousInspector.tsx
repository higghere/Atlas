import React from 'react';
import { NervousStructureComponent } from '../data/nervousData';
import { Brain, MapPin, Layers } from 'lucide-react';

interface NervousInspectorProps {
  structure: NervousStructureComponent;
  onSelectStructure: (id: string | null) => void;
}

export const NervousInspector: React.FC<NervousInspectorProps> = ({
  structure,
  onSelectStructure,
}) => {
  return (
    <div className="text-[10px] text-slate-300 flex flex-col gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-900 shadow-xl max-h-[480px] overflow-y-auto select-text scrollbar-thin">
      {/* Header Title & System Badge */}
      <div className="flex justify-between items-start border-b border-slate-900 pb-2">
        <div>
          <div className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest mb-0.5">
            NERVOUS SYSTEM
          </div>
          <div className="font-extrabold text-cyan-300 text-xs leading-tight flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            {structure.name}
          </div>
          <div className="text-[8.5px] text-slate-500 uppercase font-semibold font-mono tracking-wider">
            {structure.latinName}
          </div>
        </div>
        <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-800">
          {structure.region}
        </span>
      </div>

      {/* Structured System & Location Panel */}
      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-850 flex flex-col gap-1 font-mono text-[9px]">
        <div className="flex justify-between">
          <span className="text-slate-500 uppercase">System:</span>
          <span className="text-cyan-300 font-bold">{structure.system}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 uppercase flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-400" /> Location:
          </span>
          <span className="text-slate-200 font-semibold">{structure.location}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 leading-snug bg-slate-900/40 p-2 rounded-lg border border-slate-850">
        {structure.description}
      </p>

      {/* Innervation & Clinical Notes */}
      <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-2">
        <div>
          <span className="text-cyan-400 font-semibold uppercase text-[8px] block">Innervation Fields:</span>
          <span className="text-slate-300 block">{structure.innervationRegion.join(', ')}</span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold uppercase text-[8px] block">Clinical Background:</span>
          <span className="text-slate-300 block leading-tight">{structure.clinicalNotes}</span>
        </div>
      </div>
    </div>
  );
};
