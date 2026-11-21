import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  gravity: number;
  drag: number;
  isTooth?: boolean;
  isTear?: boolean;
  isBone?: boolean;
  isTissue?: boolean;
  isMist?: boolean;
  isSaliva?: boolean;
  isSatellite?: boolean;
  expandRate?: number;
  rotation?: number;
  vRot?: number;
  leaveStain: boolean;
  wallHitDist: number;
  hasSplattered?: boolean;
  canBreakup?: boolean;
}

interface ActiveDrip {
  x: number;
  y: number;
  width: number;
  color: string;
  alpha: number;
  length: number;
  maxLength: number;
  speed: number;
  lingerTimer: number;
  wobblePhase: number;
  wobbleFreq: number;
  wobbleAmp: number;
  stickPhase: number;
  points: Array<{ x: number; y: number; w: number }>;
  lastPointY: number;
}

export interface BloodSpawnOptions {
  intensity: number; // 1 to 8
  isCrit: boolean;
  isArmored: boolean;
  isPlasma?: boolean;
  isBleedTick?: boolean;
  isArterial?: boolean;
  hasSaliva?: boolean;
  knockedTeeth?: number;
  boneShards?: number;
  tissueChunks?: number;
  hasMist?: boolean;
  isRage?: boolean;
  dirX?: number;
  dirY?: number;
}

export interface BloodCanvasHandle {
  spawnHit: (clientX: number, clientY: number, options: BloodSpawnOptions) => void;
  spawnArterialSpurt: (clientX: number, clientY: number) => void;
  spawnBleedDrop: (clientX: number, clientY: number, severity?: number) => void;
  spawnTearDrop: (clientX: number, clientY: number) => void;
  spawnKoBurst: () => void;
  spawnExecutionBurst: () => void;
  clearStains: () => void;
}

// Photorealistic fresh oxygenated arterial vs deep clotted venous blood tones
const FLYING_BLOOD_PALETTE = ['#3b0305', '#520508', '#6b080c', '#850d11', '#9e1317'];
const ARTERIAL_BLOOD_PALETTE = ['#6e090c', '#8f0f13', '#ad161b', '#c81e24', '#9e1317'];
const WALL_STAIN_PALETTE = ['#240203', '#360406', '#4a0608', '#5e080b', '#700b0f'];
const TISSUE_PALETTE = ['#280304', '#3c0406', '#520709'];

export const BloodCanvas = forwardRef<BloodCanvasHandle>(function BloodCanvas(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const activeDripsRef = useRef<ActiveDrip[]>([]);
  const stainCountRef = useRef<number>(0);
  const sizeRef = useRef({ width: 800, height: 600, dpr: 1 });

  /**
   * Stamps a realistic forensic blood spatter onto the cached offscreen wall canvas:
   * - Angle-of-incidence elliptical elongation
   * - Scalloped surface-tension crown perimeter
   * - Radial depth gradient (dark thick pooling center -> rich translucent edge)
   * - Forward-biased wave spines & exclamation-mark satellite cast-off droplets
   * - Subtle wet spotlight specular highlight
   */
  const stampWallSplatter = (
    x: number,
    y: number,
    baseRadius: number,
    impactAngle: number,
    impactSpeed: number,
    color: string,
    alpha: number,
    allowDrip: boolean
  ) => {
    const stainCanvas = stainCanvasRef.current;
    if (!stainCanvas) return;
    const sCtx = stainCanvas.getContext('2d');
    if (!sCtx) return;

    const { width, height } = sizeRef.current;
    if (x < -50 || x > width + 50 || y < -50 || y > height + 50) return;

    // Gentle oxidation & fade of oldest stains when wall accumulates hundreds of marks
    stainCountRef.current += 1;
    if (stainCountRef.current > 420 && stainCountRef.current % 16 === 0) {
      sCtx.save();
      sCtx.setTransform(1, 0, 0, 1, 0, 0);
      sCtx.globalCompositeOperation = 'destination-out';
      sCtx.fillStyle = 'rgba(0, 0, 0, 0.035)';
      sCtx.fillRect(0, 0, stainCanvas.width, stainCanvas.height);
      sCtx.restore();
    }

    // Shallow oblique impact angle stretches stain into an elongated forensic ellipse
    const elongation = Math.min(3.1, 1.08 + impactSpeed * 0.11);
    const cosA = Math.cos(impactAngle);
    const sinA = Math.sin(impactAngle);

    sCtx.save();
    sCtx.translate(x, y);
    sCtx.rotate(impactAngle);

    // 1. Subtle wall-absorbed dried soak halo around perimeter
    sCtx.globalAlpha = alpha * 0.38;
    sCtx.fillStyle = '#140102';
    drawScallopedBloodBlob(
      sCtx,
      0,
      0,
      baseRadius * 1.18 * elongation,
      baseRadius * 1.1,
      14,
      0.26,
      0.16
    );
    sCtx.fill();

    // 2. Main scalloped liquid pool with optical depth gradient (thicker = darker center)
    const maxR = Math.max(2, baseRadius * elongation * 1.15);
    const poolGrad = sCtx.createRadialGradient(
      -baseRadius * 0.1,
      0,
      Math.max(0.4, baseRadius * 0.18),
      0,
      0,
      maxR
    );
    poolGrad.addColorStop(0, '#220203');
    poolGrad.addColorStop(0.55, color);
    poolGrad.addColorStop(0.88, '#6e0a0e');
    poolGrad.addColorStop(1, '#300304');

    sCtx.globalAlpha = Math.min(0.95, alpha * 0.94);
    sCtx.fillStyle = poolGrad;
    drawScallopedBloodBlob(
      sCtx,
      baseRadius * 0.14,
      0,
      baseRadius * elongation,
      baseRadius * 0.9,
      16,
      0.34,
      baseRadius > 5 ? 0.24 : 0.12
    );
    sCtx.fill();

    // 3. Coagulated outer meniscus ring (dried blood concentrates darker at the outer rim)
    if (baseRadius > 3.2) {
      sCtx.globalAlpha = alpha * 0.42;
      sCtx.strokeStyle = '#1e0203';
      sCtx.lineWidth = Math.max(0.6, Math.min(1.6, baseRadius * 0.14));
      sCtx.stroke();
    }

    // 4. Forward-biased crown spines & wave cast-off "exclamation mark" droplets
    const spineCount =
      baseRadius > 6.5 ? 6 + Math.floor(Math.random() * 6) : 2 + Math.floor(Math.random() * 4);
    for (let s = 0; s < spineCount; s++) {
      // Forward downstream hemisphere bias matching impact vector
      const forwardBias = s < spineCount * 0.72;
      const spread = forwardBias
        ? (Math.random() - 0.5) * 1.45
        : (Math.random() - 0.5) * Math.PI * 1.85;
      const spineLen =
        baseRadius *
        (forwardBias ? 1.05 + Math.random() * (1.45 + elongation * 0.9) : 0.55 + Math.random() * 0.85);
      const spineBaseW = Math.max(0.55, baseRadius * (0.09 + Math.random() * 0.13));

      sCtx.save();
      sCtx.rotate(spread);
      sCtx.globalAlpha = alpha * (0.62 + Math.random() * 0.32);
      sCtx.fillStyle = Math.random() < 0.45 ? '#260203' : color;
      sCtx.beginPath();
      sCtx.moveTo(baseRadius * 0.42, -spineBaseW);
      sCtx.quadraticCurveTo(
        baseRadius * 0.48 + spineLen * 0.5,
        -spineBaseW * 0.28,
        baseRadius * 0.48 + spineLen,
        0
      );
      sCtx.quadraticCurveTo(
        baseRadius * 0.48 + spineLen * 0.5,
        spineBaseW * 0.28,
        baseRadius * 0.42,
        spineBaseW
      );
      sCtx.closePath();
      sCtx.fill();

      // Exclamation-mark satellite droplet separated by surface tension pinch-off
      if (Math.random() < 0.76) {
        const satDist =
          baseRadius * 0.68 + spineLen + 2.5 + Math.random() * (baseRadius * 1.9);
        const satR = Math.max(0.45, spineBaseW * (0.42 + Math.random() * 0.52));
        sCtx.beginPath();
        sCtx.ellipse(
          satDist,
          (Math.random() - 0.5) * 1.8,
          satR * (1.3 + elongation * 0.25),
          satR * 0.78,
          0,
          0,
          Math.PI * 2
        );
        sCtx.fill();
      }
      sCtx.restore();
    }

    // 5. Fine satellite micro-specks in a spray fan around the impact point
    if (baseRadius > 3.8) {
      const speckCount = Math.min(18, Math.floor(baseRadius * 1.45));
      for (let k = 0; k < speckCount; k++) {
        const a = (Math.random() - 0.5) * 2.2;
        const d = baseRadius * (1.15 + Math.random() * 3.1);
        const r = 0.38 + Math.random() * 1.1;
        sCtx.globalAlpha = alpha * (0.38 + Math.random() * 0.45);
        sCtx.fillStyle = Math.random() < 0.5 ? '#240203' : color;
        sCtx.beginPath();
        sCtx.ellipse(Math.cos(a) * d, Math.sin(a) * d, r * 1.4, r * 0.85, a, 0, Math.PI * 2);
        sCtx.fill();
      }
    }

    // 6. Wet glossy spotlight highlight crescent (fresh blood surface sheen)
    if (baseRadius > 3.8) {
      sCtx.rotate(-impactAngle); // Align highlight toward overhead arena light
      sCtx.globalAlpha = Math.min(0.2, alpha * 0.24);
      sCtx.fillStyle = '#ffe4e6';
      sCtx.beginPath();
      sCtx.ellipse(
        -baseRadius * 0.22,
        -baseRadius * 0.24,
        baseRadius * 0.26,
        baseRadius * 0.09,
        -0.42,
        0,
        Math.PI * 2
      );
      sCtx.fill();
    }

    sCtx.restore();

    // 7. Spawn 1-2 stick-slip gravity runnels from the lowest edge of pooling stains
    if (allowDrip && baseRadius >= 5.4 && activeDripsRef.current.length < 28 && Math.random() < 0.36) {
      const runnels = baseRadius >= 8.2 && Math.random() < 0.45 ? 2 : 1;
      for (let rIdx = 0; rIdx < runnels; rIdx++) {
        const spreadOffset = runnels === 2 ? (rIdx === 0 ? -0.35 : 0.35) : (Math.random() - 0.5) * 0.55;
        const dripX = x + cosA * baseRadius * 0.22 + spreadOffset * baseRadius;
        const dripY = y + Math.abs(sinA) * baseRadius * 0.32 + baseRadius * 0.52;
        const initW = Math.max(0.95, Math.min(2.7, baseRadius * (0.14 + Math.random() * 0.09)));
        activeDripsRef.current.push({
          x: dripX,
          y: dripY,
          width: initW,
          color: Math.random() < 0.45 ? '#3b0305' : color,
          alpha: Math.min(0.9, alpha * 0.96),
          length: 0,
          maxLength: 26 + Math.random() * (48 + baseRadius * 5.2),
          speed: 0.2 + Math.random() * 0.44,
          lingerTimer: 0.15 + Math.random() * 0.35, // Surface tension buildup before breaking loose
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleFreq: 0.07 + Math.random() * 0.1,
          wobbleAmp: 0.55 + Math.random() * 1.15,
          stickPhase: Math.random() * Math.PI * 2,
          points: [{ x: dripX, y: dripY, w: initW * 1.15 }],
          lastPointY: dripY,
        });
      }
    }
  };

  /**
   * Stamps fine aerosolized pinhead mist specks onto the wall for high-velocity impacts
   * (blades, chainsaws, shotguns, critical hits) — key to photographic realism.
   */
  const stampFineMistCloud = (
    cx: number,
    cy: number,
    spreadX: number,
    spreadY: number,
    speckCount: number,
    biasAngle: number
  ) => {
    const stainCanvas = stainCanvasRef.current;
    if (!stainCanvas) return;
    const sCtx = stainCanvas.getContext('2d');
    if (!sCtx) return;

    sCtx.save();
    for (let i = 0; i < speckCount; i++) {
      const a = Math.random() < 0.45 ? biasAngle + (Math.random() - 0.5) * 1.6 : Math.random() * Math.PI * 2;
      const distFactor = Math.pow(Math.random(), 0.72);
      const sx = cx + Math.cos(a) * spreadX * distFactor;
      const sy = cy + Math.sin(a) * spreadY * distFactor;
      const r = 0.35 + Math.random() * 1.05;
      sCtx.globalAlpha = 0.28 + Math.random() * 0.48;
      sCtx.fillStyle = Math.random() < 0.5 ? '#2b0304' : '#5e070a';
      sCtx.beginPath();
      sCtx.ellipse(sx, sy, r * 1.35, r * 0.85, a, 0, Math.PI * 2);
      sCtx.fill();
    }
    sCtx.restore();
  };

  /**
   * Permanently bakes a finished drip trail onto the offscreen wall stain canvas.
   */
  const stampFinishedDrip = (drip: ActiveDrip) => {
    const stainCanvas = stainCanvasRef.current;
    if (!stainCanvas || drip.points.length < 2) return;
    const sCtx = stainCanvas.getContext('2d');
    if (!sCtx) return;

    drawDripPath(sCtx, drip);
  };

  useImperativeHandle(ref, () => ({
    spawnHit(clientX: number, clientY: number, options: BloodSpawnOptions) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const rageMult = options.isRage ? 1.45 : 1;
      const count = options.isBleedTick
        ? Math.min(7, Math.ceil(options.intensity * 1.4))
        : Math.round((11 + options.intensity * 5.2) * (options.isCrit ? 1.65 : 1) * rageMult);

      const { width, height } = sizeRef.current;
      const maxReach = Math.max(290, Math.min(width, height) * 0.64);
      const dirX = options.dirX || 0;
      const dirY = options.dirY || 0;
      const hasBias = Math.abs(dirX) > 0.05 || Math.abs(dirY) > 0.05;
      const mainImpactAngle = hasBias
        ? Math.atan2(dirY, dirX)
        : -Math.PI * 0.25 + (Math.random() - 0.5) * 1.8;

      // Soft radial aerosolized crimson blood mist puff on heavy impacts
      if (
        !options.isBleedTick &&
        (options.hasMist || options.isCrit || options.isRage || options.intensity >= 3.2)
      ) {
        const mistCount = options.isRage || options.isCrit ? 4 : 2;
        for (let m = 0; m < mistCount; m++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.4 + Math.random() * 4.0;
          particlesRef.current.push({
            x: x + (Math.random() - 0.5) * 28,
            y: y + (Math.random() - 0.5) * 28,
            originX: x,
            originY: y,
            vx: Math.cos(angle) * speed * 1.25 + dirX * 1.2,
            vy: Math.sin(angle) * speed + dirY * 0.8,
            radius: 15 + Math.random() * 20,
            color: '#6e090c',
            alpha: 0.24,
            gravity: -0.015,
            drag: 0.93,
            isMist: true,
            expandRate: 1.8 + Math.random() * 1.5,
            leaveStain: false,
            wallHitDist: 9999,
          });
        }

        // Fine photographic aerosol mist specks on the wall behind impact
        stampFineMistCloud(
          x + dirX * 45,
          y + dirY * 35,
          Math.min(340, width * 0.38),
          Math.min(260, height * 0.36),
          options.isCrit || options.isRage ? 18 : 9,
          mainImpactAngle
        );
      }

      for (let i = 0; i < count; i++) {
        // 30% follows the impact direction, 70% sprays wide across all sides (especially laterally)
        const inCone = !options.isBleedTick && i < count * 0.3;
        const baseAngle = options.isBleedTick
          ? Math.PI * 0.5 + (Math.random() - 0.5) * 0.95
          : inCone
            ? mainImpactAngle + (Math.random() - 0.5) * 1.35
            : Math.random() * Math.PI * 2;
        const speed = options.isBleedTick
          ? 1.8 + Math.random() * 3.8
          : (5.2 + Math.random() * (12.8 + options.intensity * 2.8)) * (options.isCrit ? 1.4 : 1);

        const isSpark = options.isArmored && Math.random() < 0.2;
        const isPlasmaParticle = options.isPlasma && Math.random() < 0.32;

        const palette =
          options.isArterial || (options.isCrit && Math.random() < 0.45)
            ? ARTERIAL_BLOOD_PALETTE
            : FLYING_BLOOD_PALETTE;
        let color = palette[Math.floor(Math.random() * palette.length)];
        if (isSpark) color = Math.random() < 0.5 ? '#fbbf24' : '#fef08a';
        if (isPlasmaParticle) color = Math.random() < 0.5 ? '#38bdf8' : '#bae6fd';

        const biasX = dirX * (1.2 + Math.random() * 2.2);
        const biasY = dirY * (0.9 + Math.random() * 1.6);
        const lateralBoost = options.isBleedTick ? 1 : 1.28;
        const rad = options.isBleedTick
          ? 1.8 + Math.random() * 2.4
          : 1.2 + Math.random() * (3.3 + options.intensity * 0.55);

        particlesRef.current.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: Math.cos(baseAngle) * speed * lateralBoost + biasX,
          vy: Math.sin(baseAngle) * speed + biasY - (options.isBleedTick ? 0 : 2.6),
          radius: rad,
          color,
          alpha: 0.96,
          gravity: isSpark ? 0.28 : 0.38,
          drag: 0.989,
          leaveStain:
            !isSpark && !isPlasmaParticle && !options.isBleedTick && Math.random() < 0.28,
          wallHitDist: 65 + Math.random() * maxReach,
          canBreakup: !isSpark && !isPlasmaParticle && !options.isBleedTick && rad > 3.2,
        });
      }

      // Bloody saliva & sweat micro-spray on mouth/jaw/heavy punches
      if (!options.isBleedTick && (options.hasSaliva || options.isCrit || options.isRage)) {
        const salivaCount = options.hasSaliva ? 7 + Math.floor(Math.random() * 5) : 4;
        for (let s = 0; s < salivaCount; s++) {
          const angle = mainImpactAngle + (Math.random() - 0.5) * 1.9;
          const speed = 4.2 + Math.random() * 9.5;
          const isFrothyBlood = Math.random() < 0.55;
          particlesRef.current.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 8,
            originX: x,
            originY: y,
            vx: Math.cos(angle) * speed * 1.25 + dirX * 1.8,
            vy: Math.sin(angle) * speed - 1.4,
            radius: 0.9 + Math.random() * 1.7,
            color: isFrothyBlood ? '#fda4af' : '#f1f5f9',
            alpha: isFrothyBlood ? 0.72 : 0.58,
            gravity: 0.28,
            drag: 0.976,
            isSaliva: true,
            leaveStain: false,
            wallHitDist: 9999,
          });
        }
      }

      // Multi-directional wall cast-off arcs flung wide to left, right, upper & lower wall areas
      if (!options.isBleedTick && (options.isCrit || options.isRage || options.intensity >= 2.2)) {
        const arcCount = options.isCrit || options.isRage ? 2 : 1;
        for (let a = 0; a < arcCount; a++) {
          const arcAngle =
            a === 0 && hasBias && Math.random() < 0.45
              ? mainImpactAngle + (Math.random() - 0.5) * 1.2
              : Math.random() * Math.PI * 2;
          const arcDistStart = 76 + Math.random() * (maxReach * 0.42);
          const dropletsInArc = 3 + Math.floor(Math.random() * 3);
          const curveRate = (Math.random() - 0.5) * 0.16;
          for (let d = 0; d < dropletsInArc; d++) {
            const dist = arcDistStart + d * (26 + Math.random() * 22);
            const curAngle = arcAngle + d * curveRate;
            const sx = x + Math.cos(curAngle) * dist * 1.22;
            const sy = y + Math.sin(curAngle) * dist;
            const r = Math.max(1.5, (4.8 - d * 0.45) * (options.isCrit ? 1.2 : 0.9));
            const stainColor =
              WALL_STAIN_PALETTE[Math.floor(Math.random() * WALL_STAIN_PALETTE.length)];
            stampWallSplatter(
              sx,
              sy,
              r,
              curAngle,
              6.0 + (options.isCrit ? 2.5 : 0),
              stainColor,
              0.42 + Math.random() * 0.24,
              d === 0
            );
          }
        }
      }

      // Flying jagged bone splinters
      const boneCount = options.boneShards ?? 0;
      for (let b = 0; b < boneCount; b++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5.5 + Math.random() * 8.5;
        particlesRef.current.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: Math.cos(angle) * speed + dirX * 2.2,
          vy: Math.sin(angle) * speed - 3.2,
          radius: 4.5 + Math.random() * 3.5,
          color: Math.random() < 0.5 ? '#f5f5f4' : '#d6d3d1',
          alpha: 1,
          gravity: 0.48,
          drag: 0.99,
          isBone: true,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.5,
          leaveStain: false,
          wallHitDist: 9999,
        });
      }

      // Shredded dark tissue chunks that leave heavy smeared wall stains
      const tissueCount = options.tissueChunks ?? 0;
      for (let f = 0; f < tissueCount; f++) {
        const angle = mainImpactAngle + (Math.random() - 0.5) * 1.8;
        const speed = 4.6 + Math.random() * 8.2;
        particlesRef.current.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: Math.cos(angle) * speed + dirX * 2.0,
          vy: Math.sin(angle) * speed - 2.4,
          radius: 4 + Math.random() * 4.5,
          color: TISSUE_PALETTE[Math.floor(Math.random() * TISSUE_PALETTE.length)],
          alpha: 0.98,
          gravity: 0.5,
          drag: 0.985,
          isTissue: true,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.36,
          leaveStain: true,
          wallHitDist: 75 + Math.random() * 140,
        });
      }

      const toothCount = options.knockedTeeth ?? 0;
      for (let t = 0; t < toothCount; t++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.7;
        const speed = 6 + Math.random() * 7;
        particlesRef.current.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          radius: 5,
          color: '#f4f4ed',
          alpha: 1,
          gravity: 0.46,
          drag: 0.992,
          isTooth: true,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.42,
          leaveStain: false,
          wallHitDist: 9999,
        });
      }

      // Wide wall back-splatter scattered across all sides around the arena
      if (!options.isBleedTick) {
        const coreCount = options.isCrit || options.isRage ? 2 : Math.random() < 0.55 ? 1 : 0;
        for (let s = 0; s < coreCount; s++) {
          const offsetAngle = Math.random() * Math.PI * 2;
          const offsetDist = 52 + Math.random() * Math.min(290, maxReach * 0.74);
          const sx = x + Math.cos(offsetAngle) * offsetDist * 1.28;
          const sy = y + Math.sin(offsetAngle) * offsetDist;
          const r = (3.2 + Math.random() * 6.0) * (options.isCrit ? 1.2 : 0.88);
          const stainColor =
            WALL_STAIN_PALETTE[Math.floor(Math.random() * WALL_STAIN_PALETTE.length)];
          stampWallSplatter(
            sx,
            sy,
            r,
            offsetAngle,
            5.2 + options.intensity * 0.55,
            stainColor,
            0.42 + Math.random() * 0.26,
            true
          );
        }
      }
    },

    spawnArterialSpurt(clientX: number, clientY: number) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Coherent pressurized arterial stream (leading heavy drops -> trailing fine droplets)
      const baseDir = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.85;
      for (let i = 0; i < 14; i++) {
        const t = i / 14;
        const angle = baseDir + (Math.random() - 0.5) * (0.18 + t * 0.24);
        const speed = (14.5 - t * 6.5) + Math.random() * 3.8;
        particlesRef.current.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: Math.cos(angle) * speed * 1.2,
          vy: Math.sin(angle) * speed,
          radius: Math.max(1.1, (3.6 - t * 2.1) + Math.random() * 0.8),
          color: i % 3 === 0 ? '#9c1216' : i % 2 === 0 ? '#850d11' : '#560609',
          alpha: 0.96,
          gravity: 0.38,
          drag: 0.989,
          leaveStain: Math.random() < 0.25,
          wallHitDist: 85 + Math.random() * 300,
          canBreakup: i < 4,
        });
      }
    },

    spawnBleedDrop(clientX: number, clientY: number, severity = 0.6) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      particlesRef.current.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.55,
        vy: 1.4 + Math.random() * 1.6,
        radius: 1.8 + severity * 1.4,
        color: Math.random() < 0.5 ? '#7f1d1d' : '#560609',
        alpha: 0.94,
        gravity: 0.36,
        drag: 0.992,
        leaveStain: false,
        wallHitDist: 9999,
      });
    },

    spawnTearDrop(clientX: number, clientY: number) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      particlesRef.current.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 1.2 + Math.random() * 1.2,
        radius: 3.0,
        color: Math.random() < 0.35 ? '#fca5a5' : '#bae6fd',
        alpha: 0.85,
        gravity: 0.16,
        drag: 0.99,
        isTear: true,
        leaveStain: false,
        wallHitDist: 9999,
      });
    },

    spawnKoBurst() {
      const { width, height } = sizeRef.current;
      const cx = width / 2;
      const cy = height / 2;

      for (let m = 0; m < 7; m++) {
        const angle = Math.random() * Math.PI * 2;
        particlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 40,
          y: cy + (Math.random() - 0.5) * 40,
          originX: cx,
          originY: cy,
          vx: Math.cos(angle) * (1.4 + Math.random() * 2.4),
          vy: Math.sin(angle) * (1.4 + Math.random() * 2.4),
          radius: 18 + Math.random() * 18,
          color: '#5c0709',
          alpha: 0.32,
          gravity: -0.02,
          drag: 0.94,
          isMist: true,
          expandRate: 2.1,
          leaveStain: false,
          wallHitDist: 9999,
        });
      }

      const koReach = Math.max(240, Math.min(width, height) * 0.56);
      stampFineMistCloud(cx, cy, koReach * 1.15, koReach * 0.9, 24, -Math.PI * 0.5);

      for (let i = 0; i < 75; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 6.0 + Math.random() * 20;
        const rad = 2.0 + Math.random() * 5.0;
        particlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 65,
          y: cy + (Math.random() - 0.5) * 65,
          originX: cx,
          originY: cy,
          vx: Math.cos(angle) * speed * 1.25,
          vy: Math.sin(angle) * speed - 3.5,
          radius: rad,
          color: FLYING_BLOOD_PALETTE[Math.floor(Math.random() * FLYING_BLOOD_PALETTE.length)],
          alpha: 1,
          gravity: 0.36,
          drag: 0.988,
          leaveStain: Math.random() < 0.26,
          wallHitDist: 75 + Math.random() * koReach,
          canBreakup: rad > 4.2,
        });
      }

      // Wide wall explosion splatter rays across all sides on KO
      for (let r = 0; r < 10; r++) {
        const rayAngle = (r / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
        const dist = 70 + Math.random() * koReach;
        stampWallSplatter(
          cx + Math.cos(rayAngle) * dist * 1.25,
          cy + Math.sin(rayAngle) * dist,
          4.8 + Math.random() * 7.5,
          rayAngle,
          9.0,
          WALL_STAIN_PALETTE[Math.floor(Math.random() * WALL_STAIN_PALETTE.length)],
          0.56 + Math.random() * 0.24,
          true
        );
      }

      for (let b = 0; b < 6; b++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 6 + Math.random() * 9;
        particlesRef.current.push({
          x: cx,
          y: cy,
          originX: cx,
          originY: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          radius: 5 + Math.random() * 3,
          color: '#e7e5e4',
          alpha: 1,
          gravity: 0.46,
          drag: 0.99,
          isBone: true,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.45,
          leaveStain: false,
          wallHitDist: 9999,
        });
      }
    },

    spawnExecutionBurst() {
      const { width, height } = sizeRef.current;
      const cx = width / 2;
      const cy = height / 2;

      for (let m = 0; m < 8; m++) {
        const angle = Math.random() * Math.PI * 2;
        particlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 50,
          y: cy + (Math.random() - 0.5) * 50,
          originX: cx,
          originY: cy,
          vx: Math.cos(angle) * (1.5 + Math.random() * 2.5),
          vy: Math.sin(angle) * (1.5 + Math.random() * 2.5),
          radius: 22 + Math.random() * 20,
          color: '#6e090c',
          alpha: 0.32,
          gravity: -0.02,
          drag: 0.94,
          isMist: true,
          expandRate: 2.5,
          leaveStain: false,
          wallHitDist: 9999,
        });
      }

      const execReach = Math.max(280, Math.min(width, height) * 0.62);
      stampFineMistCloud(cx, cy, execReach * 1.2, execReach * 0.95, 38, -Math.PI * 0.5);

      for (let i = 0; i < 105; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 7.5 + Math.random() * 22;
        const rad = 2.2 + Math.random() * 5.6;
        particlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 55,
          y: cy + (Math.random() - 0.5) * 55,
          originX: cx,
          originY: cy,
          vx: Math.cos(angle) * speed * 1.28,
          vy: Math.sin(angle) * speed - 4,
          radius: rad,
          color: FLYING_BLOOD_PALETTE[Math.floor(Math.random() * FLYING_BLOOD_PALETTE.length)],
          alpha: 1,
          gravity: 0.35,
          drag: 0.988,
          leaveStain: Math.random() < 0.32,
          wallHitDist: 75 + Math.random() * execReach,
          canBreakup: rad > 4.2,
        });
      }

      for (let r = 0; r < 14; r++) {
        const rayAngle = (r / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.28;
        const dist = 60 + Math.random() * execReach;
        stampWallSplatter(
          cx + Math.cos(rayAngle) * dist * 1.25,
          cy + Math.sin(rayAngle) * dist,
          5.5 + Math.random() * 9.0,
          rayAngle,
          10,
          WALL_STAIN_PALETTE[Math.floor(Math.random() * WALL_STAIN_PALETTE.length)],
          0.62 + Math.random() * 0.24,
          true
        );
      }

      for (let f = 0; f < 10; f++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 12;
        particlesRef.current.push({
          x: cx,
          y: cy,
          originX: cx,
          originY: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3.5,
          radius: 5 + Math.random() * 5,
          color: TISSUE_PALETTE[Math.floor(Math.random() * TISSUE_PALETTE.length)],
          alpha: 1,
          gravity: 0.48,
          drag: 0.985,
          isTissue: true,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.4,
          leaveStain: true,
          wallHitDist: 75 + Math.random() * 160,
        });
      }

      for (let b = 0; b < 9; b++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 7 + Math.random() * 11;
        particlesRef.current.push({
          x: cx,
          y: cy,
          originX: cx,
          originY: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          radius: 5 + Math.random() * 4,
          color: '#f5f5f4',
          alpha: 1,
          gravity: 0.46,
          drag: 0.99,
          isBone: true,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.55,
          leaveStain: false,
          wallHitDist: 9999,
        });
      }
    },

    clearStains() {
      activeDripsRef.current = [];
      stainCountRef.current = 0;
      const stainCanvas = stainCanvasRef.current;
      if (stainCanvas) {
        const sCtx = stainCanvas.getContext('2d');
        if (sCtx) {
          sCtx.save();
          sCtx.setTransform(1, 0, 0, 1, 0, 0);
          sCtx.clearRect(0, 0, stainCanvas.width, stainCanvas.height);
          sCtx.restore();
        }
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!stainCanvasRef.current) {
      stainCanvasRef.current = document.createElement('canvas');
    }
    const stainCanvas = stainCanvasRef.current;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w <= 0 || h <= 0) return;
      sizeRef.current = { width: w, height: h, dpr };

      let snapshot: HTMLCanvasElement | null = null;
      if (stainCanvas.width > 0 && stainCanvas.height > 0 && stainCountRef.current > 0) {
        snapshot = document.createElement('canvas');
        snapshot.width = stainCanvas.width;
        snapshot.height = stainCanvas.height;
        const snapCtx = snapshot.getContext('2d');
        if (snapCtx) snapCtx.drawImage(stainCanvas, 0, 0);
      }

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      stainCanvas.width = w * dpr;
      stainCanvas.height = h * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const sCtx = stainCanvas.getContext('2d');
      if (sCtx) {
        sCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (snapshot) {
          sCtx.drawImage(snapshot, 0, 0, w, h);
        }
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    let animId = 0;

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const { width, height } = sizeRef.current;
        ctx.clearRect(0, 0, width, height);

        // 1. Blit cached organic wall stains cleanly in one draw call
        if (stainCanvas.width > 0 && stainCanvas.height > 0) {
          ctx.drawImage(stainCanvas, 0, 0, width, height);
        }

        // 2. Update & render active stick-slip viscous wall drips
        const drips = activeDripsRef.current;
        for (let i = drips.length - 1; i >= 0; i--) {
          const d = drips[i];

          // Initial surface-tension dwell before breaking free downward
          if (d.lingerTimer > 0) {
            d.lingerTimer -= 0.016;
            drawDripPath(ctx, d);
            continue;
          }

          const progress = d.length / Math.max(1, d.maxLength);
          // Stick-slip viscosity pulsing & gradual deceleration as volume depletes
          const stickPulse = 0.6 + 0.4 * Math.sin(d.length * 0.24 + d.stickPhase);
          const curSpeed = d.speed * stickPulse * Math.max(0.16, 1 - progress * 0.78);
          d.length += curSpeed;

          const curY = d.y + d.length;
          if (curY - d.lastPointY >= 3.2 || d.length >= d.maxLength) {
            const wobble =
              Math.sin(d.length * d.wobbleFreq + d.wobblePhase) * d.wobbleAmp +
              (Math.random() - 0.5) * 0.45;
            const prevPt = d.points[d.points.length - 1];
            const nx = prevPt.x + wobble * 0.35;
            // Subtle varicose bead variation where flow slows down
            const segW = Math.max(0.55, d.width * (1.0 - progress * 0.45) * (0.85 + (1 - stickPulse) * 0.3));
            d.points.push({ x: nx, y: curY, w: segW });
            d.lastPointY = curY;
          }

          drawDripPath(ctx, d);

          if (d.length >= d.maxLength || curY > height + 20) {
            stampFinishedDrip(d);
            drips.splice(i, 1);
          }
        }

        // 3. Update & render flying blood ligaments, breakup droplets, mist, tissue, and bone
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.vx *= p.drag;
          p.vy = p.vy * p.drag + p.gravity;
          p.x += p.vx;
          p.y += p.vy;

          if (p.isMist) {
            p.radius += p.expandRate || 1.5;
            p.alpha -= 0.014;
          } else {
            p.alpha -= p.isTooth || p.isBone ? 0.011 : p.isTear ? 0.022 : 0.0115;
          }

          if (p.rotation !== undefined && p.vRot !== undefined) {
            p.rotation += p.vRot;
          }

          // Plateau-Rayleigh mid-air shear breakup: large high-speed drops shed fine satellites
          if (p.canBreakup && !p.isSatellite && particles.length < 360 && Math.random() < 0.14) {
            p.canBreakup = false;
            p.radius *= 0.85;
            particles.push({
              x: p.x - p.vx * 0.5,
              y: p.y - p.vy * 0.5,
              originX: p.originX,
              originY: p.originY,
              vx: p.vx * (0.72 + Math.random() * 0.18) + (Math.random() - 0.5) * 1.8,
              vy: p.vy * (0.72 + Math.random() * 0.18) + (Math.random() - 0.5) * 1.8,
              radius: Math.max(0.9, p.radius * 0.45),
              color: p.color,
              alpha: p.alpha * 0.9,
              gravity: p.gravity,
              drag: 0.986,
              isSatellite: true,
              leaveStain: Math.random() < 0.45,
              wallHitDist: p.wallHitDist * (0.75 + Math.random() * 0.4),
            });
          }

          // Wall impact spattering at exact impact velocity & angle
          if (p.leaveStain && !p.hasSplattered) {
            const dx = p.x - p.originX;
            const dy = p.y - p.originY;
            const distSq = dx * dx + dy * dy;
            if (distSq >= p.wallHitDist * p.wallHitDist) {
              p.hasSplattered = true;
              const speed = Math.hypot(p.vx, p.vy);
              const impactAngle = Math.atan2(p.vy, p.vx);
              const stainR = p.radius * (p.isTissue ? 1.85 : 1.5);
              const wallColor =
                WALL_STAIN_PALETTE[Math.floor(Math.random() * WALL_STAIN_PALETTE.length)];
              stampWallSplatter(
                p.x,
                p.y,
                stainR,
                impactAngle,
                speed,
                p.isTissue ? p.color : wallColor,
                p.isTissue ? 0.65 : 0.45 + Math.random() * 0.3,
                stainR >= 4.2
              );
              if (!p.isTissue) {
                p.alpha *= 0.32;
              }
            }
          }

          if (p.alpha <= 0 || p.y > height + 40) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;

          if (p.isMist) {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            grad.addColorStop(0, 'rgba(127, 29, 29, 0.48)');
            grad.addColorStop(0.5, 'rgba(88, 12, 14, 0.22)');
            grad.addColorStop(1, 'rgba(69, 10, 10, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.isTooth) {
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation || 0);
            ctx.beginPath();
            ctx.roundRect(-3.8, -5.5, 7.6, 11, 2);
            ctx.fill();
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-3.2, 2.5, 6.4, 3);
          } else if (p.isBone) {
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation || 0);
            ctx.beginPath();
            ctx.moveTo(-p.radius, -1.8);
            ctx.lineTo(p.radius, 0);
            ctx.lineTo(-p.radius * 0.4, 2.8);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(-p.radius, -1.5, 2.6, 3.2);
          } else if (p.isTissue) {
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation || 0);
            ctx.beginPath();
            ctx.moveTo(-p.radius, -p.radius * 0.6);
            ctx.lineTo(p.radius * 0.8, -p.radius * 0.8);
            ctx.lineTo(p.radius, p.radius * 0.5);
            ctx.lineTo(-p.radius * 0.5, p.radius * 0.9);
            ctx.closePath();
            ctx.fill();
          } else if (p.isTear) {
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.radius * 0.7, p.radius * 1.4, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.isSaliva) {
            const speed = Math.hypot(p.vx, p.vy);
            const ang = Math.atan2(p.vy, p.vx);
            ctx.translate(p.x, p.y);
            ctx.rotate(ang);
            ctx.beginPath();
            ctx.ellipse(0, 0, p.radius * (1.2 + Math.min(2.6, speed * 0.2)), p.radius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            drawHydrodynamicDrop(ctx, p);
          }
          ctx.restore();
        }
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full z-10"
      aria-hidden="true"
    />
  );
});

/**
 * Draws a tapered hydrodynamic viscoelastic liquid droplet / ligament oriented along velocity:
 * volumetric 3D depth shading + blunt leading nose (+x) + pinched liquid tail (-x) + wet specular glint.
 */
function drawHydrodynamicDrop(ctx: CanvasRenderingContext2D, p: Particle) {
  const speed = Math.hypot(p.vx, p.vy);
  const angle = Math.atan2(p.vy, p.vx);
  const r = p.radius;
  const tailStretch = Math.min(5.2, 1.2 + speed * 0.24);

  ctx.translate(p.x, p.y);
  ctx.rotate(angle);

  if (speed > 2.2) {
    if (r > 1.85) {
      const grad = ctx.createLinearGradient(r * 1.1, 0, -r * tailStretch, 0);
      grad.addColorStop(0, '#2d0204');
      grad.addColorStop(0.45, p.color);
      grad.addColorStop(1, '#991b1b');
      ctx.fillStyle = grad;
    }

    // Tapered fluid teardrop ligament
    ctx.beginPath();
    ctx.moveTo(r * 1.12, 0);
    ctx.bezierCurveTo(r * 0.92, -r * 0.94, -r * 0.42, -r * 0.62, -r * tailStretch, 0);
    ctx.bezierCurveTo(-r * 0.42, r * 0.62, r * 0.92, r * 0.94, r * 1.12, 0);
    ctx.closePath();
    ctx.fill();

    // Subtle specular wet sheen on medium and large globules
    if (r > 1.9) {
      ctx.globalAlpha *= 0.34;
      ctx.fillStyle = '#ffe4e6';
      ctx.beginPath();
      ctx.ellipse(r * 0.28, -r * 0.26, r * 0.44, r * 0.15, -0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#991b1b');
    grad.addColorStop(0.65, p.color);
    grad.addColorStop(1, '#240203');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    if (r > 1.8) {
      ctx.globalAlpha *= 0.32;
      ctx.fillStyle = '#ffe4e6';
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.3, r * 0.26, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Generates a scalloped forensic bloodstain silhouette with surface-tension perimeter wavelets
 * (replaces smooth ovals with authentic irregular serrated blood splatter contours).
 */
function drawScallopedBloodBlob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  lobes: number,
  irregularity: number,
  scallopAmp: number
) {
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2;
    const wave = i % 2 === 0 ? 1 + scallopAmp : 1 - scallopAmp * 0.55;
    const scale = (1 - irregularity * 0.45 + Math.random() * irregularity) * wave;
    pts.push({
      x: cx + Math.cos(a) * rx * scale,
      y: cy + Math.sin(a) * ry * scale,
    });
  }

  ctx.beginPath();
  const firstMidX = (pts[pts.length - 1].x + pts[0].x) * 0.5;
  const firstMidY = (pts[pts.length - 1].y + pts[0].y) * 0.5;
  ctx.moveTo(firstMidX, firstMidY);

  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    const midX = (curr.x + next.x) * 0.5;
    const midY = (curr.y + next.y) * 0.5;
    ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
  }
  ctx.closePath();
}

function traceSmoothSpline(ctx: CanvasRenderingContext2D, pts: Array<{ x: number; y: number }>) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) * 0.5;
    const my = (pts[i].y + pts[i + 1].y) * 0.5;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x, last.y);
}

/**
 * Draws a continuous quadratic-spline stick-slip wall blood runnel:
 * dark oxidized outer edge soak + glossy inner crimson channel + wet sheen + swollen meniscus droplet tip.
 */
function drawDripPath(ctx: CanvasRenderingContext2D, d: ActiveDrip) {
  const pts = d.points;
  if (pts.length < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Dark oxidized outer track margin (continuous smooth curve)
  ctx.globalAlpha = d.alpha * 0.44;
  ctx.strokeStyle = '#1b0102';
  ctx.lineWidth = Math.max(1.1, d.width * 1.38);
  traceSmoothSpline(ctx, pts);
  ctx.stroke();

  // 2. Glossy wet inner blood stream
  ctx.globalAlpha = d.alpha * 0.92;
  ctx.strokeStyle = d.color;
  ctx.lineWidth = Math.max(0.75, d.width * 0.92);
  traceSmoothSpline(ctx, pts);
  ctx.stroke();

  // 3. Subtle specular liquid sheen along ridge
  if (d.width >= 1.1) {
    ctx.save();
    ctx.translate(-0.35, 0);
    ctx.globalAlpha = d.alpha * 0.16;
    ctx.strokeStyle = '#fecdd3';
    ctx.lineWidth = Math.max(0.32, d.width * 0.24);
    traceSmoothSpline(ctx, pts);
    ctx.stroke();
    ctx.restore();
  }

  // 4. Swollen teardrop meniscus bead pooling at the tip
  const tip = pts[pts.length - 1];
  const beadRx = Math.max(0.9, d.width * 0.72);
  const beadRy = beadRx * 1.55;

  const beadGrad = ctx.createRadialGradient(
    tip.x - beadRx * 0.25,
    tip.y - beadRy * 0.2,
    0.2,
    tip.x,
    tip.y,
    beadRy
  );
  beadGrad.addColorStop(0, '#880d11');
  beadGrad.addColorStop(0.62, d.color);
  beadGrad.addColorStop(1, '#240203');

  ctx.globalAlpha = d.alpha;
  ctx.fillStyle = beadGrad;
  ctx.beginPath();
  ctx.ellipse(tip.x, tip.y, beadRx, beadRy, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crisp specular glint on wet tip bead
  ctx.globalAlpha = Math.min(0.34, d.alpha * 0.36);
  ctx.fillStyle = '#ffe4e6';
  ctx.beginPath();
  ctx.arc(
    tip.x - beadRx * 0.28,
    tip.y - beadRy * 0.28,
    Math.max(0.35, beadRx * 0.3),
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}
