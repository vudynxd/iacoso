// Brand & Model specific tire photo presets at 45-degree commercial angle
// Featuring authentic tire designs corresponding to the brands sold in Argentina

import michelinPhoto from '../assets/images/michelin_primacy_tire_1788874922462.jpg';
import bfgoodrichPhoto from '../assets/images/bfgoodrich_ko2_tire_1788874941450.jpg';
import pirelliPhoto from '../assets/images/pirelli_cinturato_tire_1788874959270.jpg';
import bridgestonePhoto from '../assets/images/bridgestone_tire_1788874984695.jpg';
import goodyearPhoto from '../assets/images/goodyear_wrangler_tire_1788875005136.jpg';
import fatePhoto from '../assets/images/fate_maxisport_tire_1788875022954.jpg';
import continentalPhoto from '../assets/images/continental_tire_1788875085326.jpg';
import zmaxPhoto from '../assets/images/zmax_tire_1788875063806.jpg';
import onyxPacePhoto from '../assets/images/onyx_pace_tire_1788875103382.jpg';

// Generic angle presets (fallbacks)
import tourPhoto from '../assets/images/tire_45deg_tour_1788866538318.jpg';
import atPhoto from '../assets/images/tire_45deg_at_1788866513918.jpg';
import sportPhoto from '../assets/images/tire_45deg_sport_1788866492414.jpg';
import suvPhoto from '../assets/images/tire_45deg_suv_1788873975617.jpg';
import vanPhoto from '../assets/images/tire_45deg_van_1788873991022.jpg';

export interface TirePhotoPreset {
  id: string;
  name: string;
  brand: string;
  models: string[];
  category: 'Auto' | 'Camioneta' | 'SUV' | 'Sport' | 'Utilitario';
  description: string;
  url: string;
  angleDescription: string;
  recommendedFor: string[];
  marketingValueHook: string;
  brandBadge: {
    bg: string;
    text: string;
    label: string;
    sublabel: string;
  };
}

export const TIRE_PHOTO_PRESETS: TirePhotoPreset[] = [
  // 1. MICHELIN Authentic
  {
    id: 'michelin-primacy',
    name: 'Michelin Primacy & Pilot (Oficial)',
    brand: 'Michelin',
    models: ['Primacy 4+', 'Pilot Sport 4', 'Energy XM2+', 'Primacy SUV+', 'LTX Force'],
    category: 'Auto',
    description: 'Foto comercial auténtica Michelin: pisada asimétrica de 4 canales aqua-grip y marcaje original.',
    url: michelinPhoto,
    angleDescription: 'Ángulo 45° con pisada original Michelin Primacy/Pilot y perfil lateral de alta gama',
    recommendedFor: ['Primacy 4+', 'Pilot Sport 4', 'Energy XM2+', 'Primacy SUV+'],
    marketingValueHook: 'Máximo prestigio Michelin: destaca el compuesto EverGrip y los 4 surcos de frenado superior en mojado.',
    brandBadge: {
      bg: '#002f6c',
      text: '#facc15',
      label: 'MICHELIN',
      sublabel: 'PREMIUM PERFORMANCE',
    },
  },

  // 2. BFGOODRICH Authentic
  {
    id: 'bfgoodrich-ko2',
    name: 'BFGoodrich All-Terrain KO2 (Oficial)',
    brand: 'BFGoodrich',
    models: ['All-Terrain T/A KO2', 'Mud-Terrain T/A KM3', 'Trail-Terrain T/A', 'Advantage T/A'],
    category: 'Camioneta',
    description: 'Foto comercial auténtica BFGoodrich: tacos entrelazados agresivos, hombros CoreGard y letras blancas.',
    url: bfgoodrichPhoto,
    angleDescription: 'Ángulo 45° con pisada All-Terrain KO2 y hombros con tacos de tracción profunda',
    recommendedFor: ['All-Terrain T/A KO2', 'Mud-Terrain T/A KM3', 'Trail-Terrain T/A'],
    marketingValueHook: 'Leyenda del off-road: impacto visual imbatible para Hilux, Ranger, Amarok y 4x4.',
    brandBadge: {
      bg: '#c91d24',
      text: '#ffffff',
      label: 'BFGoodrich',
      sublabel: 'TOUGHEST ALL-TERRAIN',
    },
  },

  // 3. PIRELLI Authentic
  {
    id: 'pirelli-cinturato',
    name: 'Pirelli Cinturato & Scorpion (Oficial)',
    brand: 'Pirelli',
    models: ['Cinturato P7', 'Scorpion ATR', 'Scorpion All Terrain Plus', 'Chrono', 'P-Zero'],
    category: 'Auto',
    description: 'Foto comercial auténtica Pirelli: diseño italiano asimétrico con canales deportivos y marcaje Pirelli.',
    url: pirelliPhoto,
    angleDescription: 'Ángulo 45° con diseño deportivo asimétrico italiano y pisada de alta velocidad',
    recommendedFor: ['Cinturato P7', 'Scorpion ATR', 'P-Zero', 'Chrono'],
    marketingValueHook: 'Tradición deportiva y elegancia italiana: resalta precisión de viraje y respuesta de frenado.',
    brandBadge: {
      bg: '#d50000',
      text: '#ffffff',
      label: 'PIRELLI',
      sublabel: 'POWER & CONTROL',
    },
  },

  // 4. BRIDGESTONE Authentic
  {
    id: 'bridgestone-turanza',
    name: 'Bridgestone Turanza & Dueler (Oficial)',
    brand: 'Bridgestone',
    models: ['Turanza ER300', 'Turanza T005', 'Dueler A/T', 'Dueler H/T', 'Ecopia'],
    category: 'Auto',
    description: 'Foto comercial auténtica Bridgestone: tecnología de precisión japonesa con drenaje silencioso.',
    url: bridgestonePhoto,
    angleDescription: 'Ángulo 45° con pisada Turanza/Dueler y bloques de absorción de ruidos',
    recommendedFor: ['Turanza ER300', 'Turanza T005', 'Dueler A/T', 'Ecopia EP150'],
    marketingValueHook: 'Precisión y durabilidad japonesa: destaca el andar sereno y el desgaste parejo en ruta.',
    brandBadge: {
      bg: '#111111',
      text: '#ffffff',
      label: 'BRIDGESTONE',
      sublabel: 'PASSION FOR EXCELLENCE',
    },
  },

  // 5. GOODYEAR Authentic
  {
    id: 'goodyear-wrangler',
    name: 'Goodyear Wrangler & EfficientGrip (Oficial)',
    brand: 'Goodyear',
    models: ['Wrangler All-Terrain', 'Wrangler Workhorse', 'EfficientGrip Performance', 'Assurance'],
    category: 'SUV',
    description: 'Foto comercial auténtica Goodyear: hombros reforzados con tacos profundos para pickups y SUVs.',
    url: goodyearPhoto,
    angleDescription: 'Ángulo 45° con diseño mixto Wrangler y bloques de tracción en asfalto y tierra',
    recommendedFor: ['Wrangler AT', 'EfficientGrip', 'Assurance MaxLife', 'Workhorse'],
    marketingValueHook: 'Fuerza y confiabilidad en todo camino: excelente balance entre tracción mixta y confort.',
    brandBadge: {
      bg: '#002f6c',
      text: '#ffd100',
      label: 'GOODYEAR',
      sublabel: 'INNOVATION & TRACTION',
    },
  },

  // 6. FATE Authentic
  {
    id: 'fate-maxisport',
    name: 'Fate Maxisport & Prestiva (Oficial)',
    brand: 'Fate',
    models: ['Maxisport 2', 'Prestiva', 'Range Runner AT/R', 'Eximia Pininfarina', 'Sentiva'],
    category: 'Auto',
    description: 'Foto comercial auténtica Fate: el neumático más vendido y fabricado en Argentina para uso diario.',
    url: fatePhoto,
    angleDescription: 'Ángulo 45° con pisada simétrica de alta rotación urbana y canales de desagote',
    recommendedFor: ['Maxisport 2', 'Prestiva', 'Range Runner', 'Sentiva'],
    marketingValueHook: 'La opción nacional preferida por millones: excelente rendimiento kilométrico al mejor precio.',
    brandBadge: {
      bg: '#003399',
      text: '#ffffff',
      label: 'FATE',
      sublabel: 'INDUSTRIA ARGENTINA',
    },
  },

  // 7. CONTINENTAL Authentic
  {
    id: 'continental-suv',
    name: 'Continental ContiCross & PowerContact (Oficial)',
    brand: 'Continental',
    models: ['ContiCrossContact', 'PowerContact 2', 'ContiPremiumContact', 'CrossContact ATR'],
    category: 'SUV',
    description: 'Foto comercial auténtica Continental: ingeniería alemana con banda de rodamiento de alta adherencia.',
    url: continentalPhoto,
    angleDescription: 'Ángulo 45° con ingeniería Continental y surcos de frenado optimizado',
    recommendedFor: ['ContiCrossContact', 'PowerContact 2', 'ContiPremiumContact'],
    marketingValueHook: 'Ingeniería y seguridad alemana: reduce notablemente la distancia de frenado en mojado.',
    brandBadge: {
      bg: '#ff6600',
      text: '#111111',
      label: 'CONTINENTAL',
      sublabel: 'GERMAN TECHNOLOGY',
    },
  },

  // 8. ZMAX Authentic
  {
    id: 'zmax-zephyr',
    name: 'Zmax Zephyr & Landgraphel (Oficial)',
    brand: 'Zmax',
    models: ['Zephyr Z-107', 'Zephyr Z-108', 'Landgraphel A/T', 'X-Spider A/S', 'Cityracer'],
    category: 'Auto',
    description: 'Foto comercial auténtica Zmax: diseño asimétrico contemporáneo con excelente relación precio-calidad.',
    url: zmaxPhoto,
    angleDescription: 'Ángulo 45° con pisada moderna y hombros diseñados para respuesta ágil',
    recommendedFor: ['Zephyr Z-107', 'Landgraphel A/T', 'Cityracer', 'X-Spider'],
    marketingValueHook: 'Gran relación costo-beneficio: diseño moderno y silencioso a un precio muy accesible.',
    brandBadge: {
      bg: '#b91c1c',
      text: '#ffffff',
      label: 'ZMAX',
      sublabel: 'MAXIMUM QUALITY',
    },
  },

  // 9. ONYX / PACE / FORTINR Authentic
  {
    id: 'onyx-pace-fortinr',
    name: 'Onyx / Pace / Fortinr (Radial Importado)',
    brand: 'Onyx',
    models: ['NY-801', 'NY-901', 'Alventi', 'PC20', 'FSR-602', 'FSR-802', 'Tormenta A/T'],
    category: 'Auto',
    description: 'Foto comercial auténtica de alta durabilidad: canales anchos circunferenciales y flanco limpio.',
    url: onyxPacePhoto,
    angleDescription: 'Ángulo 45° de alta resistencia para uso citadino y flotas comerciales',
    recommendedFor: ['Onyx NY-801', 'Pace Alventi', 'Fortinr FSR', 'Fortune'],
    marketingValueHook: 'La mejor opción para renovar cubiertas con bajo presupuesto sin resignar durabilidad.',
    brandBadge: {
      bg: '#1e293b',
      text: '#38bdf8',
      label: 'IMPORTADO',
      sublabel: 'CALIDAD GARANTIZADA',
    },
  },

  // 10. Fallback All-Terrain Genérico
  {
    id: 'photo-at-45',
    name: 'All-Terrain 4x4 / Pick-up (Genérico)',
    brand: 'Genérica',
    models: ['All-Terrain Genérico', 'Pick-up 4x4'],
    category: 'Camioneta',
    description: 'Tacos robustos con canales profundos y hombros reforzados para tracción mixta.',
    url: atPhoto,
    angleDescription: 'Ángulo 45° con pisada mixta y perfil lateral de alta tracción',
    recommendedFor: ['Hilux', 'Amarok', 'Ranger', 'S10', 'Frontier'],
    marketingValueHook: 'Impacto visual off-road agresivo para camionetas.',
    brandBadge: {
      bg: '#15803d',
      text: '#ffffff',
      label: '4X4 ALL-TERRAIN',
      sublabel: 'TRACCIÓN TOTAL',
    },
  },

  // 11. Fallback Sport Genérico
  {
    id: 'photo-sport-45',
    name: 'High Performance / Sport (Genérico)',
    brand: 'Genérica',
    models: ['Sport Genérico', 'Perfil Bajo'],
    category: 'Sport',
    description: 'Perfil bajo con dibujo asimétrico deportivo para máxima adherencia en curvas.',
    url: sportPhoto,
    angleDescription: 'Ángulo 45° con diseño direccional de alta velocidad y perfil bajo',
    recommendedFor: ['Vento', 'Cruze', 'Golf', 'Focus 3'],
    marketingValueHook: 'Estética deportiva de alta velocidad.',
    brandBadge: {
      bg: '#b91c1c',
      text: '#ffffff',
      label: 'SPORT LINE',
      sublabel: 'HIGH PERFORMANCE',
    },
  },

  // 12. Fallback SUV Highway Genérico
  {
    id: 'photo-suv-45',
    name: 'SUV & Crossover Highway (Genérico)',
    brand: 'Genérica',
    models: ['SUV Highway Genérico'],
    category: 'SUV',
    description: 'Banda reforzada de alto drenaje para SUVs familiares y camionetas urbanas.',
    url: suvPhoto,
    angleDescription: 'Ángulo 45° con canales anchos de evacuación de agua y perfil SUV',
    recommendedFor: ['Corolla Cross', 'Taos', 'Renegade', 'Tracker'],
    marketingValueHook: 'Sensación de seguridad y confort familiar.',
    brandBadge: {
      bg: '#0284c7',
      text: '#ffffff',
      label: 'SUV HIGHWAY',
      sublabel: 'SEGURIDAD & CONFORT',
    },
  },

  // 13. Fallback Utilitario Carga Genérico
  {
    id: 'photo-van-45',
    name: 'Utilitario / Carga Pesada (Genérico)',
    brand: 'Genérica',
    models: ['Cargo 8 Telas', 'Utilitario'],
    category: 'Utilitario',
    description: 'Carcasa reforzada con 8 telas para soportar carga y trabajo intenso.',
    url: vanPhoto,
    angleDescription: 'Ángulo 45° de alta resistencia con costados blindados para carga',
    recommendedFor: ['Kangoo', 'Partner', 'Berlingo', 'Fiorino'],
    marketingValueHook: 'Valor de durabilidad y rentabilidad para utilitarios comerciales.',
    brandBadge: {
      bg: '#d97706',
      text: '#ffffff',
      label: 'CARGO HEAVY DUTY',
      sublabel: '8 TELAS REFORZADAS',
    },
  },

  // 14. Fallback Touring Confort Genérico
  {
    id: 'photo-tour-45',
    name: 'Touring Confort Urbano (Genérico)',
    brand: 'Genérica',
    models: ['Touring Urbano'],
    category: 'Auto',
    description: 'Banda simétrica con 4 canales circunferenciales para drenaje óptimo y marcha suave.',
    url: tourPhoto,
    angleDescription: 'Ángulo 45° con detalle de surcos aqua-grip y marcha silenciosa',
    recommendedFor: ['Cronos', '208', 'Yaris', 'Gol Trend'],
    marketingValueHook: 'Confort de marcha diario y bajo consumo de combustible.',
    brandBadge: {
      bg: '#334155',
      text: '#ffffff',
      label: 'TOURING COMFORT',
      sublabel: 'MARCHA SILENCIOSA',
    },
  },
];

/**
 * Intelligent Brand & Model Photo Selector:
 * Matches the tire's exact BRAND and MODEL first, ensuring that Michelin gets Michelin photos,
 * BFGoodrich gets BFGoodrich KO2 photos, Pirelli gets Pirelli photos, Bridgestone gets Bridgestone,
 * Goodyear gets Goodyear, Fate gets Fate, Continental gets Continental, and Zmax/Onyx/Pace get their authentic designs.
 */
export function selectBestMarketingPhoto(tire: {
  marca?: string;
  modelo?: string;
  dimensiones?: string;
  categoria?: string;
}): { preset: TirePhotoPreset; marketingReason: string } {
  const normBrand = (tire.marca || '').trim().toUpperCase();
  const normModel = (tire.modelo || '').trim().toUpperCase();
  const normDim = (tire.dimensiones || '').trim().toUpperCase();
  const normCat = (tire.categoria || '').trim().toLowerCase();

  // 1. MICHELIN
  if (
    normBrand.includes('MICHELIN') ||
    normModel.includes('PRIMACY') ||
    normModel.includes('PILOT') ||
    normModel.includes('ENERGY') ||
    normModel.includes('AGILIS') ||
    normModel.includes('LTX')
  ) {
    return {
      preset: TIRE_PHOTO_PRESETS[0],
      marketingReason:
        'Foto comercial auténtica Michelin: Pisada asimétrica de 4 canales circunferenciales aqua-grip con hombro acústico y marcaje Michelin correspondiente.',
    };
  }

  // 2. BFGOODRICH
  if (
    normBrand.includes('BFGOODRICH') ||
    normBrand.includes('BF GOODRICH') ||
    normBrand.includes('BFG') ||
    normModel.includes('KO2') ||
    normModel.includes('KM3') ||
    normModel.includes('ALL-TERRAIN') ||
    normModel.includes('MUD-TERRAIN') ||
    normModel.includes('TRAIL-TERRAIN')
  ) {
    return {
      preset: TIRE_PHOTO_PRESETS[1],
      marketingReason:
        'Foto comercial auténtica BFGoodrich: Tacos entrelazados off-road agresivos con hombros CoreGard y letras blancas emblemáticas de la marca.',
    };
  }

  // 3. PIRELLI
  if (
    normBrand.includes('PIRELLI') ||
    normModel.includes('CINTURATO') ||
    normModel.includes('SCORPION') ||
    normModel.includes('CHRONO') ||
    normModel.includes('P-ZERO') ||
    normModel.includes('PZERO') ||
    normModel.includes('P7') ||
    normModel.includes('P1')
  ) {
    return {
      preset: TIRE_PHOTO_PRESETS[2],
      marketingReason:
        'Foto comercial auténtica Pirelli: Diseño italiano asimétrico de alta velocidad con compuestos de sílice y marcaje deportivo correspondiente a Pirelli.',
    };
  }

  // 4. BRIDGESTONE / FIRESTONE
  if (
    normBrand.includes('BRIDGESTONE') ||
    normModel.includes('TURANZA') ||
    normModel.includes('DUELER') ||
    normModel.includes('ECOPIA') ||
    normModel.includes('POTENZA')
  ) {
    return {
      preset: TIRE_PHOTO_PRESETS[3],
      marketingReason:
        'Foto comercial auténtica Bridgestone: Pisada de precisión japonesa Turanza/Dueler para máximo confort de marcha, estabilidad y durabilidad.',
    };
  }

  // 5. GOODYEAR
  if (
    normBrand.includes('GOODYEAR') ||
    normBrand.includes('GOOD YEAR') ||
    normModel.includes('WRANGLER') ||
    normModel.includes('EFFICIENTGRIP') ||
    normModel.includes('ASSURANCE') ||
    normModel.includes('WORKHORSE')
  ) {
    return {
      preset: TIRE_PHOTO_PRESETS[4],
      marketingReason:
        'Foto comercial auténtica Goodyear: Hombros reforzados con diseño de agarre superior en asfalto y tierra correspondiente a la línea Wrangler / Goodyear.',
    };
  }

  // 6. FATE
  if (
    normBrand.includes('FATE') ||
    normModel.includes('MAXISPORT') ||
    normModel.includes('PRESTIVA') ||
    normModel.includes('RANGE RUNNER') ||
    normModel.includes('SENTIVA') ||
    normModel.includes('EXIMIA')
  ) {
    return {
      preset: TIRE_PHOTO_PRESETS[5],
      marketingReason:
        'Foto comercial auténtica Fate: Medida y pisada argentina de alta rotación para uso citadino y ruta nacional con excelente kilometraje.',
    };
  }

  // 7. CONTINENTAL
  if (
    normBrand.includes('CONTINENTAL') ||
    normBrand.includes('CONTI') ||
    normModel.includes('CONTICROSS') ||
    normModel.includes('POWERCONTACT') ||
    normModel.includes('CONTIPREMIUM')
  ) {
    return {
      preset: TIRE_PHOTO_PRESETS[6],
      marketingReason:
        'Foto comercial auténtica Continental: Ingeniería alemana de frenado en seco y mojado con compuestos de alta performance.',
    };
  }

  // 8. ZMAX
  if (
    normBrand.includes('ZMAX') ||
    normModel.includes('ZEPHYR') ||
    normModel.includes('LANDGRAPHEL') ||
    normModel.includes('X-SPIDER') ||
    normModel.includes('CITYRACER')
  ) {
    return {
      preset: TIRE_PHOTO_PRESETS[7],
      marketingReason:
        'Foto comercial auténtica Zmax: Diseño moderno de evacuación rápida de agua y excelente relación precio-calidad.',
    };
  }

  // 9. ONYX, PACE, FORTINR / FORTUNE
  if (
    normBrand.includes('ONYX') ||
    normBrand.includes('PACE') ||
    normBrand.includes('FORTINR') ||
    normBrand.includes('FORTUNE') ||
    normModel.includes('NY-') ||
    normModel.includes('ALVENTI') ||
    normModel.includes('FSR-') ||
    normModel.includes('PC20') ||
    normModel.includes('PC50')
  ) {
    return {
      preset: TIRE_PHOTO_PRESETS[8],
      marketingReason:
        'Foto comercial auténtica para neumáticos radiales de importación: banda reforzada con canales anchos de tracción urbana y flanco limpio.',
    };
  }

  // 10. Secondary heuristic based on dimensions and category if brand is unfamiliar
  const isPickupOr4x4 =
    normCat.includes('camioneta') ||
    normCat.includes('4x4') ||
    /245\/|255\/|265\/|275\/|285\/|235\/70|235\/75|245\/70|265\/65|265\/60|265\/70|31X10/.test(normDim);

  if (isPickupOr4x4) {
    return {
      preset: TIRE_PHOTO_PRESETS[1], // BFGoodrich KO2 style is the highest-converting 4x4 photo
      marketingReason:
        'Selección IA para Camioneta 4x4: Foto comercial off-road con tacos laterales profundos para resaltar tracción extrema en Hilux, Amarok y Ranger.',
    };
  }

  const isSportProfile =
    normCat.includes('deportiv') ||
    normModel.includes('SPORT') ||
    /225\/45|225\/40|235\/45|235\/40|245\/45|245\/40|215\/45|205\/50|225\/50R17|235\/50/.test(normDim);

  if (isSportProfile) {
    return {
      preset: TIRE_PHOTO_PRESETS[2], // Pirelli style sport
      marketingReason:
        'Selección IA Deportiva: Foto a 45° con pisada asimétrica de perfil bajo para máxima atracción visual en autos veloces (Vento, Cruze, Corolla SEG).',
    };
  }

  const isVan =
    normCat.includes('utilitario') ||
    normCat.includes('carga') ||
    normModel.includes('CARGO') ||
    /175\/70R14C|185R14C|195\/70R15C|195\/75R16C|205\/75R16C/.test(normDim);

  if (isVan) {
    return {
      preset: TIRE_PHOTO_PRESETS[12], // Van photo
      marketingReason:
        'Selección IA para Utilitarios: Foto con hombro reforzado de alta durabilidad para clientes de flotas y transporte (Kangoo, Partner, Fiorino).',
    };
  }

  // Default: Touring Michelin / Premium style for passenger cars (Cronos, 208, Yaris)
  return {
    preset: TIRE_PHOTO_PRESETS[0],
    marketingReason:
      'Selección IA Premium Touring: Foto a 45° con 4 canales circunferenciales de evacuación rápida de agua, optimizada para venta en autos de calle.',
  };
}

/**
 * Returns brand badge styling information based on brand name
 */
export function getBrandBadgeStyle(brandName: string): {
  bg: string;
  text: string;
  label: string;
  sublabel: string;
} {
  const norm = (brandName || '').toUpperCase();
  if (norm.includes('MICHELIN')) {
    return { bg: '#002f6c', text: '#facc15', label: 'MICHELIN', sublabel: 'DISTRIBUIDOR OFICIAL' };
  }
  if (norm.includes('BFGOODRICH') || norm.includes('BFG')) {
    return { bg: '#c91d24', text: '#ffffff', label: 'BFGOODRICH', sublabel: 'OFF-ROAD LEGEND' };
  }
  if (norm.includes('PIRELLI')) {
    return { bg: '#d50000', text: '#ffffff', label: 'PIRELLI', sublabel: 'TECNOLOGÍA ITALIANA' };
  }
  if (norm.includes('BRIDGESTONE')) {
    return { bg: '#111111', text: '#ffffff', label: 'BRIDGESTONE', sublabel: 'PRECISIÓN JAPONESA' };
  }
  if (norm.includes('GOODYEAR')) {
    return { bg: '#002f6c', text: '#ffd100', label: 'GOODYEAR', sublabel: 'MÁXIMO AGARRE' };
  }
  if (norm.includes('FATE')) {
    return { bg: '#003399', text: '#ffffff', label: 'FATE', sublabel: 'INDUSTRIA ARGENTINA' };
  }
  if (norm.includes('CONTINENTAL')) {
    return { bg: '#ff6600', text: '#111111', label: 'CONTINENTAL', sublabel: 'INGENIERÍA ALEMANA' };
  }
  if (norm.includes('ZMAX')) {
    return { bg: '#b91c1c', text: '#ffffff', label: 'ZMAX', sublabel: 'ALTA PERFORMANCE' };
  }
  if (norm.includes('ONYX')) {
    return { bg: '#0f172a', text: '#38bdf8', label: 'ONYX', sublabel: 'CALIDAD GARANTIZADA' };
  }
  if (norm.includes('PACE')) {
    return { bg: '#064e3b', text: '#6ee7b7', label: 'PACE', sublabel: 'RADIAL ADVANCED' };
  }
  if (norm.includes('FORTINR') || norm.includes('FORTUNE')) {
    return { bg: '#312e81', text: '#c7d2fe', label: 'FORTINR', sublabel: 'CALIDAD & DURABILIDAD' };
  }
  return {
    bg: '#111111',
    text: '#facc15',
    label: (brandName || 'NEUMÁTICO').toUpperCase(),
    sublabel: 'COTTA GARANTÍA OFICIAL',
  };
}
