export interface ClinicalBoneData {
  synonyms: string[];
  boneType: 'flat' | 'irregular' | 'long' | 'short' | 'sesamoid';
  bloodSupply: string;
  nerveSupply: string;
  muscleOrigins: string[];
  muscleInsertions: string[];
  clinicalNotes: string;
  commonFractures: string;
  interestingFacts: string;
}

export const clinicalBoneDatabase: Record<string, ClinicalBoneData> = {
  'bone-frontal': {
    synonyms: ['Forehead bone', 'Os frontale'],
    boneType: 'flat',
    bloodSupply: 'Supraorbital and supratrochlear arteries (branches of ophthalmic artery)',
    nerveSupply: 'Supraorbital and supratrochlear nerves (branches of ophthalmic nerve V1)',
    muscleOrigins: ['Temporalis', 'Orbicularis oculi', 'Corrugator supercilii'],
    muscleInsertions: ['Occipitofrontalis (frontal belly)'],
    clinicalNotes: 'Metopic suture may persist into adulthood in about 8% of people, mimicking a fracture line.',
    commonFractures: 'Frontal sinus fractures, orbital rim blowouts',
    interestingFacts: 'The frontal bone starts as two separate bones in infants that fuse along the midline metopic suture.'
  },
  'bone-parietal': {
    synonyms: ['Wall bones', 'Ossa parietalia'],
    boneType: 'flat',
    bloodSupply: 'Superficial temporal and middle meningeal arteries',
    nerveSupply: 'Supratrochlear and auriculotemporal nerves',
    muscleOrigins: ['Temporalis'],
    muscleInsertions: [],
    clinicalNotes: 'The middle meningeal artery runs directly underneath the parietal bone at the pterion; fractures here can cause life-threatening epidural hematomas.',
    commonFractures: 'Linear skull fractures, depressed skull fractures',
    interestingFacts: 'Its name comes from the Latin word "paries", meaning "wall", as they form the side walls of the skull.'
  },
  'bone-temporal': {
    synonyms: ['Temple bones', 'Ossa temporalia'],
    boneType: 'irregular',
    bloodSupply: 'Maxillary artery (middle meningeal), occipital and posterior auricular arteries',
    nerveSupply: 'Mandibular nerve (V3), facial nerve (VII), vestibulocochlear nerve (VIII)',
    muscleOrigins: ['Temporalis', 'Masseter', 'Sternocleidomastoid (at mastoid process)', 'Digastric'],
    muscleInsertions: [],
    clinicalNotes: 'Contains the middle and inner ear structures. Fractures can cause CSF rhinorrhea, facial nerve palsy, and hearing loss.',
    commonFractures: 'Petrous temporal fractures, longitudinal and transverse temporal bone fractures',
    interestingFacts: 'The temporal bone houses the smallest bones in the human body: the malleus, incus, and stapes.'
  },
  'bone-occipital': {
    synonyms: ['Base of skull', 'Os occipitale'],
    boneType: 'flat',
    bloodSupply: 'Occipital artery and branches of ascending pharyngeal artery',
    nerveSupply: 'Hypoglossal nerve (XII) and spinal accessory nerve (XI)',
    muscleOrigins: ['Trapezius', 'Occipitofrontalis (occipital belly)', 'Splenius capitis'],
    muscleInsertions: [],
    clinicalNotes: 'Fractures near the Foramen Magnum can result in damage to the brainstem and spinal cord.',
    commonFractures: 'Basilar skull fractures, occipital condyle fractures',
    interestingFacts: 'Contains the Foramen Magnum, the largest opening in the skull, through which the spinal cord passes.'
  },
  'bone-sphenoid': {
    synonyms: ['Keystone bone', 'Os sphenoidale'],
    boneType: 'irregular',
    bloodSupply: 'Middle meningeal artery and accessory meningeal artery',
    nerveSupply: 'Ophthalmic (V1), Maxillary (V2), Mandibular (V3) divisions of CN V',
    muscleOrigins: ['Lateral pterygoid', 'Medial pterygoid', 'Temporalis'],
    muscleInsertions: [],
    clinicalNotes: 'Houses the pituitary gland in the sella turcica. Tumors of the pituitary gland are accessed surgically through the sphenoid sinus.',
    commonFractures: 'Basilar skull fractures involving the sphenoid sinus',
    interestingFacts: 'Because it articulates with every other cranial bone, it is known as the "keystone" of the cranium.'
  },
  'bone-ethmoid': {
    synonyms: ['Spongy bone', 'Os ethmoidale'],
    boneType: 'irregular',
    bloodSupply: 'Anterior and posterior ethmoidal arteries',
    nerveSupply: 'Olfactory nerves (CN I) and nasociliary nerve',
    muscleOrigins: [],
    muscleInsertions: [],
    clinicalNotes: 'The cribriform plate is extremely thin. Fractures can tear meninges, leading to CSF leak and anosmia (loss of smell).',
    commonFractures: 'Cribriform plate fractures',
    interestingFacts: 'Ethmoid comes from the Greek word "ethmos", meaning "sieve", referring to its perforated cribriform plate.'
  },
  'bone-mandible': {
    synonyms: ['Jawbone', 'Lower jaw'],
    boneType: 'irregular',
    bloodSupply: 'Inferior alveolar artery (branch of maxillary artery)',
    nerveSupply: 'Inferior alveolar nerve and mental nerve (branches of CN V3)',
    muscleOrigins: ['Mylohyoid', 'Geniohyoid'],
    muscleInsertions: ['Temporalis (at coronoid process)', 'Masseter (at ramus)', 'Medial and lateral pterygoids'],
    clinicalNotes: 'Fractures of the mandible are highly common in trauma and often occur bilaterally (e.g., angle and contralateral condyle).',
    commonFractures: 'Condylar, angle, parasymphyseal, and symphyseal fractures',
    interestingFacts: 'The mandible is the strongest, largest, and lowest bone in the human skull.'
  },
  'bone-clavicle': {
    synonyms: ['Collarbone', 'Clavicula'],
    boneType: 'long',
    bloodSupply: 'Suprascapular, thoracoacromial, and internal thoracic arteries',
    nerveSupply: 'Supraclavicular nerves and subclavian nerve',
    muscleOrigins: ['Pectoralis major', 'Deltoid', 'Sternocleidomastoid'],
    muscleInsertions: ['Trapezius', 'Subclavius'],
    clinicalNotes: 'The most commonly broken bone in the human body, especially in children and athletes.',
    commonFractures: 'Midshaft clavicle fractures (80%), lateral third fractures',
    interestingFacts: 'Its name comes from the Latin "clavicula" meaning "little key", describing its rotation along its axis during shoulder movement.'
  },
  'bone-scapula': {
    synonyms: ['Shoulder blade', 'Scapula'],
    boneType: 'flat',
    bloodSupply: 'Suprascapular, subscapular, and dorsal scapular arteries',
    nerveSupply: 'Suprascapular, subscapular, and long thoracic nerves',
    muscleOrigins: ['Supraspinatus', 'Infraspinatus', 'Teres major', 'Teres minor', 'Deltoid'],
    muscleInsertions: ['Trapezius', 'Serratus anterior', 'Pectoralis minor', 'Rhomboideus major'],
    clinicalNotes: 'Fractures are rare and usually indicate high-impact chest trauma. A "winged scapula" results from damage to the long thoracic nerve.',
    commonFractures: 'Scapular neck fractures, glenoid fossa fractures',
    interestingFacts: 'It connects the humerus to the clavicle, acting as a critical anchor for arm motility.'
  },
  'bone-humerus': {
    synonyms: ['Arm bone', 'Humerus'],
    boneType: 'long',
    bloodSupply: 'Anterior and posterior circumflex humeral arteries, profunda brachii',
    nerveSupply: 'Axillary nerve (at surgical neck), radial nerve (at spiral groove), ulnar nerve (at medial epicondyle)',
    muscleOrigins: ['Brachialis', 'Triceps brachii (lateral/medial heads)', 'Brachioradialis'],
    muscleInsertions: ['Deltoid (at deltoid tuberosity)', 'Pectoralis major', 'Latissimus dorsi', 'Supraspinatus'],
    clinicalNotes: 'Fracture of the surgical neck can damage the axillary nerve, whereas midshaft fractures risk radial nerve entrapment (causing wrist drop).',
    commonFractures: 'Surgical neck fractures, shaft fractures, supracondylar fractures',
    interestingFacts: 'The medial epicondyle is what people refer to as the "funny bone" because striking it compresses the ulnar nerve against the bone.'
  },
  'bone-radius': {
    synonyms: ['Lateral forearm bone', 'Radius'],
    boneType: 'long',
    bloodSupply: 'Radial artery and anterior interosseous artery',
    nerveSupply: 'Posterior interosseous nerve (branch of radial nerve)',
    muscleOrigins: ['Flexor digitorum superficialis', 'Flexor pollicis longus'],
    muscleInsertions: ['Biceps brachii (at radial tuberosity)', 'Pronator teres', 'Brachioradialis'],
    clinicalNotes: 'Falls on an outstretched hand (FOOSH) commonly lead to Colles\' fractures, causing a "dinner fork" deformity of the wrist.',
    commonFractures: 'Colles\' fracture, radial head fractures, Smith\'s fracture',
    interestingFacts: 'The radius rotates around the ulna to allow pronation and supination of the hand.'
  },
  'bone-ulna': {
    synonyms: ['Medial forearm bone', 'Ulna'],
    boneType: 'long',
    bloodSupply: 'Ulnar artery and interosseous arteries',
    nerveSupply: 'Anterior interosseous nerve (branch of median nerve) and ulnar nerve',
    muscleOrigins: ['Flexor digitorum profundus', 'Pronator quadratus', 'Extensor indicis'],
    muscleInsertions: ['Triceps brachii (at olecranon)', 'Brachialis (at ulnar tuberosity)'],
    clinicalNotes: 'Nightstick fractures occur when defending against a blow with the forearm. Often fractured in combination with radius.',
    commonFractures: 'Olecranon fractures, Monteggia fracture, nightstick fracture',
    interestingFacts: 'The olecranon process at the proximal end of the ulna forms the hard point of the elbow.'
  },
  'bone-femur': {
    synonyms: ['Thigh bone', 'Femur'],
    boneType: 'long',
    bloodSupply: 'Femoral artery, profunda femoris (medial/lateral circumflex arteries)',
    nerveSupply: 'Femoral nerve, sciatic nerve, obturator nerve',
    muscleOrigins: ['Vastus lateralis', 'Vastus medialis', 'Vastus intermedius', 'Gastrocnemius'],
    muscleInsertions: ['Iliopsoas (at lesser trochanter)', 'Gluteus maximus', 'Gluteus medius (at greater trochanter)'],
    clinicalNotes: 'Neck fractures are common in elderly patients with osteoporosis and can lead to avascular necrosis of the femoral head.',
    commonFractures: 'Femoral neck fractures, intertrochanteric fractures, femoral shaft fractures',
    interestingFacts: 'The femur is the longest, heaviest, and strongest bone in the human body, capable of supporting up to 30 times a person\'s body weight.'
  },
  'bone-tibia': {
    synonyms: ['Shin bone', 'Tibia'],
    boneType: 'long',
    bloodSupply: 'Anterior tibial artery and nutrient artery of tibia',
    nerveSupply: 'Tibial nerve and deep fibular nerve',
    muscleOrigins: ['Tibialis anterior', 'Extensor digitorum longus', 'Soleus'],
    muscleInsertions: ['Quadriceps femoris (via patellar ligament at tibial tuberosity)', 'Sartorius', 'Gracilis'],
    clinicalNotes: 'The shin is subcutaneous and prone to direct trauma. Stress fractures are highly prevalent in runners.',
    commonFractures: 'Tibial shaft fractures, tibial plateau fractures, medial malleolus fractures',
    interestingFacts: 'The tibia is the second largest bone in the body and carries 90% of the body\'s weight during standing.'
  },
  'bone-fibula': {
    synonyms: ['Calf bone', 'Fibula'],
    boneType: 'long',
    bloodSupply: 'Fibular artery (branch of posterior tibial)',
    nerveSupply: 'Common fibular nerve (wraps around the neck of the fibula)',
    muscleOrigins: ['Fibularis longus', 'Fibularis brevis', 'Soleus', 'Extensor hallucis longus'],
    muscleInsertions: ['Biceps femoris (at fibular head)'],
    clinicalNotes: 'Fractures of the fibular neck can damage the common fibular nerve, leading to "foot drop" due to paralysis of dorsiflexion.',
    commonFractures: 'Lateral malleolus fractures, distal fibular fractures, Maisonneuve fracture',
    interestingFacts: 'The fibula does not articulate with the femur and bears almost no body weight, serving instead as muscle attachment sites.'
  }
};
