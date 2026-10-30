import React from 'react';
import { EndocrineGlandComponent } from '../data/endocrineData';
import { Stethoscope, Activity, MapPin } from 'lucide-react';

interface EndocrineInspectorProps {
  gland: EndocrineGlandComponent;
  onSelectGland: (id: string | null) => void;
}

export const EndocrineInspector: React.FC<EndocrineInspectorProps> = ({
  gland,
  onSelectGland,
}) => {
  return (
    <div className="text-[10px] text-slate-300 flex flex-col gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-900 shadow-xl max-h-[480px] overflow-y-auto select-text scrollbar-thin">
      {/* Header Title & System Badge */}
      <div className="flex justify-between items-start border-b border-slate-900 pb-2">
        <div>
          <div className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest mb-0.5">
            ENDOCRINE SYSTEM
          </div>
          <div className="font-extrabold text-purple-300 text-xs leading-tight flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
            {gland.name}
          </div>
          <div className="text-[8.5px] text-slate-500 uppercase font-semibold font-mono tracking-wider">
            {gland.latinName}
          </div>
        </div>
        <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-800">
          {gland.region}
        </span>
      </div>

      {/* Structured System & Location Panel */}
      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-850 flex flex-col gap-1 font-mono text-[9px]">
        <div className="flex justify-between">
          <span className="text-slate-500 uppercase">System:</span>
          <span className="text-purple-300 font-bold">{gland.system}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 uppercase flex items-center gap-1">
            <MapPin className="w-3 h-3 text-purple-400" /> Location:
          </span>
          <span className="text-slate-200 font-semibold">{gland.location}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 leading-snug bg-slate-900/40 p-2 rounded-lg border border-slate-850">
        {gland.description}
      </p>

      {/* Secreted Hormones & Target Organs */}
      <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-2">
        <div>
          <span className="text-purple-400 font-semibold uppercase text-[8px] block">Secreted Hormones:</span>
          <span className="text-slate-300 block">{gland.secretedHormones.join(', ')}</span>
        </div>
        <div>
          <span className="text-cyan-400 font-semibold uppercase text-[8px] block">Target Organs:</span>
          <span className="text-slate-300 block">{gland.targetOrgans.join(', ')}</span>
        </div>
        <div>
          <span className="text-amber-400 font-semibold uppercase text-[8px] block">Innervation:</span>
          <span className="text-slate-300 block">{gland.innervation.join(', ')}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold uppercase text-[8px] block">Adjacent Structures:</span>
          <span className="text-slate-400 block">{gland.adjacentStructures.join(', ')}</span>
        </div>
      </div>

      {/* Clinical Notes & Common Diseases */}
      <div className="flex flex-col gap-1 border-t border-slate-900 pt-2">
        <div>
          <span className="text-slate-400 font-semibold uppercase text-[8px] block">Clinical Notes:</span>
          <span className="text-slate-300 block leading-tight">{gland.clinicalNotes}</span>
        </div>
        <div className="mt-1">
          <span className="text-rose-400 font-semibold uppercase text-[8px] block">Associated Disorders:</span>
          <span className="text-rose-300 block font-mono text-[8.5px]">{gland.commonDiseases.join(' • ')}</span>
        </div>
      </div>
    </div>
  );
};
