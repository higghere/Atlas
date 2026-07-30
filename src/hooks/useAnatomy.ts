import { useState, useEffect, useCallback, useMemo } from 'react';
import { LayerManager } from '../engine/anatomy/LayerManager';
import { SelectionManager } from '../engine/anatomy/SelectionManager';
import { HighlightManager } from '../engine/anatomy/HighlightManager';
import { AnatomyLoader } from '../engine/anatomy/AnatomyLoader';
import { StructureMetadata } from '../engine/anatomy/AnatomyRegistry';

import heartSvg from '../assets/anatomy/cardiovascular/heart.svg?url';
import arteriesSvg from '../assets/anatomy/cardiovascular/arteries.svg?url';
import veinsSvg from '../assets/anatomy/cardiovascular/veins.svg?url';
import pulmonarySvg from '../assets/anatomy/cardiovascular/pulmonary.svg?url';
import metadataUrl from '../assets/anatomy/cardiovascular/metadata.json?url';

export const useAnatomy = () => {
  const layerManager = useMemo(() => new LayerManager(), []);
  const selectionManager = useMemo(() => new SelectionManager(), []);
  const highlightManager = useMemo(() => new HighlightManager(), []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, StructureMetadata>>({});
  const [svgContent, setSvgContent] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    return selectionManager.subscribe(setSelectedId);
  }, [selectionManager]);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const meta = await AnatomyLoader.loadMetadata('cardiovascular', metadataUrl);
        setMetadata(meta);

        const [heart, arteries, veins, pulmonary] = await Promise.all([
          AnatomyLoader.loadSVG(heartSvg),
          AnatomyLoader.loadSVG(arteriesSvg),
          AnatomyLoader.loadSVG(veinsSvg),
          AnatomyLoader.loadSVG(pulmonarySvg),
        ]);

        setSvgContent({
          heart,
          arteries,
          veins,
          pulmonary,
        });
      } catch (err) {
        console.error('Failed to load cardiovascular SVG assets:', err);
      }
    };

    loadAssets();
  }, []);

  const handleSelect = useCallback((id: string | null) => {
    selectionManager.select(id);
  }, [selectionManager]);

  const handleHover = useCallback((id: string | null) => {
    highlightManager.setHovered(id);
    setHoveredId(id);
  }, [highlightManager]);

  const selectedMetadata = useMemo(() => {
    if (!selectedId) return null;
    return metadata[selectedId] || {
      id: selectedId,
      name: selectedId.replace(/_/g, ' ').toUpperCase(),
      system: 'Cardiovascular',
      type: 'Structure',
      description: 'Anatomical cardiovascular structure.',
      bloodSupply: [],
      innervation: [],
    };
  }, [selectedId, metadata]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return Object.values(metadata).filter(item =>
      item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query)
    );
  }, [searchQuery, metadata]);

  return {
    layerManager,
    selectionManager,
    highlightManager,
    selectedId,
    hoveredId,
    selectedMetadata,
    svgContent,
    searchQuery,
    searchResults,
    setSearchQuery,
    handleSelect,
    handleHover,
  };
};
