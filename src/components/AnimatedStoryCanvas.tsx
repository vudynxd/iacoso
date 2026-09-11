import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  MessageCircle,
  ShieldCheck,
  Award,
  Car,
  Wrench,
  Gauge,
  Activity,
  Volume2,
  VolumeX,
  Flame,
} from 'lucide-react';
import { PromoTireItem } from './PromoFlyerModal';
import { StoryThemeStyle } from '../utils/storyAnimationStyles';
import { getBrandBadgeStyle } from '../data/tirePhotos';
import { formatCurrency } from '../utils/formatters';
import { COMPANY_INFO } from '../data/companyInfo';
import { CottaLogo } from './CottaLogo';
import {
  TireImagePresentationMode,
  processImageBackgroundCutout,
} from '../utils/tireImageEnhancer';
import { renderMotionBackground } from '../utils/motionBackgroundRenderer';
import { StoryThemeMode, StoryVideoDisplayMode } from '../utils/storyVideoExporter';
import { automotiveAudio } from '../utils/automotiveSoundFx';

export interface AnimatedStoryCanvasProps {
  tires: PromoTireItem[];
  activeStoryIndex: number;
  onSelectStoryIndex: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  storyProgress: number; // 0 to 100
  themeStyle: StoryThemeStyle;
  promoBadgeText: string;
  showCuotasPampa: boolean;
  includeValvesAndMounting: boolean;
  presentationMode: TireImagePresentationMode;
  themeMode?: StoryThemeMode;
  displayMode?: StoryVideoDisplayMode;
  onSelectSceneProgress?: (progress: number) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  tireRotationSpeed?: number;
  showTelemetryHUD?: boolean;
  burnoutSmokeLevel?: number;
  suspensionBounce?: boolean;
  camberAngle?: number;
}

export const AnimatedStoryCanvas: React.FC<AnimatedStoryCanvasProps> = ({
  tires,
  activeStoryIndex,
  onSelectStoryIndex,
  isPlaying,
  onTogglePlay,
  onRestart,
  storyProgress,
  themeStyle,
  promoBadgeText,
  showCuotasPampa,
  includeValvesAndMounting,
  presentationMode,
  themeMode = 'dark',
  displayMode = 'optimal_sales',
  onSelectSceneProgress,
  canvasRef,
  tireRotationSpeed = 1.0,
  showTelemetryHUD = true,
  burnoutSmokeLevel = 35,
  suspensionBounce = true,
  camberAngle = 0,
}) => {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const [cutoutImgUrl, setCutoutImgUrl] = useState<string | null>(null);
  const [interactiveTireAngle, setInteractiveTireAngle] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isHoveringTire, setIsHoveringTire] = useState(false);

  const currentItem = tires[activeStoryIndex] || tires[0];
  const isLight = themeMode === 'light';

  // Process tire image cutout automatically
  useEffect(() => {
    if (!currentItem?.photoUrl || presentationMode === 'studio-frame') {
      setCutoutImgUrl(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = processImageBackgroundCutout(img, 38);
        setCutoutImgUrl(canvas.toDataURL());
      } catch {
        setCutoutImgUrl(null);
      }
    };
    img.src = currentItem.photoUrl;
  }, [currentItem?.photoUrl, presentationMode]);

  // Motion Background Canvas Animation Loop
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const width = canvas.width;
      const height = canvas.height;
      const scale = width / 1080;

      renderMotionBackground(
        ctx,
        width,
        height,
        scale,
        elapsed * Math.max(0.2, tireRotationSpeed),
        themeStyle.motionBackground || 'carbon-dark-studio',
        themeStyle.accentColor || '#facc15',
        themeStyle.secondaryColor || '#ef4444',
        themeMode === 'light' ? 'light' : 'dark',
        themeStyle.customMotionConfig
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [themeStyle, themeMode, tireRotationSpeed]);

  if (!currentItem) {
    return null;
  }

  // Price calculations
  const promoPrice =
    currentItem.promoMode === 'percent_off'
      ? Math.round(currentItem.precioOriginal * (1 - currentItem.discountPercent / 100))
      : currentItem.promoMode === 'direct_price'
      ? currentItem.directPromoPrice || currentItem.precioOriginal
      : currentItem.precioOriginal;

  const savings = Math.max(0, currentItem.precioOriginal - promoPrice);
  const cuota4 = Math.round((promoPrice * 1.15) / 4);
  const cuota20 = Math.round((promoPrice * 1.45) / 20);
  const brandBadge = getBrandBadgeStyle(currentItem.marca);
  const activeTireDisplayUrl = cutoutImgUrl || currentItem.photoUrl;

  // Scene acts
  const isAct1 = storyProgress < 25;
  const isAct2 = storyProgress >= 25 && storyProgress < 50;
  const isAct3 = storyProgress >= 50 && storyProgress < 75;
  const isAct4 = storyProgress >= 75;

  // Telemetry values dynamically synced to progress
  const speedKmh = Math.round(80 + Math.sin((storyProgress / 100) * Math.PI * 2) * 45 + (tireRotationSpeed * 30));
  const rpmValue = Math.round(2200 + Math.sin((storyProgress / 100) * Math.PI * 4) * 1600 + (tireRotationSpeed * 1200));
  const tireTempFront = Math.round(68 + (storyProgress / 100) * 14 + (tireRotationSpeed * 6));
  const tireTempRear = Math.round(72 + (storyProgress / 100) * 12 + (tireRotationSpeed * 8));

  // Interactive tire click handler
  const handleTireClick = () => {
    setInteractiveTireAngle((prev) => prev + 45);
    if (soundEnabled) {
      automotiveAudio.playEngineRev();
      automotiveAudio.playTireBurnout();
    }
  };

  return (
    <div
      ref={canvasRef}
      id="cotta-story-canvas"
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden select-none ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#06070a] text-white'
      }`}
      style={{
        boxShadow: `0 0 40px -10px ${themeStyle.accentColor}30`,
      }}
    >
      {/* Layer 1: Procedural Canvas */}
      <canvas
        ref={bgCanvasRef}
        width={1080}
        height={1920}
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Layer 2: Subtle Atmospheric Vignette */}
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(241, 245, 249, 0.45) 80%, rgba(203, 213, 225, 0.75) 100%)'
            : 'radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(6, 7, 10, 0.5) 75%, rgba(0, 0, 0, 0.92) 100%)',
        }}
      />

      {/* ====================================================================== */}
      {/* 1. TOP HEADER & HUD BAR                                                */}
      {/* ====================================================================== */}
      <div className="relative z-10 p-3 pb-0 space-y-2 shrink-0">
        {/* Story 4-Segment Progress Bar */}
        <div className="grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((actIdx) => {
            const actStart = actIdx * 25;
            const actEnd = actStart + 25;
            let fillPct = 0;
            if (storyProgress >= actEnd) fillPct = 100;
            else if (storyProgress > actStart) {
              fillPct = ((storyProgress - actStart) / 25) * 100;
            }

            return (
              <button
                key={actIdx}
                type="button"
                onClick={() => onSelectSceneProgress && onSelectSceneProgress(actStart + 2)}
                className="h-1 rounded-full bg-white/20 overflow-hidden cursor-pointer relative"
                title={`Fase ${actIdx + 1}`}
              >
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${fillPct}%`,
                    backgroundColor: themeStyle.accentColor || '#facc15',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Brand Header Lockup */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-black/80 border border-white/20 flex items-center justify-center p-1 shadow-md">
              <CottaLogo size="sm" variant="light" showSubtitle={false} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black tracking-wider uppercase text-white">
                  COTTA NEUMÁTICOS
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-[8.5px] font-bold">
                  ✓
                </span>
              </div>
              <span
                className="text-[9px] font-mono font-bold tracking-wider uppercase block"
                style={{ color: themeStyle.accentColor }}
              >
                {themeStyle.tagline || 'ESTUDIO DE OFERTAS 2026'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Interactive Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) automotiveAudio.playEngineRev();
              }}
              className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                soundEnabled
                  ? 'bg-amber-400 text-black border-amber-300'
                  : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
              title={soundEnabled ? 'Sonido Activado' : 'Activar Sonido Motor'}
            >
              {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            </button>

            {/* Campaign Badge */}
            <div
              className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border shadow-sm flex items-center gap-1"
              style={{
                backgroundColor: `${themeStyle.accentColor}25`,
                borderColor: themeStyle.accentColor,
                color: themeStyle.accentColor,
              }}
            >
              <Zap className="w-2.5 h-2.5 fill-current" />
              <span>{promoBadgeText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 2. CENTER STAGE: TIRE & TELEMETRY                                      */}
      {/* ====================================================================== */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-3 py-1 my-auto overflow-hidden">
        {/* Brand & Model Lockup */}
        <div className="text-center space-y-0.5 z-20 mb-1">
          <div
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-black tracking-wider uppercase shadow-xs border border-white/20"
            style={{ backgroundColor: brandBadge.bg, color: brandBadge.text }}
          >
            <Award className="w-2.5 h-2.5" />
            <span>LÍNEA HOMOLOGADA {currentItem.marca.toUpperCase()}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white drop-shadow-md">
            {currentItem.marca}
          </h2>
          <p
            className="text-xs sm:text-sm font-black uppercase tracking-wider"
            style={{ color: themeStyle.accentColor }}
          >
            {currentItem.modelo}
          </p>
        </div>

        {/* HERO TIRE CONTAINER (Interactive Click & Float) */}
        <div
          className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center my-0.5 cursor-pointer group"
          onClick={handleTireClick}
          onMouseEnter={() => setIsHoveringTire(true)}
          onMouseLeave={() => setIsHoveringTire(false)}
          title="Hacé clic para acelerar y rotar el neumático con sonido"
        >
          {/* Burnout Smoke Effect when active */}
          {burnoutSmokeLevel > 20 && (
            <motion.div
              animate={{
                opacity: [0.15, 0.4, 0.15],
                scale: [0.95, 1.1, 0.95],
              }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="absolute -bottom-4 w-40 h-16 rounded-full blur-xl pointer-events-none"
              style={{
                background: `radial-gradient(ellipse, ${themeStyle.accentColor}35 0%, rgba(255,255,255,0.15) 50%, transparent 80%)`,
              }}
            />
          )}

          {/* Floor Shadow */}
          <div
            className="absolute bottom-1 w-36 h-6 rounded-[100%] blur-sm pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 45%, transparent 75%)',
            }}
          />

          {/* Tire Graphic */}
          <motion.div
            className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center"
            animate={
              isPlaying
                ? {
                    y: suspensionBounce ? [-3, 3, -3] : 0,
                    rotate: interactiveTireAngle,
                    rotateY: tireRotationSpeed > 0 ? [-8, 8, -8] : 0,
                  }
                : {
                    rotate: interactiveTireAngle,
                  }
            }
            style={{
              transform: `rotate(${camberAngle}deg)`,
            }}
            transition={{
              duration: 3 / Math.max(0.5, tireRotationSpeed),
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <img
              src={activeTireDisplayUrl}
              alt={`${currentItem.marca} ${currentItem.modelo}`}
              className="w-full h-full object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.85)] select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Telemetry HUD Badges Floating on Tire */}
          {showTelemetryHUD && (
            <>
              {/* Left Speedometer HUD */}
              <div className="absolute left-0 top-6 bg-black/80 backdrop-blur-md border border-white/15 px-2 py-1 rounded-lg text-left shadow-lg pointer-events-none">
                <div className="flex items-center gap-1 text-[8px] font-mono text-zinc-400">
                  <Activity className="w-2.5 h-2.5 text-red-500" />
                  <span>VELOCIDAD</span>
                </div>
                <div className="text-xs font-mono font-black text-white">
                  {speedKmh} <span className="text-[8px] text-zinc-400">KM/H</span>
                </div>
              </div>

              {/* Right Temp HUD */}
              <div className="absolute right-0 top-6 bg-black/80 backdrop-blur-md border border-white/15 px-2 py-1 rounded-lg text-right shadow-lg pointer-events-none">
                <div className="flex items-center justify-end gap-1 text-[8px] font-mono text-zinc-400">
                  <Flame className="w-2.5 h-2.5 text-amber-400" />
                  <span>TEMPERATURA</span>
                </div>
                <div className="text-xs font-mono font-black text-amber-300">
                  {tireTempFront}°C <span className="text-[8px] text-zinc-400">CALIENTE</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dynamic Scene Cards */}
        <div className="w-full z-20 mt-1 max-w-[340px]">
          <AnimatePresence mode="wait">
            {/* ACT 1: HOOK (0 - 25%) */}
            {isAct1 && (
              <motion.div
                key="act1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="w-full rounded-xl p-2 bg-[#0c0e14]/90 backdrop-blur-md border border-white/15 text-center shadow-lg"
              >
                <div className="flex items-center justify-center gap-1 text-[9px] font-mono font-black uppercase text-red-400 mb-0.5">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>OFERTA LIMITADA // LA PAMPA</span>
                </div>
                <div className="text-xs sm:text-sm font-black uppercase text-white">
                  Renová tus neumáticos con seguridad de fábrica
                </div>
              </motion.div>
            )}

            {/* ACT 2: TECHNICAL SPEC (25 - 50%) */}
            {isAct2 && (
              <motion.div
                key="act2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="w-full rounded-xl p-2 bg-[#0c0e14]/90 backdrop-blur-md border border-white/15 text-center shadow-lg"
              >
                <div className="flex items-center justify-center gap-1 text-[8.5px] font-mono text-zinc-400 mb-0.5">
                  <Gauge className="w-3 h-3 text-amber-400" />
                  <span>MEDIDA HOMOLOGADA</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg sm:text-xl font-mono font-black text-white">
                    {currentItem.dimensiones}
                  </span>
                  {currentItem.indice && (
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 bg-amber-400 text-black rounded">
                      {currentItem.indice}
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* ACT 3: ARGENTINE CAR COMPATIBILITY (50 - 75%) */}
            {isAct3 && (
              <motion.div
                key="act3"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="w-full rounded-xl p-2 bg-[#0c0e14]/90 backdrop-blur-md border border-white/15 text-center shadow-lg"
              >
                <div className="flex items-center justify-center gap-1 text-[8.5px] font-mono text-amber-400 mb-0.5">
                  <Car className="w-3 h-3" />
                  <span>VEHÍCULO IDEAL EN ARGENTINA</span>
                </div>
                <div className="text-sm sm:text-base font-black uppercase text-white">
                  ★ {currentItem.bestSellingCar} ★
                </div>
              </motion.div>
            )}

            {/* ACT 4: PRICE & DISCOUNT (75 - 100%) */}
            {isAct4 && (
              <motion.div
                key="act4"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                className="w-full rounded-xl p-2 bg-[#0c0e14]/95 backdrop-blur-md border border-amber-400 text-center shadow-xl"
              >
                {currentItem.promoMode === 'percent_off' && (
                  <span className="inline-block px-2 py-0.2 rounded bg-red-600 text-white font-mono font-black text-[8.5px] uppercase mb-0.5">
                    {currentItem.discountPercent}% OFF CONTADO
                  </span>
                )}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl sm:text-2xl font-mono font-black text-amber-400 leading-none">
                    {formatCurrency(promoPrice)}
                  </span>
                  {savings > 0 && (
                    <span className="text-[10px] line-through text-zinc-500 font-mono">
                      {formatCurrency(currentItem.precioOriginal)}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 3. BOTTOM DECK: FINANCING & WHATSAPP CTA                               */}
      {/* ====================================================================== */}
      <div className="relative z-10 p-3 pt-0 space-y-1.5 shrink-0">
        {/* Banco Pampa Cuotas */}
        {showCuotasPampa && (
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg p-1.5 text-center bg-emerald-950/50 border border-emerald-500/40 text-emerald-300">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider block opacity-90">
                4 Cuotas Pampa
              </span>
              <span className="text-xs sm:text-sm font-mono font-black text-white">
                {formatCurrency(cuota4)}
              </span>
            </div>

            <div className="rounded-lg p-1.5 text-center bg-black/60 border border-white/15 text-white">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider block opacity-75">
                20 Cuotas Fijas
              </span>
              <span className="text-xs sm:text-sm font-mono font-black text-zinc-200">
                {formatCurrency(cuota20)}
              </span>
            </div>
          </div>
        )}

        {/* Free Valves & Mounting */}
        {includeValvesAndMounting && (
          <div className="w-full py-0.5 rounded text-[8.5px] font-bold text-center flex items-center justify-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <Wrench className="w-2.5 h-2.5" />
            <span>Colocación y válvulas sin cargo en sucursal</span>
          </div>
        )}

        {/* WhatsApp Reservation Button */}
        <motion.div
          animate={isPlaying ? { scale: [1, 1.015, 1] } : {}}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="w-full py-2 bg-[#15803d] hover:bg-[#166534] text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg border border-emerald-400 cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>Consultar por WhatsApp</span>
        </motion.div>

        {/* Branch Contact Info */}
        <div className="flex items-center justify-between px-1 text-[7.5px] font-mono text-zinc-400">
          <span>Santa Rosa: {COMPANY_INFO.branches.santaRosa.phoneDisplay}</span>
          <span>América: {COMPANY_INFO.branches.america.phoneDisplay}</span>
        </div>
      </div>
    </div>
  );
};
