import * as XLSX from 'xlsx';
import { Tire, VehicleCategory } from '../types';
import { calculateInstallments } from './formatters';

export type ImportMode = 'replace' | 'merge' | 'sum_stock';
export type CuotasPolicy = 'use_detected' | 'calculate' | 'custom';

export interface ColumnMappingResult {
  marcaCol?: string;
  modeloCol?: string;
  dimensionesCol?: string;
  rodadoCol?: string;
  categoriaCol?: string;
  indiceCol?: string;
  precioContadoCol?: string;
  precioCuota4Col?: string;
  precioCuota20Col?: string;
  stockCol?: string;
  codigoCol?: string;
  descripcionCol?: string;
}

export interface SheetParsedData {
  sheetName: string;
  detectedBrand?: string;
  headerRowIndex: number;
  availableHeaders: string[];
  mapping: ColumnMappingResult;
  rawRows: any[][];
  parsedTires: Tire[];
  validRowsCount: number;
  columnsDetected: {
    field: string;
    label: string;
    excelHeader: string;
    isAutoDerived: boolean;
  }[];
  missingEssentialFields: string[];
  selected: boolean;
  detectedInstallmentHeaders?: Array<{
    header: string;
    installmentCount: number;
    label: string;
    suggestedFor?: 'precioCuota4' | 'precioCuota20' | null;
  }>;
  compoundColumn?: string | null;
  notes?: string;
}

export interface VerificationReport {
  fileName: string;
  sheetName: string;
  sheetNames: string[];
  sheets: SheetParsedData[];
  selectedSheetView: number | 'all';
  totalRowsFound: number;
  validRowsCount: number;
  availableHeaders: string[];
  currentMapping: ColumnMappingResult;
  rawRows: any[][];
  headerRowIndex: number;
  columnsDetected: {
    field: string;
    label: string;
    excelHeader: string;
    isAutoDerived: boolean;
  }[];
  missingEssentialFields: string[];
  sampleTires: Tire[];
  allParsedTires: Tire[];
  cuotasPolicy: CuotasPolicy;
  aiAnalysis?: {
    source: 'gemini' | 'heuristic' | 'fallback';
    insights?: string;
    confidence?: string;
    detectedInstallmentHeaders?: Array<{
      header: string;
      installmentCount: number;
      label: string;
      suggestedFor?: 'precioCuota4' | 'precioCuota20' | null;
    }>;
    compoundColumn?: string | null;
    brandGroupsSummary?: Record<string, number>;
  };
}

// Clean string for header matching
export const normalizeHeader = (header: any): string => {
  if (header == null) return '';
  return String(header)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

// Clean numeric values from strings like "$ 295.000,00", "295000", "84.800", etc.
export const parseCleanNumber = (val: any): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
  if (val == null) return 0;
  const str = String(val).trim();
  if (!str) return 0;

  // Pure integer string
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // Remove currency signs, spaces, quotes
  let cleaned = str.replace(/[\$\s"']/g, '');

  // Handle Argentine format: 295.000,00 or 84.800,50
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = cleaned.replace(/\./g, '');
    } else if (parts[1]?.length === 3) {
      cleaned = cleaned.replace(/\./g, '');
    }
  } else if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    if (parts[1]?.length === 3 && parts[0]?.length <= 3) {
      cleaned = cleaned.replace(/,/g, '');
    } else {
      cleaned = cleaned.replace(',', '.');
    }
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
};

// Comprehensive detector for 4 Installments / Cuotas 4
export const isCuota4Header = (rawHeader: any): boolean => {
  if (rawHeader == null) return false;
  const str = String(rawHeader).trim().toLowerCase();
  const norm = normalizeHeader(str);

  // Exact matches
  const exactNorms = [
    '4',
    '04',
    'c4',
    '4c',
    '4x',
    'x4',
    '4ctas',
    '4cta',
    'ctas4',
    'cta4',
    'cuota4',
    'cuotas4',
    '4cuota',
    '4cuotas',
    'plan4',
    '4fijas',
    '4fija',
    'cuotasfijas4',
    '4cuotasfijas',
    'preciocuota4',
    'precio4cuotas',
    'precio4',
    'precioc4',
    'preciocuotaen4',
    'valor4',
    'valorcuota4',
    'valor4cuotas',
    '4pagos',
    'pagos4',
    'cuotaen4',
    'en4',
    'en4cuotas',
    'en4pagos',
    'ahora4',
    '4tas',
    '4meses',
    'meses4',
    '4cuotasconinteres',
    '4coninteres',
    'cuatrocuotas',
    'cuatro',
  ];
  if (exactNorms.includes(norm)) return true;

  // Verify digit 4 exists and is NOT part of another number like 24, 14, 40
  const hasDigit4 = /(?:^|[^0-9])4(?:[^0-9]|$)/.test(str);
  if (!hasDigit4) return false;

  // Has 4 AND an installment keyword
  const hasInstallmentWord =
    /cuota|cuotas|cta|ctas|pago|pagos|fija|fijas|mes|meses|plan|tarjeta|finan|ahora|x|\bc\b|\bc4\b|\b4c\b/i.test(
      str
    );
  if (hasInstallmentWord) return true;

  // If header is isolated like "4", "(4)", "N° 4", "# 4"
  if (/^[\s(#[N°]*4[\s)#]*$/.test(str)) return true;

  return false;
};

// Comprehensive detector for 20 Installments / Cuotas 20
export const isCuota20Header = (rawHeader: any): boolean => {
  if (rawHeader == null) return false;
  const str = String(rawHeader).trim().toLowerCase();
  const norm = normalizeHeader(str);

  // Exact matches
  const exactNorms = [
    '20',
    'c20',
    '20c',
    '20x',
    'x20',
    '20ctas',
    '20cta',
    'ctas20',
    'cta20',
    'cuota20',
    'cuotas20',
    '20cuota',
    '20cuotas',
    'plan20',
    '20fijas',
    '20fija',
    'cuotasfijas20',
    '20cuotasfijas',
    'preciocuota20',
    'precio20cuotas',
    'precio20',
    'precioc20',
    'preciocuotaen20',
    'valor20',
    'valorcuota20',
    'valor20cuotas',
    '20pagos',
    'pagos20',
    'cuotaen20',
    'en20',
    'en20cuotas',
    'en20pagos',
    'ahora20',
    '20meses',
    'meses20',
    '20cuotasconinteres',
    '20coninteres',
    'veintecuotas',
    'veinte',
  ];
  if (exactNorms.includes(norm)) return true;

  // Verify digit 20 exists and is NOT part of another number
  const hasDigit20 = /(?:^|[^0-9])20(?:[^0-9]|$)/.test(str);
  if (!hasDigit20) return false;

  const hasInstallmentWord =
    /cuota|cuotas|cta|ctas|pago|pagos|fija|fijas|mes|meses|plan|tarjeta|finan|ahora|x|\bc\b|\bc20\b|\b20c\b/i.test(
      str
    );
  if (hasInstallmentWord) return true;

  if (/^[\s(#[N°]*20[\s)#]*$/.test(str)) return true;

  return false;
};

// Detector for Cash Price (Precio Contado / Efectivo)
// Strictly rejects installment headers so it won't steal "Precio 4 Cuotas"
export const isPrecioContadoHeader = (rawHeader: any): boolean => {
  if (rawHeader == null) return false;
  const str = String(rawHeader).trim().toLowerCase();
  const norm = normalizeHeader(str);

  // Must NOT be an installment header
  if (isCuota4Header(rawHeader) || isCuota20Header(rawHeader)) return false;
  if (/cuota|cta|pago|finan|tarjeta|banco|\b4\b|\b20\b|\b12\b|\b6\b|\b3\b/i.test(str)) return false;

  const exactMatches = [
    'preciocontado',
    'contado',
    'precioefectivo',
    'efectivo',
    'pcontado',
    'p.contado',
    'pcon',
    'preciolista',
    'lista',
    'precio',
    'costo',
    'valor',
    'mayorista',
    'preciomayorista',
    'pesos',
    'ars',
    'importe',
    'monto',
    'unitario',
    'preciounitario',
    'neto',
    'precioneto',
  ];
  if (exactMatches.includes(norm)) return true;

  if (
    /^(?:precio|p\.?|valor|costo)\s*(?:contado|efectivo|lista|unitario|mayorista|neto|\$)?$/i.test(
      str
    )
  ) {
    return true;
  }
  if (/^contado|^efectivo/i.test(str)) return true;

  return false;
};

// Extract Rim/Rodado from dimensions string (e.g. "205/55 R16" -> "R16", "265/70/17" -> "R17")
export const extractRodadoFromDimensions = (dim: string): string => {
  if (!dim) return 'R16';
  const matchR = dim.match(/R\s*([0-9]{2}(?:\.[0-9])?)/i);
  if (matchR && matchR[1]) {
    return `R${matchR[1]}`;
  }
  const matchNum = dim.match(/(?:[\/\s-]|^)(1[2-9]|2[0-4])(?:\s|$)/);
  if (matchNum && matchNum[1]) {
    return `R${matchNum[1]}`;
  }
  return 'R16';
};

// Deduce vehicle category if omitted in Excel
export const deduceCategory = (
  modelo: string,
  dimensiones: string,
  rodado: string
): VehicleCategory => {
  const combined = `${modelo} ${dimensiones} ${rodado}`.toUpperCase();

  // Utilitarios / Carga / Commercial
  if (
    combined.includes('CARGO') ||
    combined.includes('AGILIS') ||
    combined.includes('VAN') ||
    combined.includes('8PR') ||
    combined.includes('6PR') ||
    /R\d+C\b/.test(combined) ||
    combined.includes('UTILITARIO')
  ) {
    return 'Utilitario';
  }

  // SUV / 4x4
  if (
    combined.includes('SUV') ||
    combined.includes('4X4') ||
    combined.includes('A/T') ||
    combined.includes('AT') ||
    combined.includes('M/T') ||
    combined.includes('MT') ||
    combined.includes('LTX') ||
    combined.includes('KO2') ||
    combined.includes('TERRAIN') ||
    combined.includes('CROSS') ||
    combined.includes('WRANGLER') ||
    combined.includes('DUELER')
  ) {
    return 'SUV / 4x4';
  }

  return 'Auto';
};

// Known tire brands dictionary with prioritized regex matching
export const KNOWN_TIRE_BRANDS: { canonical: string; pattern: RegExp }[] = [
  // Multi-word and prefix brands first
  { canonical: 'BFGoodrich', pattern: /\b(bf[\s\.-]?goodrich|bfg|goodrich)\b/i },
  { canonical: 'General Tire', pattern: /\b(general[\s\.-]?tire)\b/i },
  { canonical: 'GT Radial', pattern: /\b(gt[\s\.-]?radial|gtradial)\b/i },
  { canonical: 'Royal Black', pattern: /\b(royal[\s\.-]?black)\b/i },
  { canonical: 'Double King', pattern: /\b(double[\s\.-]?king)\b/i },
  { canonical: 'Double Star', pattern: /\b(double[\s\.-]?star|doublestar)\b/i },
  { canonical: 'Good Year', pattern: /\b(good[\s\.-]?year)\b/i },
  { canonical: 'Goodride', pattern: /\b(good[\s\.-]?ride|goodride)\b/i },
  { canonical: 'Westlake', pattern: /\b(west[\s\.-]?lake|westlake)\b/i },
  { canonical: 'Linglong', pattern: /\b(ling[\s\.-]?long|linglong)\b/i },
  { canonical: 'Sunfull', pattern: /\b(sun[\s\.-]?full|sunfull)\b/i },
  { canonical: 'Hifly', pattern: /\b(hi[\s\.-]?fly|hifly)\b/i },
  { canonical: 'Landsail', pattern: /\b(land[\s\.-]?sail|landsail)\b/i },
  { canonical: 'Chaoyang', pattern: /\b(chao[\s\.-]?yang|chaoyang)\b/i },
  { canonical: 'Three-A', pattern: /\b(three[\s\.-]?a)\b/i },
  // Major brands & Argentine market favorites
  { canonical: 'Michelin', pattern: /\b(michelin|mich)\b/i },
  { canonical: 'Pirelli', pattern: /\b(pirelli|pir)\b/i },
  { canonical: 'Bridgestone', pattern: /\b(bridgestone|bridge)\b/i },
  { canonical: 'Goodyear', pattern: /\b(goodyear)\b/i },
  { canonical: 'Continental', pattern: /\b(continental|conti)\b/i },
  { canonical: 'Firestone', pattern: /\b(firestone)\b/i },
  { canonical: 'Fate', pattern: /\b(fate|fatecargo|sentiva|eximia|prestiva|maxisport|pininfarina)\b/i },
  { canonical: 'Dunlop', pattern: /\b(dunlop)\b/i },
  { canonical: 'Hankook', pattern: /\b(hankook)\b/i },
  { canonical: 'Yokohama', pattern: /\b(yokohama|yoko)\b/i },
  { canonical: 'Kumho', pattern: /\b(kumho)\b/i },
  { canonical: 'Toyo', pattern: /\b(toyo)\b/i },
  { canonical: 'Nexen', pattern: /\b(nexen)\b/i },
  { canonical: 'Cooper', pattern: /\b(cooper)\b/i },
  { canonical: 'Maxxis', pattern: /\b(maxxis)\b/i },
  { canonical: 'Falken', pattern: /\b(falken)\b/i },
  { canonical: 'Zmax', pattern: /\b(zmax|z-max)\b/i },
  { canonical: 'Fortune', pattern: /\b(fortune|fortinr)\b/i },
  { canonical: 'Onyx', pattern: /\b(onyx)\b/i },
  { canonical: 'Pace', pattern: /\b(pace)\b/i },
  { canonical: 'Triangle', pattern: /\b(triangle)\b/i },
  { canonical: 'Sailun', pattern: /\b(sailun)\b/i },
  { canonical: 'Giti', pattern: /\b(giti)\b/i },
  { canonical: 'Roadstone', pattern: /\b(roadstone)\b/i },
  { canonical: 'Radar', pattern: /\b(radar)\b/i },
  { canonical: 'Mazzini', pattern: /\b(mazzini)\b/i },
  { canonical: 'Compasal', pattern: /\b(compasal)\b/i },
  { canonical: 'Lanvigator', pattern: /\b(lanvigator)\b/i },
  { canonical: 'Roadmarch', pattern: /\b(roadmarch)\b/i },
  { canonical: 'Haida', pattern: /\b(haida)\b/i },
  { canonical: 'Austone', pattern: /\b(austone)\b/i },
  { canonical: 'Aplus', pattern: /\b(aplus)\b/i },
  { canonical: 'Rovelo', pattern: /\b(rovelo)\b/i },
  { canonical: 'Kenda', pattern: /\b(kenda)\b/i },
  { canonical: 'Nankang', pattern: /\b(nankang)\b/i },
  { canonical: 'Federal', pattern: /\b(federal)\b/i },
  { canonical: 'Delinte', pattern: /\b(delinte)\b/i },
  { canonical: 'Centara', pattern: /\b(centara)\b/i },
  { canonical: 'Mirage', pattern: /\b(mirage)\b/i },
  { canonical: 'Windforce', pattern: /\b(windforce)\b/i },
  { canonical: 'Tracmax', pattern: /\b(tracmax)\b/i },
  { canonical: 'Habilead', pattern: /\b(habilead)\b/i },
  { canonical: 'Kapsen', pattern: /\b(kapsen)\b/i },
  { canonical: 'Tourador', pattern: /\b(tourador)\b/i },
  { canonical: 'Waterfall', pattern: /\b(waterfall)\b/i },
  { canonical: 'Grenlander', pattern: /\b(grenlander|greenlander)\b/i },
  { canonical: 'Firemax', pattern: /\b(firemax)\b/i },
  { canonical: 'Comforser', pattern: /\b(comforser)\b/i },
  { canonical: 'Rapid', pattern: /\b(rapid)\b/i },
  { canonical: 'Aptany', pattern: /\b(aptany)\b/i },
  { canonical: 'Ovation', pattern: /\b(ovation)\b/i },
  { canonical: 'Wanli', pattern: /\b(wanli)\b/i },
  { canonical: 'Rotalla', pattern: /\b(rotalla)\b/i },
  { canonical: 'Petlas', pattern: /\b(petlas)\b/i },
  { canonical: 'Barum', pattern: /\b(barum)\b/i },
  { canonical: 'Semperit', pattern: /\b(semperit)\b/i },
  { canonical: 'Uniroyal', pattern: /\b(uniroyal)\b/i },
  { canonical: 'Viking', pattern: /\b(viking)\b/i },
  { canonical: 'Mitas', pattern: /\b(mitas)\b/i },
  { canonical: 'Trazano', pattern: /\b(trazano)\b/i },
  { canonical: 'Taurus', pattern: /\b(taurus)\b/i },
  { canonical: 'Riken', pattern: /\b(riken)\b/i },
  { canonical: 'Kormoran', pattern: /\b(kormoran)\b/i },
  { canonical: 'Kelly', pattern: /\b(kelly)\b/i },
  { canonical: 'Seiberling', pattern: /\b(seiberling)\b/i },
  { canonical: 'Dayton', pattern: /\b(dayton)\b/i },
  { canonical: 'Formula', pattern: /\b(formula)\b/i },
  { canonical: 'Warrior', pattern: /\b(warrior)\b/i },
  { canonical: 'Jinyu', pattern: /\b(jinyu)\b/i },
  { canonical: 'Altenzo', pattern: /\b(altenzo)\b/i },
  { canonical: 'Annaite', pattern: /\b(annaite)\b/i },
  { canonical: 'Antares', pattern: /\b(antares)\b/i },
  { canonical: 'Aoteli', pattern: /\b(aoteli)\b/i },
  { canonical: 'Armstrong', pattern: /\b(armstrong)\b/i },
  { canonical: 'Atlas', pattern: /\b(atlas)\b/i },
  { canonical: 'Atturo', pattern: /\b(atturo)\b/i },
  { canonical: 'Blacklion', pattern: /\b(blacklion)\b/i },
  { canonical: 'Boto', pattern: /\b(boto)\b/i },
  { canonical: 'Cachland', pattern: /\b(cachland)\b/i },
  { canonical: 'Crosswind', pattern: /\b(crosswind)\b/i },
  { canonical: 'Deestone', pattern: /\b(deestone)\b/i },
  { canonical: 'Duraturn', pattern: /\b(duraturn)\b/i },
  { canonical: 'Farroad', pattern: /\b(farroad)\b/i },
  { canonical: 'Fullrun', pattern: /\b(fullrun)\b/i },
  { canonical: 'Fronway', pattern: /\b(fronway)\b/i },
  { canonical: 'Greentrac', pattern: /\b(greentrac)\b/i },
  { canonical: 'Headway', pattern: /\b(headway)\b/i },
  { canonical: 'Hilo', pattern: /\b(hilo)\b/i },
  { canonical: 'Joyroad', pattern: /\b(joyroad)\b/i },
  { canonical: 'Landgolden', pattern: /\b(landgolden)\b/i },
  { canonical: 'Leao', pattern: /\b(leao)\b/i },
  { canonical: 'Marcher', pattern: /\b(marcher)\b/i },
  { canonical: 'Mileking', pattern: /\b(mileking)\b/i },
  { canonical: 'Nereus', pattern: /\b(nereus)\b/i },
  { canonical: 'OGreen', pattern: /\b(ogreen)\b/i },
  { canonical: 'Otani', pattern: /\b(otani)\b/i },
  { canonical: 'Powertrac', pattern: /\b(powertrac)\b/i },
  { canonical: 'Prinx', pattern: /\b(prinx)\b/i },
  { canonical: 'Roadcruza', pattern: /\b(roadcruza)\b/i },
  { canonical: 'Sunote', pattern: /\b(sunote)\b/i },
  { canonical: 'Terraking', pattern: /\b(terraking)\b/i },
  { canonical: 'Toledo', pattern: /\b(toledo)\b/i },
  { canonical: 'Tomket', pattern: /\b(tomket)\b/i },
  { canonical: 'Transmate', pattern: /\b(transmate)\b/i },
  { canonical: 'Zeetex', pattern: /\b(zeetex)\b/i },
  { canonical: 'Zeta', pattern: /\b(zeta)\b/i },
  { canonical: 'BKT', pattern: /\bbkt\b/i },
  { canonical: 'Advance', pattern: /\badvance\b/i },
  { canonical: 'Armour', pattern: /\barmour\b/i },
  { canonical: 'Carlisle', pattern: /\bcarlisle\b/i },
  { canonical: 'Galaxy', pattern: /\bgalaxy\b/i },
  { canonical: 'Titan', pattern: /\btitan\b/i },
  { canonical: 'Trelleborg', pattern: /\btrelleborg\b/i },
  { canonical: 'General', pattern: /\bgeneral\b/i },
];

// Detect if a text string contains a known tire brand
export const detectBrandInText = (
  text: any
): { brand: string; cleanText: string } | null => {
  if (text == null) return null;
  const str = String(text).trim();
  if (!str) return null;

  for (const b of KNOWN_TIRE_BRANDS) {
    if (b.pattern.test(str)) {
      const clean = str.replace(b.pattern, '').replace(/\s+/g, ' ').trim();
      return {
        brand: b.canonical,
        cleanText: clean,
      };
    }
  }

  return null;
};

// Detect if a text string contains tire dimensions (e.g. 205/55 R16, 265/70-16, 31X10.50R15, 7.50R16)
export const extractTireDimensionFromText = (
  text: any
): { dimension: string; cleanText: string } | null => {
  if (text == null) return null;
  const str = String(text).trim();
  if (!str) return null;

  // 1. High flotation sizes (e.g. 31X10.50R15, 33X12.50 R15, 35X12.50R17)
  const flotationMatch = str.match(/\b([2-4]\d\s*[X|x]\s*\d{1,2}(?:\.\d{1,2})?\s*(?:R|r)?\s*\d{2})\b/i);
  if (flotationMatch) {
    let dim = flotationMatch[1].replace(/\s+/g, ' ').toUpperCase();
    if (!dim.includes('R')) {
      dim = dim.replace(/(\d{2})$/, 'R$1');
    }
    const clean = str.replace(flotationMatch[0], '').replace(/\s+/g, ' ').trim();
    return { dimension: dim, cleanText: clean };
  }

  // 2. Standard metric (e.g. 205/55R16, 265/70-16, 175/70R14, 295/80R22.5)
  const match = str.match(
    /\b([1-3]\d{2}[\s\/\-]{1,2}\d{2}(?:\.\d)?\s*(?:R|Z|ZR|r)?\s*\d{2}(?:\.5)?(?:C|LT)?)\b/i
  );
  if (match) {
    let dim = match[1].replace(/\s+/g, ' ').toUpperCase();
    if (!dim.includes('R')) {
      const sub = dim.match(/^([1-3]\d{2}[\/\-]\d{2})\s*(\d{2})$/);
      if (sub) {
        dim = `${sub[1]} R${sub[2]}`;
      }
    } else {
      dim = dim.replace(/(\d{2})\s*R\s*(\d{2})/i, '$1 R$2');
    }
    const clean = str.replace(match[0], '').replace(/\s+/g, ' ').trim();
    return { dimension: dim, cleanText: clean };
  }

  // 3. Commercial numeric (e.g. 7.50R16, 7.00R16, 8.25R16, 11R22.5)
  const commMatch = str.match(/\b(\d{1,2}(?:\.\d{2})?\s*(?:R|r)\s*\d{2}(?:\.5)?)\b/i);
  if (commMatch) {
    const dim = commMatch[1].replace(/\s+/g, '').toUpperCase();
    const clean = str.replace(commMatch[0], '').replace(/\s+/g, ' ').trim();
    return { dimension: dim, cleanText: clean };
  }

  return null;
};

// Detect preconfigured columns by matching synonyms and inspecting sample row cells
export const detectColumnMapping = (
  headers: string[],
  sampleRows?: any[][]
): ColumnMappingResult => {
  const mapping: ColumnMappingResult = {};

  // 1. FIRST PRIORITY: Detect Cuotas 4 and Cuotas 20 to avoid being hijacked by generic "precio"
  for (const rawHeader of headers) {
    if (!mapping.precioCuota4Col && isCuota4Header(rawHeader)) {
      mapping.precioCuota4Col = rawHeader;
    }
    if (!mapping.precioCuota20Col && isCuota20Header(rawHeader)) {
      mapping.precioCuota20Col = rawHeader;
    }
  }

  // 2. SECOND PRIORITY: Detect Precio Contado (excluding cuota columns)
  for (const rawHeader of headers) {
    if (
      !mapping.precioContadoCol &&
      rawHeader !== mapping.precioCuota4Col &&
      rawHeader !== mapping.precioCuota20Col &&
      isPrecioContadoHeader(rawHeader)
    ) {
      mapping.precioContadoCol = rawHeader;
      break;
    }
  }

  // Helper for other fields
  const findHeader = (synonyms: string[], exclude: (string | undefined)[]): string | undefined => {
    for (const rawHeader of headers) {
      if (exclude.includes(rawHeader)) continue;
      const norm = normalizeHeader(rawHeader);
      for (const syn of synonyms) {
        const synNorm = normalizeHeader(syn);
        if (norm === synNorm || norm.includes(synNorm) || synNorm.includes(norm)) {
          return rawHeader;
        }
      }
    }
    return undefined;
  };

  const used = () => [
    mapping.precioCuota4Col,
    mapping.precioCuota20Col,
    mapping.precioContadoCol,
  ];

  // Marca: First by header synonyms
  mapping.marcaCol = findHeader(
    [
      'marca',
      'brand',
      'fabricante',
      'marcas',
      'lineademarca',
      'fabr',
      'fab',
      'proveedor',
      'm',
      'brd',
      'mar',
    ],
    used()
  );

  // If Marca header was not found, inspect sample rows to see if a column consistently has tire brands
  if (!mapping.marcaCol && sampleRows && sampleRows.length > 0) {
    const colBrandCounts = new Array(headers.length).fill(0);
    const rowsToInspect = sampleRows.slice(0, 15);

    rowsToInspect.forEach((r) => {
      if (!Array.isArray(r)) return;
      r.forEach((cell, colIdx) => {
        if (colIdx < headers.length && detectBrandInText(cell)) {
          colBrandCounts[colIdx]++;
        }
      });
    });

    let bestColIdx = -1;
    let maxBrands = 0;
    colBrandCounts.forEach((count, idx) => {
      const h = headers[idx];
      if (count > maxBrands && !used().includes(h)) {
        maxBrands = count;
        bestColIdx = idx;
      }
    });

    if (bestColIdx >= 0 && maxBrands >= 2) {
      mapping.marcaCol = headers[bestColIdx];
    }
  }

  // Modelo
  mapping.modeloCol = findHeader(
    [
      'modelo',
      'model',
      'diseno',
      'diseño',
      'linea',
      'patron',
      'pattern',
      'nombre',
      'descripcionmodelo',
      'item',
    ],
    [...used(), mapping.marcaCol]
  );

  // Dimensiones / Medida
  mapping.dimensionesCol = findHeader(
    [
      'dimensiones',
      'dimension',
      'medida',
      'medidas',
      'size',
      'tamano',
      'tamaño',
      'cubierta',
      'neumatico',
      'tire',
      'med',
    ],
    [...used(), mapping.marcaCol, mapping.modeloCol]
  );

  // If Dimensiones header was not found, check sample rows for tire dimension formats
  if (!mapping.dimensionesCol && sampleRows && sampleRows.length > 0) {
    const colDimCounts = new Array(headers.length).fill(0);
    const rowsToInspect = sampleRows.slice(0, 15);

    rowsToInspect.forEach((r) => {
      if (!Array.isArray(r)) return;
      r.forEach((cell, colIdx) => {
        if (colIdx < headers.length && extractTireDimensionFromText(cell)) {
          colDimCounts[colIdx]++;
        }
      });
    });

    let bestDimIdx = -1;
    let maxDims = 0;
    colDimCounts.forEach((count, idx) => {
      const h = headers[idx];
      if (count > maxDims && !used().includes(h) && h !== mapping.marcaCol) {
        maxDims = count;
        bestDimIdx = idx;
      }
    });

    if (bestDimIdx >= 0 && maxDims >= 2) {
      mapping.dimensionesCol = headers[bestDimIdx];
    }
  }

  // Rodado
  mapping.rodadoCol = findHeader(
    ['rodado', 'aro', 'rim', 'diametro', 'r'],
    [...used(), mapping.marcaCol, mapping.modeloCol, mapping.dimensionesCol]
  );

  // Categoria
  mapping.categoriaCol = findHeader(
    ['categoria', 'categoría', 'category', 'tipo', 'tipovehiculo', 'segmento', 'uso'],
    used()
  );

  // Indice
  mapping.indiceCol = findHeader(
    ['indice', 'índice', 'iciv', 'carga', 'velocidad', 'indicecarga', 'loadindex', 'ic'],
    used()
  );

  // Stock
  mapping.stockCol = findHeader(
    ['stock', 'cantidad', 'unidades', 'cant', 'disponible', 'saldo', 'inventario', 'existencia', 'disp', 'stk'],
    used()
  );

  // Codigo
  mapping.codigoCol = findHeader(
    ['codigo', 'código', 'sku', 'ref', 'referencia', 'item', 'articulo', 'artículo', 'cod', 'id'],
    used()
  );

  // Descripcion
  mapping.descripcionCol = findHeader(
    ['descripcion', 'descripción', 'detalle', 'observaciones', 'notas', 'producto'],
    used()
  );

  return mapping;
};

// Generate tires array using a specific mapping and cuotas policy
export const parseTiresFromRows = (
  rows: any[][],
  rawHeaders: string[],
  mapping: ColumnMappingResult,
  cuotasPolicy: CuotasPolicy = 'use_detected',
  defaultSheetBrand: string = '',
  sheetName: string = ''
): Tire[] => {
  const allParsedTires: Tire[] = [];

  const getColIndex = (headerName?: string) => {
    if (!headerName || headerName === '__NONE__' || headerName === '__BLANK__' || headerName === '__AUTO__') {
      return -1;
    }
    return rawHeaders.indexOf(headerName);
  };

  const isExplicitBlank = (headerName?: string) => headerName === '__BLANK__';

  const idxMarca = getColIndex(mapping.marcaCol);
  const idxModelo = getColIndex(mapping.modeloCol);
  const idxDim = getColIndex(mapping.dimensionesCol);
  const idxRodado = getColIndex(mapping.rodadoCol);
  const idxCat = getColIndex(mapping.categoriaCol);
  const idxIndice = getColIndex(mapping.indiceCol);
  const idxPrecioContado = getColIndex(mapping.precioContadoCol);
  const idxCuota4 = getColIndex(mapping.precioCuota4Col);
  const idxCuota20 = getColIndex(mapping.precioCuota20Col);
  const idxStock = getColIndex(mapping.stockCol);
  const idxCodigo = getColIndex(mapping.codigoCol);
  const idxDesc = getColIndex(mapping.descripcionCol);

  // Tracks section header brand (e.g. rows like ["MICHELIN", "", ...])
  let currentSectionBrand = '';

  rows.forEach((row, rowIdx) => {
    if (!Array.isArray(row) || row.length === 0) return;

    // Check if row is completely empty
    const nonBlankValues = row.filter((c) => String(c || '').trim().length > 0);
    if (nonBlankValues.length === 0) return;

    // 1. Detect if this is a Section Header row (e.g. single cell stating "MICHELIN" or "MARCA: PIRELLI")
    if (nonBlankValues.length <= 2) {
      const firstText = String(nonBlankValues[0] || '').trim();
      const brandMatch = detectBrandInText(firstText);
      const isPriceRow = nonBlankValues.some((v) => parseCleanNumber(v) > 5000);
      if (brandMatch && !isPriceRow) {
        currentSectionBrand = brandMatch.brand;
        return; // Skip section header row
      }
    }

    // Extract raw text from mapped columns
    const rawMarca = idxMarca >= 0 ? String(row[idxMarca] || '').trim() : '';
    let rawModelo = idxModelo >= 0 ? String(row[idxModelo] || '').trim() : '';
    let rawDim = idxDim >= 0 ? String(row[idxDim] || '').trim() : '';
    const rawDesc = idxDesc >= 0 ? String(row[idxDesc] || '').trim() : '';
    const rawCodigo = idxCodigo >= 0 ? String(row[idxCodigo] || '').trim() : '';
    const rawIndice = idxIndice >= 0 ? String(row[idxIndice] || '').trim() : '';

    // Cash Price
    const precioContado = idxPrecioContado >= 0 ? parseCleanNumber(row[idxPrecioContado]) : 0;

    // ==========================================
    // BRAND (MARCA) DETECTION & ANALYSIS
    // ==========================================
    let detectedMarca = '';

    if (!isExplicitBlank(mapping.marcaCol)) {
      // 1. Check mapped Marca column cell if present
      if (rawMarca) {
        const directBrand = detectBrandInText(rawMarca);
        if (directBrand) {
          detectedMarca = directBrand.brand;
        } else {
          // If cell has text not in dictionary, respect cell value cleanly
          detectedMarca = rawMarca.charAt(0).toUpperCase() + rawMarca.slice(1);
        }
      }

      // 2. If no marca yet, analyze the Modelo cell
      if (!detectedMarca && rawModelo) {
        const brandInModel = detectBrandInText(rawModelo);
        if (brandInModel) {
          detectedMarca = brandInModel.brand;
          if (brandInModel.cleanText) {
            rawModelo = brandInModel.cleanText;
          }
        }
      }

      // 3. If no marca yet, analyze the Medida / Dimensiones cell
      if (!detectedMarca && rawDim) {
        const brandInDim = detectBrandInText(rawDim);
        if (brandInDim) {
          detectedMarca = brandInDim.brand;
          if (brandInDim.cleanText) {
            rawDim = brandInDim.cleanText;
          }
        }
      }

      // 4. If no marca yet, analyze the Descripcion cell
      if (!detectedMarca && rawDesc) {
        const brandInDesc = detectBrandInText(rawDesc);
        if (brandInDesc) {
          detectedMarca = brandInDesc.brand;
        }
      }

      // 5. If no marca yet, scan EVERY text cell in this row
      if (!detectedMarca) {
        for (let col = 0; col < row.length; col++) {
          const cellStr = String(row[col] || '').trim();
          if (!cellStr) continue;
          const found = detectBrandInText(cellStr);
          if (found) {
            detectedMarca = found.brand;
            break;
          }
        }
      }

      // 6. If no marca yet, inherit from current section brand or sheet brand
      if (!detectedMarca && currentSectionBrand) {
        detectedMarca = currentSectionBrand;
      }
      if (!detectedMarca && defaultSheetBrand) {
        detectedMarca = defaultSheetBrand;
      }
    }

    // CRITICAL USER DIRECTIVE: If no brand was detected/mapped, leave BLANK "" (never "Genérica")
    const marca = detectedMarca ? detectedMarca.charAt(0).toUpperCase() + detectedMarca.slice(1) : '';

    // ==========================================
    // DIMENSIONS (MEDIDA) DETECTION
    // ==========================================
    let dimensiones = isExplicitBlank(mapping.dimensionesCol) ? '' : rawDim;

    // If dimensions empty, search across other row cells for tire dimension format
    if (!dimensiones && !isExplicitBlank(mapping.dimensionesCol)) {
      const fromDesc = extractTireDimensionFromText(rawDesc);
      if (fromDesc) {
        dimensiones = fromDesc.dimension;
      } else {
        const fromModel = extractTireDimensionFromText(rawModelo);
        if (fromModel) {
          dimensiones = fromModel.dimension;
        } else {
          for (let col = 0; col < row.length; col++) {
            const cellStr = String(row[col] || '').trim();
            const foundDim = extractTireDimensionFromText(cellStr);
            if (foundDim) {
              dimensiones = foundDim.dimension;
              break;
            }
          }
        }
      }
    }

    // Row validity check: Must have at least a brand, dimensions, model, or price to be a valid tire row
    if (!marca && !dimensiones && !rawModelo && precioContado <= 0) {
      return;
    }

    // ==========================================
    // MODELO: Leave blank if unused
    // ==========================================
    const modelo = isExplicitBlank(mapping.modeloCol) ? '' : rawModelo;

    // ==========================================
    // RODADO
    // ==========================================
    let rodado = '';
    if (!isExplicitBlank(mapping.rodadoCol)) {
      if (idxRodado >= 0 && row[idxRodado]) {
        const rStr = String(row[idxRodado]).trim().toUpperCase();
        rodado = rStr.startsWith('R') ? rStr : `R${rStr}`;
      } else if (dimensiones) {
        rodado = extractRodadoFromDimensions(dimensiones);
      }
    }

    // ==========================================
    // CATEGORIA
    // ==========================================
    let categoria: VehicleCategory = 'Auto';
    if (idxCat >= 0 && row[idxCat]) {
      const catStr = String(row[idxCat]).toLowerCase();
      if (catStr.includes('suv') || catStr.includes('4x4') || catStr.includes('camioneta')) {
        categoria = 'SUV / 4x4';
      } else if (catStr.includes('util') || catStr.includes('carga') || catStr.includes('van')) {
        categoria = 'Utilitario';
      } else {
        categoria = 'Auto';
      }
    } else {
      categoria = deduceCategory(modelo, dimensiones, rodado);
    }

    // ==========================================
    // INDICE: Leave blank if unused
    // ==========================================
    let indice = '';
    if (!isExplicitBlank(mapping.indiceCol)) {
      if (rawIndice) {
        indice = rawIndice;
      } else if (dimensiones) {
        const matchIdx = dimensiones.match(/\s+([0-9]{2,3}[A-Z])(?:\s|$)/i);
        if (matchIdx && matchIdx[1]) {
          indice = matchIdx[1].toUpperCase();
        }
      }
    }

    // ==========================================
    // CUOTAS (4 Y 20): Use Excel detected values by default
    // ==========================================
    const { precioCuota4: defaultCuota4, precioCuota20: defaultCuota20 } =
      calculateInstallments(precioContado);

    // 4 Cuotas: El valor en los Excels es el PRECIO FINAL FINANCIADO TOTAL, NO el valor por cuota.
    // Por lo tanto, se divide por 4 para obtener el valor de cada cuota individual.
    let precioCuota4 = 0;
    if (isExplicitBlank(mapping.precioCuota4Col)) {
      precioCuota4 = 0;
    } else if (cuotasPolicy === 'calculate') {
      precioCuota4 = defaultCuota4;
    } else if (idxCuota4 >= 0) {
      const cellVal4 = parseCleanNumber(row[idxCuota4]);
      // El precio que aparece en la celda del Excel es el precio final total: se divide por 4
      precioCuota4 = cellVal4 > 0 ? Math.round(cellVal4 / 4) : (precioContado > 0 ? defaultCuota4 : 0);
    } else {
      precioCuota4 = defaultCuota4;
    }

    // 20 Cuotas: El valor en los Excels es el PRECIO FINAL FINANCIADO TOTAL, NO el valor por cuota.
    // Por lo tanto, se divide por 20 para obtener el valor de cada cuota individual.
    let precioCuota20 = 0;
    if (isExplicitBlank(mapping.precioCuota20Col)) {
      precioCuota20 = 0;
    } else if (cuotasPolicy === 'calculate') {
      precioCuota20 = defaultCuota20;
    } else if (idxCuota20 >= 0) {
      const cellVal20 = parseCleanNumber(row[idxCuota20]);
      // El precio que aparece en la celda del Excel es el precio final total: se divide por 20
      precioCuota20 = cellVal20 > 0 ? Math.round(cellVal20 / 20) : (precioContado > 0 ? defaultCuota20 : 0);
    } else {
      precioCuota20 = defaultCuota20;
    }

    // ==========================================
    // STOCK: 0 (Sin stock) if unused, unmapped or blank
    // ==========================================
    let stock = 0;
    if (isExplicitBlank(mapping.stockCol)) {
      stock = 0;
    } else if (idxStock >= 0) {
      stock = Math.max(0, parseCleanNumber(row[idxStock]));
    } else {
      // If no stock column exists in Excel, import as 0 (Sin stock)
      stock = 0;
    }

    // ==========================================
    // CODIGO & DESCRIPCION: Leave blank if unused
    // ==========================================
    const codigo = isExplicitBlank(mapping.codigoCol) ? '' : rawCodigo;
    const descripcion = isExplicitBlank(mapping.descripcionCol) ? '' : (rawDesc || undefined);

    const tire: Tire = {
      id: `import-${Date.now()}-${rowIdx}-${Math.random().toString(36).slice(2, 6)}`,
      marca,
      modelo,
      dimensiones,
      rodado,
      categoria,
      indice,
      precioContado,
      precioCuota4,
      precioCuota20,
      stock,
      codigo,
      descripcion,
      origen: sheetName || undefined,
    };

    allParsedTires.push(tire);
  });

  return allParsedTires;
};

// Build column detected report badges
export const buildColumnsDetectedList = (
  mapping: ColumnMappingResult,
  cuotasPolicy: CuotasPolicy = 'use_detected'
) => {
  const columnsDetected: VerificationReport['columnsDetected'] = [];
  const missingEssentialFields: string[] = [];

  // Marca
  if (mapping.marcaCol && mapping.marcaCol !== '__NONE__' && mapping.marcaCol !== '__AUTO__' && mapping.marcaCol !== '__BLANK__') {
    columnsDetected.push({
      field: 'marca',
      label: 'Marca',
      excelHeader: mapping.marcaCol,
      isAutoDerived: false,
    });
  } else if (mapping.marcaCol === '__BLANK__') {
    columnsDetected.push({
      field: 'marca',
      label: 'Marca',
      excelHeader: '(En blanco / No utilizada)',
      isAutoDerived: true,
    });
  } else {
    columnsDetected.push({
      field: 'marca',
      label: 'Marca',
      excelHeader: 'Auto (Analizar celdas del Excel con IA)',
      isAutoDerived: true,
    });
  }

  // Modelo
  if (mapping.modeloCol && mapping.modeloCol !== '__NONE__' && mapping.modeloCol !== '__BLANK__') {
    columnsDetected.push({
      field: 'modelo',
      label: 'Modelo',
      excelHeader: mapping.modeloCol,
      isAutoDerived: false,
    });
  } else {
    columnsDetected.push({
      field: 'modelo',
      label: 'Modelo',
      excelHeader: '(En blanco si no existe)',
      isAutoDerived: true,
    });
  }

  // Dimensiones
  if (mapping.dimensionesCol && mapping.dimensionesCol !== '__NONE__' && mapping.dimensionesCol !== '__BLANK__') {
    columnsDetected.push({
      field: 'dimensiones',
      label: 'Medida / Dimensiones',
      excelHeader: mapping.dimensionesCol,
      isAutoDerived: false,
    });
  } else if (mapping.dimensionesCol === '__BLANK__') {
    columnsDetected.push({
      field: 'dimensiones',
      label: 'Medida / Dimensiones',
      excelHeader: '(En blanco / No utilizada)',
      isAutoDerived: true,
    });
  } else {
    columnsDetected.push({
      field: 'dimensiones',
      label: 'Medida / Dimensiones',
      excelHeader: 'Auto (Extraer de celdas)',
      isAutoDerived: true,
    });
  }

  // Rodado
  if (mapping.rodadoCol && mapping.rodadoCol !== '__NONE__' && mapping.rodadoCol !== '__BLANK__') {
    columnsDetected.push({
      field: 'rodado',
      label: 'Rodado',
      excelHeader: mapping.rodadoCol,
      isAutoDerived: false,
    });
  } else {
    columnsDetected.push({
      field: 'rodado',
      label: 'Rodado',
      excelHeader: 'Auto (extraído de Medida)',
      isAutoDerived: true,
    });
  }

  // Precio Contado
  if (mapping.precioContadoCol && mapping.precioContadoCol !== '__NONE__' && mapping.precioContadoCol !== '__BLANK__') {
    columnsDetected.push({
      field: 'precioContado',
      label: 'Precio Contado',
      excelHeader: mapping.precioContadoCol,
      isAutoDerived: false,
    });
  } else {
    missingEssentialFields.push('Precio Contado');
  }

  // 4 Cuotas
  if (mapping.precioCuota4Col && mapping.precioCuota4Col !== '__NONE__' && mapping.precioCuota4Col !== '__BLANK__') {
    columnsDetected.push({
      field: 'precioCuota4',
      label: '4 Cuotas',
      excelHeader:
        cuotasPolicy === 'calculate'
          ? `${mapping.precioCuota4Col} (Ignorado: Calculando según Contado)`
          : `${mapping.precioCuota4Col} (Precio final del Excel ÷ 4)`,
      isAutoDerived: cuotasPolicy === 'calculate',
    });
  } else if (mapping.precioCuota4Col === '__BLANK__') {
    columnsDetected.push({
      field: 'precioCuota4',
      label: '4 Cuotas',
      excelHeader: '(En blanco / 0)',
      isAutoDerived: true,
    });
  } else {
    columnsDetected.push({
      field: 'precioCuota4',
      label: '4 Cuotas',
      excelHeader: 'Auto (Calculado: +15% / 4)',
      isAutoDerived: true,
    });
  }

  // 20 Cuotas
  if (mapping.precioCuota20Col && mapping.precioCuota20Col !== '__NONE__' && mapping.precioCuota20Col !== '__BLANK__') {
    columnsDetected.push({
      field: 'precioCuota20',
      label: '20 Cuotas',
      excelHeader:
        cuotasPolicy === 'calculate'
          ? `${mapping.precioCuota20Col} (Ignorado: Calculando según Contado)`
          : `${mapping.precioCuota20Col} (Precio final del Excel ÷ 20)`,
      isAutoDerived: cuotasPolicy === 'calculate',
    });
  } else if (mapping.precioCuota20Col === '__BLANK__') {
    columnsDetected.push({
      field: 'precioCuota20',
      label: '20 Cuotas',
      excelHeader: '(En blanco / 0)',
      isAutoDerived: true,
    });
  } else {
    columnsDetected.push({
      field: 'precioCuota20',
      label: '20 Cuotas',
      excelHeader: 'Auto (Calculado: +50% / 20)',
      isAutoDerived: true,
    });
  }

  // Stock
  if (mapping.stockCol && mapping.stockCol !== '__NONE__' && mapping.stockCol !== '__BLANK__') {
    columnsDetected.push({
      field: 'stock',
      label: 'Stock / Unidades',
      excelHeader: mapping.stockCol,
      isAutoDerived: false,
    });
  } else if (mapping.stockCol === '__BLANK__') {
    columnsDetected.push({
      field: 'stock',
      label: 'Stock / Unidades',
      excelHeader: '(En blanco / 0 unidades)',
      isAutoDerived: true,
    });
  } else {
    columnsDetected.push({
      field: 'stock',
      label: 'Stock / Unidades',
      excelHeader: 'Sin columna detectada (0 unidades - Sin stock)',
      isAutoDerived: true,
    });
  }

  return { columnsDetected, missingEssentialFields };
};

// Change active sheet view ('all' or sheet index)
export const changeActiveSheetView = (
  report: VerificationReport,
  newView: number | 'all'
): VerificationReport => {
  if (newView === 'all' || !report.sheets || !report.sheets[newView]) {
    const firstSheet = report.sheets?.[0];
    return {
      ...report,
      selectedSheetView: 'all',
      sheetName:
        report.sheets && report.sheets.length > 1
          ? `Todas las páginas (${report.sheets.length} hojas)`
          : (firstSheet?.sheetName || report.sheetName),
      availableHeaders: firstSheet?.availableHeaders || report.availableHeaders,
      currentMapping: firstSheet?.mapping || report.currentMapping,
      rawRows: firstSheet?.rawRows || report.rawRows,
      headerRowIndex: firstSheet?.headerRowIndex || report.headerRowIndex,
      columnsDetected: firstSheet?.columnsDetected || report.columnsDetected,
      missingEssentialFields: firstSheet?.missingEssentialFields || report.missingEssentialFields,
      sampleTires: report.allParsedTires.slice(0, 5),
    };
  }

  const sheet = report.sheets[newView];
  return {
    ...report,
    selectedSheetView: newView,
    sheetName: sheet.sheetName,
    availableHeaders: sheet.availableHeaders,
    currentMapping: sheet.mapping,
    rawRows: sheet.rawRows,
    headerRowIndex: sheet.headerRowIndex,
    columnsDetected: sheet.columnsDetected,
    missingEssentialFields: sheet.missingEssentialFields,
    sampleTires: sheet.parsedTires.slice(0, 5),
  };
};

// Toggle inclusion of a sheet in the consolidated catalog
export const toggleSheetSelection = (
  report: VerificationReport,
  sheetIndex: number
): VerificationReport => {
  if (!report.sheets || !report.sheets[sheetIndex]) return report;

  const updatedSheets = report.sheets.map((s, idx) => {
    if (idx === sheetIndex) {
      return { ...s, selected: !s.selected };
    }
    return s;
  });

  const consolidatedTires = updatedSheets
    .filter((s) => s.selected)
    .flatMap((s) => s.parsedTires);

  const brandGroupsSummary: Record<string, number> = {};
  consolidatedTires.forEach((t) => {
    const b = t.marca || 'Sin marca';
    brandGroupsSummary[b] = (brandGroupsSummary[b] || 0) + 1;
  });

  return {
    ...report,
    sheets: updatedSheets,
    allParsedTires: consolidatedTires,
    validRowsCount: consolidatedTires.length,
    sampleTires: consolidatedTires.slice(0, 5),
    aiAnalysis: report.aiAnalysis
      ? {
          ...report.aiAnalysis,
          brandGroupsSummary,
        }
      : undefined,
  };
};

// Update column mapping for a specific sheet
export const updateSheetMapping = (
  report: VerificationReport,
  sheetIndex: number,
  newMapping: ColumnMappingResult,
  cuotasPolicy: CuotasPolicy = report.cuotasPolicy || 'use_detected'
): VerificationReport => {
  if (!report.sheets || !report.sheets[sheetIndex]) {
    return reparseWithCustomMapping(report, newMapping, cuotasPolicy);
  }

  const sheet = report.sheets[sheetIndex];
  const rows = sheet.rawRows.slice(sheet.headerRowIndex + 1);
  const updatedParsedTires = parseTiresFromRows(
    rows,
    sheet.availableHeaders,
    newMapping,
    cuotasPolicy,
    sheet.detectedBrand,
    sheet.sheetName
  );
  const { columnsDetected, missingEssentialFields } = buildColumnsDetectedList(newMapping, cuotasPolicy);

  const updatedSheet: SheetParsedData = {
    ...sheet,
    mapping: newMapping,
    parsedTires: updatedParsedTires,
    validRowsCount: updatedParsedTires.length,
    columnsDetected,
    missingEssentialFields,
  };

  const updatedSheets = [...report.sheets];
  updatedSheets[sheetIndex] = updatedSheet;

  const consolidatedTires = updatedSheets
    .filter((s) => s.selected)
    .flatMap((s) => s.parsedTires);

  const brandGroupsSummary: Record<string, number> = {};
  consolidatedTires.forEach((t) => {
    const b = t.marca || 'Sin marca';
    brandGroupsSummary[b] = (brandGroupsSummary[b] || 0) + 1;
  });

  const isCurrentView = report.selectedSheetView === sheetIndex;

  return {
    ...report,
    sheets: updatedSheets,
    currentMapping: isCurrentView ? newMapping : report.currentMapping,
    columnsDetected: isCurrentView ? columnsDetected : report.columnsDetected,
    missingEssentialFields: isCurrentView ? missingEssentialFields : report.missingEssentialFields,
    cuotasPolicy,
    validRowsCount: consolidatedTires.length,
    sampleTires: consolidatedTires.slice(0, 5),
    allParsedTires: consolidatedTires,
    aiAnalysis: report.aiAnalysis
      ? {
          ...report.aiAnalysis,
          brandGroupsSummary,
        }
      : undefined,
  };
};

// Re-parse existing report when user customizes mapping or cuotas policy in UI
export const reparseWithCustomMapping = (
  report: VerificationReport,
  newMapping: ColumnMappingResult,
  cuotasPolicy: CuotasPolicy = report.cuotasPolicy || 'use_detected'
): VerificationReport => {
  // If user is currently looking at a specific sheet, update that sheet's mapping
  if (typeof report.selectedSheetView === 'number' && report.sheets && report.sheets[report.selectedSheetView]) {
    return updateSheetMapping(report, report.selectedSheetView, newMapping, cuotasPolicy);
  }

  // If viewing 'all' and there are multiple sheets, update cuotasPolicy for all sheets
  if (report.sheets && report.sheets.length > 0) {
    const updatedSheets = report.sheets.map((sheet) => {
      const rows = sheet.rawRows.slice(sheet.headerRowIndex + 1);
      const mappingToUse = report.sheets.length === 1 ? newMapping : sheet.mapping;
      const updatedTires = parseTiresFromRows(
        rows,
        sheet.availableHeaders,
        mappingToUse,
        cuotasPolicy,
        sheet.detectedBrand,
        sheet.sheetName
      );
      const { columnsDetected, missingEssentialFields } = buildColumnsDetectedList(mappingToUse, cuotasPolicy);
      return {
        ...sheet,
        mapping: mappingToUse,
        parsedTires: updatedTires,
        validRowsCount: updatedTires.length,
        columnsDetected,
        missingEssentialFields,
      };
    });

    const consolidatedTires = updatedSheets
      .filter((s) => s.selected)
      .flatMap((s) => s.parsedTires);

    const brandGroupsSummary: Record<string, number> = {};
    consolidatedTires.forEach((t) => {
      const b = t.marca || 'Sin marca';
      brandGroupsSummary[b] = (brandGroupsSummary[b] || 0) + 1;
    });

    return {
      ...report,
      sheets: updatedSheets,
      currentMapping: newMapping,
      cuotasPolicy,
      validRowsCount: consolidatedTires.length,
      columnsDetected: updatedSheets[0]?.columnsDetected || report.columnsDetected,
      missingEssentialFields: updatedSheets[0]?.missingEssentialFields || report.missingEssentialFields,
      sampleTires: consolidatedTires.slice(0, 5),
      allParsedTires: consolidatedTires,
      aiAnalysis: report.aiAnalysis
        ? {
            ...report.aiAnalysis,
            brandGroupsSummary,
          }
        : undefined,
    };
  }

  // Standalone single-sheet fallback
  const rows = report.rawRows.slice(report.headerRowIndex + 1);
  const parsedTires = parseTiresFromRows(rows, report.availableHeaders, newMapping, cuotasPolicy);
  const { columnsDetected, missingEssentialFields } = buildColumnsDetectedList(newMapping, cuotasPolicy);

  const brandGroupsSummary: Record<string, number> = {};
  parsedTires.forEach((t) => {
    const b = t.marca || 'Sin marca';
    brandGroupsSummary[b] = (brandGroupsSummary[b] || 0) + 1;
  });

  return {
    ...report,
    currentMapping: newMapping,
    cuotasPolicy,
    validRowsCount: parsedTires.length,
    columnsDetected,
    missingEssentialFields,
    sampleTires: parsedTires.slice(0, 5),
    allParsedTires: parsedTires,
    aiAnalysis: report.aiAnalysis
      ? {
          ...report.aiAnalysis,
          brandGroupsSummary,
        }
      : undefined,
  };
};

// Parse an ArrayBuffer / File of an Excel or CSV workbook with contextual AI analysis across ALL sheets
export const parseExcelFile = async (file: File): Promise<VerificationReport> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: true,
    raw: true,
  });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('El archivo no contiene hojas de cálculo.');
  }

  // Process ALL non-empty sheets in the workbook
  const rawSheetsData: Array<{
    sheetName: string;
    rawData: any[][];
    bestHeaderRowIndex: number;
    availableHeaders: string[];
    rows: any[][];
    baselineMapping: ColumnMappingResult;
    detectedBrand?: string;
  }> = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: true,
    });

    if (!rawData || rawData.length === 0) continue;

    // Find best header row for THIS sheet (checking rows 0 to 12)
    let bestHeaderRowIndex = 0;
    let maxScore = -1;

    for (let r = 0; r < Math.min(12, rawData.length); r++) {
      const row = rawData[r];
      if (!Array.isArray(row)) continue;

      let score = 0;
      const nonEmpties = row.filter((c) => String(c || '').trim().length > 0);

      for (const cell of row) {
        if (cell == null) continue;
        const str = String(cell).trim().toLowerCase();
        const norm = normalizeHeader(str);

        if (isCuota4Header(cell)) score += 3;
        if (isCuota20Header(cell)) score += 3;
        if (isPrecioContadoHeader(cell)) score += 3;
        if (/marca|brand|fabricante/.test(norm)) score += 3;
        if (/medida|dimension|size|cubierta/.test(norm)) score += 3;
        if (/modelo|diseno|linea/.test(norm)) score += 2;
        if (/stock|cantidad|cant|unid/.test(norm)) score += 2;
        if (/rodado|aro|rim/.test(norm)) score += 2;
        if (/codigo|sku|art/.test(norm)) score += 2;
        if (/descripcion|producto|detalle/.test(norm)) score += 2;
      }

      if (nonEmpties.length >= 3) {
        score += nonEmpties.length;
      }

      if (score > maxScore) {
        maxScore = score;
        bestHeaderRowIndex = r;
      }
    }

    // Candidate raw headers from best header row
    let rawHeaders: string[] = (rawData[bestHeaderRowIndex] || []).map((h) =>
      String(h != null ? h : '').trim()
    );

    // Merge multi-level headers if previous row has section titles
    if (bestHeaderRowIndex > 0) {
      const prevRow = rawData[bestHeaderRowIndex - 1] || [];
      rawHeaders = rawHeaders.map((h, colIdx) => {
        const prevVal = String(prevRow[colIdx] || '').trim();
        if (!h && prevVal) return prevVal;
        if ((h === '4' || h === '20') && /cuota|finan|plan/i.test(prevVal)) {
          return `${prevVal} ${h}`;
        }
        return h;
      });
    }

    const availableHeaders = rawHeaders.map((h, idx) => {
      const trimmed = h.trim();
      if (!trimmed) return `Columna_${idx + 1}`;
      return trimmed;
    });

    const rows = rawData.slice(bestHeaderRowIndex + 1);
    if (rows.length === 0) continue;

    // Detect if sheet name itself is a tire brand (e.g. "MICHELIN", "PACE", "PIRELLI", "BFGOODRICH")
    let detectedBrand: string | undefined;
    const brandInSheetName = detectBrandInText(sheetName);
    if (brandInSheetName) {
      detectedBrand = brandInSheetName.brand;
    } else {
      // Check title rows before header row
      for (let r = 0; r < bestHeaderRowIndex; r++) {
        const rowStr = (rawData[r] || []).map((c) => String(c || '')).join(' ');
        const found = detectBrandInText(rowStr);
        if (found) {
          detectedBrand = found.brand;
          break;
        }
      }
    }

    const baselineMapping = detectColumnMapping(availableHeaders, rows.slice(0, 20));

    rawSheetsData.push({
      sheetName,
      rawData,
      bestHeaderRowIndex,
      availableHeaders,
      rows,
      baselineMapping,
      detectedBrand,
    });
  }

  if (rawSheetsData.length === 0) {
    throw new Error('No se encontraron hojas con datos válidos en el archivo Excel.');
  }

  // DEFAULT POLICY FOR CUOTAS: 'use_detected' (uses detected Excel column cell values verbatim!)
  const cuotasPolicy: CuotasPolicy = 'use_detected';

  // Prepare payload for AI analysis across ALL sheets
  const sheetsPayload = rawSheetsData.map((s) => ({
    sheetName: s.sheetName,
    headers: s.availableHeaders,
    sampleRows: s.rows.slice(0, 8),
    totalRows: s.rows.length,
  }));

  let aiReportData: any = null;
  try {
    const response = await fetch('/api/analyze-excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        sheetNames: rawSheetsData.map((s) => s.sheetName),
        sheetsData: sheetsPayload,
        headers: rawSheetsData[0].availableHeaders,
        sampleRows: rawSheetsData[0].rows.slice(0, 10),
        totalRows: rawSheetsData.reduce((sum, s) => sum + s.rows.length, 0),
      }),
    });

    if (response.ok) {
      const resJson = await response.json();
      if (resJson.success && resJson.analysis) {
        aiReportData = resJson.analysis;
        aiReportData.source = resJson.source || 'gemini';
      }
    }
  } catch (apiErr) {
    console.warn('Análisis contextual por servidor no disponible, usando motor local:', apiErr);
  }

  // Parse each sheet with its own mapping, detected brand, and cell accommodations
  const parsedSheets: SheetParsedData[] = rawSheetsData.map((sheetData) => {
    const finalMapping: ColumnMappingResult = { ...sheetData.baselineMapping };
    let sheetBrand = sheetData.detectedBrand;

    // Check if AI provided a sheet-specific mapping and brand
    const aiSheet = aiReportData?.sheets?.find((sh: any) => sh.sheetName === sheetData.sheetName);
    if (aiSheet) {
      if (aiSheet.detectedBrand && !sheetBrand) {
        sheetBrand = aiSheet.detectedBrand;
      }
      const aiMap = aiSheet.mapping || {};
      const isHeaderValid = (h: any) => h && typeof h === 'string' && sheetData.availableHeaders.includes(h);

      if (isHeaderValid(aiMap.marcaCol)) finalMapping.marcaCol = aiMap.marcaCol;
      if (isHeaderValid(aiMap.modeloCol)) finalMapping.modeloCol = aiMap.modeloCol;
      if (isHeaderValid(aiMap.dimensionesCol)) finalMapping.dimensionesCol = aiMap.dimensionesCol;
      if (isHeaderValid(aiMap.rodadoCol)) finalMapping.rodadoCol = aiMap.rodadoCol;
      if (isHeaderValid(aiMap.categoriaCol)) finalMapping.categoriaCol = aiMap.categoriaCol;
      if (isHeaderValid(aiMap.indiceCol)) finalMapping.indiceCol = aiMap.indiceCol;
      if (isHeaderValid(aiMap.precioContadoCol)) finalMapping.precioContadoCol = aiMap.precioContadoCol;
      if (isHeaderValid(aiMap.precioCuota4Col)) finalMapping.precioCuota4Col = aiMap.precioCuota4Col;
      if (isHeaderValid(aiMap.precioCuota20Col)) finalMapping.precioCuota20Col = aiMap.precioCuota20Col;
      if (isHeaderValid(aiMap.stockCol)) finalMapping.stockCol = aiMap.stockCol;
      if (isHeaderValid(aiMap.codigoCol)) finalMapping.codigoCol = aiMap.codigoCol;
      if (isHeaderValid(aiMap.descripcionCol)) finalMapping.descripcionCol = aiMap.descripcionCol;
    } else if (aiReportData?.mapping && rawSheetsData.length === 1) {
      // Single sheet fallback
      const aiMap = aiReportData.mapping || {};
      const isHeaderValid = (h: any) => h && typeof h === 'string' && sheetData.availableHeaders.includes(h);
      if (isHeaderValid(aiMap.marcaCol)) finalMapping.marcaCol = aiMap.marcaCol;
      if (isHeaderValid(aiMap.modeloCol)) finalMapping.modeloCol = aiMap.modeloCol;
      if (isHeaderValid(aiMap.dimensionesCol)) finalMapping.dimensionesCol = aiMap.dimensionesCol;
      if (isHeaderValid(aiMap.rodadoCol)) finalMapping.rodadoCol = aiMap.rodadoCol;
      if (isHeaderValid(aiMap.categoriaCol)) finalMapping.categoriaCol = aiMap.categoriaCol;
      if (isHeaderValid(aiMap.indiceCol)) finalMapping.indiceCol = aiMap.indiceCol;
      if (isHeaderValid(aiMap.precioContadoCol)) finalMapping.precioContadoCol = aiMap.precioContadoCol;
      if (isHeaderValid(aiMap.precioCuota4Col)) finalMapping.precioCuota4Col = aiMap.precioCuota4Col;
      if (isHeaderValid(aiMap.precioCuota20Col)) finalMapping.precioCuota20Col = aiMap.precioCuota20Col;
      if (isHeaderValid(aiMap.stockCol)) finalMapping.stockCol = aiMap.stockCol;
      if (isHeaderValid(aiMap.codigoCol)) finalMapping.codigoCol = aiMap.codigoCol;
      if (isHeaderValid(aiMap.descripcionCol)) finalMapping.descripcionCol = aiMap.descripcionCol;
    }

    const parsedTires = parseTiresFromRows(
      sheetData.rows,
      sheetData.availableHeaders,
      finalMapping,
      cuotasPolicy,
      sheetBrand,
      sheetData.sheetName
    );

    const { columnsDetected, missingEssentialFields } = buildColumnsDetectedList(finalMapping, cuotasPolicy);

    return {
      sheetName: sheetData.sheetName,
      detectedBrand: sheetBrand,
      headerRowIndex: sheetData.bestHeaderRowIndex,
      availableHeaders: sheetData.availableHeaders,
      mapping: finalMapping,
      rawRows: sheetData.rawData,
      parsedTires,
      validRowsCount: parsedTires.length,
      columnsDetected,
      missingEssentialFields,
      selected: true,
      detectedInstallmentHeaders: aiSheet?.detectedInstallmentHeaders,
      compoundColumn: aiSheet?.compoundColumn,
      notes: aiSheet?.notes,
    };
  });

  // Consolidate all tires from all selected sheets into unified catalog
  const allParsedTires = parsedSheets.filter((s) => s.selected).flatMap((s) => s.parsedTires);

  // Group summary by brand
  const brandGroupsSummary: Record<string, number> = {};
  allParsedTires.forEach((t) => {
    const b = t.marca || 'Sin marca';
    brandGroupsSummary[b] = (brandGroupsSummary[b] || 0) + 1;
  });

  const firstSheet = parsedSheets[0];
  const isMultiSheet = parsedSheets.length > 1;

  return {
    fileName: file.name,
    sheetName: isMultiSheet ? `Todas las páginas (${parsedSheets.length} hojas)` : firstSheet.sheetName,
    sheetNames: parsedSheets.map((s) => s.sheetName),
    sheets: parsedSheets,
    selectedSheetView: 'all',
    totalRowsFound: rawSheetsData.reduce((sum, s) => sum + s.rows.length, 0),
    validRowsCount: allParsedTires.length,
    availableHeaders: firstSheet.availableHeaders,
    currentMapping: firstSheet.mapping,
    rawRows: firstSheet.rawRows,
    headerRowIndex: firstSheet.headerRowIndex,
    columnsDetected: firstSheet.columnsDetected,
    missingEssentialFields: firstSheet.missingEssentialFields,
    sampleTires: allParsedTires.slice(0, 5),
    allParsedTires,
    cuotasPolicy,
    aiAnalysis: aiReportData
      ? {
          source: aiReportData.source || 'gemini',
          insights:
            aiReportData.insights ||
            `La IA analizó ${parsedSheets.length} página(s) del archivo. Las diferentes estructuras de celda y columnas fueron agrupadas unificadamente por marca.`,
          confidence: aiReportData.confidence || 'high',
          detectedInstallmentHeaders: aiReportData.detectedInstallmentHeaders,
          compoundColumn: aiReportData.compoundColumn,
          brandGroupsSummary,
        }
      : {
          source: 'heuristic',
          insights: `Se organizaron contextualmente ${parsedSheets.length} página(s) del archivo. Las marcas se agruparon según los nombres de hoja y celdas del Excel.`,
          confidence: 'high',
          brandGroupsSummary,
        },
  };
};

// Generate standard match key for merging or summing stock
export const getTireMatchKey = (tire: Tire): string => {
  if (tire.codigo && tire.codigo.trim().length >= 4) {
    return `code:${tire.codigo.trim().toUpperCase()}`;
  }
  const m = tire.marca.trim().toLowerCase();
  const mod = tire.modelo.trim().toLowerCase();
  const d = tire.dimensiones.replace(/[\s\/-]/g, '').toLowerCase();
  return `desc:${m}_${mod}_${d}`;
};

// Execute import based on user's chosen mode: 'replace', 'merge', or 'sum_stock'
export const applyImportMode = (
  currentTires: Tire[],
  importedTires: Tire[],
  mode: ImportMode
): {
  updatedTires: Tire[];
  addedCount: number;
  updatedCount: number;
  summedUnits: number;
} => {
  if (mode === 'replace') {
    return {
      updatedTires: importedTires,
      addedCount: importedTires.length,
      updatedCount: 0,
      summedUnits: 0,
    };
  }

  const existingMap = new Map<string, Tire>();
  currentTires.forEach((t) => {
    existingMap.set(getTireMatchKey(t), { ...t });
  });

  let addedCount = 0;
  let updatedCount = 0;
  let summedUnits = 0;

  importedTires.forEach((imp) => {
    const key = getTireMatchKey(imp);
    const existing = existingMap.get(key);

    if (existing) {
      updatedCount++;
      if (mode === 'sum_stock') {
        summedUnits += imp.stock;
        existingMap.set(key, {
          ...existing,
          marca: imp.marca || existing.marca,
          modelo: imp.modelo || existing.modelo,
          dimensiones: imp.dimensiones || existing.dimensiones,
          rodado: imp.rodado || existing.rodado,
          categoria: imp.categoria || existing.categoria,
          indice: imp.indice || existing.indice,
          precioContado: imp.precioContado > 0 ? imp.precioContado : existing.precioContado,
          precioCuota4: imp.precioCuota4 > 0 ? imp.precioCuota4 : existing.precioCuota4,
          precioCuota20: imp.precioCuota20 > 0 ? imp.precioCuota20 : existing.precioCuota20,
          stock: existing.stock + imp.stock, // SUM STOCK
          descripcion: imp.descripcion || existing.descripcion,
        });
      } else {
        // mode === 'merge' (replace stock and update info/prices)
        existingMap.set(key, {
          ...existing,
          marca: imp.marca || existing.marca,
          modelo: imp.modelo || existing.modelo,
          dimensiones: imp.dimensiones || existing.dimensiones,
          rodado: imp.rodado || existing.rodado,
          categoria: imp.categoria || existing.categoria,
          indice: imp.indice || existing.indice,
          precioContado: imp.precioContado > 0 ? imp.precioContado : existing.precioContado,
          precioCuota4: imp.precioCuota4 > 0 ? imp.precioCuota4 : existing.precioCuota4,
          precioCuota20: imp.precioCuota20 > 0 ? imp.precioCuota20 : existing.precioCuota20,
          stock: imp.stock, // SET EXCEL STOCK
          descripcion: imp.descripcion || existing.descripcion,
        });
      }
    } else {
      // New tire to add
      addedCount++;
      existingMap.set(key, imp);
    }
  });

  return {
    updatedTires: Array.from(existingMap.values()),
    addedCount,
    updatedCount,
    summedUnits,
  };
};

// Download a formatted sample Excel template that matches the preconfigured cells perfectly
export const downloadSampleExcelTemplate = () => {
  const sampleData = [
    {
      Marca: 'Michelin',
      Modelo: 'Primacy 4+',
      Medida: '205/55 R16',
      Rodado: 'R16',
      Categoria: 'Auto',
      Indice: '91V',
      'Precio Contado': 295000,
      '4 Cuotas': 84800,
      '20 Cuotas': 22100,
      Stock: 24,
      Codigo: 'MICH-PRI4-2055516',
      Observaciones: 'Frenado en mojado y durabilidad',
    },
    {
      Marca: 'BFGoodrich',
      Modelo: 'All-Terrain T/A KO2',
      Medida: '265/70 R16',
      Rodado: 'R16',
      Categoria: 'SUV / 4x4',
      Indice: '121S',
      'Precio Contado': 495000,
      '4 Cuotas': 142300,
      '20 Cuotas': 37125,
      Stock: 16,
      Codigo: 'BFG-KO2-2657016',
      Observaciones: 'Máxima tracción todoterreno',
    },
    {
      Marca: 'Zmax',
      Modelo: 'Landgair A/T',
      Medida: '245/70 R16',
      Rodado: 'R16',
      Categoria: 'SUV / 4x4',
      Indice: '111T',
      'Precio Contado': 249000,
      '4 Cuotas': 71590,
      '20 Cuotas': 18675,
      Stock: 20,
      Codigo: 'ZMAX-LAND-2457016',
      Observaciones: 'Excelente relación precio/rendimiento',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Neumáticos');

  ws['!cols'] = [
    { wch: 14 },
    { wch: 22 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
    { wch: 10 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 20 },
    { wch: 30 },
  ];

  XLSX.writeFile(wb, 'Plantilla_Stock_Neumaticos.xlsx');
};

// Export actual current tires catalog to an authentic .xlsx workbook
export const exportCatalogToXlsx = (tires: Tire[], filename?: string) => {
  const data = tires.map((t) => ({
    Marca: t.marca,
    Modelo: t.modelo,
    Medida: t.dimensiones,
    Rodado: t.rodado,
    Categoria: t.categoria,
    Indice: t.indice,
    'Precio Contado': t.precioContado,
    '4 Cuotas': t.precioCuota4,
    '20 Cuotas': t.precioCuota20,
    Stock: t.stock,
    Codigo: t.codigo || '',
    Descripcion: t.descripcion || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

  ws['!cols'] = [
    { wch: 14 },
    { wch: 22 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
    { wch: 10 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 22 },
    { wch: 30 },
  ];

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, filename || `Stock_Neumaticos_${dateStr}.xlsx`);
};
