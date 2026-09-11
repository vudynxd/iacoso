import React, { useState, useEffect } from 'react';
import { X, Save, Disc3 } from 'lucide-react';
import { Tire, VehicleCategory } from '../types';
import { formatCurrency } from '../utils/formatters';

interface TireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tire: Partial<Tire>) => void;
  initialData?: Tire | null;
  existingBrands?: string[];
}

/**
 * Flexible price parser that handles plain integers (150000), 
 * Argentine thousands dots (150.000), or decimals (150000.50 or 150.000,50)
 */
const parseCustomPrice = (val: string): number => {
  if (!val) return 0;
  const cleaned = val.trim().replace(/[$ ]/g, '');
  if (!cleaned) return 0;

  // Argentine thousand format: 150.000 or 1.500.000
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, '')) || 0;
  }
  // Argentine format with decimals: 150.000,50
  if (/^\d{1,3}(\.\d{3})+,\d+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
  }
  // Comma as decimal separator: 150000,50
  if (/^\d+,\d+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(',', '.')) || 0;
  }
  // Anglo thousand format: 150,000
  if (/^\d{1,3}(,\d{3})+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/,/g, '')) || 0;
  }
  // Standard number or fallback
  return parseFloat(cleaned) || 0;
};

export const TireModal: React.FC<TireModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [dimensiones, setDimensiones] = useState('');
  const [rodado, setRodado] = useState('R16');
  const [categoria, setCategoria] = useState<VehicleCategory>('Auto');
  const [indice, setIndice] = useState('');
  const [stockStr, setStockStr] = useState('');
  const [precioContadoStr, setPrecioContadoStr] = useState('');
  const [precioCuota4Str, setPrecioCuota4Str] = useState('');
  const [precioCuota20Str, setPrecioCuota20Str] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Reset or load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setMarca(initialData.marca || '');
        setModelo(initialData.modelo || '');
        setDimensiones(initialData.dimensiones || '');
        setRodado(initialData.rodado || 'R16');
        setCategoria(initialData.categoria || 'Auto');
        setIndice(initialData.indice || '');
        setStockStr(initialData.stock !== undefined ? String(initialData.stock) : '');
        setPrecioContadoStr(initialData.precioContado ? String(initialData.precioContado) : '');
        setPrecioCuota4Str(initialData.precioCuota4 ? String(initialData.precioCuota4) : '');
        setPrecioCuota20Str(initialData.precioCuota20 ? String(initialData.precioCuota20) : '');
        setCodigo(initialData.codigo || '');
        setDescripcion(initialData.descripcion || '');
      } else {
        // Completely clean slate: no suggestions, no pre-filled values
        setMarca('');
        setModelo('');
        setDimensiones('');
        setRodado('R16');
        setCategoria('Auto');
        setIndice('');
        setStockStr('');
        setPrecioContadoStr('');
        setPrecioCuota4Str('');
        setPrecioCuota20Str('');
        setCodigo('');
        setDescripcion('');
      }
    }
  }, [initialData, isOpen]);

  // Derive rim (rodado) from dimensions if user types e.g. "205/55 R16"
  const handleDimensionesChange = (val: string) => {
    setDimensiones(val);
    const match = val.match(/R\s?(\d{2})/i);
    if (match) {
      setRodado(`R${match[1]}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marca.trim() || !modelo.trim() || !dimensiones.trim()) {
      return;
    }

    const parsedContado = parseCustomPrice(precioContadoStr);
    const parsedCuota4 = parseCustomPrice(precioCuota4Str);
    const parsedCuota20 = parseCustomPrice(precioCuota20Str);
    const parsedStock = parseInt(stockStr, 10) || 0;

    const tireToSave: Partial<Tire> = {
      marca: marca.trim(),
      modelo: modelo.trim(),
      dimensiones: dimensiones.trim(),
      rodado,
      categoria,
      indice: indice.trim(),
      precioContado: Math.max(0, parsedContado),
      precioCuota4: Math.max(0, parsedCuota4),
      precioCuota20: Math.max(0, parsedCuota20),
      stock: Math.max(0, parsedStock),
      codigo: codigo.trim() || `COD-${Math.floor(1000 + Math.random() * 9000)}`,
      descripcion: descripcion.trim(),
    };

    onSave(tireToSave);
    onClose();
  };

  if (!isOpen) return null;

  const numCuota4 = parseCustomPrice(precioCuota4Str);
  const numCuota20 = parseCustomPrice(precioCuota20Str);

  return (
    <div
      id="tire-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-[#f7f6f2] border border-[#cfcbc2] rounded-none shadow-xl w-full max-w-xl overflow-hidden my-auto text-[#262626]">
        {/* Header */}
        <div className="px-4 py-2.5 bg-[#e5e2da] border-b border-[#cfcbc2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#262626] text-[#f7f6f2] flex items-center justify-center rounded-none">
              <Disc3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#262626] uppercase tracking-wider">
                {initialData ? 'Editar Neumático' : 'Nuevo Neumático en el Inventario'}
              </h2>
              <p className="text-[11px] text-[#666666]">
                Completá los datos y definí el precio que quieras sin restricciones
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#666666] hover:text-[#111111] p-1 rounded-none hover:bg-[#d8d4cb] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="p-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Marca */}
            <div>
              <label className="block text-[11px] font-semibold text-[#333333] mb-1 uppercase tracking-wider">
                Marca <span className="text-[#991b1b]">*</span>
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] focus:outline-none focus:border-[#666666] transition-colors"
                placeholder="Ej. Michelin, Pirelli, Bridgestone, Zmax..."
              />
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-[11px] font-semibold text-[#333333] mb-1 uppercase tracking-wider">
                Modelo <span className="text-[#991b1b]">*</span>
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] focus:outline-none focus:border-[#666666] transition-colors"
                placeholder="Ej. Primacy 4+, Cinturato P7, Dueler, NY-901..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Dimensiones */}
            <div>
              <label className="block text-[11px] font-semibold text-[#333333] mb-1 uppercase tracking-wider">
                Dimensiones <span className="text-[#991b1b]">*</span>
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                value={dimensiones}
                onChange={(e) => handleDimensionesChange(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] font-mono font-semibold focus:outline-none focus:border-[#666666] transition-colors"
                placeholder="Ej. 205/55 R16"
              />
            </div>

            {/* Rodado */}
            <div>
              <label className="block text-[11px] font-semibold text-[#333333] mb-1 uppercase tracking-wider">
                Rodado
              </label>
              <select
                value={rodado}
                onChange={(e) => setRodado(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] focus:outline-none focus:border-[#666666] transition-colors"
              >
                {['R13', 'R14', 'R15', 'R16', 'R17', 'R18', 'R19', 'R20', 'R21', 'R22'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-[11px] font-semibold text-[#333333] mb-1 uppercase tracking-wider">
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as VehicleCategory)}
                className="w-full px-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] focus:outline-none focus:border-[#666666] transition-colors"
              >
                <option value="Auto">Auto</option>
                <option value="SUV / 4x4">SUV / 4x4</option>
                <option value="Utilitario">Utilitario</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Indice Carga/Velocidad */}
            <div>
              <label className="block text-[11px] font-semibold text-[#333333] mb-1 uppercase tracking-wider">
                Índice de Carga / Velocidad (Opcional)
              </label>
              <input
                type="text"
                autoComplete="off"
                value={indice}
                onChange={(e) => setIndice(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] font-mono focus:outline-none focus:border-[#666666] transition-colors"
                placeholder="Ej. 91V, 112T, 82T"
              />
            </div>

            {/* Stock disponible */}
            <div>
              <label className="block text-[11px] font-semibold text-[#333333] mb-1 uppercase tracking-wider">
                Cantidad en Stock (Unidades)
              </label>
              <input
                type="number"
                min="0"
                autoComplete="off"
                value={stockStr}
                onChange={(e) => setStockStr(e.target.value)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] font-mono font-semibold focus:outline-none focus:border-[#666666] transition-colors"
              />
            </div>
          </div>

          {/* Pricing Box - PRECIOS 100% LIBRES SIN SUGERENCIAS */}
          <div className="bg-[#eeebe3] border border-[#cfcbc2] rounded-none p-3 space-y-2">
            <span className="text-xs font-semibold text-[#262626] block">
              Precios de Venta ($ ARS) — Ingreso Libre
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Precio Contado */}
              <div>
                <label className="block text-[10px] font-semibold text-[#333333] mb-0.5 uppercase tracking-wider">
                  Contado Mayorista ($) <span className="text-[#991b1b]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    required
                    placeholder="Ej. 120000"
                    value={precioContadoStr}
                    onChange={(e) => setPrecioContadoStr(e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] font-mono font-bold focus:outline-none focus:border-[#262626]"
                  />
                </div>
              </div>

              {/* 4 Cuotas */}
              <div>
                <label className="block text-[10px] font-semibold text-[#333333] mb-0.5 uppercase tracking-wider">
                  4 Cuotas ($ por cuota)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    value={precioCuota4Str}
                    onChange={(e) => setPrecioCuota4Str(e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] font-mono font-bold focus:outline-none focus:border-[#262626]"
                  />
                </div>
                {numCuota4 > 0 && (
                  <span className="text-[10px] text-[#15803d] font-mono font-medium block mt-0.5 truncate">
                    Total: {formatCurrency(numCuota4 * 4)}
                  </span>
                )}
              </div>

              {/* 20 Cuotas */}
              <div>
                <label className="block text-[10px] font-semibold text-[#333333] mb-0.5 uppercase tracking-wider">
                  20 Cuotas ($ por cuota)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    value={precioCuota20Str}
                    onChange={(e) => setPrecioCuota20Str(e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] font-mono font-bold focus:outline-none focus:border-[#262626]"
                  />
                </div>
                {numCuota20 > 0 && (
                  <span className="text-[10px] text-[#15803d] font-mono font-medium block mt-0.5 truncate">
                    Total: {formatCurrency(numCuota20 * 20)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-[#333333] mb-1 uppercase tracking-wider">
              Notas / Descripción (Opcional)
            </label>
            <input
              type="text"
              autoComplete="off"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#ffffff] border border-[#cfcbc2] rounded-none text-xs text-[#262626] focus:outline-none focus:border-[#666666] transition-colors"
              placeholder="Ej. Compuesto de sílice, tracción para ripio y asfalto..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#cfcbc2]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#eeebe3] hover:bg-[#e4e0d6] text-[#333333] text-xs font-medium rounded-none border border-[#cfcbc2] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#262626] hover:bg-[#111111] text-[#f7f6f2] font-medium text-xs rounded-none border border-[#262626] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {initialData ? 'Guardar Cambios' : 'Agregar Neumático al Inventario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
