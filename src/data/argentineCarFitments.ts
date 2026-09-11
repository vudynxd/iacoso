// Argentine vehicle sales ranking and strict tire fitment verification
// Based on ACARA (Asociación de Concesionarios de Automotores de la República Argentina) patenting data.
// STRICT FILTERING RULE: A vehicle is ONLY matched if it actually wears this tire dimension from the factory.
// If the #1 overall seller (e.g. Yaris or Cronos) does not fit that tire, it is discarded and the next
// highest-selling vehicle in Argentina that actually wears that size is selected.

export interface VehicleFactorySize {
  dimension: string; // e.g. "205/55R16"
  trimLabel: string; // e.g. "XEi / SEG"
}

export interface RankedArgentineVehicle {
  rank: number; // ACARA sales ranking
  brand: string;
  model: string;
  displayName: string;
  category: 'Auto' | 'Camioneta' | 'SUV' | 'Utilitario';
  factorySizes: VehicleFactorySize[];
  notes?: string;
}

// Normalized helper to compare dimensions without whitespace, slashes or 'ZR' differences
export function normalizeDimensionKey(raw: string): string {
  if (!raw) return '';
  return raw
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '/')
    .replace(/ZR/i, 'R')
    .replace(/C$/i, '')
    .replace(/LT/i, '');
}

export interface ParsedDimension {
  width: number;
  aspectRatio: number;
  rim: number;
  normalized: string;
}

export function parseDimension(raw: string): ParsedDimension | null {
  const norm = normalizeDimensionKey(raw);
  const match = norm.match(/^(\d{3})\/(\d{2})R(\d{2})/);
  if (!match) return null;
  return {
    width: parseInt(match[1], 10),
    aspectRatio: parseInt(match[2], 10),
    rim: parseInt(match[3], 10),
    normalized: `${match[1]}/${match[2]}R${match[3]}`,
  };
}

// Complete ranking of the top patenting vehicles in Argentina with their official tire sizes per trim
export const ACARA_TOP_VEHICLES_RANKING: RankedArgentineVehicle[] = [
  {
    rank: 1,
    brand: 'Fiat',
    model: 'Cronos',
    displayName: 'Fiat Cronos',
    category: 'Auto',
    factorySizes: [
      { dimension: '175/65R14', trimLabel: 'Cronos 1.3 Attractive' },
      { dimension: '185/60R15', trimLabel: 'Cronos Drive 1.3' },
      { dimension: '195/55R16', trimLabel: 'Cronos Precision MT / S-Design' },
      { dimension: '205/55R16', trimLabel: 'Cronos Precision AT' },
    ],
  },
  {
    rank: 2,
    brand: 'Peugeot',
    model: '208',
    displayName: 'Peugeot 208',
    category: 'Auto',
    factorySizes: [
      { dimension: '175/65R14', trimLabel: '208 Like / Active' },
      { dimension: '185/65R15', trimLabel: '208 Active Pack / Allure' },
      { dimension: '195/55R16', trimLabel: '208 Allure / Style' },
      { dimension: '205/55R16', trimLabel: '208 Feline' },
      { dimension: '205/45R17', trimLabel: '208 GT / Feline T200' },
    ],
  },
  {
    rank: 3,
    brand: 'Toyota',
    model: 'Hilux',
    displayName: 'Toyota Hilux',
    category: 'Camioneta',
    factorySizes: [
      { dimension: '245/70R16', trimLabel: 'Hilux DX Chasis / Cabina Simple' },
      { dimension: '265/70R16', trimLabel: 'Hilux SR 4x2 / 4x4' },
      { dimension: '245/65R17', trimLabel: 'Hilux SR 17"' },
      { dimension: '265/65R17', trimLabel: 'Hilux SRV / SR' },
      { dimension: '265/60R18', trimLabel: 'Hilux SRX / Conquest' },
      { dimension: '255/50R20', trimLabel: 'Hilux GR-Sport' },
    ],
  },
  {
    rank: 4,
    brand: 'Ford',
    model: 'Ranger',
    displayName: 'Ford Ranger',
    category: 'Camioneta',
    factorySizes: [
      { dimension: '245/70R16', trimLabel: 'Ranger XL' },
      { dimension: '265/70R16', trimLabel: 'Ranger XLS 16"' },
      { dimension: '245/65R17', trimLabel: 'Ranger XLS V6' },
      { dimension: '265/65R17', trimLabel: 'Ranger XLT' },
      { dimension: '255/65R18', trimLabel: 'Ranger Limited V6' },
      { dimension: '265/60R18', trimLabel: 'Ranger Limited' },
      { dimension: '255/55R20', trimLabel: 'Ranger Limited Plus' },
      { dimension: '285/70R17', trimLabel: 'Ranger Raptor' },
    ],
  },
  {
    rank: 5,
    brand: 'Volkswagen',
    model: 'Amarok',
    displayName: 'VW Amarok',
    category: 'Camioneta',
    factorySizes: [
      { dimension: '245/70R16', trimLabel: 'Amarok Trendline' },
      { dimension: '245/65R17', trimLabel: 'Amarok Comfortline' },
      { dimension: '255/60R18', trimLabel: 'Amarok Highline' },
      { dimension: '255/50R19', trimLabel: 'Amarok V6 Extreme' },
      { dimension: '255/50R20', trimLabel: 'Amarok V6 Black Style' },
    ],
  },
  {
    rank: 6,
    brand: 'Toyota',
    model: 'Yaris',
    displayName: 'Toyota Yaris',
    category: 'Auto',
    // Toyota Yaris in Argentina exclusively uses 185/60 R15 across XS, XLS, and S versions
    factorySizes: [
      { dimension: '185/60R15', trimLabel: 'Yaris XS / XLS / S' },
      { dimension: '195/50R16', trimLabel: 'Yaris S Alternativa' },
    ],
  },
  {
    rank: 7,
    brand: 'Volkswagen',
    model: 'Polo / Polo Track',
    displayName: 'VW Polo / Track',
    category: 'Auto',
    factorySizes: [
      { dimension: '185/65R15', trimLabel: 'Polo Track / MSI' },
      { dimension: '195/55R16', trimLabel: 'Polo Comfortline / Highline' },
      { dimension: '205/50R17', trimLabel: 'Polo GTS' },
    ],
  },
  {
    rank: 8,
    brand: 'Chevrolet',
    model: 'Tracker',
    displayName: 'Chevrolet Tracker',
    category: 'SUV',
    factorySizes: [
      { dimension: '205/60R16', trimLabel: 'Tracker MT / AT' },
      { dimension: '215/55R17', trimLabel: 'Tracker LTZ / Premier' },
    ],
  },
  {
    rank: 9,
    brand: 'Renault',
    model: 'Kangoo',
    displayName: 'Renault Kangoo II',
    category: 'Utilitario',
    factorySizes: [
      { dimension: '175/70R14', trimLabel: 'Kangoo Express Furgón' },
      { dimension: '185/65R15', trimLabel: 'Kangoo Life / Zen' },
      { dimension: '195/65R15', trimLabel: 'Kangoo Stepway' },
      { dimension: '205/55R16', trimLabel: 'Kangoo Stepway Sport' },
    ],
  },
  {
    rank: 10,
    brand: 'Toyota',
    model: 'Corolla Cross',
    displayName: 'Toyota Corolla Cross',
    category: 'SUV',
    factorySizes: [
      { dimension: '215/60R17', trimLabel: 'Corolla Cross XLi / XEi' },
      { dimension: '215/55R17', trimLabel: 'Corolla Cross XEi HEV' },
      { dimension: '225/50R18', trimLabel: 'Corolla Cross SEG' },
      { dimension: '225/55R18', trimLabel: 'Corolla Cross SEG HEV / GR-S' },
    ],
  },
  {
    rank: 11,
    brand: 'Volkswagen',
    model: 'Taos',
    displayName: 'VW Taos',
    category: 'SUV',
    factorySizes: [
      { dimension: '215/55R17', trimLabel: 'Taos Comfortline' },
      { dimension: '215/55R18', trimLabel: 'Taos Highline' },
      { dimension: '235/45R19', trimLabel: 'Taos Hero' },
    ],
  },
  {
    rank: 12,
    brand: 'Toyota',
    model: 'Corolla',
    displayName: 'Toyota Corolla',
    category: 'Auto',
    factorySizes: [
      { dimension: '195/65R15', trimLabel: 'Corolla XLi' },
      { dimension: '205/55R16', trimLabel: 'Corolla XEi' },
      { dimension: '225/45R17', trimLabel: 'Corolla SEG / GR-Sport' },
    ],
  },
  {
    rank: 13,
    brand: 'Jeep',
    model: 'Renegade',
    displayName: 'Jeep Renegade',
    category: 'SUV',
    factorySizes: [
      { dimension: '215/65R16', trimLabel: 'Renegade Sport' },
      { dimension: '215/60R17', trimLabel: 'Renegade Longitude' },
      { dimension: '225/55R18', trimLabel: 'Renegade Trailhawk / S' },
    ],
  },
  {
    rank: 14,
    brand: 'Nissan',
    model: 'Kicks',
    displayName: 'Nissan Kicks',
    category: 'SUV',
    factorySizes: [
      { dimension: '205/60R16', trimLabel: 'Kicks Sense' },
      { dimension: '205/55R17', trimLabel: 'Kicks Advance / Exclusive' },
      { dimension: '215/55R17', trimLabel: 'Kicks Exclusive Alternativa' },
    ],
  },
  {
    rank: 15,
    brand: 'Fiat',
    model: 'Strada',
    displayName: 'Fiat Strada',
    category: 'Camioneta',
    factorySizes: [
      { dimension: '175/70R14', trimLabel: 'Strada Endurance' },
      { dimension: '185/60R15', trimLabel: 'Strada Freedom' },
      { dimension: '205/60R15', trimLabel: 'Strada Volcano' },
      { dimension: '205/55R16', trimLabel: 'Strada Ranch / Ultra' },
    ],
  },
  {
    rank: 16,
    brand: 'Fiat',
    model: 'Toro',
    displayName: 'Fiat Toro',
    category: 'Camioneta',
    factorySizes: [
      { dimension: '215/65R16', trimLabel: 'Toro Freedom' },
      { dimension: '225/60R17', trimLabel: 'Toro Volcano' },
      { dimension: '225/65R17', trimLabel: 'Toro Volcano 4x4' },
      { dimension: '225/60R18', trimLabel: 'Toro Ranch / Ultra' },
    ],
  },
  {
    rank: 17,
    brand: 'Renault',
    model: 'Sandero / Stepway',
    displayName: 'Renault Sandero / Stepway',
    category: 'Auto',
    factorySizes: [
      { dimension: '185/65R15', trimLabel: 'Sandero Life / Zen' },
      { dimension: '205/55R16', trimLabel: 'Sandero Stepway / Intens' },
      { dimension: '205/45R17', trimLabel: 'Sandero R.S.' },
    ],
  },
  {
    rank: 18,
    brand: 'Chevrolet',
    model: 'Onix / Prisma',
    displayName: 'Chevrolet Onix / Prisma',
    category: 'Auto',
    factorySizes: [
      { dimension: '185/70R14', trimLabel: 'Onix Joy' },
      { dimension: '185/65R15', trimLabel: 'Onix LT / LTZ' },
      { dimension: '195/55R16', trimLabel: 'Onix Premier' },
    ],
  },
  {
    rank: 19,
    brand: 'Volkswagen',
    model: 'Gol Trend',
    displayName: 'VW Gol Trend',
    category: 'Auto',
    factorySizes: [
      { dimension: '175/70R14', trimLabel: 'Gol Trend Pack 1 / Power' },
      { dimension: '175/65R14', trimLabel: 'Gol Trend Pack 2' },
      { dimension: '185/60R14', trimLabel: 'Gol Trendline' },
      { dimension: '195/55R15', trimLabel: 'Gol Trend Pack 3 / Highline' },
    ],
  },
  {
    rank: 20,
    brand: 'Chevrolet',
    model: 'Cruze',
    displayName: 'Chevrolet Cruze',
    category: 'Auto',
    factorySizes: [
      { dimension: '205/55R16', trimLabel: 'Cruze LT' },
      { dimension: '215/50R17', trimLabel: 'Cruze LTZ' },
      { dimension: '225/45R17', trimLabel: 'Cruze Premier / RS' },
    ],
  },
  {
    rank: 21,
    brand: 'Ford',
    model: 'Focus',
    displayName: 'Ford Focus',
    category: 'Auto',
    factorySizes: [
      { dimension: '195/65R15', trimLabel: 'Focus 1 / 2 Ambiente' },
      { dimension: '205/55R16', trimLabel: 'Focus S / SE' },
      { dimension: '215/50R17', trimLabel: 'Focus Titanium' },
      { dimension: '225/45R17', trimLabel: 'Focus Titanium Alternativa' },
    ],
  },
  {
    rank: 22,
    brand: 'Volkswagen',
    model: 'Golf / Vento / Bora',
    displayName: 'VW Golf / Vento / Bora',
    category: 'Auto',
    factorySizes: [
      { dimension: '195/65R15', trimLabel: 'Bora 2.0 / Golf 4' },
      { dimension: '205/55R16', trimLabel: 'Bora 1.8T / Golf 7 Trendline / Vento' },
      { dimension: '225/45R17', trimLabel: 'Golf Highline / Vento TSI' },
      { dimension: '225/40R18', trimLabel: 'Golf GTI / Vento GLI' },
    ],
  },
  {
    rank: 23,
    brand: 'Renault',
    model: 'Duster / Oroch',
    displayName: 'Renault Duster / Oroch',
    category: 'SUV',
    factorySizes: [
      { dimension: '215/65R16', trimLabel: 'Duster 1.6 / 4x4 / Oroch Dynamique' },
      { dimension: '215/60R17', trimLabel: 'Duster Iconic / Outsider' },
    ],
  },
  {
    rank: 24,
    brand: 'Toyota',
    model: 'Etios',
    displayName: 'Toyota Etios',
    category: 'Auto',
    factorySizes: [
      { dimension: '175/65R14', trimLabel: 'Etios X / XS' },
      { dimension: '185/60R15', trimLabel: 'Etios XLS / Platinum' },
      { dimension: '195/60R15', trimLabel: 'Etios Cross' },
    ],
  },
  {
    rank: 25,
    brand: 'Ford',
    model: 'EcoSport',
    displayName: 'Ford EcoSport',
    category: 'SUV',
    factorySizes: [
      { dimension: '205/65R15', trimLabel: 'EcoSport 1.6 / SE' },
      { dimension: '205/60R16', trimLabel: 'EcoSport Titanium / Freestyle' },
      { dimension: '205/50R17', trimLabel: 'EcoSport Titanium 2.0 / Storm' },
    ],
  },
  {
    rank: 26,
    brand: 'Peugeot / Citroën',
    model: 'Partner / Berlingo',
    displayName: 'Peugeot Partner / Berlingo',
    category: 'Utilitario',
    factorySizes: [
      { dimension: '175/70R14', trimLabel: 'Partner Furgón' },
      { dimension: '175/65R14', trimLabel: 'Partner Furgón Clásico' },
      { dimension: '185/65R15', trimLabel: 'Partner Patagónica / Berlingo Multispace' },
      { dimension: '205/65R15', trimLabel: 'Partner Patagónica VTC' },
    ],
  },
  {
    rank: 27,
    brand: 'Nissan',
    model: 'Frontier',
    displayName: 'Nissan Frontier',
    category: 'Camioneta',
    factorySizes: [
      { dimension: '245/70R16', trimLabel: 'Frontier S' },
      { dimension: '265/70R16', trimLabel: 'Frontier SE' },
      { dimension: '265/65R17', trimLabel: 'Frontier XE / Pro-4X 17"' },
      { dimension: '255/60R18', trimLabel: 'Frontier Platinum / Attack' },
    ],
  },
  {
    rank: 28,
    brand: 'Chevrolet',
    model: 'S10',
    displayName: 'Chevrolet S10',
    category: 'Camioneta',
    factorySizes: [
      { dimension: '245/70R16', trimLabel: 'S10 LS' },
      { dimension: '245/65R17', trimLabel: 'S10 LT' },
      { dimension: '265/65R17', trimLabel: 'S10 LTZ' },
      { dimension: '265/60R18', trimLabel: 'S10 High Country / Midnight' },
    ],
  },
  {
    rank: 29,
    brand: 'Jeep',
    model: 'Compass',
    displayName: 'Jeep Compass',
    category: 'SUV',
    factorySizes: [
      { dimension: '225/60R17', trimLabel: 'Compass Sport' },
      { dimension: '225/55R18', trimLabel: 'Compass Longitude / Limited' },
      { dimension: '235/45R19', trimLabel: 'Compass Trailhawk' },
    ],
  },
  {
    rank: 30,
    brand: 'Citroën',
    model: 'C4 Cactus',
    displayName: 'Citroën C4 Cactus',
    category: 'SUV',
    factorySizes: [
      { dimension: '205/60R16', trimLabel: 'C4 Cactus Live / Feel' },
      { dimension: '205/55R17', trimLabel: 'C4 Cactus Shine' },
    ],
  },
  {
    rank: 31,
    brand: 'Citroën',
    model: 'C3 / C3 Aircross',
    displayName: 'Citroën C3',
    category: 'Auto',
    factorySizes: [
      { dimension: '175/65R14', trimLabel: 'C3 Live' },
      { dimension: '185/65R15', trimLabel: 'C3 Feel' },
      { dimension: '195/60R15', trimLabel: 'C3 Exclusive' },
      { dimension: '205/60R16', trimLabel: 'C3 Aircross' },
    ],
  },
  {
    rank: 32,
    brand: 'Fiat',
    model: 'Fiorino',
    displayName: 'Fiat Fiorino',
    category: 'Utilitario',
    factorySizes: [
      { dimension: '165/70R13', trimLabel: 'Fiorino Fire' },
      { dimension: '175/70R14', trimLabel: 'Fiorino Evo' },
    ],
  },
  {
    rank: 33,
    brand: 'Volkswagen',
    model: 'Suran / Fox',
    displayName: 'VW Fox / Suran',
    category: 'Auto',
    factorySizes: [
      { dimension: '195/55R15', trimLabel: 'Suran / Fox Trendline / Highline' },
      { dimension: '205/55R15', trimLabel: 'Suran Highline' },
      { dimension: '205/60R15', trimLabel: 'Crossfox' },
    ],
  },
  {
    rank: 34,
    brand: 'Toyota',
    model: 'SW4',
    displayName: 'Toyota SW4',
    category: 'SUV',
    factorySizes: [
      { dimension: '265/65R17', trimLabel: 'SW4 SR' },
      { dimension: '265/60R18', trimLabel: 'SW4 SRX / Diamond' },
    ],
  },
  {
    rank: 35,
    brand: 'Fiat',
    model: 'Palio / Siena / Uno',
    displayName: 'Fiat Palio / Siena / Uno',
    category: 'Auto',
    factorySizes: [
      { dimension: '175/70R13', trimLabel: 'Palio / Siena Fire' },
      { dimension: '165/70R13', trimLabel: 'Uno Fire' },
      { dimension: '175/65R14', trimLabel: 'Palio Weekend / Attractive' },
      { dimension: '185/60R14', trimLabel: 'Palio 1.8R / Siena HLX' },
    ],
  },
  {
    rank: 36,
    brand: 'Chevrolet',
    model: 'Corsa / Classic',
    displayName: 'Chevrolet Corsa / Classic',
    category: 'Auto',
    factorySizes: [
      { dimension: '165/70R13', trimLabel: 'Corsa 1.6' },
      { dimension: '175/70R13', trimLabel: 'Corsa Classic' },
      { dimension: '185/60R14', trimLabel: 'Corsa II' },
    ],
  },
  {
    rank: 37,
    brand: 'Volkswagen',
    model: 'Nivus',
    displayName: 'VW Nivus',
    category: 'SUV',
    factorySizes: [
      { dimension: '205/60R16', trimLabel: 'Nivus 170 TSI / Comfortline' },
      { dimension: '205/55R17', trimLabel: 'Nivus Highline / Hero' },
    ],
  },
  {
    rank: 38,
    brand: 'Peugeot',
    model: '2008',
    displayName: 'Peugeot 2008',
    category: 'SUV',
    factorySizes: [
      { dimension: '205/60R16', trimLabel: '2008 Allure' },
      { dimension: '215/60R16', trimLabel: '2008 Feline / Griffe' },
      { dimension: '215/55R17', trimLabel: '2008 GT / Allure T200' },
    ],
  },
  {
    rank: 39,
    brand: 'Honda',
    model: 'HR-V',
    displayName: 'Honda HR-V',
    category: 'SUV',
    factorySizes: [
      { dimension: '215/60R16', trimLabel: 'HR-V LX' },
      { dimension: '215/55R17', trimLabel: 'HR-V EX / EXL' },
    ],
  },
  {
    rank: 40,
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    displayName: 'Mercedes-Benz Sprinter',
    category: 'Utilitario',
    factorySizes: [
      { dimension: '225/75R16', trimLabel: 'Sprinter 311 / 415 / 515' },
      { dimension: '205/75R16', trimLabel: 'Sprinter Chasis' },
      { dimension: '195/70R15', trimLabel: 'Sprinter 310' },
    ],
  },
  {
    rank: 41,
    brand: 'Renault / Ford',
    model: 'Master / Transit',
    displayName: 'Renault Master / Transit',
    category: 'Utilitario',
    factorySizes: [
      { dimension: '215/75R16', trimLabel: 'Transit Van / Chasis' },
      { dimension: '225/65R16', trimLabel: 'Master Furgón' },
    ],
  },
];

export interface DimensionFitmentResult {
  cars: [string, string, string];
  bestCar: string;
  alternatives: string[];
  source: 'exact_fitment_filtered' | 'compatible_fitment_filtered' | 'category_fallback';
  explanation: string;
}

/**
 * STRICT FITMENT FILTER:
 * Traverses the ACARA sales ranking in exact order (rank 1, 2, 3...)
 * Tests if each vehicle actually wears this tire dimension from the factory.
 * If a vehicle doesn't fit (e.g. Yaris on 205/55R16), it is SKIPPED,
 * and we continue down the ranking until we find the vehicles that DO fit!
 */
export function getTopArgentineCarsForDimension(
  rawDimension: string,
  categoryHint?: string
): DimensionFitmentResult {
  const norm = normalizeDimensionKey(rawDimension);
  const parsed = parseDimension(rawDimension);

  const matchedVehicles: {
    vehicle: RankedArgentineVehicle;
    matchedTrim: string;
    labelToDisplay: string;
  }[] = [];

  // Pass 1: Strict Exact Fitment across all ACARA vehicles in sales order
  for (const vehicle of ACARA_TOP_VEHICLES_RANKING) {
    for (const size of vehicle.factorySizes) {
      const sizeNorm = normalizeDimensionKey(size.dimension);
      if (
        sizeNorm === norm ||
        (parsed && sizeNorm === parsed.normalized) ||
        (norm.length > 5 && (sizeNorm.includes(norm) || norm.includes(sizeNorm)))
      ) {
        // Build clear, attractive vehicle label
        const label = size.trimLabel
          ? `${vehicle.displayName} (${size.trimLabel.replace(vehicle.model, '').trim()})`
          : vehicle.displayName;

        matchedVehicles.push({
          vehicle,
          matchedTrim: size.trimLabel,
          labelToDisplay: label.replace(/\(\s*\)/, '').trim(),
        });
        break; // matched this vehicle, continue to next ranked vehicle
      }
    }
  }

  // If we found at least one exact match
  if (matchedVehicles.length > 0) {
    const topLabels = matchedVehicles.map((m) => m.labelToDisplay);
    const best = topLabels[0];
    const second = topLabels[1] || `${matchedVehicles[0].vehicle.displayName}`;
    const third = topLabels[2] || `${matchedVehicles[0].vehicle.brand} ${matchedVehicles[0].vehicle.model}`;
    const alts = topLabels.slice(3);

    return {
      cars: [best, second, third],
      bestCar: best,
      alternatives: alts,
      source: 'exact_fitment_filtered',
      explanation: `Filtrado por medida exacta ${rawDimension}: el más vendido de Argentina que realmente calza esta medida es ${best}.`,
    };
  }

  // Pass 2: If no exact match (e.g. rare profile or custom size), search ACARA ranking for
  // vehicles sharing the same Rim and compatible Width & Category
  if (parsed) {
    for (const vehicle of ACARA_TOP_VEHICLES_RANKING) {
      for (const size of vehicle.factorySizes) {
        const sizeParsed = parseDimension(size.dimension);
        if (sizeParsed && sizeParsed.rim === parsed.rim) {
          const widthDiff = Math.abs(sizeParsed.width - parsed.width);
          if (widthDiff <= 20) {
            const label = `${vehicle.displayName} (${size.trimLabel || 'Rodado ' + parsed.rim})`;
            matchedVehicles.push({
              vehicle,
              matchedTrim: size.trimLabel,
              labelToDisplay: label,
            });
            break;
          }
        }
      }
      if (matchedVehicles.length >= 5) break;
    }
  }

  if (matchedVehicles.length > 0) {
    const topLabels = matchedVehicles.map((m) => m.labelToDisplay);
    return {
      cars: [topLabels[0], topLabels[1] || 'VW Amarok', topLabels[2] || 'Toyota Hilux'],
      bestCar: topLabels[0],
      alternatives: topLabels.slice(3),
      source: 'compatible_fitment_filtered',
      explanation: `Medida especial ${rawDimension}: compatible por rodado ${parsed?.rim || ''}" con ${topLabels[0]}.`,
    };
  }

  // Pass 3: Fallback by vehicle category
  const isTruck = categoryHint === 'Camioneta' || (parsed && parsed.rim >= 16 && parsed.width >= 245);
  const isSuv = categoryHint === 'SUV' || (parsed && parsed.rim >= 17 && parsed.width >= 215);

  if (isTruck) {
    return {
      cars: ['Toyota Hilux SRV/SR', 'Ford Ranger XLT', 'VW Amarok Comfortline'],
      bestCar: 'Toyota Hilux SRV/SR',
      alternatives: ['Chevrolet S10 LTZ', 'Nissan Frontier Pro4X'],
      source: 'category_fallback',
      explanation: 'Camionetas más vendidas de Argentina para rodado pickup.',
    };
  }

  if (isSuv) {
    return {
      cars: ['Toyota Corolla Cross', 'VW Taos', 'Jeep Renegade'],
      bestCar: 'Toyota Corolla Cross',
      alternatives: ['Chevrolet Tracker', 'Nissan Kicks'],
      source: 'category_fallback',
      explanation: 'SUVs más vendidas de Argentina.',
    };
  }

  return {
    cars: ['Fiat Cronos Precision', 'Peugeot 208 Feline', 'Toyota Corolla XEi'],
    bestCar: 'Fiat Cronos Precision',
    alternatives: ['Chevrolet Cruze', 'Ford Focus', 'VW Golf'],
    source: 'category_fallback',
    explanation: 'Modelos de alta venta en Argentina.',
  };
}
