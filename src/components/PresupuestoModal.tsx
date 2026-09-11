import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  FileText,
  Plus,
  Minus,
  Trash2,
  User,
  Car,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Tire } from '../types';
import { formatCurrency } from '../utils/formatters';
import { COMPANY_INFO } from '../data/companyInfo';
import { CottaLogo, CottaBrandStrip } from './CottaLogo';

interface PresupuestoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTires: Tire[];
  onDeselectTire?: (id: string) => void;
  onDeselectAll?: () => void;
}

export const PresupuestoModal: React.FC<PresupuestoModalProps> = ({
  isOpen,
  onClose,
  selectedTires,
  onDeselectTire,
  onDeselectAll,
}) => {
  // Quantities per tire ID: if stock > 0, defaults to available stock (up to 4), otherwise 0 (Sin stock)
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    selectedTires.forEach((t) => {
      initial[t.id] = t.stock > 0 ? Math.min(4, t.stock) : 0;
    });
    return initial;
  });

  // Keep quantities updated when new tires are selected
  useEffect(() => {
    setQuantities((prev) => {
      const updated = { ...prev };
      selectedTires.forEach((t) => {
        if (updated[t.id] === undefined) {
          updated[t.id] = t.stock > 0 ? Math.min(4, t.stock) : 0;
        }
      });
      return updated;
    });
  }, [selectedTires]);

  const [clientName, setClientName] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [validez, setValidez] = useState('7 días');
  const [notaAdicional, setNotaAdicional] = useState('Solo hacemos colocación y picos (incluidos).');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [stylePrompt, setStylePrompt] = useState('minimalista, colores oscuros, estilo neón');

  const quotationDocRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const getQuantity = (id: string) => {
    if (quantities[id] !== undefined) return quantities[id];
    const tire = selectedTires.find((t) => t.id === id);
    return tire && tire.stock > 0 ? Math.min(4, tire.stock) : 0;
  };

  const handleUpdateQty = (id: string, delta: number) => {
    const current = getQuantity(id);
    const next = Math.max(0, current + delta);
    setQuantities((prev) => ({ ...prev, [id]: next }));
  };

  const handleSetQty = (id: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, val) }));
  };

  // Calculations
  const totalUnits = selectedTires.reduce((acc, t) => acc + getQuantity(t.id), 0);
  const totalContado = selectedTires.reduce(
    (acc, t) => acc + t.precioContado * getQuantity(t.id),
    0
  );
  const totalCuota4 = selectedTires.reduce(
    (acc, t) => acc + (t.precioCuota4 || 0) * getQuantity(t.id),
    0
  );
  const totalFinanciado4 = totalCuota4 * 4;

  const totalCuota20 = selectedTires.reduce(
    (acc, t) => acc + (t.precioCuota20 || 0) * getQuantity(t.id),
    0
  );
  const totalFinanciado20 = totalCuota20 * 20;

  const hasAnyCuota4 = selectedTires.some(
    (t) => (t.precioCuota4 || 0) > 0 && getQuantity(t.id) > 0
  );
  const hasAnyCuota20 = selectedTires.some(
    (t) => (t.precioCuota20 || 0) > 0 && getQuantity(t.id) > 0
  );
  const hasAnyCuotas = hasAnyCuota4 || hasAnyCuota20;

  const handleClose = () => {
    if (onDeselectAll) {
      onDeselectAll();
    }
    onClose();
  };

  // Formatted text for WhatsApp and Clipboard
  const generatePresupuestoText = (branchName?: string) => {
    let text = `🏢 *COTTA NEUMÁTICOS* - *VENTAS POR MAYOR Y MENOR*\n`;
    text += `📍 *Santa Rosa L.P.:* ${COMPANY_INFO.branches.santaRosa.phoneDisplay}\n`;
    text += `📍 *América Bs.As.:* ${COMPANY_INFO.branches.america.phoneDisplay}\n`;
    text += `📸 *Redes:* ${COMPANY_INFO.socialHandle}\n`;
    text += `------------------------------------\n`;
    text += `📄 *PRESUPUESTO FORMAL DE NEUMÁTICOS*\n`;
    text += `Fecha: ${todayStr} | Validez: ${validez}\n`;
    if (clientName.trim()) text += `Cliente: *${clientName.trim()}*\n`;
    if (vehicleInfo.trim()) text += `Vehículo / Patente: *${vehicleInfo.trim()}*\n`;
    text += `------------------------------------\n\n`;

    selectedTires.forEach((t, i) => {
      const q = getQuantity(t.id);
      const subtotalC = t.precioContado * q;
      const subCuota4 = (t.precioCuota4 || 0) * q;
      const subCuota20 = (t.precioCuota20 || 0) * q;
      const hasC4 = (t.precioCuota4 || 0) > 0;
      const hasC20 = (t.precioCuota20 || 0) > 0;

      text += `${i + 1}. *${t.marca.toUpperCase()} ${t.modelo}*\n`;
      text += `   Medida: ${t.dimensiones} (${t.indice || 'Std'})\n`;
      text += `   Cantidad: ${q} cubiertas\n`;
      text += `   • Contado / Efectivo: ${formatCurrency(subtotalC)} (${formatCurrency(t.precioContado)} c/u)\n`;
      if (hasC4) {
        text += `   • 4 cuotas fijas (Banco Pampa): 4 cuotas de ${formatCurrency(subCuota4)} | Precio Final: ${formatCurrency(subCuota4 * 4)}\n`;
      }
      if (hasC20) {
        text += `   • 20 cuotas fijas (Banco Pampa): 20 cuotas de ${formatCurrency(subCuota20)} | Precio Final: ${formatCurrency(subCuota20 * 20)}\n`;
      }
      if (!hasC4 && !hasC20) {
        text += `   • Financiación: No disponible para este modelo (Solo Contado / Transferencia)\n`;
      }
      text += `\n`;
    });

    text += `------------------------------------\n`;
    text += `*TOTALES PRESUPUESTADOS (${totalUnits} cubiertas):*\n`;
    text += `💰 *Pago Contado / Efectivo:* ${formatCurrency(totalContado)}\n`;
    if (totalCuota4 > 0) {
      text += `💳 *Financiado 4 cuotas fijas (Banco Pampa):* 4 cuotas de ${formatCurrency(totalCuota4)} | Precio Final: ${formatCurrency(totalFinanciado4)}\n`;
    }
    if (totalCuota20 > 0) {
      text += `💳 *Financiado 20 cuotas fijas (Banco Pampa):* 20 cuotas de ${formatCurrency(totalCuota20)} | Precio Final: ${formatCurrency(totalFinanciado20)}\n`;
    }
    if (totalCuota4 <= 0 && totalCuota20 <= 0) {
      text += `💵 *Condición comercial:* Venta al contado / transferencia (Sin financiación en cuotas disponible).\n`;
    }
    if (notaAdicional.trim()) {
      text += `\nNota: ${notaAdicional.trim()}\n`;
    }
    text += `\nPara coordinar turnos o colocación, comunicarse por WhatsApp al ${COMPANY_INFO.branches.santaRosa.phoneDisplay} (Santa Rosa) o ${COMPANY_INFO.branches.america.phoneDisplay} (América).`;
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePresupuestoText());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Direct PDF Generation & Download
  const handleDownloadPdf = async () => {
    if (!quotationDocRef.current || selectedTires.length === 0) return;
    try {
      setIsGeneratingPdf(true);
      const element = quotationDocRef.current;

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        filter: (node) => {
          if (node instanceof HTMLElement) {
            if (
              node.classList.contains('pdf-exclude') ||
              node.getAttribute('data-hide-on-pdf') === 'true'
            ) {
              return false;
            }
          }
          return true;
        },
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 10; // 10mm
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = (img.height * contentWidth) / img.width;

      let heightLeft = contentHeight;
      let position = margin;

      pdf.addImage(dataUrl, 'PNG', margin, position, contentWidth, contentHeight);
      heightLeft -= (pageHeight - margin * 2);

      while (heightLeft > 0) {
        position = position - pageHeight + margin * 2;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', margin, position, contentWidth, contentHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      const clientPart = clientName.trim()
        ? `_${clientName.trim().replace(/[^a-zA-Z0-9]/g, '_')}`
        : '';
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `Presupuesto_Neumaticos${clientPart}_${dateStr}.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Direct PNG Image Generation & Download
  const handleDownloadImage = async () => {
    if (!quotationDocRef.current || selectedTires.length === 0) return;
    try {
      setIsGeneratingImage(true);
      const element = quotationDocRef.current;

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        filter: (node) => {
          if (node instanceof HTMLElement) {
            if (
              node.classList.contains('pdf-exclude') ||
              node.getAttribute('data-hide-on-pdf') === 'true'
            ) {
              return false;
            }
          }
          return true;
        },
      });

      const clientPart = clientName.trim()
        ? `_${clientName.trim().replace(/[^a-zA-Z0-9]/g, '_')}`
        : '';
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `Presupuesto_Neumaticos${clientPart}_${dateStr}.png`;

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error al generar imagen del presupuesto:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div
      id="presupuesto-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-[#f7f6f2] border border-[#cfcbc2] w-full max-w-3xl shadow-xl flex flex-col my-auto rounded-none text-[#262626]">
        {/* Header - Excel Ribbon Style */}
        <div className="px-4 py-2.5 bg-[#e5e2da] border-b border-[#cfcbc2] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#333333]" />
            <span className="text-xs font-semibold text-[#262626] uppercase tracking-wider">
              Generador de Presupuesto ({selectedTires.length} modelos)
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-[#555555] hover:text-[#111111] hover:bg-[#d8d4cb] transition-colors rounded-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 text-xs overflow-y-auto max-h-[82vh]">
          {/* Controls: Client & Budget Meta Section */}
          <div className="bg-[#eeebe3] border border-[#cfcbc2] p-3 rounded-none grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#555555] uppercase tracking-wider mb-1">
                Cliente (Opcional)
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[#777777]" />
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] focus:outline-none focus:border-[#666666]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#555555] uppercase tracking-wider mb-1">
                Vehículo / Patente
              </label>
              <div className="relative">
                <Car className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[#777777]" />
                <input
                  type="text"
                  placeholder="Ej. Hilux / AF 123 CD"
                  value={vehicleInfo}
                  onChange={(e) => setVehicleInfo(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] focus:outline-none focus:border-[#666666]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#555555] uppercase tracking-wider mb-1">
                Validez de la oferta
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[#777777]" />
                <select
                  value={validez}
                  onChange={(e) => setValidez(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] focus:outline-none focus:border-[#666666]"
                >
                  <option value="Inmediata">Inmediata (Sujeta a stock)</option>
                  <option value="48 horas">48 horas</option>
                  <option value="7 días">7 días</option>
                  <option value="15 días">15 días</option>
                </select>
              </div>
            </div>
          </div>

          {/* Style Prompt Configuration for AI Generation */}
          <div className="bg-[#ffffff] border border-[#cfcbc2] p-2.5 space-y-1.5 rounded-none">
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

          {/* DOCUMENT CANVAS (Captured into the PDF) */}
          <div className="overflow-x-auto border border-[#cfcbc2]">
            <div
              ref={quotationDocRef}
              id="quotation-document-canvas"
              className="bg-white p-5 sm:p-6 text-[#262626] space-y-4"
              style={{ minWidth: '650px' }}
            >
              {/* Document Header - Authentic Cotta Neumáticos Business Card Style */}
              <div className="pb-3 border-b-2 border-[#111111] space-y-3">
                <div className="flex justify-between items-start gap-4">
                  {/* Brand Logo */}
                  <div className="flex flex-col">
                    <CottaLogo size="md" variant="dark" showSubtitle={true} />
                  </div>

                  {/* Branches and Contacts from Business Card */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#f8f7f4] p-2.5 border border-[#cfcbc2]">
                    {/* Santa Rosa Branch */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[#166534] font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" />
                        <span className="font-mono text-[11px] font-black tracking-tight text-[#111111]">
                          {COMPANY_INFO.branches.santaRosa.phoneDisplay}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-[#dc2626]">
                        <MapPin className="w-3 h-3 text-[#dc2626] flex-shrink-0" />
                        <span>{COMPANY_INFO.branches.santaRosa.city} {COMPANY_INFO.branches.santaRosa.province}</span>
                      </div>
                    </div>

                    {/* América Branch */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[#166534] font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" />
                        <span className="font-mono text-[11px] font-black tracking-tight text-[#111111]">
                          {COMPANY_INFO.branches.america.phoneDisplay}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-[#dc2626]">
                        <MapPin className="w-3 h-3 text-[#dc2626] flex-shrink-0" />
                        <span>{COMPANY_INFO.branches.america.city} {COMPANY_INFO.branches.america.province}</span>
                      </div>
                    </div>

                    {/* Social networks handle */}
                    <div className="col-span-2 pt-1 border-t border-[#e5e2da] flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#111111] flex items-center gap-1.5">
                        <span className="px-1 py-0.2 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-[8px] font-bold">
                          IG
                        </span>
                        <span className="px-1 py-0.2 bg-[#1877f2] text-white text-[8px] font-bold">
                          FB
                        </span>
                        <span>{COMPANY_INFO.socialHandle}</span>
                      </span>
                      <span className="text-[#666666] font-medium">Cotización Oficial</span>
                    </div>
                  </div>

                  {/* Document Date & Validity */}
                  <div className="text-right text-xs bg-[#f4f3ef] p-2 border border-[#cfcbc2] flex-shrink-0 min-w-[120px]">
                    <div className="text-[10px] uppercase font-bold text-[#555555]">Fecha</div>
                    <div className="font-mono font-bold text-xs text-[#111111]">{todayStr}</div>
                    <div className="text-[10px] uppercase font-bold text-[#555555] mt-1">Validez</div>
                    <div className="font-bold text-[11px] text-[#1e5828]">{validez}</div>
                  </div>
                </div>

                {/* Partner Brands Strip from Business Card */}
                <CottaBrandStrip theme="light" />
              </div>

              {/* Client & Vehicle Row */}
              <div className="grid grid-cols-2 gap-4 p-2.5 bg-[#f7f6f2] border border-[#e5e2da] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#666666] block">
                    Cliente
                  </span>
                  <span className="font-bold text-[#111111]">
                    {clientName.trim() ? clientName.trim() : 'Consumidor Final'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#666666] block">
                    Vehículo / Referencia
                  </span>
                  <span className="font-bold text-[#111111]">
                    {vehicleInfo.trim() ? vehicleInfo.trim() : 'No especificado'}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              {selectedTires.length === 0 ? (
                <div className="p-8 text-center text-[#777777] bg-[#fbfbf9] border border-[#e5e2da]">
                  <p className="font-medium">No hay neumáticos seleccionados</p>
                  <p className="text-[11px] text-[#888888] mt-1">
                    Marcá casillas en la tabla de stock para incluir modelos en la cotización.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs border border-[#d8d4cb]">
                  <thead className="bg-[#eeebe3] border-b border-[#d8d4cb] text-[#333333] text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="p-2 border-r border-[#d8d4cb]">Neumático / Medida</th>
                      <th className="p-2 text-center border-r border-[#d8d4cb] w-24">Cantidad</th>
                      <th className="p-2 text-right border-r border-[#d8d4cb]">P. Unitario</th>
                      <th className="p-2 text-right border-r border-[#d8d4cb]">Subt. Contado</th>
                      {hasAnyCuota4 && (
                        <th className="p-2 text-right border-r border-[#d8d4cb]">
                          4 Cuotas
                          <span className="block text-[8px] text-[#14532d] font-bold">Cuota y P. Final</span>
                        </th>
                      )}
                      {hasAnyCuota20 && (
                        <th className="p-2 text-right border-r border-[#d8d4cb]">
                          20 Cuotas
                          <span className="block text-[8px] text-[#14532d] font-bold">Cuota y P. Final</span>
                        </th>
                      )}
                      {!hasAnyCuotas && (
                        <th className="p-2 text-center border-r border-[#d8d4cb] w-36">
                          Financiación
                          <span className="block text-[8px] text-[#666666] font-bold">Disponibilidad</span>
                        </th>
                      )}
                      <th className="p-2 text-center w-8 pdf-exclude"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e2da]">
                    {selectedTires.map((tire) => {
                      const qty = getQuantity(tire.id);
                      const subtotalContado = tire.precioContado * qty;
                      const subtotalCuota4 = (tire.precioCuota4 || 0) * qty;
                      const subtotalCuota20 = (tire.precioCuota20 || 0) * qty;
                      const hasC4 = (tire.precioCuota4 || 0) > 0;
                      const hasC20 = (tire.precioCuota20 || 0) > 0;

                      return (
                        <tr key={tire.id} className="hover:bg-[#fbfbf9] transition-colors">
                          {/* Tire info */}
                          <td className="p-2 border-r border-[#d8d4cb]">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-[#ebe7df] text-[#262626] border border-[#cfcbc2]">
                                {tire.marca}
                              </span>
                              <span className="font-bold text-[#111111]">{tire.modelo}</span>
                            </div>
                            <div className="font-mono text-[#555555] text-[11px] mt-0.5">
                              {tire.dimensiones} {tire.indice ? `(${tire.indice})` : ''} • {tire.rodado}
                            </div>
                          </td>

                          {/* Quantity */}
                          <td className="p-2 text-center border-r border-[#d8d4cb]">
                            <div className="inline-flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(tire.id, -1)}
                                className="w-4 h-4 bg-[#eeebe3] hover:bg-[#e4e0d6] text-[#333333] border border-[#cfcbc2] flex items-center justify-center pdf-exclude"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              {qty > 0 ? (
                                <span className="font-bold font-mono text-xs px-1 text-[#111111]">
                                  {qty} un.
                                </span>
                              ) : (
                                <span className="font-bold font-mono text-[10px] px-1.5 py-0.2 bg-[#fef2f2] text-[#b91c1c] border border-[#fca5a5]">
                                  Sin stock
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(tire.id, 1)}
                                className="w-4 h-4 bg-[#eeebe3] hover:bg-[#e4e0d6] text-[#333333] border border-[#cfcbc2] flex items-center justify-center pdf-exclude"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </td>

                          {/* Unit price */}
                          <td className="p-2 text-right font-mono text-[#444444] border-r border-[#d8d4cb]">
                            {formatCurrency(tire.precioContado)}
                          </td>

                          {/* Subtotal Cash */}
                          <td className="p-2 text-right font-mono font-bold text-[#111111] border-r border-[#d8d4cb]">
                            {formatCurrency(subtotalContado)}
                          </td>

                          {/* 4 Installments (only rendered if at least one item has it) */}
                          {hasAnyCuota4 && (
                            <td className="p-2 text-right font-mono border-r border-[#d8d4cb]">
                              {hasC4 ? (
                                <>
                                  <div className="font-bold text-[#111111] text-xs">
                                    4x {formatCurrency(subtotalCuota4)}
                                  </div>
                                  <div className="text-[10px] text-[#14532d] font-bold">
                                    Final: {formatCurrency(subtotalCuota4 * 4)}
                                  </div>
                                </>
                              ) : (
                                <span className="text-[10px] text-[#888888] font-mono italic">
                                  No disponible
                                </span>
                              )}
                            </td>
                          )}

                          {/* 20 Installments (only rendered if at least one item has it) */}
                          {hasAnyCuota20 && (
                            <td className="p-2 text-right font-mono border-r border-[#d8d4cb]">
                              {hasC20 ? (
                                <>
                                  <div className="font-bold text-[#1e5828] text-xs">
                                    20x {formatCurrency(subtotalCuota20)}
                                  </div>
                                  <div className="text-[10px] text-[#14532d] font-bold">
                                    Final: {formatCurrency(subtotalCuota20 * 20)}
                                  </div>
                                </>
                              ) : (
                                <span className="text-[10px] text-[#888888] font-mono italic">
                                  No disponible
                                </span>
                              )}
                            </td>
                          )}

                          {/* When no item in budget has installments */}
                          {!hasAnyCuotas && (
                            <td className="p-2 text-center border-r border-[#d8d4cb]">
                              <span className="px-2 py-0.5 bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] text-[10px] font-bold uppercase tracking-tight">
                                Solo Contado
                              </span>
                            </td>
                          )}

                          {/* Delete item button */}
                          <td className="p-2 text-center pdf-exclude">
                            {onDeselectTire && (
                              <button
                                type="button"
                                onClick={() => onDeselectTire(tire.id)}
                                title="Quitar de este presupuesto"
                                className="p-1 text-[#888888] hover:text-[#991b1b] hover:bg-[#faeceb] transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Totals Summary Box */}
              {selectedTires.length > 0 && (
                <div className="p-3 bg-[#f7f6f2] border border-[#cfcbc2]">
                  <div
                    className={`grid ${
                      !hasAnyCuotas
                        ? 'grid-cols-1 max-w-sm mx-auto'
                        : hasAnyCuota4 && hasAnyCuota20
                        ? 'grid-cols-3'
                        : 'grid-cols-2'
                    } gap-3 text-center`}
                  >
                    {/* Contado */}
                    <div className="p-2 bg-white border border-[#d8d4cb]">
                      <span className="text-[9px] uppercase font-bold text-[#555555] block">
                        Total Contado ({totalUnits} unid.)
                      </span>
                      <span className="text-sm font-bold font-mono text-[#111111] block mt-0.5">
                        {formatCurrency(totalContado)}
                      </span>
                      <span className="text-[9px] text-[#777777] block mt-0.5">
                        Efectivo / Transferencia / Débito
                      </span>
                    </div>

                    {/* 4 Cuotas */}
                    {hasAnyCuota4 && (
                      <div className="p-2 bg-white border border-[#d8d4cb]">
                        <span className="text-[9px] uppercase font-bold text-[#14532d] block">
                          4 Cuotas (Banco Pampa)
                        </span>
                        <span className="text-sm font-bold font-mono text-[#111111] block mt-0.5">
                          4 cuotas de {formatCurrency(totalCuota4)}
                        </span>
                        <span className="text-[10.5px] font-bold text-[#14532d] font-mono block mt-0.5">
                          Precio Final: {formatCurrency(totalFinanciado4)}
                        </span>
                      </div>
                    )}

                    {/* 20 Cuotas */}
                    {hasAnyCuota20 && (
                      <div className="p-2 bg-white border border-[#d8d4cb]">
                        <span className="text-[9px] uppercase font-bold text-[#1e5828] block">
                          20 Cuotas (Banco Pampa)
                        </span>
                        <span className="text-sm font-bold font-mono text-[#1e5828] block mt-0.5">
                          20 cuotas de {formatCurrency(totalCuota20)}
                        </span>
                        <span className="text-[10.5px] font-bold text-[#1e5828] font-mono block mt-0.5">
                          Precio Final: {formatCurrency(totalFinanciado20)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Conditions & Notes inside the document */}
                  {hasAnyCuotas ? (
                    <div className="mt-2.5 p-1.5 bg-[#f0fdf4] border border-[#bbf7d0] text-center text-[10px] text-[#14532d] font-bold">
                      💳 Promoción de cuotas fijas exclusiva abonando con tarjetas de crédito Banco de La Pampa (Paquete Pampa).
                    </div>
                  ) : (
                    <div className="mt-2.5 p-1.5 bg-[#f8f7f4] border border-[#d8d4cb] text-center text-[10px] text-[#555555] font-bold">
                      💵 Condición de venta: Pago contado en efectivo, débito o transferencia inmediata (Sin financiación en cuotas disponible).
                    </div>
                  )}
                  {notaAdicional.trim() && (
                    <div className="mt-2.5 pt-2 border-t border-[#e5e2da] text-left text-[11px] text-[#444444]">
                      <span className="font-bold text-[#222222]">Observaciones:</span>{' '}
                      {notaAdicional.trim()}
                    </div>
                  )}

                  {/* Document Footer with Cotta Neumáticos branches */}
                  <div className="mt-3 pt-2 border-t-2 border-[#111111] flex flex-wrap justify-between items-center text-[10px] text-[#444444] gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#111111] uppercase tracking-wider">COTTA NEUMÁTICOS</span>
                      <span>•</span>
                      <span>Santa Rosa (L.P.): <strong className="font-mono text-[#111111]">{COMPANY_INFO.branches.santaRosa.phoneDisplay}</strong></span>
                      <span>•</span>
                      <span>América (Bs.As.): <strong className="font-mono text-[#111111]">{COMPANY_INFO.branches.america.phoneDisplay}</strong></span>
                    </div>
                    <div className="text-right text-[9px] text-[#666666]">
                      <span>{COMPANY_INFO.socialHandle} • Ventas por mayor y menor</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observations input field (Interactive outside document) */}
          <div className="p-2.5 bg-[#eeebe3] border border-[#cfcbc2]">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <label className="block text-[10px] font-semibold text-[#555555] uppercase tracking-wider">
                Editar Observaciones / Servicios del presupuesto
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setNotaAdicional('Solo hacemos colocación y picos (incluidos).')}
                  className="text-[10px] px-2 py-0.5 bg-[#ffffff] border border-[#cfcbc2] text-[#333333] hover:bg-[#e4e0d6] cursor-pointer"
                >
                  Solo colocación y picos
                </button>
                <button
                  type="button"
                  onClick={() => setNotaAdicional('Incluye colocación y picos nuevos sin cargo.')}
                  className="text-[10px] px-2 py-0.5 bg-[#ffffff] border border-[#cfcbc2] text-[#333333] hover:bg-[#e4e0d6] cursor-pointer"
                >
                  Picos sin cargo
                </button>
                <button
                  type="button"
                  onClick={() => setNotaAdicional('')}
                  className="text-[10px] px-1.5 py-0.5 bg-[#ffffff] border border-[#cfcbc2] text-[#777777] hover:text-[#111111] hover:bg-[#e4e0d6] cursor-pointer"
                  title="Borrar observación"
                >
                  Limpiar
                </button>
              </div>
            </div>
            <input
              type="text"
              value={notaAdicional}
              onChange={(e) => setNotaAdicional(e.target.value)}
              placeholder="Ej. Solo hacemos colocación y picos (incluidos)."
              className="w-full px-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] focus:outline-none focus:border-[#666666]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-[#cfcbc2] space-y-2">
            {/* Info notice: selection cleared only on close */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#eeebe3] border border-[#d8d4cb] text-xs">
              <span className="text-[11px] sm:text-xs text-[#555555]">
                💡 La selección de la tabla de Excel se limpiará automáticamente al cerrar esta ventana.
              </span>
              {onDeselectAll && (
                <button
                  type="button"
                  id="presupuesto-deselect-all-now-btn"
                  onClick={onDeselectAll}
                  className="text-[#666666] hover:text-[#111111] underline text-[11px] cursor-pointer"
                >
                  Deseleccionar todo ahora
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* Botón Descargar PDF */}
              <button
                type="button"
                id="btn-download-pdf"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf || isGeneratingImage || selectedTires.length === 0}
                className="py-2.5 px-2 bg-[#111111] hover:bg-[#000000] active:bg-[#000000] text-[#f7f6f2] font-semibold text-xs rounded-none border border-[#000000] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <span className="truncate">Generando...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-[#74c987] flex-shrink-0" />
                    <span className="truncate">Descargar PDF</span>
                  </>
                )}
              </button>

              {/* Botón Descargar Imagen (PNG) */}
              <button
                type="button"
                id="btn-download-image"
                onClick={handleDownloadImage}
                disabled={isGeneratingImage || isGeneratingPdf || selectedTires.length === 0}
                className="py-2.5 px-2 bg-[#1e293b] hover:bg-[#0f172a] active:bg-[#000000] text-[#f7f6f2] font-semibold text-xs rounded-none border border-[#0f172a] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <span className="truncate">Generando...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 text-[#38bdf8] flex-shrink-0" />
                    <span className="truncate">Imagen (PNG)</span>
                  </>
                )}
              </button>

              {/* Enviar WhatsApp Santa Rosa */}
              <a
                href={`https://wa.me/${COMPANY_INFO.branches.santaRosa.phoneRaw}?text=${encodeURIComponent(generatePresupuestoText('Santa Rosa'))}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Enviar al WhatsApp de Santa Rosa: ${COMPANY_INFO.branches.santaRosa.phoneDisplay}`}
                className={`py-2.5 px-2 bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-xs rounded-none border border-[#14532d] flex items-center justify-center gap-1.5 transition-colors ${
                  selectedTires.length === 0 ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">WA Santa Rosa</span>
              </a>

              {/* Enviar WhatsApp América */}
              <a
                href={`https://wa.me/${COMPANY_INFO.branches.america.phoneRaw}?text=${encodeURIComponent(generatePresupuestoText('América'))}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Enviar al WhatsApp de América: ${COMPANY_INFO.branches.america.phoneDisplay}`}
                className={`py-2.5 px-2 bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-xs rounded-none border border-[#14532d] flex items-center justify-center gap-1.5 transition-colors ${
                  selectedTires.length === 0 ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">WA América</span>
              </a>

              {/* Copiar texto */}
              <button
                type="button"
                onClick={handleCopy}
                disabled={selectedTires.length === 0}
                className="py-2.5 px-2 bg-[#eeebe3] hover:bg-[#e4e0d6] text-[#333333] font-semibold text-xs rounded-none border border-[#cfcbc2] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer col-span-2 sm:col-span-1"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4 text-[#1e4620] flex-shrink-0" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#555555] flex-shrink-0" />
                    <span className="truncate">Copiar Texto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
