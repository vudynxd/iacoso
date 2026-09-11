import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Layers,
  PlusCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Loader2,
  FileCheck,
  Info,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Tire } from '../types';
import {
  parseExcelFile,
  applyImportMode,
  downloadSampleExcelTemplate,
  VerificationReport,
  ImportMode,
  ColumnMappingResult,
  reparseWithCustomMapping,
  CuotasPolicy,
  changeActiveSheetView,
  toggleSheetSelection,
} from '../utils/excelParser';
import { formatCurrency } from '../utils/formatters';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTires: Tire[];
  onImportComplete: (
    newTires: Tire[],
    summary: {
      mode: ImportMode;
      addedCount: number;
      updatedCount: number;
      summedUnits: number;
      fileName: string;
    }
  ) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  currentTires,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [selectedMode, setSelectedMode] = useState<ImportMode>('merge');
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvancedMapping, setShowAdvancedMapping] = useState(true);
  const [cuotasPolicy, setCuotasPolicy] = useState<CuotasPolicy>('use_detected');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setError(null);
    setIsLoading(true);
    try {
      const parsedReport = await parseExcelFile(selectedFile);
      if (parsedReport.validRowsCount === 0) {
        throw new Error(
          'No se encontraron filas de neumáticos válidas con marca o medida en el archivo.'
        );
      }
      setFile(selectedFile);
      setReport(parsedReport);
      setCuotasPolicy(parsedReport.cuotasPolicy || 'use_detected');
    } catch (err: any) {
      console.error('Error al procesar el archivo Excel:', err);
      setError(
        err.message ||
          'No se pudo leer el archivo. Verificá que sea un Excel (.xlsx, .xls) o CSV válido.'
      );
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleResetFile = () => {
    setFile(null);
    setReport(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSheetViewChange = (newView: number | 'all') => {
    if (!report) return;
    const updated = changeActiveSheetView(report, newView);
    setReport(updated);
  };

  const handleToggleSheet = (sheetIndex: number) => {
    if (!report) return;
    const updated = toggleSheetSelection(report, sheetIndex);
    setReport(updated);
  };

  const handleColumnMappingChange = (field: keyof ColumnMappingResult, value: string) => {
    if (!report) return;
    const updatedMapping: ColumnMappingResult = {
      ...report.currentMapping,
      [field]: value === '__NONE__' ? undefined : value,
    };
    const updatedReport = reparseWithCustomMapping(report, updatedMapping, cuotasPolicy);
    setReport(updatedReport);
  };

  const handleCuotasPolicyChange = (newPolicy: CuotasPolicy) => {
    if (!report) return;
    setCuotasPolicy(newPolicy);
    const updatedReport = reparseWithCustomMapping(report, report.currentMapping, newPolicy);
    setReport(updatedReport);
  };

  const handleResetToAIMapping = async () => {
    if (!file) return;
    await handleFileChange(file);
  };

  const handleConfirmImport = () => {
    if (!report || report.allParsedTires.length === 0) return;

    const result = applyImportMode(currentTires, report.allParsedTires, selectedMode);

    onImportComplete(result.updatedTires, {
      mode: selectedMode,
      addedCount: result.addedCount,
      updatedCount: result.updatedCount,
      summedUnits: result.summedUnits,
      fileName: report.fileName,
    });

    onClose();
  };

  return (
    <div
      id="excel-import-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-[#f7f6f2] border border-[#cfcbc2] w-full max-w-4xl shadow-xl flex flex-col my-auto rounded-none text-[#262626]">
        {/* Header Ribbon */}
        <div className="px-4 py-2.5 bg-[#e5e2da] border-b border-[#cfcbc2] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#2e7d32]" />
            <span className="text-xs font-semibold text-[#262626] uppercase tracking-wider">
              Importar / Cargar Archivo Excel
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#555555] hover:text-[#111111] hover:bg-[#d8d4cb] transition-colors rounded-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto max-h-[82vh]">
          {/* If no file or error */}
          {!report && (
            <div className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[#2e7d32] bg-[#eef7ee]'
                    : 'border-[#cfcbc2] hover:border-[#888888] bg-[#fbfbf9]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />

                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 bg-[#eeebe3] border border-[#cfcbc2] flex items-center justify-center text-[#2e7d32]">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[#262626]" />
                    ) : (
                      <FileSpreadsheet className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111111]">
                      {isLoading
                        ? 'Analizando y verificando columnas del Excel...'
                        : 'Hacé clic para seleccionar o arrastrá tu archivo Excel aquí'}
                    </p>
                    <p className="text-[11px] text-[#666666] mt-0.5">
                      Compatible con formatos .xlsx, .xls y .csv
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="mt-2 px-3 py-1.5 bg-[#262626] hover:bg-[#111111] text-[#f7f6f2] font-medium text-xs rounded-none border border-[#262626] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Examinar en mi equipo</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-[#fdf2f2] border border-[#f5c6c6] text-[#991b1b] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Error en el archivo</p>
                    <p className="text-[11px] mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Automatic Cell Verification Guarantee */}
              <div className="p-3 bg-[#eeebe3] border border-[#cfcbc2] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#262626] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2e7d32]" />
                    Detección exhaustiva de celdas y cuotas fijas
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSampleExcelTemplate();
                    }}
                    className="text-[11px] text-[#1e3a5f] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Descargar plantilla de ejemplo</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#555555] leading-relaxed">
                  El sistema busca exhaustivamente las columnas de <b>4 Cuotas</b> y <b>20 Cuotas</b> con todas sus variantes (ej. «4», «20», «4 Cuotas», «Cuota 4», «4 ctas», «4 pagos», «Plan 4», «4x», «C4», etc.) y <b>aplica directamente los valores asignados en tu archivo</b> sin recalcular.
                </p>
              </div>
            </div>
          )}

          {/* If file is verified and ready for review */}
          {report && (
            <div className="space-y-4">
              {/* File details banner */}
              <div className="p-3 bg-[#e8f3e9] border border-[#bddbbd] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#2e7d32] text-white flex items-center justify-center rounded-none flex-shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1e5828] text-xs">
                        {report.fileName}
                      </span>
                      <span className="px-1.5 py-0.2 bg-[#2e7d32] text-white text-[10px] font-semibold">
                        Verificado
                      </span>
                    </div>
                    <p className="text-[11px] text-[#2c6837] mt-0.5">
                      Hoja: <b>{report.sheetName}</b> • <b>{report.validRowsCount}</b> neumáticos
                      reconocidos y listos para importar.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetFile}
                  className="px-2.5 py-1 text-xs text-[#555555] hover:text-[#111111] hover:bg-[#d8ebd9] border border-[#bddbbd] transition-colors rounded-none self-start sm:self-auto cursor-pointer"
                >
                  Cambiar archivo
                </button>
              </div>

              {/* AI Contextual Analysis & Auto-Complete Banner */}
              <div className="p-3 bg-gradient-to-r from-[#f4f7fa] to-[#eef4f0] border border-[#c2d4c5] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#1e3a5f] text-[#f7f6f2] flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#e5b326]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#111111]">
                          Análisis Contextual con IA (Gemini)
                        </span>
                        <span className="px-1.5 py-0.2 bg-[#2e7d32] text-white text-[9px] font-semibold tracking-wider uppercase">
                          Auto-completar por defecto activo
                        </span>
                      </div>
                      <p className="text-[11px] text-[#555555]">
                        {report.aiAnalysis?.insights ||
                          'La IA analizó la nomenclatura de las columnas, identificó las marcas y agrupó los planes de cuotas.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetToAIMapping}
                    className="self-start sm:self-auto px-2 py-1 text-[10px] bg-white hover:bg-[#f0f0ec] text-[#333333] border border-[#cfcbc2] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-[#2e7d32]" />
                    <span>Restaurar auto-completar IA</span>
                  </button>
                </div>

                {/* Contextual Brand Grouping Pills */}
                {report.aiAnalysis?.brandGroupsSummary &&
                  Object.keys(report.aiAnalysis.brandGroupsSummary).length > 0 && (
                    <div className="pt-2 border-t border-[#d8e3d9] flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#444444] uppercase tracking-wider">
                        Agrupación contextual por marca:
                      </span>
                      {Object.entries(report.aiAnalysis.brandGroupsSummary).map(([brand, count]) => (
                        <span
                          key={brand}
                          className="px-2 py-0.5 bg-white border border-[#cfcbc2] text-[10px] font-medium text-[#222222] shadow-2xs"
                        >
                          <b className="text-[#1e3a5f]">{brand}</b>: {count} un.
                        </span>
                      ))}
                    </div>
                  )}

                {/* Detected Installments Badges */}
                {report.aiAnalysis?.detectedInstallmentHeaders &&
                  report.aiAnalysis.detectedInstallmentHeaders.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                      <span className="font-bold text-[#444444] uppercase tracking-wider">
                        Columnas de cuotas identificadas en tu Excel:
                      </span>
                      {report.aiAnalysis.detectedInstallmentHeaders.map((dh) => (
                        <span
                          key={dh.header}
                          className="px-2 py-0.5 bg-[#e8f3e9] text-[#1e5828] border border-[#bddbbd] font-semibold"
                        >
                          {dh.header} ({dh.label})
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* Multi-Sheet & Brand Consolidation Panel (User request: excels con muchas páginas por marcas diferentes con celdas diferentes) */}
              {report.sheets && report.sheets.length > 1 && (
                <div className="p-3 bg-[#fdfcf7] border border-[#cfcbc2] space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#2e7d32]" />
                      <span className="font-bold text-xs uppercase tracking-wider text-[#111111]">
                        Hojas y Marcas detectadas en este archivo ({report.sheets.length} páginas)
                      </span>
                    </div>
                    <span className="text-[10px] text-[#555555]">
                      Podés ver o personalizar el mapeo de cada hoja individualmente:
                    </span>
                  </div>

                  {/* Sheet Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {/* Tab: All Sheets (Consolidated) */}
                    <button
                      type="button"
                      onClick={() => handleSheetViewChange('all')}
                      className={`px-3 py-1.5 text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                        report.selectedSheetView === 'all'
                          ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-2xs'
                          : 'bg-white text-[#333333] border-[#cfcbc2] hover:bg-[#f4f1ea]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Todas las páginas</span>
                      <span
                        className={`px-1.5 py-0.2 text-[10px] rounded-none ${
                          report.selectedSheetView === 'all'
                            ? 'bg-white/20 text-white'
                            : 'bg-[#eeebe3] text-[#444444]'
                        }`}
                      >
                        {report.validRowsCount} un.
                      </span>
                    </button>

                    {/* Individual Sheet Tabs */}
                    {report.sheets.map((s, idx) => {
                      const isCurrentTab = report.selectedSheetView === idx;
                      return (
                        <div
                          key={`sheet-tab-${s.sheetName}-${idx}`}
                          className={`flex items-center border transition-colors ${
                            isCurrentTab
                              ? 'bg-[#2e7d32] text-white border-[#2e7d32] shadow-2xs'
                              : s.selected
                              ? 'bg-white text-[#333333] border-[#cfcbc2] hover:bg-[#f4f1ea]'
                              : 'bg-[#f0ede6] text-[#888888] border-[#cfcbc2] opacity-70'
                          }`}
                        >
                          {/* Checkbox to include/exclude this sheet */}
                          <label
                            title={
                              s.selected
                                ? 'Desmarcar para no importar esta hoja'
                                : 'Marcar para incluir esta hoja'
                            }
                            className="px-2 py-1.5 cursor-pointer flex items-center border-r border-black/10 hover:bg-black/5"
                          >
                            <input
                              type="checkbox"
                              checked={s.selected}
                              onChange={() => handleToggleSheet(idx)}
                              className="w-3.5 h-3.5 accent-[#2e7d32] cursor-pointer"
                            />
                          </label>

                          {/* Click to view/edit this sheet */}
                          <button
                            type="button"
                            onClick={() => handleSheetViewChange(idx)}
                            className="px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="font-bold">{s.sheetName}</span>
                            {s.detectedBrand && (
                              <span
                                className={`text-[10px] px-1 py-0.2 ${
                                  isCurrentTab
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[#e8f3e9] text-[#1e5828]'
                                }`}
                              >
                                {s.detectedBrand}
                              </span>
                            )}
                            <span
                              className={`text-[10px] ${
                                isCurrentTab ? 'text-white/80' : 'text-[#666666]'
                              }`}
                            >
                              ({s.validRowsCount})
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Context indicator for active view */}
                  <div className="text-[11px] text-[#555555] bg-white p-2 border border-[#cfcbc2] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>
                      {report.selectedSheetView === 'all' ? (
                        <>
                          Mostrando <b>todas las páginas consolidadas</b> ({report.validRowsCount} neumáticos de{' '}
                          {report.sheets.filter((s) => s.selected).length} hojas activas). La IA
                          agrupó automáticamente las marcas y adaptó las diferentes nomenclaturas de celdas.
                        </>
                      ) : (
                        <>
                          Viendo hoja individual: <b>{report.sheets[report.selectedSheetView].sheetName}</b>{' '}
                          {report.sheets[report.selectedSheetView].detectedBrand && (
                            <>(Marca detectada: <b>{report.sheets[report.selectedSheetView].detectedBrand}</b>)</>
                          )}
                          . Las opciones de columnas abajo corresponden a esta hoja.
                        </>
                      )}
                    </span>
                    {typeof report.selectedSheetView === 'number' && (
                      <button
                        type="button"
                        onClick={() => handleSheetViewChange('all')}
                        className="text-xs text-[#1e3a5f] font-semibold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Volver a ver todas</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* CRUCIAL SECTION: Cuotas Policy Selector (MANDATED BY USER) */}
              <div className="bg-[#fcfbf9] border border-[#cfcbc2] p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2e7d32]"></span>
                    <span className="font-bold text-xs uppercase tracking-wider text-[#111111]">
                      Financiación y Cuotas del Archivo (Por defecto: usar detectadas)
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#e8f3e9] text-[#1e5828] font-bold border border-[#bddbbd]">
                    {cuotasPolicy === 'use_detected'
                      ? 'Usando importes reales del Excel'
                      : cuotasPolicy === 'calculate'
                      ? 'Calculando matemáticamente'
                      : 'Personalizado'}
                  </span>
                </div>

                <p className="text-[11px] text-[#555555] leading-snug">
                  La opción por defecto <b>utiliza las cuotas detectadas en tu archivo</b> (ej. C4, C20 o columnas de planes) aunque no coincidan con las tasas predeterminadas. Podés cambiar la política si preferís recalcular:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {/* Option 1: Usar cuotas detectadas (DEFAULT) */}
                  <label
                    className={`p-2.5 border cursor-pointer flex items-start gap-2 transition-colors ${
                      cuotasPolicy === 'use_detected'
                        ? 'bg-[#edf6ee] border-[#2e7d32] shadow-2xs'
                        : 'bg-white border-[#cfcbc2] hover:bg-[#fbfbf9]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cuotasPolicy"
                      value="use_detected"
                      checked={cuotasPolicy === 'use_detected'}
                      onChange={() => handleCuotasPolicyChange('use_detected')}
                      className="mt-0.5 accent-[#2e7d32]"
                    />
                    <div>
                      <span className="font-bold text-xs text-[#111111] block">
                        Usar cuotas detectadas (Predeterminado)
                      </span>
                      <span className="text-[10px] text-[#555555] block mt-0.5">
                        Toma el precio final financiado del Excel y calcula el valor de cada cuota (Precio Excel ÷ 4 y Precio Excel ÷ 20).
                      </span>
                    </div>
                  </label>

                  {/* Option 2: Calcular matemáticamente */}
                  <label
                    className={`p-2.5 border cursor-pointer flex items-start gap-2 transition-colors ${
                      cuotasPolicy === 'calculate'
                        ? 'bg-[#f0f4f9] border-[#1e3a5f] shadow-2xs'
                        : 'bg-white border-[#cfcbc2] hover:bg-[#fbfbf9]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cuotasPolicy"
                      value="calculate"
                      checked={cuotasPolicy === 'calculate'}
                      onChange={() => handleCuotasPolicyChange('calculate')}
                      className="mt-0.5 accent-[#1e3a5f]"
                    />
                    <div>
                      <span className="font-bold text-xs text-[#111111] block">
                        Calcular automáticamente
                      </span>
                      <span className="text-[10px] text-[#555555] block mt-0.5">
                        Calcula +15% en 4 cuotas fijas y +50% en 20 cuotas fijas a partir del precio de contado.
                      </span>
                    </div>
                  </label>

                  {/* Option 3: Personalizar */}
                  <label
                    className={`p-2.5 border cursor-pointer flex items-start gap-2 transition-colors ${
                      cuotasPolicy === 'custom'
                        ? 'bg-[#fdf8ee] border-[#b45309] shadow-2xs'
                        : 'bg-white border-[#cfcbc2] hover:bg-[#fbfbf9]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cuotasPolicy"
                      value="custom"
                      checked={cuotasPolicy === 'custom'}
                      onChange={() => handleCuotasPolicyChange('custom')}
                      className="mt-0.5 accent-[#b45309]"
                    />
                    <div>
                      <span className="font-bold text-xs text-[#111111] block">
                        Personalizar columnas
                      </span>
                      <span className="text-[10px] text-[#555555] block mt-0.5">
                        Elegí manualmente las columnas exactas del Excel en el panel de mapeo inferior.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* CRUCIAL SECTION: Interactive Column & Installments Mapping */}
              <div className="bg-[#eeebe3] border border-[#cfcbc2] p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-[#262626]" />
                    <span className="font-bold text-xs uppercase tracking-wider text-[#262626]">
                      Mapeo y Asignación de Columnas (Editable)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedMapping(!showAdvancedMapping)}
                    className="text-[11px] text-[#1e3a5f] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span>{showAdvancedMapping ? 'Ocultar ajustes' : 'Personalizar asignación'}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        showAdvancedMapping ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                <p className="text-[11px] text-[#555555] leading-snug">
                  Auto-completado con IA activado. Si deseás cambiar qué columna corresponde a cada campo, seleccionala en los menús desplegables:
                </p>

                {/* Column Selectors Grid */}
                {showAdvancedMapping && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {/* Marca (CRITICAL FOR USER) */}
                    <div className="p-2.5 bg-white border border-[#cfcbc2] space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#111111] text-[11px] flex items-center gap-1">
                          <span>Marca</span>
                          {report.currentMapping.marcaCol && report.currentMapping.marcaCol !== '__AUTO__' && report.currentMapping.marcaCol !== '__BLANK__' ? (
                            <span className="text-[9px] px-1 bg-[#e8f3e9] text-[#1e5828] font-bold">
                              Columna
                            </span>
                          ) : report.currentMapping.marcaCol === '__BLANK__' ? (
                            <span className="text-[9px] px-1 bg-[#fff0f0] text-[#991b1b] font-mono">
                              En blanco
                            </span>
                          ) : (
                            <span className="text-[9px] px-1 bg-[#f0f4f9] text-[#1e3a5f] font-mono">
                              Auto en celdas
                            </span>
                          )}
                        </label>
                      </div>
                      <select
                        value={report.currentMapping.marcaCol || '__AUTO__'}
                        onChange={(e) => handleColumnMappingChange('marcaCol', e.target.value)}
                        className="w-full text-xs p-1.5 bg-[#fbfbf9] border border-[#cfcbc2] rounded-none focus:border-[#262626] font-medium"
                      >
                        <option value="__AUTO__">
                          ✨ Analizar y detectar marca en celdas (Recomendado)
                        </option>
                        <option value="__BLANK__">
                          — Dejar en blanco (No utilizar) —
                        </option>
                        {report.availableHeaders.map((h) => (
                          <option key={`mrc-${h}`} value={h}>
                            Columna: "{h}"
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#666666]">
                        {report.currentMapping.marcaCol && report.currentMapping.marcaCol !== '__AUTO__' && report.currentMapping.marcaCol !== '__BLANK__'
                          ? `Asignada a "${report.currentMapping.marcaCol}". Si una celda no tiene marca, analiza las demás celdas.`
                          : report.currentMapping.marcaCol === '__BLANK__'
                          ? 'Se dejará en blanco para todas las filas.'
                          : 'Detecta marcas automáticamente en las celdas (Michelin, Pirelli, Fate, BFGoodrich, etc.).'}
                      </p>
                    </div>

                    {/* Medida / Dimensiones */}
                    <div className="p-2.5 bg-white border border-[#cfcbc2] space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#111111] text-[11px] flex items-center gap-1">
                          <span>Medida / Dimensiones</span>
                          {report.currentMapping.dimensionesCol && report.currentMapping.dimensionesCol !== '__AUTO__' && report.currentMapping.dimensionesCol !== '__BLANK__' ? (
                            <span className="text-[9px] px-1 bg-[#e8f3e9] text-[#1e5828] font-bold">
                              Columna
                            </span>
                          ) : report.currentMapping.dimensionesCol === '__BLANK__' ? (
                            <span className="text-[9px] px-1 bg-[#fff0f0] text-[#991b1b] font-mono">
                              En blanco
                            </span>
                          ) : (
                            <span className="text-[9px] px-1 bg-[#f0f4f9] text-[#1e3a5f] font-mono">
                              Auto en celdas
                            </span>
                          )}
                        </label>
                      </div>
                      <select
                        value={report.currentMapping.dimensionesCol || '__AUTO__'}
                        onChange={(e) =>
                          handleColumnMappingChange('dimensionesCol', e.target.value)
                        }
                        className="w-full text-xs p-1.5 bg-[#fbfbf9] border border-[#cfcbc2] rounded-none focus:border-[#262626] font-medium"
                      >
                        <option value="__AUTO__">
                          ✨ Detectar medida en celdas (Ej: 205/55 R16)
                        </option>
                        <option value="__BLANK__">
                          — Dejar en blanco (No utilizar) —
                        </option>
                        {report.availableHeaders.map((h) => (
                          <option key={`dim-${h}`} value={h}>
                            Columna: "{h}"
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#666666]">
                        {report.currentMapping.dimensionesCol && report.currentMapping.dimensionesCol !== '__AUTO__' && report.currentMapping.dimensionesCol !== '__BLANK__'
                          ? `Columna actual: "${report.currentMapping.dimensionesCol}"`
                          : report.currentMapping.dimensionesCol === '__BLANK__'
                          ? 'Se dejará en blanco si no se utiliza.'
                          : 'Busca automáticamente formatos de medida en la fila.'}
                      </p>
                    </div>

                    {/* Modelo */}
                    <div className="p-2.5 bg-white border border-[#cfcbc2] space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#111111] text-[11px] flex items-center gap-1">
                          <span>Modelo / Diseño</span>
                          {report.currentMapping.modeloCol && report.currentMapping.modeloCol !== '__BLANK__' ? (
                            <span className="text-[9px] px-1 bg-[#e8f3e9] text-[#1e5828] font-bold">
                              Columna
                            </span>
                          ) : (
                            <span className="text-[9px] px-1 bg-[#f4f3ed] text-[#666666] font-mono">
                              En blanco
                            </span>
                          )}
                        </label>
                      </div>
                      <select
                        value={report.currentMapping.modeloCol || '__BLANK__'}
                        onChange={(e) => handleColumnMappingChange('modeloCol', e.target.value)}
                        className="w-full text-xs p-1.5 bg-[#fbfbf9] border border-[#cfcbc2] rounded-none focus:border-[#262626] font-medium"
                      >
                        <option value="__BLANK__">
                          — Dejar en blanco si no se utiliza —
                        </option>
                        {report.availableHeaders.map((h) => (
                          <option key={`mod-${h}`} value={h}>
                            Columna: "{h}"
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#666666]">
                        {report.currentMapping.modeloCol && report.currentMapping.modeloCol !== '__BLANK__'
                          ? `Asignada a "${report.currentMapping.modeloCol}".`
                          : 'Las celdas sin modelo quedarán en blanco.'}
                      </p>
                    </div>

                    {/* 4 Cuotas Selector (HIGHEST USER ATTENTION) */}
                    <div className="p-2.5 bg-white border border-[#cfcbc2] space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#111111] text-[11px] flex items-center gap-1">
                          <span>4 Cuotas</span>
                          {cuotasPolicy === 'calculate' ? (
                            <span className="text-[9px] px-1 bg-[#f4f3ed] text-[#666666] font-mono">
                              Calculado (+15%/4)
                            </span>
                          ) : report.currentMapping.precioCuota4Col && report.currentMapping.precioCuota4Col !== '__BLANK__' ? (
                            <span className="text-[9px] px-1 bg-[#e8f3e9] text-[#1e5828] font-bold">
                              Del Excel (÷ 4)
                            </span>
                          ) : report.currentMapping.precioCuota4Col === '__BLANK__' ? (
                            <span className="text-[9px] px-1 bg-[#fff0f0] text-[#991b1b] font-mono">
                              En blanco
                            </span>
                          ) : (
                            <span className="text-[9px] px-1 bg-[#f4f3ed] text-[#666666] font-mono">
                              Calculado (+15%/4)
                            </span>
                          )}
                        </label>
                      </div>
                      <select
                        value={report.currentMapping.precioCuota4Col || '__NONE__'}
                        onChange={(e) =>
                          handleColumnMappingChange('precioCuota4Col', e.target.value)
                        }
                        className="w-full text-xs p-1.5 bg-[#fbfbf9] border border-[#cfcbc2] rounded-none focus:border-[#262626] font-medium"
                      >
                        <option value="__NONE__">
                          -- Calcular automáticamente (+15% / 4) --
                        </option>
                        <option value="__BLANK__">
                          — Dejar en blanco (0) —
                        </option>
                        {report.availableHeaders.map((h) => (
                          <option key={`c4-${h}`} value={h}>
                            Columna: "{h}"
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#666666]">
                        {cuotasPolicy === 'calculate'
                          ? 'Política activa: Se calculará automáticamente (+15%/4) sobre el precio contado.'
                          : report.currentMapping.precioCuota4Col && report.currentMapping.precioCuota4Col !== '__BLANK__'
                          ? `Asignada a "${report.currentMapping.precioCuota4Col}". Divide el precio final por 4 para obtener la cuota.`
                          : report.currentMapping.precioCuota4Col === '__BLANK__'
                          ? 'El valor quedará en 0 / en blanco.'
                          : 'Se calculará automáticamente según el precio contado.'}
                      </p>
                    </div>

                    {/* 20 Cuotas Selector (HIGHEST USER ATTENTION) */}
                    <div className="p-2.5 bg-white border border-[#cfcbc2] space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#111111] text-[11px] flex items-center gap-1">
                          <span>20 Cuotas</span>
                          {cuotasPolicy === 'calculate' ? (
                            <span className="text-[9px] px-1 bg-[#f4f3ed] text-[#666666] font-mono">
                              Calculado (+50%/20)
                            </span>
                          ) : report.currentMapping.precioCuota20Col && report.currentMapping.precioCuota20Col !== '__BLANK__' ? (
                            <span className="text-[9px] px-1 bg-[#e8f3e9] text-[#1e5828] font-bold">
                              Del Excel (÷ 20)
                            </span>
                          ) : report.currentMapping.precioCuota20Col === '__BLANK__' ? (
                            <span className="text-[9px] px-1 bg-[#fff0f0] text-[#991b1b] font-mono">
                              En blanco
                            </span>
                          ) : (
                            <span className="text-[9px] px-1 bg-[#f4f3ed] text-[#666666] font-mono">
                              Calculado (+50%/20)
                            </span>
                          )}
                        </label>
                      </div>
                      <select
                        value={report.currentMapping.precioCuota20Col || '__NONE__'}
                        onChange={(e) =>
                          handleColumnMappingChange('precioCuota20Col', e.target.value)
                        }
                        className="w-full text-xs p-1.5 bg-[#fbfbf9] border border-[#cfcbc2] rounded-none focus:border-[#262626] font-medium"
                      >
                        <option value="__NONE__">
                          -- Calcular automáticamente (+50% / 20) --
                        </option>
                        <option value="__BLANK__">
                          — Dejar en blanco (0) —
                        </option>
                        {report.availableHeaders.map((h) => (
                          <option key={`c20-${h}`} value={h}>
                            Columna: "{h}"
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#666666]">
                        {cuotasPolicy === 'calculate'
                          ? 'Política activa: Se calculará automáticamente (+50%/20) sobre el precio contado.'
                          : report.currentMapping.precioCuota20Col && report.currentMapping.precioCuota20Col !== '__BLANK__'
                          ? `Asignada a "${report.currentMapping.precioCuota20Col}". Divide el precio final por 20 para obtener la cuota.`
                          : report.currentMapping.precioCuota20Col === '__BLANK__'
                          ? 'El valor quedará en 0 / en blanco.'
                          : 'Se calculará automáticamente según el precio contado.'}
                      </p>
                    </div>

                    {/* Precio Contado */}
                    <div className="p-2.5 bg-white border border-[#cfcbc2] space-y-1.5 shadow-2xs">
                      <label className="font-bold text-[#111111] text-[11px] block">
                        Precio Contado / Efectivo
                      </label>
                      <select
                        value={report.currentMapping.precioContadoCol || '__NONE__'}
                        onChange={(e) =>
                          handleColumnMappingChange('precioContadoCol', e.target.value)
                        }
                        className="w-full text-xs p-1.5 bg-[#fbfbf9] border border-[#cfcbc2] rounded-none focus:border-[#262626] font-medium"
                      >
                        <option value="__NONE__">-- Seleccionar columna --</option>
                        {report.availableHeaders.map((h) => (
                          <option key={`cont-${h}`} value={h}>
                            Columna: "{h}"
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#666666]">
                        Columna actual: "{report.currentMapping.precioContadoCol || 'Ninguna'}"
                      </p>
                    </div>

                    {/* Stock */}
                    <div className="p-2.5 bg-white border border-[#cfcbc2] space-y-1.5 shadow-2xs">
                      <label className="font-bold text-[#111111] text-[11px] block">
                        Stock / Cantidad
                      </label>
                      <select
                        value={report.currentMapping.stockCol || '__NONE__'}
                        onChange={(e) => handleColumnMappingChange('stockCol', e.target.value)}
                        className="w-full text-xs p-1.5 bg-[#fbfbf9] border border-[#cfcbc2] rounded-none focus:border-[#262626] font-medium"
                      >
                        <option value="__NONE__">-- Sin columna (0 unidades - Sin stock) --</option>
                        <option value="__BLANK__">— Dejar en blanco (0 unidades - Sin stock) —</option>
                        {report.availableHeaders.map((h) => (
                          <option key={`stk-${h}`} value={h}>
                            Columna: "{h}"
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#666666]">
                        {report.currentMapping.stockCol === '__BLANK__' || report.currentMapping.stockCol === '__NONE__'
                          ? 'Sin stock: el stock quedará en 0 unidades si no se encuentra la columna.'
                          : report.currentMapping.stockCol
                          ? `Columna mapeada: "${report.currentMapping.stockCol}"`
                          : 'Sin columna detectada (quedará en 0 unidades / sin stock).'}
                      </p>
                    </div>

                    {/* Código / SKU */}
                    <div className="p-2.5 bg-white border border-[#cfcbc2] space-y-1.5 shadow-2xs">
                      <label className="font-bold text-[#111111] text-[11px] block">
                        Código / SKU
                      </label>
                      <select
                        value={report.currentMapping.codigoCol || '__BLANK__'}
                        onChange={(e) => handleColumnMappingChange('codigoCol', e.target.value)}
                        className="w-full text-xs p-1.5 bg-[#fbfbf9] border border-[#cfcbc2] rounded-none focus:border-[#262626] font-medium"
                      >
                        <option value="__BLANK__">— Dejar en blanco si no existe —</option>
                        {report.availableHeaders.map((h) => (
                          <option key={`cod-${h}`} value={h}>
                            Columna: "{h}"
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#666666]">
                        {report.currentMapping.codigoCol && report.currentMapping.codigoCol !== '__BLANK__'
                          ? `Columna: "${report.currentMapping.codigoCol}"`
                          : 'Las celdas sin código quedarán en blanco.'}
                      </p>
                    </div>

                    {/* Observaciones / Descripción */}
                    <div className="p-2.5 bg-white border border-[#cfcbc2] space-y-1.5 shadow-2xs">
                      <label className="font-bold text-[#111111] text-[11px] block">
                        Observaciones / Detalle
                      </label>
                      <select
                        value={report.currentMapping.descripcionCol || '__BLANK__'}
                        onChange={(e) => handleColumnMappingChange('descripcionCol', e.target.value)}
                        className="w-full text-xs p-1.5 bg-[#fbfbf9] border border-[#cfcbc2] rounded-none focus:border-[#262626] font-medium"
                      >
                        <option value="__BLANK__">— Dejar en blanco si no existe —</option>
                        {report.availableHeaders.map((h) => (
                          <option key={`obs-${h}`} value={h}>
                            Columna: "{h}"
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#666666]">
                        {report.currentMapping.descripcionCol && report.currentMapping.descripcionCol !== '__BLANK__'
                          ? `Columna: "${report.currentMapping.descripcionCol}"`
                          : 'Las celdas sin descripción quedarán en blanco.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Preview Table */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#444444] uppercase tracking-wider flex items-center gap-1.5">
                    <span>Vista previa con valores reales de cuotas</span>
                    <span className="px-1.5 py-0.2 bg-[#262626] text-[#f7f6f2] text-[9px] font-semibold">
                      Primeras {report.sampleTires.length} filas
                    </span>
                  </span>
                  <span className="text-[#666666]">
                    Total en archivo: <b>{report.validRowsCount}</b> filas
                  </span>
                </div>

                <div className="overflow-x-auto border border-[#cfcbc2]">
                  <table className="w-full text-left border-collapse text-xs bg-white">
                    <thead className="bg-[#e5e2da] border-b border-[#cfcbc2] text-[#333333] text-[10px] uppercase font-semibold">
                      <tr>
                        {report.sheets && report.sheets.length > 1 && (
                          <th className="p-1.5 border-r border-[#cfcbc2]">Página / Hoja</th>
                        )}
                        <th className="p-1.5 border-r border-[#cfcbc2]">Marca</th>
                        <th className="p-1.5 border-r border-[#cfcbc2]">Modelo</th>
                        <th className="p-1.5 border-r border-[#cfcbc2]">Medida</th>
                        <th className="p-1.5 border-r border-[#cfcbc2]">Rodado</th>
                        <th className="p-1.5 text-right border-r border-[#cfcbc2]">P. Contado</th>
                        <th className="p-1.5 text-right border-r border-[#cfcbc2] bg-[#f2f7f2] text-[#1e5828]">
                          4 Cuotas {cuotasPolicy === 'calculate' ? '(Calc +15%)' : report.currentMapping.precioCuota4Col ? '(Excel)' : '(Calc)'}
                        </th>
                        <th className="p-1.5 text-right border-r border-[#cfcbc2] bg-[#f2f7f2] text-[#1e5828]">
                          20 Cuotas {cuotasPolicy === 'calculate' ? '(Calc +50%)' : report.currentMapping.precioCuota20Col ? '(Excel)' : '(Calc)'}
                        </th>
                        <th className="p-1.5 text-center">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#cfcbc2] font-mono text-[11px]">
                      {report.sampleTires.map((t) => (
                        <tr key={t.id} className="hover:bg-[#fbfbf9]">
                          {report.sheets && report.sheets.length > 1 && (
                            <td className="p-1.5 text-[10px] text-[#555555] border-r border-[#cfcbc2] whitespace-nowrap font-sans">
                              <span className="px-1.5 py-0.5 bg-[#f0ede6] border border-[#d8d5cc] font-semibold text-[#1e3a5f]">
                                {t.origen || report.sheetName}
                              </span>
                            </td>
                          )}
                          <td className="p-1.5 font-sans font-bold border-r border-[#cfcbc2]">
                            {t.marca ? (
                              <span>{t.marca}</span>
                            ) : (
                              <span className="text-[#999999] font-normal italic">— (En blanco)</span>
                            )}
                          </td>
                          <td className="p-1.5 font-sans border-r border-[#cfcbc2]">
                            {t.modelo || <span className="text-[#999999] italic">—</span>}
                          </td>
                          <td className="p-1.5 font-bold border-r border-[#cfcbc2]">
                            {t.dimensiones || <span className="text-[#999999] font-normal italic">—</span>}
                          </td>
                          <td className="p-1.5 border-r border-[#cfcbc2]">
                            {t.rodado || <span className="text-[#999999] italic">—</span>}
                          </td>
                          <td className="p-1.5 text-right border-r border-[#cfcbc2]">
                            {t.precioContado > 0 ? formatCurrency(t.precioContado) : <span className="text-[#999999] italic">—</span>}
                          </td>
                          <td className="p-1.5 text-right border-r border-[#cfcbc2] bg-[#f2f7f2] text-[#1e5828]">
                            {t.precioCuota4 > 0 ? (
                              <div>
                                <span className="font-bold">{formatCurrency(t.precioCuota4 * 4)}</span>
                                <span className="block text-[9px] text-[#15803d] font-normal font-sans">
                                  4x {formatCurrency(t.precioCuota4)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#999999] font-normal italic">—</span>
                            )}
                          </td>
                          <td className="p-1.5 text-right border-r border-[#cfcbc2] bg-[#f2f7f2] text-[#1e5828]">
                            {t.precioCuota20 > 0 ? (
                              <div>
                                <span className="font-bold">{formatCurrency(t.precioCuota20 * 20)}</span>
                                <span className="block text-[9px] text-[#15803d] font-normal font-sans">
                                  20x {formatCurrency(t.precioCuota20)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#999999] font-normal italic">—</span>
                            )}
                          </td>
                          <td className="p-1.5 text-center font-bold">
                            {t.stock > 0 ? t.stock : <span className="text-[#999999] font-normal">0</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* THREE IMPORT OPTIONS MANDATED BY USER */}
              <div className="space-y-2 pt-2 border-t border-[#cfcbc2]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#111111]">
                    ¿Cómo deseás procesar el nuevo Excel?
                  </span>
                  <span className="text-[10px] text-[#666666]">(Seleccioná una opción)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Opción 1: Cargar solo el nuevo Excel (Reemplazar) */}
                  <label
                    className={`p-3 border cursor-pointer flex flex-col justify-between transition-all ${
                      selectedMode === 'replace'
                        ? 'bg-[#fff5f5] border-[#991b1b] shadow-xs'
                        : 'bg-[#fbfbf9] border-[#cfcbc2] hover:bg-[#f4f1ea]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={selectedMode === 'replace'}
                        onChange={() => setSelectedMode('replace')}
                        className="mt-0.5 accent-[#991b1b]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5 text-[#991b1b]" />
                          <span className="font-bold text-xs text-[#111111]">
                            Cargar solo el nuevo Excel
                          </span>
                        </div>
                        <p className="text-[11px] text-[#555555] mt-1 leading-snug">
                          <b>Reemplaza todo</b> el catálogo actual. Se borra el stock anterior y
                          queda únicamente lo que viene en este Excel ({report.validRowsCount}{' '}
                          neumáticos).
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-[#991b1b] uppercase tracking-wider">
                      Reemplazo total
                    </div>
                  </label>

                  {/* Opción 2: Fusionar */}
                  <label
                    className={`p-3 border cursor-pointer flex flex-col justify-between transition-all ${
                      selectedMode === 'merge'
                        ? 'bg-[#f0f4f9] border-[#1e3a5f] shadow-xs'
                        : 'bg-[#fbfbf9] border-[#cfcbc2] hover:bg-[#f4f1ea]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="importMode"
                        value="merge"
                        checked={selectedMode === 'merge'}
                        onChange={() => setSelectedMode('merge')}
                        className="mt-0.5 accent-[#1e3a5f]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#1e3a5f]" />
                          <span className="font-bold text-xs text-[#111111]">Fusionar</span>
                        </div>
                        <p className="text-[11px] text-[#555555] mt-1 leading-snug">
                          <b>Actualiza precios y cuotas</b> de los neumáticos existentes, y
                          añade los modelos nuevos. Fija el stock con las cantidades del Excel.
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-[#1e3a5f] uppercase tracking-wider">
                      Actualizar catálogo
                    </div>
                  </label>

                  {/* Opción 3: Sumar Stock */}
                  <label
                    className={`p-3 border cursor-pointer flex flex-col justify-between transition-all ${
                      selectedMode === 'sum_stock'
                        ? 'bg-[#edf6ee] border-[#2e7d32] shadow-xs'
                        : 'bg-[#fbfbf9] border-[#cfcbc2] hover:bg-[#f4f1ea]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="importMode"
                        value="sum_stock"
                        checked={selectedMode === 'sum_stock'}
                        onChange={() => setSelectedMode('sum_stock')}
                        className="mt-0.5 accent-[#2e7d32]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <PlusCircle className="w-3.5 h-3.5 text-[#2e7d32]" />
                          <span className="font-bold text-xs text-[#111111]">Sumar stock</span>
                        </div>
                        <p className="text-[11px] text-[#555555] mt-1 leading-snug">
                          <b>Suma las unidades</b> a lo que ya tenés guardado (ej. 4 existentes +
                          8 del Excel = 12 unidades). Actualiza precios, cuotas y agrega nuevos.
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-[#2e7d32] uppercase tracking-wider">
                      Recepción de mercadería
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#cfcbc2] flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-[11px] text-[#666666]">
                  Catálogo actual: <b>{currentTires.length}</b> modelos | Archivo Excel:{' '}
                  <b>{report.validRowsCount}</b> modelos
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-3 py-2 bg-[#eeebe3] hover:bg-[#e4e0d6] text-[#333333] font-medium text-xs rounded-none border border-[#cfcbc2] transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    id="btn-confirm-import-excel"
                    onClick={handleConfirmImport}
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#262626] hover:bg-[#111111] text-[#f7f6f2] font-bold text-xs rounded-none border border-[#1a1a1a] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Confirmar e Importar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
