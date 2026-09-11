import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Share2,
  FileText,
  Download,
  Car,
  Truck,
  Flame,
} from 'lucide-react';
import { Tire, ColumnKey, ColumnFilterState, SortState } from '../types';
import { formatCurrency, getBrandBadgeStyle } from '../utils/formatters';
import { ExcelColumnFilter } from './ExcelColumnFilter';

interface TireTableProps {
  tires: Tire[];
  allTires: Tire[];
  selectedTireIds: string[];
  onToggleSelectTire: (id: string) => void;
  onSelectAllVisible: (ids: string[]) => void;
  onDeselectAll: () => void;
  filters: Record<ColumnKey, ColumnFilterState | undefined>;
  onApplyFilter: (columnKey: ColumnKey, filter: ColumnFilterState | undefined) => void;
  sortState: SortState;
  onApplySort: (columnKey: ColumnKey, direction: 'asc' | 'desc') => void;
  onClearSort: () => void;
  onUpdateStock: (id: string, delta: number) => void;
  onSetDirectStock: (id: string, newStock: number) => void;
  onEditTire: (tire: Tire) => void;
  onDeleteTire: (id: string) => void;
  onOpenFlyerModal: () => void;
  onOpenPresupuestoModal?: () => void;
  onOpenPromoModal?: () => void;
}

export const TireTable: React.FC<TireTableProps> = ({
  tires,
  allTires,
  selectedTireIds,
  onToggleSelectTire,
  onSelectAllVisible,
  onDeselectAll,
  filters,
  onApplyFilter,
  sortState,
  onApplySort,
  onClearSort,
  onUpdateStock,
  onSetDirectStock,
  onEditTire,
  onDeleteTire,
  onOpenFlyerModal,
  onOpenPresupuestoModal,
  onOpenPromoModal,
}) => {
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<string>('');

  const visibleIds = tires.map((t) => t.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedTireIds.includes(id));
  const someVisibleSelected =
    visibleIds.some((id) => selectedTireIds.includes(id)) && !allVisibleSelected;

  const handleMasterCheckboxToggle = () => {
    if (allVisibleSelected) {
      onDeselectAll();
    } else {
      onSelectAllVisible(visibleIds);
    }
  };

  const startEditStock = (t: Tire) => {
    setEditingStockId(t.id);
    setTempStockValue(String(t.stock));
  };

  const commitEditStock = (id: string) => {
    const val = parseInt(tempStockValue, 10);
    if (!isNaN(val) && val >= 0) {
      onSetDirectStock(id, val);
    }
    setEditingStockId(null);
  };

  // Extract distinct column values from total dataset for Excel checklist
  const getDistinctValues = (key: ColumnKey): string[] => {
    return allTires.map((t) => {
      const val = t[key];
      return val !== undefined && val !== null ? String(val) : '';
    });
  };

  return (
    <div className="bg-[#fbfbf9] border border-[#cfcbc2] rounded-none shadow-none flex flex-col min-h-[500px]">
      {/* Selection Action Header - Appears when items are selected */}
      {selectedTireIds.length > 0 && (
        <div
          id="selection-action-bar"
          className="bg-[#262626] text-[#f7f6f2] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs rounded-none border-b border-[#1c1c1c]"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-[#74c987] rounded-none animate-pulse" />
            <span className="font-semibold text-[#f7f6f2]">
              {selectedTireIds.length}{' '}
              {selectedTireIds.length === 1 ? 'neumático seleccionado' : 'neumáticos seleccionados'}
            </span>
            <span className="text-[#a8a8a8] hidden sm:inline">para compartir o presupuestar</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPromoModal && (
              <button
                type="button"
                id="open-promo-selection-btn"
                onClick={onOpenPromoModal}
                className="px-3 py-1 bg-[#facc15] hover:bg-[#eab308] text-[#111111] font-black text-xs rounded-none transition-colors flex items-center gap-1.5 border border-[#facc15] shadow-xs"
                title="Generar cartel promocional con foto a 45° y autos más vendidos"
              >
                <Flame className="w-3.5 h-3.5 text-[#b91c1c]" />
                <span>Promo</span>
              </button>
            )}
            {onOpenPresupuestoModal && (
              <button
                type="button"
                id="open-presupuesto-btn"
                onClick={onOpenPresupuestoModal}
                className="px-3 py-1 bg-[#262626] hover:bg-[#111111] text-[#f7f6f2] font-semibold text-xs rounded-none transition-colors flex items-center gap-1.5 border border-[#555555] shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#74c987]" />
                Descargar Presupuesto (PDF)
              </button>
            )}
            <button
              type="button"
              id="open-flyer-btn"
              onClick={onOpenFlyerModal}
              className="px-3 py-1 bg-[#f0ede6] hover:bg-[#ffffff] text-[#262626] font-semibold text-xs rounded-none transition-colors flex items-center gap-1.5 border border-[#cfcbc2]"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartir Selección
            </button>
            <button
              type="button"
              onClick={onDeselectAll}
              className="px-2.5 py-1 bg-[#3a3a3a] hover:bg-[#484848] text-[#cccccc] text-xs rounded-none transition-colors"
            >
              Deseleccionar
            </button>
          </div>
        </div>
      )}

      {/* Main Table Scroll Container - Excel Grid View */}
      <div className="overflow-x-auto overflow-y-auto min-h-[420px] max-h-[660px] bg-[#fbfbf9] pb-8">
        <table className="w-full text-left text-xs border-collapse select-text">
          {/* Table Header with Excel Filter Dropdowns */}
          <thead className="bg-[#e5e2da] sticky top-0 z-30 text-[#262626] font-semibold border-b border-[#cfcbc2] text-[11px]">
            <tr>
              {/* Checkbox Column */}
              <th className="p-2 w-9 text-center border-r border-[#cfcbc2]">
                <button
                  type="button"
                  id="select-all-visible-checkbox"
                  onClick={handleMasterCheckboxToggle}
                  className="p-1 hover:bg-[#d8d4cb] rounded-none text-[#555555] transition-colors"
                  title={allVisibleSelected ? 'Deseleccionar todos' : 'Seleccionar visibles'}
                >
                  {allVisibleSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-[#262626]" />
                  ) : someVisibleSelected ? (
                    <div className="w-3.5 h-3.5 bg-[#d8d4cb] border border-[#262626] rounded-none flex items-center justify-center">
                      <div className="w-2 h-0.5 bg-[#262626]" />
                    </div>
                  ) : (
                    <Square className="w-3.5 h-3.5 text-[#888888]" />
                  )}
                </button>
              </th>

              {/* Marca */}
              <th className="p-2 min-w-[125px] border-r border-[#cfcbc2] uppercase tracking-wider text-[#333333]">
                <div className="flex items-center justify-between gap-1">
                  <span>Marca</span>
                  <ExcelColumnFilter
                    columnKey="marca"
                    label="Marca"
                    allValues={getDistinctValues('marca')}
                    filterState={filters.marca}
                    sortState={sortState}
                    onApplyFilter={onApplyFilter}
                    onApplySort={onApplySort}
                    onClearSort={onClearSort}
                  />
                </div>
              </th>

              {/* Modelo */}
              <th className="p-2 min-w-[145px] border-r border-[#cfcbc2] uppercase tracking-wider text-[#333333]">
                <div className="flex items-center justify-between gap-1">
                  <span>Modelo</span>
                  <ExcelColumnFilter
                    columnKey="modelo"
                    label="Modelo"
                    allValues={getDistinctValues('modelo')}
                    filterState={filters.modelo}
                    sortState={sortState}
                    onApplyFilter={onApplyFilter}
                    onApplySort={onApplySort}
                    onClearSort={onClearSort}
                  />
                </div>
              </th>

              {/* Dimensiones / Medida */}
              <th className="p-2 min-w-[135px] border-r border-[#cfcbc2] uppercase tracking-wider text-[#333333]">
                <div className="flex items-center justify-between gap-1">
                  <span>Dimensión</span>
                  <ExcelColumnFilter
                    columnKey="dimensiones"
                    label="Dimensiones"
                    allValues={getDistinctValues('dimensiones')}
                    filterState={filters.dimensiones}
                    sortState={sortState}
                    onApplyFilter={onApplyFilter}
                    onApplySort={onApplySort}
                    onClearSort={onClearSort}
                  />
                </div>
              </th>

              {/* Rodado */}
              <th className="p-2 min-w-[80px] border-r border-[#cfcbc2] uppercase tracking-wider text-[#333333]">
                <div className="flex items-center justify-between gap-1">
                  <span>Rodado</span>
                  <ExcelColumnFilter
                    columnKey="rodado"
                    label="Rodado"
                    allValues={getDistinctValues('rodado')}
                    filterState={filters.rodado}
                    sortState={sortState}
                    onApplyFilter={onApplyFilter}
                    onApplySort={onApplySort}
                    onClearSort={onClearSort}
                  />
                </div>
              </th>

              {/* Categoría */}
              <th className="p-2 min-w-[105px] border-r border-[#cfcbc2] uppercase tracking-wider text-[#333333]">
                <div className="flex items-center justify-between gap-1">
                  <span>Categoría</span>
                  <ExcelColumnFilter
                    columnKey="categoria"
                    label="Categoría"
                    allValues={getDistinctValues('categoria')}
                    filterState={filters.categoria}
                    sortState={sortState}
                    onApplyFilter={onApplyFilter}
                    onApplySort={onApplySort}
                    onClearSort={onClearSort}
                  />
                </div>
              </th>

              {/* Precio Mayorista Contado */}
              <th className="p-2 min-w-[140px] text-right border-r border-[#cfcbc2] uppercase tracking-wider text-[#333333]">
                <div className="flex items-center justify-end gap-1">
                  <span>Contado</span>
                  <ExcelColumnFilter
                    columnKey="precioContado"
                    label="Precio Contado"
                    allValues={getDistinctValues('precioContado')}
                    filterState={filters.precioContado}
                    sortState={sortState}
                    isNumeric={true}
                    onApplyFilter={onApplyFilter}
                    onApplySort={onApplySort}
                    onClearSort={onClearSort}
                  />
                </div>
              </th>

              {/* 4 Cuotas */}
              <th className="p-2 min-w-[130px] text-right border-r border-[#cfcbc2] uppercase tracking-wider text-[#333333]">
                <div className="flex items-center justify-end gap-1">
                  <div className="text-right">
                    <span>4 Cuotas</span>
                    <span className="block text-[8px] text-[#15803d] font-bold normal-case tracking-normal leading-tight">P. Final (Bco. Pampa)</span>
                  </div>
                  <ExcelColumnFilter
                    columnKey="precioCuota4"
                    label="4 Cuotas"
                    allValues={getDistinctValues('precioCuota4')}
                    filterState={filters.precioCuota4}
                    sortState={sortState}
                    isNumeric={true}
                    formatValue={(val) => {
                      const n = Number(val);
                      return !isNaN(n) && n > 0 ? `${formatCurrency(n * 4)} (4x ${formatCurrency(n)})` : val;
                    }}
                    onApplyFilter={onApplyFilter}
                    onApplySort={onApplySort}
                    onClearSort={onClearSort}
                  />
                </div>
              </th>

              {/* 20 Cuotas */}
              <th className="p-2 min-w-[130px] text-right border-r border-[#cfcbc2] uppercase tracking-wider text-[#333333]">
                <div className="flex items-center justify-end gap-1">
                  <div className="text-right">
                    <span>20 Cuotas</span>
                    <span className="block text-[8px] text-[#15803d] font-bold normal-case tracking-normal leading-tight">P. Final (Bco. Pampa)</span>
                  </div>
                  <ExcelColumnFilter
                    columnKey="precioCuota20"
                    label="20 Cuotas"
                    allValues={getDistinctValues('precioCuota20')}
                    filterState={filters.precioCuota20}
                    sortState={sortState}
                    isNumeric={true}
                    formatValue={(val) => {
                      const n = Number(val);
                      return !isNaN(n) && n > 0 ? `${formatCurrency(n * 20)} (20x ${formatCurrency(n)})` : val;
                    }}
                    onApplyFilter={onApplyFilter}
                    onApplySort={onApplySort}
                    onClearSort={onClearSort}
                  />
                </div>
              </th>

              {/* Stock en tiempo real */}
              <th className="p-2 min-w-[140px] text-center border-r border-[#cfcbc2] uppercase tracking-wider text-[#333333]">
                <div className="flex items-center justify-center gap-1">
                  <span>Stock</span>
                  <ExcelColumnFilter
                    columnKey="stock"
                    label="Stock"
                    allValues={getDistinctValues('stock')}
                    filterState={filters.stock}
                    sortState={sortState}
                    isNumeric={true}
                    onApplyFilter={onApplyFilter}
                    onApplySort={onApplySort}
                    onClearSort={onClearSort}
                  />
                </div>
              </th>

              {/* Acciones */}
              <th className="p-2 w-16 text-center uppercase tracking-wider text-[#333333]">
                Acción
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#e5e2da]">
            {tires.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-[#666666]">
                  <div className="max-w-md mx-auto space-y-1.5">
                    <p className="text-xs font-semibold text-[#262626]">
                      No hay neumáticos que coincidan con los filtros aplicados.
                    </p>
                    <p className="text-[11px] text-[#777777]">
                      Ajustá los filtros de columna o hacé clic en &quot;Limpiar Filtros&quot;.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              tires.map((tire) => {
                const isSelected = selectedTireIds.includes(tire.id);
                const brandStyle = getBrandBadgeStyle(tire.marca);

                // Stock status styling
                const isLowStock = tire.stock <= 8 && tire.stock > 0;
                const isOutOfStock = tire.stock === 0;

                return (
                  <tr
                    key={tire.id}
                    id={`tire-row-${tire.id}`}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-[#eae6dd] font-medium'
                        : 'bg-[#fbfbf9] hover:bg-[#f2efe8]'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-2 text-center border-r border-[#cfcbc2]">
                      <button
                        type="button"
                        id={`select-tire-${tire.id}`}
                        onClick={() => onToggleSelectTire(tire.id)}
                        className="p-1 text-[#666666] hover:text-[#111111] rounded-none transition-colors"
                        title={isSelected ? 'Deseleccionar' : 'Seleccionar'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#262626]" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-[#aaaaaa] hover:text-[#555555]" />
                        )}
                      </button>
                    </td>

                    {/* Marca Badge */}
                    <td className="p-2 border-r border-[#cfcbc2]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-none border ${brandStyle.bg}`}
                        >
                          {tire.marca}
                        </span>
                      </div>
                    </td>

                    {/* Modelo & Code */}
                    <td className="p-2 border-r border-[#cfcbc2]">
                      <div className="font-semibold text-[#262626] truncate" title={tire.modelo}>
                        {tire.modelo}
                      </div>
                      {tire.codigo && (
                        <div className="text-[10px] text-[#777777] font-mono">{tire.codigo}</div>
                      )}
                    </td>

                    {/* Dimensiones */}
                    <td className="p-2 border-r border-[#cfcbc2]">
                      <span className="font-mono font-semibold text-[#262626] bg-[#eeebe3] px-1.5 py-0.5 rounded-none border border-[#d5d1c7] text-xs">
                        {tire.dimensiones}
                      </span>
                      {tire.indice && (
                        <span className="text-[10px] text-[#666666] font-mono ml-1">
                          ({tire.indice})
                        </span>
                      )}
                    </td>

                    {/* Rodado */}
                    <td className="p-2 border-r border-[#cfcbc2]">
                      <span className="font-mono text-[#333333] font-semibold">{tire.rodado}</span>
                    </td>

                    {/* Categoría */}
                    <td className="p-2 border-r border-[#cfcbc2]">
                      <span className="inline-flex items-center gap-1 text-[#555555] text-xs">
                        {tire.categoria === 'SUV / 4x4' ? (
                          <Truck className="w-3.5 h-3.5 text-[#777777]" />
                        ) : tire.categoria === 'Utilitario' ? (
                          <Truck className="w-3.5 h-3.5 text-[#777777]" />
                        ) : (
                          <Car className="w-3.5 h-3.5 text-[#777777]" />
                        )}
                        {tire.categoria}
                      </span>
                    </td>

                    {/* Precio Contado Mayorista */}
                    <td className="p-2 text-right border-r border-[#cfcbc2]">
                      <span className="font-mono font-bold text-[#262626] text-xs">
                        {formatCurrency(tire.precioContado)}
                      </span>
                    </td>

                    {/* 4 Cuotas - Precio Final en la lista */}
                    <td className="p-2 text-right border-r border-[#cfcbc2]">
                      <div className="font-mono font-bold text-[#111111] text-xs">
                        {tire.precioCuota4 > 0 ? formatCurrency(tire.precioCuota4 * 4) : '—'}
                      </div>
                      <div className="text-[10px] text-[#15803d] font-mono font-medium">
                        {tire.precioCuota4 > 0 ? `4x ${formatCurrency(tire.precioCuota4)}` : ''}
                      </div>
                    </td>

                    {/* 20 Cuotas - Precio Final en la lista */}
                    <td className="p-2 text-right border-r border-[#cfcbc2]">
                      <div className="font-mono font-bold text-[#111111] text-xs">
                        {tire.precioCuota20 > 0 ? formatCurrency(tire.precioCuota20 * 20) : '—'}
                      </div>
                      <div className="text-[10px] text-[#15803d] font-mono font-medium">
                        {tire.precioCuota20 > 0 ? `20x ${formatCurrency(tire.precioCuota20)}` : ''}
                      </div>
                    </td>

                    {/* Real-time Stock controls */}
                    <td className="p-2 text-center border-r border-[#cfcbc2]">
                      <div className="flex items-center justify-center gap-1">
                        {/* Minus button */}
                        <button
                          type="button"
                          onClick={() => onUpdateStock(tire.id, -1)}
                          disabled={tire.stock <= 0}
                          title="Restar 1 unidad"
                          className="w-5 h-5 rounded-none bg-[#eeebe3] hover:bg-[#e4e0d6] text-[#333333] border border-[#cfcbc2] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        {/* Editable Stock Badge */}
                        {editingStockId === tire.id ? (
                          <input
                            type="number"
                            min="0"
                            autoFocus
                            value={tempStockValue}
                            onChange={(e) => setTempStockValue(e.target.value)}
                            onBlur={() => commitEditStock(tire.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEditStock(tire.id);
                              if (e.key === 'Escape') setEditingStockId(null);
                            }}
                            className="w-10 px-1 py-0 bg-white border border-[#262626] rounded-none text-center text-xs font-mono font-bold text-[#262626] focus:outline-none"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditStock(tire)}
                            title="Clic para editar stock"
                            className={`min-w-[36px] px-1.5 py-0.5 font-mono font-bold text-xs rounded-none border transition-colors ${
                              isOutOfStock
                                ? 'bg-[#faeceb] text-[#991b1b] border-[#e8b5b2]'
                                : isLowStock
                                ? 'bg-[#faeed8] text-[#825410] border-[#e4cca4]'
                                : 'bg-[#eeebe3] text-[#333333] border-[#cfcbc2] hover:bg-[#e4e0d6]'
                            }`}
                          >
                            {tire.stock}
                          </button>
                        )}

                        {/* Plus button */}
                        <button
                          type="button"
                          onClick={() => onUpdateStock(tire.id, 1)}
                          title="Sumar 1 unidad"
                          className="w-5 h-5 rounded-none bg-[#eeebe3] hover:bg-[#e4e0d6] text-[#333333] border border-[#cfcbc2] flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        {/* +4 quick button */}
                        <button
                          type="button"
                          onClick={() => onUpdateStock(tire.id, 4)}
                          title="Sumar juego de 4 (+4)"
                          className="px-1 py-0.5 text-[10px] font-semibold bg-[#e0dcd3] hover:bg-[#d5d0c5] text-[#262626] border border-[#cfcbc2] rounded-none transition-colors"
                        >
                          +4
                        </button>
                      </div>

                      {/* Low stock tag */}
                      {isOutOfStock ? (
                        <span className="text-[9px] text-[#991b1b] font-medium block mt-0.5">
                          Agotado
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[9px] text-[#825410] font-medium block mt-0.5">
                          Bajo stock
                        </span>
                      ) : null}
                    </td>

                    {/* Actions */}
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          id={`edit-tire-${tire.id}`}
                          onClick={() => onEditTire(tire)}
                          title="Editar neumático"
                          className="p-1 rounded-none text-[#555555] hover:text-[#111111] hover:bg-[#e8e5dc] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id={`delete-tire-${tire.id}`}
                          onClick={() => onDeleteTire(tire.id)}
                          title="Eliminar del stock"
                          className="p-1 rounded-none text-[#777777] hover:text-[#991b1b] hover:bg-[#faeceb] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info - Excel Status Bar Style */}
      <div className="px-4 py-2 bg-[#e5e2da] border-t border-[#cfcbc2] flex flex-wrap items-center justify-between gap-2 text-xs text-[#555555] rounded-none">
        <div>
          Mostrando <span className="font-semibold text-[#262626]">{tires.length}</span> de{' '}
          <span className="font-semibold text-[#262626]">{allTires.length}</span> filas
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-none bg-[#cfcbc2]" /> Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-none bg-[#e4cca4] border border-[#b89c68]" /> Bajo Stock (≤ 8)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-none bg-[#e8b5b2] border border-[#a86561]" /> Agotado
          </span>
        </div>
      </div>
    </div>
  );
};
