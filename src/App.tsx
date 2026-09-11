import React, { useState, useMemo, useEffect } from 'react';
import {
  Disc,
  Plus,
  Share2,
  FileText,
  Search,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  X,
  Flame,
} from 'lucide-react';
import { Tire, ColumnKey, ColumnFilterState, SortState } from './types';
import { INITIAL_TIRES } from './data/initialStock';
import { exportCatalogToXlsx, ImportMode } from './utils/excelParser';
import { contextualTireMatch } from './utils/searchUtils';
import { normalizeTiresCuotas } from './utils/formatters';
import { COMPANY_INFO } from './data/companyInfo';
import { CottaLogo, CottaBrandStrip } from './components/CottaLogo';
import { StatsBar } from './components/StatsBar';
import { TireTable } from './components/TireTable';
import { MobileFlyerModal } from './components/MobileFlyerModal';
import { PresupuestoModal } from './components/PresupuestoModal';
import { PromoFlyerModal } from './components/PromoFlyerModal';
import { TireModal } from './components/TireModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { ErrorBoundary } from './components/ErrorBoundary';

const STORAGE_KEY = 'neumaticos_stock_inventory_v1';

export default function App() {
  // Load initial tires from localStorage or fall back to base catalog
  const [tires, setTires] = useState<Tire[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeTiresCuotas(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading inventory from storage:', e);
    }
    return INITIAL_TIRES;
  });

  // Save to localStorage whenever tires change (Real-time persistence)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tires));
    } catch (e) {
      console.error('Error saving inventory to storage:', e);
    }
  }, [tires]);

  // Selected tires for the mobile flyer template generator
  const [selectedTireIds, setSelectedTireIds] = useState<string[]>(() => [
    // Pre-select 2 prominent tires so the user can immediately preview the mobile template!
    'mich-1',
    'bfg-1',
  ]);

  // Excel column filters state
  const [filters, setFilters] = useState<Record<ColumnKey, ColumnFilterState | undefined>>({} as any);

  // Global search query
  const [globalSearch, setGlobalSearch] = useState('');

  // Active brand quick filter
  const [activeBrandFilter, setActiveBrandFilter] = useState<string | null>(null);

  // Sorting state
  const [sortState, setSortState] = useState<SortState>({
    key: null,
    direction: 'asc',
  });

  // Modals state
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);
  const [isPresupuestoModalOpen, setIsPresupuestoModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isTireModalOpen, setIsTireModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTire, setEditingTire] = useState<Tire | null>(null);

  // Notification for import actions
  const [importNotification, setImportNotification] = useState<{
    message: string;
    type: 'success' | 'info';
  } | null>(null);

  // List of existing brands for auto-suggest
  const existingBrands = useMemo(() => {
    const set = new Set<string>();
    tires.forEach((t) => set.add(t.marca));
    return Array.from(set);
  }, [tires]);

  // Handle column filter change
  const handleApplyFilter = (column: ColumnKey, filter: ColumnFilterState | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [column]: filter,
    }));
  };

  // Handle sorting
  const handleApplySort = (column: ColumnKey, direction: 'asc' | 'desc') => {
    setSortState({ key: column, direction });
  };

  const handleClearSort = () => {
    setSortState({ key: null, direction: 'asc' });
  };

  const handleClearAllFilters = () => {
    setFilters({} as any);
    setActiveBrandFilter(null);
    setGlobalSearch('');
  };

  const hasActiveFilters = useMemo(() => {
    const hasColFilters = Object.values(filters).some(
      (f: ColumnFilterState | undefined) => Boolean(f?.selectedValues && f.selectedValues.length > 0)
    );
    return hasColFilters || Boolean(activeBrandFilter) || Boolean(globalSearch.trim());
  }, [filters, activeBrandFilter, globalSearch]);

  // Brand quick pill click
  const handleFilterBrand = (brand: string | null) => {
    setActiveBrandFilter(brand);
  };

  // Stock management actions in real-time
  const handleUpdateStock = (id: string, delta: number) => {
    setTires((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newStock = Math.max(0, (t.stock || 0) + delta);
          return { ...t, stock: newStock };
        }
        return t;
      })
    );
  };

  const handleSetDirectStock = (id: string, newStock: number) => {
    setTires((prev) =>
      prev.map((t) => (t.id === id ? { ...t, stock: Math.max(0, newStock) } : t))
    );
  };

  // Add / Edit Tire
  const handleSaveTire = (tireData: Partial<Tire>) => {
    if (editingTire) {
      // Edit existing
      setTires((prev) =>
        prev.map((t) => (t.id === editingTire.id ? ({ ...t, ...tireData } as Tire) : t))
      );
    } else {
      // Create new
      const newTire: Tire = {
        id: `tire-${Date.now()}`,
        marca: tireData.marca || 'Genérica',
        modelo: tireData.modelo || '',
        dimensiones: tireData.dimensiones || '',
        rodado: tireData.rodado || 'R16',
        categoria: tireData.categoria || 'Auto',
        indice: tireData.indice || '91V',
        precioContado: tireData.precioContado || 0,
        precioCuota4: tireData.precioCuota4 || 0,
        precioCuota20: tireData.precioCuota20 || 0,
        stock: tireData.stock || 0,
        codigo: tireData.codigo || `COD-${Math.floor(1000 + Math.random() * 9000)}`,
        descripcion: tireData.descripcion || '',
      };
      setTires((prev) => [newTire, ...prev]);
    }
  };

  const handleDeleteTire = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este neumático del stock?')) {
      setTires((prev) => prev.filter((t) => t.id !== id));
      setSelectedTireIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleResetToDefaultStock = () => {
    if (
      window.confirm(
        '¿Restablecer el inventario base original con los 30 neumáticos (Michelin, BFGoodrich, Zmax, Fortinr, Onyx, Pace)?'
      )
    ) {
      setTires(INITIAL_TIRES);
      handleClearAllFilters();
    }
  };

  // Multiple selection handlers
  const handleToggleSelectTire = (id: string) => {
    setSelectedTireIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = (ids: string[]) => {
    setSelectedTireIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectAll = () => {
    setSelectedTireIds([]);
  };

  // Handle completed Excel import
  const handleImportComplete = (
    newTires: Tire[],
    summary: {
      mode: ImportMode;
      addedCount: number;
      updatedCount: number;
      summedUnits: number;
      fileName: string;
    }
  ) => {
    setTires(newTires);

    let modeTitle = 'Cargar solo nuevo Excel';
    let detail = '';

    if (summary.mode === 'replace') {
      modeTitle = 'Cargar solo el nuevo Excel';
      detail = `Se cargaron ${summary.addedCount} neumáticos del archivo "${summary.fileName}" reemplazando el catálogo anterior.`;
    } else if (summary.mode === 'merge') {
      modeTitle = 'Fusionar';
      detail = `Se actualizaron ${summary.updatedCount} neumáticos existentes y se sumaron ${summary.addedCount} modelos nuevos al catálogo.`;
    } else {
      modeTitle = 'Sumar Stock';
      detail = `Se sumaron ${summary.summedUnits} unidades de stock a los neumáticos existentes (+ ${summary.addedCount} modelos nuevos añadidos).`;
    }

    setImportNotification({
      message: `¡Importación completada con éxito [Modo: ${modeTitle}]! ${detail}`,
      type: 'success',
    });
  };

  // Export current filtered view as genuine Excel (.xlsx) workbook
  const handleExportExcel = () => {
    exportCatalogToXlsx(filteredAndSortedTires);
  };

  // Filtered & Sorted Tires computation
  const filteredAndSortedTires = useMemo(() => {
    let result = [...tires];

    // Quick brand filter
    if (activeBrandFilter) {
      result = result.filter(
        (t) => t.marca.toLowerCase() === activeBrandFilter.toLowerCase()
      );
    }

    // Contextual global text search across all attributes (sizes, brands, models, codes, prices)
    if (globalSearch.trim()) {
      result = result.filter((t) => contextualTireMatch(t, globalSearch));
    }

    // Excel Column Filters evaluation
    (Object.keys(filters) as ColumnKey[]).forEach((col) => {
      const colFilter = filters[col];
      if (colFilter && colFilter.selectedValues && colFilter.selectedValues.length > 0) {
        const allowed = new Set(colFilter.selectedValues);
        result = result.filter((t) => {
          const val = t[col] !== undefined && t[col] !== null ? String(t[col]) : '(Vacío)';
          return allowed.has(val);
        });
      }
    });

    // Sorting
    if (sortState.key) {
      const key = sortState.key;
      const dir = sortState.direction === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * dir;
        }

        const strA = String(valA || '');
        const strB = String(valB || '');
        return strA.localeCompare(strB, 'es', { numeric: true }) * dir;
      });
    }

    return result;
  }, [tires, activeBrandFilter, globalSearch, filters, sortState]);

  // Selected tires objects for the flyer modal
  const selectedTiresList = useMemo(() => {
    return tires.filter((t) => selectedTireIds.includes(t.id));
  }, [tires, selectedTireIds]);

  return (
    <div className="min-h-screen bg-[#eeebe5] text-[#262626] flex flex-col font-sans">
      {/* Top Navigation Bar - Excel / Figma Ribbon Style */}
      <header className="bg-[#e5e2da] border-b border-[#cfcbc2] sticky top-0 z-40 rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
            {/* Logo and Brand Title - Authentic COTTA Neumáticos Style */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <CottaLogo size="sm" variant="dark" showSubtitle={true} />
              
              {/* Branch Quick Contacts */}
              <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-[#cfcbc2] text-xs">
                <a
                  href={`https://wa.me/${COMPANY_INFO.branches.santaRosa.phoneRaw}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2 py-1 bg-[#f4f2ec] hover:bg-[#eae6dc] border border-[#cfcbc2] transition-colors"
                  title="WhatsApp Santa Rosa"
                >
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span className="font-bold text-[11px] text-[#111111]">Santa Rosa:</span>
                  <span className="font-mono text-[11px] text-[#2e7d32] font-semibold">{COMPANY_INFO.branches.santaRosa.phoneDisplay}</span>
                </a>
                <a
                  href={`https://wa.me/${COMPANY_INFO.branches.america.phoneRaw}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2 py-1 bg-[#f4f2ec] hover:bg-[#eae6dc] border border-[#cfcbc2] transition-colors"
                  title="WhatsApp América"
                >
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span className="font-bold text-[11px] text-[#111111]">América:</span>
                  <span className="font-mono text-[11px] text-[#2e7d32] font-semibold">{COMPANY_INFO.branches.america.phoneDisplay}</span>
                </a>
                <span className="text-[11px] font-semibold text-[#555555] flex items-center gap-1">
                  <span className="px-1 py-0.2 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-[8px] font-bold">IG</span>
                  <span>{COMPANY_INFO.socialHandle}</span>
                </span>
              </div>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Global Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]" />
                <input
                  type="text"
                  id="global-search-input"
                  placeholder="Búsqueda contextual (ej. 205 55 16, fate 16)..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-[#fbfbf9] border border-[#cfcbc2] rounded-none text-xs text-[#262626] placeholder-[#888888] focus:outline-none focus:border-[#666666] transition-colors"
                />
                {globalSearch && (
                  <button
                    type="button"
                    onClick={() => setGlobalSearch('')}
                    title="Borrar búsqueda"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#333333]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Promo Button (placed right next to Presupuesto) */}
              <button
                type="button"
                id="header-promo-button"
                onClick={() => {
                  if (selectedTireIds.length === 0 && filteredAndSortedTires.length > 0) {
                    setSelectedTireIds([filteredAndSortedTires[0].id]);
                  }
                  setIsPromoModalOpen(true);
                }}
                className={`px-3 py-1.5 font-bold text-xs rounded-none flex items-center gap-1.5 border transition-all cursor-pointer ${
                  selectedTireIds.length > 0
                    ? 'bg-[#facc15] hover:bg-[#eab308] text-[#111111] border-[#facc15] shadow-xs'
                    : 'bg-[#f0ede6] hover:bg-[#e4e0d6] text-[#262626] border-[#cfcbc2]'
                }`}
                title="Generar imagen promocional con foto a 45° y los 3 autos más vendidos en Argentina"
              >
                <Flame className={`w-3.5 h-3.5 ${selectedTireIds.length > 0 ? 'text-[#b91c1c]' : 'text-[#d97706]'}`} />
                <span>Promo</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-none border ${
                    selectedTireIds.length > 0
                      ? 'bg-[#111111] text-[#facc15] border-[#111111]'
                      : 'bg-[#e5e2da] text-[#555555] border-[#cfcbc2]'
                  }`}
                >
                  {selectedTireIds.length}
                </span>
              </button>

              {/* Presupuesto Button */}
              <button
                type="button"
                id="header-presupuesto-button"
                onClick={() => setIsPresupuestoModalOpen(true)}
                className={`px-3 py-1.5 font-medium text-xs rounded-none flex items-center gap-1.5 border transition-all ${
                  selectedTireIds.length > 0
                    ? 'bg-[#262626] hover:bg-[#111111] text-[#f7f6f2] border-[#262626]'
                    : 'bg-[#f0ede6] hover:bg-[#e4e0d6] text-[#262626] border-[#cfcbc2]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Presupuesto</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-none border ${
                    selectedTireIds.length > 0
                      ? 'bg-[#f7f6f2] text-[#262626] border-[#f7f6f2]'
                      : 'bg-[#e5e2da] text-[#555555] border-[#cfcbc2]'
                  }`}
                >
                  {selectedTireIds.length}
                </span>
              </button>

              {/* Share / Compartir Button */}
              <button
                type="button"
                id="header-share-button"
                onClick={() => setIsFlyerModalOpen(true)}
                className={`px-3 py-1.5 font-medium text-xs rounded-none flex items-center gap-1.5 border transition-all ${
                  selectedTireIds.length > 0
                    ? 'bg-[#262626] hover:bg-[#111111] text-[#f7f6f2] border-[#262626]'
                    : 'bg-[#f0ede6] hover:bg-[#e4e0d6] text-[#262626] border-[#cfcbc2]'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-none border ${
                    selectedTireIds.length > 0
                      ? 'bg-[#f7f6f2] text-[#262626] border-[#f7f6f2]'
                      : 'bg-[#e5e2da] text-[#555555] border-[#cfcbc2]'
                  }`}
                >
                  {selectedTireIds.length}
                </span>
              </button>

              {/* Add Tire Button */}
              <button
                type="button"
                id="btn-add-tire"
                onClick={() => {
                  setEditingTire(null);
                  setIsTireModalOpen(true);
                }}
                className="px-3 py-1.5 bg-[#262626] hover:bg-[#111111] text-[#f7f6f2] font-medium text-xs rounded-none border border-[#262626] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Neumático</span>
              </button>

              {/* Subir Excel Button */}
              <button
                type="button"
                id="btn-import-excel"
                onClick={() => setIsImportModalOpen(true)}
                title="Subir archivo Excel, verificar celdas y acomodar automáticamente"
                className="px-3 py-1.5 bg-[#f0ede6] hover:bg-[#e4e0d6] text-[#262626] font-medium text-xs rounded-none border border-[#cfcbc2] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-[#2e7d32]" />
                <span className="hidden sm:inline">Subir Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>

              {/* Export Excel Button */}
              <button
                type="button"
                id="btn-export-excel"
                onClick={handleExportExcel}
                title="Descargar catálogo actual en Excel (.xlsx)"
                className="p-1.5 bg-[#f0ede6] hover:bg-[#e4e0d6] border border-[#cfcbc2] text-[#333333] rounded-none transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#2e7d32]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 space-y-3.5 w-full">
        {/* Partner Brands Strip from Business Card */}
        <div className="bg-[#fcfbf9] border border-[#cfcbc2] p-2.5 shadow-2xs">
          <CottaBrandStrip theme="light" />
        </div>

        {/* Import Notification Banner */}
        {importNotification && (
          <div
            id="import-notification-banner"
            className="bg-[#e8f3e9] border border-[#2e7d32]/40 text-[#1e5828] px-3.5 py-2.5 flex items-start justify-between gap-3 text-xs rounded-none shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#2e7d32]" />
              <span className="font-medium leading-relaxed">{importNotification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setImportNotification(null)}
              className="text-[#1e5828] hover:text-[#111111] p-0.5 cursor-pointer flex-shrink-0"
              title="Cerrar notificación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Statistics & Fast Filter Bar */}
        <StatsBar
          totalTires={tires}
          filteredTires={filteredAndSortedTires}
          activeBrandFilter={activeBrandFilter}
          onFilterBrand={handleFilterBrand}
          onClearAllFilters={handleClearAllFilters}
          hasActiveFilters={hasActiveFilters}
          onResetToDefaultStock={handleResetToDefaultStock}
        />

        {/* Informative helper banner in Excel/Figma matte style */}
        <div className="bg-[#e7e4dc] border border-[#cfcbc2] rounded-none px-3.5 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs text-[#444444]">
          <div className="flex items-center gap-2">
            <span className="p-0.5 bg-[#d8d4cb] text-[#333333] border border-[#cfcbc2]">
              <Filter className="w-3 h-3" />
            </span>
            <span>
              <strong>Filtros estilo Excel:</strong> Hacé clic en la lupa de cada encabezado para filtrar marcas, modelos o medidas.
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[#333333]">
            <Share2 className="w-3.5 h-3.5 text-[#222222]" />
            <span>Marcá las casillas de la tabla y usá <strong>Compartir</strong> para enviar presupuestos o descargar imagen.</span>
          </div>
        </div>

        {/* Main Tire Data Table */}
        <TireTable
          tires={filteredAndSortedTires}
          allTires={tires}
          selectedTireIds={selectedTireIds}
          onToggleSelectTire={handleToggleSelectTire}
          onSelectAllVisible={handleSelectAllVisible}
          onDeselectAll={handleDeselectAll}
          filters={filters}
          onApplyFilter={handleApplyFilter}
          sortState={sortState}
          onApplySort={handleApplySort}
          onClearSort={handleClearSort}
          onUpdateStock={handleUpdateStock}
          onSetDirectStock={handleSetDirectStock}
          onEditTire={(tire) => {
            setEditingTire(tire);
            setIsTireModalOpen(true);
          }}
          onDeleteTire={handleDeleteTire}
          onOpenFlyerModal={() => setIsFlyerModalOpen(true)}
          onOpenPresupuestoModal={() => setIsPresupuestoModalOpen(true)}
          onOpenPromoModal={() => setIsPromoModalOpen(true)}
        />
      </main>

      {/* Footer - Cotta Neumáticos Authentic Details */}
      <footer className="bg-[#e5e2da] border-t border-[#cfcbc2] py-4 text-center text-xs text-[#555555] rounded-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 font-bold text-[#111111]">
            <span>COTTA NEUMÁTICOS</span>
            <span className="text-[#888888]">•</span>
            <span className="font-normal text-[#555555]">Ventas por mayor y menor</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span>Santa Rosa (L.P.): <strong className="font-mono text-[#111111]">{COMPANY_INFO.branches.santaRosa.phoneDisplay}</strong></span>
            <span className="text-[#888888]">•</span>
            <span>América (Bs.As.): <strong className="font-mono text-[#111111]">{COMPANY_INFO.branches.america.phoneDisplay}</strong></span>
            <span className="text-[#888888]">•</span>
            <span className="font-medium text-[#111111]">{COMPANY_INFO.socialHandle}</span>
          </div>
        </div>
      </footer>

      {/* Promotional Poster Generator Modal (45° photo, top 3 Argentine cars, editable discounts) */}
      <ErrorBoundary
        fallbackMessage="Error al cargar el generador de promociones y videos"
        onReset={() => setIsPromoModalOpen(false)}
      >
        <PromoFlyerModal
          isOpen={isPromoModalOpen}
          onClose={() => {
            setIsPromoModalOpen(false);
          }}
          selectedTires={selectedTiresList}
          allTires={tires}
        />
      </ErrorBoundary>

      {/* Formal Quotation Generator Modal */}
      <PresupuestoModal
        isOpen={isPresupuestoModalOpen}
        onClose={() => {
          setIsPresupuestoModalOpen(false);
          handleDeselectAll();
        }}
        selectedTires={selectedTiresList}
        onDeselectTire={handleToggleSelectTire}
        onDeselectAll={handleDeselectAll}
      />

      {/* Mobile Vertical Flyer Generator Modal */}
      <MobileFlyerModal
        isOpen={isFlyerModalOpen}
        onClose={() => {
          setIsFlyerModalOpen(false);
          handleDeselectAll();
        }}
        selectedTires={selectedTiresList}
        onDeselectTire={handleToggleSelectTire}
        onDeselectAll={handleDeselectAll}
      />

      {/* Add / Edit Tire Modal */}
      <TireModal
        isOpen={isTireModalOpen}
        onClose={() => {
          setIsTireModalOpen(false);
          setEditingTire(null);
        }}
        onSave={handleSaveTire}
        initialData={editingTire}
        existingBrands={existingBrands}
      />

      {/* Excel Import & Validation Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentTires={tires}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
