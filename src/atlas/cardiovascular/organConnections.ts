import { OrganVascularConnection } from './types';

export const ORGAN_VASCULAR_CONNECTIONS: Record<string, OrganVascularConnection> = {
  heart: {
    organId: 'heart',
    organName: 'Heart',
    arterialSupply: ['left_coronary_artery', 'right_coronary_artery', 'left_anterior_descending', 'circumflex_artery', 'posterior_descending_artery'],
    venousDrainage: ['great_cardiac_vein', 'middle_cardiac_vein', 'coronary_sinus']
  },
  lungs: {
    organId: 'lungs',
    organName: 'Lungs',
    arterialSupply: ['pulmonary_trunk', 'left_pulmonary_artery', 'right_pulmonary_artery', 'bronchial_arteries'],
    venousDrainage: ['pulmonary_veins_left', 'pulmonary_veins_right', 'azygos_vein']
  },
  brain: {
    organId: 'brain',
    organName: 'Brain & CNS',
    arterialSupply: ['left_internal_carotid', 'right_internal_carotid', 'left_vertebral_artery', 'right_vertebral_artery', 'circle_of_willis'],
    venousDrainage: ['left_internal_jugular', 'right_internal_jugular']
  },
  kidneys: {
    organId: 'kidneys',
    organName: 'Kidneys',
    arterialSupply: ['left_renal_artery', 'right_renal_artery'],
    venousDrainage: ['left_renal_vein', 'right_renal_vein']
  },
  liver: {
    organId: 'liver',
    organName: 'Liver',
    arterialSupply: ['common_hepatic_artery'],
    venousDrainage: ['hepatic_veins', 'portal_vein']
  },
  spleen: {
    organId: 'spleen',
    organName: 'Spleen',
    arterialSupply: ['splenic_artery'],
    venousDrainage: ['splenic_vein']
  },
  pancreas: {
    organId: 'pancreas',
    organName: 'Pancreas',
    arterialSupply: ['celiac_trunk', 'splenic_artery', 'superior_mesenteric_artery'],
    venousDrainage: ['splenic_vein', 'portal_vein']
  },
  stomach: {
    organId: 'stomach',
    organName: 'Stomach',
    arterialSupply: ['left_gastric_artery', 'celiac_trunk', 'splenic_artery'],
    venousDrainage: ['portal_vein', 'splenic_vein']
  },
  small_intestine: {
    organId: 'small_intestine',
    organName: 'Small Intestine',
    arterialSupply: ['superior_mesenteric_artery'],
    venousDrainage: ['superior_mesenteric_vein', 'portal_vein']
  },
  large_intestine: {
    organId: 'large_intestine',
    organName: 'Large Intestine',
    arterialSupply: ['superior_mesenteric_artery', 'inferior_mesenteric_artery'],
    venousDrainage: ['superior_mesenteric_vein', 'inferior_mesenteric_vein', 'portal_vein']
  },
  adrenal_glands: {
    organId: 'adrenal_glands',
    organName: 'Adrenal Glands',
    arterialSupply: ['left_renal_artery', 'right_renal_artery', 'abdominal_aorta'],
    venousDrainage: ['left_renal_vein', 'inferior_vena_cava']
  },
  bladder: {
    organId: 'bladder',
    organName: 'Urinary Bladder',
    arterialSupply: ['left_internal_iliac', 'right_internal_iliac'],
    venousDrainage: ['left_internal_iliac_vein', 'right_internal_iliac_vein']
  },
  thyroid: {
    organId: 'thyroid',
    organName: 'Thyroid Gland',
    arterialSupply: ['left_external_carotid', 'right_external_carotid', 'left_subclavian', 'right_subclavian'],
    venousDrainage: ['left_internal_jugular', 'right_internal_jugular']
  },
  bones: {
    organId: 'bones',
    organName: 'Skeletal Bones',
    arterialSupply: ['intercostal_arteries', 'left_brachial_artery', 'right_brachial_artery', 'left_femoral_artery', 'right_femoral_artery'],
    venousDrainage: ['left_brachial_vein', 'right_brachial_vein', 'left_femoral_vein', 'right_femoral_vein']
  },
  muscles: {
    organId: 'muscles',
    organName: 'Skeletal Musculature',
    arterialSupply: ['intercostal_arteries', 'left_radial_artery', 'right_radial_artery', 'left_deep_femoral', 'right_deep_femoral'],
    venousDrainage: ['left_cephalic_vein', 'right_cephalic_vein', 'left_great_saphenous', 'right_great_saphenous']
  },
  skin: {
    organId: 'skin',
    organName: 'Integument / Skin',
    arterialSupply: ['left_external_carotid', 'right_external_carotid', 'left_dorsalis_pedis', 'right_dorsalis_pedis'],
    venousDrainage: ['left_external_jugular', 'right_external_jugular', 'left_great_saphenous', 'right_great_saphenous']
  }
};
