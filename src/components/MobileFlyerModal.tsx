import React, { useState, useRef, useMemo, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  X,
  Download,
  Share2,
  Check,
  Copy,
  Loader2,
  Trash2,
  Banknote,
  Eye,
  List,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Tire } from '../types';
import { formatCurrency, getBrandBadgeStyle } from '../utils/formatters';
import { COMPANY_INFO } from '../data/companyInfo';
import { distributeTiresEquitably, isCompactTireLayout } from '../utils/flyerUtils';
import { FlyerPoster } from './FlyerPoster';

interface MobileFlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTires: Tire[];
  onDeselectTire?: (id: string) => void;
  onDeselectAll?: () => void;
}

export const MobileFlyerModal: React.FC<MobileFlyerModalProps> = ({
  isOpen,
  onClose,
  selectedTires,
  onDeselectTire,
  onDeselectAll,
}) => {
  const [showContado, setShowContado] = useState(true);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'preview' | 'list'>('preview');
  const [stylePrompt, setStylePrompt] = useState('minimalista, colores oscuros, estilo neón');

  // Distribute tires equitably with a maximum of 6 tires per image
  // Rules from user prompt:
  // 1. If count > 3, layout is compact (takes half the vertical space)
  // 2. If count > 6, generates more than 1 image, distributed equitably
  const chunks = useMemo(() => {
    return distributeTiresEquitably(selectedTires, 6);
  }, [selectedTires]);

  // Adjust activeChunkIndex if items were deleted and chunk count shrank
  useEffect(() => {
    if (activeChunkIndex >= chunks.length && chunks.length > 0) {
      setActiveChunkIndex(chunks.length - 1);
    }
  }, [chunks.length, activeChunkIndex]);

  // Off-screen DOM refs for each flyer chunk
  const chunkFlyerRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (onDeselectAll) {
      onDeselectAll();
    }
    onClose();
  };

  // Download all images (or single if chunks.length === 1)
  const handleDownloadAll = async () => {
    if (chunks.length === 0) return;
    try {
      setIsGenerating(true);
      const timestamp = new Date().toISOString().slice(0, 10);

      for (let i = 0; i < chunks.length; i++) {
        const element = chunkFlyerRefs.current[i];
        if (!element) continue;

        setGeneratingProgress(
          chunks.length > 1
            ? `Generando imagen ${i + 1} de ${chunks.length}...`
            : 'Generando imagen PNG en alta calidad...'
        );

        const dataUrl = await toPng(element, {
          cacheBust: true,
          pixelRatio: 3,
          quality: 0.98,
        });

        const link = document.createElement('a');
        const partSuffix =
          chunks.length > 1 ? `-parte-${i + 1}-de-${chunks.length}` : '';
        link.download = `neumaticos-cuotas${partSuffix}-${timestamp}.png`;
        link.href = dataUrl;
        link.click();

        // Brief delay between downloads so browsers don't throttle
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 350));
        }
      }
    } catch (err) {
      console.error('Error generando imagen(es):', err);
    } finally {
      setIsGenerating(false);
      setGeneratingProgress(null);
    }
  };

  // Download only the currently active tab image
  const handleDownloadSingle = async (indexToDownload: number) => {
    const element = chunkFlyerRefs.current[indexToDownload];
    if (!element) return;
    try {
      setIsGenerating(true);
      setGeneratingProgress(`Generando imagen ${indexToDownload + 1}...`);
      const timestamp = new Date().toISOString().slice(0, 10);

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 3,
        quality: 0.98,
      });

      const link = document.createElement('a');
      const partSuffix =
        chunks.length > 1
          ? `-parte-${indexToDownload + 1}-de-${chunks.length}`
          : '';
      link.download = `neumaticos-cuotas${partSuffix}-${timestamp}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generando imagen:', err);
    } finally {
      setIsGenerating(false);
      setGeneratingProgress(null);
    }
  };

  // Multi-page PDF generator: each chunk becomes a dedicated A4 page
  const handleDownloadPdf = async () => {
    if (chunks.length === 0) return;
    try {
      setIsGeneratingPdf(true);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;

      for (let i = 0; i < chunks.length; i++) {
        const element = chunkFlyerRefs.current[i];
        if (!element) continue;

        if (i > 0) {
          pdf.addPage();
        }

        const dataUrl = await toPng(element, {
          cacheBust: true,
          pixelRatio: 2.5,
          backgroundColor: '#ffffff',
        });

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const contentHeight = (img.height * contentWidth) / img.width;
        // Position neatly centered vertically if flyer is shorter than full A4 page
        const yPos =
          contentHeight < pageHeight - margin * 2
            ? margin + (pageHeight - margin * 2 - contentHeight) / 5
            : margin;

        pdf.addImage(dataUrl, 'PNG', margin, yPos, contentWidth, contentHeight);
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      pdf.save(`neumaticos-cuotas-${timestamp}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generateShareText = () => {
    let text = `🏢 *COTTA NEUMÁTICOS* - *VENTAS POR MAYOR Y MENOR*\n`;
    text += `📍 *Santa Rosa L.P.:* ${COMPANY_INFO.branches.santaRosa.phoneDisplay}\n`;
    text += `📍 *América Bs.As.:* ${COMPANY_INFO.branches.america.phoneDisplay}\n`;
    text += `📸 *Redes:* ${COMPANY_INFO.socialHandle}\n`;
    text += `------------------------------------\n`;

    const anyHasCuotas = selectedTires.some(
      (t) => (t.precioCuota4 || 0) > 0 || (t.precioCuota20 || 0) > 0
    );

    if (anyHasCuotas) {
      text += `💳 *PLANES DE CUOTAS EXCLUSIVOS BANCO PAMPA*\n`;
      text += `*(Financiación en 4 y 20 cuotas fijas exclusiva Banco de La Pampa)*\n`;
    } else {
      text += `💵 *LISTA DE PRECIOS PROMOCIONALES - CONTADO / TRANSFERENCIA*\n`;
      text += `*(Venta al contado • Sin financiación en cuotas disponible)*\n`;
    }

    if (chunks.length > 1) {
      text += `📸 *(Se adjuntan ${chunks.length} imágenes organizadas con el detalle)*\n`;
    }
    text += `\n`;

    selectedTires.forEach((t, i) => {
      const hasC4 = (t.precioCuota4 || 0) > 0;
      const hasC20 = (t.precioCuota20 || 0) > 0;

      text += `${i + 1}. *${t.marca.toUpperCase()}* - ${t.modelo}\n`;
      text += `   Medida: ${t.dimensiones} (${t.indice || ''})\n`;
      if (showContado) {
        text += `   • Contado / Efectivo: ${formatCurrency(t.precioContado)}\n`;
      }
      if (hasC4) {
        text += `   • 4 Cuotas Banco Pampa: 4 cuotas de ${formatCurrency(
          t.precioCuota4
        )} | Precio Final: ${formatCurrency(t.precioCuota4 * 4)}\n`;
      }
      if (hasC20) {
        text += `   • 20 Cuotas Banco Pampa: 20 cuotas de ${formatCurrency(
          t.precioCuota20
        )} | Precio Final: ${formatCurrency(t.precioCuota20 * 20)}\n`;
      }
      if (!hasC4 && !hasC20) {
        text += `   • Financiación: No disponible en cuotas (Solo Contado / Transferencia)\n`;
      }
      text += `\n`;
    });
    text += `Consultas, turnos y colocación por WhatsApp al ${COMPANY_INFO.branches.santaRosa.phoneDisplay} (Santa Rosa) o ${COMPANY_INFO.branches.america.phoneDisplay} (América).`;
    return text;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const activeChunk = chunks[activeChunkIndex] || [];
  const currentChunkIsCompact = isCompactTireLayout(activeChunk.length);

  return (
    <div
      id="share-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-[#f7f6f2] border border-[#cfcbc2] w-full max-w-2xl shadow-2xl flex flex-col my-auto rounded-none text-[#262626]">
        {/* Header */}
        <div className="px-4 py-2.5 bg-[#e5e2da] border-b border-[#cfcbc2] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#333333]" />
            <span className="text-xs font-semibold text-[#262626] uppercase tracking-wider">
              Compartir Selección ({selectedTires.length} neumáticos)
            </span>
            {chunks.length > 1 && (
              <span className="bg-[#111111] text-white text-[10px] font-black px-1.5 py-0.5 rounded-none uppercase">
                {chunks.length} imágenes
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-[#555555] hover:text-[#111111] hover:bg-[#d8d4cb] transition-colors rounded-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 text-xs">
          {/* Informative Rule Banners based on count of tires */}
          {selectedTires.length > 6 && (
            <div className="p-3 bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20] flex items-start gap-2 rounded-none">
              <span className="text-sm shrink-0">📸</span>
              <div>
                <p className="font-bold text-[11px] uppercase tracking-wide">
                  Distribución Equitativa Automática ({chunks.length} Imágenes)
                </p>
                <p className="text-[11px] text-[#2e7d32] mt-0.5 leading-relaxed">
                  Al superar los 6 neumáticos, se dividen de forma equitativa en{' '}
                  <strong>{chunks.length} imágenes</strong> (
                  {chunks
                    .map((c, i) => `Imagen ${i + 1}: ${c.length} neumáticos`)
                    .join(' y ')}
                  ). Así la imagen no se agranda ni pierde nitidez al enviarla por
                  WhatsApp.
                </p>
              </div>
            </div>
          )}

          {selectedTires.length > 3 && selectedTires.length <= 6 && (
            <div className="p-2.5 bg-[#fefce8] border border-[#fef08a] text-[#854d0e] flex items-center gap-2 rounded-none">
              <span className="text-sm shrink-0">⚡</span>
              <div>
                <span className="font-bold text-[11px] block">
                  Modo Compacto Activo (Ocupa la mitad de espacio)
                </span>
                <span className="text-[11px] text-[#a16207]">
                  Al superar 3 neumáticos, el formato se acomoda con tarjetas
                  compactas al 50% de altura para mantener el tamaño ideal de
                  pantalla móvil.
                </span>
              </div>
            </div>
          )}

          {/* Style Prompt Configuration for AI Generation */}
          <div className="bg-white border border-[#cfcbc2] p-2.5 space-y-1.5 rounded-none">
            <label className="text-[11px] font-bold uppercase text-[#111111] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
              Prompt de Estilo (Generación por IA)
            </label>
            <input
              type="text"
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
              placeholder="Ej. 'minimalista, colores oscuros', 'estilo neón', 'cinemático'"
              className="w-full px-2.5 py-1.5 bg-[#fbfbf9] border border-[#cfcbc2] text-xs font-medium text-[#111111] focus:outline-none focus:border-[#111111]"
            />
            <p className="text-[10px] text-gray-500">
              Personaliza la atmósfera estética para llamadas al backend de generación de imágenes/videos por IA.
            </p>
          </div>

          {/* Options Row: Contado Toggle & Modal View Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Contado Toggle */}
            <div className="p-2.5 bg-[#eeebe3] border border-[#d8d4cb] flex items-center justify-between rounded-none">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#444444]" />
                <span className="font-semibold text-[#262626]">
                  Incluir precio de contado
                </span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showContado}
                  onChange={(e) => setShowContado(e.target.checked)}
                  className="w-4 h-4 rounded-none border-[#999999] text-[#222222] focus:ring-0 accent-[#222222]"
                />
                <span className="font-medium text-[#262626]">Mostrar</span>
              </label>
            </div>

            {/* Modal Tab Switcher: Preview vs Manage Tires */}
            <div className="flex items-center border border-[#d8d4cb] bg-[#eeebe3] p-0.5 rounded-none">
              <button
                type="button"
                onClick={() => setActiveModalTab('preview')}
                className={`flex-1 py-1.5 px-3 flex items-center justify-center gap-1.5 font-semibold text-xs transition-colors cursor-pointer ${
                  activeModalTab === 'preview'
                    ? 'bg-[#ffffff] text-[#111111] shadow-2xs border border-[#cfcbc2]'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Vista Previa del Flyer</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('list')}
                className={`flex-1 py-1.5 px-3 flex items-center justify-center gap-1.5 font-semibold text-xs transition-colors cursor-pointer ${
                  activeModalTab === 'list'
                    ? 'bg-[#ffffff] text-[#111111] shadow-2xs border border-[#cfcbc2]'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Editar Lista ({selectedTires.length})</span>
              </button>
            </div>
          </div>

          {/* Sub-Tabs for Multiple Images when chunks.length > 1 */}
          {chunks.length > 1 && (
            <div className="flex items-center gap-1.5 border-b border-[#cfcbc2] pb-2 overflow-x-auto">
              <span className="text-[11px] font-bold text-[#555555] uppercase tracking-wide mr-1">
                Imágenes:
              </span>
              {chunks.map((chunk, idx) => {
                const isActive = activeChunkIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveChunkIndex(idx)}
                    className={`px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 rounded-none cursor-pointer ${
                      isActive
                        ? 'bg-[#111111] text-[#f7f6f2] border border-[#111111] shadow-xs'
                        : 'bg-[#eeebe3] text-[#333333] border border-[#cfcbc2] hover:bg-[#e4e0d6]'
                    }`}
                  >
                    <span>Imagen {idx + 1}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-none ${
                        isActive
                          ? 'bg-[#22c55e] text-[#052e16]'
                          : 'bg-[#d8d4cb] text-[#444444]'
                      }`}
                    >
                      {chunk.length} gomas
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 1: Live Flyer Preview */}
          {activeModalTab === 'preview' && (
            <div className="border border-[#cfcbc2] bg-[#f0ede6] p-3 rounded-none">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#d8d4cb] text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#111111] uppercase tracking-wide">
                    Previsualización{' '}
                    {chunks.length > 1
                      ? `(Imagen ${activeChunkIndex + 1} de ${chunks.length})`
                      : ''}
                  </span>
                  {currentChunkIsCompact && (
                    <span className="bg-[#fef08a] text-[#854d0e] border border-[#facc15] px-1.5 py-0.2 text-[9px] font-black uppercase">
                      50% Espacio
                    </span>
                  )}
                </div>
                <span className="text-[#666666]">
                  {activeChunk.length} neumático(s) en esta imagen
                </span>
              </div>

              {selectedTires.length === 0 ? (
                <div className="p-8 text-center text-[#777777] bg-[#fbfbf9]">
                  <p className="font-medium">No hay neumáticos seleccionados</p>
                  <p className="text-[11px] text-[#888888] mt-1">
                    Cerrá esta ventana y marcá neumáticos en la tabla.
                  </p>
                </div>
              ) : (
                <div className="flex justify-center max-h-[380px] overflow-y-auto p-2 bg-[#d8d4cb]/40 border border-[#cfcbc2]">
                  <FlyerPoster
                    tires={activeChunk}
                    chunkIndex={activeChunkIndex}
                    totalChunks={chunks.length}
                    totalSelectedCount={selectedTires.length}
                    showContado={showContado}
                    isCompact={currentChunkIsCompact}
                    id="modal-interactive-flyer-preview"
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Tires to include with delete button */}
          {activeModalTab === 'list' && (
            <div className="border border-[#d8d4cb] bg-[#fbfbf9] rounded-none">
              <div className="px-3 py-2 bg-[#eeebe3] border-b border-[#d8d4cb] flex items-center justify-between">
                <span className="font-semibold text-[#262626] uppercase text-[11px] tracking-wider">
                  Neumáticos seleccionados ({selectedTires.length})
                </span>
                <span className="text-[11px] text-[#666666]">
                  Hacé clic en el tacho para quitar de la lista
                </span>
              </div>

              {selectedTires.length === 0 ? (
                <div className="p-6 text-center text-[#777777] bg-[#f7f6f2]">
                  <p className="font-medium">No hay neumáticos seleccionados</p>
                  <p className="text-[11px] text-[#888888] mt-1">
                    Cerrá esta ventana y marcá las casillas en la tabla de Excel.
                  </p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-[#e5e2da]">
                  {selectedTires.map((tire, index) => {
                    return (
                      <div
                        key={tire.id}
                        className="px-3 py-2 flex items-center justify-between hover:bg-[#f2efe8] transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="font-mono text-[10px] text-[#777777] w-4">
                            {index + 1}.
                          </span>
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold border border-[#ccc8be] bg-[#ebe7df] text-[#262626] rounded-none uppercase">
                            {tire.marca}
                          </span>
                          <span className="font-semibold text-[#262626] truncate">
                            {tire.modelo}
                          </span>
                          <span className="text-[#555555] font-mono text-[11px]">
                            {tire.dimensiones}
                          </span>
                          {showContado && (
                            <span className="text-[#333333] font-mono font-medium ml-1">
                              {formatCurrency(tire.precioContado)}
                            </span>
                          )}
                        </div>

                        {onDeselectTire && (
                          <button
                            type="button"
                            onClick={() => onDeselectTire(tire.id)}
                            title="Quitar este neumático"
                            className="p-1 text-[#777777] hover:text-[#b91c1c] hover:bg-[#e8e4db] transition-colors rounded-none cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons: Descargar y Compartir */}
          <div className="pt-2 border-t border-[#cfcbc2] space-y-2">
            {/* Info notice: selection cleared only on close */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#eeebe3] border border-[#d8d4cb] text-xs">
              <span className="text-[11px] sm:text-xs text-[#555555]">
                💡 La selección de la tabla de Excel se limpiará automáticamente al
                cerrar esta ventana.
              </span>
              {onDeselectAll && (
                <button
                  type="button"
                  id="modal-deselect-all-now-btn"
                  onClick={onDeselectAll}
                  className="text-[#666666] hover:text-[#111111] underline text-[11px] cursor-pointer"
                >
                  Deseleccionar todo ahora
                </button>
              )}
            </div>

            {/* Primary Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {/* Botón Descargar PDF */}
              <button
                type="button"
                id="btn-download-pdf"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf || selectedTires.length === 0}
                className="py-2.5 px-3 bg-[#111111] hover:bg-[#000000] active:bg-[#000000] text-[#f7f6f2] font-semibold text-xs rounded-none border border-[#000000] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#74c987]" />
                    <span>
                      PDF {chunks.length > 1 ? `(${chunks.length} págs)` : ''}
                    </span>
                  </>
                )}
              </button>

              {/* Botón Descargar Imagen(es) PNG */}
              <button
                type="button"
                id="btn-download-image"
                onClick={handleDownloadAll}
                disabled={isGenerating || selectedTires.length === 0}
                className="py-2.5 px-3 bg-[#eeebe3] hover:bg-[#e4e0d6] text-[#262626] font-semibold text-xs rounded-none border border-[#cfcbc2] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                title={
                  chunks.length > 1
                    ? `Descargar las ${chunks.length} imágenes generadas en PNG`
                    : 'Descargar imagen PNG'
                }
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="truncate">
                      {generatingProgress || 'Generando...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#262626]" />
                    <span>
                      {chunks.length > 1
                        ? `Todas (${chunks.length} PNG)`
                        : 'Imagen (PNG)'}
                    </span>
                  </>
                )}
              </button>

              {/* WA Santa Rosa */}
              <a
                href={`https://wa.me/${COMPANY_INFO.branches.santaRosa.phoneRaw}?text=${encodeURIComponent(
                  generateShareText()
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Enviar al WhatsApp de Santa Rosa: ${COMPANY_INFO.branches.santaRosa.phoneDisplay}`}
                className="py-2.5 px-2 bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-xs rounded-none border border-[#14532d] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="truncate">WA Santa Rosa</span>
              </a>

              {/* WA América */}
              <a
                href={`https://wa.me/${COMPANY_INFO.branches.america.phoneRaw}?text=${encodeURIComponent(
                  generateShareText()
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Enviar al WhatsApp de América: ${COMPANY_INFO.branches.america.phoneDisplay}`}
                className="py-2.5 px-2 bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-xs rounded-none border border-[#14532d] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="truncate">WA América</span>
              </a>
            </div>

            {/* Secondary Actions: Individual chunk download if multiple images, Copy text, Close */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {chunks.length > 1 ? (
                <button
                  type="button"
                  id="btn-download-single-chunk"
                  onClick={() => handleDownloadSingle(activeChunkIndex)}
                  disabled={isGenerating}
                  className="py-2 px-3 bg-[#e5e2da] hover:bg-[#dcd8cf] text-[#262626] font-medium text-xs rounded-none border border-[#cfcbc2] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title={`Descargar únicamente la Imagen ${activeChunkIndex + 1}`}
                >
                  <Download className="w-3.5 h-3.5 text-[#555555]" />
                  <span>Descargar solo Img {activeChunkIndex + 1}</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleCopyText}
                className="py-2 px-3 bg-[#eeebe3] hover:bg-[#e4e0d6] text-[#333333] font-medium text-xs rounded-none border border-[#cfcbc2] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#1e4620]" />
                    <span>¡Texto copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#555555]" />
                    <span>Copiar resumen en texto</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="modal-close-window-btn"
                onClick={handleClose}
                className="py-2 px-3 bg-[#e5e2da] hover:bg-[#dcd8cf] text-[#262626] font-medium text-xs rounded-none border border-[#cfcbc2] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-[#555555]" />
                <span>Cerrar ventana</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Render Container for toPng / jsPDF generation (Off-screen) */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          pointerEvents: 'none',
        }}
      >
        {chunks.map((chunk, chunkIndex) => {
          const isCompact = isCompactTireLayout(chunk.length);
          return (
            <FlyerPoster
              key={`hidden-poster-${chunkIndex}`}
              forwardedRef={(el) => {
                chunkFlyerRefs.current[chunkIndex] = el;
              }}
              id={`flyer-render-canvas-${chunkIndex}`}
              tires={chunk}
              chunkIndex={chunkIndex}
              totalChunks={chunks.length}
              totalSelectedCount={selectedTires.length}
              showContado={showContado}
              isCompact={isCompact}
            />
          );
        })}
      </div>
    </div>
  );
};
