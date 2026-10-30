export interface ImmuneLymphaticStructureComponent {
  id: string;
  name: string;
  latinName: string;
  system: 'Immune & Lymphatic System' | 'Lymphatic System';
  subsystem: 'immune' | 'lymphatic' | 'lymphatic_immune';
  location: string;
  region: 'Lymphatic Organs' | 'Lymph Nodes' | 'Lymphatic Vessels' | 'Lymphatic Tissue';
  priority?: number; // Higher number wins over background channels (default 100 for specific organs, 10 for broad channels)
  parent?: string;
  children?: string[];
  points?: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  shapeType: 'polygon' | 'ellipse';
  description: string;
  clinicalNotes: string;
}

export const IMMUNE_LYMPHATIC_STRUCTURES_CATALOG: ImmuneLymphaticStructureComponent[] = [
  // ── Background Lymphatic Channels (Priority 10) ───────────────────────
  {
    id: 'lymphatic_vessels',
    name: 'Lymphatic Vessels & Capillaries',
    latinName: 'Vasa lymphatica',
    system: 'Lymphatic System',
    subsystem: 'lymphatic',
    location: 'Pervasive systemic channels throughout body tissues',
    region: 'Lymphatic Vessels',
    priority: 10,
    shapeType: 'polygon',
    points: '138,110 202,110 216,340 124,340',
    description: 'Valved endothelial channels transporting interstitial fluid (lymph) and immune cells back to venous circulation.',
    clinicalNotes: 'Lymphatic obstruction leads to lymphedema and tissue swelling.'
  },

  // ── Lymphatic Organs (Priority 100) ──────────────────────────────────
  {
    id: 'spleen',
    name: 'Spleen',
    latinName: 'Lien',
    system: 'Immune & Lymphatic System',
    subsystem: 'immune',
    location: 'Left upper abdomen (Left hypochondrium)',
    region: 'Lymphatic Organs',
    priority: 100,
    shapeType: 'polygon',
    points: '186,218 206,218 212,246 190,252 182,234',
    description: 'Largest lymphatic organ filtering blood, removing senescent erythrocytes, and mounting humoral and cell-mediated immune responses.',
    clinicalNotes: 'Prone to rupture in blunt abdominal trauma; splenectomy increases risk of encapsulated bacterial sepsis.'
  },
  {
    id: 'thymus',
    name: 'Thymus Gland',
    latinName: 'Thymus',
    system: 'Immune & Lymphatic System',
    subsystem: 'immune',
    location: 'Anterior superior mediastinum / behind sternum',
    region: 'Lymphatic Organs',
    priority: 100,
    shapeType: 'polygon',
    points: '162,130 178,130 180,154 160,154',
    description: 'Primary lymphoid organ responsible for T-lymphocyte maturation, central tolerance induction, and thymic hormone secretion.',
    clinicalNotes: 'Undergoes physiological involution after puberty, replaced by adipose tissue.'
  },
  {
    id: 'tonsils',
    name: 'Tonsils (Palatine & Pharyngeal)',
    latinName: 'Tonsillae',
    system: 'Immune & Lymphatic System',
    subsystem: 'immune',
    location: 'Oropharynx and nasopharyngeal wall (Waldeyer ring)',
    region: 'Lymphatic Organs',
    priority: 100,
    shapeType: 'ellipse',
    cx: 170,
    cy: 78,
    rx: 16,
    ry: 8,
    description: 'Mucosa-associated lymphoid tissues guarding oral and nasal entryways against inhaled and ingested pathogens.',
    clinicalNotes: 'Palatine tonsil hypertrophy causes recurrent tonsillitis and upper airway obstruction.'
  },
  {
    id: 'bone_marrow',
    name: 'Bone Marrow (Red Marrow)',
    latinName: 'Medulla ossium rubra',
    system: 'Immune & Lymphatic System',
    subsystem: 'immune',
    location: 'Medullary cavities of flat & long bones (femur, pelvis, sternum)',
    region: 'Lymphatic Organs',
    priority: 90,
    shapeType: 'polygon',
    points: '136,360 148,360 144,450 132,450 192,360 204,360 208,450 196,450',
    description: 'Primary hematopoietic site producing B-cells, T-cell precursors, granulocytes, monocytes, erythrocytes, and platelets.',
    clinicalNotes: 'Site of leukemogenesis and stem cell transplantation.'
  },

  // ── Lymph Nodes (Priority 80–100) ─────────────────────────────────────
  {
    id: 'cervical_lymph_nodes',
    name: 'Cervical Lymph Nodes',
    latinName: 'Nodi lymphoidei cervicales',
    system: 'Lymphatic System',
    subsystem: 'lymphatic_immune',
    location: 'Anterior and lateral neck chains',
    region: 'Lymph Nodes',
    priority: 85,
    shapeType: 'ellipse',
    cx: 170,
    cy: 98,
    rx: 22,
    ry: 10,
    description: 'Superficial and deep lymph node chains filtering lymph from head, scalp, pharynx, and oral cavity.',
    clinicalNotes: 'Cervical lymphadenopathy is common in viral upper respiratory infections and head/neck lymphomas.'
  },
  {
    id: 'axillary_lymph_nodes',
    name: 'Axillary Lymph Nodes',
    latinName: 'Nodi lymphoidei axillares',
    system: 'Lymphatic System',
    subsystem: 'lymphatic_immune',
    location: 'Axillary fossa / armpits',
    region: 'Lymph Nodes',
    priority: 85,
    shapeType: 'polygon',
    points: '116,138 142,138 138,162 112,162 198,138 224,138 228,162 202,162',
    description: 'Clusters of 20–30 nodes receiving lymphatic drainage from upper limb, chest wall, and breast.',
    clinicalNotes: 'Primary sentinel node target for breast cancer staging and surgical dissection.'
  },
  {
    id: 'mediastinal_lymph_nodes',
    name: 'Mediastinal Lymph Nodes',
    latinName: 'Nodi lymphoidei mediastinales',
    system: 'Lymphatic System',
    subsystem: 'lymphatic_immune',
    location: 'Superior and posterior mediastinum around tracheobronchial tree',
    region: 'Lymph Nodes',
    priority: 85,
    shapeType: 'polygon',
    points: '154,156 186,156 188,184 152,184',
    description: 'Deep thoracic nodes filtering lymph from heart, lungs, esophagus, and thoracic trachea.',
    clinicalNotes: 'Enlarged in sarcoidosis, tuberculosis, and bronchogenic carcinoma metastases.'
  },
  {
    id: 'abdominal_lymph_nodes',
    name: 'Abdominal & Mesenteric Lymph Nodes',
    latinName: 'Nodi lymphoidei abdominales',
    system: 'Lymphatic System',
    subsystem: 'lymphatic_immune',
    location: 'Retroperitoneum and intestinal mesentery along abdominal aorta',
    region: 'Lymph Nodes',
    priority: 80,
    shapeType: 'polygon',
    points: '150,210 190,210 192,260 148,260',
    description: 'Extensive nodal network filtering lymph from gastrointestinal tract, liver, pancreas, and kidneys.',
    clinicalNotes: 'Mesenteric adenitis mimics acute appendicitis in pediatric patients.'
  },
  {
    id: 'inguinal_lymph_nodes',
    name: 'Inguinal Lymph Nodes',
    latinName: 'Nodi lymphoidei inguinales',
    system: 'Lymphatic System',
    subsystem: 'lymphatic_immune',
    location: 'Femoral triangle / groin fold',
    region: 'Lymph Nodes',
    priority: 85,
    shapeType: 'polygon',
    points: '136,280 160,280 156,310 132,310 180,280 204,280 208,310 184,310',
    description: 'Superficial and deep nodes draining lower extremity, perineum, external genitalia, and lower abdominal wall.',
    clinicalNotes: 'Painful swelling occurs in lower limb cellulitis or sexually transmitted infections.'
  },

  // ── Specific Lymphatic Ducts & Tissue (Priority 90–100) ──────────────
  {
    id: 'thoracic_duct',
    name: 'Thoracic Duct',
    latinName: 'Ductus thoracicus',
    system: 'Lymphatic System',
    subsystem: 'lymphatic',
    location: 'Posterior mediastinum (Cisterna chyli to left subclavian vein)',
    region: 'Lymphatic Vessels',
    priority: 95,
    shapeType: 'polygon',
    points: '166,112 174,112 174,236 166,236',
    description: 'Main lymphatic trunk returning ~75% of body lymph (left head/neck, left arm, thorax, abdomen, and lower limbs) into left venous angle.',
    clinicalNotes: 'Iatrogenic damage or trauma causes chylothorax (chyle accumulation in pleural space).'
  },
  {
    id: 'right_lymphatic_duct',
    name: 'Right Lymphatic Duct',
    latinName: 'Ductus lymphaticus dexter',
    system: 'Lymphatic System',
    subsystem: 'lymphatic',
    location: 'Right root of neck (terminates at right subclavian vein junction)',
    region: 'Lymphatic Vessels',
    priority: 95,
    shapeType: 'polygon',
    points: '158,110 166,110 166,128 158,128',
    description: 'Short lymphatic duct returning lymph from right upper extremity, right chest, and right head/neck into right subclavian vein.',
    clinicalNotes: 'Drains upper right quadrant of the body.'
  },
  {
    id: 'peyers_patches',
    name: 'Peyer\'s Patches',
    latinName: 'Noduli lymphoidei aggregati',
    system: 'Immune & Lymphatic System',
    subsystem: 'immune',
    location: 'Ileum of small intestine (mucosa & submucosa)',
    region: 'Lymphatic Tissue',
    priority: 100,
    shapeType: 'ellipse',
    cx: 170,
    cy: 242,
    rx: 18,
    ry: 12,
    description: 'Aggregated lymphoid follicles in small intestine sampling gut antigens and generating secretory IgA antibodies.',
    clinicalNotes: 'Target site for Salmonella enterica serovar Typhi invasion causing typhoid fever.'
  },
  {
    id: 'appendix',
    name: 'Vermiform Appendix',
    latinName: 'Appendix vermiformis',
    system: 'Immune & Lymphatic System',
    subsystem: 'immune',
    location: 'Right lower quadrant / cecal base',
    region: 'Lymphatic Tissue',
    priority: 100,
    shapeType: 'polygon',
    points: '140,248 152,248 150,268 138,268',
    description: 'Vestigial cecal pouch rich in lymphoid tissue serving as a safe-house reservoir for commensal gut microbiota.',
    clinicalNotes: 'Lumen obstruction by fecalith leads to acute appendicitis.'
  }
];

export const IMMUNE_LYMPHATIC_CATALOG_MAP: Record<string, ImmuneLymphaticStructureComponent> = IMMUNE_LYMPHATIC_STRUCTURES_CATALOG.reduce(
  (acc, struct) => {
    acc[struct.id] = struct;
    return acc;
  },
  {} as Record<string, ImmuneLymphaticStructureComponent>
);
