import { digestiveStructures } from '../data/digestiveData';
export const giTractPathway = ['lips','oral-cavity','oropharynx','laryngopharynx','upper-esophageal-sphincter','cervical-esophagus','thoracic-esophagus','abdominal-esophagus','lower-esophageal-sphincter','cardia','fundus','stomach-body','antrum','pylorus','pyloric-sphincter','duodenum-i','duodenum-ii','duodenum-iii','duodenum-iv','jejunum','ileum','terminal-ileum','cecum','ascending-colon','hepatic-flexure','transverse-colon','splenic-flexure','descending-colon','sigmoid-colon','rectum','anal-canal'];
export const ductConnections = [['cystic-duct','common-hepatic-duct'],['common-hepatic-duct','common-bile-duct'],['gallbladder-neck','cystic-duct'],['pancreatic-duct','ampulla-of-vater'],['accessory-pancreatic-duct','duodenum-ii'],['common-bile-duct','ampulla-of-vater'],['ampulla-of-vater','duodenum-ii']] as const;
export const organHierarchy = Object.fromEntries(digestiveStructures.filter(s=>s.children.length).map(s=>[s.id,s.children]));
export const adjacencyMap = Object.fromEntries(digestiveStructures.map(s=>[s.id,s.adjacentStructures]));
export const peritonealMap = Object.fromEntries(digestiveStructures.map(s=>[s.id,s.peritonealStatus]));
export const mesenteryMap = { jejunum:'mesentery proper',ileum:'mesentery proper','transverse-colon':'transverse mesocolon','sigmoid-colon':'sigmoid mesocolon',appendix:'mesoappendix' };
export const neighborMap = adjacencyMap;
