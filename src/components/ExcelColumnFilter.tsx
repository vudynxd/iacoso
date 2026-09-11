import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Filter, ArrowUpAZ, ArrowDownZA, Search, CheckSquare, Square, X, Check } from 'lucide-react';
import { ColumnKey, ColumnFilterState, SortState } from '../types';
import { contextualTextMatch } from '../utils/searchUtils';

interface ExcelColumnFilterProps {
  columnKey: ColumnKey;
  label: string;
  allValues: string[];
  filterState?: ColumnFilterState;
  sortState: SortState;
  isNumeric?: boolean;
  formatValue?: (val: string) => string;
  onApplyFilter: (columnKey: ColumnKey, filter: ColumnFilterState | undefined) => void;
  onApplySort: (columnKey: ColumnKey, direction: 'asc' | 'desc') => void;
  onClearSort: () => void;
}

export const ExcelColumnFilter: React.FC<ExcelColumnFilterProps> = ({
  columnKey,
  label,
  allValues,
  filterState,
  sortState,
  isNumeric = false,
  formatValue,
  onApplyFilter,
  onApplySort,
  onClearSort,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Get distinct unique values with frequencies
  const distinctStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const val of allValues) {
      const clean = val !== undefined && val !== null && String(val).trim() !== '' ? String(val).trim() : '(Vacío)';
      counts.set(clean, (counts.get(clean) || 0) + 1);
    }
    const list = Array.from(counts.entries()).map(([value, count]) => ({
      value,
      count,
    }));
    // Sort items logically
    if (isNumeric) {
      list.sort((a, b) => Number(a.value) - Number(b.value));
    } else {
      list.sort((a, b) => a.value.localeCompare(b.value, 'es', { numeric: true }));
    }
    return list;
  }, [allValues, isNumeric]);

  // Initial selected values in this dropdown
  const [tempSelected, setTempSelected] = useState<Set<string>>(() => {
    if (filterState?.selectedValues) {
      return new Set(filterState.selectedValues);
    }
    return new Set(distinctStats.map((d) => d.value));
  });

  // Calculate and update position of portaled popover relative to button
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = 290;
    const estimatedHeight = 360;

    let left = rect.left;
    // Prevent overflowing off right screen edge
    if (left + popoverWidth > window.innerWidth - 12) {
      left = Math.max(12, rect.right - popoverWidth);
    }
    if (left < 12) {
      left = 12;
    }

    let top = rect.bottom + 4;
    // If not enough room below, open above
    if (top + estimatedHeight > window.innerHeight - 10 && rect.top > estimatedHeight + 10) {
      top = rect.top - estimatedHeight - 4;
    }

    setPopoverCoords({ top, left });
  };

  // Sync tempSelected when opened & position the portal
  useEffect(() => {
    if (isOpen) {
      if (filterState?.selectedValues) {
        setTempSelected(new Set(filterState.selectedValues));
      } else {
        setTempSelected(new Set(distinctStats.map((d) => d.value)));
      }
      setSearchQuery('');
      updatePosition();
    }
  }, [isOpen, filterState, distinctStats]);

  // Close or reposition when scrolling or clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  const isFiltered = useMemo(() => {
    if (!filterState) return false;
    if (filterState.selectedValues && filterState.selectedValues.length < distinctStats.length) {
      return true;
    }
    return false;
  }, [filterState, distinctStats.length]);

  const isCurrentSort = sortState.key === columnKey;

  // Contextual search: find all items matching search query flexibly (without needing exact format)
  const visibleItems = useMemo(() => {
    if (!searchQuery.trim()) return distinctStats;
    return distinctStats.filter((item) => contextualTextMatch(item.value, searchQuery));
  }, [distinctStats, searchQuery]);

  // Handle typing in the search box:
  // USER REQUIREMENT: "quiero que si tipeo un medida todo fuera de eso se de seleccione automáticamente"
  const handleSearchInputChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const matches = distinctStats.filter((item) => contextualTextMatch(item.value, query));
      // Automatically keep ONLY matching items selected; everything outside is deselected!
      setTempSelected(new Set(matches.map((m) => m.value)));
    } else {
      // When search query is cleared, select all items
      setTempSelected(new Set(distinctStats.map((d) => d.value)));
    }
  };

  const visibleSelectedCount = useMemo(() => {
    return visibleItems.filter((item) => tempSelected.has(item.value)).length;
  }, [visibleItems, tempSelected]);

  const allVisibleSelected = visibleItems.length > 0 && visibleSelectedCount === visibleItems.length;

  const toggleSelectAllVisible = () => {
    const next = new Set(tempSelected);
    if (allVisibleSelected) {
      visibleItems.forEach((item) => next.delete(item.value));
    } else {
      visibleItems.forEach((item) => next.add(item.value));
    }
    setTempSelected(next);
  };

  const toggleItem = (val: string) => {
    const next = new Set(tempSelected);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    setTempSelected(next);
  };

  const handleApply = () => {
    if (tempSelected.size === distinctStats.length) {
      onApplyFilter(columnKey, undefined);
    } else {
      onApplyFilter(columnKey, {
        selectedValues: Array.from(tempSelected),
      });
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempSelected(new Set(distinctStats.map((d) => d.value)));
    onApplyFilter(columnKey, undefined);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        id={`filter-btn-${columnKey}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`Filtrar / Ordenar por ${label}`}
        className={`p-1 rounded-none transition-colors flex items-center justify-center border ${
          isFiltered
            ? 'bg-[#262626] text-[#f7f6f2] border-[#262626]'
            : isCurrentSort
            ? 'bg-[#444444] text-[#ffffff] border-[#444444]'
            : 'border-transparent text-[#666666] hover:text-[#111111] hover:bg-[#dcd8cf]'
        }`}
      >
        <Filter className={`w-3 h-3 ${isFiltered ? 'fill-current stroke-1' : ''}`} />
      </button>

      {/* Render via Portal to document.body so it is NEVER clipped by table container overflow or list size */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            id={`filter-popover-${columnKey}`}
            style={{
              position: 'fixed',
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
              zIndex: 9999,
              width: '290px',
            }}
            className="bg-[#fbfbf9] border border-[#cfcbc2] rounded-none shadow-2xl p-3 text-[#262626] text-xs select-none animate-in fade-in duration-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e5e2da]">
              <span className="font-semibold text-xs text-[#262626] flex items-center gap-1.5 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-[#333333]" />
                Filtro: {label}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#666666] hover:text-[#111111] p-0.5 hover:bg-[#eeebe3] transition-colors rounded-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sort Buttons (Excel-like) */}
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <button
                type="button"
                id={`sort-asc-${columnKey}`}
                onClick={() => onApplySort(columnKey, 'asc')}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-none text-xs font-medium border transition-colors ${
                  isCurrentSort && sortState.direction === 'asc'
                    ? 'bg-[#262626] text-[#f7f6f2] border-[#262626]'
                    : 'bg-[#eeebe3] border-[#cfcbc2] text-[#333333] hover:bg-[#e4e0d6]'
                }`}
              >
                <ArrowUpAZ className="w-3.5 h-3.5" />
                {isNumeric ? 'Menor a Mayor' : 'A → Z'}
              </button>
              <button
                type="button"
                id={`sort-desc-${columnKey}`}
                onClick={() => onApplySort(columnKey, 'desc')}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-none text-xs font-medium border transition-colors ${
                  isCurrentSort && sortState.direction === 'desc'
                    ? 'bg-[#262626] text-[#f7f6f2] border-[#262626]'
                    : 'bg-[#eeebe3] border-[#cfcbc2] text-[#333333] hover:bg-[#e4e0d6]'
                }`}
              >
                <ArrowDownZA className="w-3.5 h-3.5" />
                {isNumeric ? 'Mayor a Menor' : 'Z → A'}
              </button>
            </div>

            {/* Contextual Search box inside filter */}
            <div className="relative mb-1.5">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[#777777]" />
              <input
                type="text"
                id={`filter-search-${columnKey}`}
                placeholder={`Buscar en ${label} (ej. 205 55)...`}
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                className="w-full pl-7 pr-7 py-1 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] placeholder-[#888888] focus:outline-none focus:border-[#666666] transition-colors"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchInputChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#333333]"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Helper message indicating auto-selection of matches */}
            {searchQuery.trim() && (
              <div className="text-[10px] text-[#2e7d32] bg-[#edf6ee] border border-[#bddbbd] px-2 py-1 mb-1.5 flex items-center justify-between">
                <span>Coincidencias seleccionadas automáticamente ({visibleItems.length})</span>
                <span className="font-semibold">{tempSelected.size} activas</span>
              </div>
            )}

            {/* Select all / Deselect all visible */}
            <div className="flex items-center justify-between px-1 py-1 mb-1 border-b border-[#e5e2da] text-[11px]">
              <button
                type="button"
                onClick={toggleSelectAllVisible}
                className="flex items-center gap-1.5 text-[#333333] hover:text-[#000000] font-medium"
              >
                {allVisibleSelected ? (
                  <CheckSquare className="w-3.5 h-3.5 text-[#262626]" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-[#888888]" />
                )}
                {searchQuery.trim() ? '(Seleccionar coincidentes)' : '(Seleccionar todo)'}
              </button>
              <span className="text-[#777777] text-[10px]">
                {tempSelected.size} de {distinctStats.length}
              </span>
            </div>

            {/* Value Checklist */}
            <div className="max-h-44 overflow-y-auto space-y-0.5 pr-1 py-1 border border-[#cfcbc2] rounded-none bg-[#ffffff] divide-y divide-[#f0ede6]">
              {visibleItems.length === 0 ? (
                <div className="p-3 text-center text-[#777777] text-[11px]">
                  Sin coincidencias para "{searchQuery}"
                </div>
              ) : (
                visibleItems.map((item) => {
                  const checked = tempSelected.has(item.value);
                  return (
                    <label
                      key={item.value}
                      className="flex items-center justify-between px-2 py-1 hover:bg-[#f2efe8] rounded-none cursor-pointer transition-colors text-[11px]"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItem(item.value)}
                          className="rounded-none border-[#999999] text-[#222222] focus:ring-0 w-3.5 h-3.5 accent-[#222222]"
                        />
                        <span className="truncate text-[#262626]" title={item.value}>
                          {formatValue ? formatValue(item.value) : item.value}
                        </span>
                      </div>
                      <span className="text-[#666666] text-[10px] px-1 py-0.1 bg-[#eeebe3] border border-[#cfcbc2] rounded-none">
                        {item.count}
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-[#e5e2da]">
              <button
                type="button"
                id={`filter-clear-${columnKey}`}
                onClick={handleClear}
                className="text-[#991b1b] hover:text-[#7f1d1d] text-xs font-medium py-0.5 transition-colors"
              >
                Borrar filtro
              </button>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 bg-[#eeebe3] hover:bg-[#e4e0d6] text-[#333333] rounded-none text-xs font-medium transition-colors border border-[#cfcbc2]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  id={`filter-apply-${columnKey}`}
                  onClick={handleApply}
                  className="px-3 py-1 bg-[#262626] hover:bg-[#111111] text-[#f7f6f2] rounded-none text-xs font-medium transition-colors flex items-center gap-1 border border-[#262626]"
                >
                  <Check className="w-3 h-3" />
                  Aplicar ({tempSelected.size})
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
