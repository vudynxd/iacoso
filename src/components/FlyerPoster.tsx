import React from 'react';
import { MapPin } from 'lucide-react';
import { Tire } from '../types';
import { formatCurrency, getBrandBadgeStyle } from '../utils/formatters';
import { COMPANY_INFO } from '../data/companyInfo';
import { CottaLogo, CottaBrandStrip } from './CottaLogo';

interface FlyerPosterProps {
  tires: Tire[];
  chunkIndex?: number;
  totalChunks?: number;
  totalSelectedCount?: number;
  showContado: boolean;
  isCompact: boolean;
  id?: string;
  forwardedRef?: React.Ref<HTMLDivElement>;
  scale?: number;
}

export const FlyerPoster: React.FC<FlyerPosterProps> = ({
  tires,
  chunkIndex = 0,
  totalChunks = 1,
  totalSelectedCount = tires.length,
  showContado,
  isCompact,
  id,
  forwardedRef,
}) => {
  return (
    <div
      ref={forwardedRef}
      id={id}
      className={`w-[420px] bg-white text-[#111111] ${
        isCompact ? 'p-4' : 'p-5'
      } flex flex-col justify-between font-sans select-none border-4 border-[#111111] shadow-xl`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Header - Authentic Cotta Neumáticos Business Card */}
      <div
        className={`${
          isCompact ? 'space-y-2 pb-2.5' : 'space-y-3 pb-3'
        } border-b-2 border-[#111111]`}
      >
        <div className="flex items-center justify-between">
          <CottaLogo size="md" variant="dark" showSubtitle={true} />
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              {totalChunks > 1 && (
                <span className="bg-[#b91c1c] text-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                  Parte {chunkIndex + 1}/{totalChunks}
                </span>
              )}
              <span className="bg-[#111111] text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider block">
                Stock Disponible
              </span>
            </div>
            <span className="text-[10px] text-[#14532d] font-black mt-0.5 block">
              Exclusivo Banco Pampa
            </span>
          </div>
        </div>

        {/* Partner Brands Strip from Business Card */}
        <CottaBrandStrip theme="light" />

        {/* Banco Pampa Exclusivity Banner */}
        <div className="bg-[#14532d] text-white px-2.5 py-1.5 flex items-center justify-between">
          <span className="font-black text-[10px] uppercase tracking-wider">
            💳 4 y 20 Cuotas Fijas Exclusivas
          </span>
          <span className="font-black text-[10px] bg-[#22c55e] text-[#052e16] px-1.5 py-0.5 uppercase tracking-wide">
            Banco Pampa
          </span>
        </div>
      </div>

      {/* Tires List */}
      <div className={`${isCompact ? 'py-2.5 space-y-1.5' : 'py-3.5 space-y-2.5'} flex-1`}>
        {tires.map((tire) => {
          const brandStyle = getBrandBadgeStyle(tire.marca);

          // COMPACT LAYOUT: Used when image has > 3 tires to occupy half the vertical space
          if (isCompact) {
            const hasCuota4 = (tire.precioCuota4 || 0) > 0;
            const hasCuota20 = (tire.precioCuota20 || 0) > 0;
            const hasAnyCuota = hasCuota4 || hasCuota20;

            return (
              <div
                key={tire.id}
                className="p-2 bg-[#fdfdfd] border-2 border-[#222222] rounded-none shadow-2xs"
              >
                {/* Row 1: Brand badge + Model + Dimensions + Contado (inline) */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-black uppercase border shrink-0 ${brandStyle.bg}`}
                    >
                      {tire.marca}
                    </span>
                    <span className="text-[11px] font-black text-[#111111] uppercase tracking-wide truncate">
                      {tire.modelo}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#444444] shrink-0">
                      {tire.dimensiones}
                    </span>
                  </div>
                  {showContado && hasAnyCuota && (
                    <div className="shrink-0 bg-[#f4f3ef] border border-[#d8d4cb] px-1.5 py-0.5 text-right">
                      <span className="text-[8px] uppercase text-[#666666] font-bold mr-1">
                        Contado:
                      </span>
                      <span className="font-mono font-black text-[11px] text-[#111111]">
                        {formatCurrency(tire.precioContado)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Row 2: Adapted strip based on installment availability */}
                {!hasAnyCuota ? (
                  <div className="bg-[#f0fdf4] border border-[#86efac] px-2 py-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] uppercase font-black px-1.5 py-0.2 bg-[#15803d] text-white tracking-wider">
                        Solo Contado
                      </span>
                      <span className="text-[9px] text-[#166534] font-semibold">
                        Sin cuotas disponibles para este producto
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-1.5">
                      <span className="text-[8px] uppercase text-[#555555] font-bold">Contado:</span>
                      <span className="font-mono font-black text-xs text-[#111111]">
                        {formatCurrency(tire.precioContado)}
                      </span>
                    </div>
                  </div>
                ) : hasCuota4 && hasCuota20 ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* 4 Cuotas Banco Pampa */}
                    <div className="bg-white border border-[#cfcbc2] px-2 py-1 flex items-center justify-between">
                      <span className="text-[8px] uppercase text-[#555555] font-bold tracking-wider">
                        4 Cuotas
                      </span>
                      <div className="text-right">
                        <span className="text-[10.5px] font-black text-[#111111] font-mono block leading-tight">
                          4x {formatCurrency(tire.precioCuota4)}
                        </span>
                        <span className="text-[8px] font-bold text-[#14532d] font-mono block leading-tight">
                          Final: {formatCurrency(tire.precioCuota4 * 4)}
                        </span>
                      </div>
                    </div>

                    {/* 20 Cuotas Banco Pampa */}
                    <div className="bg-[#111111] border border-[#111111] px-2 py-1 flex items-center justify-between text-white">
                      <span className="text-[8px] uppercase text-[#86efac] font-bold tracking-wider">
                        20 Cuotas
                      </span>
                      <div className="text-right">
                        <span className="text-[10.5px] font-black text-[#86efac] font-mono block leading-tight">
                          20x {formatCurrency(tire.precioCuota20)}
                        </span>
                        <span className="text-[8px] font-bold text-[#ffffff] font-mono block leading-tight">
                          Final: {formatCurrency(tire.precioCuota20 * 20)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : hasCuota4 ? (
                  <div className="bg-white border border-[#cfcbc2] px-2 py-1 flex items-center justify-between">
                    <span className="text-[8.5px] uppercase text-[#555555] font-bold tracking-wider">
                      4 Cuotas Banco Pampa
                    </span>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-[11px] font-black text-[#111111] font-mono">
                        4x {formatCurrency(tire.precioCuota4)}
                      </span>
                      <span className="text-[9px] font-bold text-[#14532d] font-mono">
                        (Final: {formatCurrency(tire.precioCuota4 * 4)})
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#111111] border border-[#111111] px-2 py-1 flex items-center justify-between text-white">
                    <span className="text-[8.5px] uppercase text-[#86efac] font-bold tracking-wider">
                      20 Cuotas Banco Pampa
                    </span>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-[11px] font-black text-[#86efac] font-mono">
                        20x {formatCurrency(tire.precioCuota20)}
                      </span>
                      <span className="text-[9px] font-bold text-[#ffffff] font-mono">
                        (Final: {formatCurrency(tire.precioCuota20 * 20)})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // STANDARD SPACIOUS LAYOUT: Used when image has <= 3 tires
          const hasCuota4 = (tire.precioCuota4 || 0) > 0;
          const hasCuota20 = (tire.precioCuota20 || 0) > 0;
          const hasAnyCuota = hasCuota4 || hasCuota20;

          return (
            <div
              key={tire.id}
              className="p-3 bg-[#fdfdfd] border-2 border-[#222222] rounded-none shadow-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black uppercase border ${brandStyle.bg}`}
                  >
                    {tire.marca}
                  </span>
                  <span className="text-xs font-black text-[#111111] uppercase tracking-wide">
                    {tire.modelo}
                  </span>
                </div>
                <span className="text-xs font-mono font-black text-[#111111]">
                  {tire.dimensiones}
                </span>
              </div>

              {!hasAnyCuota ? (
                /* Pure Cash-Only Product Layout */
                <div className="mt-2 bg-[#f0fdf4] border-2 border-[#16a34a] p-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase bg-[#15803d] text-white tracking-wider">
                        Venta Exclusiva Contado
                      </span>
                      <span className="text-[10px] text-[#166534] font-bold">
                        Sin cuotas disponibles para este producto
                      </span>
                    </div>
                    <span className="text-[10px] text-[#555555] block mt-1">
                      Pago contado efectivo, débito o transferencia bancaria
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase text-[#555555] font-bold block">
                      Precio Final
                    </span>
                    <span className="text-base font-black font-mono text-[#111111] block">
                      {formatCurrency(tire.precioContado)}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {showContado && (
                    <div className="flex items-center justify-between text-xs py-1 px-2 bg-[#f4f3ef] border border-[#e5e2da] text-[#222222] font-semibold mb-2">
                      <span className="text-[11px] uppercase tracking-wider text-[#555555]">
                        Precio Contado:
                      </span>
                      <span className="font-mono font-bold text-sm text-[#111111]">
                        {formatCurrency(tire.precioContado)}
                      </span>
                    </div>
                  )}

                  {hasCuota4 && hasCuota20 ? (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#e5e2da]">
                      <div className="bg-[#ffffff] border-2 border-[#cfcbc2] p-2 text-center">
                        <span className="text-[8.5px] uppercase text-[#555555] block font-bold tracking-wider">
                          4 Cuotas Banco Pampa
                        </span>
                        <span className="text-xs font-black text-[#111111] font-mono block mt-0.5">
                          4x {formatCurrency(tire.precioCuota4)}
                        </span>
                        <span className="text-[9.5px] font-bold text-[#14532d] font-mono block mt-0.5">
                          Final: {formatCurrency(tire.precioCuota4 * 4)}
                        </span>
                      </div>
                      <div className="bg-[#111111] border-2 border-[#111111] p-2 text-center">
                        <span className="text-[8.5px] uppercase text-[#86efac] block font-bold tracking-wider">
                          20 Cuotas Banco Pampa
                        </span>
                        <span className="text-xs font-black text-[#86efac] font-mono block mt-0.5">
                          20x {formatCurrency(tire.precioCuota20)}
                        </span>
                        <span className="text-[9.5px] font-bold text-[#ffffff] font-mono block mt-0.5">
                          Final: {formatCurrency(tire.precioCuota20 * 20)}
                        </span>
                      </div>
                    </div>
                  ) : hasCuota4 ? (
                    <div className="pt-1 border-t border-[#e5e2da]">
                      <div className="bg-[#ffffff] border-2 border-[#cfcbc2] p-2 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase text-[#555555] block font-bold tracking-wider">
                            4 Cuotas Banco Pampa
                          </span>
                          <span className="text-[9px] text-[#666666]">Plan 4 cuotas fijas</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-[#111111] font-mono block">
                            4x {formatCurrency(tire.precioCuota4)}
                          </span>
                          <span className="text-[9.5px] font-bold text-[#14532d] font-mono block">
                            Final: {formatCurrency(tire.precioCuota4 * 4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1 border-t border-[#e5e2da]">
                      <div className="bg-[#111111] border-2 border-[#111111] p-2 flex items-center justify-between text-white">
                        <div>
                          <span className="text-[9px] uppercase text-[#86efac] block font-bold tracking-wider">
                            20 Cuotas Banco Pampa
                          </span>
                          <span className="text-[9px] text-[#aaaaaa]">Plan 20 cuotas fijas</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-[#86efac] font-mono block">
                            20x {formatCurrency(tire.precioCuota20)}
                          </span>
                          <span className="text-[9.5px] font-bold text-[#ffffff] font-mono block">
                            Final: {formatCurrency(tire.precioCuota20 * 20)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer with Business Card Contact Details */}
      <div
        className={`${
          isCompact ? 'pt-2 space-y-1.5' : 'pt-3 space-y-2'
        } border-t-2 border-[#111111]`}
      >
        {/* Banco Pampa Exclusivity Legend or Cash-only Note */}
        {tires.some((t) => (t.precioCuota4 || 0) > 0 || (t.precioCuota20 || 0) > 0) ? (
          <div className="bg-[#f0fdf4] border border-[#86efac] px-2 py-1 text-center">
            <span className="text-[9px] text-[#14532d] font-bold block">
              * Financiación en cuotas fijas exclusiva con tarjetas Banco de La Pampa (Paquete Pampa).
            </span>
          </div>
        ) : (
          <div className="bg-[#f8f7f4] border border-[#cfcbc2] px-2 py-1 text-center">
            <span className="text-[9px] text-[#555555] font-bold block">
              * Precios promocionales válidos para pago contado en efectivo, débito o transferencia bancaria.
            </span>
          </div>
        )}

        {/* Branches row */}
        <div className="grid grid-cols-2 gap-2 bg-[#f8f7f4] p-1.5 border border-[#cfcbc2]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" />
              <span className="font-mono text-[11px] font-black tracking-tight text-[#111111]">
                {COMPANY_INFO.branches.santaRosa.phoneDisplay}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[8.5px] font-black uppercase text-[#dc2626]">
              <MapPin className="w-2.5 h-2.5 text-[#dc2626]" />
              <span>
                {COMPANY_INFO.branches.santaRosa.city} {COMPANY_INFO.branches.santaRosa.province}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" />
              <span className="font-mono text-[11px] font-black tracking-tight text-[#111111]">
                {COMPANY_INFO.branches.america.phoneDisplay}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[8.5px] font-black uppercase text-[#dc2626]">
              <MapPin className="w-2.5 h-2.5 text-[#dc2626]" />
              <span>
                {COMPANY_INFO.branches.america.city} {COMPANY_INFO.branches.america.province}
              </span>
            </div>
          </div>
        </div>

        {/* Social handle row */}
        <div className="flex items-center justify-between text-[9px] px-1 text-[#444444]">
          <div className="flex items-center gap-1.5 font-bold text-[#111111]">
            <span className="px-1 py-0.2 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-[8px] font-bold">
              IG
            </span>
            <span className="px-1 py-0.2 bg-[#1877f2] text-white text-[8px] font-bold">
              FB
            </span>
            <span>{COMPANY_INFO.socialHandle}</span>
          </div>
          <span className="text-[8.5px] text-[#777777] font-medium">
            {totalChunks > 1 ? `Parte ${chunkIndex + 1} de ${totalChunks} • ` : ''}*Precios sujetos a stock.
          </span>
        </div>
      </div>
    </div>
  );
};
