export interface BoneMetadata {
  id: string;
  name: string;
  category: 'axial' | 'appendicular';
  subCategory: 'cranium' | 'face' | 'spine' | 'thorax' | 'pectoral' | 'arm' | 'hand' | 'pelvis' | 'leg' | 'foot';
  description: string;
  joints: string[];
}

export const bonesCatalog: BoneMetadata[] = [
  // axial - skull cranium
  {
    id: 'bone-frontal',
    name: 'Frontal Bone',
    category: 'axial',
    subCategory: 'cranium',
    description: 'Flat bone forming the forehead, the superior wall of the orbits, and most of the anterior cranial fossa.',
    joints: ['Coronal suture with Parietal bones', 'Sphenoid bone']
  },
  {
    id: 'bone-parietal',
    name: 'Parietal Bones (L/R)',
    category: 'axial',
    subCategory: 'cranium',
    description: 'Paired flat bones forming the superior and lateral sides of the cranium.',
    joints: ['Sagittal suture together', 'Coronal suture with Frontal', 'Lambdoid suture with Occipital']
  },
  {
    id: 'bone-temporal',
    name: 'Temporal Bones (L/R)',
    category: 'axial',
    subCategory: 'cranium',
    description: 'Paired irregular bones forming the inferior lateral sides of the skull, housing the auditory ossicles.',
    joints: ['Squamosal suture with Parietal', 'Temporomandibular joint (TMJ)']
  },
  {
    id: 'bone-occipital',
    name: 'Occipital Bone',
    category: 'axial',
    subCategory: 'cranium',
    description: 'Flat bone forming the posterior skull and base of the cranium, contains the Foramen Magnum.',
    joints: ['Atlanto-occipital joint (C1)', 'Lambdoid suture with Parietal']
  },
  {
    id: 'bone-sphenoid',
    name: 'Sphenoid Bone',
    category: 'axial',
    subCategory: 'cranium',
    description: 'Butterfly-shaped keystone bone of the cranial floor, binding all other cranium elements.',
    joints: ['Frontal', 'Parietal', 'Temporal', 'Occipital']
  },
  {
    id: 'bone-ethmoid',
    name: 'Ethmoid Bone',
    category: 'axial',
    subCategory: 'cranium',
    description: 'Light, spongy bone at the anterior cranial base, forming parts of the nasal cavity and septum.',
    joints: ['Sphenoid', 'Frontal', 'Vomer']
  },

  // axial - skull face
  {
    id: 'bone-mandible',
    name: 'Mandible (Jawbone)',
    category: 'axial',
    subCategory: 'face',
    description: 'The largest, strongest facial bone. The only movable bone of the skull.',
    joints: ['Temporomandibular Joint (TMJ) with Temporal bone']
  },
  {
    id: 'bone-maxilla',
    name: 'Maxillae (L/R)',
    category: 'axial',
    subCategory: 'face',
    description: 'Paired bones forming the upper jaw, hard palate, lateral nasal wall, and orbital floor.',
    joints: ['Zygomatic', 'Nasal', 'Frontal']
  },
  {
    id: 'bone-zygomatic',
    name: 'Zygomatic Bones (L/R)',
    category: 'axial',
    subCategory: 'face',
    description: 'Cheekbones forming the lateral walls and floors of the orbits.',
    joints: ['Temporal arch', 'Maxilla', 'Frontal']
  },
  {
    id: 'bone-nasal',
    name: 'Nasal Bones (L/R)',
    category: 'axial',
    subCategory: 'face',
    description: 'Small rectangular bones forming the bridge of the nose.',
    joints: ['Frontal', 'Maxilla']
  },
  {
    id: 'bone-vomer',
    name: 'Vomer',
    category: 'axial',
    subCategory: 'face',
    description: 'Thin, flat bone forming the inferior and posterior portion of the nasal septum.',
    joints: ['Ethmoid', 'Sphenoid', 'Maxillae']
  },

  // axial - spine
  {
    id: 'bone-cervical',
    name: 'Cervical Spine (C1-C7)',
    category: 'axial',
    subCategory: 'spine',
    description: 'The 7 neck vertebrae. C1 (Atlas) supports the skull; C2 (Axis) enables neck rotation.',
    joints: ['Atlanto-axial joint', 'Intervertebral discs']
  },
  {
    id: 'bone-thoracic',
    name: 'Thoracic Spine (T1-T12)',
    category: 'axial',
    subCategory: 'spine',
    description: 'The 12 mid-back vertebrae. Each thoracic vertebra features costal facets connecting to a rib pair.',
    joints: ['Rib heads (costovertebral)', 'Adjacent vertebrae']
  },
  {
    id: 'bone-lumbar',
    name: 'Lumbar Spine (L1-L5)',
    category: 'axial',
    subCategory: 'spine',
    description: 'The 5 lower-back vertebrae. The largest, thickest segments to bear abdominal weight.',
    joints: ['L5-S1 joint', 'Sacrum']
  },
  {
    id: 'bone-sacrum',
    name: 'Sacrum',
    category: 'axial',
    subCategory: 'spine',
    description: 'Triangular bone formed by the fusion of 5 sacral vertebrae, connecting spine to pelvis.',
    joints: ['Sacroiliac Joint (SI)', 'L5', 'Coccyx']
  },
  {
    id: 'bone-coccyx',
    name: 'Coccyx (Tailbone)',
    category: 'axial',
    subCategory: 'spine',
    description: 'Small terminal segment of the vertebral column formed by 3-5 fused coccygeal vertebrae.',
    joints: ['Sacrococcygeal symphysis']
  },

  // axial - thorax
  {
    id: 'bone-sternum-manubrium',
    name: 'Manubrium (Sternum)',
    category: 'axial',
    subCategory: 'thorax',
    description: 'The superior portion of the sternum, connecting to the clavicles and first rib pair.',
    joints: ['Sternoclavicular joint', 'First rib', 'Sternum body']
  },
  {
    id: 'bone-sternum-body',
    name: 'Sternum Body',
    category: 'axial',
    subCategory: 'thorax',
    description: 'The flat middle portion of the breastbone. Anchors costal cartilages of Ribs 2-7.',
    joints: ['Manubrium', 'Xiphoid Process', 'Ribs 2-7']
  },
  {
    id: 'bone-sternum-xiphoid',
    name: 'Xiphoid Process',
    category: 'axial',
    subCategory: 'thorax',
    description: 'The small cartilaginous tip at the inferior end of the sternum. Ossifies in adulthood.',
    joints: ['Sternum body']
  },
  {
    id: 'bone-ribs-true',
    name: 'True Ribs (1-7)',
    category: 'axial',
    subCategory: 'thorax',
    description: '7 rib pairs attaching directly to the sternum through individual costal cartilages.',
    joints: ['Thoracic vertebrae', 'Sternum cartilage']
  },
  {
    id: 'bone-ribs-false',
    name: 'False Ribs (8-10)',
    category: 'axial',
    subCategory: 'thorax',
    description: '3 rib pairs whose cartilages connect to the cartilage of the rib immediately superior.',
    joints: ['Thoracic vertebrae', 'Costal cartilage of Rib 7']
  },
  {
    id: 'bone-ribs-floating',
    name: 'Floating Ribs (11-12)',
    category: 'axial',
    subCategory: 'thorax',
    description: '2 rib pairs that do not connect to the sternum, ending freely in the lateral abdominal muscles.',
    joints: ['Thoracic vertebrae']
  },

  // appendicular - pectoral girdle
  {
    id: 'bone-clavicle',
    name: 'Clavicles (L/R)',
    category: 'appendicular',
    subCategory: 'pectoral',
    description: 'S-shaped collarbones that brace the shoulder, transmitting force from arms to axial skeleton.',
    joints: ['Sternoclavicular joint', 'Acromioclavicular (AC) joint']
  },
  {
    id: 'bone-scapula',
    name: 'Scapulae (L/R)',
    category: 'appendicular',
    subCategory: 'pectoral',
    description: 'Flat, triangular shoulder blades floating on the posterior ribcage wall.',
    joints: ['Glenohumeral joint (humerus)', 'Acromioclavicular (AC) joint']
  },

  // appendicular - upper arm
  {
    id: 'bone-humerus',
    name: 'Humerus (L/R)',
    category: 'appendicular',
    subCategory: 'arm',
    description: 'The long bone of the upper arm, extending from shoulder glenoid cavity to the elbow.',
    joints: ['Glenohumeral (shoulder)', 'Humeroulnar (elbow)', 'Humeroradial']
  },
  {
    id: 'bone-radius',
    name: 'Radius (L/R)',
    category: 'appendicular',
    subCategory: 'arm',
    description: 'The lateral forearm bone (thumb side) that rotates around the ulna to enable pronation.',
    joints: ['Humeroradial (elbow)', 'Proximal/distal radioulnar joints', 'Radiocarpal (wrist)']
  },
  {
    id: 'bone-ulna',
    name: 'Ulna (L/R)',
    category: 'appendicular',
    subCategory: 'arm',
    description: 'The medial forearm bone (pinky side) forming the bony point of the elbow (olecranon).',
    joints: ['Humeroulnar (elbow)', 'Radioulnar joints']
  },

  // appendicular - hand
  {
    id: 'bone-carpals',
    name: 'Carpals (L/R Wrist)',
    category: 'appendicular',
    subCategory: 'hand',
    description: '8 small bones of the wrist: Scaphoid, Lunate, Triquetrum, Pisiform, Trapezium, Trapezoid, Capitate, Hamate.',
    joints: ['Radiocarpal joint', 'Carpometacarpal joints']
  },
  {
    id: 'bone-metacarpals',
    name: 'Metacarpals (L/R Palm)',
    category: 'appendicular',
    subCategory: 'hand',
    description: '5 long bones forming the structural support of the palm.',
    joints: ['Carpometacarpal joints', 'Metacarpophalangeal (MCP) joints']
  },
  {
    id: 'bone-phalanges-hand',
    name: 'Hand Phalanges (L/R Fingers)',
    category: 'appendicular',
    subCategory: 'hand',
    description: '14 finger bones. Proximal, middle, and distal segments for fingers; proximal and distal for the thumb.',
    joints: ['Metacarpophalangeal (MCP) joints', 'Proximal/Distal Interphalangeal (PIP/DIP) joints']
  },

  // appendicular - pelvis
  {
    id: 'bone-ilium',
    name: 'Ilium (Coxal Wings)',
    category: 'appendicular',
    subCategory: 'pelvis',
    description: 'The flared, superior portion of the hip bone forming the iliac crest (pelvic flank).',
    joints: ['Sacroiliac (SI) Joint', 'Acetabulum (hip socket)']
  },
  {
    id: 'bone-ischium',
    name: 'Ischium',
    category: 'appendicular',
    subCategory: 'pelvis',
    description: 'The posterior, inferior portion of the hip bone. Supports weight when sitting.',
    joints: ['Acetabulum', 'Pubic bone']
  },
  {
    id: 'bone-pubis',
    name: 'Pubis (Coxal Front)',
    category: 'appendicular',
    subCategory: 'pelvis',
    description: 'The anterior and inferior portion of the hip bone, joining midline at the symphysis.',
    joints: ['Pubic symphysis', 'Acetabulum']
  },

  // appendicular - leg
  {
    id: 'bone-femur',
    name: 'Femur (Thigh bone)',
    category: 'appendicular',
    subCategory: 'leg',
    description: 'The longest, heaviest, and strongest bone in the body, bearing all walking forces.',
    joints: ['Acetabulofemoral (hip joint)', 'Tibiofemoral (knee joint)', 'Patellofemoral']
  },
  {
    id: 'bone-patella',
    name: 'Patella (Kneecap)',
    category: 'appendicular',
    subCategory: 'leg',
    description: 'Flat, triangular sesamoid bone shielding the anterior knee joint, facilitating quadriceps leverage.',
    joints: ['Patellofemoral joint']
  },
  {
    id: 'bone-tibia',
    name: 'Tibia (Shin bone)',
    category: 'appendicular',
    subCategory: 'leg',
    description: 'The thick, weight-bearing medial bone of the lower leg.',
    joints: ['Tibiofemoral (knee)', 'Tibiofibular joints', 'Talocrural (ankle)']
  },
  {
    id: 'bone-fibula',
    name: 'Fibula (Calf bone)',
    category: 'appendicular',
    subCategory: 'leg',
    description: 'Thin lateral bone parallel to the tibia, supporting ankle stability and muscle anchors.',
    joints: ['Tibiofibular joints']
  },

  // appendicular - foot
  {
    id: 'bone-tarsals',
    name: 'Tarsals (L/R Ankle)',
    category: 'appendicular',
    subCategory: 'foot',
    description: '7 ankle and heel bones: Talus, Calcaneus (heel bone), Navicular, Cuboid, and three Cuneiforms.',
    joints: ['Talocrural (ankle)', 'Subtalar joint', 'Tarsometatarsal joints']
  },
  {
    id: 'bone-metatarsals',
    name: 'Metatarsals (L/R Sole)',
    category: 'appendicular',
    subCategory: 'foot',
    description: '5 long bones supporting the arch of the foot.',
    joints: ['Tarsometatarsal joints', 'Metatarsophalangeal (MTP) joints']
  },
  {
    id: 'bone-phalanges-foot',
    name: 'Foot Phalanges (L/R Toes)',
    category: 'appendicular',
    subCategory: 'foot',
    description: '14 toe bones. Proximal, middle, and distal segments (big toe has only two).',
    joints: ['Metatarsophalangeal (MTP) joints', 'Interphalangeal joints']
  }
];
