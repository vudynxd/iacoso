import { MotionBackgroundType, GenerativeMotionConfig } from './storyAnimationStyles';

/**
 * Safe wrapper around CanvasRenderingContext2D.createRadialGradient to guarantee
 * non-finite, negative, or invalid values never throw runtime exceptions.
 */
function safeRadialGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number
): CanvasGradient | null {
  if (
    !Number.isFinite(x0) ||
    !Number.isFinite(y0) ||
    !Number.isFinite(r0) ||
    !Number.isFinite(x1) ||
    !Number.isFinite(y1) ||
    !Number.isFinite(r1) ||
    r0 < 0 ||
    r1 < 0
  ) {
    return null;
  }
  try {
    return ctx.createRadialGradient(x0, y0, Math.max(0, r0), x1, y1, Math.max(0, r1));
  } catch {
    return null;
  }
}

/**
 * High-End Procedural Automotive Motion Graphics Engine
 * Renders agency-grade, cinematic visual backgrounds frame-by-frame:
 * - Studio softbox lighting with realistic volumetric falloff
 * - 3D showroom polished pedestal with mirror reflection and ambient occlusion
 * - Aerodynamic wind tunnel streamlines with velocity particle heads
 * - Precision automotive telemetry HUD circles, tachometer arcs, and technical brackets
 * - Anamorphic lens flare sweeps with chromatic aberration
 * - Floating golden embers, atmospheric dust bokeh, and energy waves
 */
export function renderMotionBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  t: number, // elapsed seconds
  motionType: MotionBackgroundType,
  accentColor: string = '#facc15',
  secondaryColor: string = '#ef4444',
  themeMode: 'light' | 'dark' = 'dark',
  customConfig?: GenerativeMotionConfig
) {
  if (
    !width ||
    !height ||
    width <= 0 ||
    height <= 0 ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return;
  }

  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : width / 1080;
  const safeT = Number.isFinite(t) ? t : 0;

  ctx.save();

  // If a generative config is supplied or motionType is 'generative-prompt', use the dynamic prompt engine
  if (customConfig || motionType === 'generative-prompt') {
    drawGenerativePromptBackground(
      ctx,
      width,
      height,
      safeScale,
      safeT,
      customConfig,
      accentColor,
      secondaryColor,
      themeMode
    );
    ctx.restore();
    return;
  }

  if (themeMode === 'light') {
    drawLightShowroomStudio(ctx, width, height, safeScale, safeT, motionType, accentColor, secondaryColor);
    ctx.restore();
    return;
  }

  // Dark Mode: Choose the dedicated cinematic motion design
  switch (motionType) {
    case 'carbon-dark-studio':
      drawCinematicObsidianStudio(ctx, width, height, safeScale, safeT, accentColor, secondaryColor);
      break;
    case 'f1-pitlane-racing':
      drawApexRacingTelemetry(ctx, width, height, safeScale, safeT, accentColor, secondaryColor);
      break;
    case 'cyber-synth-grid':
      drawCyberVelocityNeon(ctx, width, height, safeScale, safeT, accentColor, secondaryColor);
      break;
    case 'offroad-dirt-terrain':
      drawTopographicExpedition(ctx, width, height, safeScale, safeT, accentColor, secondaryColor);
      break;
    case 'thunder-storm-sparks':
      drawThunderVoltEnergy(ctx, width, height, safeScale, safeT, accentColor, secondaryColor);
      break;
    case 'warp-hyperspace':
      drawHyperSpeedVortex(ctx, width, height, safeScale, safeT, accentColor, secondaryColor);
      break;
    case 'kinetic-heatwave':
      drawSolarTwilightAtmosphere(ctx, width, height, safeScale, safeT, accentColor, secondaryColor);
      break;
    case 'asphalt-speed-3d':
    default:
      drawCinematicHighwaySprint(ctx, width, height, safeScale, safeT, accentColor, secondaryColor);
      break;
  }

  ctx.restore();
}

/* ========================================================================= */
/* 1. CINEMATIC OBSIDIAN STUDIO (Luxury Showroom Black Edition)             */
/* ========================================================================= */
function drawCinematicObsidianStudio(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  accent: string,
  _sec: string
) {
  // Deep onyx studio gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0a0c10');
  bgGrad.addColorStop(0.45, '#050608');
  bgGrad.addColorStop(1, '#020204');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.44; // Tire center

  // 1. Softbox overhead studio spotlight (Radial cone)
  const spotGrad = safeRadialGradient(ctx, cx, cy - 200 * scale, 10, cx, cy, 520 * scale);
  if (spotGrad) {
    spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    spotGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.04)');
    spotGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // 2. Subtle golden/champagne accent rim glow behind tire
  const rimGlow = safeRadialGradient(ctx, cx, cy, 60 * scale, cx, cy, 380 * scale);
  if (rimGlow) {
    rimGlow.addColorStop(0, `${accent}22`);
    rimGlow.addColorStop(0.5, `${accent}0a`);
    rimGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = rimGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 380 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Polished Showroom Pedestal (3D Elliptical stage with mirror reflection)
  const pedestalY = cy + 190 * scale;
  const pedRx = 340 * scale;
  const pedRy = 85 * scale;

  // Cast shadow
  const shadowGrad = safeRadialGradient(ctx, cx, pedestalY + 5 * scale, 10, cx, pedestalY + 5 * scale, pedRx);
  if (shadowGrad) {
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    shadowGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.55)');
    shadowGrad.addColorStop(1, 'transparent');
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, pedestalY + 5 * scale, pedRx, pedRy * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = shadowGrad;
    ctx.fill();
    ctx.restore();
  }

  // Polished stage ring outline with subtle rotation
  ctx.save();
  ctx.lineWidth = 1.5 * scale;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.ellipse(cx, pedestalY, pedRx, pedRy, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Glowing accent tick markers on pedestal
  const ticks = 24;
  for (let i = 0; i < ticks; i++) {
    const angle = (i / ticks) * Math.PI * 2 + t * 0.08;
    const px = cx + Math.cos(angle) * pedRx;
    const py = pedestalY + Math.sin(angle) * pedRy;
    ctx.fillStyle = i % 4 === 0 ? accent : 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(px, py, (i % 4 === 0 ? 2.5 : 1.2) * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. Subtle Telemetry Ring (Precision Luxury Watch / HUD dial)
  ctx.save();
  const hudR = 300 * scale;
  ctx.lineWidth = 1 * scale;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.setLineDash([4 * scale, 12 * scale]);
  ctx.beginPath();
  ctx.arc(cx, cy, hudR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Rotating thin accent arc
  const arcStart = t * 0.4;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, hudR, arcStart, arcStart + Math.PI * 0.35);
  ctx.stroke();
  ctx.restore();

  // 5. Anamorphic Lens Flare Sweep (Slow horizontal laser beam across wheel)
  const flareY = cy - 20 * scale;
  const flareX = cx + Math.sin(t * 0.6) * 160 * scale;
  const flareGrad = ctx.createLinearGradient(flareX - 320 * scale, flareY, flareX + 320 * scale, flareY);
  flareGrad.addColorStop(0, 'transparent');
  flareGrad.addColorStop(0.4, `${accent}15`);
  flareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
  flareGrad.addColorStop(0.6, `${accent}15`);
  flareGrad.addColorStop(1, 'transparent');

  ctx.save();
  ctx.fillStyle = flareGrad;
  ctx.fillRect(0, flareY - 1.5 * scale, w, 3 * scale);
  // Center glint
  const glint = safeRadialGradient(ctx, flareX, flareY, 0, flareX, flareY, 30 * scale);
  if (glint) {
    glint.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    glint.addColorStop(0.2, `${accent}40`);
    glint.addColorStop(1, 'transparent');
    ctx.fillStyle = glint;
    ctx.beginPath();
    ctx.arc(flareX, flareY, 30 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 6. Floating golden dust motes with soft bokeh
  drawFloatingMotes(ctx, w, h, scale, t, accent, 32);

  // 7. Minimalist Corner Architectural Framing
  drawArchitecturalBrackets(ctx, w, h, scale, 'COTTA // OBSIDIAN STUDIO', accent);
}

/* ========================================================================= */
/* 2. APEX RACING TELEMETRY (F1 / Gran Turismo High-Octane)                  */
/* ========================================================================= */
function drawApexRacingTelemetry(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  accent: string,
  sec: string
) {
  // Deep asphalt black with carbon fiber weave illusion
  ctx.fillStyle = '#060709';
  ctx.fillRect(0, 0, w, h);

  // Carbon weave texture
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  const step = 8 * scale;
  for (let x = 0; x < w; x += step * 2) {
    ctx.fillRect(x, 0, step, h);
  }
  ctx.restore();

  const cx = w * 0.5;
  const cy = h * 0.44;

  // 1. Dynamic Speed Tunnel Lines (Horizon vanishing point)
  ctx.save();
  const vpY = cy - 60 * scale;
  const numRays = 22;
  const speed = (t * 4) % 1;

  for (let i = 0; i < numRays; i++) {
    const angle = ((i + speed) / numRays) * Math.PI * 2;
    const r1 = 180 * scale;
    const r2 = 640 * scale;
    const x1 = cx + Math.cos(angle) * r1;
    const y1 = vpY + Math.sin(angle) * (r1 * 0.6);
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = vpY + Math.sin(angle) * (r2 * 0.6);

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.7, i % 3 === 0 ? `${sec}35` : 'rgba(255, 255, 255, 0.12)');
    grad.addColorStop(1, 'transparent');

    ctx.strokeStyle = grad;
    ctx.lineWidth = (i % 3 === 0 ? 2 : 1) * scale;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Aerodynamic Wind-Tunnel Streamlines (Curving around the tire)
  ctx.save();
  const numCurves = 5;
  for (let i = 0; i < numCurves; i++) {
    const yOffset = (i - 2) * 55 * scale;
    const phase = t * 3 + i * 1.2;
    const headX = ((phase % 4) / 4) * (w + 400 * scale) - 200 * scale;
    const pathY = cy + yOffset;

    // Draw flowing streamline
    ctx.beginPath();
    ctx.moveTo(-50 * scale, pathY);
    // Deflect around tire center
    const ctrlDist = 260 * scale;
    ctx.bezierCurveTo(
      cx - ctrlDist,
      pathY + (yOffset < 0 ? -60 : 60) * scale,
      cx + ctrlDist,
      pathY + (yOffset < 0 ? -60 : 60) * scale,
      w + 50 * scale,
      pathY
    );

    ctx.strokeStyle = i === 2 ? `${accent}60` : 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = (i === 2 ? 2.5 : 1.2) * scale;
    ctx.stroke();

    // Glowing particle head on streamline
    if (headX > 0 && headX < w) {
      const pGlow = safeRadialGradient(ctx, headX, pathY, 0, headX, pathY, 14 * scale);
      if (pGlow) {
        pGlow.addColorStop(0, '#ffffff');
        pGlow.addColorStop(0.3, accent);
        pGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(headX, pathY, 14 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();

  // 3. Tachometer Gauge HUD Arc
  ctx.save();
  const gaugeR = 270 * scale;
  const startAng = Math.PI * 0.75;
  const endAng = Math.PI * 2.25;

  // Background track
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, gaugeR, startAng, endAng);
  ctx.stroke();

  // Animated active revs arc
  const revPct = 0.65 + Math.sin(t * 2) * 0.25;
  const currentAng = startAng + (endAng - startAng) * revPct;
  const revGrad = ctx.createLinearGradient(cx - gaugeR, cy, cx + gaugeR, cy);
  revGrad.addColorStop(0, accent);
  revGrad.addColorStop(0.8, sec);
  revGrad.addColorStop(1, '#ff0055');

  ctx.strokeStyle = revGrad;
  ctx.lineWidth = 5 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, gaugeR, startAng, currentAng);
  ctx.stroke();

  // Ticks
  const numTicks = 32;
  for (let i = 0; i <= numTicks; i++) {
    const a = startAng + (endAng - startAng) * (i / numTicks);
    const innerR = gaugeR - 10 * scale;
    const outerR = gaugeR + 8 * scale;
    ctx.strokeStyle = a <= currentAng ? '#ffffff' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = (i % 4 === 0 ? 2 : 1) * scale;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR);
    ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Telemetry micro-labels
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = `bold ${10 * scale}px ui-monospace, monospace`;
  ctx.fillText('SPEED // 280 KM/H', cx - 240 * scale, cy + 240 * scale);
  ctx.fillText('GRIP INDEX // 99.4%', cx + 110 * scale, cy + 240 * scale);
  ctx.fillText('TEMP // 88°C OPTIMAL', cx - 240 * scale, cy - 240 * scale);
  ctx.fillText('DOWNFORCE // 640 KG', cx + 90 * scale, cy - 240 * scale);
  ctx.restore();

  // 5. High-velocity sparks
  drawSparks(ctx, w, h, scale, t, sec, 28);

  // 6. Corner framing
  drawArchitecturalBrackets(ctx, w, h, scale, 'COTTA MOTORSPORT // APEX GT', sec);
}

/* ========================================================================= */
/* 3. CYBER VELOCITY NEON (Tokyo Drift / Wet Asphalt Sheen)                  */
/* ========================================================================= */
function drawCyberVelocityNeon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  accent: string,
  sec: string
) {
  // Midnight cyber gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#040714');
  bgGrad.addColorStop(0.5, '#02030a');
  bgGrad.addColorStop(1, '#000002');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.44;
  const horizonY = cy + 130 * scale;

  // 1. Neon Grid Perspective Floor (Wet asphalt reflection)
  ctx.save();
  const numGridLines = 14;
  for (let i = 0; i <= numGridLines; i++) {
    const xPct = i / numGridLines;
    const xBottom = -w * 0.2 + xPct * (w * 1.4);
    const grad = ctx.createLinearGradient(cx, horizonY, xBottom, h);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.3, `${accent}40`);
    grad.addColorStop(1, `${sec}80`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, horizonY);
    ctx.lineTo(xBottom, h);
    ctx.stroke();
  }

  // Horizontal scan lines with perspective compression
  const numHoriz = 10;
  for (let j = 1; j <= numHoriz; j++) {
    const p = Math.pow(j / numHoriz, 2.2);
    const y = horizonY + p * (h - horizonY);
    const alpha = Math.min(1, p * 1.2);
    ctx.strokeStyle = `rgba(6, 182, 212, ${alpha * 0.5})`;
    ctx.lineWidth = (1 + p * 2) * scale;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Cyan & Magenta Laser Sweeps (Scanning across screen)
  ctx.save();
  const laserAngle = Math.sin(t * 0.8) * 0.35;
  const laserGrad = ctx.createLinearGradient(0, 0, w, 0);
  laserGrad.addColorStop(0, 'transparent');
  laserGrad.addColorStop(0.48, 'rgba(6, 182, 212, 0.4)');
  laserGrad.addColorStop(0.5, '#ffffff');
  laserGrad.addColorStop(0.52, 'rgba(236, 72, 153, 0.4)');
  laserGrad.addColorStop(1, 'transparent');

  ctx.translate(cx, cy);
  ctx.rotate(laserAngle);
  ctx.fillStyle = laserGrad;
  ctx.fillRect(-w * 0.8, -3 * scale, w * 1.6, 6 * scale);
  ctx.restore();

  // 3. Dual Neon Halo Rings pulsating around tire
  ctx.save();
  const ring1R = (250 + Math.sin(t * 3) * 12) * scale;
  const ring2R = (280 + Math.cos(t * 2.5) * 15) * scale;

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2 * scale;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 18 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, ring1R, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = sec;
  ctx.lineWidth = 1.5 * scale;
  ctx.shadowColor = sec;
  ctx.shadowBlur = 15 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, ring2R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 4. Digital Rain Matrix particles
  drawCyberParticles(ctx, w, h, scale, t, accent, 35);

  // 5. Corner framing
  drawArchitecturalBrackets(ctx, w, h, scale, 'COTTA // CYBER VELOCITY', accent);
}

/* ========================================================================= */
/* 4. TOPOGRAPHIC EXPEDITION (4x4 Off-Road All-Terrain)                     */
/* ========================================================================= */
function drawTopographicExpedition(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  accent: string,
  _sec: string
) {
  // Deep rugged charcoal / olive earth
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0c120c');
  bgGrad.addColorStop(0.5, '#070a07');
  bgGrad.addColorStop(1, '#020302');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.44;

  // 1. Animated Topographic Contour Elevation Lines
  ctx.save();
  const numContours = 12;
  for (let c = 0; c < numContours; c++) {
    const baseR = (120 + c * 38) * scale;
    ctx.strokeStyle = c % 3 === 0 ? `${accent}40` : 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = (c % 3 === 0 ? 1.8 : 1) * scale;
    ctx.beginPath();

    const points = 64;
    for (let p = 0; p <= points; p++) {
      const angle = (p / points) * Math.PI * 2;
      // Perlin-like wave distortion
      const noise =
        Math.sin(angle * 3 + t * 0.5 + c) * 18 * scale +
        Math.cos(angle * 5 - t * 0.3) * 12 * scale;
      const r = baseR + noise;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * (r * 0.75); // slight perspective

      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  // 2. Compass Telemetry Crosshair
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1 * scale;
  ctx.setLineDash([6 * scale, 6 * scale]);
  // Horizontal & vertical axis
  ctx.beginPath();
  ctx.moveTo(cx - 320 * scale, cy);
  ctx.lineTo(cx + 320 * scale, cy);
  ctx.moveTo(cx, cy - 260 * scale);
  ctx.lineTo(cx, cy + 260 * scale);
  ctx.stroke();
  ctx.setLineDash([]);

  // Coordinates
  ctx.fillStyle = accent;
  ctx.font = `bold ${9 * scale}px ui-monospace, monospace`;
  ctx.fillText('GPS: 36°37\'S 64°17\'W [LA PAMPA]', cx - 290 * scale, cy - 180 * scale);
  ctx.fillText('ALT: 175M // ALL-TERRAIN', cx + 110 * scale, cy - 180 * scale);
  ctx.restore();

  // 3. Floating amber dust particles in sunbeam
  drawFloatingMotes(ctx, w, h, scale, t, accent, 38);

  // 4. Corner framing
  drawArchitecturalBrackets(ctx, w, h, scale, 'COTTA 4X4 // ALL-TERRAIN HEAVY-DUTY', accent);
}

/* ========================================================================= */
/* 5. THUNDER VOLT ENERGY (High-Voltage Electric Storm)                      */
/* ========================================================================= */
function drawThunderVoltEnergy(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  accent: string,
  sec: string
) {
  ctx.fillStyle = '#06030c';
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.44;

  // 1. Plasma core glow
  const plasma = safeRadialGradient(ctx, cx, cy, 20 * scale, cx, cy, 360 * scale);
  if (plasma) {
    plasma.addColorStop(0, `${accent}30`);
    plasma.addColorStop(0.4, `${sec}18`);
    plasma.addColorStop(1, 'transparent');
    ctx.fillStyle = plasma;
    ctx.beginPath();
    ctx.arc(cx, cy, 360 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Procedural Electric Lightning Bolts
  ctx.save();
  const numBolts = 4;
  for (let b = 0; b < numBolts; b++) {
    const baseAngle = (b / numBolts) * Math.PI * 2 + t * 0.6;
    let currX = cx + Math.cos(baseAngle) * 140 * scale;
    let currY = cy + Math.sin(baseAngle) * 140 * scale;

    ctx.strokeStyle = b % 2 === 0 ? '#ffffff' : accent;
    ctx.lineWidth = (b % 2 === 0 ? 2 : 1.2) * scale;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 12 * scale;
    ctx.beginPath();
    ctx.moveTo(currX, currY);

    const segments = 8;
    for (let s = 0; s < segments; s++) {
      const dist = 32 * scale;
      const angle = baseAngle + (Math.sin(t * 12 + s * 4 + b) - 0.5) * 1.2;
      currX += Math.cos(angle) * dist;
      currY += Math.sin(angle) * dist;
      ctx.lineTo(currX, currY);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 3. Incandescent electric sparks
  drawSparks(ctx, w, h, scale, t, accent, 42);

  // 4. Corner framing
  drawArchitecturalBrackets(ctx, w, h, scale, 'COTTA // HIGH-VOLTAGE POWER', accent);
}

/* ========================================================================= */
/* 6. HYPER SPEED VORTEX (Warp Hyperspace Tunnel)                            */
/* ========================================================================= */
function drawHyperSpeedVortex(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  accent: string,
  sec: string
) {
  ctx.fillStyle = '#020205';
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.44;

  // Concentric warp tunnel rings rushing outward
  ctx.save();
  const numRings = 16;
  for (let i = 0; i < numRings; i++) {
    const progress = ((t * 0.8 + i / numRings) % 1);
    const r = Math.pow(progress, 2.4) * 600 * scale;
    const alpha = Math.sin(progress * Math.PI);

    ctx.strokeStyle = i % 2 === 0 ? `${accent}${Math.round(alpha * 180).toString(16).padStart(2, '0')}` : `${sec}${Math.round(alpha * 120).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = (1 + progress * 4) * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Radial warp streaks
  ctx.save();
  const numStreaks = 45;
  for (let j = 0; j < numStreaks; j++) {
    const angle = (j / numStreaks) * Math.PI * 2;
    const offset = ((t * 2 + j * 0.3) % 1);
    const r1 = (80 + offset * 350) * scale;
    const r2 = r1 + (40 + offset * 120) * scale;

    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = cy + Math.sin(angle) * r2;

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, '#ffffff');
    grad.addColorStop(1, accent);

    ctx.strokeStyle = grad;
    ctx.lineWidth = (1 + offset * 2.5) * scale;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  drawArchitecturalBrackets(ctx, w, h, scale, 'COTTA // HYPER-SPEED VORTEX', accent);
}

/* ========================================================================= */
/* 7. SOLAR TWILIGHT (Golden Hour Pampa Sunset)                              */
/* ========================================================================= */
function drawSolarTwilightAtmosphere(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  accent: string,
  sec: string
) {
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#1c0804');
  bgGrad.addColorStop(0.4, '#2d1109');
  bgGrad.addColorStop(0.65, '#451a03');
  bgGrad.addColorStop(1, '#0c0402');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.44;

  // Glowing solar disk behind tire
  const sunGrad = safeRadialGradient(ctx, cx, cy - 40 * scale, 20 * scale, cx, cy - 40 * scale, 420 * scale);
  if (sunGrad) {
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.2, '#f59e0b');
    sunGrad.addColorStop(0.6, '#ea580c');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 40 * scale, 420 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soft atmospheric golden dust motes
  drawFloatingMotes(ctx, w, h, scale, t, '#fbbf24', 40);

  drawArchitecturalBrackets(ctx, w, h, scale, 'COTTA // ATARDECER PAMPEANO', accent);
}

/* ========================================================================= */
/* 8. CINEMATIC HIGHWAY SPRINT (Default High-Speed 3D Highway)              */
/* ========================================================================= */
function drawCinematicHighwaySprint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  accent: string,
  _sec: string
) {
  // Midnight sky & road
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#05070e');
  bgGrad.addColorStop(0.45, '#020307');
  bgGrad.addColorStop(1, '#000000');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.44;
  const horizonY = cy + 120 * scale;

  // 1. High-speed asphalt perspective highway
  ctx.save();
  const roadW = w * 1.5;
  const roadGrad = ctx.createLinearGradient(0, horizonY, 0, h);
  roadGrad.addColorStop(0, '#0d1117');
  roadGrad.addColorStop(1, '#05070a');
  ctx.fillStyle = roadGrad;

  ctx.beginPath();
  ctx.moveTo(cx - 80 * scale, horizonY);
  ctx.lineTo(cx + 80 * scale, horizonY);
  ctx.lineTo(cx + roadW * 0.5, h);
  ctx.lineTo(cx - roadW * 0.5, h);
  ctx.closePath();
  ctx.fill();

  // Speeding dashed yellow center road lines
  const numDashes = 9;
  for (let i = 0; i < numDashes; i++) {
    const progress = ((t * 2.4 + i / numDashes) % 1);
    const pExp = Math.pow(progress, 2.5);
    const y = horizonY + pExp * (h - horizonY);
    const dH = Math.max(8 * scale, pExp * 80 * scale);
    const dW = Math.max(3 * scale, pExp * 22 * scale);

    const alpha = Math.min(1, pExp * 1.5);
    ctx.fillStyle = `rgba(250, 204, 21, ${alpha})`;
    ctx.fillRect(cx - dW * 0.5, y, dW, dH);
  }
  ctx.restore();

  // 2. High-speed ambient motion light streaks along shoulders
  ctx.save();
  const numShoulderLights = 6;
  for (let s = 0; s < numShoulderLights; s++) {
    const p = ((t * 2 + s / numShoulderLights) % 1);
    const pExp = Math.pow(p, 2.8);
    const y = horizonY + pExp * (h - horizonY);
    const xL = cx - (80 * scale + pExp * (roadW * 0.48));
    const xR = cx + (80 * scale + pExp * (roadW * 0.48));
    const lightH = Math.max(10 * scale, pExp * 90 * scale);

    // Left neon light trail
    ctx.strokeStyle = `rgba(6, 182, 212, ${pExp * 0.7})`;
    ctx.lineWidth = (2 + pExp * 4) * scale;
    ctx.beginPath();
    ctx.moveTo(xL, y);
    ctx.lineTo(xL - 15 * scale, y + lightH);
    ctx.stroke();

    // Right red brake light trail
    ctx.strokeStyle = `rgba(239, 68, 68, ${pExp * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(xR, y);
    ctx.lineTo(xR + 15 * scale, y + lightH);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Floating embers / road dust
  drawSparks(ctx, w, h, scale, t, accent, 24);

  // 4. Corner framing
  drawArchitecturalBrackets(ctx, w, h, scale, 'COTTA // RUTA NACIONAL 5 & 35', accent);
}

/* ========================================================================= */
/* 9. LIGHT SHOWROOM STUDIO (Clean High-End White Architectural Studio)     */
/* ========================================================================= */
function drawLightShowroomStudio(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  _motionType: MotionBackgroundType,
  accent: string,
  _sec: string
) {
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#f8fafc');
  bgGrad.addColorStop(0.5, '#f1f5f9');
  bgGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.44;

  // Soft light pedestal
  const pedestalY = cy + 190 * scale;
  const shadowGrad = safeRadialGradient(ctx, cx, pedestalY, 10, cx, pedestalY, 320 * scale);
  if (shadowGrad) {
    shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0.18)');
    shadowGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.06)');
    shadowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(cx, pedestalY, 320 * scale, 75 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Elegant subtle light telemetry ring
  ctx.save();
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, 280 * scale, 0, Math.PI * 2);
  ctx.stroke();

  // Rotating light accent arc
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, 280 * scale, t * 0.5, t * 0.5 + Math.PI * 0.4);
  ctx.stroke();
  ctx.restore();

  drawArchitecturalBrackets(ctx, w, h, scale, 'COTTA // SALÓN OFICIAL', '#334155');
}

/* ========================================================================= */
/* 10. GENERATIVE PROMPT BACKGROUND (Dynamic Prompt Engine)                  */
/* ========================================================================= */
function drawGenerativePromptBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  config: GenerativeMotionConfig | undefined,
  accent: string,
  sec: string,
  themeMode: 'light' | 'dark'
) {
  if (!config) {
    drawCinematicObsidianStudio(ctx, w, h, scale, t, accent, sec);
    return;
  }

  // Draw Sky Gradient
  const [cTop, cMid, cBot] = config.skyColors;
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, cTop);
  skyGrad.addColorStop(0.5, cMid);
  skyGrad.addColorStop(1, cBot);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.44;

  // Volumetric Lighting Beam
  const lightGlow = safeRadialGradient(ctx, cx, cy, 20 * scale, cx, cy, 380 * scale);
  if (lightGlow) {
    lightGlow.addColorStop(0, `${config.ambientLightColor}35`);
    lightGlow.addColorStop(0.6, `${config.ambientLightColor}0a`);
    lightGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = lightGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 380 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating generative particles
  drawFloatingMotes(
    ctx,
    w,
    h,
    scale,
    t * config.speedMultiplier,
    config.particleColor || accent,
    config.particleDensity || 35
  );

  drawArchitecturalBrackets(
    ctx,
    w,
    h,
    scale,
    `COTTA // ${config.themeName.toUpperCase()}`,
    themeMode === 'light' ? '#334155' : accent
  );
}

/* ========================================================================= */
/* SHARED VISUAL UTILITIES                                                   */
/* ========================================================================= */

/** Floating bokeh dust motes */
function drawFloatingMotes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  color: string,
  count: number
) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const seed = i * 137.5;
    const x = ((Math.sin(seed) * 0.5 + 0.5) * w + Math.sin(t * 0.3 + i) * 35 * scale) % w;
    const y = (h - ((t * 22 * (0.5 + (i % 5) * 0.2) + seed * 10) % h));
    const r = (1.5 + (i % 4) * 1.5) * scale;
    const alpha = 0.2 + (Math.sin(t * 1.5 + i) * 0.5 + 0.5) * 0.45;

    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** High-energy flying sparks */
function drawSparks(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  color: string,
  count: number
) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const p = ((t * 1.8 + i / count) % 1);
    const angle = (i * 47.3) % (Math.PI * 2);
    const dist = p * 420 * scale;
    const x = w * 0.5 + Math.cos(angle) * dist;
    const y = h * 0.44 + Math.sin(angle) * (dist * 0.6) - p * 80 * scale;
    const size = (1 + (1 - p) * 3) * scale;

    ctx.fillStyle = i % 3 === 0 ? '#ffffff' : color;
    ctx.globalAlpha = (1 - p) * 0.8;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Cyber neon falling particles */
function drawCyberParticles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  t: number,
  color: string,
  count: number
) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = ((i * 37) % w);
    const y = ((t * 140 + i * 85) % h);
    const len = (8 + (i % 4) * 8) * scale;

    ctx.strokeStyle = i % 2 === 0 ? color : '#38bdf8';
    ctx.lineWidth = 1.2 * scale;
    ctx.globalAlpha = 0.4 + (i % 3) * 0.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + len);
    ctx.stroke();
  }
  ctx.restore();
}

/** Architectural micro-brackets and telemetry labels */
function drawArchitecturalBrackets(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scale: number,
  label: string,
  accentColor: string
) {
  ctx.save();
  const pad = 24 * scale;
  const arm = 14 * scale;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1.5 * scale;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(pad, pad + arm);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + arm, pad);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - pad - arm, pad);
  ctx.lineTo(w - pad, pad);
  ctx.lineTo(w - pad, pad + arm);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(pad, h - pad - arm);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(pad + arm, h - pad);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - pad - arm, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.lineTo(w - pad, h - pad - arm);
  ctx.stroke();

  // Center subtle watermark label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.font = `900 ${9 * scale}px ui-monospace, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(label, w * 0.5, h - pad + 3 * scale);

  // Tiny accent dot
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(w * 0.5 - ctx.measureText(label).width * 0.5 - 8 * scale, h - pad, 2 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
