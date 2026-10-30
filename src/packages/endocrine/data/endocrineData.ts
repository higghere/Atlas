export interface EndocrineGlandComponent {
  id: string;
  name: string;
  latinName: string;
  system: 'Endocrine System';
  location: string;
  region: 'Brain' | 'Neck & Chest' | 'Abdomen' | 'Pelvis / Gonads';
  parent?: string;
  children?: string[];
  points?: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  shapeType: 'polygon' | 'ellipse';
  description: string;
  secretedHormones: string[];
  targetOrgans: string[];
  innervation: string[];
  adjacentStructures: string[];
  clinicalNotes: string;
  commonDiseases: string[];
}

export const ENDOCRINE_GLANDS_CATALOG: EndocrineGlandComponent[] = [
  {
    id: 'hypothalamus',
    name: 'Hypothalamus',
    latinName: 'Hypothalamus',
    system: 'Endocrine System',
    location: 'Ventral diencephalon / base of brain',
    region: 'Brain',
    children: ['pituitary'],
    shapeType: 'ellipse',
    cx: 170,
    cy: 42,
    rx: 12,
    ry: 8,
    description: 'Master neuroendocrine control center regulating homeostasis, autonomic nervous system, and pituitary hormone secretion.',
    secretedHormones: ['CRH', 'TRH', 'GHRH', 'GnRH', 'Somatostatin', 'Dopamine', 'Oxytocin', 'Vasopressin (ADH)'],
    targetOrgans: ['Anterior Pituitary Gland', 'Posterior Pituitary Gland'],
    innervation: ['Autonomic nervous system', 'Limbic neural pathways'],
    adjacentStructures: ['Thalamus', 'Third Ventricle', 'Optic Chiasm'],
    clinicalNotes: 'Hypothalamic dysfunction leads to tertiary endocrine disorders, diabetes insipidus, and autonomic dysregulation.',
    commonDiseases: ['Hypothalamic Amenorrhea', 'Central Diabetes Insipidus', 'Prader-Willi Syndrome']
  },
  {
    id: 'pituitary',
    name: 'Pituitary Gland',
    latinName: 'Hypophysis cerebri',
    system: 'Endocrine System',
    location: 'Sella turcica of sphenoid bone',
    region: 'Brain',
    parent: 'hypothalamus',
    shapeType: 'ellipse',
    cx: 170,
    cy: 54,
    rx: 10,
    ry: 7,
    description: 'Master endocrine gland situated at the base of the skull, divided into anterior (adenohypophysis) and posterior (neurohypophysis) lobes.',
    secretedHormones: ['ACTH', 'TSH', 'GH', 'FSH', 'LH', 'Prolactin', 'Oxytocin (storage)', 'ADH (storage)'],
    targetOrgans: ['Thyroid', 'Adrenal Cortex', 'Gonads', 'Mammary Glands', 'Kidneys', 'Long Bones'],
    innervation: ['Infundibular stalk neurosecretory axons'],
    adjacentStructures: ['Sphenoid Sinus', 'Optic Chiasm', 'Cavernous Sinuses'],
    clinicalNotes: 'Pituitary adenomas can cause bitemporal hemianopia due to optic chiasm compression.',
    commonDiseases: ['Pituitary Adenoma', 'Acromegaly', 'Cushing Disease', 'Hypopituitarism']
  },
  {
    id: 'pineal',
    name: 'Pineal Gland',
    latinName: 'Glandula pinealis',
    system: 'Endocrine System',
    location: 'Epithalamus / posterior roof of third ventricle',
    region: 'Brain',
    shapeType: 'ellipse',
    cx: 178,
    cy: 36,
    rx: 7,
    ry: 6,
    description: 'Small cone-shaped endocrine gland synthesizing melatonin to govern circadian rhythms and sleep-wake cycles.',
    secretedHormones: ['Melatonin'],
    targetOrgans: ['Brain (Suprachiasmatic nucleus)', 'Peripheral vascular tissues'],
    innervation: ['Postganglionic sympathetic fibers from superior cervical ganglion'],
    adjacentStructures: ['Corpus Callosum', 'Superior Colliculi', 'Habular Commissure'],
    clinicalNotes: 'Calcification ("brain sand") is common in adults; pinealomas present with Parinaud syndrome.',
    commonDiseases: ['Pinealoma', 'Circadian Rhythm Sleep Disorders', 'Pineal Cyst']
  },
  {
    id: 'thyroid',
    name: 'Thyroid Gland',
    latinName: 'Glandula thyroidea',
    system: 'Endocrine System',
    location: 'Anterior neck (C5–T1 level)',
    region: 'Neck & Chest',
    children: ['parathyroids'],
    shapeType: 'polygon',
    points: '158,102 182,102 188,124 176,128 170,118 164,128 152,124',
    description: 'Butterfly-shaped endocrine gland in anterior neck producing thyroid hormones regulating basal metabolic rate.',
    secretedHormones: ['Thyroxine (T4)', 'Triiodothyronine (T3)', 'Calcitonin'],
    targetOrgans: ['Systemic Tissues', 'Skeletal Muscle', 'Liver', 'Heart', 'Bone Tissues'],
    innervation: ['Cervical sympathetic ganglia', 'Vagus nerve (CN X)'],
    adjacentStructures: ['Trachea', 'Larynx', 'Carotid Artery', 'Internal Jugular Vein', 'Parathyroid Glands'],
    clinicalNotes: 'Requires dietary iodine; disorders cause widespread metabolic acceleration (hyper) or slowing (hypo).',
    commonDiseases: ['Hashimoto Thyroiditis', 'Graves Disease', 'Goiter', 'Thyroid Carcinoma']
  },
  {
    id: 'parathyroids',
    name: 'Parathyroid Glands',
    latinName: 'Glandulae parathyroideae',
    system: 'Endocrine System',
    location: 'Posterior surface of thyroid lobes',
    region: 'Neck & Chest',
    parent: 'thyroid',
    shapeType: 'polygon',
    points: '154,106 158,106 158,110 154,110 182,106 186,106 186,110 182,110 154,118 158,118 158,122 154,122 182,118 186,118 186,122 182,122',
    description: 'Four small glandular bodies located on the posterior aspect of the thyroid gland regulating calcium and phosphate homeostasis.',
    secretedHormones: ['Parathyroid Hormone (PTH)'],
    targetOrgans: ['Bone Matrix', 'Kidney Tubules', 'Small Intestine (via Calcitriol)'],
    innervation: ['Cervical sympathetic ganglia'],
    adjacentStructures: ['Thyroid Gland', 'Recurrent Laryngeal Nerve'],
    clinicalNotes: 'Hyperparathyroidism causes "painful bones, renal stones, abdominal groans, and psychic moans".',
    commonDiseases: ['Primary Hyperparathyroidism', 'Hypoparathyroidism', 'Parathyroid Adenoma']
  },
  {
    id: 'thymus',
    name: 'Thymus',
    latinName: 'Thymus',
    system: 'Endocrine System',
    location: 'Anterior superior mediastinum',
    region: 'Neck & Chest',
    shapeType: 'polygon',
    points: '162,136 178,136 182,168 170,174 158,168',
    description: 'Specialized primary lymphoid and endocrine organ involved in T-lymphocyte maturation and thymic peptide production.',
    secretedHormones: ['Thymosin', 'Thymopoietin', 'Thymulin'],
    targetOrgans: ['T-Lymphocytes', 'Immune System Organs'],
    innervation: ['Vagus nerve', 'Sympathetic chain'],
    adjacentStructures: ['Pericardium', 'Great Vessels', 'Sternum', 'Trachea'],
    clinicalNotes: 'Prominent in infants; undergoes gradual involution after puberty; associated with Myasthenia Gravis.',
    commonDiseases: ['Thymoma', 'Thymic Hyperplasia', 'DiGeorge Syndrome']
  },
  {
    id: 'adrenals',
    name: 'Adrenal Glands',
    latinName: 'Glandulae suprarenales',
    system: 'Endocrine System',
    location: 'Superior poles of both kidneys (retroperitoneum)',
    region: 'Abdomen',
    shapeType: 'polygon',
    points: '136,242 148,238 146,252 134,250 192,238 204,242 206,250 194,252',
    description: 'Paired pyramid-shaped retroperitoneal glands consisting of an outer steroidogenic cortex and inner catecholamine-secreting medulla.',
    secretedHormones: ['Cortisol', 'Aldosterone', 'DHEA/Androgens', 'Epinephrine', 'Norepinephrine'],
    targetOrgans: ['Kidneys', 'Cardiovascular System', 'Liver', 'Adipose Tissue'],
    innervation: ['Preganglionic sympathetic fibers via celiac plexus'],
    adjacentStructures: ['Kidneys', 'Inferior Vena Cava', 'Abdominal Aorta', 'Diaphragm'],
    clinicalNotes: 'Cortex essential for life; adrenal crisis requires emergency glucocorticoid replacement.',
    commonDiseases: ['Addison Disease', 'Cushing Syndrome', 'Pheochromocytoma', 'Conn Syndrome']
  },
  {
    id: 'pancreas',
    name: 'Pancreas',
    latinName: 'Pancreas',
    system: 'Endocrine System',
    location: 'Epigastrium / retroperitoneum',
    region: 'Abdomen',
    shapeType: 'polygon',
    points: '154,232 186,230 196,242 178,252 152,246',
    description: 'Dual endocrine-exocrine gland containing Islets of Langerhans regulating blood glucose levels.',
    secretedHormones: ['Insulin (Beta cells)', 'Glucagon (Alpha cells)', 'Somatostatin (Delta cells)', 'Pancreatic Polypeptide'],
    targetOrgans: ['Liver', 'Skeletal Muscle', 'Adipose Tissue'],
    innervation: ['Celiac plexus', 'Vagus nerve'],
    adjacentStructures: ['Duodenum', 'Stomach', 'Spleen', 'Splenic Artery & Vein'],
    clinicalNotes: 'Autoimmune destruction of beta cells causes Type 1 Diabetes Mellitus.',
    commonDiseases: ['Type 1 Diabetes Mellitus', 'Type 2 Diabetes Mellitus', 'Pancreatitis', 'Insulinoma']
  },
  {
    id: 'ovaries',
    name: 'Ovaries',
    latinName: 'Ovaria',
    system: 'Endocrine System',
    location: 'Ovarian fossa of lateral pelvic wall (Female)',
    region: 'Pelvis / Gonads',
    shapeType: 'polygon',
    points: '144,310 154,308 152,320 142,322 188,308 198,310 196,322 186,320',
    description: 'Paired female gonads producing female sex hormones and mature oocytes.',
    secretedHormones: ['Estrogen (Estradiol)', 'Progesterone', 'Inhibin', 'Relaxin'],
    targetOrgans: ['Uterus', 'Mammary Glands', 'Skeletal System', 'Hypothalamus & Pituitary'],
    innervation: ['Ovarian plexus (T10–T11 sympathetic)'],
    adjacentStructures: ['Fallopian Tubes', 'Uterus', 'Ureter', 'Internal Iliac Vessels'],
    clinicalNotes: 'Primary source of female reproductive steroids; dysregulation leads to PCOS or ovarian failure.',
    commonDiseases: ['Polycystic Ovary Syndrome (PCOS)', 'Ovarian Cysts', 'Ovarian Cancer']
  },
  {
    id: 'testes',
    name: 'Testes',
    latinName: 'Testes',
    system: 'Endocrine System',
    location: 'Scrotal sac (Male)',
    region: 'Pelvis / Gonads',
    shapeType: 'polygon',
    points: '162,334 170,334 170,346 162,346 172,334 180,334 180,346 172,346',
    description: 'Paired male gonads containing Leydig cells that synthesize androgens and Sertoli cells facilitating spermatogenesis.',
    secretedHormones: ['Testosterone', 'Dihydrotestosterone (DHT)', 'Androstenedione', 'Inhibin B'],
    targetOrgans: ['Skeletal Muscle', 'Prostate Gland', 'Bone Matrix', 'Spermatogenic Epithelium'],
    innervation: ['Testicular plexus (T10–T11 sympathetic)'],
    adjacentStructures: ['Epididymis', 'Spermatic Cord', 'Scrotum'],
    clinicalNotes: 'Leydig cell steroidogenesis stimulated by pituitary LH; testicular torsion is a surgical emergency.',
    commonDiseases: ['Hypogonadism', 'Testicular Cancer', 'Cryptorchidism', 'Testicular Torsion']
  }
];

export const ENDOCRINE_CATALOG_MAP: Record<string, EndocrineGlandComponent> = ENDOCRINE_GLANDS_CATALOG.reduce(
  (acc, gland) => {
    acc[gland.id] = gland;
    return acc;
  },
  {} as Record<string, EndocrineGlandComponent>
);
