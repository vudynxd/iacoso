export type TireAnimationType = 'spin-3d' | 'float-drift' | 'speed-zoom' | 'cyber-pulse' | 'offroad-bounce';
export type ParticleEffectType = 'sparks' | 'smoke' | 'speed-lines' | 'embers' | 'none';
export type StoryBadgeStyle = 'skew' | 'neon' | 'pill' | 'metallic';

export type MotionBackgroundType =
  | 'asphalt-speed-3d'
  | 'cyber-synth-grid'
  | 'thunder-storm-sparks'
  | 'f1-pitlane-racing'
  | 'offroad-dirt-terrain'
  | 'carbon-dark-studio'
  | 'warp-hyperspace'
  | 'kinetic-heatwave'
  | 'generative-prompt';

export type GenerativeGroundStyle =
  | 'flower-field'
  | 'spring-meadow'
  | 'autumn-forest'
  | 'sunset-highway'
  | 'sunset-beach'
  | 'underwater-ocean'
  | 'wet-asphalt'
  | 'neon-grid'
  | 'sand-dunes'
  | 'starfield-warp'
  | 'racing-circuit'
  | 'dark-studio'
  | 'snow-ice'
  | 'volcanic-magma'
  | 'matrix-data'
  | 'clouds-sky'
  | 'luxury-marble'
  | 'wheat-field'
  | 'disco-stage'
  | 'custom-procedural';

export type GenerativeLightingStyle =
  | 'sunlight'
  | 'sunbeams'
  | 'tunnel-lights'
  | 'neon-lasers'
  | 'thunder-bolts'
  | 'god-rays'
  | 'strobe-flashes'
  | 'volumetric-fog'
  | 'aurora-borealis';

export type GenerativeParticleType =
  | 'flower-petals'
  | 'petals'
  | 'leaves'
  | 'fireflies'
  | 'embers'
  | 'sparks'
  | 'rain'
  | 'speed-streaks'
  | 'dust-sand'
  | 'starfield'
  | 'smoke-puffs'
  | 'neon-dots'
  | 'snow-flakes'
  | 'bubbles'
  | 'money-bills'
  | 'confetti'
  | 'autumn-leaves'
  | 'diamonds'
  | 'matrix-rain'
  | 'colored-smoke'
  | 'gold-coins'
  | 'music-notes'
  | 'lightning-sparks'
  | 'custom-particles';

export interface GenerativeMotionConfig {
  prompt: string;
  themeName: string;
  // Ambient atmosphere & sky
  skyColors: [string, string, string]; // [top, middle, horizon]
  horizonYRatio: number; // 0.3 to 0.55
  groundStyle: GenerativeGroundStyle;
  groundReflection: boolean;
  gridLinesColor?: string;
  // Dynamic atmospheric lighting
  lightingStyle: GenerativeLightingStyle;
  ambientLightColor: string;
  // Dynamic generative particle system
  particlesType: GenerativeParticleType;
  particleColor: string;
  particleSecondaryColor?: string;
  particleDensity: number; // 15 to 120
  speedMultiplier: number; // 0.6 to 2.5
  cameraBobbing: boolean;
  pulseWaveIntensity: number; // 0 to 1
}

export interface MotionBackgroundInfo {
  id: MotionBackgroundType;
  name: string;
  description: string;
  icon: string;
  tag: string;
}

export const MOTION_BACKGROUND_OPTIONS: MotionBackgroundInfo[] = [
  {
    id: 'asphalt-speed-3d',
    name: 'Autopista & Asfalto 3D',
    description: 'Perspectiva de asfalto en velocidad con líneas viales amarillas y luminarias de túnel nocturno.',
    icon: '🛣️',
    tag: 'Recomendado Ruta',
  },
  {
    id: 'cyber-synth-grid',
    name: 'Rejilla Neón Cyberpunk',
    description: 'Piso digital de perspectiva 3D con horizonte synthwave, láseres cyan/magenta y pulso tecnológico.',
    icon: '🌃',
    tag: 'Urbano Futurista',
  },
  {
    id: 'thunder-storm-sparks',
    name: 'Tormenta Eléctrica & Chispas',
    description: 'Nubes oscuras con relámpagos estroboscópicos, destellos de alto voltaje y chispas doradas incandescentes.',
    icon: '⚡',
    tag: 'Oferta Urgente',
  },
  {
    id: 'f1-pitlane-racing',
    name: 'Circuito F1 & Bandera Cuadros',
    description: 'Malla ondeante de bandera a cuadros, marcas de derrape sobre el pavimento y focos deportivos.',
    icon: '🏁',
    tag: 'Competición & Sport',
  },
  {
    id: 'offroad-dirt-terrain',
    name: 'Off-Road 4x4 Barro & Tierra',
    description: 'Topografía de relieve dinámico, partículas de tierra flotando a contraluz y ambiente agreste.',
    icon: '⛰️',
    tag: 'Pickups & Campo',
  },
  {
    id: 'carbon-dark-studio',
    name: 'Fibra de Carbono & Salón VIP',
    description: 'Tejido 3D de fibra de carbono con barrido de luz metálica cenital y reflejos de showroom de lujo.',
    icon: '✨',
    tag: 'Gama Alta & Lujo',
  },
  {
    id: 'warp-hyperspace',
    name: 'Túnel Hiperespacio Radial',
    description: 'Aceleración estelar infinita hacia el espectador con rayos luminosos anamórficos.',
    icon: '🚀',
    tag: 'Máxima Velocidad',
  },
  {
    id: 'kinetic-heatwave',
    name: 'Ondas Cinéticas & Hexágonos',
    description: 'Patrón de panal hexagonal automotriz pulsando con ondas de calor de asfalto.',
    icon: '🔥',
    tag: 'Tracción Máxima',
  },
  {
    id: 'generative-prompt',
    name: '✨ Motor Generativo por Prompt (IA)',
    description: 'Ambiente cinemático procedural creado en tiempo real según cualquier texto o fantasía visual.',
    icon: '🎨',
    tag: 'Creatividad Ilimitada',
  },
];

export interface StoryThemeStyle {
  id: string;
  name: string;
  tagline: string;
  bgGradient: string;
  accentColor: string;
  secondaryColor: string;
  glowColor: string;
  tireAnimationType: TireAnimationType;
  particles: ParticleEffectType;
  badgeStyle: StoryBadgeStyle;
  storyMood: string;
  customPrompt?: string;
  motionBackground: MotionBackgroundType;
  customMotionConfig?: GenerativeMotionConfig;
  // Metadata for custom generated options
  description?: string;
  category?: string;
  isCustomGenerated?: boolean;
}

export const PRESET_STORY_THEMES: StoryThemeStyle[] = [
  {
    id: 'cinematic-obsidian',
    name: '✨ Obsidian Studio (Black Edition)',
    tagline: 'CONFORT & ELEGANCIA SHOWROOM',
    bgGradient: 'from-[#0a0c10] via-[#050608] to-[#020204]',
    accentColor: '#facc15',
    secondaryColor: '#e5c07b',
    glowColor: 'rgba(250, 204, 21, 0.45)',
    tireAnimationType: 'float-drift',
    particles: 'embers',
    badgeStyle: 'metallic',
    storyMood: 'Estudio de iluminación automotriz con pedestal de espejo pulido y acentos dorados',
    customPrompt: 'Estudio de lujo automotriz con piso pulido, luz cenital suave y destellos dorados champán',
    motionBackground: 'carbon-dark-studio',
    category: 'Showroom & Lujo',
    description: 'Pedestal pulido con reflejos de espejo, haz de luz cenital suave y halo dorado.',
  },
  {
    id: 'apex-racing',
    name: '🏎️ Apex Telemetry GT',
    tagline: 'MÁXIMA ADHERENCIA Y VELOCIDAD',
    bgGradient: 'from-[#0f0407] via-[#080204] to-[#020001]',
    accentColor: '#ef4444',
    secondaryColor: '#f59e0b',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    tireAnimationType: 'speed-zoom',
    particles: 'speed-lines',
    badgeStyle: 'skew',
    storyMood: 'Fibra de carbono, túnel de viento con líneas aerodinámicas y tacómetro de competición',
    customPrompt: 'Pista de carreras F1, túnel de viento aerodinámico, tacómetro HUD digital y líneas rojas',
    motionBackground: 'f1-pitlane-racing',
    category: 'Velocidad & Competición',
    description: 'Líneas de flujo aerodinámico, tacómetro digital circular y partículas de alta velocidad.',
  },
  {
    id: 'cyber-velocity',
    name: '🌃 Cyber Velocity Neón',
    tagline: 'TECNOLOGÍA RADIAL DEL FUTURO',
    bgGradient: 'from-[#040714] via-[#02030a] to-[#000002]',
    accentColor: '#06b6d4',
    secondaryColor: '#ec4899',
    glowColor: 'rgba(6, 182, 212, 0.55)',
    tireAnimationType: 'cyber-pulse',
    particles: 'sparks',
    badgeStyle: 'neon',
    storyMood: 'Asfalto mojado con reflejos de neón cyan y magenta, láseres y rejilla 3D',
    customPrompt: 'Estilo cyber Tokyo nocturno, asfalto mojado con lluvia de neón cyan y magenta, circuito láser',
    motionBackground: 'cyber-synth-grid',
    category: 'Futurista & Tech',
    description: 'Perspectiva de piso reflectivo con cuadrícula neón, barridos láser y halos pulsantes.',
  },
  {
    id: 'expedition-4x4',
    name: '⛰️ Topographic 4x4 All-Terrain',
    tagline: 'TRACCIÓN TOTAL EN CUALQUIER TERRENO',
    bgGradient: 'from-[#0c120c] via-[#070a07] to-[#020302]',
    accentColor: '#84cc16',
    secondaryColor: '#eab308',
    glowColor: 'rgba(132, 204, 22, 0.45)',
    tireAnimationType: 'offroad-bounce',
    particles: 'smoke',
    badgeStyle: 'pill',
    storyMood: 'Curvas de nivel topográficas dinámicas, telemetría GPS y partículas en suspensión',
    customPrompt: 'Expedición 4x4 off-road, curvas de nivel de mapa topográfico, brújula y tonos tierra',
    motionBackground: 'offroad-dirt-terrain',
    category: 'Campo & 4x4',
    description: 'Curvas de nivel topográficas ondulantes en tiempo real con telemetría de coordenadas.',
  },
  {
    id: 'solar-twilight',
    name: '🌾 Atardecer Pampeano',
    tagline: 'LA FUERZA DEL CAMPO EN TUS NEUMÁTICOS',
    bgGradient: 'from-[#1c0804] via-[#2d1109] to-[#0c0402]',
    accentColor: '#f59e0b',
    secondaryColor: '#ea580c',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    tireAnimationType: 'float-drift',
    particles: 'embers',
    badgeStyle: 'metallic',
    storyMood: 'Horizonte de atardecer cálido con sol rasante, destellos ámbar y partículas doradas',
    customPrompt: 'Atardecer pampeano cálido, sol rasante en el horizonte, reflejos ámbar y partículas doradas',
    motionBackground: 'kinetic-heatwave',
    category: 'Campo & 4x4',
    description: 'Sol rasante en el horizonte con halo atmosférico y micro-partículas doradas flotantes.',
  },
  {
    id: 'thunder-volt',
    name: '⚡ Thunder Volt (Alta Tensión)',
    tagline: 'POTENCIA Y AGARRE INMEDIATO',
    bgGradient: 'from-[#06030c] via-[#030107] to-[#010003]',
    accentColor: '#c084fc',
    secondaryColor: '#facc15',
    glowColor: 'rgba(192, 132, 252, 0.5)',
    tireAnimationType: 'speed-zoom',
    particles: 'sparks',
    badgeStyle: 'neon',
    storyMood: 'Relámpagos eléctricos generados por algoritmo con chispas incandescentes de alto voltaje',
    customPrompt: 'Tormenta eléctrica violeta con rayos de alto voltaje, plasma energético y chispas',
    motionBackground: 'thunder-storm-sparks',
    category: 'Promoción & Ventas',
    description: 'Rayos eléctricos generados en tiempo real con plasma violeta y chispas incandescentes.',
  },
  {
    id: 'spring-meadow-fx',
    name: '🌸 Campo de Flores & Sol',
    tagline: 'DISFRUTÁ LA RUTA EN PRIMAVERA',
    bgGradient: 'from-[#032e16] via-[#064e3b] to-[#022c22]',
    accentColor: '#f43f5e',
    secondaryColor: '#22c55e',
    glowColor: 'rgba(244, 63, 94, 0.5)',
    tireAnimationType: 'float-drift',
    particles: 'smoke',
    badgeStyle: 'pill',
    storyMood: 'Frescura primaveral con flores silvestres 3D y sol resplandeciente',
    customPrompt: 'Campo de flores, primavera, sol radiante, cielo azul y pétalos de flores bailando al viento',
    motionBackground: 'generative-prompt',
    category: 'Clima & Naturaleza',
    description: 'Pradera verde con flores silvestres en perspectiva 3D y pétalos de rosas flotantes.',
    customMotionConfig: {
      prompt: 'Campo de flores primaveral con pétalos',
      themeName: '🌸 Campo de Flores & Sol',
      skyColors: ['#0284c7', '#38bdf8', '#fef08a'],
      horizonYRatio: 0.38,
      groundStyle: 'flower-field',
      groundReflection: false,
      lightingStyle: 'sunlight',
      ambientLightColor: '#fde047',
      particlesType: 'flower-petals',
      particleColor: '#fb7185',
      particleSecondaryColor: '#ffffff',
      particleDensity: 65,
      speedMultiplier: 0.75,
      cameraBobbing: true,
      pulseWaveIntensity: 0.3,
    },
  },
  {
    id: 'tokyo-rain-fx',
    name: '🌧️ Lluvia & Neón Tokio',
    tagline: 'MÁXIMA ADHERENCIA EN MOJADO',
    bgGradient: 'from-[#030712] via-[#0a0f1d] to-[#010409]',
    accentColor: '#38bdf8',
    secondaryColor: '#c084fc',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    tireAnimationType: 'float-drift',
    particles: 'sparks',
    badgeStyle: 'neon',
    storyMood: 'Lluvia cinematográfica con asfalto mojado y reflejos neón',
    customPrompt: 'Lluvia, asfalto mojado con reflejos de luces de neón nocturnas',
    motionBackground: 'generative-prompt',
    category: 'Clima & Seguridad',
    description: 'Asfalto mojado con vetas de agua, lluvia cayendo a velocidad y reflejos de neón.',
    customMotionConfig: {
      prompt: 'Lluvia sobre asfalto mojado',
      themeName: '🌧️ Lluvia & Neón Tokio',
      skyColors: ['#020617', '#0f172a', '#050b14'],
      horizonYRatio: 0.37,
      groundStyle: 'wet-asphalt',
      groundReflection: true,
      lightingStyle: 'neon-lasers',
      ambientLightColor: '#38bdf8',
      particlesType: 'rain',
      particleColor: '#38bdf8',
      particleSecondaryColor: '#c084fc',
      particleDensity: 90,
      speedMultiplier: 1.4,
      cameraBobbing: true,
      pulseWaveIntensity: 0.6,
    },
  },
  {
    id: 'underwater-bubbles-fx',
    name: '🌊 Burbujas de Océano & Mar',
    tagline: 'AGARRE HIDRÁULICO SIN LÍMITES',
    bgGradient: 'from-[#02182b] via-[#042f4e] to-[#010c17]',
    accentColor: '#38bdf8',
    secondaryColor: '#2dd4bf',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    tireAnimationType: 'float-drift',
    particles: 'sparks',
    badgeStyle: 'neon',
    storyMood: 'Profundidad marina con agua cristalina y burbujas ascendentes',
    customPrompt: 'Océano azul profundo, fondo marino, agua cristalina y burbujas ascendentes',
    motionBackground: 'generative-prompt',
    category: 'Naturaleza & Agua',
    description: 'Fondo marino azul profundo con rayos de luz solar y burbujas translúcidas flotando.',
    customMotionConfig: {
      prompt: 'Fondo del mar con burbujas de agua',
      themeName: '🌊 Burbujas de Océano & Mar',
      skyColors: ['#0369a1', '#0284c7', '#38bdf8'],
      horizonYRatio: 0.35,
      groundStyle: 'underwater-ocean',
      groundReflection: true,
      lightingStyle: 'sunbeams',
      ambientLightColor: '#38bdf8',
      particlesType: 'bubbles',
      particleColor: '#ffffff',
      particleSecondaryColor: '#38bdf8',
      particleDensity: 55,
      speedMultiplier: 0.8,
      cameraBobbing: true,
      pulseWaveIntensity: 0.4,
    },
  },
  {
    id: 'money-cash-fx',
    name: '💵 Lluvia de Dólares & Oferta Millonaria',
    tagline: 'AHORRÁ DE VERDAD • OFERTA HISTÓRICA',
    bgGradient: 'from-[#052e16] via-[#021e0e] to-[#011007]',
    accentColor: '#22c55e',
    secondaryColor: '#facc15',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    tireAnimationType: 'spin-3d',
    particles: 'embers',
    badgeStyle: 'metallic',
    storyMood: 'Impacto de ahorro máximo con billetes y dólares cayendo',
    customPrompt: 'Lluvia de dólares, billetes volando, monedas de oro y oferta irresistible',
    motionBackground: 'generative-prompt',
    category: 'Promoción & Dinero',
    description: 'Piso de mármol de alta gama con billetes de dólares girando en 3D y brillo de oro.',
    customMotionConfig: {
      prompt: 'Lluvia de billetes de dólares y ahorro',
      themeName: '💵 Lluvia de Dólares & Oferta Millonaria',
      skyColors: ['#064e3b', '#047857', '#10b981'],
      horizonYRatio: 0.4,
      groundStyle: 'luxury-marble',
      groundReflection: true,
      lightingStyle: 'god-rays',
      ambientLightColor: '#4ade80',
      particlesType: 'money-bills',
      particleColor: '#22c55e',
      particleSecondaryColor: '#facc15',
      particleDensity: 40,
      speedMultiplier: 1.1,
      cameraBobbing: false,
      pulseWaveIntensity: 0.5,
    },
  },
  {
    id: 'autumn-leaves-fx',
    name: '🍂 Bosque Dorado & Hojas de Otoño',
    tagline: 'PREPARÁ TU AUTO PARA EL CAMBIO DE ESTACIÓN',
    bgGradient: 'from-[#2b1003] via-[#1a0701] to-[#0a0200]',
    accentColor: '#ea580c',
    secondaryColor: '#d97706',
    glowColor: 'rgba(234, 88, 12, 0.5)',
    tireAnimationType: 'float-drift',
    particles: 'smoke',
    badgeStyle: 'pill',
    storyMood: 'Atmósfera otoñal cálida con hojas secas doradas y rojas',
    customPrompt: 'Otoño, bosque con hojas secas cayendo al viento, tonos cobrizos y atardecer cálido',
    motionBackground: 'generative-prompt',
    category: 'Clima & Naturaleza',
    description: 'Suelo de bosque otoñal con hojas de arce y roble flotando suavemente.',
    customMotionConfig: {
      prompt: 'Bosque de otoño con hojas secas doradas',
      themeName: '🍂 Bosque Dorado & Hojas de Otoño',
      skyColors: ['#451a03', '#78350f', '#f59e0b'],
      horizonYRatio: 0.38,
      groundStyle: 'autumn-forest',
      groundReflection: false,
      lightingStyle: 'sunlight',
      ambientLightColor: '#fbbf24',
      particlesType: 'autumn-leaves',
      particleColor: '#ea580c',
      particleSecondaryColor: '#d97706',
      particleDensity: 45,
      speedMultiplier: 0.85,
      cameraBobbing: true,
      pulseWaveIntensity: 0.35,
    },
  },
  {
    id: 'diamonds-luxury-fx',
    name: '💎 Diamantes & Cristales VIP',
    tagline: 'CALIDAD Y PRESTIGIO IRROMPIBLE',
    bgGradient: 'from-[#0b0f19] via-[#05070d] to-[#020306]',
    accentColor: '#38bdf8',
    secondaryColor: '#f8fafc',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    tireAnimationType: 'spin-3d',
    particles: 'sparks',
    badgeStyle: 'metallic',
    storyMood: 'Lujo reluciente con diamantes facetados y destellos estelares',
    customPrompt: 'Diamantes brillantes, cristales de lujo, destellos estroboscópicos y piso pulido',
    motionBackground: 'generative-prompt',
    category: 'Gama Alta & VIP',
    description: 'Piso pulido de showroom con joyas y diamantes facetados con destellos en cruz.',
    customMotionConfig: {
      prompt: 'Diamantes brillantes y cristales de lujo',
      themeName: '💎 Diamantes & Cristales VIP',
      skyColors: ['#0f172a', '#1e293b', '#0284c7'],
      horizonYRatio: 0.4,
      groundStyle: 'luxury-marble',
      groundReflection: true,
      lightingStyle: 'strobe-flashes',
      ambientLightColor: '#38bdf8',
      particlesType: 'diamonds',
      particleColor: '#ffffff',
      particleSecondaryColor: '#bae6fd',
      particleDensity: 35,
      speedMultiplier: 0.7,
      cameraBobbing: false,
      pulseWaveIntensity: 0.4,
    },
  },
  {
    id: 'confetti-fiesta-fx',
    name: '🎊 Fiesta & Confeti Aniversario',
    tagline: 'FESTEJÁ CON NOSOTROS • PRECIOS ESPECIALES',
    bgGradient: 'from-[#1c0828] via-[#100318] to-[#05000a]',
    accentColor: '#ec4899',
    secondaryColor: '#facc15',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    tireAnimationType: 'spin-3d',
    particles: 'sparks',
    badgeStyle: 'neon',
    storyMood: 'Alegría de aniversario y celebración con confeti multicolor',
    customPrompt: 'Fiesta, confeti de colores volando, celebración y carnaval de ofertas',
    motionBackground: 'generative-prompt',
    category: 'Celebración & Eventos',
    description: 'Pista de celebración con confeti festivo multicolor girando en 3D.',
    customMotionConfig: {
      prompt: 'Fiesta y confeti multicolor',
      themeName: '🎊 Fiesta & Confeti Aniversario',
      skyColors: ['#581c87', '#7e22ce', '#c084fc'],
      horizonYRatio: 0.38,
      groundStyle: 'disco-stage',
      groundReflection: true,
      lightingStyle: 'strobe-flashes',
      ambientLightColor: '#ec4899',
      particlesType: 'confetti',
      particleColor: '#f43f5e',
      particleSecondaryColor: '#facc15',
      particleDensity: 60,
      speedMultiplier: 1.2,
      cameraBobbing: true,
      pulseWaveIntensity: 0.6,
    },
  },
  {
    id: 'wheat-pampa-fx',
    name: '🌾 Campo de Trigo & Atardecer Pampeano',
    tagline: 'LA FUERZA DEL CAMPO EN TUS NEUMÁTICOS',
    bgGradient: 'from-[#291305] via-[#170902] to-[#0a0300]',
    accentColor: '#eab308',
    secondaryColor: '#f97316',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    tireAnimationType: 'offroad-bounce',
    particles: 'smoke',
    badgeStyle: 'pill',
    storyMood: 'Espíritu rural de La Pampa con trigales dorados bajo el sol del atardecer',
    customPrompt: 'Campo de trigo dorado, atardecer pampeano, cosecha, espigas al viento y horizonte rural',
    motionBackground: 'generative-prompt',
    category: 'Campo & 4x4',
    description: 'Espigas de trigo doradas meciéndose en perspectiva 3D bajo un sol atardecido.',
    customMotionConfig: {
      prompt: 'Campo de trigo dorado en el atardecer',
      themeName: '🌾 Campo de Trigo & Atardecer Pampeano',
      skyColors: ['#7c2d12', '#c2410c', '#fde047'],
      horizonYRatio: 0.4,
      groundStyle: 'wheat-field',
      groundReflection: false,
      lightingStyle: 'sunlight',
      ambientLightColor: '#fde047',
      particlesType: 'dust-sand',
      particleColor: '#facc15',
      particleSecondaryColor: '#ea580c',
      particleDensity: 45,
      speedMultiplier: 0.8,
      cameraBobbing: true,
      pulseWaveIntensity: 0.3,
    },
  },
];

const LOCAL_STORAGE_CUSTOM_FX_KEY = 'cotta_custom_generated_fx_v1';

export function loadCustomGeneratedFxList(): StoryThemeStyle[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_FX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        ...item,
        isCustomGenerated: true,
      }));
    }
  } catch (err) {
    console.warn('Error loading custom generated FX from storage:', err);
  }
  return [];
}

export function saveCustomGeneratedFxList(list: StoryThemeStyle[]): void {
  try {
    const customOnly = list.filter((item) => item.isCustomGenerated);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_FX_KEY, JSON.stringify(customOnly));
  } catch (err) {
    console.warn('Error saving custom generated FX to storage:', err);
  }
}

/**
 * EXACT CUSTOM FX GENERATOR
 * Never looks for "algo parecido".
 * If what the user requested is not in the list, generates the EXACT requested option.
 */
export function generateExactCustomFxOption(prompt: string, brandName: string): StoryThemeStyle {
  const p = (prompt || '').toLowerCase().trim();
  const brandUpper = (brandName || 'COTTA').toUpperCase();

  // Helper to extract clean human-readable title words
  const cleanTitle = prompt
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  // 1. Océano / Mar / Agua / Burbujas / Submarino / Acuario
  if (
    p.includes('mar') ||
    p.includes('oceano') ||
    p.includes('océano') ||
    p.includes('burbuja') ||
    p.includes('submarino') ||
    p.includes('acuario') ||
    p.includes('coral') ||
    (p.includes('agua') && !p.includes('lluvia'))
  ) {
    const themeName = `🌊 ${cleanTitle || 'Burbujas de Océano & Mar'}`;
    return {
      id: `fx-gen-${Date.now()}`,
      name: themeName,
      tagline: `AGARRE HIDRÁULICO TOTAL • ${brandUpper}`,
      bgGradient: 'from-[#02182b] via-[#042f4e] to-[#010c17]',
      accentColor: '#38bdf8',
      secondaryColor: '#2dd4bf',
      glowColor: 'rgba(56, 189, 248, 0.5)',
      tireAnimationType: 'float-drift',
      particles: 'sparks',
      badgeStyle: 'neon',
      storyMood: prompt,
      customPrompt: prompt,
      motionBackground: 'generative-prompt',
      category: '✨ Generado a Medida',
      isCustomGenerated: true,
      description: 'Generado exactamente según lo pedido: atmósfera marina con burbujas y corrientes acuáticas.',
      customMotionConfig: {
        prompt,
        themeName,
        skyColors: ['#0369a1', '#0284c7', '#38bdf8'],
        horizonYRatio: 0.35,
        groundStyle: 'underwater-ocean',
        groundReflection: true,
        lightingStyle: 'sunbeams',
        ambientLightColor: '#38bdf8',
        particlesType: 'bubbles',
        particleColor: '#ffffff',
        particleSecondaryColor: '#38bdf8',
        particleDensity: 55,
        speedMultiplier: 0.85,
        cameraBobbing: true,
        pulseWaveIntensity: 0.4,
      },
    };
  }

  // 2. Dinero / Billetes / Dólares / Cash / Fortuna / Banco / Millonario
  if (
    p.includes('dolar') ||
    p.includes('dólar') ||
    p.includes('billete') ||
    p.includes('dinero') ||
    p.includes('cash') ||
    p.includes('plata') ||
    p.includes('fortuna') ||
    p.includes('millon') ||
    p.includes('banco')
  ) {
    const themeName = `💵 ${cleanTitle || 'Lluvia de Billetes & Dólares'}`;
    return {
      id: `fx-gen-${Date.now()}`,
      name: themeName,
      tagline: `OFERTA HISTÓRICA DE AHORRO • ${brandUpper}`,
      bgGradient: 'from-[#052e16] via-[#021e0e] to-[#011007]',
      accentColor: '#22c55e',
      secondaryColor: '#facc15',
      glowColor: 'rgba(34, 197, 94, 0.5)',
      tireAnimationType: 'spin-3d',
      particles: 'embers',
      badgeStyle: 'metallic',
      storyMood: prompt,
      customPrompt: prompt,
      motionBackground: 'generative-prompt',
      category: '✨ Generado a Medida',
      isCustomGenerated: true,
      description: 'Generado exactamente según lo pedido: lluvia de billetes verdes y reflejos de mármol.',
      customMotionConfig: {
        prompt,
        themeName,
        skyColors: ['#064e3b', '#047857', '#10b981'],
        horizonYRatio: 0.4,
        groundStyle: 'luxury-marble',
        groundReflection: true,
        lightingStyle: 'god-rays',
        ambientLightColor: '#4ade80',
        particlesType: 'money-bills',
        particleColor: '#22c55e',
        particleSecondaryColor: '#facc15',
        particleDensity: 40,
        speedMultiplier: 1.1,
        cameraBobbing: false,
        pulseWaveIntensity: 0.5,
      },
    };
  }

  // 3. Otoño / Hojas secas / Bosque dorado
  if (p.includes('otoño') || p.includes('otono') || (p.includes('hoja') && !p.includes('flor'))) {
    const themeName = `🍂 ${cleanTitle || 'Bosque Dorado & Hojas de Otoño'}`;
    return {
      id: `fx-gen-${Date.now()}`,
      name: themeName,
      tagline: `RENDIMIENTO EN CADA ESTACIÓN • ${brandUpper}`,
      bgGradient: 'from-[#2b1003] via-[#1a0701] to-[#0a0200]',
      accentColor: '#ea580c',
      secondaryColor: '#d97706',
      glowColor: 'rgba(234, 88, 12, 0.5)',
      tireAnimationType: 'float-drift',
      particles: 'smoke',
      badgeStyle: 'pill',
      storyMood: prompt,
      customPrompt: prompt,
      motionBackground: 'generative-prompt',
      category: '✨ Generado a Medida',
      isCustomGenerated: true,
      description: 'Generado exactamente según lo pedido: hojas secas de otoño y suelo cálido cobrizo.',
      customMotionConfig: {
        prompt,
        themeName,
        skyColors: ['#451a03', '#78350f', '#f59e0b'],
        horizonYRatio: 0.38,
        groundStyle: 'autumn-forest',
        groundReflection: false,
        lightingStyle: 'sunlight',
        ambientLightColor: '#fbbf24',
        particlesType: 'autumn-leaves',
        particleColor: '#ea580c',
        particleSecondaryColor: '#d97706',
        particleDensity: 45,
        speedMultiplier: 0.85,
        cameraBobbing: true,
        pulseWaveIntensity: 0.35,
      },
    };
  }

  // 4. Diamantes / Cristales / Gemas / Brillo
  if (p.includes('diamante') || p.includes('cristal') || p.includes('gema') || p.includes('joya') || p.includes('brillo')) {
    const themeName = `💎 ${cleanTitle || 'Diamantes & Cristales Brillantes'}`;
    return {
      id: `fx-gen-${Date.now()}`,
      name: themeName,
      tagline: `CALIDAD Y PRESTIGIO PREMIUM • ${brandUpper}`,
      bgGradient: 'from-[#0b0f19] via-[#05070d] to-[#020306]',
      accentColor: '#38bdf8',
      secondaryColor: '#f8fafc',
      glowColor: 'rgba(56, 189, 248, 0.5)',
      tireAnimationType: 'spin-3d',
      particles: 'sparks',
      badgeStyle: 'metallic',
      storyMood: prompt,
      customPrompt: prompt,
      motionBackground: 'generative-prompt',
      category: '✨ Generado a Medida',
      isCustomGenerated: true,
      description: 'Generado exactamente según lo pedido: diamantes facetados con destellos estelares.',
      customMotionConfig: {
        prompt,
        themeName,
        skyColors: ['#0f172a', '#1e293b', '#0284c7'],
        horizonYRatio: 0.4,
        groundStyle: 'luxury-marble',
        groundReflection: true,
        lightingStyle: 'strobe-flashes',
        ambientLightColor: '#38bdf8',
        particlesType: 'diamonds',
        particleColor: '#ffffff',
        particleSecondaryColor: '#bae6fd',
        particleDensity: 35,
        speedMultiplier: 0.7,
        cameraBobbing: false,
        pulseWaveIntensity: 0.4,
      },
    };
  }

  // 5. Matrix / Hacker / Código digital
  if (p.includes('matrix') || p.includes('codigo') || p.includes('código') || p.includes('hacker') || p.includes('binario')) {
    const themeName = `💻 ${cleanTitle || 'Código Digital Matrix'}`;
    return {
      id: `fx-gen-${Date.now()}`,
      name: themeName,
      tagline: `INGENIERÍA DIGITAL RADIAL • ${brandUpper}`,
      bgGradient: 'from-[#021405] via-[#010903] to-[#000401]',
      accentColor: '#22c55e',
      secondaryColor: '#4ade80',
      glowColor: 'rgba(34, 197, 94, 0.5)',
      tireAnimationType: 'cyber-pulse',
      particles: 'speed-lines',
      badgeStyle: 'neon',
      storyMood: prompt,
      customPrompt: prompt,
      motionBackground: 'generative-prompt',
      category: '✨ Generado a Medida',
      isCustomGenerated: true,
      description: 'Generado exactamente según lo pedido: lluvia de código verde matrix sobre rejilla digital.',
      customMotionConfig: {
        prompt,
        themeName,
        skyColors: ['#052e16', '#021e0e', '#000000'],
        horizonYRatio: 0.4,
        groundStyle: 'matrix-data',
        groundReflection: true,
        lightingStyle: 'neon-lasers',
        ambientLightColor: '#22c55e',
        particlesType: 'matrix-rain',
        particleColor: '#22c55e',
        particleSecondaryColor: '#86efac',
        particleDensity: 60,
        speedMultiplier: 1.4,
        cameraBobbing: false,
        pulseWaveIntensity: 0.6,
      },
    };
  }

  // 6. Discoteca / Boliche / Fiesta / Rayos láser / Escenario
  if (p.includes('disco') || p.includes('boliche') || p.includes('laser') || p.includes('láser') || p.includes('escenario')) {
    const themeName = `🪩 ${cleanTitle || 'Discoteca & Luces Láser'}`;
    return {
      id: `fx-gen-${Date.now()}`,
      name: themeName,
      tagline: `POTENCIA Y RITMO EN LA RUTA • ${brandUpper}`,
      bgGradient: 'from-[#170624] via-[#0d0214] to-[#040008]',
      accentColor: '#a855f7',
      secondaryColor: '#ec4899',
      glowColor: 'rgba(168, 85, 247, 0.55)',
      tireAnimationType: 'cyber-pulse',
      particles: 'sparks',
      badgeStyle: 'neon',
      storyMood: prompt,
      customPrompt: prompt,
      motionBackground: 'generative-prompt',
      category: '✨ Generado a Medida',
      isCustomGenerated: true,
      description: 'Generado exactamente según lo pedido: pista de baile disco con rayos láser y humo de escenario.',
      customMotionConfig: {
        prompt,
        themeName,
        skyColors: ['#3b0764', '#581c87', '#9333ea'],
        horizonYRatio: 0.38,
        groundStyle: 'disco-stage',
        groundReflection: true,
        lightingStyle: 'neon-lasers',
        ambientLightColor: '#c084fc',
        particlesType: 'colored-smoke',
        particleColor: '#ec4899',
        particleSecondaryColor: '#06b6d4',
        particleDensity: 50,
        speedMultiplier: 1.3,
        cameraBobbing: true,
        pulseWaveIntensity: 0.7,
      },
    };
  }

  // 7. Campo de trigo / Trigo dorado / Pampa rural
  if (p.includes('trigo') || p.includes('pampa') || p.includes('cosecha') || p.includes('chacra') || p.includes('silo')) {
    const themeName = `🌾 ${cleanTitle || 'Campo de Trigo & Pampa'}`;
    return {
      id: `fx-gen-${Date.now()}`,
      name: themeName,
      tagline: `LA FUERZA DEL CAMPO PAMPEANO • ${brandUpper}`,
      bgGradient: 'from-[#291305] via-[#170902] to-[#0a0300]',
      accentColor: '#eab308',
      secondaryColor: '#f97316',
      glowColor: 'rgba(234, 179, 8, 0.45)',
      tireAnimationType: 'offroad-bounce',
      particles: 'smoke',
      badgeStyle: 'pill',
      storyMood: prompt,
      customPrompt: prompt,
      motionBackground: 'generative-prompt',
      category: '✨ Generado a Medida',
      isCustomGenerated: true,
      description: 'Generado exactamente según lo pedido: espigas de trigo doradas mecidas por el viento pampeano.',
      customMotionConfig: {
        prompt,
        themeName,
        skyColors: ['#7c2d12', '#c2410c', '#fde047'],
        horizonYRatio: 0.4,
        groundStyle: 'wheat-field',
        groundReflection: false,
        lightingStyle: 'sunlight',
        ambientLightColor: '#fde047',
        particlesType: 'dust-sand',
        particleColor: '#facc15',
        particleSecondaryColor: '#ea580c',
        particleDensity: 45,
        speedMultiplier: 0.8,
        cameraBobbing: true,
        pulseWaveIntensity: 0.3,
      },
    };
  }

  // 8. Playa / Palmeras / Atardecer tropical
  if (p.includes('playa') || p.includes('palmera') || p.includes('tropical') || p.includes('costa') || p.includes('surf')) {
    const themeName = `🏖️ ${cleanTitle || 'Playa & Atardecer Tropical'}`;
    return {
      id: `fx-gen-${Date.now()}`,
      name: themeName,
      tagline: `VIAJÁ SEGURO HACIA TUS VACACIONES • ${brandUpper}`,
      bgGradient: 'from-[#240c05] via-[#170603] to-[#080201]',
      accentColor: '#fb923c',
      secondaryColor: '#2dd4bf',
      glowColor: 'rgba(251, 146, 60, 0.5)',
      tireAnimationType: 'float-drift',
      particles: 'smoke',
      badgeStyle: 'pill',
      storyMood: prompt,
      customPrompt: prompt,
      motionBackground: 'generative-prompt',
      category: '✨ Generado a Medida',
      isCustomGenerated: true,
      description: 'Generado exactamente según lo pedido: costa marina con olas espumosas y sol poniente.',
      customMotionConfig: {
        prompt,
        themeName,
        skyColors: ['#7c2d12', '#ea580c', '#fde047'],
        horizonYRatio: 0.38,
        groundStyle: 'sunset-beach',
        groundReflection: true,
        lightingStyle: 'sunbeams',
        ambientLightColor: '#fb923c',
        particlesType: 'fireflies',
        particleColor: '#fed7aa',
        particleSecondaryColor: '#2dd4bf',
        particleDensity: 40,
        speedMultiplier: 0.75,
        cameraBobbing: true,
        pulseWaveIntensity: 0.35,
      },
    };
  }

  // 9. Fiesta / Confeti / Celebración / Carnaval
  if (p.includes('confeti') || p.includes('confetti') || p.includes('cumple') || p.includes('aniversario') || p.includes('carnaval')) {
    const themeName = `🎊 ${cleanTitle || 'Fiesta & Confeti'}`;
    return {
      id: `fx-gen-${Date.now()}`,
      name: themeName,
      tagline: `CELEBRACIÓN Y OFERTAS EXCLUSIVAS • ${brandUpper}`,
      bgGradient: 'from-[#1c0828] via-[#100318] to-[#05000a]',
      accentColor: '#ec4899',
      secondaryColor: '#facc15',
      glowColor: 'rgba(236, 72, 153, 0.5)',
      tireAnimationType: 'spin-3d',
      particles: 'sparks',
      badgeStyle: 'neon',
      storyMood: prompt,
      customPrompt: prompt,
      motionBackground: 'generative-prompt',
      category: '✨ Generado a Medida',
      isCustomGenerated: true,
      description: 'Generado exactamente según lo pedido: confeti multicolor volando en perspectiva festiva.',
      customMotionConfig: {
        prompt,
        themeName,
        skyColors: ['#581c87', '#7e22ce', '#c084fc'],
        horizonYRatio: 0.38,
        groundStyle: 'disco-stage',
        groundReflection: true,
        lightingStyle: 'strobe-flashes',
        ambientLightColor: '#ec4899',
        particlesType: 'confetti',
        particleColor: '#f43f5e',
        particleSecondaryColor: '#facc15',
        particleDensity: 60,
        speedMultiplier: 1.2,
        cameraBobbing: true,
        pulseWaveIntensity: 0.6,
      },
    };
  }

  // 10. Música / Notas musicales / Ritmo
  if (p.includes('musica') || p.includes('música') || p.includes('nota') || p.includes('sonido') || p.includes('cancion') || p.includes('ritmo')) {
    const themeName = `🎵 ${cleanTitle || 'Música & Ritmo Sonoro'}`;
    return {
      id: `fx-gen-${Date.now()}`,
      name: themeName,
      tagline: `EL MEJOR RITMO EN LA RUTA • ${brandUpper}`,
      bgGradient: 'from-[#080d1a] via-[#040810] to-[#010206]',
      accentColor: '#38bdf8',
      secondaryColor: '#ec4899',
      glowColor: 'rgba(56, 189, 248, 0.5)',
      tireAnimationType: 'cyber-pulse',
      particles: 'sparks',
      badgeStyle: 'neon',
      storyMood: prompt,
      customPrompt: prompt,
      motionBackground: 'generative-prompt',
      category: '✨ Generado a Medida',
      isCustomGenerated: true,
      description: 'Generado exactamente según lo pedido: notas musicales flotando al ritmo del camino.',
      customMotionConfig: {
        prompt,
        themeName,
        skyColors: ['#0f172a', '#1e293b', '#38bdf8'],
        horizonYRatio: 0.38,
        groundStyle: 'neon-grid',
        groundReflection: true,
        lightingStyle: 'tunnel-lights',
        ambientLightColor: '#38bdf8',
        particlesType: 'music-notes',
        particleColor: '#38bdf8',
        particleSecondaryColor: '#ec4899',
        particleDensity: 30,
        speedMultiplier: 1.1,
        cameraBobbing: true,
        pulseWaveIntensity: 0.5,
      },
    };
  }

  // 11. Tormenta de rayos púrpuras / relámpagos
  if (p.includes('rayo') || p.includes('relampago') || p.includes('relámpago') || p.includes('electrico') || p.includes('eléctrico')) {
    const themeName = `⚡ ${cleanTitle || 'Tormenta Eléctrica Violeta'}`;
    return {
      id: `fx-gen-${Date.now()}`,
      name: themeName,
      tagline: `POTENCIA DE ALTO VOLTAJE • ${brandUpper}`,
      bgGradient: 'from-[#170529] via-[#0d0217] to-[#040008]',
      accentColor: '#c084fc',
      secondaryColor: '#facc15',
      glowColor: 'rgba(192, 132, 252, 0.5)',
      tireAnimationType: 'speed-zoom',
      particles: 'sparks',
      badgeStyle: 'neon',
      storyMood: prompt,
      customPrompt: prompt,
      motionBackground: 'generative-prompt',
      category: '✨ Generado a Medida',
      isCustomGenerated: true,
      description: 'Generado exactamente según lo pedido: relámpagos y descargas eléctricas de alto impacto.',
      customMotionConfig: {
        prompt,
        themeName,
        skyColors: ['#2e1065', '#3b0764', '#581c87'],
        horizonYRatio: 0.38,
        groundStyle: 'wet-asphalt',
        groundReflection: true,
        lightingStyle: 'thunder-bolts',
        ambientLightColor: '#c084fc',
        particlesType: 'lightning-sparks',
        particleColor: '#c084fc',
        particleSecondaryColor: '#facc15',
        particleDensity: 40,
        speedMultiplier: 1.4,
        cameraBobbing: true,
        pulseWaveIntensity: 0.7,
      },
    };
  }

  // 12. GENERAL PROCEDURAL EXACT SYNTHESIS FOR ANY CUSTOM PROMPT
  // Derives exact custom color palette and mood directly from user's words
  let accent = '#facc15';
  let secondary = '#ef4444';
  let sky: [string, string, string] = ['#09090b', '#18181b', '#000000'];
  let ground: GenerativeGroundStyle = 'custom-procedural';
  let lighting: GenerativeLightingStyle = 'tunnel-lights';
  let particle: GenerativeParticleType = 'custom-particles';

  // Semantic color detection from user text
  if (p.includes('azul') || p.includes('celeste') || p.includes('marino')) {
    accent = '#38bdf8';
    secondary = '#0284c7';
    sky = ['#082f49', '#0369a1', '#38bdf8'];
  } else if (p.includes('verde') || p.includes('esmeralda') || p.includes('lima')) {
    accent = '#22c55e';
    secondary = '#84cc16';
    sky = ['#052e16', '#14532d', '#22c55e'];
  } else if (p.includes('rojo') || p.includes('carmesi') || p.includes('escarlata')) {
    accent = '#ef4444';
    secondary = '#f97316';
    sky = ['#450a0a', '#7f1d1d', '#ef4444'];
  } else if (p.includes('violeta') || p.includes('purpura') || p.includes('púrpura') || p.includes('lila') || p.includes('morado')) {
    accent = '#a855f7';
    secondary = '#ec4899';
    sky = ['#3b0764', '#581c87', '#a855f7'];
  } else if (p.includes('naranja') || p.includes('dorado') || p.includes('oro')) {
    accent = '#f59e0b';
    secondary = '#facc15';
    sky = ['#451a03', '#78350f', '#f59e0b'];
  } else if (p.includes('rosa') || p.includes('fucsia') || p.includes('magenta')) {
    accent = '#ec4899';
    secondary = '#f43f5e';
    sky = ['#500724', '#831843', '#ec4899'];
  } else if (p.includes('blanco') || p.includes('plata') || p.includes('plateado')) {
    accent = '#f8fafc';
    secondary = '#94a3b8';
    sky = ['#0f172a', '#1e293b', '#64748b'];
  }

  if (p.includes('rayo') || p.includes('flash') || p.includes('relampago')) {
    lighting = 'thunder-bolts';
  } else if (p.includes('sol') || p.includes('dia') || p.includes('día') || p.includes('amanecer')) {
    lighting = 'sunlight';
  } else if (p.includes('laser') || p.includes('neon') || p.includes('neón')) {
    lighting = 'neon-lasers';
  } else if (p.includes('niebla') || p.includes('humo') || p.includes('bruma')) {
    lighting = 'volumetric-fog';
  }

  const exactThemeName = `✨ ${cleanTitle || 'Efecto Personalizado a Medida'}`;

  return {
    id: `fx-gen-${Date.now()}`,
    name: exactThemeName,
    tagline: `EDICIÓN A MEDIDA • ${brandUpper}`,
    bgGradient: `from-[#0f0f0f] via-[#171717] to-[#050505]`,
    accentColor: accent,
    secondaryColor: secondary,
    glowColor: `${accent}80`,
    tireAnimationType: 'spin-3d',
    particles: 'sparks',
    badgeStyle: 'skew',
    storyMood: prompt,
    customPrompt: prompt,
    motionBackground: 'generative-prompt',
    category: '✨ Generado a Medida',
    isCustomGenerated: true,
    description: `Generado exactamente según lo pedido: "${prompt}".`,
    customMotionConfig: {
      prompt,
      themeName: exactThemeName,
      skyColors: sky,
      horizonYRatio: 0.38,
      groundStyle: ground,
      groundReflection: true,
      lightingStyle: lighting,
      ambientLightColor: accent,
      particlesType: particle,
      particleColor: accent,
      particleSecondaryColor: secondary,
      particleDensity: 50,
      speedMultiplier: 1.1,
      cameraBobbing: true,
      pulseWaveIntensity: 0.5,
    },
  };
}

export function synthesizeStoryStyleFromPrompt(prompt: string, brandName: string): StoryThemeStyle {
  // Delegate directly to generateExactCustomFxOption to guarantee exact synthesis without generic fallbacks
  return generateExactCustomFxOption(prompt, brandName);
}

/**
 * Searches for an FX in the list.
 * If not found, GENERATES THAT EXACT OPTION instead of falling back to something similar!
 */
export function searchOrGenerateFx(
  query: string,
  existingList: StoryThemeStyle[],
  brandName: string
): { found: boolean; item: StoryThemeStyle; isNew: boolean } {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    return { found: true, item: existingList[0] || PRESET_STORY_THEMES[0], isNew: false };
  }

  // 1. Direct match by ID, name or prompt keywords in the existing list
  const direct = existingList.find(
    (theme) =>
      theme.id.toLowerCase() === q ||
      theme.name.toLowerCase().includes(q) ||
      (theme.customPrompt && theme.customPrompt.toLowerCase().includes(q)) ||
      (theme.description && theme.description.toLowerCase().includes(q))
  );

  if (direct) {
    return { found: true, item: direct, isNew: false };
  }

  // 2. USER DIRECTIVE: If not found in the list, DO NOT search for "algo parecido".
  // GENERATE THAT EXACT OPTION!
  const generatedOption = generateExactCustomFxOption(query, brandName);
  return { found: false, item: generatedOption, isNew: true };
}
