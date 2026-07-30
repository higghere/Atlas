export interface DigestiveOrganComponent {
  id: string;
  name: string;
  latinName: string;
  system: 'Digestive';
  region: 'Upper GI' | 'Upper Abdomen' | 'Mid Abdomen' | 'Outer Abdomen' | 'Lower Abdomen' | 'Pelvis';
  parent?: string;
  children?: string[];
  points: string; // Polygon coordinates on 340x560 canvas
  description: string;
  bloodSupply: string[];
  venousDrainage: string[];
  innervation: string[];
  adjacentStructures: string[];
  clinicalNotes: string;
  commonDiseases: string[];
}

export const DIGESTIVE_ORGANS_CATALOG: DigestiveOrganComponent[] = [
  // Upper GI
  {
    id: 'pharynx',
    name: 'Pharynx',
    latinName: 'Pharynx',
    system: 'Digestive',
    region: 'Upper GI',
    parent: 'oral_cavity',
    children: ['esophagus'],
    points: '164,74 176,74 176,90 164,90',
    description: 'Muscular tube connecting oral cavity to esophagus.',
    bloodSupply: ['Ascending pharyngeal artery'],
    venousDrainage: ['Pharyngeal venous plexus'],
    innervation: ['Pharyngeal plexus (CN IX, CN X)'],
    adjacentStructures: ['Larynx', 'Cervical vertebrae'],
    clinicalNotes: 'Swallowing pathway; risk for pharyngitis and Zenker diverticulum.',
    commonDiseases: ['Pharyngitis', 'Zenker Diverticulum']
  },
  {
    id: 'esophagus',
    name: 'Esophagus',
    latinName: 'Esophagus',
    system: 'Digestive',
    region: 'Upper GI',
    parent: 'pharynx',
    children: ['stomach'],
    points: '166,90 174,90 174,180 166,180',
    description: 'Muscular conduit transporting food bolus from pharynx to stomach through esophageal hiatus.',
    bloodSupply: ['Esophageal branches of thoracic aorta', 'Left gastric artery'],
    venousDrainage: ['Azygos vein', 'Left gastric vein (portal-systemic anastomosis)'],
    innervation: ['Vagus nerve (CN X)', 'Sympathetic trunk'],
    adjacentStructures: ['Trachea', 'Aorta', 'Diaphragm'],
    clinicalNotes: 'Esophageal varices develop in portal hypertension.',
    commonDiseases: ['GERD', 'Esophageal Varices', 'Barrett Esophagus']
  },

  // Upper Abdomen
  {
    id: 'liver',
    name: 'Liver',
    latinName: 'Hepar',
    system: 'Digestive',
    region: 'Upper Abdomen',
    children: ['gallbladder'],
    points: '135,185 185,182 195,200 188,230 142,228 132,205',
    description: 'Largest visceral organ occupying right upper quadrant; synthesizes bile and metabolizes nutrients.',
    bloodSupply: ['Proper hepatic artery (20%)', 'Hepatic portal vein (80%)'],
    venousDrainage: ['Hepatic veins into IVC'],
    innervation: ['Hepatic plexus (Vagus nerve & Celiac plexus)'],
    adjacentStructures: ['Diaphragm', 'Stomach', 'Gallbladder', 'Duodenum', 'Right Kidney'],
    clinicalNotes: 'Central metabolic organ; susceptible to cirrhosis, hepatitis, and fatty liver disease.',
    commonDiseases: ['Cirrhosis', 'Hepatitis', 'NASH', 'Hepatocellular Carcinoma']
  },
  {
    id: 'gallbladder',
    name: 'Gallbladder',
    latinName: 'Vesica biliaris',
    system: 'Digestive',
    region: 'Upper Abdomen',
    parent: 'liver',
    points: '174,220 184,220 182,236 172,234',
    description: 'Pear-shaped sac underneath right hepatic lobe storing and concentrating bile.',
    bloodSupply: ['Cystic artery'],
    venousDrainage: ['Cystic vein into portal vein'],
    innervation: ['Celiac plexus', 'Vagus nerve', 'Right phrenic nerve'],
    adjacentStructures: ['Liver (inferior surface)', 'Duodenum', 'Transverse colon'],
    clinicalNotes: 'Gallstones (cholelithiasis) cause biliary colic and cholecystitis.',
    commonDiseases: ['Cholelithiasis', 'Acute Cholecystitis', 'Choledocholithiasis']
  },
  {
    id: 'stomach',
    name: 'Stomach',
    latinName: 'Gaster',
    system: 'Digestive',
    region: 'Upper Abdomen',
    parent: 'esophagus',
    children: ['duodenum'],
    points: '162,180 178,180 185,205 178,240 155,235 152,205',
    description: 'J-shaped muscular organ in left upper quadrant digesting food with hydrochloric acid and pepsin.',
    bloodSupply: ['Left gastric artery', 'Right gastric artery', 'Short gastric arteries', 'Gastro-epiploic arteries'],
    venousDrainage: ['Portal vein', 'Splenic vein', 'Superior mesenteric vein'],
    innervation: ['Anterior & posterior vagal trunks', 'Celiac plexus'],
    adjacentStructures: ['Esophagus', 'Diaphragm', 'Spleen', 'Pancreas', 'Duodenum'],
    clinicalNotes: 'Peptic ulcer disease and Helicobacter pylori infection common.',
    commonDiseases: ['Peptic Ulcer Disease', 'Gastritis', 'Gastric Adenocarcinoma', 'Hiatal Hernia']
  },
  {
    id: 'pancreas',
    name: 'Pancreas',
    latinName: 'Pancreas',
    system: 'Digestive',
    region: 'Upper Abdomen',
    children: ['duodenum'],
    points: '158,225 186,222 188,235 156,238',
    description: 'Retroperitoneal exocrine and endocrine gland lying posterior to stomach in C-loop of duodenum.',
    bloodSupply: ['Superior & inferior pancreaticoduodenal arteries', 'Pancreatic branches of splenic artery'],
    venousDrainage: ['Splenic vein', 'Superior mesenteric vein'],
    innervation: ['Vagus nerve', 'Celiac and superior mesenteric plexuses'],
    adjacentStructures: ['Stomach', 'Duodenum', 'Spleen', 'Common bile duct'],
    clinicalNotes: 'Endocrine insulin secretion (Islets of Langerhans) and exocrine digestive enzymes.',
    commonDiseases: ['Acute Pancreatitis', 'Chronic Pancreatitis', 'Pancreatic Ductal Adenocarcinoma', 'Diabetes Mellitus']
  },

  // Mid Abdomen
  {
    id: 'small_intestine',
    name: 'Small Intestine (Duodenum/Jejunum/Ileum)',
    latinName: 'Intestinum tenue',
    system: 'Digestive',
    region: 'Mid Abdomen',
    parent: 'stomach',
    children: ['large_intestine'],
    points: '148,240 192,240 195,305 145,305',
    description: 'Primary site of nutrient absorption (~6 meters) comprising Duodenum, Jejunum, and Ileum.',
    bloodSupply: ['Superior mesenteric artery (SMA)', 'Pancreaticoduodenal arteries'],
    venousDrainage: ['Superior mesenteric vein (SMV) into portal vein'],
    innervation: ['Vagus nerve', 'Superior mesenteric plexus'],
    adjacentStructures: ['Stomach', 'Pancreas', 'Large intestine', 'Mesentery'],
    clinicalNotes: 'Villi and microvilli maximize absorption; affected in Celiac disease and Crohn disease.',
    commonDiseases: ['Celiac Disease', 'Crohn Disease', 'Small Bowel Obstruction', 'Meckel Diverticulum']
  },

  // Outer & Lower Abdomen
  {
    id: 'large_intestine',
    name: 'Large Intestine (Colon)',
    latinName: 'Intestinum crassum',
    system: 'Digestive',
    region: 'Outer Abdomen',
    parent: 'small_intestine',
    children: ['rectum'],
    points: '136,235 204,235 206,325 190,325 190,250 150,250 150,325 134,325',
    description: 'Frames central abdomen; absorbs water/electrolytes and forms feces (Ascending, Transverse, Descending, Sigmoid).',
    bloodSupply: ['Superior mesenteric artery (SMA)', 'Inferior mesenteric artery (IMA)'],
    venousDrainage: ['Superior mesenteric vein', 'Inferior mesenteric vein into portal vein'],
    innervation: ['Vagus nerve (proximal 2/3)', 'Pelvic splanchnic nerves S2-S4 (distal 1/3)'],
    adjacentStructures: ['Small intestine', 'Liver', 'Spleen', 'Abdominal wall'],
    clinicalNotes: 'Colorectal cancer screening via colonoscopy; site of diverticulosis and Ulcerative Colitis.',
    commonDiseases: ['Diverticulosis / Diverticulitis', 'Ulcerative Colitis', 'Colorectal Carcinoma', 'IBS']
  },

  // Pelvis
  {
    id: 'rectum',
    name: 'Rectum & Anal Canal',
    latinName: 'Rectum et Canalis analis',
    system: 'Digestive',
    region: 'Pelvis',
    parent: 'large_intestine',
    points: '162,325 178,325 176,355 164,355',
    description: 'Terminal pelvic portion of GI tract storing fecal matter prior to defecation.',
    bloodSupply: ['Superior rectal artery (IMA)', 'Middle & inferior rectal arteries'],
    venousDrainage: ['Superior rectal vein (portal system)', 'Middle & inferior rectal veins (systemic system)'],
    innervation: ['Pelvic splanchnic nerves (S2-S4)', 'Pudendal nerve (external sphincter)'],
    adjacentStructures: ['Bladder', 'Sacrum', 'Prostate (male) / Vagina (female)'],
    clinicalNotes: 'Hemorrhoids develop at anorectal junction; rectal exam evaluates prostate and mucosal wall.',
    commonDiseases: ['Hemorrhoids', 'Anatomic Fissure', 'Rectal Prolapse', 'Proctitis']
  }
];

export const DIGESTIVE_CATALOG_MAP: Record<string, DigestiveOrganComponent> = DIGESTIVE_ORGANS_CATALOG.reduce((acc, organ) => {
  acc[organ.id] = organ;
  return acc;
}, {} as Record<string, DigestiveOrganComponent>);
