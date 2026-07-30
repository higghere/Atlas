import React from 'react';
import { DigestiveOrganComponent } from '../data/digestiveData';
import { Stethoscope, Activity, Layers, AlertCircle } from 'lucide-react';

interface DigestiveInspectorProps {
  organ: DigestiveOrganComponent;
  onSelectOrgan: (id: string | null) => void;
}

export const DigestiveInspector: React.FC<DigestiveInspectorProps> = ({
  organ,
  onSelectOrgan,
}) => {
  return (
    <div className="text-[10px] text-slate-300 flex flex-col gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-900 shadow-xl max-h-[480px] overflow-y-auto select-text scrollbar-thin">
      {/* Header Title & Type Badge */}
      <div className="flex justify-between items-start border-b border-slate-900 pb-2">
        <div>
          <div className="font-extrabold text-emerald-400 text-xs leading-tight flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
            {organ.name}
          </div>
          <div className="text-[8.5px] text-slate-500 uppercase font-semibold font-mono tracking-wider">
            {organ.latinName}
          </div>
        </div>
        <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800">
          {organ.region}
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-300 leading-snug bg-slate-900/40 p-2 rounded-lg border border-slate-850">
        {organ.description}
      </p>

      {/* Vascular Supply & Drainage */}
      <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-2">
        <div>
          <span className="text-rose-400 font-semibold uppercase text-[8px] block">Arterial Supply:</span>
          <span className="text-slate-300 block">{organ.bloodSupply.join(', ')}</span>
        </div>
        <div>
          <span className="text-blue-400 font-semibold uppercase text-[8px] block">Venous Drainage:</span>
          <span className="text-slate-300 block">{organ.venousDrainage.join(', ')}</span>
        </div>
        <div>
          <span className="text-amber-400 font-semibold uppercase text-[8px] block">Innervation:</span>
          <span className="text-slate-300 block">{organ.innervation.join(', ')}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold uppercase text-[8px] block">Adjacent Structures:</span>
          <span className="text-slate-400 block">{organ.adjacentStructures.join(', ')}</span>
        </div>
      </div>

      {/* Clinical Notes & Common Pathologies */}
      <div className="flex flex-col gap-1 border-t border-slate-900 pt-2">
        <div>
          <span className="text-slate-400 font-semibold uppercase text-[8px] block flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" /> Clinical Notes:
          </span>
          <span className="text-slate-300 block italic leading-snug">{organ.clinicalNotes}</span>
        </div>
        <div className="mt-1">
          <span className="text-rose-400 font-semibold uppercase text-[8px] block flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-400" /> Common Pathologies:
          </span>
          <span className="text-slate-300 block">{organ.commonDiseases.join(', ')}</span>
        </div>
      </div>
    </div>
  );
};
