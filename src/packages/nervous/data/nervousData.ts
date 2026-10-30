export interface NervousStructureComponent {
  id: string;
  name: string;
  latinName: string;
  system: 'Central Nervous System' | 'Peripheral Nervous System';
  location: string;
  region: 'Central Nervous System' | 'Peripheral Nervous System';
  subCategory: 'Brain' | 'Spinal Cord' | 'Cranial & Spinal Nerves' | 'Nerve Plexuses & Peripheral Nerves';
  parent?: string;
  children?: string[];
  points?: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  shapeType: 'polygon' | 'ellipse';
  description: string;
  innervationRegion: string[];
  clinicalNotes: string;
}

export const NERVOUS_STRUCTURES_CATALOG: NervousStructureComponent[] = [
  // ── Central Nervous System: Brain & Divisions ──────────────────────────
  {
    id: 'brain',
    name: 'Brain',
    latinName: 'Encephalon',
    system: 'Central Nervous System',
    location: 'Cranial cavity',
    region: 'Central Nervous System',
    subCategory: 'Brain',
    children: ['cerebrum', 'cerebellum', 'brainstem'],
    shapeType: 'polygon',
    points: '144,22 170,14 196,22 204,44 192,68 170,72 148,68 136,44',
    description: 'Master central control organ processing sensory information, initiating motor commands, and governing higher cognitive functions.',
    innervationRegion: ['Entire body via spinal cord & cranial nerves'],
    clinicalNotes: 'Enclosed within meninges and cerebrospinal fluid; susceptible to ischemic stroke, trauma, and neurodegenerative disorders.'
  },
  {
    id: 'cerebrum',
    name: 'Cerebrum (Cerebral Hemispheres)',
    latinName: 'Telencephalon',
    system: 'Central Nervous System',
    location: 'Superior cranial vault',
    region: 'Central Nervous System',
    subCategory: 'Brain',
    parent: 'brain',
    shapeType: 'polygon',
    points: '146,24 170,16 194,24 202,42 190,56 170,58 150,56 138,42',
    description: 'Largest brain region composed of paired left and right cerebral hemispheres executing sensory perception, voluntary motor control, language, and memory.',
    innervationRegion: ['Contralateral body musculature and sensory fields'],
    clinicalNotes: 'Divided into Frontal, Parietal, Temporal, and Occipital lobes.'
  },
  {
    id: 'cerebellum',
    name: 'Cerebellum',
    latinName: 'Cerebellum',
    system: 'Central Nervous System',
    location: 'Infratentorial / posterior cranial fossa',
    region: 'Central Nervous System',
    subCategory: 'Brain',
    parent: 'brain',
    shapeType: 'polygon',
    points: '182,58 198,58 204,72 186,76 178,68',
    description: 'Posterior brain structure coordinating fine motor movements, balance, equilibrium, and procedural motor learning.',
    innervationRegion: ['Ipsilateral motor execution pathways'],
    clinicalNotes: 'Lesions lead to ataxia, dysmetria, intention tremor, and dysdiadochokinesia.'
  },
  {
    id: 'brainstem',
    name: 'Brainstem',
    latinName: 'Truncus encephalicus',
    system: 'Central Nervous System',
    location: 'Basilar cranial fossa / anterior to cerebellum',
    region: 'Central Nervous System',
    subCategory: 'Brain',
    parent: 'brain',
    children: ['cranial_nerves'],
    shapeType: 'polygon',
    points: '164,58 178,58 176,82 164,82',
    description: 'Stalk consisting of midbrain, pons, and medulla oblongata containing vital respiratory, cardiac, and vasomotor reflex centers.',
    innervationRegion: ['Cranial nerves III–XII and autonomic cardiac/respiratory centers'],
    clinicalNotes: 'Brainstem herniation or ischemic infarction rapidly causes coma and respiratory arrest.'
  },

  // ── Central Nervous System: Spinal Cord ───────────────────────────────
  {
    id: 'spinal_cord',
    name: 'Spinal Cord',
    latinName: 'Medulla spinalis',
    system: 'Central Nervous System',
    location: 'Vertebral canal (C1 to L1/L2 level)',
    region: 'Central Nervous System',
    subCategory: 'Spinal Cord',
    children: ['cervical_nerves', 'thoracic_nerves', 'lumbar_plexus', 'sacral_plexus'],
    shapeType: 'polygon',
    points: '166,82 174,82 174,270 166,270',
    description: 'Tubular bundle of nervous tissue extending from medulla oblongata through vertebral canal, transmitting ascending sensory and descending motor tracts.',
    innervationRegion: ['Entire body below head via spinal nerves'],
    clinicalNotes: 'Terminates as conus medullaris; transection results in quadriplegia (cervical) or paraplegia (thoracic/lumbar).'
  },

  // ── Peripheral Nervous System: Nerves & Segments ───────────────────────
  {
    id: 'cranial_nerves',
    name: 'Cranial Nerves (CN I–XII)',
    latinName: 'Nervi craniales',
    system: 'Peripheral Nervous System',
    location: 'Cranial foramina / Head and neck',
    region: 'Peripheral Nervous System',
    subCategory: 'Cranial & Spinal Nerves',
    parent: 'brainstem',
    shapeType: 'ellipse',
    cx: 170,
    cy: 70,
    rx: 24,
    ry: 16,
    description: 'Twelve paired peripheral nerves originating directly from brain and brainstem innervating head, neck, facial musculature, and special senses.',
    innervationRegion: ['Facial muscles, eyes, inner ear, tongue, pharynx, larynx, and thoracic/abdominal viscera (Vagus)'],
    clinicalNotes: 'Includes Olfactory (I), Optic (II), Oculomotor (III), Trigeminal (V), Facial (VII), and Vagus (X).'
  },
  {
    id: 'cervical_nerves',
    name: 'Cervical Spinal Nerves (C1–C8)',
    latinName: 'Nervi cervicales',
    system: 'Peripheral Nervous System',
    location: 'Cervical vertebral region (neck)',
    region: 'Peripheral Nervous System',
    subCategory: 'Cranial & Spinal Nerves',
    parent: 'spinal_cord',
    shapeType: 'polygon',
    points: '150,88 190,88 186,124 154,124',
    description: 'Eight paired cervical spinal nerve roots emerging above and below cervical vertebrae innervating neck, diaphragm (Phrenic nerve C3–C5), and upper limbs.',
    innervationRegion: ['Neck, shoulders, diaphragm, and upper extremity sensory dermatomes'],
    clinicalNotes: 'C3–C5 nerve roots form the Phrenic nerve ("C3, 4, 5 keeps the diaphragm alive").'
  },
  {
    id: 'brachial_plexus',
    name: 'Brachial Plexus',
    latinName: 'Plexus brachialis',
    system: 'Peripheral Nervous System',
    location: 'Axillary region / supraclavicular fossa (C5–T1 roots)',
    region: 'Peripheral Nervous System',
    subCategory: 'Nerve Plexuses & Peripheral Nerves',
    parent: 'cervical_nerves',
    shapeType: 'polygon',
    points: '124,118 152,118 142,142 114,142 188,118 216,118 226,142 198,142',
    description: 'Network of nerve fibers formed by ventral rami of C5–T1 giving rise to major peripheral nerves supplying the upper extremity.',
    innervationRegion: ['Axillary, Musculocutaneous, Radial, Median, and Ulnar nerve fields'],
    clinicalNotes: 'Erb palsy results from upper trunk injury (C5–C6); Klumpke palsy affects lower trunk (C8–T1).'
  },
  {
    id: 'thoracic_nerves',
    name: 'Thoracic Spinal Nerves (T1–T12)',
    latinName: 'Nervi thoracici',
    system: 'Peripheral Nervous System',
    location: 'Intercostal spaces of thoracic wall',
    region: 'Peripheral Nervous System',
    subCategory: 'Cranial & Spinal Nerves',
    parent: 'spinal_cord',
    shapeType: 'polygon',
    points: '148,130 192,130 196,218 144,218',
    description: 'Twelve pairs of thoracic spinal nerve roots extending as intercostal nerves supplying intercostal muscles, anterolateral abdominal wall, and parietal pleura.',
    innervationRegion: ['Intercostal muscles, chest wall, abdominal wall dermatomes'],
    clinicalNotes: 'Herpes zoster (shingles) frequently reactivates along thoracic dermatomal distributions.'
  },
  {
    id: 'lumbar_plexus',
    name: 'Lumbar Plexus',
    latinName: 'Plexus lumbalis',
    system: 'Peripheral Nervous System',
    location: 'Posterior abdominal wall within psoas muscle (L1–L4 roots)',
    region: 'Peripheral Nervous System',
    subCategory: 'Nerve Plexuses & Peripheral Nerves',
    parent: 'spinal_cord',
    shapeType: 'polygon',
    points: '144,222 196,222 190,268 150,268',
    description: 'Nerve network formed by L1–L4 ventral rami supplying lower abdominal wall, anterior thigh musculature, and medial leg.',
    innervationRegion: ['Femoral nerve (anterior thigh) and Obturator nerve (adductors)'],
    clinicalNotes: 'Femoral nerve compression impairs knee extension and anterior thigh cutaneous sensation.'
  },
  {
    id: 'sacral_plexus',
    name: 'Sacral Plexus',
    latinName: 'Plexus sacralis',
    system: 'Peripheral Nervous System',
    location: 'Posterior pelvic wall (L4–S4 roots)',
    region: 'Peripheral Nervous System',
    subCategory: 'Nerve Plexuses & Peripheral Nerves',
    parent: 'spinal_cord',
    children: ['sciatic_nerve'],
    shapeType: 'polygon',
    points: '150,270 190,270 186,306 154,306',
    description: 'Pelvic nerve plexus derived from L4–S4 spinal roots providing motor and sensory innervation to gluteal region, posterior thigh, leg, and foot.',
    innervationRegion: ['Sciatic nerve, Gluteal nerves, Pudendal nerve, and posterior cutaneous nerve of thigh'],
    clinicalNotes: 'Gives rise to Sciatic nerve, the largest single nerve in the human body.'
  },
  {
    id: 'sciatic_nerve',
    name: 'Sciatic Nerve',
    latinName: 'Nervus ischiadicus',
    system: 'Peripheral Nervous System',
    location: 'Gluteal region through posterior thigh into popliteal fossa',
    region: 'Peripheral Nervous System',
    subCategory: 'Nerve Plexuses & Peripheral Nerves',
    parent: 'sacral_plexus',
    shapeType: 'polygon',
    points: '142,306 154,306 150,440 140,440 186,306 198,306 200,440 190,440',
    description: 'Major nerve of lower extremity arising from L4–S3 roots, dividing into tibial and common fibular nerves in posterior thigh.',
    innervationRegion: ['Hamstring muscles, posterior leg, anterior leg, lateral leg, and plantar foot'],
    clinicalNotes: 'Sciatica causes radiating pain down posterior thigh and leg due to herniated lumbar disc (L4/L5 or L5/S1).'
  }
];

export const NERVOUS_CATALOG_MAP: Record<string, NervousStructureComponent> = NERVOUS_STRUCTURES_CATALOG.reduce(
  (acc, struct) => {
    acc[struct.id] = struct;
    return acc;
  },
  {} as Record<string, NervousStructureComponent>
);
