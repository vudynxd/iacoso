import { Tire } from '../types';

export const formatCurrency = (val: number): string => {
  if (isNaN(val)) return '$ 0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(val).replace('ARS', '$').trim();
};

export const formatNumber = (val: number): string => {
  if (isNaN(val)) return '0';
  return new Intl.NumberFormat('es-AR').format(val);
};

// Calculate default installments based on wholesale cash price
export const calculateInstallments = (
  precioContado: number,
  recargo4Percent: number = 15,
  recargo20Percent: number = 50
) => {
  const total4 = precioContado * (1 + recargo4Percent / 100);
  const cuota4 = Math.round(total4 / 4);

  const total20 = precioContado * (1 + recargo20Percent / 100);
  const cuota20 = Math.round(total20 / 20);

  return {
    precioCuota4: cuota4,
    precioCuota20: cuota20,
    total4: Math.round(total4),
    total20: Math.round(total20),
  };
};

/**
 * Normaliza las cuotas de neumáticos si fueron guardadas previamente con el precio final total
 * en vez del valor de cada cuota individual.
 * Reglas de detección:
 * - En 4 cuotas: cada cuota representa ~28% del contado (+15%/4). Si precioCuota4 > contado * 0.5,
 *   representa el precio final y se divide por 4.
 * - En 20 cuotas: cada cuota representa ~7.5% del contado (+50%/20). Si precioCuota20 > contado * 0.2,
 *   representa el precio final y se divide por 20.
 * - Si contado es 0 y precioCuota20 > precioCuota4: la cuota mensual de 20 cuotas siempre es menor que la de 4.
 *   Si 20 > 4, indica que son los precios finales totales y se dividen por 4 y 20 respectivamente.
 */
export const normalizeTireCuotas = (t: Tire): Tire => {
  let { precioContado, precioCuota4, precioCuota20 } = t;
  let modified = false;

  if (precioContado > 0) {
    if (precioCuota4 > precioContado * 0.5) {
      precioCuota4 = Math.round(precioCuota4 / 4);
      modified = true;
    }
    if (precioCuota20 > precioContado * 0.2) {
      precioCuota20 = Math.round(precioCuota20 / 20);
      modified = true;
    }
  } else if (precioCuota4 > 0 && precioCuota20 > 0 && precioCuota20 > precioCuota4) {
    precioCuota4 = Math.round(precioCuota4 / 4);
    precioCuota20 = Math.round(precioCuota20 / 20);
    modified = true;
  }

  if (!modified) return t;
  return {
    ...t,
    precioCuota4,
    precioCuota20,
  };
};

export const normalizeTiresCuotas = (tires: Tire[]): Tire[] => {
  return tires.map(normalizeTireCuotas);
};

export const getBrandBadgeStyle = (brand: string) => {
  if (!brand || !brand.trim()) {
    return {
      bg: 'bg-transparent text-[#999999] border-transparent rounded-none',
      accent: '#999999',
      highlight: '#ffffff',
      name: '',
    };
  }

  const normalized = brand.toLowerCase().trim();
  switch (normalized) {
    case 'michelin':
      return {
        bg: 'bg-[#e4ebf2] text-[#1e3a5f] border-[#c0cfdf] rounded-none',
        accent: '#1e3a5f',
        highlight: '#ffffff',
        name: 'Michelin',
      };
    case 'bfgoodrich':
      return {
        bg: 'bg-[#f8e7e7] text-[#781f1f] border-[#e2b8b8] rounded-none',
        accent: '#781f1f',
        highlight: '#ffffff',
        name: 'BFGoodrich',
      };
    case 'pirelli':
      return {
        bg: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a] rounded-none',
        accent: '#92400e',
        highlight: '#ffffff',
        name: 'Pirelli',
      };
    case 'bridgestone':
      return {
        bg: 'bg-[#fee2e2] text-[#991b1b] border-[#fca5a5] rounded-none',
        accent: '#991b1b',
        highlight: '#ffffff',
        name: 'Bridgestone',
      };
    case 'goodyear':
    case 'good year':
      return {
        bg: 'bg-[#fef9c3] text-[#854d0e] border-[#fef08a] rounded-none',
        accent: '#854d0e',
        highlight: '#ffffff',
        name: 'Goodyear',
      };
    case 'continental':
      return {
        bg: 'bg-[#ffedd5] text-[#9a3412] border-[#fed7aa] rounded-none',
        accent: '#9a3412',
        highlight: '#ffffff',
        name: 'Continental',
      };
    case 'firestone':
      return {
        bg: 'bg-[#ffe4e6] text-[#be123c] border-[#fecdd3] rounded-none',
        accent: '#be123c',
        highlight: '#ffffff',
        name: 'Firestone',
      };
    case 'fate':
    case 'fatecargo':
      return {
        bg: 'bg-[#dbeafe] text-[#1e40af] border-[#bfdbfe] rounded-none',
        accent: '#1e40af',
        highlight: '#ffffff',
        name: 'Fate',
      };
    case 'dunlop':
      return {
        bg: 'bg-[#fef08a] text-[#713f12] border-[#fde047] rounded-none',
        accent: '#713f12',
        highlight: '#ffffff',
        name: 'Dunlop',
      };
    case 'hankook':
      return {
        bg: 'bg-[#fae8ff] text-[#86198f] border-[#f5d0fe] rounded-none',
        accent: '#86198f',
        highlight: '#ffffff',
        name: 'Hankook',
      };
    case 'yokohama':
      return {
        bg: 'bg-[#e0e7ff] text-[#3730a3] border-[#c7d2fe] rounded-none',
        accent: '#3730a3',
        highlight: '#ffffff',
        name: 'Yokohama',
      };
    case 'kumho':
      return {
        bg: 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1] rounded-none',
        accent: '#334155',
        highlight: '#ffffff',
        name: 'Kumho',
      };
    case 'zmax':
      return {
        bg: 'bg-[#18181b] text-[#ffffff] border-[#ef4444] rounded-none',
        accent: '#ef4444',
        highlight: '#ffffff',
        name: 'Zmax',
      };
    case 'fortinr':
    case 'fortune':
      return {
        bg: 'bg-[#f1f5f9] text-[#0f172a] border-[#0284c7] rounded-none',
        accent: '#0284c7',
        highlight: '#ffffff',
        name: 'Fortune',
      };
    case 'onyx':
      return {
        bg: 'bg-[#eff6ff] text-[#1d4ed8] border-[#93c5fd] rounded-none',
        accent: '#1d4ed8',
        highlight: '#ffffff',
        name: 'Onyx',
      };
    case 'pace':
      return {
        bg: 'bg-[#fff7ed] text-[#ea580c] border-[#fdba74] rounded-none',
        accent: '#ea580c',
        highlight: '#ffffff',
        name: 'Pace',
      };
    default:
      return {
        bg: 'bg-[#eeebe3] text-[#333333] border-[#cfcbc2] rounded-none',
        accent: '#333333',
        highlight: '#ffffff',
        name: brand,
      };
  }
};
