import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for Excel sample rows
app.use(express.json({ limit: "15mb" }));

// Lazy initialization of GoogleGenAI to prevent startup failures if key is missing
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Check for rate-limiting (429), high demand (503), or quota exhaustion
function isQuotaOrUnavailable(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.code;
  const msg = String(err.message || err);
  return (
    status === 429 ||
    status === 503 ||
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("high demand") ||
    msg.includes("quota")
  );
}

// In-memory cache for dynamic story styles to avoid redundant Gemini calls
const storyStyleCache = new Map<string, { style: any; timestamp: number }>();

function synthesizeServerStoryStyle(userPrompt: string, brand?: string, model?: string) {
  const p = (userPrompt || "").toLowerCase().trim();
  const brandName = (brand || "Cotta").toUpperCase();

  const cleanTitle = (userPrompt || "")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  // 0. FLORES / PRIMAVERA
  if (
    p.includes("flor") ||
    p.includes("primavera") ||
    p.includes("petalo") ||
    p.includes("jardin") ||
    p.includes("pradera") ||
    p.includes("girasol") ||
    p.includes("margarita") ||
    p.includes("rosa") ||
    p.includes("cesped") ||
    p.includes("pasto") ||
    p.includes("hierba") ||
    p.includes("verde") ||
    (p.includes("campo") && !p.includes("tierra") && !p.includes("4x4"))
  ) {
    const themeName = `🌸 ${cleanTitle || "Campo de Flores & Primavera"}`;
    return {
      themeName,
      bgGradient: "from-[#032e16] via-[#064e3b] to-[#022c22]",
      accentColor: "#f43f5e",
      secondaryColor: "#22c55e",
      glowColor: "rgba(244, 63, 94, 0.5)",
      tireAnimationType: "float-drift",
      particles: "smoke",
      tagline: `DISFRUTÁ LA RUTA EN PRIMAVERA • ${brandName}`,
      badgeStyle: "pill",
      storyMood: userPrompt,
      motionBackground: "generative-prompt",
      customMotionConfig: {
        prompt: userPrompt,
        themeName,
        skyColors: ["#0284c7", "#38bdf8", "#fef08a"],
        horizonYRatio: 0.38,
        groundStyle: "flower-field",
        groundReflection: false,
        lightingStyle: "sunlight",
        ambientLightColor: "#fde047",
        particlesType: "flower-petals",
        particleColor: "#fb7185",
        particleSecondaryColor: "#ffffff",
        particleDensity: 65,
        speedMultiplier: 0.75,
        cameraBobbing: true,
        pulseWaveIntensity: 0.3,
      },
    };
  }

  // 1. OCEANO / MAR / BURBUJAS / AGUA
  if (
    p.includes("mar") ||
    p.includes("oceano") ||
    p.includes("océano") ||
    p.includes("burbuja") ||
    p.includes("submarino") ||
    p.includes("acuario") ||
    p.includes("coral") ||
    (p.includes("agua") && !p.includes("lluvia"))
  ) {
    const themeName = `🌊 ${cleanTitle || "Burbujas de Océano & Mar"}`;
    return {
      themeName,
      bgGradient: "from-[#02182b] via-[#042f4e] to-[#010c17]",
      accentColor: "#38bdf8",
      secondaryColor: "#2dd4bf",
      glowColor: "rgba(56, 189, 248, 0.5)",
      tireAnimationType: "float-drift",
      particles: "sparks",
      tagline: `AGARRE HIDRÁULICO TOTAL • ${brandName}`,
      badgeStyle: "neon",
      storyMood: userPrompt,
      motionBackground: "generative-prompt",
      customMotionConfig: {
        prompt: userPrompt,
        themeName,
        skyColors: ["#0369a1", "#0284c7", "#38bdf8"],
        horizonYRatio: 0.35,
        groundStyle: "underwater-ocean",
        groundReflection: true,
        lightingStyle: "sunbeams",
        ambientLightColor: "#38bdf8",
        particlesType: "bubbles",
        particleColor: "#ffffff",
        particleSecondaryColor: "#38bdf8",
        particleDensity: 55,
        speedMultiplier: 0.85,
        cameraBobbing: true,
        pulseWaveIntensity: 0.4,
      },
    };
  }

  // 2. DINERO / BILLETES / DÓLARES / CASH
  if (
    p.includes("dolar") ||
    p.includes("dólar") ||
    p.includes("billete") ||
    p.includes("dinero") ||
    p.includes("cash") ||
    p.includes("plata") ||
    p.includes("millon") ||
    p.includes("banco")
  ) {
    const themeName = `💵 ${cleanTitle || "Lluvia de Billetes & Dólares"}`;
    return {
      themeName,
      bgGradient: "from-[#052e16] via-[#021e0e] to-[#011007]",
      accentColor: "#22c55e",
      secondaryColor: "#facc15",
      glowColor: "rgba(34, 197, 94, 0.5)",
      tireAnimationType: "spin-3d",
      particles: "embers",
      tagline: `AHORRÁ DE VERDAD • ${brandName}`,
      badgeStyle: "metallic",
      storyMood: userPrompt,
      motionBackground: "generative-prompt",
      customMotionConfig: {
        prompt: userPrompt,
        themeName,
        skyColors: ["#064e3b", "#047857", "#10b981"],
        horizonYRatio: 0.4,
        groundStyle: "luxury-marble",
        groundReflection: true,
        lightingStyle: "god-rays",
        ambientLightColor: "#4ade80",
        particlesType: "money-bills",
        particleColor: "#22c55e",
        particleSecondaryColor: "#facc15",
        particleDensity: 40,
        speedMultiplier: 1.1,
        cameraBobbing: false,
        pulseWaveIntensity: 0.5,
      },
    };
  }

  // 3. OTOÑO / HOJAS SECAS
  if (p.includes("otoño") || p.includes("otono") || (p.includes("hoja") && !p.includes("flor"))) {
    const themeName = `🍂 ${cleanTitle || "Bosque Dorado & Hojas de Otoño"}`;
    return {
      themeName,
      bgGradient: "from-[#2b1003] via-[#1a0701] to-[#0a0200]",
      accentColor: "#ea580c",
      secondaryColor: "#d97706",
      glowColor: "rgba(234, 88, 12, 0.5)",
      tireAnimationType: "float-drift",
      particles: "smoke",
      tagline: `RENDIMIENTO EN OTOÑO • ${brandName}`,
      badgeStyle: "pill",
      storyMood: userPrompt,
      motionBackground: "generative-prompt",
      customMotionConfig: {
        prompt: userPrompt,
        themeName,
        skyColors: ["#451a03", "#78350f", "#f59e0b"],
        horizonYRatio: 0.38,
        groundStyle: "autumn-forest",
        groundReflection: false,
        lightingStyle: "sunlight",
        ambientLightColor: "#fbbf24",
        particlesType: "autumn-leaves",
        particleColor: "#ea580c",
        particleSecondaryColor: "#d97706",
        particleDensity: 45,
        speedMultiplier: 0.85,
        cameraBobbing: true,
        pulseWaveIntensity: 0.35,
      },
    };
  }

  // 4. DIAMANTES / CRISTALES
  if (p.includes("diamante") || p.includes("cristal") || p.includes("gema") || p.includes("joya")) {
    const themeName = `💎 ${cleanTitle || "Diamantes & Cristales Brillantes"}`;
    return {
      themeName,
      bgGradient: "from-[#0b0f19] via-[#05070d] to-[#020306]",
      accentColor: "#38bdf8",
      secondaryColor: "#f8fafc",
      glowColor: "rgba(56, 189, 248, 0.5)",
      tireAnimationType: "spin-3d",
      particles: "sparks",
      tagline: `CALIDAD Y PRESTIGIO PREMIUM • ${brandName}`,
      badgeStyle: "metallic",
      storyMood: userPrompt,
      motionBackground: "generative-prompt",
      customMotionConfig: {
        prompt: userPrompt,
        themeName,
        skyColors: ["#0f172a", "#1e293b", "#0284c7"],
        horizonYRatio: 0.4,
        groundStyle: "luxury-marble",
        groundReflection: true,
        lightingStyle: "strobe-flashes",
        ambientLightColor: "#38bdf8",
        particlesType: "diamonds",
        particleColor: "#ffffff",
        particleSecondaryColor: "#bae6fd",
        particleDensity: 35,
        speedMultiplier: 0.7,
        cameraBobbing: false,
        pulseWaveIntensity: 0.4,
      },
    };
  }

  // 5. LLUVIA / TOKIO / MOJADO
  if (p.includes("lluvia") || p.includes("mojado") || p.includes("rain") || p.includes("agua") || p.includes("tormenta")) {
    return {
      themeName: "🌧️ Lluvia & Asfalto Neón Tokio",
      bgGradient: "from-[#030712] via-[#0a0f1d] to-[#010409]",
      accentColor: "#38bdf8",
      secondaryColor: "#c084fc",
      glowColor: "rgba(56, 189, 248, 0.5)",
      tireAnimationType: "float-drift",
      particles: "sparks",
      tagline: `MÁXIMA ADHERENCIA EN MOJADO • ${brandName}`,
      badgeStyle: "neon",
      storyMood: "Lluvia cinematográfica con asfalto mojado y reflejos neón",
      motionBackground: "generative-prompt",
      customMotionConfig: {
        prompt: userPrompt,
        themeName: "🌧️ Lluvia & Asfalto Neón Tokio",
        skyColors: ["#020617", "#0f172a", "#050b14"],
        horizonYRatio: 0.37,
        groundStyle: "wet-asphalt",
        groundReflection: true,
        lightingStyle: "neon-lasers",
        ambientLightColor: "#38bdf8",
        particlesType: "rain",
        particleColor: "#38bdf8",
        particleSecondaryColor: "#c084fc",
        particleDensity: 90,
        speedMultiplier: 1.4,
        cameraBobbing: true,
        pulseWaveIntensity: 0.6,
      },
    };
  }

  // 6. DESIERTO / DUNAS / OFFROAD 4X4
  if (p.includes("desierto") || p.includes("duna") || p.includes("sahara") || p.includes("arena") || p.includes("4x4") || p.includes("offroad") || p.includes("off-road") || p.includes("barro") || p.includes("tierra") || p.includes("hilux") || p.includes("ranger")) {
    return {
      themeName: "🏜️ Dunas & Desierto 4x4",
      bgGradient: "from-[#1c120c] via-[#140b05] to-[#080402]",
      accentColor: "#f97316",
      secondaryColor: "#eab308",
      glowColor: "rgba(249, 115, 22, 0.45)",
      tireAnimationType: "offroad-bounce",
      particles: "smoke",
      tagline: `FUERZA TODO TERRENO • ${brandName}`,
      badgeStyle: "pill",
      storyMood: "Tracción salvaje sobre dunas, arena y relieve agreste",
      motionBackground: "generative-prompt",
      customMotionConfig: {
        prompt: userPrompt,
        themeName: "🏜️ Dunas & Desierto 4x4",
        skyColors: ["#29150b", "#180c05", "#0c0602"],
        horizonYRatio: 0.42,
        groundStyle: "sand-dunes",
        groundReflection: false,
        lightingStyle: "god-rays",
        ambientLightColor: "#f97316",
        particlesType: "dust-sand",
        particleColor: "#eab308",
        particleSecondaryColor: "#f97316",
        particleDensity: 55,
        speedMultiplier: 0.9,
        cameraBobbing: true,
        pulseWaveIntensity: 0.4,
      },
    };
  }

  // 7. FUEGO / VOLCÁN / CALOR
  if (p.includes("fuego") || p.includes("lava") || p.includes("volcan") || p.includes("calor") || p.includes("llama")) {
    return {
      themeName: "🔥 Furia Volcánica & Magma",
      bgGradient: "from-[#1f0606] via-[#140303] to-[#060000]",
      accentColor: "#ef4444",
      secondaryColor: "#f97316",
      glowColor: "rgba(239, 68, 68, 0.55)",
      tireAnimationType: "speed-zoom",
      particles: "embers",
      tagline: `POTENCIA EXPLOSIVA • ${brandName}`,
      badgeStyle: "skew",
      storyMood: "Asfalto incandescente y brasas ardientes",
      motionBackground: "generative-prompt",
      customMotionConfig: {
        prompt: userPrompt,
        themeName: "🔥 Furia Volcánica & Magma",
        skyColors: ["#280808", "#180404", "#080000"],
        horizonYRatio: 0.38,
        groundStyle: "volcanic-magma",
        groundReflection: true,
        lightingStyle: "strobe-flashes",
        ambientLightColor: "#ef4444",
        particlesType: "embers",
        particleColor: "#f97316",
        particleSecondaryColor: "#ef4444",
        particleDensity: 65,
        speedMultiplier: 1.3,
        cameraBobbing: true,
        pulseWaveIntensity: 0.7,
      },
    };
  }

  // 8. NIEVE / HIELO / PATAGONIA
  if (p.includes("nieve") || p.includes("hielo") || p.includes("polar") || p.includes("glaciar") || p.includes("patagonia") || p.includes("frio")) {
    return {
      themeName: "❄️ Glaciar & Nieve Austral",
      bgGradient: "from-[#08121e] via-[#050c14] to-[#020508]",
      accentColor: "#7dd3fc",
      secondaryColor: "#e0f2fe",
      glowColor: "rgba(125, 211, 252, 0.5)",
      tireAnimationType: "float-drift",
      particles: "smoke",
      tagline: `SEGURIDAD BAJO CERO • ${brandName}`,
      badgeStyle: "pill",
      storyMood: "Hielo ártico con auroras boreales y nieve en suspensión",
      motionBackground: "generative-prompt",
      customMotionConfig: {
        prompt: userPrompt,
        themeName: "❄️ Glaciar & Nieve Austral",
        skyColors: ["#0f172a", "#1e293b", "#08121e"],
        horizonYRatio: 0.39,
        groundStyle: "snow-ice",
        groundReflection: true,
        lightingStyle: "aurora-borealis",
        ambientLightColor: "#7dd3fc",
        particlesType: "snow-flakes",
        particleColor: "#e0f2fe",
        particleSecondaryColor: "#7dd3fc",
        particleDensity: 70,
        speedMultiplier: 0.8,
        cameraBobbing: false,
        pulseWaveIntensity: 0.3,
      },
    };
  }

  // 9. HIPERESPACIO / GALAXIA / COSMOS
  if (p.includes("espacio") || p.includes("galaxia") || p.includes("estrella") || p.includes("cosmos") || p.includes("warp")) {
    return {
      themeName: "🌌 Hiperespacio & Galaxia Warp",
      bgGradient: "from-[#0a0518] via-[#05020c] to-[#010003]",
      accentColor: "#a855f7",
      secondaryColor: "#38bdf8",
      glowColor: "rgba(168, 85, 247, 0.5)",
      tireAnimationType: "spin-3d",
      particles: "speed-lines",
      tagline: `VELOCIDAD DE LA LUZ • ${brandName}`,
      badgeStyle: "neon",
      storyMood: "Viaje estelar cósmico con estrellas en aceleración hiperespacial",
      motionBackground: "generative-prompt",
      customMotionConfig: {
        prompt: userPrompt,
        themeName: "🌌 Hiperespacio & Galaxia Warp",
        skyColors: ["#120524", "#0a0214", "#000000"],
        horizonYRatio: 0.5,
        groundStyle: "starfield-warp",
        groundReflection: false,
        lightingStyle: "god-rays",
        ambientLightColor: "#c084fc",
        particlesType: "starfield",
        particleColor: "#ffffff",
        particleSecondaryColor: "#a855f7",
        particleDensity: 80,
        speedMultiplier: 1.8,
        cameraBobbing: false,
        pulseWaveIntensity: 0.8,
      },
    };
  }

  // 10. F1 / PISTA / MONACO / RACING
  if (p.includes("f1") || p.includes("carrera") || p.includes("sport") || p.includes("pista") || p.includes("velocidad") || p.includes("monaco") || p.includes("drift")) {
    return {
      themeName: "🏎️ Pista de Carrera F1",
      bgGradient: "from-[#110505] via-[#1a0808] to-[#0a0000]",
      accentColor: "#ef4444",
      secondaryColor: "#facc15",
      glowColor: "rgba(239, 68, 68, 0.45)",
      tireAnimationType: "speed-zoom",
      particles: "speed-lines",
      tagline: `MÁXIMA ADHERENCIA • ${brandName}`,
      badgeStyle: "skew",
      storyMood: "Adrenalina, asfalto caliente y alta competición",
      motionBackground: "generative-prompt",
      customMotionConfig: {
        prompt: userPrompt,
        themeName: "🏎️ Pista de Carrera F1",
        skyColors: ["#140707", "#0f0404", "#040000"],
        horizonYRatio: 0.36,
        groundStyle: "racing-circuit",
        groundReflection: true,
        lightingStyle: "tunnel-lights",
        ambientLightColor: "#ef4444",
        particlesType: "sparks",
        particleColor: "#facc15",
        particleSecondaryColor: "#ef4444",
        particleDensity: 60,
        speedMultiplier: 1.5,
        cameraBobbing: true,
        pulseWaveIntensity: 0.6,
      },
    };
  }

  // 11. CYBERPUNK / SYNTHWAVE / NEON
  if (p.includes("neon") || p.includes("cyber") || p.includes("futur") || p.includes("violeta") || p.includes("cyan") || p.includes("synth")) {
    return {
      themeName: "🌃 Synthwave Cyberpunk",
      bgGradient: "from-[#0d0718] via-[#160b2e] to-[#05020c]",
      accentColor: "#a855f7",
      secondaryColor: "#06b6d4",
      glowColor: "rgba(168, 85, 247, 0.45)",
      tireAnimationType: "cyber-pulse",
      particles: "sparks",
      tagline: `TECNOLOGÍA RADIAL • ${brandName}`,
      badgeStyle: "neon",
      storyMood: "Futurismo tecnológico y luces de neón",
      motionBackground: "generative-prompt",
      customMotionConfig: {
        prompt: userPrompt,
        themeName: "🌃 Synthwave Cyberpunk",
        skyColors: ["#19082c", "#0f031b", "#030006"],
        horizonYRatio: 0.38,
        groundStyle: "neon-grid",
        groundReflection: true,
        lightingStyle: "neon-lasers",
        ambientLightColor: "#a855f7",
        particlesType: "neon-dots",
        particleColor: "#ec4899",
        particleSecondaryColor: "#06b6d4",
        particleDensity: 50,
        speedMultiplier: 1.3,
        cameraBobbing: false,
        pulseWaveIntensity: 0.7,
      },
    };
  }

  // 12. EXACT PROCEDURAL SYNTHESIS FOR ANY CUSTOM USER REQUEST
  let accent = "#facc15";
  let secondary = "#ef4444";
  let sky = ["#09090b", "#18181b", "#000000"];

  if (p.includes("azul") || p.includes("celeste")) {
    accent = "#38bdf8";
    secondary = "#0284c7";
    sky = ["#082f49", "#0369a1", "#38bdf8"];
  } else if (p.includes("verde") || p.includes("esmeralda")) {
    accent = "#22c55e";
    secondary = "#84cc16";
    sky = ["#052e16", "#14532d", "#22c55e"];
  } else if (p.includes("rojo") || p.includes("carmesi")) {
    accent = "#ef4444";
    secondary = "#f97316";
    sky = ["#450a0a", "#7f1d1d", "#ef4444"];
  } else if (p.includes("violeta") || p.includes("purpura") || p.includes("lila")) {
    accent = "#a855f7";
    secondary = "#ec4899";
    sky = ["#3b0764", "#581c87", "#a855f7"];
  } else if (p.includes("naranja") || p.includes("dorado") || p.includes("oro")) {
    accent = "#f59e0b";
    secondary = "#facc15";
    sky = ["#451a03", "#78350f", "#f59e0b"];
  } else if (p.includes("rosa") || p.includes("magenta")) {
    accent = "#ec4899";
    secondary = "#f43f5e";
    sky = ["#500724", "#831843", "#ec4899"];
  }

  const exactThemeName = `✨ ${cleanTitle || "Efecto Personalizado a Medida"}`;

  return {
    themeName: exactThemeName,
    bgGradient: "from-[#0f0f0f] via-[#171717] to-[#050505]",
    accentColor: accent,
    secondaryColor: secondary,
    glowColor: `${accent}80`,
    tireAnimationType: "spin-3d",
    particles: "sparks",
    tagline: userPrompt && userPrompt.length < 35 ? userPrompt.toUpperCase() : `EDICIÓN A MEDIDA • ${brandName}`,
    badgeStyle: "skew",
    storyMood: userPrompt || "Efecto exacto a medida",
    motionBackground: "generative-prompt",
    customMotionConfig: {
      prompt: userPrompt,
      themeName: exactThemeName,
      skyColors: sky,
      horizonYRatio: 0.38,
      groundStyle: "custom-procedural",
      groundReflection: true,
      lightingStyle: "tunnel-lights",
      ambientLightColor: accent,
      particlesType: "custom-particles",
      particleColor: accent,
      particleSecondaryColor: secondary,
      particleDensity: 50,
      speedMultiplier: 1.1,
      cameraBobbing: true,
      pulseWaveIntensity: 0.5,
    },
  };
}

// Interface for AI Analysis request
interface SheetPayload {
  sheetName: string;
  headers: string[];
  sampleRows: any[][];
  totalRows: number;
}

interface AnalyzeExcelRequest {
  fileName?: string;
  sheetNames?: string[];
  headers?: string[];
  sampleRows?: any[][];
  totalRows?: number;
  sheetsData?: SheetPayload[];
}

// Fallback heuristic analyzer when Gemini API is unavailable or offline
function fallbackContextualAnalysis(
  headers: string[],
  sampleRows: any[][],
  sheetName?: string
) {
  const norm = (s: any) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();

  let marcaCol: string | undefined;
  let modeloCol: string | undefined;
  let dimensionesCol: string | undefined;
  let rodadoCol: string | undefined;
  let categoriaCol: string | undefined;
  let indiceCol: string | undefined;
  let precioContadoCol: string | undefined;
  let precioCuota4Col: string | undefined;
  let precioCuota20Col: string | undefined;
  let stockCol: string | undefined;
  let codigoCol: string | undefined;
  let descripcionCol: string | undefined;

  const detectedInstallments: Array<{
    header: string;
    installmentCount: number;
    label: string;
    suggestedFor?: "precioCuota4" | "precioCuota20";
  }> = [];

  // Check installment columns
  for (const h of headers) {
    const n = norm(h);
    // 4 cuotas variants
    if (
      n === "4" ||
      n === "c4" ||
      n === "4c" ||
      n === "4ctas" ||
      n === "4cta" ||
      n === "cuota4" ||
      n === "cuotas4" ||
      n === "plan4" ||
      n === "4fijas" ||
      n.includes("cuota4") ||
      n.includes("4cuota") ||
      n.includes("4cta") ||
      n.includes("c4")
    ) {
      if (!precioCuota4Col) {
        precioCuota4Col = h;
        detectedInstallments.push({
          header: h,
          installmentCount: 4,
          label: "4 Cuotas",
          suggestedFor: "precioCuota4",
        });
      }
    } else if (
      n === "20" ||
      n === "c20" ||
      n === "20c" ||
      n === "20ctas" ||
      n === "20cta" ||
      n === "cuota20" ||
      n === "cuotas20" ||
      n === "plan20" ||
      n === "20fijas" ||
      n.includes("cuota20") ||
      n.includes("20cuota") ||
      n.includes("20cta") ||
      n.includes("c20")
    ) {
      if (!precioCuota20Col) {
        precioCuota20Col = h;
        detectedInstallments.push({
          header: h,
          installmentCount: 20,
          label: "20 Cuotas",
          suggestedFor: "precioCuota20",
        });
      }
    } else if (n.includes("cuota") || n.includes("cta") || n.includes("plan")) {
      const matchNum = n.match(/\d+/);
      const count = matchNum ? parseInt(matchNum[0], 10) : 0;
      detectedInstallments.push({
        header: h,
        installmentCount: count,
        label: `${count > 0 ? count : ""} Cuotas`.trim(),
      });
    }
  }

  // Check cash price (excluding detected cuotas)
  for (const h of headers) {
    if (h === precioCuota4Col || h === precioCuota20Col) continue;
    const n = norm(h);
    if (
      n === "precio" ||
      n === "contado" ||
      n === "pcontado" ||
      n === "efectivo" ||
      n === "lista" ||
      n === "preciolista" ||
      n === "mayorista" ||
      n === "unitario" ||
      n === "total" ||
      n.includes("contado") ||
      n.includes("efectivo") ||
      n.includes("precio")
    ) {
      if (!precioContadoCol) precioContadoCol = h;
    }
  }

  // Check marca, modelo, dimension, stock, codigo, descripcion
  for (const h of headers) {
    const n = norm(h);
    if (!marcaCol && (n === "marca" || n === "brand" || n === "fabr" || n.includes("marca"))) {
      marcaCol = h;
    }
    if (!modeloCol && (n === "modelo" || n === "model" || n === "diseno" || n === "linea")) {
      modeloCol = h;
    }
    if (!dimensionesCol && (n === "medida" || n === "dimensiones" || n === "dimension" || n === "size" || n === "med")) {
      dimensionesCol = h;
    }
    if (!stockCol && (n === "stock" || n === "cant" || n === "cantidad" || n === "disp" || n === "unidades" || n === "existencia")) {
      stockCol = h;
    }
    if (!codigoCol && (n === "codigo" || n === "cod" || n === "sku" || n === "art" || n === "articulo")) {
      codigoCol = h;
    }
    if (!descripcionCol && (n === "descripcion" || n === "desc" || n === "producto" || n === "detalle" || n === "item")) {
      descripcionCol = h;
    }
  }

  // Detect brand in sheet name if available
  let detectedBrand: string | undefined;
  if (sheetName) {
    const snLower = sheetName.toLowerCase();
    const commonBrands = [
      "michelin", "pirelli", "bridgestone", "goodyear", "firestone", "dunlop",
      "continental", "fate", "hankook", "yokohama", "kumho", "bfgoodrich",
      "westlake", "pace", "zmax", "onyx", "fortune", "triangle", "linglong",
      "roadstone", "maxxis", "toyo", "nexen", "cooper", "falken", "sailun",
      "royal black", "general tire", "gt radial", "aptany", "grenlander"
    ];
    for (const b of commonBrands) {
      if (snLower.includes(b.replace(/\s+/g, ""))) {
        detectedBrand = b.charAt(0).toUpperCase() + b.slice(1);
        break;
      }
    }
  }

  return {
    detectedBrand,
    mapping: {
      marcaCol,
      modeloCol,
      dimensionesCol,
      rodadoCol,
      categoriaCol,
      indiceCol,
      precioContadoCol,
      precioCuota4Col,
      precioCuota20Col,
      stockCol,
      codigoCol,
      descripcionCol,
    },
    detectedInstallmentHeaders: detectedInstallments,
    hasCompoundDescription: Boolean(descripcionCol && (!dimensionesCol || !marcaCol)),
    compoundColumn: descripcionCol,
    insights: sheetName
      ? `Página "${sheetName}": se identificaron ${headers.length} columnas. ${detectedBrand ? `Marca detectada: ${detectedBrand}.` : ""}`
      : "Detección contextual heurística: se identificaron las columnas según nomenclatura automotriz y financiera.",
    cuotasPolicy: "use_detected_columns",
    confidence: "medium",
  };
}

// ----------------------------------------------------
// API ENDPOINT: POST /api/analyze-excel
// Analyzes uploaded Excel headers and sample data using Gemini AI across ALL sheets
// ----------------------------------------------------
app.post("/api/analyze-excel", async (req, res) => {
  try {
    const { fileName, sheetNames, headers, sampleRows, totalRows, sheetsData } =
      req.body as AnalyzeExcelRequest;

    const sheetsToAnalyze: SheetPayload[] = [];

    if (sheetsData && Array.isArray(sheetsData) && sheetsData.length > 0) {
      sheetsToAnalyze.push(...sheetsData);
    } else if (headers && Array.isArray(headers) && headers.length > 0) {
      sheetsToAnalyze.push({
        sheetName: (sheetNames && sheetNames[0]) || "Hoja1",
        headers,
        sampleRows: sampleRows || [],
        totalRows: totalRows || (sampleRows ? sampleRows.length : 0),
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Se requieren los encabezados o datos de las hojas del Excel.",
      });
      return;
    }

    const ai = getAiClient();

    // If Gemini API is not configured, run multi-sheet contextual heuristic engine
    if (!ai) {
      console.log("GEMINI_API_KEY no configurada. Usando motor contextual heurístico multi-hoja.");
      const sheetsAnalysis = sheetsToAnalyze.map((s) => {
        const singleAnalysis = fallbackContextualAnalysis(s.headers, s.sampleRows, s.sheetName);
        return {
          sheetName: s.sheetName,
          detectedBrand: singleAnalysis.detectedBrand,
          mapping: singleAnalysis.mapping,
          detectedInstallmentHeaders: singleAnalysis.detectedInstallmentHeaders,
          compoundColumn: singleAnalysis.compoundColumn,
          insights: singleAnalysis.insights,
        };
      });

      const firstAnalysis = fallbackContextualAnalysis(
        sheetsToAnalyze[0].headers,
        sheetsToAnalyze[0].sampleRows,
        sheetsToAnalyze[0].sheetName
      );

      res.json({
        success: true,
        source: "heuristic",
        analysis: {
          ...firstAnalysis,
          insights: `Se analizaron contextualmente ${sheetsToAnalyze.length} página(s) del archivo. Cada página fue organizada con su propia estructura de columnas y marcas.`,
          sheets: sheetsAnalysis,
        },
      });
      return;
    }

    // Build rich multi-sheet prompt for Gemini
    const formattedSheetsSummary = sheetsToAnalyze.map((s, idx) => {
      const sampleFormatted = (s.sampleRows || []).slice(0, 5).map((row, rIdx) => {
        const rowObj: Record<string, any> = {};
        s.headers.forEach((h, cIdx) => {
          rowObj[h] = row[cIdx] !== undefined ? row[cIdx] : "";
        });
        return `    Fila ${rIdx + 1}: ${JSON.stringify(rowObj)}`;
      });

      return `--- PÁGINA / HOJA ${idx + 1}: "${s.sheetName}" ---
Total filas estimadas: ${s.totalRows}
Columnas (${s.headers.length}): ${JSON.stringify(s.headers)}
Muestra de datos reales:
${sampleFormatted.join("\n") || "    (Sin filas de muestra)"}`;
    });

    const prompt = `Eres un sistema experto en inteligencia de datos para catálogos y listas de precios de neumáticos (cubiertas para autos, camionetas, SUVs y utilitarios) en Argentina y el Cono Sur.

El usuario subió un archivo Excel con múltiples páginas/hojas por marcas diferentes y celdas organizadas de manera diferente en cada hoja.
Revisa TODO el archivo, examina las celdas de cada hoja, y organízalo por IA para que todas las marcas y neumáticos se agrupen en un catálogo unificado:

Nombre del archivo: "${fileName || "catalogo.xlsx"}"
Total de páginas / hojas detectadas: ${sheetsToAnalyze.length}

DETALLE DE CADA PÁGINA / HOJA:
${formattedSheetsSummary.join("\n\n")}

DIRECTIVAS CRÍTICAS DE NEGOCIO:
1. Análisis por Hoja:
   - En archivos de proveedores de neumáticos, cada página o pestaña suele representar una MARCA distinta (ej: "MICHELIN", "PACE", "PIRELLI", "BFGOODRICH", etc.), o tener nombres de columna diferentes entre sí (por ejemplo, una página usa "MEDIDA | MODELO | CONTADO | C4 | C20" y otra usa "DESCRIPCION | PRECIO LISTA | 4 | 20 | STOCK").
   - Identifica para CADA página cuál es la marca asociada (por el nombre de la página o por los textos en sus celdas).
   - Genera el mapeo de columnas específico para CADA página (marcaCol, modeloCol, dimensionesCol, rodadoCol, categoriaCol, indiceCol, precioContadoCol, precioCuota4Col, precioCuota20Col, stockCol, codigoCol, descripcionCol).
   - Si una página no tiene columna de marca explícita, indica "detectedBrand" con el nombre de la marca que debe heredar esa página.

2. Revisión de Celdas y Cuotas:
   - Revisa si hay celdas con datos compuestos (por ejemplo, una celda con "205/55R16 91V PRIMACY 4" que combina medida, índice y modelo).
   - Cuotas: Prioriza siempre detectar las columnas de cuotas de cada hoja (ej: 4, C4, 4 cuotas, 20, C20, 20 cuotas) para usar los importes de las celdas directamente.

3. Agrupación y Consolidación:
   - Explica en "insights" cómo organizaste y agrupaste las diferentes páginas para formar un único catálogo consolidado.

Responde ÚNICAMENTE con un objeto JSON con esta estructura exacta:
{
  "insights": string,
  "confidence": "high" | "medium" | "low",
  "mapping": {
    "marcaCol": string or null,
    "modeloCol": string or null,
    "dimensionesCol": string or null,
    "rodadoCol": string or null,
    "categoriaCol": string or null,
    "indiceCol": string or null,
    "precioContadoCol": string or null,
    "precioCuota4Col": string or null,
    "precioCuota20Col": string or null,
    "stockCol": string or null,
    "codigoCol": string or null,
    "descripcionCol": string or null
  },
  "detectedInstallmentHeaders": [
    {
      "header": string,
      "installmentCount": number,
      "label": string,
      "suggestedFor": "precioCuota4" | "precioCuota20" | null
    }
  ],
  "compoundColumn": string or null,
  "sheets": [
    {
      "sheetName": string,
      "detectedBrand": string or null,
      "mapping": {
        "marcaCol": string or null,
        "modeloCol": string or null,
        "dimensionesCol": string or null,
        "rodadoCol": string or null,
        "categoriaCol": string or null,
        "indiceCol": string or null,
        "precioContadoCol": string or null,
        "precioCuota4Col": string or null,
        "precioCuota20Col": string or null,
        "stockCol": string or null,
        "codigoCol": string or null,
        "descripcionCol": string or null
      },
      "detectedInstallmentHeaders": [
        {
          "header": string,
          "installmentCount": number,
          "label": string,
          "suggestedFor": "precioCuota4" | "precioCuota20" | null
        }
      ],
      "compoundColumn": string or null,
      "notes": string
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    let parsedAnalysis: any;

    try {
      parsedAnalysis = JSON.parse(responseText);
    } catch (parseErr) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No se pudo obtener una respuesta JSON válida del modelo.");
      }
    }

    // Ensure mapping exists on top-level
    if (!parsedAnalysis.mapping && parsedAnalysis.sheets && parsedAnalysis.sheets.length > 0) {
      parsedAnalysis.mapping = parsedAnalysis.sheets[0].mapping;
    }

    res.json({
      success: true,
      source: "gemini",
      analysis: parsedAnalysis,
    });
  } catch (err: any) {
    if (!isQuotaOrUnavailable(err)) {
      console.warn("Aviso en /api/analyze-excel (usando análisis contextual heurístico):", err.message || err);
    }
    // Graceful multi-sheet fallback to heuristic analysis
    const sheetsToAnalyze: SheetPayload[] = req.body?.sheetsData || [
      {
        sheetName: "Hoja1",
        headers: req.body?.headers || [],
        sampleRows: req.body?.sampleRows || [],
        totalRows: (req.body?.sampleRows || []).length,
      },
    ];

    const sheetsAnalysis = sheetsToAnalyze.map((s) => {
      const single = fallbackContextualAnalysis(s.headers, s.sampleRows, s.sheetName);
      return {
        sheetName: s.sheetName,
        detectedBrand: single.detectedBrand,
        mapping: single.mapping,
        detectedInstallmentHeaders: single.detectedInstallmentHeaders,
        compoundColumn: single.compoundColumn,
        insights: single.insights,
      };
    });

    const fallbackResult = fallbackContextualAnalysis(
      sheetsToAnalyze[0]?.headers || [],
      sheetsToAnalyze[0]?.sampleRows || [],
      sheetsToAnalyze[0]?.sheetName
    );

    res.json({
      success: true,
      source: "fallback",
      analysis: {
        ...fallbackResult,
        insights: `Análisis completado con motor local: ${sheetsToAnalyze.length} página(s) organizada(s) y agrupada(s).`,
        sheets: sheetsAnalysis,
      },
      notice: "Análisis completado mediante motor contextual local.",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Image proxy endpoint to bypass CORS and hotlink protection so images can be drawn onto flyer canvas/PDF
app.get("/api/image-proxy", async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).send("URL parameter is required");
    }

    const decodedUrl = decodeURIComponent(rawUrl);
    if (!decodedUrl.startsWith("http://") && !decodedUrl.startsWith("https://")) {
      return res.status(400).send("Invalid URL protocol");
    }

    const imageRes = await fetch(decodedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!imageRes.ok) {
      return res.status(imageRes.status).send("Failed to fetch upstream image");
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const buffer = await imageRes.arrayBuffer();

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Cache-Control", "public, max-age=86400");
    res.set("Content-Type", contentType);
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    res.status(500).send(err.message || "Proxy error");
  }
});

// Endpoint to search the internet in real time for tire product photos
app.post("/api/search-tire-image", async (req, res) => {
  try {
    const { brand = "", model = "", dimensions = "", customQuery = "" } = req.body || {};

    const cleanBrand = (brand || "").trim();
    const cleanModel = (model || "").trim();
    const cleanDim = (dimensions || "").trim();

    const query =
      customQuery && customQuery.trim()
        ? customQuery.trim()
        : `${cleanBrand} ${cleanModel} ${cleanDim} tire neumatico`.trim();

    const searchCandidates = [
      query,
      `${cleanBrand} ${cleanModel} ${cleanDim} tire`,
      `${cleanBrand} ${cleanModel} cubierta`,
      `${cleanBrand} ${cleanDim} neumatico`,
    ].filter((q, idx, arr) => q.length > 2 && arr.indexOf(q) === idx);

    let foundImages: any[] = [];
    let usedQuery = query;

    for (const q of searchCandidates) {
      try {
        const pageRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(q)}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
          },
          signal: AbortSignal.timeout(5000),
        });

        const html = await pageRes.text();
        const vqdMatch = html.match(/vqd=([0-9-]+)/) || html.match(/"vqd":"([^"]+)"/);
        if (!vqdMatch) continue;
        const vqd = vqdMatch[1];

        const imgRes = await fetch(
          `https://duckduckgo.com/i.js?q=${encodeURIComponent(q)}&o=json&vqd=${vqd}&f=,,,type:photo,,&p=1`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Referer: "https://duckduckgo.com/",
            },
            signal: AbortSignal.timeout(6000),
          }
        );

        const data = await imgRes.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          usedQuery = q;
          foundImages = data.results
            .filter(
              (item: any) =>
                item &&
                item.image &&
                typeof item.image === "string" &&
                !item.image.includes(".svg") &&
                (item.image.startsWith("http://") || item.image.startsWith("https://"))
            )
            .map((item: any) => {
              let domain = "";
              try {
                domain = new URL(item.url || item.image).hostname.replace(/^www\./, "");
              } catch {}
              return {
                url: item.image,
                proxiedUrl: `/api/image-proxy?url=${encodeURIComponent(item.image)}`,
                thumbnail: item.thumbnail || item.image,
                title: item.title || `${cleanBrand} ${cleanModel}`,
                sourceDomain: domain,
                width: item.width || 800,
                height: item.height || 800,
              };
            });

          if (foundImages.length > 0) break;
        }
      } catch (searchErr) {
        console.warn("Online search candidate failed:", q, searchErr);
      }
    }

    if (foundImages.length > 0) {
      return res.json({
        success: true,
        source: "online_web_search",
        queryUsed: usedQuery,
        totalFound: foundImages.length,
        bestImage: foundImages[0],
        images: foundImages.slice(0, 16),
      });
    }

    res.json({
      success: false,
      source: "no_results",
      message: "No se encontraron fotos en internet en tiempo real para esta consulta.",
      images: [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to search images online" });
  }
});

// Endpoint to find the top 3 best-selling cars in Argentina for a tire size
app.post("/api/suggest-vehicles", async (req, res) => {
  try {
    const { dimensions, brand, model } = req.body || {};
    if (!dimensions) {
      return res.status(400).json({ error: "Dimension is required" });
    }

    const ai = getAiClient();
    if (ai) {
      try {
        const prompt = `Actúa como un experto en el mercado automotor argentino y estadísticas de patentamiento de ACARA.
Para el neumático de medida EXACTA: "${dimensions}" (Marca: "${brand || 'Neumático'}", Modelo: "${model || ''}"):
Indica los 3 modelos de autos o camionetas MÁS VENDIDOS y populares en Argentina que REALMENTE CALZAN o usan esa medida exacta de fábrica.

REGLAS ESTRICTAS DE FILTRADO:
1. NUNCA menciones un auto que NO calce esa medida.
2. Si el auto más vendido en general de Argentina (ej. Fiat Cronos, Peugeot 208, Toyota Hilux o Toyota Yaris) NO calza esa medida, DESCÁRTALO INMEDIATAMENTE y busca en el ranking de ventas de ACARA el siguiente auto que SÍ calce esa medida.
Ejemplos de rigor:
- Medida 205/55 R16: Toyota Yaris NO la calza (Yaris usa 185/60 R15). Hilux tampoco. Los más vendidos que sí la calzan son: Fiat Cronos Precision, Peugeot 208 Feline, Toyota Corolla XEi, Chevrolet Cruze.
- Medida 185/60 R15: Fiat Cronos Drive, Toyota Yaris XLS, Toyota Etios XLS.
- Medida 265/65 R17: Toyota Hilux SRV/SR, Ford Ranger XLT, Chevrolet S10 LTZ.
- Medida 195/65 R15: Renault Kangoo Stepway, Toyota Corolla XLi, Ford Focus.

Responde ÚNICAMENTE un objeto JSON válido:
{
  "cars": ["Modelo 1 (Versión)", "Modelo 2 (Versión)", "Modelo 3 (Versión)"],
  "alternatives": ["Modelo 4", "Modelo 5"],
  "description": "Explicación del filtrado por medida para flyer"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const text = response.text?.trim() || "";
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.cars) && parsed.cars.length >= 3) {
            return res.json({
              success: true,
              source: "gemini",
              cars: parsed.cars.slice(0, 3),
              alternatives: parsed.alternatives || [],
              description: parsed.description || "",
            });
          }
        }
      } catch (geminiErr: any) {
        if (!isQuotaOrUnavailable(geminiErr)) {
          console.warn("Aviso al consultar vehículos en Gemini:", geminiErr.message || geminiErr);
        }
      }
    }

    // Fallback response if Gemini is unavailable or rate limited
    res.json({
      success: true,
      source: "fallback",
      message: "Ready for client local database resolution",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to query vehicles" });
  }
});

// Endpoint to analyze and match tire brand, model, and marketing attributes using Gemini
app.post("/api/resolve-tire-image", async (req, res) => {
  try {
    const { brand, model, dimensions, category } = req.body || {};
    const ai = getAiClient();

    if (ai) {
      try {
        const prompt = `Actúa como Director de Marketing de Neumáticos y experto en catálogos de cubiertas en Argentina.
Analiza este neumático exacto:
- Marca: "${brand || 'Neumático'}"
- Modelo: "${model || ''}"
- Medida: "${dimensions || ''}"
- Categoría: "${category || ''}"

Determina:
1. ¿A qué marca y familia de pisada oficial pertenece?
2. Preset más adecuado entre: ["michelin-primacy", "bfgoodrich-ko2", "pirelli-cinturato", "bridgestone-turanza", "goodyear-wrangler", "fate-maxisport", "continental-suv", "zmax-zephyr", "onyx-pace-fortinr", "photo-at-45", "photo-sport-45", "photo-suv-45", "photo-van-45", "photo-tour-45"]
3. Razón técnica y comercial que certifica por qué la pisada y el diseño corresponden con este modelo y marca.
4. Gancho de marketing de alta conversión ("marketingHook") para vender en La Pampa / Buenos Aires.

Responde ÚNICAMENTE un objeto JSON válido:
{
  "matchedPresetId": "string",
  "technicalReason": "string",
  "marketingHook": "string",
  "brandOfficialLabel": "string"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const text = response.text?.trim() || "";
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({
            success: true,
            source: "gemini",
            ...parsed,
          });
        }
      } catch (geminiErr: any) {
        if (!isQuotaOrUnavailable(geminiErr)) {
          console.warn("Aviso al resolver neumático en Gemini:", geminiErr.message || geminiErr);
        }
      }
    }

    res.json({
      success: true,
      source: "fallback",
      message: "Ready for client local resolution",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to resolve tire" });
  }
});

// Endpoint to generate dynamic Story Animation styling based on user's natural language prompt
app.post("/api/generate-story-style", async (req, res) => {
  try {
    const { userPrompt, brand, model, dimensions } = req.body || {};
    const promptKey = `${(userPrompt || "").toLowerCase().trim()}_${(brand || "").toLowerCase()}_${(model || "").toLowerCase()}`;

    // Check in-memory cache first
    const cached = storyStyleCache.get(promptKey);
    if (cached && Date.now() - cached.timestamp < 1000 * 60 * 60) {
      return res.json({
        success: true,
        source: "cache",
        style: cached.style,
      });
    }

    const ai = getAiClient();

    if (ai && userPrompt) {
      try {
        const systemPrompt = `Eres un Director de Arte y Motion Designer de historias para redes sociales (Instagram Reels, TikTok, WhatsApp Status) especializado en el rubro automotor y neumáticos.
El usuario quiere crear un diseño animado en formato historia (9:16 vertical) para una gomería ("COTTA NEUMÁTICOS") vendiendo el neumático:
- Marca: "${brand || 'Neumático'}"
- Modelo: "${model || ''}"
- Medida: "${dimensions || ''}"
- Prompt de estilo del usuario: "${userPrompt}"

Reglas:
1. Siempre debes conservar la autenticidad de la marca de neumático y el profesionalismo comercial.
2. Adapta la paleta, efectos visuales de fondo y dinamismo de animación fielmente al prompt del usuario. Si el usuario pide flores, primavera, jardín, pradera o naturaleza, DEBES usar groundStyle: "flower-field", lightingStyle: "sunlight" y particlesType: "flower-petals", con colores primaverales vibrantes (rosas, verdes vivos, sol dorado, cielo celeste).
3. Elige el tipo de animación de cubierta más adecuado:
   - "spin-3d" (giro y perspectiva 3D)
   - "float-drift" (flotación con deriva y pulso)
   - "speed-zoom" (zoom acelerado con entrada de pista)
   - "cyber-pulse" (latido de neón con brillo rítmico)
   - "offroad-bounce" (impacto firme con fuerza de suspensión)
4. Elige los efectos de partículas/fondo: "sparks" | "smoke" | "speed-lines" | "embers" | "none"
5. Genera un gancho o frase corta de 2 a 5 palabras para la historia ("tagline").
6. Configura el ambiente de movimiento generativo dinámico ("customMotionConfig") para que el motor visual dibuje en tiempo real el escenario según el prompt del usuario:
   - skyColors: 3 colores hexadecimales [arriba, medio, horizonte] acordes al clima/ambiente
   - groundStyle: "flower-field" | "spring-meadow" | "wet-asphalt" | "neon-grid" | "sand-dunes" | "starfield-warp" | "racing-circuit" | "dark-studio" | "snow-ice" | "volcanic-magma" | "matrix-data" | "autumn-forest" | "sunset-highway"
   - groundReflection: boolean (true si el piso refleja luces o agua)
   - lightingStyle: "sunlight" | "sunbeams" | "tunnel-lights" | "neon-lasers" | "thunder-bolts" | "god-rays" | "strobe-flashes" | "volumetric-fog" | "aurora-borealis"
   - particlesType: "flower-petals" | "petals" | "leaves" | "fireflies" | "embers" | "sparks" | "rain" | "speed-streaks" | "dust-sand" | "starfield" | "smoke-puffs" | "neon-dots" | "snow-flakes"
   - speedMultiplier: número entre 0.7 y 2.0
   - cameraBobbing: boolean

Responde ÚNICAMENTE un objeto JSON válido con esta estructura exacta:
{
  "themeName": "string",
  "bgGradient": "string (degradado tailwind o css)",
  "accentColor": "string (hexadecimal)",
  "secondaryColor": "string (hexadecimal)",
  "glowColor": "string (rgba o hex)",
  "tireAnimationType": "spin-3d | float-drift | speed-zoom | cyber-pulse | offroad-bounce",
  "particles": "sparks | smoke | speed-lines | embers | none",
  "tagline": "string",
  "badgeStyle": "skew | neon | pill | metallic",
  "storyMood": "string",
  "motionBackground": "generative-prompt",
  "customMotionConfig": {
    "themeName": "string",
    "skyColors": ["#hex1", "#hex2", "#hex3"],
    "horizonYRatio": 0.38,
    "groundStyle": "flower-field | spring-meadow | wet-asphalt | neon-grid | sand-dunes | starfield-warp | racing-circuit | dark-studio | snow-ice | volcanic-magma | matrix-data",
    "groundReflection": true,
    "lightingStyle": "sunlight | sunbeams | tunnel-lights | neon-lasers | thunder-bolts | god-rays | strobe-flashes | volumetric-fog | aurora-borealis",
    "ambientLightColor": "#hex",
    "particlesType": "flower-petals | petals | leaves | fireflies | embers | sparks | rain | speed-streaks | dust-sand | starfield | smoke-puffs | neon-dots | snow-flakes",
    "particleColor": "#hex",
    "particleSecondaryColor": "#hex",
    "particleDensity": 50,
    "speedMultiplier": 1.2,
    "cameraBobbing": true,
    "pulseWaveIntensity": 0.5
  }
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: systemPrompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const text = response.text?.trim() || "";
        if (text) {
          const parsed = JSON.parse(text);
          storyStyleCache.set(promptKey, { style: parsed, timestamp: Date.now() });
          return res.json({
            success: true,
            source: "gemini",
            style: parsed,
          });
        }
      } catch (geminiErr: any) {
        if (!isQuotaOrUnavailable(geminiErr)) {
          console.warn("Aviso al consultar estilo en Gemini:", geminiErr.message || geminiErr);
        }
        // Seamlessly synthesize style when rate-limited or busy
        const fallbackStyle = synthesizeServerStoryStyle(userPrompt, brand, model);
        storyStyleCache.set(promptKey, { style: fallbackStyle, timestamp: Date.now() });
        return res.json({
          success: true,
          source: "synthesizer",
          style: fallbackStyle,
        });
      }
    }

    const fallbackStyle = synthesizeServerStoryStyle(userPrompt, brand, model);
    storyStyleCache.set(promptKey, { style: fallbackStyle, timestamp: Date.now() });
    res.json({
      success: true,
      source: "fallback",
      style: fallbackStyle,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate story style" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`COTTA Neumáticos Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
