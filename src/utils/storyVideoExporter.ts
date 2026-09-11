import { PromoTireItem } from '../components/PromoFlyerModal';
import { StoryThemeStyle } from './storyAnimationStyles';
import { getBrandBadgeStyle } from '../data/tirePhotos';
import { formatCurrency } from './formatters';
import { COMPANY_INFO } from '../data/companyInfo';
import {
  TireImagePresentationMode,
  processImageBackgroundCutout,
  drawStudioFramedTire,
} from './tireImageEnhancer';
import { renderMotionBackground } from './motionBackgroundRenderer';

export type StoryVideoDisplayMode = 'optimal_sales' | 'simultaneous' | 'sequential';
export type StoryThemeMode = 'light' | 'dark';

export interface VideoExportOptions {
  durationSeconds: number; // 6, 8, 9, 11, 12, 15
  resolution: '1080x1920' | '720x1280';
  fps?: number; // default 30
  includeAudio?: boolean; // synthesized audio beat & fx
  presentationMode?: TireImagePresentationMode; // 'auto-cutout' | 'studio-frame'
  themeMode?: StoryThemeMode; // 'light' | 'dark'
  displayMode?: StoryVideoDisplayMode; // 'optimal_sales' | 'simultaneous' | 'sequential'
  tireCount?: number; // 1 to 4
  onProgress?: (progressPercent: number, currentSec: number, totalSec: number, canvas?: HTMLCanvasElement) => void;
  shouldCancel?: () => boolean;
  captureFrame?: () => Promise<string | null>;
  setStoryProgress?: (progress: number) => void;
}

export interface BatchProgressUpdate {
  currentTireIndex: number;
  totalTires: number;
  currentTire: PromoTireItem;
  currentPercent: number; // 0 to 100
  overallPercent: number; // 0 to 100
  currentSec: number;
  totalSec: number;
  completedVideos: Array<{ tire: PromoTireItem; blob: Blob; url: string; filename: string }>;
}

export function triggerDirectDownload(url: string, filename: string) {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) {
        a.parentNode.removeChild(a);
      }
    }, 400);
  } catch (err) {
    console.warn('Error triggering direct download:', err);
  }
}

export interface ProcessedTireData {
  item: PromoTireItem;
  img: HTMLImageElement | HTMLCanvasElement;
  promoPrice: number;
  savings: number;
  cuota4: number;
  cuota20: number;
  brandBadge: { bg: string; text: string; label: string; sublabel: string };
}

export function getSupportedVideoMimeType(): { mimeType: string; extension: 'mp4' | 'webm' } {
  if (typeof MediaRecorder === 'undefined') {
    return { mimeType: 'video/webm', extension: 'webm' };
  }

  const mp4Types = [
    'video/mp4;codecs=avc1',
    'video/mp4;codecs=h264',
    'video/mp4',
  ];

  for (const t of mp4Types) {
    if (MediaRecorder.isTypeSupported(t)) {
      return { mimeType: t, extension: 'mp4' };
    }
  }

  const webmTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264',
    'video/webm',
  ];

  for (const t of webmTypes) {
    if (MediaRecorder.isTypeSupported(t)) {
      return { mimeType: t, extension: 'webm' };
    }
  }

  return { mimeType: 'video/webm', extension: 'webm' };
}

// Helper to load image securely for canvas drawing
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallback = new Image();
      resolve(fallback);
    };
    img.src = src;
  });
}

// Generates dynamic synthetic audio track with cinematic structure
function createStoryAudioTrack(ctx: AudioContext, durationSec: number): MediaStreamAudioDestinationNode | null {
  try {
    const dest = ctx.createMediaStreamDestination();
    const now = ctx.currentTime;

    // 1. Intro riser (0s to 2.0s)
    const riserOsc = ctx.createOscillator();
    const riserGain = ctx.createGain();
    riserOsc.type = 'sawtooth';
    riserOsc.frequency.setValueAtTime(60, now);
    riserOsc.frequency.exponentialRampToValueAtTime(520, now + 1.9);
    riserGain.gain.setValueAtTime(0.01, now);
    riserGain.gain.linearRampToValueAtTime(0.28, now + 1.8);
    riserGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    riserOsc.connect(riserGain);
    riserGain.connect(dest);
    riserOsc.start(now);
    riserOsc.stop(now + 2.1);

    // 2. Heavy impact boom at 2.0s
    const impactTime = now + 2.0;
    const impactOsc = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impactOsc.type = 'sine';
    impactOsc.frequency.setValueAtTime(190, impactTime);
    impactOsc.frequency.exponentialRampToValueAtTime(25, impactTime + 0.35);
    impactGain.gain.setValueAtTime(0.9, impactTime);
    impactGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.5);
    impactOsc.connect(impactGain);
    impactGain.connect(dest);
    impactOsc.start(impactTime);
    impactOsc.stop(impactTime + 0.6);

    // 3. Driving beat
    const bpm = 128;
    const beatInterval = 60 / bpm;
    const startBeatIdx = Math.floor(2.0 / beatInterval);
    const totalBeats = Math.floor(durationSec / beatInterval);

    for (let i = startBeatIdx; i < totalBeats; i++) {
      const beatTime = now + i * beatInterval;
      if (beatTime > now + durationSec) break;

      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(150, beatTime);
      kickOsc.frequency.exponentialRampToValueAtTime(35, beatTime + 0.12);
      kickGain.gain.setValueAtTime(0.7, beatTime);
      kickGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.18);
      kickOsc.connect(kickGain);
      kickGain.connect(dest);
      kickOsc.start(beatTime);
      kickOsc.stop(beatTime + 0.2);

      const hatOsc = ctx.createOscillator();
      const hatGain = ctx.createGain();
      hatOsc.type = 'triangle';
      hatOsc.frequency.setValueAtTime(9000, beatTime + beatInterval / 2);
      hatGain.gain.setValueAtTime(0.08, beatTime + beatInterval / 2);
      hatGain.gain.exponentialRampToValueAtTime(0.001, beatTime + beatInterval / 2 + 0.04);
      hatOsc.connect(hatGain);
      hatGain.connect(dest);
      hatOsc.start(beatTime + beatInterval / 2);
      hatOsc.stop(beatTime + beatInterval / 2 + 0.05);
    }

    // 4. Climax explosion boom at half-time / outro
    const climaxTime = now + Math.min(durationSec - 2.5, durationSec * 0.5);
    if (durationSec > 5) {
      const cOsc = ctx.createOscillator();
      const cGain = ctx.createGain();
      cOsc.type = 'triangle';
      cOsc.frequency.setValueAtTime(280, climaxTime);
      cOsc.frequency.exponentialRampToValueAtTime(30, climaxTime + 0.45);
      cGain.gain.setValueAtTime(0.85, climaxTime);
      cGain.gain.exponentialRampToValueAtTime(0.001, climaxTime + 0.65);
      cOsc.connect(cGain);
      cGain.connect(dest);
      cOsc.start(climaxTime);
      cOsc.stop(climaxTime + 0.75);
    }

    return dest;
  } catch (err) {
    console.warn('Audio track generation error:', err);
    return null;
  }
}

/**
 * World-Class Tire Marketing Video Engine (Supports 1 to 4 tires, Light/Dark theme, & Adaptive Pacing)
 */
export async function generateStoryVideo(
  tireOrTires: PromoTireItem | PromoTireItem[],
  themeStyle: StoryThemeStyle,
  promoBadgeText: string,
  showCuotasPampa: boolean,
  includeValvesAndMounting: boolean,
  options: VideoExportOptions
): Promise<{ blob: Blob; url: string; filename: string }> {
  const {
    durationSeconds = 9,
    resolution = '1080x1920',
    fps = 30,
    presentationMode = 'auto-cutout',
    themeMode = 'dark',
    displayMode = 'optimal_sales',
    onProgress,
  } = options;

  const rawList = Array.isArray(tireOrTires) ? tireOrTires : [tireOrTires];
  const maxSlots = Math.min(4, Math.max(1, options.tireCount || rawList.length));
  const activeTiresList = rawList.slice(0, maxSlots);

  const [width, height] = resolution === '1080x1920' ? [1080, 1920] : [720, 1280];
  const scale = width / 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('No se pudo inicializar el motor de video.');

  // Pre-load all tire photos and compute pricing
  const loadedTires: ProcessedTireData[] = await Promise.all(
    activeTiresList.map(async (item) => {
      const rawImg = await loadImage(item.photoUrl);
      let procImg: HTMLImageElement | HTMLCanvasElement = rawImg;
      if (presentationMode === 'auto-cutout' && rawImg.naturalWidth > 0) {
        procImg = processImageBackgroundCutout(rawImg, 40);
      }

      let promoPrice = item.precioOriginal;
      let savings = 0;
      if (item.promoMode === 'percent_off') {
        promoPrice = Math.round(item.precioOriginal * (1 - item.discountPercent / 100));
        savings = item.precioOriginal - promoPrice;
      } else if (item.promoMode === 'direct_price') {
        promoPrice = item.directPromoPrice > 0 ? item.directPromoPrice : item.precioOriginal;
        savings = Math.max(0, item.precioOriginal - promoPrice);
      } else if (item.promoMode === 'second_unit') {
        const t2 = Math.round(item.precioOriginal * (1 - item.secondUnitDiscount / 100));
        promoPrice = Math.round((item.precioOriginal + t2) / 2);
        savings = item.precioOriginal * 2 - (item.precioOriginal + t2);
      }

      const ratio = item.precioOriginal > 0 ? promoPrice / item.precioOriginal : 1;
      let cuota4 = 0;
      let cuota20 = 0;
      if (item.precioCuota4 !== undefined) {
        cuota4 = item.precioCuota4 > 0 ? Math.round(item.precioCuota4 * ratio) : 0;
      } else {
        cuota4 = Math.round((promoPrice * 1.15) / 4);
      }

      if (item.precioCuota20 !== undefined) {
        cuota20 = item.precioCuota20 > 0 ? Math.round(item.precioCuota20 * ratio) : 0;
      } else {
        cuota20 = Math.round((promoPrice * 1.5) / 20);
      }

      const brandBadge = getBrandBadgeStyle(item.marca);

      return {
        item,
        img: procImg,
        promoPrice,
        savings,
        cuota4,
        cuota20,
        brandBadge,
      };
    })
  );

  // Video recording stream
  const canvasStream = canvas.captureStream(fps);
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  let combinedStream = canvasStream;

  if (options.includeAudio) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        await audioCtx.resume();
        if (audioCtx.state === 'running') {
          audioDest = createStoryAudioTrack(audioCtx, durationSeconds);
          if (audioDest && audioDest.stream.getAudioTracks().length > 0) {
            combinedStream = new MediaStream([
              ...canvasStream.getVideoTracks(),
              ...audioDest.stream.getAudioTracks(),
            ]);
          }
        }
      }
    } catch (err) {
      console.warn('Audio could not be initialized, continuing with clean video:', err);
    }
  }

  const { mimeType, extension } = getSupportedVideoMimeType();

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: resolution === '1080x1920' ? 6800000 : 3800000,
  });

  const recordedChunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) recordedChunks.push(e.data);
  };

  const primaryItem = loadedTires[0]?.item;
  const brandName = (primaryItem?.marca || 'cotta').toLowerCase().replace(/[^a-z0-9]/gi, '-');
  const dimClean = (primaryItem?.dimensiones || 'promo').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const countLabel = loadedTires.length > 1 ? `${loadedTires.length}-neumaticos` : dimClean;

  const filename = loadedTires.length === 1
    ? `historia-cotta-${brandName}-${dimClean}.${extension}`
    : `historia-cotta-promo-${countLabel}-${themeMode}.${extension}`;

  const recordingPromise = new Promise<{ blob: Blob; url: string; filename: string }>((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      resolve({ blob, url, filename });
    };
    recorder.onerror = (err) => reject(err);
  });

  recorder.start();

  // Deterministic mathematical frame render loop (Exact 0s to totalDuration, zero frame drops)
  const actualFps = fps || 30;
  const totalFrames = Math.max(1, Math.round(durationSeconds * actualFps));
  const frameIntervalMs = 1000 / actualFps;
  let currentFrame = 0;
  let isCancelled = false;

  return new Promise((resolveAll, rejectAll) => {
    function renderNextFrame() {
      if (options.shouldCancel && options.shouldCancel()) {
        isCancelled = true;
      }

      if (isCancelled) {
        try {
          if (recorder.state !== 'inactive') recorder.stop();
        } catch {}
        rejectAll(new Error('Renderizado cancelado.'));
        return;
      }

      const progress = Math.min(1, currentFrame / totalFrames);
      const t = (currentFrame / totalFrames) * durationSeconds;

      // Decide which rendering flow to use
      if (loadedTires.length === 1) {
        // Single tire full 4-act deep dive
        drawCinematicMultiSceneStoryboard(
          ctx,
          width,
          height,
          scale,
          t,
          durationSeconds,
          progress,
          loadedTires[0].item,
          loadedTires[0].img,
          presentationMode,
          themeStyle,
          promoBadgeText,
          loadedTires[0].brandBadge,
          loadedTires[0].promoPrice,
          loadedTires[0].savings,
          loadedTires[0].cuota4,
          loadedTires[0].cuota20,
          showCuotasPampa,
          includeValvesAndMounting,
          themeMode
        );
      } else {
        // Multi-tire rendering (2 to 4 tires)
        if (displayMode === 'simultaneous') {
          // Always simultaneous
          renderMotionBackground(
            ctx,
            width,
            height,
            scale,
            t,
            themeStyle.motionBackground || 'asphalt-speed-3d',
            themeStyle.accentColor || '#facc15',
            themeStyle.secondaryColor || '#ef4444',
            themeMode,
            themeStyle.customMotionConfig
          );
          drawSimultaneousMultiTireStage(
            ctx,
            width,
            height,
            scale,
            t,
            progress,
            loadedTires,
            themeStyle,
            promoBadgeText,
            showCuotasPampa,
            includeValvesAndMounting,
            themeMode
          );
        } else if (displayMode === 'sequential') {
          // Sequential rotation
          const slotIdx = Math.min(loadedTires.length - 1, Math.floor(progress * loadedTires.length));
          const slotProgress = (progress * loadedTires.length) - slotIdx;

          renderMotionBackground(
            ctx,
            width,
            height,
            scale,
            t,
            themeStyle.motionBackground || 'asphalt-speed-3d',
            themeStyle.accentColor || '#facc15',
            themeStyle.secondaryColor || '#ef4444',
            themeMode,
            themeStyle.customMotionConfig
          );
          drawSingleTireSpotlight(
            ctx,
            width,
            height,
            scale,
            t,
            slotProgress,
            loadedTires[slotIdx],
            slotIdx,
            loadedTires.length,
            themeStyle,
            presentationMode,
            themeMode
          );
        } else {
          // Optimal Sales: Rapid Sequential Spotlights (0% to 50%) -> Climax Simultaneous Catalog (50% to 100%)
          const splitBoundary = 0.50;

          renderMotionBackground(
            ctx,
            width,
            height,
            scale,
            t,
            themeStyle.motionBackground || 'asphalt-speed-3d',
            themeStyle.accentColor || '#facc15',
            themeStyle.secondaryColor || '#ef4444',
            themeMode,
            themeStyle.customMotionConfig
          );

          if (progress < splitBoundary) {
            // Sequential rapid spotlight
            const stepPerTire = splitBoundary / loadedTires.length;
            const slotIdx = Math.min(loadedTires.length - 1, Math.floor(progress / stepPerTire));
            const slotProgress = (progress - slotIdx * stepPerTire) / stepPerTire;

            drawSingleTireSpotlight(
              ctx,
              width,
              height,
              scale,
              t,
              slotProgress,
              loadedTires[slotIdx],
              slotIdx,
              loadedTires.length,
              themeStyle,
              presentationMode,
              themeMode
            );

            // Subtle flash between slots
            if (slotProgress < 0.08) {
              const f = 1 - slotProgress / 0.08;
              ctx.fillStyle = `rgba(255, 255, 255, ${f * 0.5})`;
              ctx.fillRect(0, 0, width, height);
            }
          } else {
            // Flash on transition into simultaneous climax
            if (progress >= splitBoundary && progress < splitBoundary + 0.05) {
              const f = 1 - (progress - splitBoundary) / 0.05;
              ctx.fillStyle = `rgba(255, 255, 255, ${f * 0.85})`;
              ctx.fillRect(0, 0, width, height);
            }

            // Climax Simultaneous Showcase
            drawSimultaneousMultiTireStage(
              ctx,
              width,
              height,
              scale,
              t,
              progress,
              loadedTires,
              themeStyle,
              promoBadgeText,
              showCuotasPampa,
              includeValvesAndMounting,
              themeMode
            );
          }
        }
      }

      // Notify video track if manual frame requesting is supported
      const track = canvasStream.getVideoTracks()[0];
      if (track && typeof (track as any).requestFrame === 'function') {
        (track as any).requestFrame();
      }

      if (onProgress) {
        onProgress(
          Math.min(100, Math.round(progress * 100)),
          Number(t.toFixed(1)),
          durationSeconds,
          canvas
        );
      }

      currentFrame++;

      if (currentFrame <= totalFrames) {
        setTimeout(renderNextFrame, frameIntervalMs);
      } else {
        setTimeout(() => {
          try {
            if (recorder.state !== 'inactive') {
              recorder.stop();
            }
          } catch (e) {
            console.warn('Recorder stop error:', e);
          }
          recordingPromise.then(resolveAll).catch(rejectAll);
        }, 250);
      }
    }

    renderNextFrame();
  });
}

/**
 * Renders a full 4-act high-impact story video for a single tire from second 0.0 to end
 */
export async function generateSingleTireStoryVideo(
  tire: PromoTireItem,
  themeStyle: StoryThemeStyle,
  promoBadgeText: string,
  showCuotasPampa: boolean,
  includeValvesAndMounting: boolean,
  options: VideoExportOptions
): Promise<{ blob: Blob; url: string; filename: string }> {
  return generateStoryVideo(
    [tire],
    themeStyle,
    promoBadgeText,
    showCuotasPampa,
    includeValvesAndMounting,
    {
      ...options,
      tireCount: 1,
      displayMode: 'optimal_sales',
    }
  );
}

/**
 * AUTOMATIC BATCH RENDERER:
 * Iterates through all tires, renders each one from start to finish,
 * and automatically triggers the direct file download to the PC for each video.
 */
export async function generateBatchStoryVideos(
  tires: PromoTireItem[],
  themeStyle: StoryThemeStyle,
  promoBadgeText: string,
  showCuotasPampa: boolean,
  includeValvesAndMounting: boolean,
  options: VideoExportOptions,
  onBatchProgress?: (update: BatchProgressUpdate) => void
): Promise<Array<{ tire: PromoTireItem; blob: Blob; url: string; filename: string }>> {
  const completed: Array<{ tire: PromoTireItem; blob: Blob; url: string; filename: string }> = [];
  const totalTires = tires.length;

  for (let i = 0; i < totalTires; i++) {
    if (options.shouldCancel && options.shouldCancel()) {
      throw new Error('Renderizado cancelado por el usuario.');
    }

    const currentTire = tires[i];

    const result = await generateSingleTireStoryVideo(
      currentTire,
      themeStyle,
      promoBadgeText,
      showCuotasPampa,
      includeValvesAndMounting,
      {
        ...options,
        onProgress: (pct, cur, tot, frameCanvas) => {
          const overall = Math.round(((i + pct / 100) / totalTires) * 100);
          if (onBatchProgress) {
            onBatchProgress({
              currentTireIndex: i,
              totalTires,
              currentTire,
              currentPercent: pct,
              overallPercent: overall,
              currentSec: cur,
              totalSec: tot,
              completedVideos: completed,
            });
          }
          if (options.onProgress) {
            options.onProgress(pct, cur, tot, frameCanvas);
          }
        },
      }
    );

    completed.push({ tire: currentTire, ...result });

    // Automatically trigger browser download on operator's PC immediately
    triggerDirectDownload(result.url, result.filename);

    if (onBatchProgress) {
      const overall = Math.round(((i + 1) / totalTires) * 100);
      onBatchProgress({
        currentTireIndex: i,
        totalTires,
        currentTire,
        currentPercent: 100,
        overallPercent: overall,
        currentSec: options.durationSeconds,
        totalSec: options.durationSeconds,
        completedVideos: completed,
      });
    }

    // Delay for browser download queue between files
    if (i < totalTires - 1) {
      await new Promise((r) => setTimeout(r, 650));
    }
  }

  return completed;
}

// ----------------------------------------------------------------------------
// SINGLE TIRE SPOTLIGHT (FOR MULTI-TIRE SEQUENCES)
// ----------------------------------------------------------------------------
function drawSingleTireSpotlight(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  t: number,
  progress: number,
  data: ProcessedTireData,
  index: number,
  total: number,
  theme: StoryThemeStyle,
  presentationMode: TireImagePresentationMode,
  themeMode: StoryThemeMode
) {
  const isLight = themeMode === 'light';
  const { item, img, promoPrice, brandBadge } = data;

  ctx.save();

  // Top slot counter pill
  const pillY = 240 * scale;
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.accentColor || '#facc15';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(width / 2 - 140 * scale, pillY, 280 * scale, 38 * scale, 19 * scale) : ctx.fillRect(width / 2 - 140 * scale, pillY, 280 * scale, 38 * scale);
  ctx.fill();
  ctx.fillStyle = '#111111';
  ctx.font = `900 ${18 * scale}px sans-serif`;
  ctx.fillText(`⚡ OPCIÓN ${index + 1} DE ${total} ⚡`, width / 2, pillY + 25 * scale);

  // Brand and Model Header
  const headY = 320 * scale;
  ctx.fillStyle = brandBadge.bg;
  const bw = 240 * scale;
  ctx.fillRect((width - bw) / 2, headY, bw, 32 * scale);
  ctx.fillStyle = brandBadge.text;
  ctx.font = `900 ${16 * scale}px sans-serif`;
  ctx.fillText(item.marca.toUpperCase(), width / 2, headY + 22 * scale);

  // Huge Dimension
  ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
  ctx.font = `900 ${52 * scale}px monospace`;
  ctx.shadowColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 15 * scale;
  ctx.fillText(item.dimensiones, width / 2, headY + 85 * scale);
  ctx.shadowBlur = 0;

  // Model line
  ctx.fillStyle = theme.accentColor || '#facc15';
  ctx.font = `800 ${26 * scale}px sans-serif`;
  ctx.fillText((item.modelo || 'LÍNEA OFICIAL').toUpperCase(), width / 2, headY + 120 * scale);

  // Center 3D Floating Tire
  const tireY = height * 0.53;
  const tireSize = 440 * scale;
  const tireZoom = (1 + Math.sin(t * 3) * 0.03) * scale;

  ctx.save();
  ctx.translate(width / 2, tireY);
  ctx.scale(tireZoom, tireZoom);

  // Contact shadow
  ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.28)' : 'rgba(0, 0, 0, 0.85)';
  ctx.beginPath();
  ctx.ellipse(0, tireSize * 0.46, tireSize * 0.4, 24 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  if (presentationMode === 'studio-frame') {
    drawStudioFramedTire(ctx, img, tireSize, theme.accentColor);
  } else {
    ctx.drawImage(img, -tireSize / 2, -tireSize / 2, tireSize, tireSize);
  }
  ctx.restore();

  // Bottom Price & Fitment Box
  const boxY = height * 0.69;
  const boxW = width * 0.92;
  const boxH = 155 * scale;

  ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(12, 12, 12, 0.94)';
  ctx.strokeStyle = theme.accentColor || '#facc15';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect((width - boxW) / 2, boxY, boxW, boxH, 16 * scale) : ctx.fillRect((width - boxW) / 2, boxY, boxW, boxH);
  ctx.fill();
  ctx.stroke();

  // Price
  ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
  ctx.font = `900 ${50 * scale}px monospace`;
  ctx.fillText(formatCurrency(promoPrice), width / 2, boxY + 55 * scale);

  // Auto ACARA
  ctx.fillStyle = isLight ? '#334155' : '#9ca3af';
  ctx.font = `800 ${16 * scale}px sans-serif`;
  ctx.fillText(`🚗 Ideal para: ${item.bestSellingCar || 'Auto Mediano'}`, width / 2, boxY + 95 * scale);

  // Bonus note
  ctx.fillStyle = '#16a34a';
  ctx.font = `900 ${15 * scale}px sans-serif`;
  ctx.fillText('✓ Montaje y picos nuevos bonificados', width / 2, boxY + 128 * scale);

  ctx.restore();
}

// ----------------------------------------------------------------------------
// SIMULTANEOUS MULTI-TIRE SHOWCASE (DUO, TRIO, OR 2X2 GRID)
// ----------------------------------------------------------------------------
function drawSimultaneousMultiTireStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  t: number,
  progress: number,
  tires: ProcessedTireData[],
  theme: StoryThemeStyle,
  promoBadgeText: string,
  showCuotasPampa: boolean,
  includeValvesAndMounting: boolean,
  themeMode: StoryThemeMode
) {
  const isLight = themeMode === 'light';
  ctx.save();

  // 1. Top Header Banner (Below Instagram Story safe margin ~200px)
  const topY = 220 * scale;
  const headW = width * 0.94;
  ctx.save();
  ctx.fillStyle = theme.accentColor || '#facc15';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect((width - headW) / 2, topY, headW, 46 * scale, 12 * scale) : ctx.fillRect((width - headW) / 2, topY, headW, 46 * scale);
  ctx.fill();

  ctx.fillStyle = '#111111';
  ctx.font = `900 ${20 * scale}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`🔥 ${promoBadgeText.toUpperCase()} • COTTA NEUMÁTICOS 🔥`, width / 2, topY + 30 * scale);
  ctx.restore();

  // 2. Stage Layout depending on tire count (2, 3, or 4)
  const count = tires.length;

  if (count === 2) {
    // ------------------------------------------------------------------------
    // DUO SHOWCASE (2 TIRES): Staggered / 2 Large Vertical Cards
    // ------------------------------------------------------------------------
    const cardW = width * 0.92;
    const cardH = 340 * scale;
    const startY = 285 * scale;
    const gap = 24 * scale;

    tires.slice(0, 2).forEach((data, idx) => {
      const cardY = startY + idx * (cardH + gap);
      const bob = Math.sin(t * 3 + idx * Math.PI) * (5 * scale);

      ctx.save();
      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(14, 14, 14, 0.95)';
      ctx.strokeStyle = idx === 0 ? (theme.accentColor || '#facc15') : (theme.secondaryColor || '#38bdf8');
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect((width - cardW) / 2, cardY, cardW, cardH, 20 * scale) : ctx.fillRect((width - cardW) / 2, cardY, cardW, cardH);
      ctx.fill();
      ctx.stroke();

      // Tire on left side
      const tireSize = 250 * scale;
      const tireX = (width - cardW) / 2 + 150 * scale;
      const tireCenterY = cardY + cardH / 2 + bob;

      // Contact shadow
      ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.25)' : 'rgba(0,0,0,0.85)';
      ctx.beginPath();
      ctx.ellipse(tireX, tireCenterY + tireSize * 0.44, tireSize * 0.38, 18 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw tire image
      ctx.drawImage(data.img, tireX - tireSize / 2, tireCenterY - tireSize / 2, tireSize, tireSize);

      // Info on right side
      const textX = (width - cardW) / 2 + 300 * scale;
      ctx.textAlign = 'left';

      // Brand badge
      ctx.fillStyle = data.brandBadge.bg;
      ctx.fillRect(textX, cardY + 30 * scale, 180 * scale, 28 * scale);
      ctx.fillStyle = data.brandBadge.text;
      ctx.font = `900 ${14 * scale}px sans-serif`;
      ctx.fillText(`★ ${data.item.marca.toUpperCase()}`, textX + 12 * scale, cardY + 49 * scale);

      // Huge Dimension
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = `900 ${40 * scale}px monospace`;
      ctx.fillText(data.item.dimensiones, textX, cardY + 105 * scale);

      // Model
      ctx.fillStyle = isLight ? '#475569' : '#9ca3af';
      ctx.font = `800 ${18 * scale}px sans-serif`;
      ctx.fillText(data.item.modelo || 'Línea Oficial', textX, cardY + 135 * scale);

      // Promo Price
      ctx.fillStyle = isLight ? '#b91c1c' : (theme.accentColor || '#facc15');
      ctx.font = `900 ${46 * scale}px monospace`;
      ctx.fillText(formatCurrency(data.promoPrice), textX, cardY + 195 * scale);

      // Cuotas Pampa or Solo Contado
      if (showCuotasPampa && data.cuota4 > 0) {
        ctx.fillStyle = '#16a34a';
        ctx.font = `800 ${16 * scale}px sans-serif`;
        ctx.fillText(`💳 4 cuotas de ${formatCurrency(data.cuota4)}`, textX, cardY + 235 * scale);
      } else if (data.cuota4 <= 0 && data.cuota20 <= 0) {
        ctx.fillStyle = isLight ? '#15803d' : '#86efac';
        ctx.font = `800 ${15 * scale}px sans-serif`;
        ctx.fillText(`💵 Solo Contado / Transferencia`, textX, cardY + 235 * scale);
      }

      // Auto recomendado
      ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
      ctx.font = `700 ${14 * scale}px sans-serif`;
      ctx.fillText(`🚗 Para: ${data.item.bestSellingCar}`, textX, cardY + 270 * scale);

      ctx.restore();
    });
  } else if (count === 3) {
    // ------------------------------------------------------------------------
    // TRIO SHOWCASE (3 TIRES): 1 Hero Top Card + 2 Bottom Split Cards
    // ------------------------------------------------------------------------
    const cardW = width * 0.92;
    const heroH = 290 * scale;
    const heroY = 285 * scale;

    // 1. Hero Card (Tire 1)
    const heroData = tires[0];
    ctx.save();
    ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(14, 14, 14, 0.95)';
    ctx.strokeStyle = theme.accentColor || '#facc15';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect((width - cardW) / 2, heroY, cardW, heroH, 18 * scale) : ctx.fillRect((width - cardW) / 2, heroY, cardW, heroH);
    ctx.fill();
    ctx.stroke();

    // Tire on left
    const tSize = 220 * scale;
    const tX = (width - cardW) / 2 + 135 * scale;
    const tY = heroY + heroH / 2;
    ctx.drawImage(heroData.img, tX - tSize / 2, tY - tSize / 2, tSize, tSize);

    // Right info
    const infoX = (width - cardW) / 2 + 280 * scale;
    ctx.textAlign = 'left';
    ctx.fillStyle = heroData.brandBadge.bg;
    ctx.fillRect(infoX, heroY + 22 * scale, 170 * scale, 26 * scale);
    ctx.fillStyle = heroData.brandBadge.text;
    ctx.font = `900 ${13 * scale}px sans-serif`;
    ctx.fillText(heroData.item.marca.toUpperCase(), infoX + 10 * scale, heroY + 40 * scale);

    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = `900 ${36 * scale}px monospace`;
    ctx.fillText(heroData.item.dimensiones, infoX, heroY + 90 * scale);

    ctx.fillStyle = isLight ? '#b91c1c' : (theme.accentColor || '#facc15');
    ctx.font = `900 ${42 * scale}px monospace`;
    ctx.fillText(formatCurrency(heroData.promoPrice), infoX, heroY + 145 * scale);

    if (showCuotasPampa && heroData.cuota4 > 0) {
      ctx.fillStyle = '#16a34a';
      ctx.font = `800 ${15 * scale}px sans-serif`;
      ctx.fillText(`💳 4 cuotas de ${formatCurrency(heroData.cuota4)}`, infoX, heroY + 180 * scale);
    } else if (heroData.cuota4 <= 0 && heroData.cuota20 <= 0) {
      ctx.fillStyle = isLight ? '#15803d' : '#86efac';
      ctx.font = `800 ${14 * scale}px sans-serif`;
      ctx.fillText(`💵 Solo Contado / Transferencia`, infoX, heroY + 180 * scale);
    }
    ctx.restore();

    // 2. Bottom Row (2 Cards Side-by-Side)
    const botY = heroY + heroH + 20 * scale;
    const halfW = (cardW - 16 * scale) / 2;
    const botH = 390 * scale;

    tires.slice(1, 3).forEach((data, i) => {
      const bx = (width - cardW) / 2 + i * (halfW + 16 * scale);

      ctx.save();
      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(14, 14, 14, 0.95)';
      ctx.strokeStyle = i === 0 ? (theme.secondaryColor || '#38bdf8') : (theme.accentColor || '#facc15');
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, botY, halfW, botH, 16 * scale) : ctx.fillRect(bx, botY, halfW, botH);
      ctx.fill();
      ctx.stroke();

      // Mini tire
      const miniSize = 180 * scale;
      ctx.drawImage(data.img, bx + (halfW - miniSize) / 2, botY + 20 * scale, miniSize, miniSize);

      ctx.textAlign = 'center';
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = `900 ${28 * scale}px monospace`;
      ctx.fillText(data.item.dimensiones, bx + halfW / 2, botY + 235 * scale);

      ctx.fillStyle = isLight ? '#475569' : '#9ca3af';
      ctx.font = `800 ${14 * scale}px sans-serif`;
      ctx.fillText(data.item.marca.toUpperCase(), bx + halfW / 2, botY + 260 * scale);

      ctx.fillStyle = isLight ? '#b91c1c' : (theme.accentColor || '#facc15');
      ctx.font = `900 ${32 * scale}px monospace`;
      ctx.fillText(formatCurrency(data.promoPrice), bx + halfW / 2, botY + 305 * scale);

      if (showCuotasPampa && data.cuota4 > 0) {
        ctx.fillStyle = '#16a34a';
        ctx.font = `800 ${13 * scale}px sans-serif`;
        ctx.fillText(`4 cuotas ${formatCurrency(data.cuota4)}`, bx + halfW / 2, botY + 338 * scale);
      } else if (data.cuota4 <= 0 && data.cuota20 <= 0) {
        ctx.fillStyle = isLight ? '#15803d' : '#86efac';
        ctx.font = `800 ${13 * scale}px sans-serif`;
        ctx.fillText(`Solo Contado`, bx + halfW / 2, botY + 338 * scale);
      }
      ctx.restore();
    });
  } else {
    // ------------------------------------------------------------------------
    // 4 TIRES: HIGH-CONVERSION 2X2 GRID SHOWCASE
    // ------------------------------------------------------------------------
    const gridW = width * 0.92;
    const colW = (gridW - 16 * scale) / 2;
    const rowH = 350 * scale;
    const startY = 285 * scale;
    const gapY = 16 * scale;

    tires.slice(0, 4).forEach((data, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cardX = (width - gridW) / 2 + col * (colW + 16 * scale);
      const cardY = startY + row * (rowH + gapY);

      ctx.save();
      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(14, 14, 14, 0.95)';
      ctx.strokeStyle = idx === 0 || idx === 3 ? (theme.accentColor || '#facc15') : (theme.secondaryColor || '#38bdf8');
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(cardX, cardY, colW, rowH, 16 * scale) : ctx.fillRect(cardX, cardY, colW, rowH);
      ctx.fill();
      ctx.stroke();

      // Option label pill
      ctx.fillStyle = theme.accentColor || '#facc15';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(cardX + 12 * scale, cardY + 12 * scale, 75 * scale, 22 * scale, 6 * scale) : ctx.fillRect(cardX + 12 * scale, cardY + 12 * scale, 75 * scale, 22 * scale);
      ctx.fill();
      ctx.fillStyle = '#111111';
      ctx.font = `900 ${11 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`#${idx + 1} PROMO`, cardX + 12 * scale + 37.5 * scale, cardY + 27 * scale);

      // Centered Tire
      const tSize = 165 * scale;
      const tCenterY = cardY + 105 * scale;
      ctx.drawImage(data.img, cardX + (colW - tSize) / 2, tCenterY - tSize / 2, tSize, tSize);

      // Dimension
      ctx.textAlign = 'center';
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = `900 ${27 * scale}px monospace`;
      ctx.fillText(data.item.dimensiones, cardX + colW / 2, cardY + 215 * scale);

      // Brand & Model
      ctx.fillStyle = isLight ? '#475569' : '#9ca3af';
      ctx.font = `800 ${13 * scale}px sans-serif`;
      ctx.fillText(`${data.item.marca.toUpperCase()} • ${data.item.modelo || ''}`, cardX + colW / 2, cardY + 240 * scale);

      // Big Price
      ctx.fillStyle = isLight ? '#b91c1c' : (theme.accentColor || '#facc15');
      ctx.font = `900 ${32 * scale}px monospace`;
      ctx.fillText(formatCurrency(data.promoPrice), cardX + colW / 2, cardY + 285 * scale);

      // Cuotas Pampa or Solo Contado
      if (showCuotasPampa && data.cuota4 > 0) {
        ctx.fillStyle = '#16a34a';
        ctx.font = `800 ${12.5 * scale}px sans-serif`;
        ctx.fillText(`💳 4 cuotas de ${formatCurrency(data.cuota4)}`, cardX + colW / 2, cardY + 315 * scale);
      } else if (data.cuota4 <= 0 && data.cuota20 <= 0) {
        ctx.fillStyle = isLight ? '#15803d' : '#86efac';
        ctx.font = `800 ${12 * scale}px sans-serif`;
        ctx.fillText(`💵 Solo Contado`, cardX + colW / 2, cardY + 315 * scale);
      }

      ctx.restore();
    });
  }

  // 3. Bottom Climax & Urgency Area (Positioned above Instagram bottom safe zone ~1620px)
  const bottomBarY = height * 0.74;

  // Montaje y picos nuevos bonificados
  if (includeValvesAndMounting) {
    ctx.save();
    const vW = width * 0.92;
    ctx.fillStyle = 'rgba(22, 163, 74, 0.22)';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect((width - vW) / 2, bottomBarY, vW, 46 * scale, 10 * scale) : ctx.fillRect((width - vW) / 2, bottomBarY, vW, 46 * scale);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isLight ? '#15803d' : '#4ade80';
    ctx.font = `900 ${18 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🔧 ¡MONTAJE Y PICOS NUEVOS BONIFICADOS!', width / 2, bottomBarY + 30 * scale);
    ctx.restore();
  }

  // Giant WhatsApp Call to Action
  const ctaY = bottomBarY + (includeValvesAndMounting ? 56 * scale : 10 * scale);
  const btnW = width * 0.92;
  const btnH = 68 * scale;

  ctx.save();
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect((width - btnW) / 2, ctaY, btnW, btnH, 34 * scale) : ctx.fillRect((width - btnW) / 2, ctaY, btnW, btnH);
  ctx.fill();
  ctx.lineWidth = 3 * scale;
  ctx.strokeStyle = '#86efac';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${22 * scale}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('💬 RESERVÁ TU MEDIDA POR WHATSAPP', width / 2, ctaY + 42 * scale);

  // Scarcity disclaimer
  ctx.fillStyle = isLight ? '#b45309' : '#facc15';
  ctx.font = `800 ${16 * scale}px sans-serif`;
  ctx.fillText('⚡ ¡STOCK LIMITADO PARA LA PAMPA Y BUENOS AIRES!', width / 2, ctaY + 92 * scale);

  ctx.fillStyle = isLight ? '#475569' : '#d1d5db';
  ctx.font = `700 ${14 * scale}px monospace`;
  ctx.fillText(
    `SANTA ROSA: ${COMPANY_INFO.branches.santaRosa.phoneDisplay}  •  AMÉRICA: ${COMPANY_INFO.branches.america.phoneDisplay}`,
    width / 2,
    ctaY + 118 * scale
  );
  ctx.restore();

  ctx.restore();
}

// ----------------------------------------------------------------------------
// CINEMATIC STORYBOARD DRAWING: 4 DISTINCT SCENES (FOR SINGLE TIRE)
// ----------------------------------------------------------------------------
function drawCinematicMultiSceneStoryboard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  t: number,
  totalDuration: number,
  progress: number,
  item: PromoTireItem,
  tireImgOrCanvas: HTMLImageElement | HTMLCanvasElement,
  presentationMode: TireImagePresentationMode,
  theme: StoryThemeStyle,
  promoBadgeText: string,
  brandBadge: { bg: string; text: string; label: string; sublabel: string },
  promoPrice: number,
  savings: number,
  cuota4: number,
  cuota20: number,
  showCuotasPampa: boolean,
  includeValvesAndMounting: boolean,
  themeMode: StoryThemeMode = 'dark'
) {
  const isLight = themeMode === 'light';
  ctx.save();

  const act1End = 0.24;
  const act2End = 0.52;
  const act3End = 0.76;

  const inAct1 = progress < act1End;
  const inAct2 = progress >= act1End && progress < act2End;
  const inAct3 = progress >= act2End && progress < act3End;
  const inAct4 = progress >= act3End;

  let flashAlpha = 0;
  if (Math.abs(progress - act1End) < 0.02) {
    flashAlpha = 1 - Math.abs(progress - act1End) / 0.02;
  } else if (Math.abs(progress - act2End) < 0.02) {
    flashAlpha = 1 - Math.abs(progress - act2End) / 0.02;
  } else if (Math.abs(progress - act3End) < 0.02) {
    flashAlpha = 1 - Math.abs(progress - act3End) / 0.02;
  }

  // Motion Background
  renderMotionBackground(
    ctx,
    width,
    height,
    scale,
    t,
    theme.motionBackground || 'carbon-dark-studio',
    theme.accentColor || '#facc15',
    theme.secondaryColor || '#ef4444',
    themeMode,
    theme.customMotionConfig
  );

  // --------------------------------------------------------------------------
  // TOP BRAND & CAMPAIGN LOCKUP (ALWAYS PRESENT FOR COHESION)
  // --------------------------------------------------------------------------
  ctx.save();
  const padX = 40 * scale;
  const topY = 40 * scale;

  // Cotta Official Badge
  ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
  ctx.font = `900 ${22 * scale}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('COTTA NEUMÁTICOS', padX, topY + 24 * scale);

  // Verified circle
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(padX + ctx.measureText('COTTA NEUMÁTICOS').width + 16 * scale, topY + 16 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${11 * scale}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('✓', padX + ctx.measureText('COTTA NEUMÁTICOS').width + 16 * scale, topY + 20 * scale);

  // Subtitle
  ctx.fillStyle = theme.accentColor || '#facc15';
  ctx.font = `800 ${14 * scale}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText((theme.tagline || 'TEMPORADA DE OFERTAS 2026').toUpperCase(), padX, topY + 48 * scale);

  // Promo Badge Pill Top Right
  const badgeText = promoBadgeText || 'OFERTA DESTACADA';
  ctx.font = `900 ${16 * scale}px sans-serif`;
  const pBadgeW = ctx.measureText(badgeText).width + 30 * scale;
  const pBadgeX = width - padX - pBadgeW;
  ctx.fillStyle = isLight ? '#0f172a' : 'rgba(255, 255, 255, 0.12)';
  ctx.strokeStyle = theme.accentColor || '#facc15';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(pBadgeX, topY + 6 * scale, pBadgeW, 36 * scale, 10 * scale) : ctx.fillRect(pBadgeX, topY + 6 * scale, pBadgeW, 36 * scale);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isLight ? '#ffffff' : (theme.accentColor || '#facc15');
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, pBadgeX + pBadgeW / 2, topY + 30 * scale);
  ctx.restore();

  // --------------------------------------------------------------------------
  // CENTER HERO TIRE (ALWAYS CENTERED & ELEVATED ON POLISHED STAGE)
  // --------------------------------------------------------------------------
  const tireCenterY = height * 0.44;
  const tireBob = Math.sin(t * 3.5) * (8 * scale);
  const tireScale = (1 + Math.sin(t * 2) * 0.03) * scale;
  const tireSize = 480 * scale;

  ctx.save();
  ctx.translate(width / 2, tireCenterY + tireBob);
  ctx.scale(tireScale, tireScale);

  // Floor Shadow
  ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.28)' : 'rgba(0, 0, 0, 0.9)';
  ctx.beginPath();
  ctx.ellipse(0, tireSize * 0.48, tireSize * 0.42, 30 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw Tire
  if (presentationMode === 'studio-frame') {
    drawStudioFramedTire(ctx, tireImgOrCanvas, tireSize, theme.accentColor);
  } else {
    ctx.drawImage(tireImgOrCanvas, -tireSize / 2, -tireSize / 2, tireSize, tireSize);
  }
  ctx.restore();

  // Brand & Model Headline Above Tire
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
  ctx.font = `900 ${52 * scale}px sans-serif`;
  ctx.shadowColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 18 * scale;
  ctx.fillText(item.marca.toUpperCase(), width / 2, 200 * scale);
  ctx.shadowBlur = 0;

  ctx.fillStyle = theme.accentColor || '#facc15';
  ctx.font = `900 ${28 * scale}px sans-serif`;
  ctx.fillText((item.modelo || 'LÍNEA OFICIAL').toUpperCase(), width / 2, 240 * scale);
  ctx.restore();

  // --------------------------------------------------------------------------
  // ACT-SPECIFIC ELEGANT OVERLAY CARDS (BELOW TIRE)
  // --------------------------------------------------------------------------
  const cardY = height * 0.63;
  const cardW = width * 0.92;
  const cardH = 140 * scale;
  const cardX = (width - cardW) / 2;

  // ACT 1: HOOK & REVEAL (0% - 24%)
  if (inAct1) {
    ctx.save();
    ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(13, 16, 23, 0.92)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(cardX, cardY, cardW, cardH, 20 * scale) : ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.font = `900 ${18 * scale}px sans-serif`;
    ctx.fillText('⚡ OFERTA DESTACADA // LA PAMPA & BUENOS AIRES', width / 2, cardY + 40 * scale);

    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = `900 ${32 * scale}px sans-serif`;
    ctx.fillText('Llegó el momento de renovar tus cubiertas', width / 2, cardY + 82 * scale);

    ctx.fillStyle = isLight ? '#475569' : '#9ca3af';
    ctx.font = `800 ${18 * scale}px sans-serif`;
    ctx.fillText('Garantía oficial de fábrica • Stock físico inmediato', width / 2, cardY + 115 * scale);
    ctx.restore();
  }

  // ACT 2: TECHNICAL SPEC & DIMENSION (24% - 52%)
  if (inAct2) {
    ctx.save();
    ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(13, 16, 23, 0.92)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(cardX, cardY, cardW, cardH, 20 * scale) : ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accentColor || '#facc15';
    ctx.font = `800 ${18 * scale}px sans-serif`;
    ctx.fillText('FICHA TÉCNICA & MEDIDA HOMOLOGADA', width / 2, cardY + 38 * scale);

    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = `900 ${44 * scale}px monospace`;
    ctx.fillText(`${item.dimensiones} ${item.indice || ''}`, width / 2, cardY + 84 * scale);

    ctx.fillStyle = '#22c55e';
    ctx.font = `800 ${18 * scale}px sans-serif`;
    ctx.fillText('✓ Banda de rodamiento 0km de máxima adherencia en lluvia y ruta', width / 2, cardY + 118 * scale);
    ctx.restore();
  }

  // ACT 3: VEHICLE FITMENT ACARA (52% - 76%)
  if (inAct3) {
    ctx.save();
    ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(13, 16, 23, 0.92)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(cardX, cardY, cardW, cardH, 20 * scale) : ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accentColor || '#facc15';
    ctx.font = `800 ${18 * scale}px sans-serif`;
    ctx.fillText('🚗 COMPATIBILIDAD DIRECTA DE FÁBRICA (ACARA)', width / 2, cardY + 38 * scale);

    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = `900 ${36 * scale}px sans-serif`;
    ctx.fillText(`★ ${item.bestSellingCar.toUpperCase()} ★`, width / 2, cardY + 82 * scale);

    if (item.carAlternatives && item.carAlternatives.length > 0) {
      ctx.fillStyle = isLight ? '#475569' : '#d1d5db';
      ctx.font = `800 ${17 * scale}px sans-serif`;
      ctx.fillText(`También en: ${item.carAlternatives.slice(0, 3).join(' • ')}`, width / 2, cardY + 116 * scale);
    }
    ctx.restore();
  }

  // ACT 4: SALES CLIMAX & PRICING (76% - 100%)
  if (inAct4) {
    ctx.save();
    ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(13, 16, 23, 0.95)';
    ctx.strokeStyle = theme.accentColor || '#facc15';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(cardX, cardY, cardW, cardH, 20 * scale) : ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = isLight ? '#b91c1c' : (theme.accentColor || '#facc15');
    ctx.font = `900 ${52 * scale}px monospace`;
    ctx.fillText(formatCurrency(promoPrice), width / 2, cardY + 60 * scale);

    if (savings > 0) {
      ctx.fillStyle = isLight ? '#64748b' : '#9ca3af';
      ctx.font = `700 ${18 * scale}px monospace`;
      ctx.fillText(`Antes ${formatCurrency(item.precioOriginal)}  •  Ahorrás ${formatCurrency(savings)}`, width / 2, cardY + 95 * scale);
    }
    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // BOTTOM DECK: BANCO PAMPA, VALVES & WHATSAPP (ALWAYS VISIBLE & CLEAR)
  // --------------------------------------------------------------------------
  const botAreaY = height * 0.74;

  // Banco Pampa 4 and 20 Cuotas
  if (showCuotasPampa && (cuota4 > 0 || cuota20 > 0)) {
    ctx.save();
    const halfW = (cardW - 16 * scale) / 2;
    const pampaH = 64 * scale;

    // Cuota 4 pill
    ctx.fillStyle = isLight ? 'rgba(22, 163, 74, 0.12)' : 'rgba(21, 128, 61, 0.35)';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(cardX, botAreaY, halfW, pampaH, 14 * scale) : ctx.fillRect(cardX, botAreaY, halfW, pampaH);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = isLight ? '#15803d' : '#86efac';
    ctx.font = `800 ${15 * scale}px sans-serif`;
    ctx.fillText('4 CUOTAS FIJAS PAMPA', cardX + halfW / 2, botAreaY + 24 * scale);
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = `900 ${24 * scale}px monospace`;
    ctx.fillText(formatCurrency(cuota4), cardX + halfW / 2, botAreaY + 52 * scale);

    // Cuota 20 pill
    ctx.fillStyle = isLight ? 'rgba(30, 41, 59, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(cardX + halfW + 16 * scale, botAreaY, halfW, pampaH, 14 * scale) : ctx.fillRect(cardX + halfW + 16 * scale, botAreaY, halfW, pampaH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isLight ? '#475569' : '#d1d5db';
    ctx.font = `800 ${15 * scale}px sans-serif`;
    ctx.fillText('20 CUOTAS FIJAS PAMPA', cardX + halfW + 16 * scale + halfW / 2, botAreaY + 24 * scale);
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = `900 ${24 * scale}px monospace`;
    ctx.fillText(formatCurrency(cuota20), cardX + halfW + 16 * scale + halfW / 2, botAreaY + 52 * scale);
    ctx.restore();
  }

  // Free Mounting and Valves
  if (includeValvesAndMounting) {
    const vY = botAreaY + 76 * scale;
    ctx.save();
    ctx.fillStyle = isLight ? 'rgba(22, 163, 74, 0.1)' : 'rgba(34, 197, 94, 0.15)';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(cardX, vY, cardW, 40 * scale, 10 * scale) : ctx.fillRect(cardX, vY, cardW, 40 * scale);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = isLight ? '#15803d' : '#4ade80';
    ctx.font = `900 ${17 * scale}px sans-serif`;
    ctx.fillText('🔧 Montaje y válvulas sin cargo en sucursal oficial', width / 2, vY + 26 * scale);
    ctx.restore();
  }

  // WhatsApp Booking Button
  const ctaY = botAreaY + (includeValvesAndMounting ? 128 * scale : 80 * scale);
  const ctaH = 68 * scale;
  ctx.save();
  ctx.fillStyle = '#15803d';
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(cardX, ctaY, cardW, ctaH, 20 * scale) : ctx.fillRect(cardX, ctaY, cardW, ctaH);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${24 * scale}px sans-serif`;
  ctx.fillText('💬 RESERVAR POR WHATSAPP', width / 2, ctaY + 44 * scale);

  ctx.fillStyle = isLight ? '#475569' : '#d1d5db';
  ctx.font = `700 ${14 * scale}px monospace`;
  ctx.fillText(
    `SANTA ROSA: ${COMPANY_INFO.branches.santaRosa.phoneDisplay}  •  AMÉRICA: ${COMPANY_INFO.branches.america.phoneDisplay}`,
    width / 2,
    ctaY + 98 * scale
  );
  ctx.restore();

  if (flashAlpha > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.75})`;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

/**
 * Exports a crisp, high-resolution static flyer poster (1080x1920 PNG)
 * directly from the canvas engine.
 */
export async function exportStoryStaticPoster(
  item: PromoTireItem,
  theme: StoryThemeStyle,
  promoBadgeText: string,
  showCuotasPampa: boolean,
  includeValvesAndMounting: boolean,
  presentationMode: TireImagePresentationMode = 'auto-cutout',
  themeMode: StoryThemeMode = 'dark'
): Promise<{ blob: Blob; url: string; filename: string }> {
  const width = 1080;
  const height = 1920;
  const scale = 1;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('No se pudo crear el lienzo para exportar.');

  const rawImg = await loadImage(item.photoUrl);
  let procImg: HTMLImageElement | HTMLCanvasElement = rawImg;
  if (presentationMode === 'auto-cutout' && rawImg.naturalWidth > 0) {
    procImg = processImageBackgroundCutout(rawImg, 40);
  }

  let promoPrice = item.precioOriginal;
  let savings = 0;
  if (item.promoMode === 'percent_off') {
    promoPrice = Math.round(item.precioOriginal * (1 - item.discountPercent / 100));
    savings = item.precioOriginal - promoPrice;
  } else if (item.promoMode === 'direct_price') {
    promoPrice = item.directPromoPrice > 0 ? item.directPromoPrice : item.precioOriginal;
    savings = Math.max(0, item.precioOriginal - promoPrice);
  }

  const cuota4 = Math.round((promoPrice * 1.15) / 4);
  const cuota20 = Math.round((promoPrice * 1.45) / 20);
  const brandBadge = getBrandBadgeStyle(item.marca);

  // Draw the climactic Act 4 scene
  drawCinematicMultiSceneStoryboard(
    ctx,
    width,
    height,
    scale,
    6.0,
    9.0,
    0.85,
    item,
    procImg,
    presentationMode,
    theme,
    promoBadgeText,
    brandBadge,
    promoPrice,
    savings,
    cuota4,
    cuota20,
    showCuotasPampa,
    includeValvesAndMounting,
    themeMode
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('No se pudo generar la imagen del póster.'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const filename = `flyer-cotta-${item.marca.toLowerCase()}-${item.dimensiones.replace(/[^a-z0-9]/gi, '-')}.png`;
      resolve({ blob, url, filename });
    }, 'image/png');
  });
}

