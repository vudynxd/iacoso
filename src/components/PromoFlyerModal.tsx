import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Globe,
  Play,
  Pause,
  RotateCcw,
  Wand2,
  Zap,
  Smartphone,
  Video,
  Film,
  Music,
  CheckCircle2,
  Layers,
  Crop,
  ShieldCheck,
  Flame,
  Sun,
  Moon,
  Sliders,
  Car,
  DollarSign,
  Tag,
  Palette,
  Image as ImageIcon,
  ChevronRight,
  Maximize2,
  Search,
  Activity,
  Gauge,
  Volume2,
  Wrench,
} from 'lucide-react';
import { Tire } from '../types';
import { formatCurrency } from '../utils/formatters';
import { COMPANY_INFO } from '../data/companyInfo';
import { getTopArgentineCarsForDimension } from '../data/argentineCarFitments';
import { selectBestMarketingPhoto, getBrandBadgeStyle } from '../data/tirePhotos';
import { automotiveAudio } from '../utils/automotiveSoundFx';
import {
  StoryThemeStyle,
  synthesizeStoryStyleFromPrompt,
  PRESET_STORY_THEMES,
} from '../utils/storyAnimationStyles';
import { AnimatedStoryCanvas } from './AnimatedStoryCanvas';
import {
  generateStoryVideo,
  generateSingleTireStoryVideo,
  generateBatchStoryVideos,
  exportStoryStaticPoster,
  triggerDirectDownload,
  StoryThemeMode,
  StoryVideoDisplayMode,
} from '../utils/storyVideoExporter';
import {
  AutomaticVideoRenderModal,
  CompletedVideoItem,
} from './AutomaticVideoRenderModal';
import { TireImagePresentationMode } from '../utils/tireImageEnhancer';
import { CottaLogo } from './CottaLogo';

export interface PromoFlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTires: Tire[];
  allTires?: Tire[];
}

export type PromoMode = 'percent_off' | 'direct_price' | 'second_unit';

export interface WebTireImageResult {
  url: string;
  proxiedUrl: string;
  thumbnail: string;
  title: string;
  sourceDomain: string;
  width?: number;
  height?: number;
}

export interface PromoTireItem {
  id: string;
  tireId?: string;
  marca: string;
  modelo: string;
  dimensiones: string;
  indice: string;
  categoria: string;
  precioOriginal: number;
  promoMode: PromoMode;
  discountPercent: number;
  directPromoPrice: number;
  secondUnitDiscount: number;
  precioCuota4?: number;
  precioCuota20?: number;
  bestSellingCar: string;
  carAlternatives: string[];
  photoUrl: string;
  photoPresetId: string;
  aiMarketingReason: string;
  onlineSearchResults?: WebTireImageResult[];
  onlineSearchQuery?: string;
  isOnlineSearching?: boolean;
}

export type StudioFormat = 'story_9_16' | 'post_1_1' | 'flyer_3_4';

function createPromoItemFromTire(tire?: Tire | null, fallbackIndex = 0): PromoTireItem {
  const origPrice = tire?.precioContado && tire.precioContado > 0 ? tire.precioContado : 125000;
  const brand = tire?.marca || 'Michelin';
  const model = tire?.modelo || 'Primacy 4';
  const dim = tire?.dimensiones || '205/55 R16';
  const cat = tire?.categoria || 'Auto';

  const fitment = getTopArgentineCarsForDimension(dim, cat);
  const bestCar = fitment.bestCar || fitment.cars[0] || 'Fiat Cronos';

  const photoResult = selectBestMarketingPhoto({
    marca: brand,
    modelo: model,
    dimensiones: dim,
    categoria: cat,
  });

  return {
    id: `promo-slot-${Date.now()}-${fallbackIndex}-${Math.random().toString(36).substring(2, 6)}`,
    tireId: tire?.id,
    marca: brand,
    modelo: model,
    dimensiones: dim,
    indice: tire?.indice || '91V',
    categoria: cat,
    precioOriginal: origPrice,
    promoMode: 'percent_off',
    discountPercent: 20,
    directPromoPrice: Math.round(origPrice * 0.8),
    secondUnitDiscount: 70,
    precioCuota4: tire ? tire.precioCuota4 : undefined,
    precioCuota20: tire ? tire.precioCuota20 : undefined,
    bestSellingCar: bestCar,
    carAlternatives: fitment.cars.slice(1).concat(fitment.alternatives || []),
    photoUrl: photoResult.preset.url,
    photoPresetId: photoResult.preset.id,
    aiMarketingReason: fitment.explanation,
    onlineSearchResults: [],
    onlineSearchQuery: `${brand} ${model} ${dim}`,
    isOnlineSearching: false,
  };
}

export const PromoFlyerModal: React.FC<PromoFlyerModalProps> = ({
  isOpen,
  onClose,
  selectedTires,
  allTires = [],
}) => {
  // Format selector (Story 9:16, Post 1:1, Flyer 3:4)
  const [studioFormat, setStudioFormat] = useState<StudioFormat>('story_9_16');

  // Inspector tab
  const [activeTab, setActiveTab] = useState<'deal' | 'atmosphere' | 'physics3d' | 'photo'>('deal');

  // Interactive 3D Physics & Telemetry controls
  const [tireRotationSpeed, setTireRotationSpeed] = useState<number>(1.0);
  const [showTelemetryHUD, setShowTelemetryHUD] = useState<boolean>(true);
  const [burnoutSmokeLevel, setBurnoutSmokeLevel] = useState<number>(35);
  const [suspensionBounce, setSuspensionBounce] = useState<boolean>(true);
  const [camberAngle, setCamberAngle] = useState<number>(0);

  // Promo items sequence (1 to 4 tires)
  const [promoTires, setPromoTires] = useState<PromoTireItem[]>(() => {
    if (selectedTires && selectedTires.length > 0) {
      return selectedTires.slice(0, 4).map((t, idx) => createPromoItemFromTire(t, idx));
    }
    const first = (allTires && allTires[0]) || null;
    return [createPromoItemFromTire(first, 0)];
  });
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);

  // Common flyer settings
  const [promoBadgeText, setPromoBadgeText] = useState('OFERTA DE LA SEMANA');
  const [showCuotasPampa, setShowCuotasPampa] = useState(true);
  const [includeValvesAndMounting, setIncludeValvesAndMounting] = useState(true);
  const [presentationMode, setPresentationMode] = useState<TireImagePresentationMode>('auto-cutout');

  // Animation & Prompt Styling
  const [animationPrompt, setAnimationPrompt] = useState('Pista de carrera F1 nocturna con asfalto y velocidad');
  const [themeStyle, setThemeStyle] = useState<StoryThemeStyle>(() =>
    synthesizeStoryStyleFromPrompt(
      'Pista de carrera F1 nocturna con asfalto y velocidad',
      selectedTires?.[0]?.marca || 'Cotta'
    )
  );
  const [isAiStyling, setIsAiStyling] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [storyProgress, setStoryProgress] = useState(0); // 0 to 100%
  const [storyDuration, setStoryDuration] = useState(9000); // 9 seconds
  const [themeMode, setThemeMode] = useState<StoryThemeMode>('dark');
  const [displayMode, setDisplayMode] = useState<StoryVideoDisplayMode>('optimal_sales');

  // Video render modal states
  const [showAutoRenderModal, setShowAutoRenderModal] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoCurrentSec, setVideoCurrentSec] = useState(0);
  const [videoTotalSec, setVideoTotalSec] = useState(9);
  const [videoDurationChoice, setVideoDurationChoice] = useState<number>(9);
  const [videoResolutionChoice, setVideoResolutionChoice] = useState<'1080x1920' | '720x1280'>('1080x1920');
  const [batchRenderMode, setBatchRenderMode] = useState<'individual_per_tire' | 'combined_all_tires'>('individual_per_tire');
  const [includeAudioTrack, setIncludeAudioTrack] = useState(true);
  const [renderIsCompleted, setRenderIsCompleted] = useState(false);
  const [renderIsError, setRenderIsError] = useState(false);
  const [renderErrorMessage, setRenderErrorMessage] = useState('');
  const [completedBatchVideos, setCompletedBatchVideos] = useState<CompletedVideoItem[]>([]);
  const [currentRenderTireIndex, setCurrentRenderTireIndex] = useState(0);
  const [currentRenderTire, setCurrentRenderTire] = useState<PromoTireItem | null>(null);
  const [overallRenderPercent, setOverallRenderPercent] = useState(0);
  const [renderSourceCanvas, setRenderSourceCanvas] = useState<HTMLCanvasElement | null>(null);
  const shouldCancelRenderRef = useRef<boolean>(false);

  // Copy to clipboard status
  const [hasCopiedText, setHasCopiedText] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  // Canvas refs
  const storyCanvasWrapperRef = useRef<HTMLDivElement>(null);
  const postCanvasRef = useRef<HTMLDivElement>(null);

  // Web search query input
  const [customSearchInput, setCustomSearchInput] = useState('');

  // Synchronize incoming selected tires
  useEffect(() => {
    if (!isOpen) return;
    if (selectedTires && selectedTires.length > 0) {
      const items = selectedTires.slice(0, 4).map((t, idx) => createPromoItemFromTire(t, idx));
      setPromoTires(items);
      setActiveSlotIndex(0);
      setStoryProgress(0);
    } else if (promoTires.length === 0) {
      const firstTire = allTires[0] || null;
      const initial = createPromoItemFromTire(firstTire, 0);
      setPromoTires([initial]);
      setActiveSlotIndex(0);
      setStoryProgress(0);
    }
  }, [isOpen, selectedTires]);

  const safeActiveIndex = Math.min(activeSlotIndex, Math.max(0, promoTires.length - 1));
  const currentItem = promoTires[safeActiveIndex] || promoTires[0];

  // Playback timer ticker
  useEffect(() => {
    if (!isOpen || !isPlaying || promoTires.length === 0 || studioFormat !== 'story_9_16') return;

    const intervalStep = 50;
    const increment = (intervalStep / storyDuration) * 100;

    const timer = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev + increment >= 100) {
          if (promoTires.length > 1) {
            setActiveSlotIndex((curr) => (curr + 1) % promoTires.length);
          }
          return 0;
        }
        return prev + increment;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, storyDuration, promoTires.length, studioFormat]);

  // Update active tire properties
  const updateActiveTire = (updates: Partial<PromoTireItem>) => {
    setPromoTires((prev) =>
      prev.map((item, idx) => {
        if (idx !== safeActiveIndex) return item;
        const updated = { ...item, ...updates };

        if (
          (updates.dimensiones !== undefined || updates.categoria !== undefined) &&
          updates.bestSellingCar === undefined
        ) {
          const fitment = getTopArgentineCarsForDimension(updated.dimensiones, updated.categoria);
          updated.bestSellingCar = fitment.bestCar;
          updated.carAlternatives = fitment.cars.slice(1).concat(fitment.alternatives || []);
          updated.aiMarketingReason = fitment.explanation;
        }

        return updated;
      })
    );
  };

  // Add a tire slot
  const handleAddTireSlot = () => {
    if (promoTires.length >= 4) return;
    const existingIds = new Set(promoTires.map((p) => p.tireId).filter(Boolean));
    const nextTire = allTires.find((t) => !existingIds.has(t.id)) || allTires[promoTires.length] || null;
    const newIdx = promoTires.length;
    const newItem = createPromoItemFromTire(nextTire, newIdx);
    setPromoTires((prev) => [...prev, newItem]);
    setActiveSlotIndex(newIdx);
    setStoryProgress(0);
  };

  // Remove a tire slot
  const handleRemoveTireSlot = (indexToRemove: number) => {
    if (promoTires.length <= 1) return;
    setPromoTires((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setActiveSlotIndex((prev) => (prev >= indexToRemove ? Math.max(0, prev - 1) : prev));
    setStoryProgress(0);
  };

  // Apply Prompt Style
  const handleApplyPromptStyle = async (overridePrompt?: string) => {
    const promptToUse = (overridePrompt || animationPrompt).trim();
    if (!promptToUse) return;

    setIsAiStyling(true);
    const brandName = currentItem?.marca || 'Cotta';
    const instantStyle = synthesizeStoryStyleFromPrompt(promptToUse, brandName);
    setThemeStyle(instantStyle);

    try {
      const res = await fetch('/api/generate-story-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: promptToUse,
          brand: currentItem?.marca,
          model: currentItem?.modelo,
          dimensions: currentItem?.dimensiones,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.style) {
          setThemeStyle((prev) => ({
            ...prev,
            name: data.style.themeName || prev.name,
            tagline: data.style.tagline || prev.tagline,
            bgGradient: data.style.bgGradient || prev.bgGradient,
            accentColor: data.style.accentColor || prev.accentColor,
            secondaryColor: data.style.secondaryColor || prev.secondaryColor,
            glowColor: data.style.glowColor || prev.glowColor,
            tireAnimationType: data.style.tireAnimationType || prev.tireAnimationType,
            particles: data.style.particles || prev.particles,
            badgeStyle: data.style.badgeStyle || prev.badgeStyle,
            storyMood: data.style.storyMood || prev.storyMood,
            motionBackground: 'generative-prompt',
            customMotionConfig: data.style.customMotionConfig || instantStyle.customMotionConfig,
          }));
        }
      }
    } catch (err) {
      console.warn('AI style generation fallback to local synthesis:', err);
    } finally {
      setIsAiStyling(false);
    }
  };

  // Search tire image online
  const searchTireImageOnline = async (slotIdx: number, brand: string, model: string, dim: string, customQuery?: string) => {
    setPromoTires((prev) =>
      prev.map((t, i) => (i === slotIdx ? { ...t, isOnlineSearching: true } : t))
    );

    try {
      const res = await fetch('/api/search-tire-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model,
          dimensions: dim,
          customQuery: customQuery || `${brand} ${model} ${dim} tire neumatico`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.images && data.images.length > 0) {
          const results: WebTireImageResult[] = data.images.map((img: any) => ({
            url: img.url,
            proxiedUrl: `/api/image-proxy?url=${encodeURIComponent(img.url)}`,
            thumbnail: img.thumbnail || img.url,
            title: img.title || `${brand} ${model}`,
            sourceDomain: img.sourceDomain || 'web',
            width: img.width,
            height: img.height,
          }));

          setPromoTires((prev) =>
            prev.map((t, i) =>
              i === slotIdx
                ? {
                    ...t,
                    onlineSearchResults: results,
                    isOnlineSearching: false,
                    photoUrl: results[0].proxiedUrl,
                    photoPresetId: 'web-search-top',
                  }
                : t
            )
          );
          return;
        }
      }
    } catch (err) {
      console.warn('Online tire search error:', err);
    }

    setPromoTires((prev) =>
      prev.map((t, i) => (i === slotIdx ? { ...t, isOnlineSearching: false } : t))
    );
  };

  // High-Resolution Image Download
  const handleDownloadImage = async () => {
    setIsExportingImage(true);
    try {
      if (studioFormat === 'story_9_16') {
        const result = await exportStoryStaticPoster(
          currentItem,
          themeStyle,
          promoBadgeText,
          showCuotasPampa,
          includeValvesAndMounting,
          presentationMode,
          themeMode
        );
        triggerDirectDownload(result.url, result.filename);
      } else {
        const node = postCanvasRef.current;
        if (!node) throw new Error('Canvas element not found for export');
        const filename = `Cotta-Post-1x1-${currentItem.marca}-${currentItem.dimensiones.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        const dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: 2.5,
        });
        triggerDirectDownload(dataUrl, filename);
      }
    } catch (err) {
      console.error('Error downloading promo image:', err);
      alert('Error al generar la imagen en alta definición. Reintente en un instante.');
    } finally {
      setIsExportingImage(false);
    }
  };

  // Video Export Engine
  const handleStartAutoRender = async () => {
    if (promoTires.length === 0) return;

    shouldCancelRenderRef.current = false;
    setShowAutoRenderModal(true);
    setRenderIsCompleted(false);
    setRenderIsError(false);
    setRenderErrorMessage('');
    setCompletedBatchVideos([]);
    setIsVideoGenerating(true);
    setVideoProgress(0);
    setOverallRenderPercent(0);
    setCurrentRenderTireIndex(0);
    setCurrentRenderTire(promoTires[0]);
    setVideoTotalSec(videoDurationChoice);

    try {
      if (batchRenderMode === 'individual_per_tire' && promoTires.length > 1) {
        const results = await generateBatchStoryVideos(
          promoTires,
          themeStyle,
          promoBadgeText,
          showCuotasPampa,
          includeValvesAndMounting,
          {
            durationSeconds: videoDurationChoice,
            resolution: videoResolutionChoice,
            fps: 30,
            includeAudio: includeAudioTrack,
            presentationMode,
            themeMode,
            shouldCancel: () => shouldCancelRenderRef.current,
            onProgress: (pct, cur, tot, canvas) => {
              setVideoProgress(pct);
              setVideoCurrentSec(cur);
              setVideoTotalSec(tot);
              if (canvas) setRenderSourceCanvas(canvas);
            },
          },
          (update) => {
            setCurrentRenderTireIndex(update.currentTireIndex);
            setCurrentRenderTire(update.currentTire);
            setVideoProgress(update.currentPercent);
            setOverallRenderPercent(update.overallPercent);
            setVideoCurrentSec(update.currentSec);
            setVideoTotalSec(update.totalSec);
            setCompletedBatchVideos(
              update.completedVideos.map((v) => ({
                tireName: `${v.tire.marca} ${v.tire.modelo}`.trim(),
                dimension: v.tire.dimensiones,
                brand: v.tire.marca,
                url: v.url,
                filename: v.filename,
              }))
            );
          }
        );

        setCompletedBatchVideos(
          results.map((v) => ({
            tireName: `${v.tire.marca} ${v.tire.modelo}`.trim(),
            dimension: v.tire.dimensiones,
            brand: v.tire.marca,
            url: v.url,
            filename: v.filename,
          }))
        );
        setRenderIsCompleted(true);
      } else {
        const targetTires =
          promoTires.length === 1 || batchRenderMode === 'individual_per_tire'
            ? [promoTires[safeActiveIndex] || promoTires[0]]
            : promoTires;

        const targetPrimary = targetTires[0];
        setCurrentRenderTire(targetPrimary);

        const result = await generateStoryVideo(
          targetTires,
          themeStyle,
          promoBadgeText,
          showCuotasPampa,
          includeValvesAndMounting,
          {
            durationSeconds: videoDurationChoice,
            resolution: videoResolutionChoice,
            fps: 30,
            includeAudio: includeAudioTrack,
            presentationMode,
            themeMode,
            displayMode,
            tireCount: targetTires.length,
            shouldCancel: () => shouldCancelRenderRef.current,
            onProgress: (pct, cur, tot, canvas) => {
              setVideoProgress(pct);
              setVideoCurrentSec(cur);
              setVideoTotalSec(tot);
              setOverallRenderPercent(pct);
              if (canvas) setRenderSourceCanvas(canvas);
            },
          }
        );

        const singleItem: CompletedVideoItem = {
          tireName: `${targetPrimary.marca} ${targetPrimary.modelo}`.trim(),
          dimension: targetPrimary.dimensiones,
          brand: targetPrimary.marca,
          url: result.url,
          filename: result.filename,
        };

        setCompletedBatchVideos([singleItem]);
        setRenderIsCompleted(true);
        triggerDirectDownload(result.url, result.filename);
      }
    } catch (err: any) {
      console.error('Video generation error:', err);
      setRenderIsError(true);
      setRenderErrorMessage(err?.message || 'Ocurrió un error al compilar el video.');
    } finally {
      setIsVideoGenerating(false);
    }
  };

  // Copy promotional sales pitch to WhatsApp
  const handleCopyWhatsApp = () => {
    let priceText = '';
    let finalPrice = currentItem.precioOriginal;

    if (currentItem.promoMode === 'percent_off') {
      finalPrice = Math.round(currentItem.precioOriginal * (1 - currentItem.discountPercent / 100));
      priceText = `*${formatCurrency(finalPrice)}* (${currentItem.discountPercent}% OFF! Antes: ${formatCurrency(currentItem.precioOriginal)})`;
    } else if (currentItem.promoMode === 'direct_price') {
      finalPrice = currentItem.directPromoPrice;
      priceText = `*${formatCurrency(finalPrice)}* contado`;
    } else {
      finalPrice = Math.round((currentItem.precioOriginal * (1 + (1 - currentItem.secondUnitDiscount / 100))) / 2);
      priceText = `2da unidad al *${currentItem.secondUnitDiscount}% OFF*`;
    }

    const cuota4Val = Math.round((finalPrice * 1.15) / 4);
    const cuota20Val = Math.round((finalPrice * 1.5) / 20);

    const text = `🔥 *OFERTA EXCLUSIVA EN ${COMPANY_INFO.name.toUpperCase()}* 🔥

🛞 *${currentItem.marca.toUpperCase()} ${currentItem.modelo}*
📏 Medida: *${currentItem.dimensiones}* ${currentItem.indice ? `(${currentItem.indice})` : ''}
🚗 *Recomendado para:* ${currentItem.bestSellingCar}${currentItem.carAlternatives.length > 0 ? `, ${currentItem.carAlternatives.slice(0, 2).join(', ')}` : ''}

💰 *Precio Promocional Contado:* ${priceText}
${showCuotasPampa ? `💳 *Banco Pampa:*
• *4 cuotas* de *${formatCurrency(cuota4Val)}* sin interés
• *20 cuotas fijas* de *${formatCurrency(cuota20Val)}*` : ''}
${includeValvesAndMounting ? '✅ *Incluye colocación y válvulas sin cargo*' : ''}

📍 *Sucursal:* ${COMPANY_INFO.branches.santaRosa.city} (${COMPANY_INFO.branches.santaRosa.province})
📲 *Consultanos por WhatsApp:* ${COMPANY_INFO.branches.santaRosa.phoneDisplay}`;

    navigator.clipboard.writeText(text);
    setHasCopiedText(true);
    setTimeout(() => setHasCopiedText(false), 2500);
  };

  if (!isOpen) return null;

  // Pricing calculations
  let calculatedPromoPrice = currentItem.precioOriginal;
  let savingsAmount = 0;
  if (currentItem.promoMode === 'percent_off') {
    calculatedPromoPrice = Math.round(currentItem.precioOriginal * (1 - currentItem.discountPercent / 100));
    savingsAmount = currentItem.precioOriginal - calculatedPromoPrice;
  } else if (currentItem.promoMode === 'direct_price') {
    calculatedPromoPrice = currentItem.directPromoPrice > 0 ? currentItem.directPromoPrice : currentItem.precioOriginal;
    savingsAmount = Math.max(0, currentItem.precioOriginal - calculatedPromoPrice);
  } else if (currentItem.promoMode === 'second_unit') {
    const t2 = Math.round(currentItem.precioOriginal * (1 - currentItem.secondUnitDiscount / 100));
    calculatedPromoPrice = Math.round((currentItem.precioOriginal + t2) / 2);
    savingsAmount = currentItem.precioOriginal * 2 - (currentItem.precioOriginal + t2);
  }

  const cuota4Amount = Math.round((calculatedPromoPrice * 1.15) / 4);
  const cuota20Amount = Math.round((calculatedPromoPrice * 1.5) / 20);
  const brandBadge = getBrandBadgeStyle(currentItem.marca);

  // Instant Magic Presets
  const QUICK_MAGIC_PRESETS = [
    { label: '🏎️ F1 Pista Nocturna', prompt: 'Pista de carrera F1 nocturna con asfalto mojado y luces de velocidad' },
    { label: '💵 Lluvia de Dólares', prompt: 'Lluvia de billetes dólares y dinero con luces doradas de alto valor' },
    { label: '🌊 Océano Profundo', prompt: 'Burbujas en el fondo del océano con agua azul cristalina y rayos submarinos' },
    { label: '🌧️ Lluvia Tokio Neón', prompt: 'Lluvia intensa en Tokio con asfalto mojado reflejos neón y tormenta' },
    { label: '🏜️ Dunas 4x4 Off-Road', prompt: 'Dunas de arena en el desierto con polvo tierra 4x4 para camionetas Hilux y Ranger' },
    { label: '🔥 Furia Volcánica', prompt: 'Magma ardiente lava y fuego volcánico con chispas incandescentes' },
    { label: '💎 Diamantes & Lujo', prompt: 'Diamantes brillantes y cristales destellando con fondo mármol de lujo' },
    { label: '🌸 Primavera en Ruta', prompt: 'Campo de flores de primavera con pétalos flotando y sol radiante' },
  ];

  return (
    <div
      id="cotta-creative-studio-overlay"
      className="fixed inset-0 z-50 bg-[#08090d]/95 backdrop-blur-md flex flex-col text-white font-sans select-none overflow-hidden"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER TOOLBAR                                                     */}
      {/* ========================================================================= */}
      <header className="h-16 px-6 border-b border-zinc-800/80 bg-[#0d0f17] flex items-center justify-between shrink-0 z-30">
        {/* Left: Studio Branding & Active Tire Pills */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wider text-sm text-white">COTTA STUDIO</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  PRO 2.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Motor Creativo de Anuncios y Ofertas</p>
            </div>
          </div>

          <div className="h-6 w-px bg-zinc-800 hidden md:block" />

          {/* Tire Selector Tabs (if multiple selected) */}
          <div className="hidden lg:flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
            {promoTires.map((item, idx) => {
              const isCurrent = idx === safeActiveIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSlotIndex(idx);
                    setStoryProgress(0);
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-400 text-black shadow-xs font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-[10px] opacity-70">#{idx + 1}</span>
                  <span className="max-w-[100px] truncate">{item.marca} {item.dimensiones}</span>
                </button>
              );
            })}
            {promoTires.length < 4 && (
              <button
                type="button"
                onClick={handleAddTireSlot}
                className="px-2 py-1 text-xs font-medium text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded flex items-center gap-1 cursor-pointer transition-colors"
                title="Agregar otro neumático a la secuencia"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px]">Agregar</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Format Switcher (Story 9:16 vs Post 1:1) */}
        <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 shadow-inner">
          <button
            type="button"
            onClick={() => setStudioFormat('story_9_16')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              studioFormat === 'story_9_16'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Story / Reel 9:16</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-black/20 uppercase">Video</span>
          </button>
          <button
            type="button"
            onClick={() => setStudioFormat('post_1_1')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              studioFormat === 'post_1_1'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Crop className="w-4 h-4" />
            <span>Post / Feed 1:1</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-black/20 uppercase">Foto</span>
          </button>
        </div>

        {/* Right: Export Actions & Close */}
        <div className="flex items-center gap-2.5">
          {/* Copy WhatsApp Text */}
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            title="Copiar texto con precios y cuotas para WhatsApp o Instagram"
          >
            {hasCopiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Copiar WhatsApp</span>
              </>
            )}
          </button>

          {/* Download Image Button */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExportingImage}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            title="Descargar imagen publicitaria en alta definición"
          >
            {isExportingImage ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Download className="w-4 h-4 text-sky-400" />
            )}
            <span>Descargar Imagen</span>
          </button>

          {/* Export Video Button */}
          <button
            type="button"
            onClick={handleStartAutoRender}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer transition-all active:scale-95"
            title="Exportar video MP4 para redes sociales a 60fps"
          >
            <Video className="w-4 h-4 text-black" />
            <span>Exportar Video MP4</span>
          </button>

          {/* Close Studio */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 cursor-pointer transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CREATIVE WORKSPACE                                                */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* ======================================================================= */}
        {/* 2A. LEFT / CENTER: THE CREATIVE STAGE                                    */}
        {/* ======================================================================= */}
        <div className="flex-1 flex flex-col bg-[#07080c] relative overflow-y-auto">
          {/* Automotive Workshop Command Deck */}
          <div className="p-3 border-b border-zinc-900 bg-[#0c0d14] z-10 shrink-0">
            <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
              {/* Left: Quick Cinematic Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest mr-1 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  <span>ATMÓSFERA:</span>
                </span>
                {PRESET_STORY_THEMES.slice(0, 6).map((theme) => {
                  const isCurrent = themeStyle.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setThemeStyle(theme)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        isCurrent
                          ? 'bg-amber-400 text-black border-amber-300 shadow-sm'
                          : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      <span>{theme.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right: Audio Synthesizer Triggers */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider hidden sm:inline">
                  TALLER EN VIVO:
                </span>
                <button
                  type="button"
                  onClick={() => automotiveAudio.playEngineRev()}
                  className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Sonido de aceleración del motor"
                >
                  <Volume2 className="w-3 h-3 text-red-400" />
                  <span>Motor GT</span>
                </button>
                <button
                  type="button"
                  onClick={() => automotiveAudio.playImpactWrench()}
                  className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Pistola neumática de colocación"
                >
                  <Wrench className="w-3 h-3 text-sky-400" />
                  <span>Pistola Taller</span>
                </button>
                <button
                  type="button"
                  onClick={() => automotiveAudio.playTireBurnout()}
                  className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Fricción y derrape de neumáticos"
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Burnout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Central Canvas Viewport */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-[580px] overflow-auto">
            {studioFormat === 'story_9_16' ? (
              /* Story 9:16 Frame */
              <div
                className="relative rounded-[28px] overflow-hidden p-2.5 shadow-2xl transition-all"
                style={{
                  background: 'linear-gradient(145deg, #1a1c26, #090a0f)',
                  boxShadow: `0 20px 60px -15px ${themeStyle.accentColor || '#facc15'}33`,
                }}
              >
                {/* Simulated Phone Bezel Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/80 rounded-full z-40 border border-white/10" />

                <div
                  ref={storyCanvasWrapperRef}
                  className="w-[360px] h-[640px] rounded-[20px] overflow-hidden relative shadow-inner bg-black"
                >
                  <AnimatedStoryCanvas
                    tires={promoTires}
                    activeStoryIndex={safeActiveIndex}
                    onSelectStoryIndex={(idx) => {
                      setActiveSlotIndex(idx);
                      setStoryProgress(0);
                    }}
                    isPlaying={isPlaying}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                    onRestart={() => setStoryProgress(0)}
                    storyProgress={storyProgress}
                    themeStyle={themeStyle}
                    promoBadgeText={promoBadgeText}
                    showCuotasPampa={showCuotasPampa}
                    includeValvesAndMounting={includeValvesAndMounting}
                    presentationMode={presentationMode}
                    themeMode={themeMode}
                    displayMode={displayMode}
                    onSelectSceneProgress={(p) => setStoryProgress(p)}
                    canvasRef={storyCanvasWrapperRef}
                    tireRotationSpeed={tireRotationSpeed}
                    showTelemetryHUD={showTelemetryHUD}
                    burnoutSmokeLevel={burnoutSmokeLevel}
                    suspensionBounce={suspensionBounce}
                    camberAngle={camberAngle}
                  />
                </div>
              </div>
            ) : (
              /* Post / Feed 1:1 Frame */
              <div
                ref={postCanvasRef}
                id="cotta-post-canvas"
                className="w-[520px] h-[520px] rounded-2xl overflow-hidden relative shadow-2xl p-6 flex flex-col justify-between select-none border border-zinc-800"
                style={{
                  background: `linear-gradient(135deg, #0d0f17 0%, #151824 50%, #08090d 100%)`,
                }}
              >
                {/* Header Strip */}
                <div className="flex items-center justify-between z-10 border-b border-zinc-800 pb-3">
                  <CottaLogo size="md" variant="dark" showSubtitle={true} />
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded bg-amber-400 text-black font-black text-[11px] tracking-wide uppercase shadow-xs">
                      {promoBadgeText}
                    </span>
                    <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Exclusivo Banco Pampa</p>
                  </div>
                </div>

                {/* Tire Hero Showcase */}
                <div className="relative flex-1 flex items-center justify-center my-2">
                  {/* Subtle Background Glow */}
                  <div
                    className="absolute w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
                    style={{ backgroundColor: themeStyle.accentColor || '#facc15' }}
                  />

                  {/* Tire Image */}
                  <img
                    src={currentItem.photoUrl}
                    alt={`${currentItem.marca} ${currentItem.modelo}`}
                    className="max-h-[220px] max-w-[260px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-10"
                    crossOrigin="anonymous"
                  />

                  {/* Discount Badge */}
                  {currentItem.promoMode === 'percent_off' && (
                    <div className="absolute top-2 right-4 bg-red-600 text-white font-black text-sm px-3 py-1.5 rounded-xl rotate-6 shadow-lg border-2 border-white/20 z-20">
                      -{currentItem.discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Information Card */}
                <div className="bg-black/60 backdrop-blur-md rounded-xl p-3.5 border border-zinc-800 z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-wider uppercase text-amber-400">
                          {currentItem.marca}
                        </span>
                        <span className="text-xs font-bold text-white">{currentItem.modelo}</span>
                      </div>
                      <span className="text-lg font-black text-white">{currentItem.dimensiones}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block line-through">
                        {formatCurrency(currentItem.precioOriginal)}
                      </span>
                      <span className="text-xl font-black text-amber-400">
                        {formatCurrency(calculatedPromoPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Banco Pampa & Vehicle Fitment Bar */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 text-zinc-300">
                      <Car className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ideal: <strong>{currentItem.bestSellingCar}</strong></span>
                    </div>

                    {showCuotasPampa && (
                      <div className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        4 cuotas de {formatCurrency(cuota4Amount)} sin interés
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Contact Info */}
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-800/60 z-10">
                  <span>📍 {COMPANY_INFO.branches.santaRosa.city} ({COMPANY_INFO.branches.santaRosa.province})</span>
                  <span className="font-bold text-zinc-300">📲 WhatsApp: {COMPANY_INFO.branches.santaRosa.phoneDisplay}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Stage Playback Bar (for Story 9:16) */}
          {studioFormat === 'story_9_16' && (
            <div className="h-14 px-6 bg-[#0b0c12] border-t border-zinc-900 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setStoryProgress(0)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Reiniciar reproducción"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Timeline Scrubber */}
                <div className="w-64 flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {((storyProgress * storyDuration) / 100000).toFixed(1)}s
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={storyProgress}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setStoryProgress(Number(e.target.value));
                    }}
                    className="w-full accent-amber-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {(storyDuration / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* Theme Light/Dark Mode Switch */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400">Modo:</span>
                <button
                  type="button"
                  onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                  className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {themeMode === 'dark' ? <Moon className="w-3.5 h-3.5 text-sky-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                  <span className="capitalize">{themeMode === 'dark' ? 'Oscuro' : 'Claro'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* 2B. RIGHT INSPECTOR DOCK (CLEAN, POWERFUL, TABBED)                       */}
        {/* ======================================================================= */}
        <aside className="w-80 md:w-96 border-l border-zinc-800/80 bg-[#0c0d14] flex flex-col shrink-0">
          {/* Inspector Navigation Tabs */}
          <div className="h-12 border-b border-zinc-800 grid grid-cols-4 bg-[#0f1019] shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('deal')}
              className={`flex items-center justify-center gap-1 text-[11px] font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'deal'
                  ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>Oferta</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('atmosphere')}
              className={`flex items-center justify-center gap-1 text-[11px] font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'atmosphere'
                  ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Palette className="w-3 h-3" />
              <span>Estilo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('physics3d')}
              className={`flex items-center justify-center gap-1 text-[11px] font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'physics3d'
                  ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Gauge className="w-3 h-3" />
              <span>Física 3D</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('photo')}
              className={`flex items-center justify-center gap-1 text-[11px] font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'photo'
                  ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>Foto</span>
            </button>
          </div>

          {/* Inspector Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* ------------------------------------------------------------------- */}
            {/* TAB 1: DEAL & PRICING                                               */}
            {/* ------------------------------------------------------------------- */}
            {activeTab === 'deal' && (
              <div className="space-y-5">
                {/* Promo Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                    <span>Modalidad de Promoción</span>
                    <span className="text-[10px] text-amber-400 font-normal">Ahorro: {formatCurrency(savingsAmount)}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => updateActiveTire({ promoMode: 'percent_off' })}
                      className={`py-1.5 text-[11px] font-bold rounded cursor-pointer transition-all ${
                        currentItem.promoMode === 'percent_off'
                          ? 'bg-amber-400 text-black shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      % OFF
                    </button>
                    <button
                      type="button"
                      onClick={() => updateActiveTire({ promoMode: 'direct_price' })}
                      className={`py-1.5 text-[11px] font-bold rounded cursor-pointer transition-all ${
                        currentItem.promoMode === 'direct_price'
                          ? 'bg-amber-400 text-black shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Precio Fijo
                    </button>
                    <button
                      type="button"
                      onClick={() => updateActiveTire({ promoMode: 'second_unit' })}
                      className={`py-1.5 text-[11px] font-bold rounded cursor-pointer transition-all ${
                        currentItem.promoMode === 'second_unit'
                          ? 'bg-amber-400 text-black shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      2da Unidad
                    </button>
                  </div>
                </div>

                {/* Quick Discount Presets */}
                {currentItem.promoMode === 'percent_off' && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Descuento Rápido</span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[10, 15, 20, 30, 40].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => updateActiveTire({ discountPercent: pct })}
                          className={`py-1.5 rounded text-xs font-black transition-all cursor-pointer ${
                            currentItem.discountPercent === pct
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                          }`}
                        >
                          -{pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Price Input */}
                {currentItem.promoMode === 'direct_price' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Precio Promocional Contado ($)</label>
                    <input
                      type="number"
                      value={currentItem.directPromoPrice}
                      onChange={(e) => updateActiveTire({ directPromoPrice: Number(e.target.value) })}
                      className="w-full bg-zinc-900 text-amber-300 font-bold text-base px-3 py-2 rounded-lg border border-zinc-700 outline-hidden"
                    />
                  </div>
                )}

                {/* Banner Badge Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Texto del Cartel / Badge</label>
                  <input
                    type="text"
                    value={promoBadgeText}
                    onChange={(e) => setPromoBadgeText(e.target.value)}
                    placeholder="Ej: OFERTA DE LA SEMANA"
                    className="w-full bg-zinc-900 text-white text-xs px-3 py-2 rounded-lg border border-zinc-700 outline-hidden"
                  />
                </div>

                {/* Banco Pampa Live Cards */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Financiación Banco Pampa</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCuotasPampa(!showCuotasPampa)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                        showCuotasPampa ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {showCuotasPampa ? 'Activo' : 'Oculto'}
                    </button>
                  </div>

                  {showCuotasPampa && (
                    <div className="space-y-2">
                      <div className="bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
                            Plan 4 Cuotas Sin Interés
                          </span>
                          <span className="text-sm font-black text-white">4 x {formatCurrency(cuota4Amount)}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          Sin interés
                        </span>
                      </div>

                      <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">
                            Plan 20 Cuotas Fijas
                          </span>
                          <span className="text-sm font-bold text-zinc-200">20 x {formatCurrency(cuota20Amount)}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">Pampa Fijo</span>
                      </div>
                    </div>
                  )}

                  {/* Valves & Mounting Toggle */}
                  <label className="flex items-center gap-2 pt-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeValvesAndMounting}
                      onChange={(e) => setIncludeValvesAndMounting(e.target.checked)}
                      className="accent-amber-400 w-4 h-4 rounded"
                    />
                    <span>Incluye colocación y válvulas sin cargo</span>
                  </label>
                </div>

                {/* Top Argentine Vehicles Fitment */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-amber-400" />
                    <span>Auto Destacado (ACARA)</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[currentItem.bestSellingCar, ...currentItem.carAlternatives].slice(0, 4).map((carName) => {
                      const isSelected = currentItem.bestSellingCar === carName;
                      return (
                        <button
                          key={carName}
                          type="button"
                          onClick={() => updateActiveTire({ bestSellingCar: carName })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-400 text-black font-bold shadow-xs'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                          }`}
                        >
                          {carName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------- */}
            {/* TAB 2: ATMOSPHERE & CINEMATIC STYLES                                */}
            {/* ------------------------------------------------------------------- */}
            {activeTab === 'atmosphere' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-300">Galería de Estilos Cinemáticos</span>
                  <div className="grid grid-cols-1 gap-2">
                    {PRESET_STORY_THEMES.slice(0, 6).map((theme) => {
                      const isCurrent = themeStyle.id === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setThemeStyle(theme)}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                            isCurrent
                              ? 'bg-zinc-800/90 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                              : 'bg-zinc-900/60 hover:bg-zinc-800/60 border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-8 rounded-md shrink-0"
                              style={{
                                background: `linear-gradient(to bottom, ${theme.accentColor}, ${theme.secondaryColor})`,
                              }}
                            />
                            <div>
                              <span className="text-xs font-bold text-white block">{theme.name}</span>
                              <span className="text-[10px] text-zinc-400 block">{theme.storyMood}</span>
                            </div>
                          </div>
                          {isCurrent && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Burnout Smoke Slider */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Humo de Derrape / Burnout</span>
                    </span>
                    <span className="font-mono text-amber-400">{burnoutSmokeLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={burnoutSmokeLevel}
                    onChange={(e) => setBurnoutSmokeLevel(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Theme Light / Dark Mode Switch */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-xs font-bold text-zinc-300">Modo de Iluminación</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setThemeMode('dark')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        themeMode === 'dark'
                          ? 'bg-amber-400 text-black border-amber-400 shadow-xs'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Estudio Oscuro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeMode('light')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        themeMode === 'light'
                          ? 'bg-amber-400 text-black border-amber-400 shadow-xs'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Showroom Claro</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------- */}
            {/* TAB 3: 3D PHYSICS & LIVE TELEMETRY                                  */}
            {/* ------------------------------------------------------------------- */}
            {activeTab === 'physics3d' && (
              <div className="space-y-5">
                {/* Angular Rotation Speed */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                    <span>Velocidad de Rotación Angular</span>
                    <span className="text-[10px] text-amber-400 font-mono">{tireRotationSpeed}x</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    {[
                      { label: '0x Fijo', value: 0 },
                      { label: '0.5x', value: 0.5 },
                      { label: '1x Normal', value: 1.0 },
                      { label: '2x Carrera', value: 2.0 },
                    ].map((spd) => (
                      <button
                        key={spd.label}
                        type="button"
                        onClick={() => setTireRotationSpeed(spd.value)}
                        className={`py-1.5 text-[10px] font-bold rounded cursor-pointer transition-all ${
                          tireRotationSpeed === spd.value
                            ? 'bg-amber-400 text-black shadow-xs'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {spd.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Camber Angle Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">Ángulo de Caída (Camber):</span>
                    <span className="font-mono text-amber-400">{camberAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="1"
                    value={camberAngle}
                    onChange={(e) => setCamberAngle(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>-15°</span>
                    <span>0° Neutral</span>
                    <span>+15°</span>
                  </div>
                </div>

                {/* Toggles: HUD & Suspension */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-xs font-bold text-zinc-300">Telemetría y Dinámica</span>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 cursor-pointer hover:bg-zinc-900">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-zinc-300">Tacómetro & Sensores HUD</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showTelemetryHUD}
                      onChange={(e) => setShowTelemetryHUD(e.target.checked)}
                      className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 cursor-pointer hover:bg-zinc-900">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-zinc-300">Rebote de Suspensión Asfáltica</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={suspensionBounce}
                      onChange={(e) => setSuspensionBounce(e.target.checked)}
                      className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {/* Audio Engine Testing */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-xs font-bold text-zinc-300">Prueba de Efectos de Sonido</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => automotiveAudio.playEngineRev()}
                      className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Volume2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Acelerada de Motor GT</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">🔊 PROBAR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => automotiveAudio.playImpactWrench()}
                      className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-sky-400" />
                        <span>Pistola Neumática de Taller</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">🔊 PROBAR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => automotiveAudio.playTireBurnout()}
                      className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>Chillido de Fricción Asfalto</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">🔊 PROBAR</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------- */}
            {/* TAB 3: PHOTO & OFFICIAL IMAGES                                      */}
            {/* ------------------------------------------------------------------- */}
            {activeTab === 'photo' && (
              <div className="space-y-5">
                {/* Current Active Photo */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-300">Foto Actual a 45°</span>
                  <div className="w-full h-40 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center p-3 relative overflow-hidden">
                    <img
                      src={currentItem.photoUrl}
                      alt={currentItem.modelo}
                      className="max-h-full max-w-full object-contain drop-shadow-lg"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>

                {/* Presentation Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300">Modo de Presentación</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPresentationMode('auto-cutout')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${
                        presentationMode === 'auto-cutout'
                          ? 'bg-amber-400 text-black border-amber-400 shadow-xs'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      <span>Recorte Neumático</span>
                      <span className="text-[10px] block opacity-80 font-normal">Fondo transparente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresentationMode('studio-frame')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${
                        presentationMode === 'studio-frame'
                          ? 'bg-amber-400 text-black border-amber-400 shadow-xs'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      <span>Marco de Estudio</span>
                      <span className="text-[10px] block opacity-80 font-normal">Cuadro completo</span>
                    </button>
                  </div>
                </div>

                {/* Web Search for Official Photos */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span>Buscar Foto Oficial en Internet</span>
                  </span>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSearchInput}
                      onChange={(e) => setCustomSearchInput(e.target.value)}
                      placeholder="Marca y modelo..."
                      className="flex-1 bg-zinc-900 text-xs px-3 py-2 rounded-lg border border-zinc-700 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        searchTireImageOnline(
                          safeActiveIndex,
                          currentItem.marca,
                          currentItem.modelo,
                          currentItem.dimensiones,
                          customSearchInput
                        )
                      }
                      disabled={currentItem.isOnlineSearching}
                      className="px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {currentItem.isOnlineSearching ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      <span>Buscar</span>
                    </button>
                  </div>

                  {/* Search Results Grid */}
                  {currentItem.onlineSearchResults && currentItem.onlineSearchResults.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Resultados encontrados ({currentItem.onlineSearchResults.length})
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {currentItem.onlineSearchResults.slice(0, 6).map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => updateActiveTire({ photoUrl: img.proxiedUrl, photoPresetId: 'web-picked' })}
                            className="h-20 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-amber-400 p-1 flex items-center justify-center cursor-pointer transition-all group overflow-hidden"
                          >
                            <img
                              src={img.proxiedUrl}
                              alt={img.title}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                              crossOrigin="anonymous"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 3. AUTOMATIC VIDEO RENDER PROGRESS MODAL                                  */}
      {/* ========================================================================= */}
      {showAutoRenderModal && (
        <AutomaticVideoRenderModal
          isOpen={showAutoRenderModal}
          onClose={() => setShowAutoRenderModal(false)}
          batchMode={batchRenderMode}
          totalTires={promoTires.length}
          currentTireIndex={currentRenderTireIndex}
          currentTireName={currentRenderTire ? `${currentRenderTire.marca} ${currentRenderTire.modelo}` : ''}
          currentTireDimension={currentRenderTire?.dimensiones || ''}
          currentTireBrand={currentRenderTire?.marca || ''}
          currentPercent={videoProgress}
          overallPercent={overallRenderPercent}
          currentSec={videoCurrentSec}
          totalSec={videoTotalSec}
          isCompleted={renderIsCompleted}
          isError={renderIsError}
          errorMessage={renderErrorMessage}
          completedVideos={completedBatchVideos}
          onCancel={() => {
            shouldCancelRenderRef.current = true;
            setIsVideoGenerating(false);
            setShowAutoRenderModal(false);
          }}
          previewCanvasSource={renderSourceCanvas}
        />
      )}
    </div>
  );
};
