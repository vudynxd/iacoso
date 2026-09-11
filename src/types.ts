export type VehicleCategory = 'Auto' | 'SUV / 4x4' | 'Utilitario';

export interface Tire {
  id: string;
  marca: string;
  modelo: string;
  dimensiones: string; // e.g. "205/55 R16"
  rodado: string;      // e.g. "R16"
  categoria: VehicleCategory;
  indice: string;      // e.g. "91V"
  precioContado: number; // Wholesale cash price in ARS ($)
  precioCuota4: number;  // Valor de cada una de las 4 cuotas
  precioCuota20: number; // Valor de cada una de las 20 cuotas
  stock: number;
  codigo?: string;
  descripcion?: string;
  origen?: string; // Nombre de la hoja o página de origen en el Excel
}

export type ColumnKey =
  | 'marca'
  | 'modelo'
  | 'dimensiones'
  | 'rodado'
  | 'categoria'
  | 'precioContado'
  | 'precioCuota4'
  | 'precioCuota20'
  | 'stock';

export interface ColumnFilterState {
  // Set of selected exact values; if null or empty, no filtering on this column
  selectedValues?: string[];
  searchQuery?: string;
  minNumber?: number;
  maxNumber?: number;
}

export interface SortState {
  key: ColumnKey | null;
  direction: 'asc' | 'desc';
}

export type FlyerTheme = 'geometric-balance' | 'dark-racing' | 'amber-industry' | 'clean-minimal' | 'electric-cyan';

export interface FlyerSettings {
  storeName: string;
  subtitle: string;
  promoBadge: string;
  whatsapp: string;
  address: string;
  theme: FlyerTheme;
  highlightCuotas: 'both' | 'cuota4' | 'cuota20';
  showContado: boolean;
  notes: string;
}
