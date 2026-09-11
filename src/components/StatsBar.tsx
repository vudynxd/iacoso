import React from 'react';
import { Layers, DollarSign, PackageCheck, AlertTriangle, RotateCcw, FilterX } from 'lucide-react';
import { Tire } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface StatsBarProps {
  totalTires: Tire[];
  filteredTires: Tire[];
  activeBrandFilter: string | null;
  onFilterBrand: (brand: string | null) => void;
  onClearAllFilters: () => void;
  hasActiveFilters: boolean;
  onResetToDefaultStock: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalTires,
  filteredTires,
  activeBrandFilter,
  onFilterBrand,
  onClearAllFilters,
  hasActiveFilters,
  onResetToDefaultStock,
}) => {
  // Aggregate calculations
  const totalStockUnits = totalTires.reduce((acc, t) => acc + (t.stock || 0), 0);
  const totalStockValue = totalTires.reduce((acc, t) => acc + (t.stock || 0) * t.precioContado, 0);
  const lowStockCount = totalTires.filter((t) => (t.stock || 0) <= 8).length;

  const brands = ['Michelin', 'BFGoodrich', 'Zmax', 'Fortinr', 'Onyx', 'Pace'];

  return (
    <div className="space-y-2.5">
      {/* Top metrics cards - Excel / Figma Property Panels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Models */}
        <div className="bg-[#fbfbf9] border border-[#cfcbc2] rounded-none p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#e8e5dc] text-[#333333] border border-[#cfcbc2] flex items-center justify-center flex-shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="text-[11px] text-[#666666] font-medium block">
              Modelos en Catálogo
            </span>
            <span className="text-lg font-bold text-[#262626] tracking-tight">
              {totalTires.length}{' '}
              <span className="text-[11px] font-normal text-[#777777]">
                ({filteredTires.length} visibles)
              </span>
            </span>
          </div>
        </div>

        {/* Total Stock in units */}
        <div className="bg-[#fbfbf9] border border-[#cfcbc2] rounded-none p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#e2ede3] text-[#245828] border border-[#bcd3be] flex items-center justify-center flex-shrink-0">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="text-[11px] text-[#666666] font-medium block">
              Stock Total (Cubiertas)
            </span>
            <span className="text-lg font-bold text-[#262626] tracking-tight">
              {formatNumber(totalStockUnits)}{' '}
              <span className="text-[11px] font-normal text-[#777777]">unid.</span>
            </span>
          </div>
        </div>

        {/* Inventory Valuation */}
        <div className="bg-[#fbfbf9] border border-[#cfcbc2] rounded-none p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#e6e7eb] text-[#2d3a4b] border border-[#c4c7d0] flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="text-[11px] text-[#666666] font-medium block">
              Total Valorizado (Contado)
            </span>
            <span className="text-lg font-bold text-[#262626] tracking-tight">
              {formatCurrency(totalStockValue)}
            </span>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-[#fbfbf9] border border-[#cfcbc2] rounded-none p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#faeed8] text-[#825410] border border-[#e4cca4] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="text-[11px] text-[#666666] font-medium block">
              Bajo Stock (≤ 8 un.)
            </span>
            <span className="text-lg font-bold text-[#825410] tracking-tight">
              {lowStockCount}{' '}
              <span className="text-[11px] font-normal text-[#777777]">críticos</span>
            </span>
          </div>
        </div>
      </div>

      {/* Brand Fast-Filter Tabs & Actions bar - Excel Ribbon style */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#fbfbf9] border border-[#cfcbc2] rounded-none">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] font-semibold text-[#666666] mr-1 hidden sm:inline uppercase tracking-wider">
            Marcas:
          </span>
          <button
            type="button"
            onClick={() => onFilterBrand(null)}
            className={`px-2.5 py-1 text-xs font-medium rounded-none transition-all ${
              activeBrandFilter === null
                ? 'bg-[#262626] text-[#f7f6f2] border border-[#262626]'
                : 'bg-[#eeebe3] hover:bg-[#e4e0d6] text-[#333333] border border-[#cfcbc2]'
            }`}
          >
            Todas ({totalTires.length})
          </button>

          {brands.map((b) => {
            const count = totalTires.filter((t) => t.marca.toLowerCase() === b.toLowerCase()).length;
            const isSelected = activeBrandFilter?.toLowerCase() === b.toLowerCase();
            return (
              <button
                key={b}
                type="button"
                onClick={() => onFilterBrand(isSelected ? null : b)}
                className={`px-2.5 py-1 text-xs font-medium rounded-none transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#262626] text-[#f7f6f2] border-[#262626]'
                    : 'bg-[#eeebe3] hover:bg-[#e4e0d6] text-[#333333] border-[#cfcbc2]'
                }`}
              >
                <span>{b}</span>
                <span className={`text-[10px] px-1 py-0.1 rounded-none border ${
                  isSelected ? 'bg-[#3b3b3b] text-[#ffffff] border-[#3b3b3b]' : 'bg-[#e0dcd3] text-[#555555] border-[#ccc7bd]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          {hasActiveFilters && (
            <button
              type="button"
              id="clear-all-filters-btn"
              onClick={onClearAllFilters}
              className="px-2.5 py-1 bg-[#faeceb] hover:bg-[#f5dad8] text-[#991b1b] border border-[#e8b5b2] rounded-none text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <FilterX className="w-3 h-3" />
              Limpiar Filtros
            </button>
          )}

          <button
            type="button"
            onClick={onResetToDefaultStock}
            title="Restablecer stock base original de 30 neumáticos"
            className="px-2.5 py-1 bg-[#eeebe3] hover:bg-[#e4e0d6] border border-[#cfcbc2] text-[#444444] rounded-none text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-[#666666]" />
            <span className="hidden md:inline">Restablecer Base</span>
          </button>
        </div>
      </div>
    </div>
  );
};
