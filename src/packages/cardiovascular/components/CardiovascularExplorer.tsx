import React from 'react';
import { VesselComponent, VascularRegion } from '../entities/VesselComponent';
import { ALL_CARDIOVASCULAR_NODES } from '../data/cardiovascularData';
import { ChevronRight, Heart, GitBranch, ShieldAlert } from 'lucide-react';

interface CardiovascularExplorerProps {
  selectedVesselId: string | null;
  onSelectVessel: (id: string | null) => void;
  searchQuery: string;
}

export const CardiovascularExplorer: React.FC<CardiovascularExplorerProps> = ({
  selectedVesselId,
  onSelectVessel,
  searchQuery,
}) => {
  const regions: Array<{ key: VascularRegion; label: string; emoji: string }> = [
    { key: 'heart', label: 'Heart & Chambers', emoji: '🫀' },
    { key: 'coronary', label: 'Coronary Circulation', emoji: '❤️' },
    { key: 'pulmonary', label: 'Pulmonary Circulation', emoji: '🫁' },
    { key: 'head', label: 'Head & Cerebrovascular', emoji: '🧠' },
    { key: 'neck', label: 'Neck & Carotids', emoji: '🦒' },
    { key: 'thorax', label: 'Thorax & Aorta', emoji: '🫁' },
    { key: 'upper_limb', label: 'Upper Limb', emoji: '🦾' },
    { key: 'abdomen', label: 'Abdomen & Visceral', emoji: '🩺' },
    { key: 'pelvis', label: 'Pelvis & Iliac', emoji: '🦴' },
    { key: 'lower_limb', label: 'Lower Limb', emoji: '🦵' },
  ];

  const filteredNodes = ALL_CARDIOVASCULAR_NODES.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.displayName.toLowerCase().includes(q) ||
      v.latinName.toLowerCase().includes(q) ||
      v.region.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin select-none">
      {regions.map((reg) => {
        const vesselsInRegion = filteredNodes.filter((v) => v.region === reg.key);
        if (vesselsInRegion.length === 0) return null;

        return (
          <div key={reg.key} className="text-xs">
            <div className="font-extrabold text-slate-400 bg-slate-950/40 px-2 py-1.5 rounded-lg border border-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>{reg.emoji}</span>
                <span>{reg.label}</span>
              </span>
              <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.2 rounded font-mono">
                {vesselsInRegion.length}
              </span>
            </div>

            <div className="pl-3 mt-1 flex flex-col gap-1 border-l border-slate-900/80 ml-2">
              {vesselsInRegion.map((vessel) => {
                const isSelected = selectedVesselId === vessel.id;
                return (
                  <button
                    key={vessel.id}
                    onClick={() => onSelectVessel(isSelected ? null : vessel.id)}
                    className={`w-full text-left py-1 px-2 rounded-lg text-[10.5px] transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                    }`}
                  >
                    <span className="truncate">├─ {vessel.displayName}</span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase">{vessel.vesselType[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
