import React from 'react';
import { ENDOCRINE_GLANDS_CATALOG, EndocrineGlandComponent } from '../data/endocrineData';

interface EndocrineExplorerProps {
  selectedGlandId: string | null;
  onSelectGland: (id: string | null) => void;
  searchQuery: string;
}

export const EndocrineExplorer: React.FC<EndocrineExplorerProps> = ({
  selectedGlandId,
  onSelectGland,
  searchQuery,
}) => {
  const regions: Array<{ label: string; emoji: string; filter: (g: EndocrineGlandComponent) => boolean }> = [
    { label: 'Brain (Hypothalamus / Pituitary / Pineal)', emoji: '🧠', filter: g => g.region === 'Brain' },
    { label: 'Neck & Chest (Thyroid / Parathyroids / Thymus)', emoji: '🦋', filter: g => g.region === 'Neck & Chest' },
    { label: 'Abdomen (Adrenals / Pancreas)', emoji: '🔋', filter: g => g.region === 'Abdomen' },
    { label: 'Pelvis / Gonads (Ovaries / Testes)', emoji: '🧬', filter: g => g.region === 'Pelvis / Gonads' },
  ];

  const filteredNodes = ENDOCRINE_GLANDS_CATALOG.filter(g => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.latinName.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin select-none">
      {regions.map((reg, idx) => {
        const glandsInRegion = filteredNodes.filter(reg.filter);
        if (glandsInRegion.length === 0) return null;

        return (
          <div key={`end_reg_${idx}`} className="text-xs">
            <div className="font-extrabold text-purple-400 bg-slate-950/40 px-2 py-1.5 rounded-lg border border-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>{reg.emoji}</span>
                <span>{reg.label}</span>
              </span>
              <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.2 rounded font-mono">
                {glandsInRegion.length}
              </span>
            </div>

            <div className="pl-3 mt-1 flex flex-col gap-1 border-l border-slate-900/80 ml-2">
              {glandsInRegion.map(gland => {
                const isSelected = selectedGlandId === gland.id;

                return (
                  <button
                    key={`end_tree_${gland.id}`}
                    onClick={() => onSelectGland(isSelected ? null : gland.id)}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'text-purple-400 bg-purple-500/10 font-bold border-l-2 border-purple-500 pl-3'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                    }`}
                  >
                    <span className="truncate">{gland.name}</span>
                    <span className="text-[9px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {gland.location}
                    </span>
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
