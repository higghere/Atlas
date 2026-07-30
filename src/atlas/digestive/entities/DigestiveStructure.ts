export type DigestiveCategory = 'oral-cavity' | 'pharynx' | 'gi-tract' | 'accessory-organ' | 'duct' | 'sphincter' | 'histology' | 'liver-segment';
export type DigestiveView = 'anterior' | 'posterior' | 'left-lateral' | 'right-lateral' | 'superior' | 'inferior' | 'axial' | 'coronal' | 'sagittal';
export type PeritonealStatus = 'intraperitoneal' | 'retroperitoneal' | 'subperitoneal' | 'extraperitoneal' | 'mixed';

export interface DigestiveStructure {
  id: string; name: string; latinName: string; category: DigestiveCategory; subCategory: string;
  side: 'left' | 'right' | 'midline' | 'bilateral' | 'none'; parent?: string; children: string[];
  attachments: string[]; adjacentStructures: string[]; bloodSupply: string[]; venousDrainage: string[];
  lymphaticDrainage: string[]; innervation: string[]; compartments: string[]; peritonealStatus: PeritonealStatus;
  boundingBox: { x: number; y: number; width: number; height: number }; svgPath: string;
  projections: Record<DigestiveView, string>; metadata: {
    function: string; histology: string; embryologicalOrigin: 'foregut' | 'midgut' | 'hindgut' | 'ectoderm';
    clinicalImportance: string; commonDiseases: string[]; commonSurgeries: string[]; aliases: string[];
  };
  futureCompatibility: { cardiovascularAttachmentPoints: string[]; nervePlaceholders: string[]; lymphaticPlaceholders: string[]; physiologyHooks: string[]; pathologyHooks: string[]; };
}

export const DIGESTIVE_VIEWS: DigestiveView[] = ['anterior', 'posterior', 'left-lateral', 'right-lateral', 'superior', 'inferior', 'axial', 'coronal', 'sagittal'];
