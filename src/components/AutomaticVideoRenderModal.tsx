import React, { useRef, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Play,
  X,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Video,
  Layers,
  FileCheck,
} from 'lucide-react';
import { triggerDirectDownload } from '../utils/storyVideoExporter';

export interface CompletedVideoItem {
  tireName: string;
  dimension: string;
  brand: string;
  url: string;
  filename: string;
}

interface AutomaticVideoRenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchMode: 'individual_per_tire' | 'combined_all_tires';
  totalTires: number;
  currentTireIndex: number;
  currentTireName: string;
  currentTireDimension: string;
  currentTireBrand: string;
  currentPercent: number;
  overallPercent: number;
  currentSec: number;
  totalSec: number;
  isCompleted: boolean;
  isError: boolean;
  errorMessage?: string;
  completedVideos: CompletedVideoItem[];
  onCancel?: () => void;
  previewCanvasSource?: HTMLCanvasElement | null;
}

export const AutomaticVideoRenderModal: React.FC<AutomaticVideoRenderModalProps> = ({
  isOpen,
  onClose,
  batchMode,
  totalTires,
  currentTireIndex,
  currentTireName,
  currentTireDimension,
  currentTireBrand,
  currentPercent,
  overallPercent,
  currentSec,
  totalSec,
  isCompleted,
  isError,
  errorMessage,
  completedVideos,
  onCancel,
  previewCanvasSource,
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePreviewVideo, setActivePreviewVideo] = useState<CompletedVideoItem | null>(null);

  // Synchronize live preview frame from exporter canvas
  useEffect(() => {
    if (!previewCanvasSource || !previewCanvasRef.current || isCompleted) return;
    const dest = previewCanvasRef.current;
    const ctx = dest.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(previewCanvasSource, 0, 0, dest.width, dest.height);
  }, [previewCanvasSource, currentSec, currentPercent, isCompleted]);

  if (!isOpen) return null;

  const isMultiBatch = batchMode === 'individual_per_tire' && totalTires > 1;

  const handleDownloadAllAgain = () => {
    completedVideos.forEach((vid, idx) => {
      setTimeout(() => {
        triggerDirectDownload(vid.url, vid.filename);
      }, idx * 400);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#121212] border-2 border-[#333333] rounded-2xl max-w-xl w-full p-5 sm:p-6 text-white shadow-2xl flex flex-col relative max-h-[92vh] overflow-y-auto">
        {/* Modal Close / Cancel Button */}
        <button
          type="button"
          onClick={isCompleted || isError ? onClose : onCancel || onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          title={isCompleted ? 'Cerrar' : 'Cancelar'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* ------------------------------------------------------------- */}
        {/* HEADER                                                        */}
        {/* ------------------------------------------------------------- */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : isError
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : isError ? (
              <AlertCircle className="w-6 h-6 text-red-400" />
            ) : (
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
            )}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight uppercase flex items-center gap-2">
              {isCompleted
                ? '¡Renderizado Completado con Éxito!'
                : isError
                ? 'Error en el Renderizado'
                : isMultiBatch
                ? `Renderizado Automático (${currentTireIndex + 1} de ${totalTires} Gomas)`
                : 'Renderizado Automático de Principio a Fin'}
            </h2>
            <p className="text-xs text-gray-400">
              {isCompleted
                ? 'Los videos se han procesado de 0s a fin y se descargaron a tu PC.'
                : isError
                ? 'Ocurrió un problema durante el procesamiento.'
                : 'Procesando en segundo plano. La descarga comenzará automáticamente.'}
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* ERROR STATE                                                   */}
        {/* ------------------------------------------------------------- */}
        {isError && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 my-2 text-center">
            <p className="text-sm font-bold text-red-300 mb-2">
              {errorMessage || 'No se pudo completar el renderizado del video.'}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Verifica que el navegador permita descargas de archivos o prueba con la opción HD Rápido (720x1280).
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-lg"
            >
              Entendido / Cerrar
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ACTIVE PROCESSING STATE                                       */}
        {/* ------------------------------------------------------------- */}
        {!isCompleted && !isError && (
          <div className="space-y-4 my-2">
            {/* Live Frame Preview & Tire Info */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 flex flex-col sm:flex-row items-center gap-4">
              {/* Miniature Canvas Frame */}
              <div className="w-28 sm:w-32 aspect-9/16 bg-black rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-inner flex items-center justify-center relative">
                <canvas
                  ref={previewCanvasRef}
                  width={216}
                  height={384}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  REC
                </div>
              </div>

              {/* Current Tire details */}
              <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider">
                  <Video className="w-3.5 h-3.5" />
                  {isMultiBatch
                    ? `Neumático ${currentTireIndex + 1} de ${totalTires}`
                    : 'Video de Historia'}
                </div>

                <div>
                  <div className="text-sm font-black text-white uppercase tracking-wide">
                    {currentTireBrand} {currentTireName}
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400">
                    {currentTireDimension}
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Generando fotogramas con animación 3D, badges automotores y cartelera de precios.
                </p>
              </div>
            </div>

            {/* Current Video Progress Bar */}
            <div className="space-y-1.5 bg-[#161616] p-3 rounded-xl border border-[#262626]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-300 font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  Progreso del video actual:
                </span>
                <span className="text-amber-400 font-black">{currentPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-100 ease-out"
                  style={{ width: `${currentPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>Tiempo: {currentSec.toFixed(1)}s / {totalSec}s</span>
                <span>30 FPS Fluido</span>
              </div>
            </div>

            {/* Multi-Tire Batch Overall Progress Bar */}
            {isMultiBatch && (
              <div className="space-y-1.5 bg-[#161616] p-3 rounded-xl border border-[#262626]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300 font-bold flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-cyan-400" />
                    Progreso total del lote ({totalTires} gomas):
                  </span>
                  <span className="text-cyan-400 font-black">{overallPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200 ease-out"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>{completedVideos.length} de {totalTires} descargados</span>
                  <span>{Math.round(((currentTireIndex + 1) / totalTires) * 100)}% avance</span>
                </div>
              </div>
            )}

            {/* List of already completed videos in this batch */}
            {completedVideos.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Descargados en tu computadora ({completedVideos.length}):
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                  {completedVideos.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-950/30 border border-emerald-500/20 rounded-lg text-xs"
                    >
                      <span className="text-emerald-300 font-bold flex items-center gap-1.5 truncate mr-2">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        {item.brand} {item.dimension}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        Descargado
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reassurance Message */}
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200/90 leading-relaxed text-center">
              💡 <strong>100% Automático:</strong> No toques nada. La PC renderiza de inicio a fin y el navegador descargará cada video automáticamente.
            </div>

            {/* Cancel Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onCancel || onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-bold text-xs rounded-lg transition-colors"
              >
                Detener Renderizado
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* COMPLETED STATE                                               */}
        {/* ------------------------------------------------------------- */}
        {isCompleted && (
          <div className="space-y-4 my-2">
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center">
              <p className="text-sm font-black text-emerald-300 mb-1">
                {isMultiBatch
                  ? `¡Se descargaron ${completedVideos.length} videos automáticamente!`
                  : '¡El video se procesó de 0s a fin y fue descargado!'}
              </p>
              <p className="text-xs text-gray-300">
                Los archivos están listos en tu carpeta de <strong>Descargas</strong> para publicar en WhatsApp, Instagram o TikTok.
              </p>
            </div>

            {/* Video Cards List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {completedVideos.map((vid, idx) => (
                <div
                  key={idx}
                  className="bg-[#1c1c1c] border border-[#2e2e2e] hover:border-amber-500/40 p-3 rounded-xl flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-black text-[10px] uppercase">
                        Goma {idx + 1}
                      </span>
                      <span className="font-black text-xs text-white uppercase truncate">
                        {vid.brand} {vid.tireName}
                      </span>
                    </div>
                    <p className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                      {vid.dimension}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
                      {vid.filename}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActivePreviewVideo(vid)}
                      className="px-2.5 py-1.5 bg-[#2a2a2a] hover:bg-[#383838] text-gray-200 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
                      title="Previsualizar video"
                    >
                      <Play className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Ver</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerDirectDownload(vid.url, vid.filename)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-lg flex items-center gap-1 shadow transition-colors"
                      title="Volver a descargar a la PC"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Bajar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Single Video Player Modal / Section */}
            {activePreviewVideo && (
              <div className="bg-black/90 border border-amber-500/40 rounded-xl p-3 flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-amber-400 truncate">
                    Reproduciendo: {activePreviewVideo.brand} {activePreviewVideo.dimension}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePreviewVideo(null)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    Cerrar Reproductor ✕
                  </button>
                </div>
                <div className="w-48 aspect-9/16 bg-black rounded-lg overflow-hidden border border-white/20">
                  <video
                    src={activePreviewVideo.url}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {completedVideos.length > 1 && (
                <button
                  type="button"
                  onClick={handleDownloadAllAgain}
                  className="flex-1 py-2.5 bg-[#262626] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 border border-white/10 transition-colors"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Volver a Descargar Todo</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Listo / Volver</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
