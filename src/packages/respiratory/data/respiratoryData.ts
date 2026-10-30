export interface RespiratoryStructureComponent {
  id: string;
  name: string;
  latinName: string;
  system: 'Respiratory System';
  location: string;
  region: 'Upper Respiratory Tract' | 'Lower Respiratory Tract' | 'Supporting Structures';
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

export const RESPIRATORY_STRUCTURES_CATALOG: RespiratoryStructureComponent[] = [
  // ── Upper Respiratory Tract ───────────────────────────────────────────
  {
    id: 'nose',
    name: 'Nose',
    latinName: 'Nasus',
    system: 'Respiratory System',
    location: 'Facial midline / anterior skull',
    region: 'Upper Respiratory Tract',
    children: ['nasal_cavity'],
    shapeType: 'polygon',
    points: '162,38 174,36 178,56 160,56',
    description: 'External facial structure forming entry of respiratory tract, containing nostrils and vestibule for air intake.',
    clinicalNotes: 'Functions in air conditioning, humidification, and olfaction.'
  },
  {
    id: 'nasal_cavity',
    name: 'Nasal Cavity',
    latinName: 'Cavitas nasi',
    system: 'Respiratory System',
    location: 'Internal cranial skull vault / superior to palate',
    region: 'Upper Respiratory Tract',
    parent: 'nose',
    children: ['pharynx'],
    shapeType: 'polygon',
    points: '154,34 182,34 186,58 152,58',
    description: 'Large air-filled space behind nose lined with pseudostratified ciliated columnar mucosa to warm and filter inspired air.',
    clinicalNotes: 'Divided by nasal septum; lined with erectile vascular tissue (conchae).'
  },
  {
    id: 'oral_cavity',
    name: 'Oral Cavity',
    latinName: 'Cavitas oris',
    system: 'Respiratory System',
    location: 'Inferior to nasal cavity / anterior pharynx',
    region: 'Upper Respiratory Tract',
    shapeType: 'polygon',
    points: '154,60 182,60 180,76 156,76',
    description: 'Secondary airway entry pathway used during increased ventilatory demand or nasal obstruction.',
    clinicalNotes: 'Bypasses nasal filtration and humidification when breathing orally.'
  },
  {
    id: 'pharynx',
    name: 'Pharynx',
    latinName: 'Pharynx',
    system: 'Respiratory System',
    location: 'Posterior to nasal and oral cavities (C1–C6)',
    region: 'Upper Respiratory Tract',
    parent: 'nasal_cavity',
    children: ['larynx'],
    shapeType: 'polygon',
    points: '164,62 178,62 178,92 164,92',
    description: 'Muscular tube divided into nasopharynx, oropharynx, and laryngopharynx conducting air to larynx.',
    clinicalNotes: 'Shared anatomical conduit for respiratory gas flow and digestive alimentary bolus.'
  },
  {
    id: 'larynx',
    name: 'Larynx (Voice Box)',
    latinName: 'Larynx',
    system: 'Respiratory System',
    location: 'Anterior neck (C3–C6 level)',
    region: 'Upper Respiratory Tract',
    parent: 'pharynx',
    children: ['trachea'],
    shapeType: 'polygon',
    points: '162,94 180,94 182,118 160,118',
    description: 'Cartilaginous organ containing vocal folds controlling phonation and preventing aspiration during deglutition.',
    clinicalNotes: 'Protected superiorly by epiglottis; thyroid cartilage forms Adam\'s apple.'
  },

  // ── Lower Respiratory Tract ───────────────────────────────────────────
  {
    id: 'trachea',
    name: 'Trachea (Windpipe)',
    latinName: 'Trachea',
    system: 'Respiratory System',
    location: 'Anterior neck and superior mediastinum (C6–T5)',
    region: 'Lower Respiratory Tract',
    parent: 'larynx',
    children: ['right_main_bronchus', 'left_main_bronchus'],
    shapeType: 'polygon',
    points: '164,118 178,118 178,162 164,162',
    description: 'Flexible cartilaginous tube supported by 16–20 C-shaped hyaline rings conducting air from larynx to bronchi.',
    clinicalNotes: 'Bifurcates at carina (T5 level) into right and left primary bronchi.'
  },
  {
    id: 'right_main_bronchus',
    name: 'Right Main Bronchus',
    latinName: 'Bronchus principalis dexter',
    system: 'Respiratory System',
    location: 'Right superior hilum / thoracic cavity',
    region: 'Lower Respiratory Tract',
    parent: 'trachea',
    children: ['right_lung', 'bronchi'],
    shapeType: 'polygon',
    points: '148,162 166,162 144,180 134,174',
    description: 'Wider, shorter, and more vertical primary bronchus conducting air into right lung lobes.',
    clinicalNotes: 'Aspirated foreign bodies preferentially enter right main bronchus due to vertical alignment.'
  },
  {
    id: 'left_main_bronchus',
    name: 'Left Main Bronchus',
    latinName: 'Bronchus principalis sinister',
    system: 'Respiratory System',
    location: 'Left superior hilum / inferior to aortic arch',
    region: 'Lower Respiratory Tract',
    parent: 'trachea',
    children: ['left_lung', 'bronchi'],
    shapeType: 'polygon',
    points: '176,162 194,162 208,180 198,184',
    description: 'Narrower, longer, and more horizontal primary bronchus passing underneath aortic arch into left lung.',
    clinicalNotes: 'Crosses anterior to esophagus and thoracic aorta.'
  },
  {
    id: 'bronchi',
    name: 'Lobar & Segmental Bronchi',
    latinName: 'Bronchi lobares et segmentales',
    system: 'Respiratory System',
    location: 'Intrapulmonary bronchial tree',
    region: 'Lower Respiratory Tract',
    parent: 'right_main_bronchus',
    children: ['bronchioles'],
    shapeType: 'polygon',
    points: '130,174 150,174 152,204 126,204 190,174 212,174 216,204 188,204',
    description: 'Subdivided bronchial pathways conducting air to secondary lobar and tertiary segmental pulmonary units.',
    clinicalNotes: 'Contain smooth muscle and cartilaginous plates.'
  },
  {
    id: 'bronchioles',
    name: 'Bronchioles',
    latinName: 'Bronchioli',
    system: 'Respiratory System',
    location: 'Terminal intrapulmonary airways (<1mm diameter)',
    region: 'Lower Respiratory Tract',
    parent: 'bronchi',
    children: ['alveoli'],
    shapeType: 'polygon',
    points: '124,196 156,196 158,238 120,238 184,196 218,196 222,238 182,238',
    description: 'Small conducting airways lacking cartilage, lined with smooth muscle responsive to autonomic tone.',
    clinicalNotes: 'Primary site of bronchoconstriction in asthma and chronic obstructive airway diseases.'
  },
  {
    id: 'alveoli',
    name: 'Alveoli & Alveolar Sacs',
    latinName: 'Alveoli pulmonis',
    system: 'Respiratory System',
    location: 'Terminal respiratory zone of pulmonary parenchyma',
    region: 'Lower Respiratory Tract',
    parent: 'bronchioles',
    shapeType: 'polygon',
    points: '120,228 158,228 158,252 118,252 182,228 222,228 224,252 182,252',
    description: 'Microscopic thin-walled sacculations surrounded by pulmonary capillaries executing alveolocapillary gas exchange.',
    clinicalNotes: 'Total surface area ~70 m²; Type II pneumocytes produce pulmonary surfactant to reduce surface tension.'
  },

  // ── Supporting Structures ────────────────────────────────────────────
  {
    id: 'right_lung',
    name: 'Right Lung',
    latinName: 'Pulmo dexter',
    system: 'Respiratory System',
    location: 'Right hemithorax',
    region: 'Supporting Structures',
    children: ['pleura'],
    shapeType: 'polygon',
    points: '120,154 162,154 162,258 114,250 110,192',
    description: 'Trilobed pulmonary organ (Superior, Middle, Inferior lobes) separated by oblique and horizontal fissures.',
    clinicalNotes: 'Slightly larger and shorter than left lung due to underlying hepatic dome.'
  },
  {
    id: 'left_lung',
    name: 'Left Lung',
    latinName: 'Pulmo sinister',
    system: 'Respiratory System',
    location: 'Left hemithorax',
    region: 'Supporting Structures',
    children: ['pleura'],
    shapeType: 'polygon',
    points: '180,154 222,154 232,192 228,250 180,258',
    description: 'Bilobed pulmonary organ (Superior and Inferior lobes) featuring cardiac notch and lingula.',
    clinicalNotes: 'Accommodates cardiac apex impression on medial surface.'
  },
  {
    id: 'pleura',
    name: 'Pleura & Pleural Cavity',
    latinName: 'Pleura',
    system: 'Respiratory System',
    location: 'Thoracic cavities enclosing lungs',
    region: 'Supporting Structures',
    shapeType: 'polygon',
    points: '108,150 234,150 234,264 108,264',
    description: 'Serous membrane divided into visceral (lung surface) and parietal (chest wall) layers enclosing intrapleural fluid space.',
    clinicalNotes: 'Maintains negative intrapleural pressure crucial for pulmonary inflation.'
  },
  {
    id: 'diaphragm',
    name: 'Diaphragm',
    latinName: 'Diaphragma',
    system: 'Respiratory System',
    location: 'Thoracoabdominal boundary (T8–L2 level)',
    region: 'Supporting Structures',
    shapeType: 'polygon',
    points: '110,258 170,252 232,258 238,274 170,268 104,274',
    description: 'Dome-shaped musculotendinous sheet separating thoracic and abdominal cavities, serving as principal muscle of inspiration.',
    clinicalNotes: 'Innervated by Phrenic nerve (C3–C5); contraction increases thoracic vertical dimension.'
  }
];

export const RESPIRATORY_CATALOG_MAP: Record<string, RespiratoryStructureComponent> = RESPIRATORY_STRUCTURES_CATALOG.reduce(
  (acc, struct) => {
    acc[struct.id] = struct;
    return acc;
  },
  {} as Record<string, RespiratoryStructureComponent>
);
