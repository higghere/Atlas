import React from 'react';
import { ImmuneLymphaticStructureComponent } from '../data/immuneData';
import { Shield, MapPin } from 'lucide-react';

interface ImmuneInspectorProps {
  structure: ImmuneLymphaticStructureComponent;
  onSelectStructure: (id: string | null) => void;
}

export const ImmuneInspector: React.FC<ImmuneInspectorProps> = ({
  structure,
  onSelectStructure,
}) => {
  return (
    <div className="text-[10px] text-slate-300 flex flex-col gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-900 shadow-xl max-h-[480px] overflow-y-auto select-text scrollbar-thin">
      {/* Header Title & System Badge */}
      <div className="flex justify-between items-start border-b border-slate-900 pb-2">
        <div>
          <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest mb-0.5">
            IMMUNE & LYMPHATIC SYSTEM
          </div>
          <div className="font-extrabold text-emerald-300 text-xs leading-tight flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            {structure.name}
          </div>
          <div className="text-[8.5px] text-slate-500 uppercase font-semibold font-mono tracking-wider">
            {structure.latinName}
          </div>
        </div>
        <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800">
          {structure.region}
        </span>
      </div>

      {/* Structured System, Subsystem & Location Panel */}
      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-850 flex flex-col gap-1 font-mono text-[9px]">
        <div className="flex justify-between">
          <span className="text-slate-500 uppercase">System:</span>
          <span className="text-emerald-300 font-bold">{structure.system}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 uppercase">Subsystem:</span>
          <span className="text-emerald-400 font-semibold capitalize">{structure.subsystem.replace('_', ' & ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 uppercase flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" /> Location:
          </span>
          <span className="text-slate-200 font-semibold">{structure.location}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 leading-snug bg-slate-900/40 p-2 rounded-lg border border-slate-850">
        {structure.description}
      </p>

      {/* Clinical Background */}
      <div className="flex flex-col gap-1 border-t border-slate-900 pt-2">
        <span className="text-slate-400 font-semibold uppercase text-[8px] block">Clinical Background:</span>
        <span className="text-slate-300 block leading-tight">{structure.clinicalNotes}</span>
      </div>
    </div>
  );
};
