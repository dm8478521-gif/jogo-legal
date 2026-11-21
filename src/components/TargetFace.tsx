import React, { useEffect, useRef, useState } from 'react';
import {
  BruiseMark,
  EnemyProfile,
  FacialBloodBurst,
  HitZone,
  TraumaState,
} from '../data/gameData';
import {
  BossBackHair,
  BossBackProps,
  BossCustomFacialHair,
  BossEarAccessories,
  BossFaceMarkings,
  BossSculptedHair,
  BossSvgDefs,
  BossTopAccessories,
  MiniBossChestOutfit,
  getEnemyAnatomyMetrics,
  getHeadOutlinePath,
} from './BossDetails';
import { soundFx } from '../utils/soundFx';

interface TargetFaceProps {
  enemy: EnemyProfile;
  hp: number;
  isKo: boolean;
  isStunned: boolean;
  isBlocking: boolean;
  isInShock: boolean;
  xrayFlash: boolean;
  cryIntensity: number; // 0 to 1 progressive realistic crying
  isRageActive: boolean;
  trauma: TraumaState;
  hitNonce: number;
  lastHitOffset: { dx: number; dy: number; power: number };
  lastHitZone?: HitZone | null;
  bruises: BruiseMark[];
  lastBloodBurst?: FacialBloodBurst | null;
  clearBloodNonce?: number;
  onChinBloodDrop?: (clientX: number, clientY: number, severity: number) => void;
  onPunch: (
    clientX: number,
    clientY: number,
    svgX: number,
    svgY: number,
    zone: HitZone,
    isSweetSpot: boolean
  ) => void;
}

function detectHitZone(
  svgX: number,
  svgY: number,
  species: EnemyProfile['species'] = 'human'
): { zone: HitZone; isSweetSpot: boolean } {
  const distLeftEar = Math.hypot(svgX - 64, svgY - 176);
  const distRightEar = Math.hypot(svgX - 256, svgY - 176);
  const distNose = Math.hypot(svgX - 160, svgY - (species === 'cyclops' ? 190 : 184));
  const distMouth = Math.hypot(svgX - 160, svgY - 242);
  const distChin = Math.hypot(svgX - 160, svgY - 284);

  if (distLeftEar < 34) return { zone: 'leftEar', isSweetSpot: false };
  if (distRightEar < 34) return { zone: 'rightEar', isSweetSpot: false };
  if (species === 'cyclops') {
    const distCyclopsEye = Math.hypot(svgX - 160, svgY - 140);
    if (distCyclopsEye < 34 && svgY < 168) {
      return { zone: 'leftEye', isSweetSpot: false };
    }
  } else {
    const distLeftEye = Math.hypot(svgX - 116, svgY - 148);
    const distRightEye = Math.hypot(svgX - 204, svgY - 148);
    if (distLeftEye < 30) return { zone: 'leftEye', isSweetSpot: false };
    if (distRightEye < 30) return { zone: 'rightEye', isSweetSpot: false };
  }
  if (distNose < 26) return { zone: 'nose', isSweetSpot: true };
  if (distChin < 30) return { zone: 'jaw', isSweetSpot: true };
  if (distMouth < 36) return { zone: 'mouth', isSweetSpot: false };
  if (svgY > 250) return { zone: 'jaw', isSweetSpot: false };
  return { zone: 'forehead', isSweetSpot: false };
}

interface TearTrackConfig {
  id: string;
  d: string;
  minIntensity: number;
  speed: number; // progress per second (0..1)
  initialPhase: number;
}

const TEAR_TRACKS: TearTrackConfig[] = [
  {
    id: 'left-inner',
    // Wells from inner left tear duct, rolls slowly down beside nose & nasolabial cheek to chin
    d: 'M129,153 Q125,180 120,206 Q116,236 126,268 Q134,290 144,308',
    minIntensity: 0.28,
    speed: 0.145,
    initialPhase: 0.05,
  },
  {
    id: 'right-inner',
    // Wells from inner right tear duct, creeps down cheek contour
    d: 'M191,153 Q195,180 200,206 Q204,236 194,268 Q186,290 176,308',
    minIntensity: 0.34,
    speed: 0.13,
    initialPhase: 0.52,
  },
  {
    id: 'left-outer',
    // Spills over outer left lower eyelid, hugs cheekbone contour toward jawline
    d: 'M105,155 Q98,184 99,214 Q102,246 116,276',
    minIntensity: 0.62,
    speed: 0.16,
    initialPhase: 0.28,
  },
  {
    id: 'right-outer',
    // Spills over outer right lower eyelid, hugs cheekbone contour toward jawline
    d: 'M215,155 Q222,184 221,214 Q218,246 204,276',
    minIntensity: 0.68,
    speed: 0.15,
    initialPhase: 0.74,
  },
];

interface SweatTrackConfig {
  id: string;
  d: string;
  minIntensity: number;
  speed: number; // slow progress per second (0..1)
  size: number;
  initialPhase: number;
}

const SWEAT_TRACKS: SweatTrackConfig[] = [
  {
    id: 'sweat-temple-right',
    d: 'M230,98 Q237,132 234,172 Q229,214 214,256',
    minIntensity: 0.14,
    speed: 0.048,
    size: 0.92,
    initialPhase: 0.12,
  },
  {
    id: 'sweat-temple-left',
    d: 'M90,102 Q83,136 86,176 Q91,218 106,258',
    minIntensity: 0.22,
    speed: 0.044,
    size: 0.88,
    initialPhase: 0.56,
  },
  {
    id: 'sweat-forehead-left',
    d: 'M128,84 Q124,104 114,119 Q98,136 93,168 Q92,202 104,234',
    minIntensity: 0.30,
    speed: 0.052,
    size: 0.84,
    initialPhase: 0.34,
  },
  {
    id: 'sweat-forehead-right',
    d: 'M192,86 Q197,106 207,121 Q221,138 225,170 Q224,204 212,236',
    minIntensity: 0.38,
    speed: 0.050,
    size: 0.86,
    initialPhase: 0.78,
  },
  {
    id: 'sweat-glabella',
    d: 'M162,82 Q159,106 156,128 Q151,150 148,176',
    minIntensity: 0.46,
    speed: 0.042,
    size: 0.76,
    initialPhase: 0.22,
  },
  {
    id: 'sweat-cheek-left',
    d: 'M85,158 Q84,192 92,226 Q104,256 122,282',
    minIntensity: 0.54,
    speed: 0.058,
    size: 0.94,
    initialPhase: 0.65,
  },
  {
    id: 'sweat-cheek-right',
    d: 'M235,160 Q235,194 226,228 Q214,258 196,284',
    minIntensity: 0.62,
    speed: 0.056,
    size: 0.96,
    initialPhase: 0.41,
  },
];

const MAX_BLOOD_RIVULETS = 30;
const MAX_FLYING_TEETH = 6;
const FLYING_TOOTH_DROPLETS = 5;

const BROKEN_TOOTH_ORIGINS: Record<number, { x: number; y: number; isTusk: boolean }> = {
  5: { x: 164.8, y: 240, isTusk: false },
  4: { x: 146.2, y: 239, isTusk: false },
  3: { x: 155.1, y: 240, isTusk: true },
  2: { x: 181.9, y: 238, isTusk: false },
  1: { x: 173.7, y: 239, isTusk: true },
  0: { x: 138.1, y: 238, isTusk: false },
};

interface FlyingTooth {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  spinPhase: number;
  spinSpeed: number;
  age: number;
  duration: number;
  isTusk: boolean;
  droplets: Array<{ x: number; y: number; vx: number; vy: number; r: number }>;
}

function createEmptyFlyingTooth(): FlyingTooth {
  return {
    active: false,
    x: 160,
    y: 240,
    vx: 0,
    vy: 0,
    rot: 0,
    vRot: 0,
    spinPhase: 0,
    spinSpeed: 10,
    age: 0,
    duration: 1.1,
    isTusk: false,
    droplets: Array.from({ length: FLYING_TOOTH_DROPLETS }, () => ({
      x: 160,
      y: 240,
      vx: 0,
      vy: 0,
      r: 1.8,
    })),
  };
}

interface BloodRivulet {
  active: boolean;
  flowing: boolean;
  x: number;
  y: number;
  lastSampleX: number;
  lastSampleY: number;
  vx: number;
  vy: number;
  age: number;
  lingerTime: number;
  traveled: number;
  maxLength: number;
  severity: number;
  width: number;
  seed: number;
  stainColor: string;
  coreColor: string;
  stainOpacity: number;
  coreOpacity: number;
  beadFade: number;
  points: Array<{ x: number; y: number }>;
}

function createEmptyRivulet(): BloodRivulet {
  return {
    active: false,
    flowing: false,
    x: 0,
    y: 0,
    lastSampleX: 0,
    lastSampleY: 0,
    vx: 0,
    vy: 0,
    age: 0,
    lingerTime: 0.1,
    traveled: 0,
    maxLength: 50,
    severity: 0.3,
    width: 1.6,
    seed: 0,
    stainColor: '#450a0a',
    coreColor: '#991b1b',
    stainOpacity: 0.35,
    coreOpacity: 0.85,
    beadFade: 0,
    points: [],
  };
}

function buildSmoothSvgPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)} L${pts[0].x.toFixed(1)},${(pts[0].y + 0.5).toFixed(1)}`;
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = ((pts[i].x + pts[i + 1].x) * 0.5).toFixed(1);
    const my = ((pts[i].y + pts[i + 1].y) * 0.5).toFixed(1);
    d += ` Q${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)} ${mx},${my}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  return d;
}

function shadeHex(hex: string, factor: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const r = Math.max(0, Math.min(255, Math.round(parseInt(clean.slice(0, 2), 16) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(parseInt(clean.slice(2, 4), 16) * factor)));
  const b = Math.max(0, Math.min(255, Math.round(parseInt(clean.slice(4, 6), 16) * factor)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

interface HairStrandSpec {
  rx: number;
  ry: number;
  dx: number;
  dy: number;
  curve: number;
  halfWidth: number;
  shade: 'shadow' | 'mid' | 'highlight';
  opacity: number;
  stiffness: number;
  damping: number;
  gravityScale: number;
  phase: number;
}

function buildTaperedHairPath(
  rx: number,
  ry: number,
  cx: number,
  cy: number,
  tx: number,
  ty: number,
  hw: number
): string {
  const vx = tx - rx;
  const vy = ty - ry;
  const len = Math.hypot(vx, vy) || 1;
  const nx = -vy / len;
  const ny = vx / len;

  const rlx = (rx + nx * hw).toFixed(1);
  const rly = (ry + ny * hw).toFixed(1);
  const rrx = (rx - nx * hw).toFixed(1);
  const rry = (ry - ny * hw).toFixed(1);

  const mlx = (cx + nx * hw * 0.46).toFixed(1);
  const mly = (cy + ny * hw * 0.46).toFixed(1);
  const mrx = (cx - nx * hw * 0.46).toFixed(1);
  const mry = (cy - ny * hw * 0.46).toFixed(1);

  return `M${rlx},${rly} Q${mlx},${mly} ${tx.toFixed(1)},${ty.toFixed(1)} Q${mrx},${mry} ${rrx},${rry} Z`;
}

function makeHairStrandsForStyle(style: EnemyProfile['hairStyle']): HairStrandSpec[] {
  const s = (
    rx: number,
    ry: number,
    dx: number,
    dy: number,
    curve: number,
    halfWidth: number,
    shade: HairStrandSpec['shade'],
    opacity: number,
    stiffness: number,
    damping: number,
    gravityScale: number,
    phase: number
  ): HairStrandSpec => ({
    rx,
    ry,
    dx,
    dy,
    curve,
    halfWidth,
    shade,
    opacity,
    stiffness,
    damping,
    gravityScale,
    phase,
  });

  // Deterministic pseudo-random helper for organic per-strand variation
  const det = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  if (style === 'short') {
    const strands: HairStrandSpec[] = [];
    // Neat textured side-part haircut: gentle part near x=112, sweeping cleanly right across crown & forehead

    // 1. Soft depth shadows tucked cleanly along the hairline & temples (14)
    for (let i = 0; i < 14; i++) {
      const t = i / 13;
      const rx = 82 + t * 156;
      const arch = Math.sin(t * Math.PI);
      const ry = 76 - arch * 22;
      const sweepX = t < 0.24 ? -7 : 9 + (t - 0.24) * 8;
      const dy = 16 + arch * 4;
      strands.push(
        s(rx, ry, sweepX, dy, t < 0.24 ? -2 : 2.5, 2.2, 'shadow', 0.34, 175, 11.8, 0.85, i * 0.41)
      );
    }

    // 2. Crown & upper-dome strands flowing TANGENTIALLY along the skull curve (30)
    // Stays sleek (~2-4px loft above scalp) instead of sticking straight out
    for (let i = 0; i < 30; i++) {
      const t = i / 29;
      const rx = 78 + t * 164;
      // Smooth cranial dome y matching #head-clip top arc
      const normX = (rx - 160) / 86;
      const ry = 35 + normX * normX * 48 - 1.5;
      const slopeDy = normX * 22; // follows dome curvature smoothly
      const isLeftSide = t < 0.24;
      const dx = isLeftSide ? -13 - (0.24 - t) * 12 : 16 + (1 - Math.abs(t - 0.55)) * 6;
      const dy = isLeftSide ? 11 + det(i + 50) * 3 : slopeDy * 0.65 + (det(i + 70) - 0.3) * 2.5;
      strands.push(
        s(
          rx,
          ry,
          dx,
          dy,
          isLeftSide ? -2.2 : 2.6,
          1.2 + det(i + 110) * 0.75,
          'mid',
          0.9 + det(i + 140) * 0.08,
          185 + det(i + 170) * 25,
          11.8,
          0.65,
          i * 0.36
        )
      );
    }

    // 3. Neat temples & sideburns hugging closely along the sides of the head (20)
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const ly = 86 + t * 44;
      const lx = 73 - Math.sin(t * Math.PI) * 3.5;
      const rx = 247 + Math.sin(t * Math.PI) * 3.5;
      const len = 15 + (1 - t * 0.4) * 8;
      // Hug inward along jawline/sideburn contour
      strands.push(
        s(lx, ly, 1.5, len, -1.2, 1.05 + det(i + 210) * 0.6, 'mid', 0.86, 190, 12.2, 0.75, i * 0.52)
      );
      strands.push(
        s(rx, ly, -1.5, len, 1.2, 1.05 + det(i + 230) * 0.6, 'mid', 0.86, 190, 12.2, 0.75, i * 0.52 + 1.9)
      );
    }

    // 4. Tidy layered forehead bangs — two cohesive side-swept rows (38)
    for (let i = 0; i < 38; i++) {
      const t = i / 37;
      const row = i % 2;
      const rx = 79 + t * 162;
      const arch = Math.sin(t * Math.PI);
      const ry = (row === 0 ? 73 : 78) - arch * (row === 0 ? 25 : 21);
      const isLeftSide = t < 0.24;
      const dx = isLeftSide
        ? -7 - (0.24 - t) * 8
        : 9 + (t - 0.24) * 10 + (det(i + 310) - 0.5) * 1.6;
      const dy = (row === 0 ? 19 : 16) + arch * 4.5 + (det(i + 350) - 0.5) * 2.5;
      strands.push(
        s(
          rx,
          ry,
          dx,
          dy,
          isLeftSide ? -2.2 : 2.6,
          1.05 + det(i + 390) * 0.75,
          'mid',
          0.9 + det(i + 430) * 0.08,
          152 + det(i + 470) * 24,
          10.6 + det(i + 510) * 1.2,
          0.95 + det(i + 550) * 0.15,
          i * 0.38
        )
      );
    }

    // 5. Fine groomed texture hairs following the exact same side-sweep (18)
    for (let i = 0; i < 18; i++) {
      const t = i / 17;
      const rx = 86 + t * 148;
      const arch = Math.sin(t * Math.PI);
      const ry = 63 - arch * 18;
      const isLeftSide = t < 0.24;
      const dx = isLeftSide ? -8 : 11 + (t - 0.24) * 9;
      const dy = 18 + arch * 4 + det(i + 610) * 4;
      strands.push(
        s(
          rx,
          ry,
          dx,
          dy,
          isLeftSide ? -2.0 : 2.4,
          0.45 + det(i + 650) * 0.26,
          'mid',
          0.78,
          135,
          9.6,
          1.1,
          i * 0.57
        )
      );
    }

    // 6. Smooth glossy crown & bang highlight filaments (8)
    for (let i = 0; i < 8; i++) {
      const t = (i + 0.5) / 8;
      const rx = 114 + t * 94;
      const normX = (rx - 160) / 86;
      const ry = 41 + normX * normX * 20;
      strands.push(
        s(rx, ry, 14, 11 + normX * 8, 2.2, 0.55, 'highlight', 0.16, 165, 11.0, 0.8, i * 0.75)
      );
    }

    return strands;
  }

  if (style === 'wild') {
    const strands: HairStrandSpec[] = [];

    // 1. Deep shadow under-locks (14)
    for (let i = 0; i < 14; i++) {
      const t = i / 13;
      const rx = 76 + t * 168;
      const arch = Math.sin(t * Math.PI);
      const ry = 76 - arch * 22;
      strands.push(
        s(rx, ry, (t - 0.5) * 28, 30 + det(i + 10) * 8, (t - 0.5) * 7, 2.7, 'shadow', 0.4, 112, 8.6, 1.2, i * 0.51)
      );
    }

    // 2. Flowing feral mane locks sweeping outward & downward along the skull (28)
    for (let i = 0; i < 28; i++) {
      const t = i / 27;
      const rx = 76 + t * 168;
      const normX = (rx - 160) / 88;
      const ry = 32 + normX * normX * 52;
      const sideDir = t < 0.5 ? -1 : 1;
      const dx = sideDir * (14 + Math.abs(normX) * 10);
      const dy = 12 + Math.abs(normX) * 22 + (det(i + 110) - 0.5) * 6;
      strands.push(
        s(rx, ry, dx, dy, sideDir * 5.5, 1.45 + det(i + 150) * 1.15, 'mid', 0.9, 118, 8.6, 1.05, i * 0.39)
      );
    }

    // 3. Long shaggy cheek & ear framing locks curving naturally downward (22)
    for (let i = 0; i < 11; i++) {
      const t = i / 10;
      const y = 84 + t * 56;
      const lx = 69 - Math.sin(t * Math.PI) * 5;
      const rx = 251 + Math.sin(t * Math.PI) * 5;
      const len = 32 + det(i + 240) * 14;
      strands.push(
        s(lx, y, -7 - det(i + 260) * 4, len, -4.2, 1.5 + det(i + 280) * 1.1, 'mid', 0.88, 102 + t * 12, 8.0, 1.3, i * 0.61)
      );
      strands.push(
        s(rx, y, 7 + det(i + 300) * 4, len, 4.2, 1.5 + det(i + 320) * 1.1, 'mid', 0.88, 102 + t * 12, 8.0, 1.3, i * 0.61 + 1.7)
      );
    }

    // 4. Layered unruly bangs sweeping left/right toward the brow ridge (34)
    for (let i = 0; i < 34; i++) {
      const t = i / 33;
      const row = i % 2;
      const rx = 76 + t * 168;
      const arch = Math.sin(t * Math.PI);
      const ry = (row === 0 ? 71 : 77) - arch * 22;
      const sideDir = t < 0.45 ? -1 : 1;
      const dx = sideDir * (7 + Math.abs(t - 0.45) * 16);
      const dy = 29 + arch * 8 + det(i + 410) * 6;
      strands.push(
        s(rx, ry, dx, dy, sideDir * 4.2, 1.35 + det(i + 450) * 1.1, 'mid', 0.91, 100 + det(i + 490) * 18, 8.0, 1.25, i * 0.42)
      );
    }

    // 5. Fine individual mane wisps following the sweep (16)
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const rx = 80 + t * 160;
      const arch = Math.sin(t * Math.PI);
      const ry = 54 - arch * 17;
      const sideDir = t < 0.45 ? -1 : 1;
      strands.push(
        s(rx, ry, sideDir * 13, 33 + det(i + 560) * 8, sideDir * 4.5, 0.5 + det(i + 590) * 0.3, 'mid', 0.8, 90, 7.3, 1.4, i * 0.71)
      );
    }

    // 6. Highlight sheen filaments (6)
    for (let i = 0; i < 6; i++) {
      const t = (i + 0.5) / 6;
      const sideDir = t < 0.45 ? -1 : 1;
      strands.push(
        s(106 + t * 108, 42 - Math.sin(t * Math.PI) * 8, sideDir * 11, 24, sideDir * 3.5, 0.7, 'highlight', 0.15, 112, 8.4, 1.05, i * 0.9)
      );
    }

    return strands;
  }

  if (style === 'mohawk') {
    const strands: HairStrandSpec[] = [];

    // 1. Dark central base shadow blades (10)
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const rx = 146 + t * 28;
      const ry = 56 - Math.sin(t * Math.PI) * 16;
      strands.push(s(rx, ry, (t - 0.5) * 6, -26 - Math.sin(t * Math.PI) * 8, (t - 0.5) * 3, 2.7, 'shadow', 0.42, 165, 10.6, 0.75, i * 0.5));
    }

    // 2. Sleek cohesive upward-tapering mohawk blades (28)
    for (let i = 0; i < 28; i++) {
      const t = i / 27;
      const rx = 143 + t * 34;
      const arch = Math.sin(t * Math.PI);
      const ry = 65 - arch * 29;
      // Converges slightly inward into a razor-sharp crest instead of splaying wide
      const dx = (0.5 - t) * 7 + (det(i + 60) - 0.5) * 2.5;
      const dy = -26 - arch * 13 - det(i + 90) * 4;
      strands.push(
        s(rx, ry, dx, dy, (0.5 - t) * 3.5, 1.3 + det(i + 120) * 1.15, 'mid', 0.92, 155 + det(i + 180) * 24, 9.8, 0.85, i * 0.41)
      );
    }

    // 3. Tidy widow-peak front wisps (14)
    for (let i = 0; i < 14; i++) {
      const t = i / 13;
      const rx = 145 + t * 30;
      const ry = 71 + Math.sin(t * Math.PI) * 3.5;
      strands.push(
        s(rx, ry, (t - 0.5) * 6, 16 + Math.sin(t * Math.PI) * 5, (t - 0.5) * 2.5, 1.0 + det(i + 270) * 0.7, 'mid', 0.88, 145, 9.5, 1.05, i * 0.62)
      );
    }

    // 4. Fine crest filaments + highlights (16)
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      strands.push(
        s(146 + t * 28, 43 - Math.sin(t * Math.PI) * 9, (0.5 - t) * 5, -34 - det(i + 310) * 6, (0.5 - t) * 2, 0.55, 'mid', 0.8, 138, 9.0, 1.0, i * 0.75)
      );
    }
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4;
      strands.push(s(151 + t * 18, 38 - Math.sin(t * Math.PI) * 5, (0.5 - t) * 3, -35, 1.5, 0.65, 'highlight', 0.2, 148, 9.4, 0.85, i * 1.1));
    }

    return strands;
  }

  if (style === 'buzz') {
    const strands: HairStrandSpec[] = [];
    // Tight clean military buzzcut: short crisp hairline & dome bristles hugging the skull (56)
    for (let i = 0; i < 32; i++) {
      const t = i / 31;
      const rx = 72 + t * 176;
      const arch = Math.sin(t * Math.PI);
      const ry = 108 - arch * 34;
      strands.push(
        s(rx, ry, (t - 0.5) * 2, 4.5 + det(i + 10) * 1.8, (t - 0.5) * 0.5, 0.85 + det(i + 40) * 0.35, 'mid', 0.76, 335, 16.5, 0.35, i * 0.38)
      );
    }
    for (let i = 0; i < 24; i++) {
      const t = i / 23;
      const rx = 86 + t * 148;
      const normX = (rx - 160) / 86;
      const ry = 35 + normX * normX * 42;
      strands.push(
        s(rx, ry, 3.2, normX * 2.2 - 1.2, 0.3, 0.9, 'mid', 0.78, 340, 16.5, 0.32, i * 0.49)
      );
    }
    return strands;
  }

  if (style === 'spiky') {
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 32; i++) {
      const t = i / 31;
      const rx = 82 + t * 156;
      const normX = (rx - 160) / 86;
      const ry = 36 + normX * normX * 44;
      const clusterAngle = Math.floor(t * 7) / 6;
      const dx = (clusterAngle - 0.5) * 26;
      const dy = -22 - Math.sin(t * Math.PI) * 8;
      strands.push(
        s(rx, ry, dx, dy, (0.5 - t) * 3.5, 1.3 + det(i + 60) * 1.0, 'mid', 0.93, 162, 10.0, 0.82, i * 0.35)
      );
    }
    for (let i = 0; i < 24; i++) {
      const t = i / 23;
      const rx = 86 + t * 148;
      const ry = 76 - Math.sin(t * Math.PI) * 16;
      strands.push(
        s(rx, ry, (t - 0.5) * 10, 18 + det(i + 120) * 5, (t - 0.5) * 2.5, 1.1 + det(i + 160) * 0.75, 'mid', 0.89, 148, 9.6, 1.0, i * 0.52)
      );
    }
    return strands;
  }

  if (style === 'helmet') {
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 24; i++) {
      const t = i / 23;
      const rx = 151 + t * 18;
      const ry = 40 + (i % 3) * 8;
      strands.push(
        s(rx, ry, (t - 0.5) * 3 + 2, -14 - det(i + 10) * 4, 1.5, 1.1 + det(i + 40) * 0.75, i % 6 === 0 ? 'highlight' : 'mid', i % 6 === 0 ? 0.2 : 0.92, 205, 11.6, 0.58, i * 0.47)
      );
    }
    return strands;
  }

  if (style === 'trevor_receding') {
    // Trevor Philips: sparse greasy center island wisps + unruly receding temple/side tufts
    const strands: HairStrandSpec[] = [];
    // Sparse messy thinning central crown tuft (x=132..188)
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const rx = 132 + t * 56;
      const ry = 38 + det(i + 15) * 14;
      strands.push(
        s(rx, ry, (det(i + 40) - 0.5) * 16, 16 + det(i + 70) * 14, (det(i + 90) - 0.5) * 7, 1.05 + det(i + 110) * 0.6, 'mid', 0.88, 148, 9.5, 1.0, i * 0.52)
      );
    }
    // Unruly greasy side tufts behind receding temples
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const y = 62 + t * 62;
      strands.push(s(76 - det(i + 130) * 5, y, -16 - det(i + 150) * 10, 12 + det(i + 170) * 14, -5, 1.35, 'mid', 0.9, 134, 9.0, 1.08, i * 0.48));
      strands.push(s(244 + det(i + 190) * 5, y, 16 + det(i + 210) * 10, 12 + det(i + 230) * 14, 5, 1.35, 'mid', 0.9, 134, 9.0, 1.08, i * 0.48 + 1.3));
    }
    for (let i = 0; i < 5; i++) {
      const rx = 140 + (i / 4) * 40;
      strands.push(s(rx, 42, (i - 2) * 4, 18, 2, 0.75, 'highlight', 0.28, 145, 9.4, 0.98, i * 0.7));
    }
    return strands;
  }

  if (style === 'john_wick') {
    // Long sleek center-parted Baba Yaga hair with damp temple strands
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 32; i++) {
      const t = i / 31;
      const rx = 74 + t * 172;
      const normX = (rx - 160) / 88;
      const ry = 30 + normX * normX * 44;
      const sideDir = rx < 160 ? -1 : 1;
      const edge = Math.abs(rx - 160) / 88;
      strands.push(
        s(rx, ry, sideDir * (10 + edge * 14), 22 + edge * 44, sideDir * 4.5, 1.3 + det(i + 40) * 0.8, 'mid', 0.9, 134, 9.2, 1.0, i * 0.38)
      );
    }
    // Loose damp forehead wisps
    for (let i = 0; i < 10; i++) {
      const rx = 128 + (i / 9) * 64;
      const sideDir = rx < 160 ? -1 : 1;
      strands.push(
        s(rx, 48, sideDir * 6, 36 + det(i + 200) * 12, sideDir * 3.5, 0.95, 'mid', 0.88, 118, 8.5, 1.15, i * 0.72)
      );
    }
    // Long neck-framing side locks
    for (let i = 0; i < 10; i++) {
      const y = 90 + (i / 9) * 70;
      strands.push(s(69, y, -4, 52 + det(i + 300) * 14, -3, 1.45, 'mid', 0.86, 112, 8.4, 1.22, i * 0.6));
      strands.push(s(251, y, 4, 52 + det(i + 340) * 14, 3, 1.45, 'mid', 0.86, 112, 8.4, 1.22, i * 0.6 + 1.5));
    }
    for (let i = 0; i < 6; i++) {
      const rx = 104 + (i / 5) * 112;
      const sideDir = rx < 160 ? -1 : 1;
      strands.push(s(rx, 40, sideDir * 12, 26, sideDir * 3.2, 0.7, 'highlight', 0.16, 134, 9.2, 0.95, i * 0.9));
    }
    return strands;
  }

  if (style === 't800_flattop') {
    // Crisp flat-top military crew cut bristles (left intact side + torn notch on right)
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 34; i++) {
      const t = i / 33;
      const rx = 78 + t * 158;
      const ry = 30 + (rx > 212 ? 12 : 0);
      strands.push(
        s(rx, ry, (t - 0.5) * 3, -7 - det(i + 20) * 3, 0.5, 1.0, 'mid', 0.88, 320, 15.8, 0.32, i * 0.35)
      );
    }
    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      const rx = 76 + t * 138;
      strands.push(
        s(rx, 66 - Math.sin(t * Math.PI) * 8, 1.5, 7, 0.5, 0.85, 'mid', 0.8, 320, 15.5, 0.35, i * 0.48)
      );
    }
    return strands;
  }

  if (style === 'wolverine_wings') {
    // Signature twin razor-flared Wolverine wolf-wing tufts + sharp widow's peak
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 24; i++) {
      const t = i / 23;
      const ly = 40 + t * 56;
      const ry = 40 + t * 56;
      strands.push(
        s(84 - t * 8, ly, -42 - (1 - t) * 20, -26 + t * 14, -7.5, 1.9 + det(i + 20) * 1.1, 'mid', 0.94, 172, 10.4, 0.74, i * 0.4)
      );
      strands.push(
        s(236 + t * 8, ry, 42 + (1 - t) * 20, -26 + t * 14, 7.5, 1.9 + det(i + 60) * 1.1, 'mid', 0.94, 172, 10.4, 0.74, i * 0.4 + 1.2)
      );
    }
    for (let i = 0; i < 26; i++) {
      const t = i / 25;
      const rx = 90 + t * 140;
      const sideDir = rx < 160 ? -1 : 1;
      const centerDip = Math.exp(-Math.pow((rx - 160) / 26, 2));
      strands.push(
        s(rx, 46 + centerDip * 16, sideDir * 14, -14 + centerDip * 24, sideDir * 3.5, 1.35, 'mid', 0.92, 164, 10.0, 0.85, i * 0.46)
      );
    }
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      strands.push(s(76, 52 + t * 34, -34, -18, -5, 0.85, 'highlight', 0.28, 170, 10.2, 0.75, i * 0.6));
      strands.push(s(244, 52 + t * 34, 34, -18, 5, 0.85, 'highlight', 0.28, 170, 10.2, 0.75, i * 0.6 + 1.1));
    }
    return strands;
  }

  if (style === 'geralt_witcher') {
    // Swept-back silver Witcher crown + loose cheek-framing white strands
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 30; i++) {
      const t = i / 29;
      const rx = 74 + t * 172;
      const normX = (rx - 160) / 86;
      const ry = 32 + normX * normX * 42;
      const sideDir = rx < 160 ? -1 : 1;
      strands.push(
        s(rx, ry, sideDir * (14 + Math.abs(normX) * 12), 16 + Math.abs(normX) * 28, sideDir * 4.2, 1.35, 'mid', 0.92, 136, 9.2, 0.96, i * 0.36)
      );
    }
    for (let i = 0; i < 14; i++) {
      const t = i / 13;
      strands.push(s(86 - t * 2, 74 + t * 34, -5, 42 + det(i + 100) * 12, -4, 1.3, 'mid', 0.92, 114, 8.4, 1.2, i * 0.55));
      strands.push(s(234 + t * 2, 74 + t * 34, 5, 42 + det(i + 140) * 12, 4, 1.3, 'mid', 0.92, 114, 8.4, 1.2, i * 0.55 + 1.3));
    }
    for (let i = 0; i < 6; i++) {
      const rx = 104 + (i / 5) * 112;
      const sideDir = rx < 160 ? -1 : 1;
      strands.push(s(rx, 40, sideDir * 12, 22, sideDir * 3, 0.8, 'highlight', 0.28, 134, 9.0, 0.92, i * 0.85));
    }
    return strands;
  }

  if (style === 'joker_curls') {
    // Wild messy slicked-up green curls + greasy forehead tendrils
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 36; i++) {
      const t = i / 35;
      const rx = 74 + t * 172;
      const normX = (rx - 160) / 86;
      const ry = 32 + normX * normX * 44;
      const sideDir = rx < 160 ? -1 : 1;
      strands.push(
        s(rx, ry, sideDir * (12 + Math.abs(normX) * 14), -8 + Math.abs(normX) * 26 + det(i + 50) * 8, sideDir * 7.5, 1.45 + det(i + 90) * 0.9, 'mid', 0.92, 116, 8.4, 1.12, i * 0.4)
      );
    }
    // Greasy manic green forehead curls
    for (let i = 0; i < 14; i++) {
      const rx = 104 + (i / 13) * 112;
      const sideDir = i % 2 === 0 ? -1 : 1;
      strands.push(
        s(rx, 58, sideDir * 9, 34 + det(i + 200) * 14, sideDir * 8.5, 1.25, 'mid', 0.9, 106, 8.1, 1.25, i * 0.65)
      );
    }
    return strands;
  }

  if (style === 'arthur_outlaw') {
    // Shaggy sun-bleached chestnut outlaw locks peeking beneath Gambler hat brim along temples & ears
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 18; i++) {
      const t = i / 17;
      const y = 78 + t * 56;
      const len = 30 + det(i + 40) * 14;
      strands.push(s(74 - t * 2, y, -5, len, -4, 1.5, 'mid', 0.92, 128, 9.0, 1.05, i * 0.48));
      strands.push(s(246 + t * 2, y, 5, len, 4, 1.5, 'mid', 0.92, 128, 9.0, 1.05, i * 0.48 + 1.4));
    }
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      strands.push(s(75, 86 + t * 38, -4, 28, -3, 0.85, 'highlight', 0.28, 128, 9.0, 1.0, i * 0.7));
      strands.push(s(245, 86 + t * 38, 4, 28, 3, 0.85, 'highlight', 0.28, 128, 9.0, 1.0, i * 0.7 + 1.2));
    }
    return strands;
  }

  if (style === 'pompadour') {
    // Tall swept-up rockabilly/greaser pompadour crest + tapered sideburns
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 32; i++) {
      const t = i / 31;
      const rx = 86 + t * 148;
      const normX = (rx - 160) / 74;
      const ry = 42 + normX * normX * 26;
      const loft = -26 * (1 - normX * normX * 0.72) - det(i + 10) * 6;
      const sweepX = (0.35 - t) * 24 + 12;
      strands.push(
        s(rx, ry, sweepX, loft, -4.5, 1.45 + det(i + 20) * 0.7, 'mid', 0.94, 190, 12.2, 0.78, i * 0.35)
      );
    }
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const rx = 102 + t * 116;
      const normX = (rx - 160) / 58;
      strands.push(
        s(rx, 46 + normX * normX * 16, 10, -22 * (1 - normX * normX * 0.6), -3.5, 0.9, 'highlight', 0.28, 195, 12.4, 0.72, i * 0.52)
      );
    }
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      strands.push(s(74, 82 + t * 36, -3, 18, -1.5, 1.25, 'shadow', 0.5, 185, 11.8, 0.85, i * 0.44));
      strands.push(s(246, 82 + t * 36, 3, 18, 1.5, 1.25, 'shadow', 0.5, 185, 11.8, 0.85, i * 0.44 + 1.1));
    }
    return strands;
  }

  if (style === 'dreads') {
    // Heavy corded dreadlocks framing the temples & forehead
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 18; i++) {
      const t = i / 17;
      const rx = 74 + t * 172;
      const normX = (rx - 160) / 86;
      const ry = 38 + normX * normX * 36;
      const side = rx < 160 ? -1 : 1;
      const len = 42 + Math.abs(normX) * 28 + det(i + 30) * 14;
      strands.push(
        s(rx, ry, side * (8 + Math.abs(normX) * 8), len, side * 5.2, 2.3 + det(i + 60) * 0.7, 'mid', 0.95, 118, 8.2, 1.28, i * 0.42)
      );
      if (i % 2 === 0) {
        strands.push(
          s(rx + 1.5, ry + 2, side * (8 + Math.abs(normX) * 8), len * 0.88, side * 4.2, 1.0, 'highlight', 0.24, 120, 8.4, 1.25, i * 0.42)
        );
      }
    }
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      strands.push(s(72, 74 + t * 44, -6, 48 + det(i + 90) * 16, -4.5, 2.2, 'shadow', 0.72, 112, 8.0, 1.32, i * 0.6));
      strands.push(s(248, 74 + t * 44, 6, 48 + det(i + 120) * 16, 4.5, 2.2, 'shadow', 0.72, 112, 8.0, 1.32, i * 0.6 + 1.3));
    }
    return strands;
  }

  if (style === 'afro') {
    // Dense coiled crown curls forming a full rounded halo
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 64; i++) {
      const t = i / 63;
      const angle = -Math.PI * 0.98 + t * Math.PI * 0.96;
      const rx = 160 + Math.cos(angle) * 86;
      const ry = 82 + Math.sin(angle) * 52;
      const radialLen = 14 + det(i + 40) * 10;
      const dx = Math.cos(angle) * radialLen + (det(i + 80) - 0.5) * 6;
      const dy = Math.sin(angle) * radialLen + (det(i + 100) - 0.5) * 5;
      strands.push(
        s(
          rx,
          ry,
          dx,
          dy,
          (i % 2 === 0 ? 1 : -1) * (4.5 + det(i + 140) * 3.5),
          2.0 + det(i + 160) * 1.1,
          i % 5 === 0 ? 'highlight' : i % 3 === 0 ? 'shadow' : 'mid',
          i % 5 === 0 ? 0.28 : 0.92,
          172,
          11.2,
          0.95,
          i * 0.28
        )
      );
    }
    return strands;
  }

  if (style === 'slick_back') {
    // Sleek mobster slicked-back hair with clean side contour
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 32; i++) {
      const t = i / 31;
      const rx = 82 + t * 156;
      const normX = (rx - 160) / 78;
      const ry = 48 + normX * normX * 28;
      const side = normX < 0 ? -1 : 1;
      strands.push(
        s(rx, ry, side * (8 + Math.abs(normX) * 8), -14 + Math.abs(normX) * 18, side * 2.2, 1.15, 'mid', 0.92, 205, 13.0, 0.72, i * 0.34)
      );
    }
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const rx = 98 + t * 124;
      const normX = (rx - 160) / 62;
      strands.push(
        s(rx, 45 + normX * normX * 18, normX * 8, -11, 1.5, 0.85, 'highlight', 0.34, 210, 13.2, 0.7, i * 0.5)
      );
    }
    return strands;
  }

  if (style === 'bandana_gang') {
    // Loose hair tufts emerging from beneath a street bandana at temples & nape
    const strands: HairStrandSpec[] = [];
    for (let i = 0; i < 14; i++) {
      const t = i / 13;
      const y = 84 + t * 38;
      strands.push(s(74, y, -7 - det(i + 10) * 5, 22 + det(i + 20) * 10, -3.5, 1.4, 'mid', 0.9, 142, 9.6, 1.05, i * 0.45));
      strands.push(s(246, y, 7 + det(i + 40) * 5, 22 + det(i + 50) * 10, 3.5, 1.4, 'mid', 0.9, 142, 9.6, 1.05, i * 0.45 + 1.2));
    }
    return strands;
  }

  return [];
}

const HAIR_STRANDS_BY_STYLE: Record<EnemyProfile['hairStyle'], HairStrandSpec[]> = {
  bald: [],
  short: makeHairStrandsForStyle('short'),
  wild: makeHairStrandsForStyle('wild'),
  mohawk: makeHairStrandsForStyle('mohawk'),
  buzz: makeHairStrandsForStyle('buzz'),
  spiky: makeHairStrandsForStyle('spiky'),
  helmet: makeHairStrandsForStyle('helmet'),
  pompadour: makeHairStrandsForStyle('pompadour'),
  dreads: makeHairStrandsForStyle('dreads'),
  afro: makeHairStrandsForStyle('afro'),
  slick_back: makeHairStrandsForStyle('slick_back'),
  bandana_gang: makeHairStrandsForStyle('bandana_gang'),
  trevor_receding: makeHairStrandsForStyle('trevor_receding'),
  john_wick: makeHairStrandsForStyle('john_wick'),
  t800_flattop: makeHairStrandsForStyle('t800_flattop'),
  wolverine_wings: makeHairStrandsForStyle('wolverine_wings'),
  geralt_witcher: makeHairStrandsForStyle('geralt_witcher'),
  joker_curls: makeHairStrandsForStyle('joker_curls'),
  arthur_outlaw: makeHairStrandsForStyle('arthur_outlaw'),
};

const MAX_HAIR_STRANDS = 180;

interface HairStrandPhysics {
  dx: number;
  dy: number;
  vx: number;
  vy: number;
}

export const TargetFace: React.FC<TargetFaceProps> = ({
  enemy,
  hp,
  isKo,
  isStunned,
  isBlocking,
  isInShock,
  xrayFlash,
  cryIntensity,
  isRageActive,
  trauma,
  hitNonce,
  lastHitOffset,
  lastHitZone = null,
  bruises,
  lastBloodBurst,
  clearBloodNonce = 0,
  onChinBloodDrop,
  onPunch,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const shockGroupRef = useRef<SVGGElement | null>(null);
  const [wince, setWince] = useState(false);
  const winceTimerRef = useRef<number | null>(null);

  // Refs for 60fps realistic tear-pooling & fluid facial expression animation without React re-renders
  const cryIntensityRef = useRef(cryIntensity);
  cryIntensityRef.current = isKo || enemy.bossId === 'joker' ? 0 : cryIntensity;
  const isKoRef = useRef(isKo);
  isKoRef.current = isKo;
  const isInShockRef = useRef(isInShock);
  isInShockRef.current = isInShock;
  const isStunnedRef = useRef(isStunned);
  isStunnedRef.current = isStunned;
  const traumaRef = useRef(trauma);
  traumaRef.current = trauma;
  const hpPct = Math.max(0, Math.min(1, hp / enemy.maxHp));
  const hpRatioRef = useRef(hpPct);
  hpRatioRef.current = hpPct;
  const fightElapsedSecRef = useRef<number>(0);
  const hitNonceRef = useRef(hitNonce);
  hitNonceRef.current = hitNonce;
  const lastHitOffsetRef = useRef(lastHitOffset);
  lastHitOffsetRef.current = lastHitOffset;
  const lastHitZoneRef = useRef<HitZone | null>(lastHitZone);
  lastHitZoneRef.current = lastHitZone;
  const onChinBloodDropRef = useRef(onChinBloodDrop);
  onChinBloodDropRef.current = onChinBloodDrop;
  const lastChinDropAtRef = useRef<number>(0);
  const hairStrands = enemy.miniBossId ? [] : HAIR_STRANDS_BY_STYLE[enemy.hairStyle];
  const hairStrandsRef = useRef<HairStrandSpec[]>(hairStrands);
  hairStrandsRef.current = hairStrands;
  const speciesRef = useRef(enemy.species);
  speciesRef.current = enemy.species;
  const bossIdRef = useRef(enemy.bossId);
  bossIdRef.current = enemy.bossId;
  const miniBossIdRef = useRef(enemy.miniBossId);
  miniBossIdRef.current = enemy.miniBossId;
  const moodRef = useRef<'smug' | 'angry' | 'crying' | 'dazed' | 'ko'>('smug');
  const isBlindRef = useRef(trauma.isBlind);
  isBlindRef.current = trauma.isBlind;
  const leftEyeSwollenRef = useRef(trauma.leftEyeSwollen);
  leftEyeSwollenRef.current = trauma.leftEyeSwollen;
  const rightEyeSwollenRef = useRef(trauma.rightEyeSwollen);
  rightEyeSwollenRef.current = trauma.rightEyeSwollen;

  // Refs for 60fps subtle head & facial 3D parallax tracking toward mouse pointer
  const pointerNormRef = useRef({ nx: 0, ny: 0 });
  const headCurrRef = useRef({ nx: 0, ny: 0 });
  const prevHeadCurrRef = useRef({ nx: 0, ny: 0 });
  const headPivotRef = useRef<SVGGElement | null>(null);
  const hitboxPivotRef = useRef<SVGGElement | null>(null);
  const earsParallaxRef = useRef<SVGGElement | null>(null);
  const facialInnerParallaxRef = useRef<SVGGElement | null>(null);
  const hairParallaxRef = useRef<SVGGElement | null>(null);
  const sculptedHairGroupRef = useRef<SVGGElement | null>(null);
  const sculptedHairSpringRef = useRef({ dx: 0, dy: 0, vx: 0, vy: 0 });
  const hairStrandRefs = useRef<Array<SVGPathElement | null>>([]);
  const hairPhysicsRef = useRef<HairStrandPhysics[]>(
    Array.from({ length: MAX_HAIR_STRANDS }, () => ({ dx: 0, dy: 0, vx: 0, vy: 0 }))
  );
  const lastHairHitNonceRef = useRef(hitNonce);
  const lastHairKoRef = useRef(isKo);
  const hairReboundRef = useRef({ active: false, age: 0, dx: 0, dy: 0, power: 1 });
  const eyebrowsEyesParallaxRef = useRef<SVGGElement | null>(null);
  const noseParallaxRef = useRef<SVGGElement | null>(null);
  const mouthParallaxRef = useRef<SVGGElement | null>(null);
  const bloodRivuletsParallaxRef = useRef<SVGGElement | null>(null);

  // Refs for 60fps continuous fluid facial expressions (brows, blinking eyelids, saccades, nostrils, lips/jaw)
  const exprStateRef = useRef({
    gazeX: 0,
    gazeY: 0,
    pupilScale: 1,
    flinch: 0,
    flinchSide: 0,
    flinchZone: 'forehead' as HitZone,
    lastHitNonce: hitNonce,
    blinkTimer: 2.1,
    blinkAge: -1,
    blinkDuration: 0.145,
    doubleBlinkPending: false,
    twitchTimer: 1.6,
    twitchAge: -1,
    twitchSide: 1,
    breathPhase: 0,
    saccadeTimer: 0.4,
    saccadeX: 0,
    saccadeY: 0,
    browLInnerY: 124,
    browLMidY: 115,
    browLOuterY: 124,
    browRInnerY: 124,
    browRMidY: 115,
    browROuterY: 124,
    leftLidClose: 0.04,
    rightLidClose: 0.04,
    leftSquintBottom: 0.04,
    rightSquintBottom: 0.04,
    eyeUpperOpen: 14,
    eyeLowerOpen: 11,
    tension: 0.12,
    nostrilFlare: 0,
    mouthLeftX: 132,
    mouthLeftY: 243,
    mouthRightX: 194,
    mouthRightY: 234,
    upperLipMidY: 239,
    upperInnerY: 242,
    lowerInnerY: 251,
    lowerOuterY: 257,
    koBlend: 0,
    speechEnv: 0,
    headOffsetX: 0,
    headOffsetY: 0,
    headTiltDeg: 0,
    microTimer: 1.7,
    microKind: 0, // 0=none, 1=brow_cock, 2=sneer, 3=squint_glare
    microStrength: 0,
    flush: 0,
    veinPulse: 0,
  });

  const nasolabialLRef = useRef<SVGPathElement | null>(null);
  const nasolabialRRef = useRef<SVGPathElement | null>(null);
  const foreheadWrinklesRef = useRef<SVGPathElement | null>(null);
  const glabellaLinesRef = useRef<SVGPathElement | null>(null);
  const rageVeinsRef = useRef<SVGGElement | null>(null);
  const angryCheekFlushRef = useRef<SVGGElement | null>(null);

  const cyclopsBrowShadowRef = useRef<SVGPathElement | null>(null);
  const cyclopsBrowMainRef = useRef<SVGPathElement | null>(null);
  const cyclopsBrowHairsRef = useRef<SVGPathElement | null>(null);
  const leftBrowShadowRef = useRef<SVGPathElement | null>(null);
  const leftBrowMainRef = useRef<SVGPathElement | null>(null);
  const leftBrowHairsRef = useRef<SVGPathElement | null>(null);
  const rightBrowShadowRef = useRef<SVGPathElement | null>(null);
  const rightBrowMainRef = useRef<SVGPathElement | null>(null);
  const rightBrowHairsRef = useRef<SVGPathElement | null>(null);

  const leftEyeClipPathRef = useRef<SVGPathElement | null>(null);
  const rightEyeClipPathRef = useRef<SVGPathElement | null>(null);
  const cyclopsEyeClipPathRef = useRef<SVGPathElement | null>(null);
  const leftEyeOutlineRef = useRef<SVGPathElement | null>(null);
  const rightEyeOutlineRef = useRef<SVGPathElement | null>(null);
  const cyclopsEyeOutlineRef = useRef<SVGPathElement | null>(null);

  const leftIrisGroupRef = useRef<SVGGElement | null>(null);
  const rightIrisGroupRef = useRef<SVGGElement | null>(null);
  const cyclopsIrisGroupRef = useRef<SVGGElement | null>(null);
  const cyberIrisGroupRef = useRef<SVGGElement | null>(null);
  const leftPupilRef = useRef<SVGCircleElement | null>(null);
  const rightPupilRef = useRef<SVGCircleElement | null>(null);
  const cyclopsPupilRef = useRef<SVGCircleElement | null>(null);

  const leftUpperLidCurtainRef = useRef<SVGPathElement | null>(null);
  const leftLowerLidCurtainRef = useRef<SVGPathElement | null>(null);
  const leftUpperLashRef = useRef<SVGPathElement | null>(null);
  const leftLidCreaseRef = useRef<SVGPathElement | null>(null);
  const rightUpperLidCurtainRef = useRef<SVGPathElement | null>(null);
  const rightLowerLidCurtainRef = useRef<SVGPathElement | null>(null);
  const rightUpperLashRef = useRef<SVGPathElement | null>(null);
  const rightLidCreaseRef = useRef<SVGPathElement | null>(null);
  const cyclopsUpperLidCurtainRef = useRef<SVGPathElement | null>(null);
  const cyclopsLowerLidCurtainRef = useRef<SVGPathElement | null>(null);
  const cyclopsUpperLashRef = useRef<SVGPathElement | null>(null);
  const cyclopsLidCreaseRef = useRef<SVGPathElement | null>(null);

  const leftNostrilRef = useRef<SVGEllipseElement | null>(null);
  const rightNostrilRef = useRef<SVGEllipseElement | null>(null);

  const mouthClipPathRef = useRef<SVGPathElement | null>(null);
  const mouthCavityPathRef = useRef<SVGPathElement | null>(null);
  const upperLipPathRef = useRef<SVGPathElement | null>(null);
  const lowerLipPathRef = useRef<SVGPathElement | null>(null);
  const lowerLipSheenRef = useRef<SVGEllipseElement | null>(null);
  const upperArchTransformRef = useRef<SVGGElement | null>(null);
  const lowerArchTransformRef = useRef<SVGGElement | null>(null);
  const koTongueRef = useRef<SVGGElement | null>(null);

  const leftPoolRef = useRef<SVGPathElement | null>(null);
  const rightPoolRef = useRef<SVGPathElement | null>(null);
  const trailRefs = useRef<Array<SVGPathElement | null>>([]);
  const beadRefs = useRef<Array<SVGGElement | null>>([]);
  const tearPhasesRef = useRef<number[]>(TEAR_TRACKS.map((t) => t.initialPhase));

  // Refs for 60fps exertion sweat droplets & clammy skin sheen
  const sweatSheenRef = useRef<SVGGElement | null>(null);
  const sweatTrailRefs = useRef<Array<SVGPathElement | null>>([]);
  const sweatBeadRefs = useRef<Array<SVGGElement | null>>([]);
  const sweatPhasesRef = useRef<number[]>(SWEAT_TRACKS.map((t) => t.initialPhase));

  // Refs for 60fps real-time gravity-driven facial blood rivulets
  const rivuletsRef = useRef<BloodRivulet[]>(
    Array.from({ length: MAX_BLOOD_RIVULETS }, () => createEmptyRivulet())
  );
  const rivuletCursorRef = useRef<number>(0);
  const rivuletStainRefs = useRef<Array<SVGPathElement | null>>([]);
  const rivuletCoreRefs = useRef<Array<SVGPathElement | null>>([]);
  const rivuletShineRefs = useRef<Array<SVGPathElement | null>>([]);
  const rivuletBeadRefs = useRef<Array<SVGGElement | null>>([]);
  const nextOozeAtRef = useRef<number>(0);
  const lastProcessedBurstIdRef = useRef<number>(0);
  const lastRivuletHitNonceRef = useRef<number>(hitNonce);

  // Refs for 60fps SVG <filter> impact shockwave vibration & directional micro-shift
  const impactWarpGroupRef = useRef<SVGGElement | null>(null);
  const impactTurbulenceRef = useRef<SVGFETurbulenceElement | null>(null);
  const impactDisplaceRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const impactOffsetRef = useRef<SVGFEOffsetElement | null>(null);
  const lastImpactFilterHitNonceRef = useRef<number>(hitNonce);
  const impactShockRef = useRef({
    active: false,
    age: 0,
    dx: 0,
    dy: 0,
    power: 1,
    seed: 7,
  });

  // Refs for 60fps flying knocked-out teeth
  const flyingTeethRef = useRef<FlyingTooth[]>(
    Array.from({ length: MAX_FLYING_TEETH }, () => createEmptyFlyingTooth())
  );
  const flyingToothCursorRef = useRef<number>(0);
  const flyingToothGroupRefs = useRef<Array<SVGGElement | null>>([]);
  const flyingToothShapeRefs = useRef<Array<SVGGElement | null>>([]);
  const flyingToothNormalRefs = useRef<Array<SVGGElement | null>>([]);
  const flyingToothTuskRefs = useRef<Array<SVGGElement | null>>([]);
  const flyingToothDropRefs = useRef<Array<Array<SVGCircleElement | null>>>(
    Array.from({ length: MAX_FLYING_TEETH }, () => [])
  );
  const prevTeethRemainingRef = useRef<number>(trauma.teethRemaining);
  const prevEnemyLevelRef = useRef<number>(enemy.level);

  const spawnFlyingTooth = (
    socketX: number,
    socketY: number,
    hitDx: number,
    power: number,
    isTusk: boolean
  ) => {
    const teethPool = flyingTeethRef.current;
    let slotIdx = -1;
    for (let offset = 0; offset < MAX_FLYING_TEETH; offset++) {
      const idx = (flyingToothCursorRef.current + offset) % MAX_FLYING_TEETH;
      if (!teethPool[idx].active) {
        slotIdx = idx;
        break;
      }
    }
    if (slotIdx === -1) {
      slotIdx = flyingToothCursorRef.current % MAX_FLYING_TEETH;
    }
    flyingToothCursorRef.current = (slotIdx + 1) % MAX_FLYING_TEETH;

    const dir =
      Math.abs(hitDx) > 0.12
        ? Math.sign(hitDx)
        : Math.random() < 0.5
          ? -1
          : 1;
    const pwrScale = Math.min(1.4, Math.max(0.88, power || 1));

    const ft = teethPool[slotIdx];
    ft.active = true;
    ft.x = socketX;
    ft.y = socketY;
    ft.vx = dir * (105 + Math.random() * 80) * pwrScale;
    ft.vy = -(210 + Math.random() * 75) * pwrScale;
    ft.rot = (Math.random() - 0.5) * 40;
    ft.vRot = dir * (660 + Math.random() * 420);
    ft.spinPhase = Math.random() * Math.PI;
    ft.spinSpeed = 9.5 + Math.random() * 5;
    ft.age = 0;
    ft.duration = 1.18;
    ft.isTusk = isTusk;

    for (let d = 0; d < FLYING_TOOTH_DROPLETS; d++) {
      const spread = (d / Math.max(1, FLYING_TOOTH_DROPLETS - 1) - 0.5) * 90;
      ft.droplets[d].x = socketX;
      ft.droplets[d].y = socketY + 2;
      ft.droplets[d].vx = ft.vx * (0.45 + Math.random() * 0.38) + spread * 0.45;
      ft.droplets[d].vy = ft.vy * (0.42 + Math.random() * 0.32) + (Math.random() - 0.5) * 40;
      ft.droplets[d].r = 1.4 + Math.random() * 1.5;
    }

    const groupEl = flyingToothGroupRefs.current[slotIdx];
    const shapeEl = flyingToothShapeRefs.current[slotIdx];
    const normalEl = flyingToothNormalRefs.current[slotIdx];
    const tuskEl = flyingToothTuskRefs.current[slotIdx];
    if (normalEl) normalEl.style.display = isTusk ? 'none' : 'inline';
    if (tuskEl) tuskEl.style.display = isTusk ? 'inline' : 'none';
    if (shapeEl) {
      shapeEl.setAttribute(
        'transform',
        `translate(${ft.x.toFixed(2)}, ${ft.y.toFixed(2)}) rotate(${ft.rot.toFixed(1)}) scale(1.25)`
      );
      shapeEl.style.opacity = '1';
    }
    if (groupEl) {
      groupEl.style.opacity = '1';
    }
  };

  const spawnBloodRivulet = (x: number, y: number, severity: number, speedBoost = 1) => {
    const clampedSev = Math.max(0.15, Math.min(1, severity));
    const rivulets = rivuletsRef.current;

    // Prefer an empty slot, otherwise a finished slot, otherwise oldest slot
    let chosenIdx = -1;
    for (let offset = 0; offset < MAX_BLOOD_RIVULETS; offset++) {
      const idx = (rivuletCursorRef.current + offset) % MAX_BLOOD_RIVULETS;
      if (!rivulets[idx].active) {
        chosenIdx = idx;
        break;
      }
    }
    if (chosenIdx === -1) {
      for (let offset = 0; offset < MAX_BLOOD_RIVULETS; offset++) {
        const idx = (rivuletCursorRef.current + offset) % MAX_BLOOD_RIVULETS;
        if (!rivulets[idx].flowing && rivulets[idx].beadFade <= 0) {
          chosenIdx = idx;
          break;
        }
      }
    }
    if (chosenIdx === -1) {
      chosenIdx = rivuletCursorRef.current % MAX_BLOOD_RIVULETS;
    }
    rivuletCursorRef.current = (chosenIdx + 1) % MAX_BLOOD_RIVULETS;

    const r = rivulets[chosenIdx];
    const width = 0.62 + clampedSev * 0.96 + Math.random() * 0.24;
    const stainColor =
      clampedSev > 0.78
        ? '#140102'
        : clampedSev > 0.52
          ? '#240204'
          : clampedSev > 0.3
            ? '#380506'
            : '#4a0808';
    const coreColor =
      clampedSev > 0.78
        ? '#6b080c'
        : clampedSev > 0.52
          ? '#850d11'
          : clampedSev > 0.3
            ? '#991b1b'
            : '#7f1d1d';

    r.active = true;
    r.flowing = true;
    r.x = x;
    r.y = y;
    r.lastSampleX = x;
    r.lastSampleY = y;
    r.vx = (Math.random() - 0.5) * 3.2;
    r.vy = (1.9 + Math.random() * 3.2) * speedBoost;
    r.age = 0;
    r.lingerTime = Math.max(0.05, 0.2 - clampedSev * 0.1 + Math.random() * 0.06);
    r.traveled = 0;
    r.maxLength = (20 + clampedSev * 64 + Math.random() * (16 + clampedSev * 28)) * speedBoost;
    r.severity = clampedSev;
    r.width = width;
    r.seed = Math.random() * Math.PI * 2;
    r.stainColor = stainColor;
    r.coreColor = coreColor;
    r.stainOpacity = 0.16 + clampedSev * 0.24;
    r.coreOpacity = 0.58 + clampedSev * 0.32;
    r.beadFade = 1;
    r.points = [{ x, y }, { x, y: y + 0.5 }];

    const stainEl = rivuletStainRefs.current[chosenIdx];
    const coreEl = rivuletCoreRefs.current[chosenIdx];
    const shineEl = rivuletShineRefs.current[chosenIdx];
    const beadEl = rivuletBeadRefs.current[chosenIdx];
    const d = buildSmoothSvgPath(r.points);

    if (stainEl) {
      stainEl.setAttribute('d', d);
      stainEl.setAttribute('stroke', r.stainColor);
      stainEl.setAttribute('stroke-width', (r.width * (1.36 + r.severity * 0.42)).toFixed(2));
      stainEl.style.opacity = String(r.stainOpacity);
    }
    if (coreEl) {
      coreEl.setAttribute('d', d);
      coreEl.setAttribute('stroke', r.coreColor);
      coreEl.setAttribute('stroke-width', r.width.toFixed(2));
      coreEl.style.opacity = String(r.coreOpacity);
    }
    if (shineEl) {
      shineEl.setAttribute('d', d);
      shineEl.setAttribute('stroke-width', Math.max(0.32, r.width * 0.26).toFixed(2));
      shineEl.style.opacity = String(0.14 + r.severity * 0.16);
    }
    if (beadEl) {
      beadEl.style.opacity = String(0.76);
      beadEl.setAttribute('transform', `translate(${x.toFixed(2)}, ${y.toFixed(2)}) scale(0.58)`);
    }
  };

  // Clear all facial blood trails when switching opponent or clicking "Limpar Sangue"
  useEffect(() => {
    const rivulets = rivuletsRef.current;
    for (let i = 0; i < MAX_BLOOD_RIVULETS; i++) {
      rivulets[i].active = false;
      rivulets[i].flowing = false;
      rivulets[i].points = [];
      const stainEl = rivuletStainRefs.current[i];
      const coreEl = rivuletCoreRefs.current[i];
      const shineEl = rivuletShineRefs.current[i];
      const beadEl = rivuletBeadRefs.current[i];
      if (stainEl) stainEl.style.opacity = '0';
      if (coreEl) coreEl.style.opacity = '0';
      if (shineEl) shineEl.style.opacity = '0';
      if (beadEl) beadEl.style.opacity = '0';
    }
  }, [clearBloodNonce, enemy.level]);

  // Reset fight exertion timer & sweat beads when switching opponent or resetting a fresh round
  useEffect(() => {
    fightElapsedSecRef.current = 0;
    sweatPhasesRef.current = SWEAT_TRACKS.map((t) => t.initialPhase);
    SWEAT_TRACKS.forEach((_, i) => {
      const trail = sweatTrailRefs.current[i];
      const bead = sweatBeadRefs.current[i];
      if (trail) trail.style.opacity = '0';
      if (bead) bead.style.opacity = '0';
    });
    if (sweatSheenRef.current) {
      sweatSheenRef.current.style.opacity = '0';
    }
    for (let i = 0; i < MAX_HAIR_STRANDS; i++) {
      hairPhysicsRef.current[i].dx = 0;
      hairPhysicsRef.current[i].dy = 0;
      hairPhysicsRef.current[i].vx = 0;
      hairPhysicsRef.current[i].vy = 0;
    }
    sculptedHairSpringRef.current = { dx: 0, dy: 0, vx: 0, vy: 0 };
    exprStateRef.current.flinch = 0;
    exprStateRef.current.koBlend = 0;
    exprStateRef.current.speechEnv = 0;
    exprStateRef.current.headOffsetX = 0;
    exprStateRef.current.headOffsetY = 0;
    exprStateRef.current.headTiltDeg = 0;
    exprStateRef.current.microStrength = 0;
    exprStateRef.current.flush = 0;
    exprStateRef.current.veinPulse = 0;
  }, [enemy.level, enemy.hairStyle]);

  useEffect(() => {
    if (hp >= enemy.maxHp && hitNonce === 0) {
      fightElapsedSecRef.current = 0;
      sweatPhasesRef.current = SWEAT_TRACKS.map((t) => t.initialPhase);
      exprStateRef.current.flinch = 0;
      exprStateRef.current.koBlend = 0;
      exprStateRef.current.speechEnv = 0;
      exprStateRef.current.headOffsetX = 0;
      exprStateRef.current.headOffsetY = 0;
      exprStateRef.current.headTiltDeg = 0;
      exprStateRef.current.microStrength = 0;
      exprStateRef.current.flush = 0;
      exprStateRef.current.veinPulse = 0;
    }
  }, [hp, enemy.maxHp, hitNonce]);

  // Launch flying tooth + subtle mouth bleed trickle whenever a tooth is knocked out
  useEffect(() => {
    if (enemy.level !== prevEnemyLevelRef.current || trauma.teethRemaining > prevTeethRemainingRef.current) {
      prevEnemyLevelRef.current = enemy.level;
      prevTeethRemainingRef.current = trauma.teethRemaining;
      flyingTeethRef.current.forEach((ft, i) => {
        ft.active = false;
        const g = flyingToothGroupRefs.current[i];
        if (g) g.style.opacity = '0';
      });
      return;
    }

    if (trauma.teethRemaining < prevTeethRemainingRef.current) {
      const hnx = headCurrRef.current.nx;
      const hny = headCurrRef.current.ny;
      const hitOffset = lastHitOffsetRef.current;

      for (let slot = prevTeethRemainingRef.current - 1; slot >= trauma.teethRemaining; slot--) {
        const baseOrigin = BROKEN_TOOTH_ORIGINS[slot] || { x: 160, y: 240, isTusk: false };
        const originX = baseOrigin.x;
        const originY = baseOrigin.y;
        const isCyclopsTusk = enemy.species === 'cyclops' && baseOrigin.isTusk;
        spawnFlyingTooth(
          originX + hnx * 2.0,
          originY + hny * 1.3,
          hitOffset.dx,
          hitOffset.power,
          isCyclopsTusk
        );

        // Subtle, natural blood trickle starting at the lower lip rim below the broken tooth
        const lipX = 160 + (originX - 160) * 0.75 + (Math.random() - 0.5) * 4;
        spawnBloodRivulet(lipX, 253, 0.38 + (6 - slot) * 0.04, 0.85);
      }

      prevTeethRemainingRef.current = trauma.teethRemaining;
    }
  }, [trauma.teethRemaining, enemy.level, enemy.species]);

  // Spawn subtle real-time blood rivulets on selected unblocked punches
  useEffect(() => {
    if (!lastBloodBurst || lastBloodBurst.id === lastProcessedBurstIdRef.current) return;
    lastProcessedBurstIdRef.current = lastBloodBurst.id;

    const { x, y, zone, severity, isCrit } = lastBloodBurst;
    const tr = traumaRef.current;
    const count = severity > 0.72 || isCrit ? 2 : 1;

    for (let i = 0; i < count; i++) {
      const jitterX = (Math.random() - 0.5) * 10;
      const jitterY = (Math.random() - 0.5) * 6;
      const localSev = Math.max(0.16, Math.min(1, severity * (0.85 + Math.random() * 0.22)));
      spawnBloodRivulet(x + jitterX, y + jitterY, localSev, i === 0 && isCrit ? 1.12 : 0.95);
    }

    // Occasional subtle wound trickle when hitting a ruptured/broken zone
    if (Math.random() < 0.45) {
      if (zone === 'nose' && tr.noseBroken) {
        spawnBloodRivulet(160 + (Math.random() < 0.5 ? -7 : 7), 198, Math.max(0.48, severity * 0.9), 0.95);
      } else if (zone === 'mouth' && tr.lipTorn) {
        spawnBloodRivulet(160 + (Math.random() - 0.5) * 12, 260, Math.max(0.5, severity * 0.9), 0.95);
      } else if (zone === 'leftEye' && tr.leftEyeRuptured) {
        spawnBloodRivulet(116 + (Math.random() - 0.5) * 8, 154, Math.max(0.55, severity * 0.92), 0.98);
      } else if (zone === 'rightEye' && (tr.rightEyeRuptured || tr.eyeRuptured)) {
        spawnBloodRivulet(204 + (Math.random() - 0.5) * 8, 154, Math.max(0.55, severity * 0.92), 0.98);
      } else if (zone === 'leftEar' && tr.leftEarBurst) {
        spawnBloodRivulet(58 + (Math.random() - 0.5) * 4, 182, Math.max(0.6, severity * 0.92), 1.0);
      } else if (zone === 'rightEar' && tr.rightEarBurst) {
        spawnBloodRivulet(262 + (Math.random() - 0.5) * 4, 182, Math.max(0.6, severity * 0.92), 1.0);
      } else if (zone === 'forehead' && tr.skullExposed) {
        spawnBloodRivulet(152 + (Math.random() - 0.5) * 18, 98, Math.max(0.65, severity * 0.95), 1.02);
      } else if (zone === 'jaw' && tr.jawFractured) {
        spawnBloodRivulet(172 + (Math.random() - 0.5) * 10, 286, Math.max(0.58, severity * 0.9), 0.95);
      }
    }
    if (tr.arterialRupture && Math.random() < 0.35) {
      spawnBloodRivulet(108 + (Math.random() - 0.5) * 6, 198, 0.85, 1.1);
    }
  }, [lastBloodBurst]);

  // Realistic 60fps tear pooling + gravity-driven facial blood rivulets + shock tremor
  useEffect(() => {
    let animId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const intensity = cryIntensityRef.current;
      const dead = isKoRef.current;
      const tr = traumaRef.current;

      // 1. Eyes fill with tears first (0.05 -> 0.40 builds brimming meniscus pool)
      const poolLevel = dead ? 0 : Math.max(0, Math.min(1, intensity / 0.4));
      const quiver = poolLevel > 0.1 ? Math.sin(now * 0.012) * 0.45 * poolLevel : 0;

      if (leftPoolRef.current) {
        leftPoolRef.current.style.opacity = String(poolLevel * 0.88);
        leftPoolRef.current.setAttribute(
          'transform',
          `translate(0, ${quiver}) scale(1, ${0.35 + poolLevel * 0.75})`
        );
      }
      if (rightPoolRef.current) {
        rightPoolRef.current.style.opacity = String(poolLevel * 0.88);
        rightPoolRef.current.setAttribute(
          'transform',
          `translate(0, ${-quiver * 0.6}) scale(1, ${0.35 + poolLevel * 0.75})`
        );
      }

      // 2. Once eyes are filled, tears slowly overflow & roll down cheek contours
      TEAR_TRACKS.forEach((track, i) => {
        const trail = trailRefs.current[i];
        const bead = beadRefs.current[i];
        if (!trail || !bead) return;

        if (dead || intensity < track.minIntensity) {
          trail.style.opacity = '0';
          bead.style.opacity = '0';
          tearPhasesRef.current[i] = 0;
          return;
        }

        const totalLen = trail.getTotalLength();
        if (totalLen <= 0) return;

        // Speed scales slightly with crying intensity, slower at top (gathering) & faster down cheek
        const currentPhase = tearPhasesRef.current[i];
        const gravityFactor = 0.55 + currentPhase * 0.95;
        const intensityBoost = 0.85 + intensity * 0.65;
        let nextPhase = currentPhase + track.speed * gravityFactor * intensityBoost * dt;
        if (nextPhase > 1.12) {
          nextPhase = 0; // Reset at tear duct after dripping off chin/jaw
        }
        tearPhasesRef.current[i] = nextPhase;

        const clampedT = Math.min(1, nextPhase);
        const pt = trail.getPointAtLength(clampedT * totalLen);

        // Faint wet glistening trail behind the rolling tear
        trail.setAttribute('stroke-dasharray', `${totalLen}`);
        trail.setAttribute('stroke-dashoffset', `${totalLen * (1 - clampedT)}`);
        trail.style.opacity = String(
          nextPhase > 1 ? Math.max(0, 1 - (nextPhase - 1) / 0.12) * 0.45 : 0.42
        );

        // Tear droplet swells briefly at eye rim (0..0.08), rolls cleanly, then fades off chin (>1.0)
        const beadAlpha =
          nextPhase < 0.08
            ? nextPhase / 0.08
            : nextPhase > 0.96
              ? Math.max(0, 1 - (nextPhase - 0.96) / 0.14)
              : 0.95;
        const beadScale = 0.78 + Math.sin(clampedT * Math.PI) * 0.28;

        bead.style.opacity = String(beadAlpha);
        bead.setAttribute(
          'transform',
          `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) scale(${beadScale.toFixed(2)})`
        );
      });

      // 2b. Exertion sweat droplets & clammy sheen driven by fight duration + low HP
      if (!dead) {
        fightElapsedSecRef.current += dt;
      }
      const durationFactor = Math.min(0.86, fightElapsedSecRef.current / 52);
      const lowHpFactor = Math.max(0, (0.86 - hpRatioRef.current) / 0.86);
      const shockBoost = isInShockRef.current ? 0.18 : 0;
      const sweatIntensity = dead
        ? 0
        : Math.min(
            1,
            Math.max(durationFactor, lowHpFactor) +
              Math.min(durationFactor, lowHpFactor) * 0.38 +
              shockBoost
          );

      if (sweatSheenRef.current) {
        sweatSheenRef.current.style.opacity = String((sweatIntensity * 0.25).toFixed(3));
      }

      SWEAT_TRACKS.forEach((track, i) => {
        const trail = sweatTrailRefs.current[i];
        const bead = sweatBeadRefs.current[i];
        if (!trail || !bead) return;

        if (dead || sweatIntensity < track.minIntensity) {
          trail.style.opacity = '0';
          bead.style.opacity = '0';
          sweatPhasesRef.current[i] = track.initialPhase;
          return;
        }

        const totalLen = trail.getTotalLength();
        if (totalLen <= 0) return;

        // Micro-hesitation simulates sweat catching on skin pores & fine facial contours
        const currentPhase = sweatPhasesRef.current[i];
        const poreDrag = 0.56 + 0.44 * Math.sin(now * 0.0042 + i * 2.15);
        const slopeGravity = 0.65 + currentPhase * 0.78;
        const exertionBoost = 0.82 + sweatIntensity * 0.48;
        let nextPhase = currentPhase + track.speed * poreDrag * slopeGravity * exertionBoost * dt;
        if (nextPhase > 1.08) {
          nextPhase = 0;
        }
        sweatPhasesRef.current[i] = nextPhase;

        const clampedT = Math.min(1, nextPhase);
        const pt = trail.getPointAtLength(clampedT * totalLen);

        // Very faint wet shimmer trail behind the creeping sweat drop
        const trailFade = Math.min(1, (sweatIntensity - track.minIntensity) / 0.22);
        trail.setAttribute('stroke-dasharray', `${totalLen}`);
        trail.setAttribute('stroke-dashoffset', `${totalLen * (1 - clampedT)}`);
        trail.style.opacity = String(
          ((nextPhase > 1 ? Math.max(0, 1 - (nextPhase - 1) / 0.08) : 1) *
            0.16 *
            trailFade).toFixed(3)
        );

        // Bead swells gradually at pore (0..0.11), glistens down skin, fades smoothly at jawline
        const beadAlpha =
          nextPhase < 0.11
            ? nextPhase / 0.11
            : nextPhase > 0.94
              ? Math.max(0, 1 - (nextPhase - 0.94) / 0.14)
              : 0.88;
        const swellScale =
          track.size * (nextPhase < 0.11 ? 0.55 + (nextPhase / 0.11) * 0.42 : 0.88 + Math.sin(clampedT * Math.PI) * 0.18);

        bead.style.opacity = String((beadAlpha * (0.65 + sweatIntensity * 0.35)).toFixed(3));
        bead.setAttribute(
          'transform',
          `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) scale(${swellScale.toFixed(2)})`
        );
      });

      // 3. Subtle spaced-out gravity oozing only from open severe wounds between punches
      if (!dead && now >= nextOozeAtRef.current) {
        const woundSources: Array<{ x: number; y: number; sev: number }> = [];
        if (tr.arterialRupture) {
          woundSources.push({ x: 108, y: 199, sev: 0.72 });
        }
        if (tr.skullExposed) {
          woundSources.push({ x: 148 + (Math.random() - 0.5) * 18, y: 97, sev: 0.62 });
        }
        if (tr.noseBroken) {
          woundSources.push({ x: 153, y: 199, sev: 0.44 });
          woundSources.push({ x: 167, y: 199, sev: 0.44 });
        }
        if (tr.teethRemaining < 6) {
          woundSources.push({
            x: 146 + Math.random() * 28,
            y: 254,
            sev: 0.30 + (6 - tr.teethRemaining) * 0.04,
          });
        }
        if (tr.lipTorn) {
          woundSources.push({
            x: 154 + (Math.random() - 0.5) * 6,
            y: 262,
            sev: 0.48,
          });
        }
        if (tr.jawFractured) {
          woundSources.push({ x: 174, y: 288, sev: 0.52 });
        }
        if (tr.leftEyeRuptured) {
          woundSources.push({ x: 118, y: 155, sev: 0.56 });
        }
        if (tr.rightEyeRuptured || tr.eyeRuptured) {
          woundSources.push({ x: 202, y: 155, sev: 0.56 });
        }
        if (tr.leftEarBurst) {
          woundSources.push({ x: 58, y: 184, sev: 0.56 });
        }
        if (tr.rightEarBurst) {
          woundSources.push({ x: 262, y: 184, sev: 0.56 });
        }

        if (woundSources.length > 0) {
          const picked = woundSources[Math.floor(Math.random() * woundSources.length)];
          spawnBloodRivulet(
            picked.x + (Math.random() - 0.5) * 3,
            picked.y + (Math.random() - 0.5) * 2,
            picked.sev,
            0.76
          );
          const bleedFactor = Math.min(1, tr.bleedStacks / 12 + (tr.arterialRupture ? 0.35 : 0));
          nextOozeAtRef.current = now + (5600 - bleedFactor * 2400) + Math.random() * 1800;
        } else {
          nextOozeAtRef.current = now + 1800;
        }
      }

      // 4. Advance all actively flowing gravity-driven blood rivulets (with punch inertia kick)
      let rivuletHitImpulseX = 0;
      let rivuletHitImpulseY = 0;
      if (hitNonceRef.current !== lastRivuletHitNonceRef.current) {
        lastRivuletHitNonceRef.current = hitNonceRef.current;
        const offset = lastHitOffsetRef.current;
        const pwr = Math.max(0.7, Math.min(2.0, offset.power || 1));
        rivuletHitImpulseX = -offset.dx * 18 * pwr;
        rivuletHitImpulseY = -offset.dy * 7 * pwr;
      }

      const lEyeX = 116;
      const lEyeY = 148;
      const rEyeX = 204;
      const rEyeY = 148;
      const jawBendY = 260;
      const jawEndY = 322;

      const rivulets = rivuletsRef.current;
      for (let i = 0; i < MAX_BLOOD_RIVULETS; i++) {
        const r = rivulets[i];
        if (!r.active) continue;
        if (r.flowing && (rivuletHitImpulseX !== 0 || rivuletHitImpulseY !== 0)) {
          r.vx += rivuletHitImpulseX * (0.7 + Math.random() * 0.6);
          r.vy = Math.max(1.2, r.vy + rivuletHitImpulseY * (0.5 + Math.random() * 0.5));
        }

        if (!r.flowing) {
          if (r.beadFade > 0) {
            r.beadFade = Math.max(0, r.beadFade - dt * 2.8);
            const beadEl = rivuletBeadRefs.current[i];
            if (beadEl) {
              beadEl.style.opacity = String(r.beadFade * 0.85);
            }
          }
          continue;
        }

        r.age += dt;
        const beadEl = rivuletBeadRefs.current[i];

        // Surface tension pooling phase before gravity breaks the droplet loose
        if (r.age < r.lingerTime) {
          const swell = 0.55 + (r.age / r.lingerTime) * 0.28;
          if (beadEl) {
            beadEl.style.opacity = '0.72';
            beadEl.setAttribute(
              'transform',
              `translate(${r.x.toFixed(2)}, ${r.y.toFixed(2)}) scale(${swell.toFixed(2)})`
            );
          }
          continue;
        }

        // Gravity acceleration downward with viscous terminal velocity
        const gravityAccel = 30 + r.severity * 52;
        const terminalVy = 18 + r.severity * 42;
        r.vy = Math.min(terminalVy, r.vy + gravityAccel * dt);

        // Subtle organic skin-pore meandering & viscous catch-and-release pulse
        const viscosityPulse = 0.68 + 0.32 * Math.sin(r.age * 7.2 + r.seed);
        let steerVx = Math.sin(r.y * 0.16 + r.seed) * (8 + r.severity * 5);

        // Deflect around intact orbital sockets so blood runs around brow/nose bridge/cheekbone
        if (!tr.leftEyeRuptured && r.y > lEyeY - 16 && r.y < lEyeY + 16 && r.x > lEyeX - 22 && r.x < lEyeX + 22) {
          steerVx += (r.x < lEyeX ? -1 : 1) * 30;
        }
        if (!tr.rightEyeRuptured && !tr.eyeRuptured && r.y > rEyeY - 16 && r.y < rEyeY + 16 && r.x > rEyeX - 22 && r.x < rEyeX + 22) {
          steerVx += (r.x < rEyeX ? -1 : 1) * 30;
        }

        // Follow curved jawline inward toward chin & neck
        if (r.y > jawBendY && r.y < jawEndY && Math.abs(r.x - 160) > 38) {
          steerVx += Math.sign(160 - r.x) * 18;
        }

        r.vx = r.vx * 0.86 + steerVx * 0.14;

        const dx = r.vx * dt;
        const dy = r.vy * viscosityPulse * dt;
        r.x += dx;
        r.y += dy;
        r.traveled += Math.hypot(dx, dy);

        const distFromSample = Math.hypot(r.x - r.lastSampleX, r.y - r.lastSampleY);
        if (distFromSample >= 2.0) {
          r.lastSampleX = r.x;
          r.lastSampleY = r.y;
          r.points.push({ x: r.x, y: r.y });
        } else if (r.points.length > 0) {
          r.points[r.points.length - 1] = { x: r.x, y: r.y };
        }

        const pathD = buildSmoothSvgPath(r.points);
        const stainEl = rivuletStainRefs.current[i];
        const coreEl = rivuletCoreRefs.current[i];
        const shineEl = rivuletShineRefs.current[i];

        if (stainEl) stainEl.setAttribute('d', pathD);
        if (coreEl) coreEl.setAttribute('d', pathD);
        if (shineEl) shineEl.setAttribute('d', pathD);

        if (beadEl) {
          const dropScale = Math.min(0.95, 0.5 + r.severity * 0.34);
          const stretchY = 1 + Math.min(0.32, r.vy / 150);
          const angleDeg = Math.atan2(r.vx, Math.max(1, r.vy)) * (-180 / Math.PI) * 0.45;
          beadEl.style.opacity = '0.84';
          beadEl.setAttribute(
            'transform',
            `translate(${r.x.toFixed(2)}, ${r.y.toFixed(2)}) rotate(${angleDeg.toFixed(1)}) scale(${dropScale.toFixed(2)}, ${(dropScale * stretchY).toFixed(2)})`
          );
        }

        // Occasionally shed a real viscous blood droplet off the jawline onto the arena canvas
        if (
          r.y >= 306 &&
          r.y <= 322 &&
          r.severity >= 0.42 &&
          onChinBloodDropRef.current &&
          now - lastChinDropAtRef.current > 440 &&
          Math.random() < 0.14
        ) {
          const svg = svgRef.current;
          const ctm = svg?.getScreenCTM();
          if (svg && ctm) {
            lastChinDropAtRef.current = now;
            const pt = svg.createSVGPoint();
            pt.x = r.x;
            pt.y = r.y;
            const screenPt = pt.matrixTransform(ctm);
            onChinBloodDropRef.current(screenPt.x, screenPt.y, r.severity);
          }
        }

        if (r.traveled >= r.maxLength || r.y >= 418) {
          r.flowing = false;
          if (shineEl) {
            shineEl.style.opacity = String((0.08 + r.severity * 0.1).toFixed(2));
          }
        }
      }

      // 4c. 60fps SVG <filter> impact shockwave: directional shift + damped tissue vibration
      const shockSafeDt = Math.max(0.004, dt);
      if (hitNonceRef.current !== lastImpactFilterHitNonceRef.current) {
        lastImpactFilterHitNonceRef.current = hitNonceRef.current;
        const hitOff = lastHitOffsetRef.current;
        const pwr = Math.max(0.75, Math.min(2.2, hitOff.power || 1));
        const nextSeed = ((impactShockRef.current.seed * 7 + 13) % 97) + 1;
        impactShockRef.current = {
          active: true,
          age: 0,
          dx: hitOff.dx,
          dy: hitOff.dy,
          power: pwr,
          seed: nextSeed,
        };
        if (impactTurbulenceRef.current) {
          impactTurbulenceRef.current.setAttribute('seed', String(nextSeed));
        }
        if (impactWarpGroupRef.current) {
          impactWarpGroupRef.current.setAttribute('filter', 'url(#impact-shock-warp)');
        }
      }

      if (impactShockRef.current.active) {
        const shk = impactShockRef.current;
        shk.age += shockSafeDt;
        const duration = 0.24;
        if (shk.age >= duration) {
          shk.active = false;
          if (impactDisplaceRef.current) {
            impactDisplaceRef.current.setAttribute('scale', '0');
          }
          if (impactOffsetRef.current) {
            impactOffsetRef.current.setAttribute('dx', '0');
            impactOffsetRef.current.setAttribute('dy', '0');
          }
          if (impactWarpGroupRef.current) {
            impactWarpGroupRef.current.removeAttribute('filter');
          }
        } else {
          const p = shk.age / duration;
          const vibWave = Math.exp(-8.5 * p) * Math.sin(p * Math.PI * 5.5);
          const dispScale =
            4.6 * shk.power * Math.exp(-5.5 * p) * (0.55 + 0.45 * Math.abs(Math.cos(p * Math.PI * 4.5)));
          const shiftEnv = Math.exp(-7.2 * p) * Math.cos(p * Math.PI * 2.8);
          const offsetX = shk.dx * 5.5 * shk.power * shiftEnv + vibWave * 1.35 * shk.power;
          const offsetY = shk.dy * 4.1 * shk.power * shiftEnv + vibWave * 0.55;

          if (impactTurbulenceRef.current) {
            const freqX = (0.022 + (1 - p) * 0.016).toFixed(4);
            const freqY = (0.042 + Math.abs(vibWave) * 0.02).toFixed(4);
            impactTurbulenceRef.current.setAttribute('baseFrequency', `${freqX} ${freqY}`);
          }
          if (impactDisplaceRef.current) {
            impactDisplaceRef.current.setAttribute('scale', dispScale.toFixed(2));
          }
          if (impactOffsetRef.current) {
            impactOffsetRef.current.setAttribute('dx', offsetX.toFixed(2));
            impactOffsetRef.current.setAttribute('dy', offsetY.toFixed(2));
          }
        }
      }

      // 5. Subtle 60fps head & 3D facial parallax following the mouse cursor + expressive acting offsets
      const canFollowCursor = !dead && !isStunnedRef.current && !tr.isBlind;
      const targetNx = canFollowCursor ? pointerNormRef.current.nx : 0;
      const targetNy = canFollowCursor ? pointerNormRef.current.ny : 0;
      const followLerp = 1 - Math.exp(-8.5 * dt);
      headCurrRef.current.nx += (targetNx - headCurrRef.current.nx) * followLerp;
      headCurrRef.current.ny += (targetNy - headCurrRef.current.ny) * followLerp;

      const hnx = headCurrRef.current.nx;
      const hny = headCurrRef.current.ny;
      const esHead = exprStateRef.current;
      const headTx = hnx * 3.8 + esHead.headOffsetX;
      const headTy = hny * 2.4 + esHead.headOffsetY;
      const headRot = hnx * 2.1 + esHead.headTiltDeg;
      const headTransform = `translate(${headTx.toFixed(2)}, ${headTy.toFixed(2)}) rotate(${headRot.toFixed(2)}, 160, 290)`;

      if (headPivotRef.current) {
        headPivotRef.current.setAttribute('transform', headTransform);
      }
      if (hitboxPivotRef.current) {
        hitboxPivotRef.current.setAttribute('transform', headTransform);
      }
      if (earsParallaxRef.current) {
        earsParallaxRef.current.setAttribute(
          'transform',
          `translate(${(-hnx * 1.4).toFixed(2)}, ${(-hny * 0.55).toFixed(2)})`
        );
      }
      if (facialInnerParallaxRef.current) {
        facialInnerParallaxRef.current.setAttribute(
          'transform',
          `translate(${(hnx * 1.65).toFixed(2)}, ${(hny * 1.1).toFixed(2)})`
        );
      }
      if (hairParallaxRef.current) {
        hairParallaxRef.current.setAttribute(
          'transform',
          `translate(${(hnx * 1.65).toFixed(2)}, ${(hny * 1.1).toFixed(2)})`
        );
      }
      if (eyebrowsEyesParallaxRef.current) {
        eyebrowsEyesParallaxRef.current.setAttribute(
          'transform',
          `translate(${(hnx * 2.1).toFixed(2)}, ${(hny * 1.35).toFixed(2)})`
        );
      }
      if (noseParallaxRef.current) {
        noseParallaxRef.current.setAttribute(
          'transform',
          `translate(${(hnx * 3.1).toFixed(2)}, ${(hny * 1.9).toFixed(2)})`
        );
      }
      if (mouthParallaxRef.current) {
        mouthParallaxRef.current.setAttribute(
          'transform',
          `translate(${(hnx * 2.0).toFixed(2)}, ${(hny * 1.3).toFixed(2)})`
        );
      }
      if (bloodRivuletsParallaxRef.current) {
        bloodRivuletsParallaxRef.current.setAttribute(
          'transform',
          `translate(${(hnx * 1.35).toFixed(2)}, ${(hny * 0.9).toFixed(2)})`
        );
      }

      // 5a. 60fps Continuous Fluid Facial Expression Engine (brows, blinking eyelids, saccades, nostrils, lips/jaw, veins & head acting)
      {
        const es = exprStateRef.current;
        const safeExprDt = Math.max(0.004, dt);
        const curMood = moodRef.current;
        const isCyclops = speciesRef.current === 'cyclops';
        const isJoker = bossIdRef.current === 'joker';
        const isTrevor = bossIdRef.current === 'trevor_gta5';
        const isMiniBossSpeaker = Boolean(miniBossIdRef.current);
        const speakerKey = bossIdRef.current || miniBossIdRef.current;
        const blind = isBlindRef.current;
        const shocked = isInShockRef.current;
        const hpRatio = hpRatioRef.current;
        const hpStagePhase = hpRatio > 0.62 ? 'cocky' : hpRatio > 0.28 ? 'aggressive' : 'psychotic';

        // 60fps real-time audio lip-sync envelope & vocal phase for Trevor, Joker & YouTuber mini-bosses
        const rawSpeechAmp = !dead && (isJoker || isTrevor || isMiniBossSpeaker)
          ? soundFx.getSpeechAmplitude(speakerKey)
          : 0;
        const speechActive =
          !dead && (isJoker || isTrevor || isMiniBossSpeaker) && soundFx.isSpeechActive(speakerKey);
        const speechPhase = speechActive ? soundFx.getSpeechPhase(speakerKey) : hpStagePhase;
        const envRate = rawSpeechAmp > es.speechEnv ? 38 : 19;
        es.speechEnv += (rawSpeechAmp - es.speechEnv) * (1 - Math.exp(-envRate * safeExprDt));
        const speechEnv = es.speechEnv;

        // Trigger smooth impact flinch on hit with zone-specific reflex memory
        if (hitNonceRef.current !== es.lastHitNonce) {
          es.lastHitNonce = hitNonceRef.current;
          const off = lastHitOffsetRef.current;
          const pwr = Math.max(0.75, Math.min(1.6, off.power || 1));
          es.flinch = Math.min(1.18, 0.88 * pwr);
          es.flinchSide = Math.max(-1, Math.min(1, off.dx || 0));
          es.flinchZone = lastHitZoneRef.current || 'forehead';
          // Defensive post-hit recovery blink scheduled right after flinch relaxes
          if (es.blinkAge < 0 && es.blinkTimer > 0.35) {
            es.blinkTimer = 0.26 + Math.random() * 0.14;
          }
        }
        es.flinch = Math.max(0, es.flinch * Math.exp(-8.0 * safeExprDt) - 0.01 * safeExprDt);
        const f = Math.min(1, es.flinch);

        // Breathing / exertion rhythm (faster & ragged when heavily injured, shocked, or broken nose)
        const trCur = traumaRef.current;
        const exertion = Math.max(1 - hpRatioRef.current, intensity);
        const raggedBreathBoost = trCur.noseBroken || shocked || hpRatio < 0.4 ? 0.16 : 0;
        const breathHz = curMood === 'ko' ? 0.16 : 0.32 + exertion * 0.46 + raggedBreathBoost;
        es.breathPhase += safeExprDt * breathHz * Math.PI * 2;
        const breathWave = Math.sin(es.breathPhase) + (exertion > 0.5 ? Math.sin(es.breathPhase * 2.1) * 0.22 : 0);

        // Subtle involuntary pain eyelid twitch when wounded or distressed
        let painTwitchL = 0;
        let painTwitchR = 0;
        if (!dead && (hpRatio < 0.65 || intensity > 0.22 || shocked || trCur.leftEyeDamage > 40 || trCur.rightEyeDamage > 40)) {
          es.twitchTimer -= safeExprDt;
          if (es.twitchTimer <= 0 && es.twitchAge < 0) {
            es.twitchAge = 0;
            es.twitchSide = Math.random() < 0.5 ? -1 : 1;
            es.twitchTimer = 1.1 + Math.random() * 2.1;
          }
          if (es.twitchAge >= 0) {
            es.twitchAge += safeExprDt;
            if (es.twitchAge > 0.22) {
              es.twitchAge = -1;
            } else {
              const tw = Math.sin((es.twitchAge / 0.22) * Math.PI * 2.5) * 0.28;
              if (es.twitchSide < 0) painTwitchL = Math.max(0, tw);
              else painTwitchR = Math.max(0, tw);
            }
          }
        } else {
          es.twitchAge = -1;
        }

        // Natural blinking oscillator
        if (!dead) {
          es.blinkTimer -= safeExprDt;
          if (es.blinkTimer <= 0 && es.blinkAge < 0) {
            es.blinkAge = 0;
            es.blinkDuration = curMood === 'dazed' ? 0.22 : 0.135 + Math.random() * 0.03;
            const doubleChance = curMood === 'crying' || shocked ? 0.28 : 0.14;
            if (!es.doubleBlinkPending && Math.random() < doubleChance) {
              es.doubleBlinkPending = true;
              es.blinkTimer = 0.24;
            } else {
              es.doubleBlinkPending = false;
              const baseInterval =
                curMood === 'crying' ? 1.5 : curMood === 'dazed' ? 2.6 : 2.9;
              es.blinkTimer = baseInterval + Math.random() * 2.2;
            }
          }
        } else {
          es.blinkAge = -1;
        }

        let blinkAmount = 0;
        if (es.blinkAge >= 0) {
          es.blinkAge += safeExprDt;
          const bp = es.blinkAge / es.blinkDuration;
          if (bp >= 1) {
            es.blinkAge = -1;
          } else {
            // Asymmetric human blink: crisp close (0..0.38), smooth natural opening (0.38..1)
            blinkAmount =
              bp < 0.38
                ? Math.sin((bp / 0.38) * (Math.PI * 0.5))
                : Math.cos(((bp - 0.38) / 0.62) * (Math.PI * 0.5));
          }
        }

        // Micro-saccades & emotional eye behavior (crying darting, dazed rolling drift, shock tremor)
        es.saccadeTimer -= safeExprDt;
        if (es.saccadeTimer <= 0) {
          if (curMood === 'crying' || shocked) {
            es.saccadeX = (Math.random() - 0.5) * 1.4;
            es.saccadeY = -0.5 + (Math.random() - 0.5) * 0.9;
            es.saccadeTimer = 0.16 + Math.random() * 0.32;
          } else {
            es.saccadeX = (Math.random() - 0.5) * 0.45;
            es.saccadeY = (Math.random() - 0.5) * 0.3;
            es.saccadeTimer = 0.6 + Math.random() * 1.2;
          }
        }

        let targetGazeX = pointerNormRef.current.nx * 4.5 + es.saccadeX;
        let targetGazeY = pointerNormRef.current.ny * 3.5 + es.saccadeY;
        let targetPupilScale = 1;

        // Ambient micro-expressions for ALL characters (brow cock, aggressive sneer, suspicious narrow squint)
        if (!dead && curMood !== 'dazed' && f < 0.15) {
          es.microTimer -= safeExprDt;
          if (es.microTimer <= 0) {
            es.microKind =
              curMood === 'smug'
                ? Math.random() < 0.55
                  ? 1
                  : 2
                : curMood === 'angry'
                  ? Math.random() < 0.6
                    ? 2
                    : 3
                  : 0;
            es.microTimer = 2.0 + Math.random() * 2.2;
          }
          const targetMicro = es.microKind !== 0 && es.microTimer > 1.1 ? 1 : 0;
          es.microStrength += (targetMicro - es.microStrength) * (1 - Math.exp(-9 * safeExprDt));
        } else {
          es.microStrength *= Math.exp(-14 * safeExprDt);
        }
        const mStr = es.microStrength;

        // Expressive gaze & pupil dilation/constriction across moods + Trevor/Joker vocal psychosis
        if (blind) {
          targetGazeX = -0.6 + Math.sin(now * 0.0012) * 0.4;
          targetGazeY = -1.7 + Math.cos(now * 0.0015) * 0.3;
        } else if (curMood === 'dazed') {
          targetGazeX = Math.sin(now * 0.0023) * 3.6 + Math.cos(now * 0.0041) * 1.2;
          targetGazeY = -1.5 + Math.sin(now * 0.0032) * 1.4;
          targetPupilScale = 1.24 + Math.sin(now * 0.004) * 0.06;
        } else if (curMood === 'crying') {
          targetGazeX = pointerNormRef.current.nx * 3.2 + es.saccadeX;
          targetGazeY = pointerNormRef.current.ny * 2.2 - 0.6 + es.saccadeY;
          targetPupilScale = 0.84 + Math.sin(now * 0.008) * 0.05;
        } else if (curMood === 'angry') {
          const angerDepth = Math.min(1, Math.max(0, (0.85 - hpRatio) / 0.7));
          targetPupilScale = 0.9 - angerDepth * 0.1;
        }
        if (isTrevor && !dead && (speechActive || hpStagePhase === 'psychotic')) {
          if (speechPhase === 'psychotic') {
            // Pinpoint manic wide-eyed GTA V Trevor stare
            targetPupilScale = 0.68 + Math.sin(now * 0.042) * 0.07;
            targetGazeX += Math.sin(now * 0.06) * (0.4 + speechEnv * 0.65);
            targetGazeY += Math.cos(now * 0.048) * 0.35;
          } else if (speechPhase === 'aggressive') {
            targetPupilScale = 0.80;
            targetGazeX += Math.sin(now * 0.025) * speechEnv * 0.35;
          }
        } else if (isJoker && !dead && (speechActive || hpStagePhase === 'psychotic')) {
          if (speechPhase === 'psychotic') {
            targetPupilScale = 0.66 + Math.sin(now * 0.036) * 0.08;
            targetGazeX += Math.sin(now * 0.05) * (0.45 + speechEnv * 0.6);
          } else if (speechPhase === 'aggressive') {
            targetPupilScale = 0.82;
          }
        }
        if (shocked && !dead) {
          targetGazeX += Math.sin(now * 0.055) * 0.55;
          targetPupilScale = 1.26;
        }

        const gazeLerp = 1 - Math.exp(-(curMood === 'dazed' ? 6.5 : 18) * safeExprDt);
        es.gazeX += (targetGazeX - es.gazeX) * gazeLerp;
        es.gazeY += (targetGazeY - es.gazeY) * gazeLerp;
        es.pupilScale += (targetPupilScale - es.pupilScale) * (1 - Math.exp(-10 * safeExprDt));

        // Update 60fps iris & pupil transforms (with subtle concussed ocular divergence when dazed/near KO)
        const gx = es.gazeX;
        const gy = es.gazeY * 0.6;
        const concussedDrift =
          !dead && (curMood === 'dazed' || hpRatio < 0.18 || shocked)
            ? curMood === 'dazed'
              ? 1.35
              : 0.7
            : 0;
        if (leftIrisGroupRef.current) {
          leftIrisGroupRef.current.setAttribute(
            'transform',
            `translate(${(gx - concussedDrift).toFixed(2)}, ${(gy - concussedDrift * 0.35).toFixed(2)})`
          );
        }
        if (rightIrisGroupRef.current) {
          rightIrisGroupRef.current.setAttribute(
            'transform',
            `translate(${(gx + concussedDrift).toFixed(2)}, ${(gy + concussedDrift * 0.35).toFixed(2)})`
          );
        }
        if (cyberIrisGroupRef.current) {
          cyberIrisGroupRef.current.setAttribute(
            'transform',
            `translate(${(es.gazeX * 0.5).toFixed(2)}, ${(es.gazeY * 0.5).toFixed(2)})`
          );
        }
        if (cyclopsIrisGroupRef.current) {
          cyclopsIrisGroupRef.current.setAttribute(
            'transform',
            `translate(${(es.gazeX * 1.35).toFixed(2)}, ${(es.gazeY * 0.8).toFixed(2)})`
          );
        }
        const basePupilR = curMood === 'crying' ? 2.6 : 3.4;
        if (leftPupilRef.current) {
          leftPupilRef.current.setAttribute('r', (basePupilR * es.pupilScale).toFixed(2));
        }
        if (rightPupilRef.current) {
          rightPupilRef.current.setAttribute('r', (basePupilR * es.pupilScale).toFixed(2));
        }
        if (cyclopsPupilRef.current) {
          const cycPupilR = curMood === 'crying' ? 4.9 : 6.4;
          cyclopsPupilRef.current.setAttribute('r', (cycPupilR * es.pupilScale).toFixed(2));
        }

        // Compute target facial muscle pose (interpolated smoothly at 60fps)
        const angerProgress = curMood === 'angry' ? Math.min(1, Math.max(0, (0.85 - hpRatio) / 0.7)) : 0;
        const sobTremor =
          curMood === 'crying' && !dead
            ? Math.sin(now * 0.029) * 0.85 * Math.max(0.35, intensity) + breathWave * 0.9
            : 0;
        const breathLift = dead ? 0 : breathWave * (0.4 + exertion * 0.65);

        let tBrowLIn = 124;
        let tBrowLMid = 115;
        let tBrowLOut = 124;
        let tBrowRIn = 124;
        let tBrowRMid = 115;
        let tBrowROut = 124;

        let tLidL = 0.03;
        let tLidR = 0.03;
        let tSqL = 0.04;
        let tSqR = 0.04;
        let tEyeUpOpen = 14;
        let tEyeLowOpen = 11;
        let tTension = 0.12;
        let tNostrilFlare = 0;

        let tMLx = 132;
        let tMLy = 243;
        let tMRx = 194;
        let tMRy = 234;
        let tULMidY = 239;
        let tUInY = 242;
        let tLInY = 251;
        let tLOutY = 257;
        let tKoBlend = 0;

        let tHeadX = 0;
        let tHeadY = breathLift * 0.85;
        let tHeadTilt = 0;
        let tFlush = Math.max(0, exertion * 0.35);
        let tVein = 0;

        if (curMood === 'ko') {
          tBrowLIn = 122;
          tBrowLMid = 131;
          tBrowLOut = 126;
          tBrowRIn = 122;
          tBrowRMid = 131;
          tBrowROut = 126;
          tLidL = 1;
          tLidR = 1;
          tSqL = 0.35;
          tSqR = 0.35;
          tEyeUpOpen = 8;
          tEyeLowOpen = 7;
          tTension = 0.08;
          tMLx = 130;
          tMLy = 242;
          tMRx = 190;
          tMRy = 242;
          tULMidY = 233;
          tUInY = 236;
          tLInY = 263;
          tLOutY = 269;
          tKoBlend = 1;
          tHeadY = 4.5;
          tHeadTilt = 3.2;
          tFlush = 0.1;
        } else if (curMood === 'dazed') {
          tBrowLIn = 121;
          tBrowLMid = 120 + breathWave * 0.8;
          tBrowLOut = 126;
          tBrowRIn = 124;
          tBrowRMid = 122 - breathWave * 0.6;
          tBrowROut = 128;
          tLidL = 0.44 + Math.sin(now * 0.0021) * 0.09;
          tLidR = 0.54 + Math.cos(now * 0.0025) * 0.09;
          tSqL = 0.14;
          tSqR = 0.18;
          tEyeUpOpen = 13;
          tEyeLowOpen = 11;
          tTension = 0.24;
          tNostrilFlare = 0.25 + Math.max(0, breathWave) * 0.35;
          tMLx = 128;
          tMLy = 241;
          tMRx = 192;
          tMRy = 244;
          tULMidY = 230;
          tUInY = 235;
          tLInY = 259 + Math.max(0, breathWave) * 2.8;
          tLOutY = 265 + Math.max(0, breathWave) * 2.5;
          tHeadX = Math.sin(now * 0.0024) * 3.4;
          tHeadY = 2.0 + Math.cos(now * 0.0034) * 1.6;
          tHeadTilt = Math.sin(now * 0.0021) * 3.4;
          tFlush = 0.32;
        } else if (curMood === 'crying') {
          // Darwin grief brow (inner corner pulled up & furrowed) + trembling chin/lips + sobbing head bob
          tBrowLIn = 113 - intensity * 3.0 + sobTremor * 0.45;
          tBrowLMid = 124;
          tBrowLOut = 133;
          tBrowRIn = 113 - intensity * 3.0 + sobTremor * 0.45;
          tBrowRMid = 124;
          tBrowROut = 133;
          tLidL = 0.12 + intensity * 0.18;
          tLidR = 0.12 + intensity * 0.18;
          tSqL = 0.22 + intensity * 0.24;
          tSqR = 0.22 + intensity * 0.24;
          tEyeUpOpen = 16;
          tEyeLowOpen = 13;
          tTension = 0.48;
          tNostrilFlare = 0.48 + Math.max(0, breathWave) * 0.45;
          tMLx = 123;
          tMLy = 248 + sobTremor * 0.55;
          tMRx = 197;
          tMRy = 248 + sobTremor * 0.55;
          tULMidY = 229 + sobTremor * 0.4;
          tUInY = 237;
          tLInY = 261 + sobTremor * 1.5;
          tLOutY = 267 + sobTremor * 1.3;
          tHeadY = 1.6 + breathWave * 1.3 + Math.sin(now * 0.025) * 0.5 * intensity;
          tHeadTilt = Math.sin(now * 0.004) * 1.8;
          tFlush = 0.55 + intensity * 0.25;
          tVein = intensity * 0.35;
        } else if (curMood === 'angry') {
          tBrowLIn = 132 + angerProgress * 4.5;
          tBrowLMid = 123 - breathLift * 0.4 + angerProgress * 2.0;
          tBrowLOut = 117 - angerProgress * 2.0;
          tBrowRIn = 132 + angerProgress * 4.5;
          tBrowRMid = 123 - breathLift * 0.4 + angerProgress * 2.0;
          tBrowROut = 117 - angerProgress * 2.0;
          tLidL = 0.14 + angerProgress * 0.07;
          tLidR = 0.14 + angerProgress * 0.07;
          tSqL = 0.24 + angerProgress * 0.12;
          tSqR = 0.24 + angerProgress * 0.12;
          tEyeUpOpen = 11.5 - angerProgress * 1.0;
          tEyeLowOpen = 9.5;
          tTension = 0.42 + angerProgress * 0.28;
          tNostrilFlare = 0.4 + angerProgress * 0.3 + Math.max(0, breathWave) * 0.3;
          tMLx = 124;
          tMLy = 239 + angerProgress * 1.5;
          tMRx = 196;
          tMRy = 238 - angerProgress * 1.5; // Subtle angry sneer asymmetry
          tULMidY = 230 - angerProgress * 2.0;
          tUInY = 235 - angerProgress * 1.5;
          tLInY = 256 + angerProgress * 2.5 + Math.max(0, breathWave) * 1.6;
          tLOutY = 262 + angerProgress * 2.5 + Math.max(0, breathWave) * 1.3;
          tFlush = 0.38 + angerProgress * 0.42;
          tVein = 0.25 + angerProgress * 0.55;
          if (angerProgress > 0.5) {
            tHeadX = Math.sin(now * 0.032) * (angerProgress - 0.5) * 1.2;
          }
        } else {
          // 'smug': confident asymmetrical brow cock & half-smirk + subtle breathing
          tBrowLIn = 124;
          tBrowLMid = 116 - breathLift * 0.35;
          tBrowLOut = 124;
          tBrowRIn = 122;
          tBrowRMid = 111 - breathLift * 0.45;
          tBrowROut = 120;
          tLidL = 0.06;
          tLidR = 0.1; // Subtle confident squint
          tSqL = 0.08;
          tSqR = 0.13;
          tEyeUpOpen = 14;
          tEyeLowOpen = 11;
          tTension = 0.16;
          tNostrilFlare = Math.max(0, breathWave) * 0.16;
          tMLx = 131;
          tMLy = 243;
          tMRx = 197;
          tMRy = 233 - breathLift * 0.35;
          tULMidY = 239;
          tUInY = 242;
          tLInY = 251 + Math.max(0, breathWave) * 0.8;
          tLOutY = 257 + Math.max(0, breathWave) * 0.7;
          tHeadTilt = -0.8 + Math.sin(now * 0.0014) * 0.7;
        }

        // Apply ambient micro-expressions smoothly for ALL non-KO characters
        if (!dead && mStr > 0.02) {
          if (es.microKind === 1) {
            // Cocky right brow arch + wider smirk
            tBrowRMid -= 5.2 * mStr;
            tBrowROut -= 2.5 * mStr;
            tMRy -= 2.8 * mStr;
            tMRx += 2.2 * mStr;
          } else if (es.microKind === 2) {
            // Aggressive sneer / upper lip curl + nostril flare
            tMRy -= 3.4 * mStr;
            tULMidY -= 2.6 * mStr;
            tUInY -= 2.2 * mStr;
            tNostrilFlare = Math.max(tNostrilFlare, 0.55 * mStr);
            tBrowLIn += 2.5 * mStr;
          } else if (es.microKind === 3) {
            // Suspicious fierce squint glare
            tSqL = Math.max(tSqL, 0.32 * mStr);
            tSqR = Math.max(tSqR, 0.32 * mStr);
            tLidL = Math.max(tLidL, 0.24 * mStr);
            tLidR = Math.max(tLidR, 0.24 * mStr);
            tBrowLIn += 3.5 * mStr;
            tBrowRIn += 3.5 * mStr;
          }
        }

        // Apply ragged pain gasping & quivering lower-lip tremble under heavy damage / broken nose / shock
        if (!dead && curMood !== 'ko' && (hpRatio < 0.48 || trCur.noseBroken || shocked || intensity > 0.35)) {
          const gaspFactor = Math.min(1, Math.max(0, (0.52 - hpRatio) * 1.5) + (trCur.noseBroken ? 0.35 : 0) + (shocked ? 0.4 : 0));
          const inhale = Math.max(0, breathWave);
          const lipQuiver = Math.sin(now * 0.044) * gaspFactor * 0.95;
          tLInY += inhale * gaspFactor * 4.2 + lipQuiver;
          tLOutY += inhale * gaspFactor * 3.8 + lipQuiver * 0.85;
          tNostrilFlare = Math.max(tNostrilFlare, 0.35 + inhale * gaspFactor * 0.55);
        }

        // Layer zone-specific impact flinch reflex onto current expression (never snaps!)
        if (f > 0.01 && !dead) {
          const z = es.flinchZone;
          const isLeftEyeHit = z === 'leftEye';
          const isRightEyeHit = z === 'rightEye';
          const isNoseHit = z === 'nose';
          const isJawOrMouthHit = z === 'jaw' || z === 'mouth';
          const isForeheadHit = z === 'forehead';
          const isEarHit = z === 'leftEar' || z === 'rightEar';

          const leftBias = isLeftEyeHit
            ? 1.35
            : isRightEyeHit
              ? 0.65
              : es.flinchSide > 0.15
                ? 1.12
                : es.flinchSide < -0.15
                  ? 0.58
                  : 1.0;
          const rightBias = isRightEyeHit
            ? 1.35
            : isLeftEyeHit
              ? 0.65
              : es.flinchSide < -0.15
                ? 1.12
                : es.flinchSide > 0.15
                  ? 0.58
                  : 1.0;

          tBrowLIn += (isNoseHit ? 9 : 6) * f;
          tBrowLMid += (isForeheadHit || isLeftEyeHit ? 11 : 8) * f * Math.min(1.2, leftBias);
          tBrowLOut -= 2 * f;
          tBrowRIn += (isNoseHit ? 9 : 6) * f;
          tBrowRMid += (isForeheadHit || isRightEyeHit ? 11 : 8) * f * Math.min(1.2, rightBias);
          tBrowROut -= 2 * f;

          tLidL = Math.max(tLidL, Math.min(0.99, (isLeftEyeHit ? 1.15 : 0.96) * f * leftBias));
          tLidR = Math.max(tLidR, Math.min(0.99, (isRightEyeHit ? 1.15 : 0.96) * f * rightBias));
          tSqL = Math.max(tSqL, (isLeftEyeHit ? 0.9 : isNoseHit ? 0.78 : 0.65) * f * Math.min(1.2, leftBias));
          tSqR = Math.max(tSqR, (isRightEyeHit ? 0.9 : isNoseHit ? 0.78 : 0.65) * f * Math.min(1.2, rightBias));
          tTension = Math.max(tTension, (isNoseHit || isJawOrMouthHit ? 0.72 : 0.55) * f);
          tNostrilFlare = Math.max(tNostrilFlare, (isNoseHit ? 0.98 : 0.8) * f);

          const jawShift = es.flinchSide * (isJawOrMouthHit ? 6.8 : 3.5) * f;
          tMLx = tMLx * (1 - f) + (120 + jawShift) * f;
          tMRx = tMRx * (1 - f) + (200 + jawShift) * f;
          tMLy = tMLy * (1 - f) + (236 + es.flinchSide * (isJawOrMouthHit ? 3.2 : 1.5)) * f;
          tMRy = tMRy * (1 - f) + (236 - es.flinchSide * (isJawOrMouthHit ? 3.2 : 1.5)) * f;
          tULMidY = tULMidY * (1 - f) + (isNoseHit ? 221 : 224) * f;
          tUInY = tUInY * (1 - f) + (isNoseHit ? 228 : 230) * f;
          tLInY = tLInY * (1 - f) + (isJawOrMouthHit ? 270 : 265) * f;
          tLOutY = tLOutY * (1 - f) + (isJawOrMouthHit ? 276 : 271) * f;

          if (isForeheadHit) {
            tHeadY += 5.2 * f;
          } else if (isEarHit) {
            const earDir = z === 'leftEar' ? 1 : -1;
            tHeadTilt += earDir * 9.5 * f;
            tHeadX += earDir * 4.2 * f;
          }
        }

        if (isJoker) {
          const fallbackCackle = !dead
            ? Math.max(0, Math.sin(now * 0.026)) * (0.34 * f)
            : 0;
          const laughOpen = !dead ? Math.min(1.3, Math.max(speechEnv * 1.3, fallbackCackle)) : 0;
          const laughTilt = !dead ? es.flinchSide * 2.2 * f : 0;
          const widen = f * 3.5 + laughOpen * 4.8;
          tMLx = 111 - widen + laughTilt * 0.6;
          tMRx = 209 + widen + laughTilt * 0.6;
          tMLy = 224 - f * 2.5 - laughOpen * 2.2 + laughTilt * 0.8;
          tMRy = 224 - f * 2.5 - laughOpen * 2.2 - laughTilt * 0.8;
          tULMidY = 236 - f * 1.6 - laughOpen * 3.6;
          tUInY = 240 - f * 1.2 - laughOpen * 3.1;
          tLInY = 254 + f * 5.8 + laughOpen * 14.5 + (dead ? 2.5 : 0);
          tLOutY = 262 + f * 6.0 + laughOpen * 15.0 + (dead ? 2.5 : 0);
          if (!dead) {
            if (speechPhase === 'psychotic') {
              // Unhinged psychotic cackle: stretched wide eyes, sky-high arched brows, shaking head, pulsing veins
              tBrowLIn = 123 + laughOpen * 3.0;
              tBrowLMid = 104 - laughOpen * 4.2;
              tBrowLOut = 115 - laughOpen * 2.0;
              tBrowRIn = 123 + laughOpen * 3.0;
              tBrowRMid = 104 - laughOpen * 4.2;
              tBrowROut = 115 - laughOpen * 2.0;
              tEyeUpOpen = 19.0;
              tEyeLowOpen = 14.5;
              tSqL = Math.max(tSqL, 0.28 + laughOpen * 0.25);
              tSqR = Math.max(tSqR, 0.28 + laughOpen * 0.25);
              tTension = Math.max(tTension, 0.78 + laughOpen * 0.25);
              tVein = Math.max(tVein, 0.65 + laughOpen * 0.35);
              tFlush = Math.max(tFlush, 0.35 + laughOpen * 0.35);
              tHeadY += Math.sin(now * 0.032) * laughOpen * 3.2 - laughOpen * 1.5;
              tHeadX += Math.cos(now * 0.021) * laughOpen * 2.1;
              tHeadTilt += Math.sin(now * 0.017) * (1.8 + laughOpen * 3.6);
            } else if (speechPhase === 'aggressive') {
              tBrowLIn = 130 + f * 3.5 + laughOpen * 2.5;
              tBrowLMid = 108 - f * 2.5 - laughOpen * 3.0;
              tBrowLOut = 116 - f * 2.0;
              tBrowRIn = 130 + f * 3.5 + laughOpen * 2.5;
              tBrowRMid = 108 - f * 2.5 - laughOpen * 3.0;
              tBrowROut = 116 - f * 2.0;
              tEyeUpOpen = 17.2;
              tEyeLowOpen = 13.0;
              tSqL = Math.max(tSqL, 0.2 + laughOpen * 0.2);
              tSqR = Math.max(tSqR, 0.2 + laughOpen * 0.2);
              tTension = Math.max(tTension, 0.64 + laughOpen * 0.25);
              tVein = Math.max(tVein, 0.35 + laughOpen * 0.3);
              tHeadY += Math.sin(now * 0.026) * laughOpen * 2.0;
              tHeadTilt += Math.sin(now * 0.012) * (1.2 + laughOpen * 2.2);
            } else {
              // Cool mocking cocky cackle
              tBrowLIn = 127 + f * 4;
              tBrowLMid = 110 - f * 3 - laughOpen * 2.2;
              tBrowLOut = 118 - f * 2;
              tBrowRIn = 127 + f * 4;
              tBrowRMid = 110 - f * 3 - laughOpen * 2.2;
              tBrowROut = 118 - f * 2;
              tLidL = Math.max(tLidL, 0.18 + laughOpen * 0.08);
              tLidR = Math.max(tLidR, 0.22 + laughOpen * 0.08);
              tSqL = Math.max(tSqL, 0.22 + laughOpen * 0.16);
              tSqR = Math.max(tSqR, 0.22 + laughOpen * 0.16);
              tTension = Math.max(tTension, 0.58 + Math.max(f, laughOpen * 0.55) * 0.25);
              tEyeUpOpen = Math.max(tEyeUpOpen, 15.5);
              tEyeLowOpen = Math.max(tEyeLowOpen, 12.0);
              tHeadTilt += -1.5 + Math.sin(now * 0.018) * laughOpen * 1.8;
            }
          }
        } else if ((isTrevor || isMiniBossSpeaker) && !dead) {
          // Trevor baseline unhinged intensity scales as HP drops
          if (isTrevor && hpStagePhase === 'psychotic') {
            tEyeUpOpen = Math.max(tEyeUpOpen, 18.2);
            tEyeLowOpen = Math.max(tEyeLowOpen, 13.8);
            tVein = Math.max(tVein, 0.72);
            tFlush = Math.max(tFlush, 0.58);
          }

          if (speechActive || speechEnv > 0.015) {
            // Multi-harmonic speech articulation: consonant snap + vowel rounding/widening + asymmetric GTA V snarl
            const vowelWave = Math.sin(now * 0.023);
            const roundWave = Math.cos(now * 0.016);
            const snarlSide = Math.sin(now * 0.0085);
            const syllOpen = Math.max(speechEnv, speechActive ? 0.14 : 0);

            const roundFactor = roundWave * syllOpen * 3.8;
            const snarlLift = Math.max(0, snarlSide) * syllOpen * 3.2;

            tMLx -= syllOpen * 3.4 - roundFactor;
            tMRx += syllOpen * 3.4 - roundFactor;
            tMLy -= snarlLift * 0.7;
            tMRy -= (1 - Math.max(0, snarlSide)) * syllOpen * 2.8;
            tULMidY -= syllOpen * 4.8 + snarlLift * 0.8;
            tUInY -= syllOpen * 4.2 + snarlLift * 0.6;
            tLInY += syllOpen * 13.8 + Math.max(0, vowelWave) * syllOpen * 3.2;
            tLOutY += syllOpen * 13.2 + Math.max(0, vowelWave) * syllOpen * 2.8;
            tNostrilFlare = Math.max(tNostrilFlare, 0.35 + syllOpen * 0.65);
            tTension = Math.max(tTension, 0.48 + syllOpen * 0.52);

            if (speechPhase === 'psychotic') {
              // FULL MELTDOWN: bulging crazy eyes, sky-high outer/furrowed inner brows, throbbing veins, wild head shake
              tBrowLIn = 135 + syllOpen * 5.0;
              tBrowLMid = 110 - syllOpen * 4.5;
              tBrowLOut = 109 - syllOpen * 3.0;
              tBrowRIn = 135 + syllOpen * 5.0;
              tBrowRMid = 110 - syllOpen * 4.5;
              tBrowROut = 109 - syllOpen * 3.0;
              tEyeUpOpen = 19.8;
              tEyeLowOpen = 15.0;
              tLidL = 0;
              tLidR = 0;
              tSqL = Math.max(tSqL, 0.16 + syllOpen * 0.22);
              tSqR = Math.max(tSqR, 0.16 + syllOpen * 0.22);
              tVein = Math.max(tVein, 0.82 + syllOpen * 0.18);
              tFlush = Math.max(tFlush, 0.72 + syllOpen * 0.28);
              tHeadX += Math.sin(now * 0.036) * (1.2 + syllOpen * 3.2);
              tHeadY += Math.cos(now * 0.028) * (0.8 + syllOpen * 2.4);
              tHeadTilt += Math.sin(now * 0.021) * (1.6 + syllOpen * 4.2);
            } else if (speechPhase === 'aggressive') {
              // FURIOUS THREATENING SNARL: slammed heavy eyebrows, glaring squint, pulsing veins, forward head jabs
              tBrowLIn = 136 + syllOpen * 4.8;
              tBrowLMid = 123 + syllOpen * 2.2;
              tBrowLOut = 115 - syllOpen * 1.5;
              tBrowRIn = 136 + syllOpen * 4.8;
              tBrowRMid = 123 + syllOpen * 2.2;
              tBrowROut = 115 - syllOpen * 1.5;
              tLidL = Math.max(tLidL, 0.16 + syllOpen * 0.08);
              tLidR = Math.max(tLidR, 0.18 + syllOpen * 0.08);
              tSqL = Math.max(tSqL, 0.26 + syllOpen * 0.18);
              tSqR = Math.max(tSqR, 0.26 + syllOpen * 0.18);
              tEyeUpOpen = 12.2;
              tVein = Math.max(tVein, 0.45 + syllOpen * 0.45);
              tFlush = Math.max(tFlush, 0.48 + syllOpen * 0.32);
              tHeadY += Math.sin(now * 0.02) * syllOpen * 2.6;
              tHeadTilt += Math.sin(now * 0.011) * (1.0 + syllOpen * 2.2);
            } else {
              // COCKY TAUNTING: expressive brow dance (right eyebrow arches high), sarcastic squint, smug head tilt
              const browSwitch = Math.sin(now * 0.007) > 0 ? 1 : -1;
              if (browSwitch > 0) {
                tBrowRMid -= 5.0 + syllOpen * 5.2;
                tBrowROut -= 2.5 + syllOpen * 2.5;
                tBrowLIn += 2.5 + syllOpen * 2.5;
                tLidL = Math.max(tLidL, 0.16);
              } else {
                tBrowLMid -= 5.0 + syllOpen * 5.2;
                tBrowLOut -= 2.5 + syllOpen * 2.5;
                tBrowRIn += 2.5 + syllOpen * 2.5;
                tLidR = Math.max(tLidR, 0.16);
              }
              tSqL = Math.max(tSqL, 0.14 + syllOpen * 0.12);
              tSqR = Math.max(tSqR, 0.14 + syllOpen * 0.12);
              tHeadTilt += browSwitch * (1.8 + syllOpen * 2.4);
              tHeadY += Math.sin(now * 0.016) * syllOpen * 1.6;
            }
          }
        }

        // Layer natural periodic blink & subtle pain eyelid flutter cleanly on top of eyelid closure
        tLidL = Math.min(1, Math.max(tLidL, blinkAmount, painTwitchL));
        tLidR = Math.min(1, Math.max(tLidR, blinkAmount, painTwitchR));

        // Smoothly damp facial muscles & expressive head acting at 60fps
        const muscleLerp = 1 - Math.exp(-(f > 0.25 ? 28 : 14.5) * safeExprDt);
        const lidLerp = 1 - Math.exp(-(blinkAmount > 0.05 || f > 0.2 ? 36 : 17) * safeExprDt);
        const headExprLerp = 1 - Math.exp(-11 * safeExprDt);

        es.headOffsetX += (tHeadX - es.headOffsetX) * headExprLerp;
        es.headOffsetY += (tHeadY - es.headOffsetY) * headExprLerp;
        es.headTiltDeg += (tHeadTilt - es.headTiltDeg) * headExprLerp;
        es.flush += (tFlush - es.flush) * (1 - Math.exp(-5 * safeExprDt));
        es.veinPulse += (tVein - es.veinPulse) * (1 - Math.exp(-7 * safeExprDt));

        es.browLInnerY += (tBrowLIn - es.browLInnerY) * muscleLerp;
        es.browLMidY += (tBrowLMid - es.browLMidY) * muscleLerp;
        es.browLOuterY += (tBrowLOut - es.browLOuterY) * muscleLerp;
        es.browRInnerY += (tBrowRIn - es.browRInnerY) * muscleLerp;
        es.browRMidY += (tBrowRMid - es.browRMidY) * muscleLerp;
        es.browROuterY += (tBrowROut - es.browROuterY) * muscleLerp;

        es.leftLidClose += (tLidL - es.leftLidClose) * lidLerp;
        es.rightLidClose += (tLidR - es.rightLidClose) * lidLerp;
        es.leftSquintBottom += (tSqL - es.leftSquintBottom) * lidLerp;
        es.rightSquintBottom += (tSqR - es.rightSquintBottom) * lidLerp;
        es.eyeUpperOpen += (tEyeUpOpen - es.eyeUpperOpen) * muscleLerp;
        es.eyeLowerOpen += (tEyeLowOpen - es.eyeLowerOpen) * muscleLerp;
        es.tension += (tTension - es.tension) * muscleLerp;
        es.nostrilFlare += (tNostrilFlare - es.nostrilFlare) * muscleLerp;

        es.mouthLeftX += (tMLx - es.mouthLeftX) * muscleLerp;
        es.mouthLeftY += (tMLy - es.mouthLeftY) * muscleLerp;
        es.mouthRightX += (tMRx - es.mouthRightX) * muscleLerp;
        es.mouthRightY += (tMRy - es.mouthRightY) * muscleLerp;
        es.upperLipMidY += (tULMidY - es.upperLipMidY) * muscleLerp;
        es.upperInnerY += (tUInY - es.upperInnerY) * muscleLerp;
        es.lowerInnerY += (tLInY - es.lowerInnerY) * muscleLerp;
        es.lowerOuterY += (tLOutY - es.lowerOuterY) * muscleLerp;
        es.koBlend += (tKoBlend - es.koBlend) * (1 - Math.exp(-10 * safeExprDt));

        // Apply nasolabial folds, forehead/glabella wrinkles, pulsing rage veins & vascular flush
        const foldW = (2.0 + es.tension * 2.6).toFixed(2);
        const foldOp = (0.2 + es.tension * 0.38).toFixed(2);
        if (nasolabialLRef.current) {
          nasolabialLRef.current.setAttribute('stroke-width', foldW);
          nasolabialLRef.current.style.opacity = foldOp;
        }
        if (nasolabialRRef.current) {
          nasolabialRRef.current.setAttribute('stroke-width', foldW);
          nasolabialRRef.current.style.opacity = foldOp;
        }
        if (foreheadWrinklesRef.current) {
          foreheadWrinklesRef.current.style.opacity = (0.1 + es.tension * 0.65).toFixed(2);
        }
        if (glabellaLinesRef.current) {
          glabellaLinesRef.current.style.opacity = Math.max(0, (es.tension - 0.14) * 1.2).toFixed(2);
        }
        if (rageVeinsRef.current) {
          const throb = 0.78 + 0.22 * Math.sin(now * 0.016);
          rageVeinsRef.current.style.opacity = Math.min(0.88, es.veinPulse * throb).toFixed(2);
        }
        if (angryCheekFlushRef.current) {
          angryCheekFlushRef.current.style.opacity = isJoker
            ? '0'
            : Math.min(0.42, es.flush * 0.38).toFixed(2);
        }

        // Apply smooth Eyebrows
        if (isCyclops) {
          const cycMid = ((es.browLInnerY + es.browRInnerY) * 0.5).toFixed(2);
          const cycL = es.browLOuterY.toFixed(2);
          const cycR = es.browROuterY.toFixed(2);
          const cycD = `M108,${cycL} Q160,${cycMid} 212,${cycR}`;
          if (cyclopsBrowShadowRef.current) cyclopsBrowShadowRef.current.setAttribute('d', cycD);
          if (cyclopsBrowMainRef.current) cyclopsBrowMainRef.current.setAttribute('d', cycD);
          if (cyclopsBrowHairsRef.current) {
            const mY = Number(cycMid);
            const lY = Number(cycL);
            const rY = Number(cycR);
            const y25 = 0.5625 * lY + 0.375 * mY + 0.0625 * rY;
            const y50 = 0.25 * lY + 0.5 * mY + 0.25 * rY;
            const y75 = 0.0625 * lY + 0.375 * mY + 0.5625 * rY;
            cyclopsBrowHairsRef.current.setAttribute(
              'd',
              `M114,${(lY - 1).toFixed(1)} L122,${(lY + 3).toFixed(1)} M132,${(y25 - 2).toFixed(1)} L140,${(y25 + 2).toFixed(1)} M152,${(y50 - 2).toFixed(1)} L157,${(y50 + 3).toFixed(1)} M168,${(y50 - 2).toFixed(1)} L163,${(y50 + 3).toFixed(1)} M188,${(y75 - 2).toFixed(1)} L180,${(y75 + 2).toFixed(1)} M206,${(rY - 1).toFixed(1)} L198,${(rY + 3).toFixed(1)}`
            );
          }

          // Cyclops smooth eye aperture & eyelid curtain
          const cycClose = Math.max(es.leftLidClose, es.rightLidClose);
          const cycSq = Math.max(es.leftSquintBottom, es.rightSquintBottom);
          const cycUpCy = 141 - es.eyeUpperOpen * 1.95;
          const cycLowCy = 141 + es.eyeLowerOpen * 2.25;
          const cycAperture = `M121,141 Q160,${cycUpCy.toFixed(1)} 199,141 Q160,${cycLowCy.toFixed(1)} 121,141 Z`;
          if (cyclopsEyeClipPathRef.current) cyclopsEyeClipPathRef.current.setAttribute('d', cycAperture);
          if (cyclopsEyeOutlineRef.current) cyclopsEyeOutlineRef.current.setAttribute('d', cycAperture);

          const openTopPeak = 141 - es.eyeUpperOpen * 0.98;
          const openBotTrough = 141 + es.eyeLowerOpen * 1.12;
          const meetY = openTopPeak * 0.35 + openBotTrough * 0.65;
          const lidMidY = openTopPeak + (meetY - openTopPeak) * cycClose;
          const lidControlY = lidMidY * 2 - 141;
          const lowMidY = openBotTrough - (openBotTrough - meetY) * cycSq * 0.55;
          const lowControlY = lowMidY * 2 - 141;

          if (cyclopsUpperLidCurtainRef.current) {
            cyclopsUpperLidCurtainRef.current.setAttribute(
              'd',
              `M116,110 L204,110 L204,142 Q160,${lidControlY.toFixed(1)} 116,142 Z`
            );
          }
          if (cyclopsLowerLidCurtainRef.current) {
            cyclopsLowerLidCurtainRef.current.setAttribute(
              'd',
              `M116,172 L204,172 L204,141 Q160,${lowControlY.toFixed(1)} 116,141 Z`
            );
          }
          if (cyclopsUpperLashRef.current) {
            cyclopsUpperLashRef.current.setAttribute(
              'd',
              `M120,141 Q160,${lidControlY.toFixed(1)} 200,141`
            );
          }
          if (cyclopsLidCreaseRef.current) {
            cyclopsLidCreaseRef.current.setAttribute(
              'd',
              `M124,136 Q160,${(lidControlY - 6.5).toFixed(1)} 196,136`
            );
          }
        } else {
          const lOut = es.browLOuterY;
          const lMid = es.browLMidY;
          const lIn = es.browLInnerY;
          const leftBrowD = `M89,${lOut.toFixed(1)} Q114,${lMid.toFixed(1)} 138,${lIn.toFixed(1)}`;
          if (leftBrowShadowRef.current) leftBrowShadowRef.current.setAttribute('d', leftBrowD);
          if (leftBrowMainRef.current) leftBrowMainRef.current.setAttribute('d', leftBrowD);
          if (leftBrowHairsRef.current) {
            const p1 = 0.5625 * lOut + 0.375 * lMid + 0.0625 * lIn;
            const p2 = 0.25 * lOut + 0.5 * lMid + 0.25 * lIn;
            const p3 = 0.0625 * lOut + 0.375 * lMid + 0.5625 * lIn;
            leftBrowHairsRef.current.setAttribute(
              'd',
              `M92,${lOut.toFixed(1)} L100,${(p1 - 2.2).toFixed(1)} M104,${(p1 + 0.4).toFixed(1)} L113,${(p2 - 2.0).toFixed(1)} M117,${(p2 + 0.4).toFixed(1)} L126,${(p3 - 1.5).toFixed(1)} M129,${(p3 + 0.5).toFixed(1)} L137,${lIn.toFixed(1)}`
            );
          }

          const rOut = es.browROuterY;
          const rMid = es.browRMidY;
          const rIn = es.browRInnerY;
          const rightBrowD = `M231,${rOut.toFixed(1)} Q206,${rMid.toFixed(1)} 182,${rIn.toFixed(1)}`;
          if (rightBrowShadowRef.current) rightBrowShadowRef.current.setAttribute('d', rightBrowD);
          if (rightBrowMainRef.current) rightBrowMainRef.current.setAttribute('d', rightBrowD);
          if (rightBrowHairsRef.current) {
            const p1 = 0.5625 * rOut + 0.375 * rMid + 0.0625 * rIn;
            const p2 = 0.25 * rOut + 0.5 * rMid + 0.25 * rIn;
            const p3 = 0.0625 * rOut + 0.375 * rMid + 0.5625 * rIn;
            rightBrowHairsRef.current.setAttribute(
              'd',
              `M228,${rOut.toFixed(1)} L220,${(p1 - 2.2).toFixed(1)} M216,${(p1 + 0.4).toFixed(1)} L207,${(p2 - 2.0).toFixed(1)} M203,${(p2 + 0.4).toFixed(1)} L194,${(p3 - 1.5).toFixed(1)} M191,${(p3 + 0.5).toFixed(1)} L183,${rIn.toFixed(1)}`
            );
          }

          // Smooth anatomical Dual Eyes + Eyelids + Lashes + Creases
          const eyeUpCy = 149 - es.eyeUpperOpen;
          const eyeLowCy = 149 + es.eyeLowerOpen;
          const leftAperture = `M97,149 Q116,${eyeUpCy.toFixed(1)} 133,150 Q116,${eyeLowCy.toFixed(1)} 97,149 Z`;
          const rightAperture = `M187,150 Q204,${eyeUpCy.toFixed(1)} 223,149 Q204,${eyeLowCy.toFixed(1)} 187,150 Z`;

          if (leftEyeClipPathRef.current) leftEyeClipPathRef.current.setAttribute('d', leftAperture);
          if (leftEyeOutlineRef.current) leftEyeOutlineRef.current.setAttribute('d', leftAperture);
          if (rightEyeClipPathRef.current) rightEyeClipPathRef.current.setAttribute('d', rightAperture);
          if (rightEyeOutlineRef.current) rightEyeOutlineRef.current.setAttribute('d', rightAperture);

          const openPeakY = 149.5 - es.eyeUpperOpen * 0.5;
          const openBotY = 149.5 + es.eyeLowerOpen * 0.5;
          const lidMeetY = openPeakY * 0.32 + openBotY * 0.68;

          // Left eyelid curtains & lashes
          if (!leftEyeSwollenRef.current) {
            const lMidLidY = openPeakY + (lidMeetY - openPeakY) * es.leftLidClose;
            const lCtrlY = lMidLidY * 2 - 149.5;
            const lLowMidY = openBotY - (openBotY - lidMeetY) * es.leftSquintBottom * 0.58;
            const lLowCtrlY = lLowMidY * 2 - 149.5;

            if (leftUpperLidCurtainRef.current) {
              leftUpperLidCurtainRef.current.setAttribute(
                'd',
                `M94,126 L136,126 L136,150 Q116,${lCtrlY.toFixed(1)} 94,149 Z`
              );
            }
            if (leftLowerLidCurtainRef.current) {
              leftLowerLidCurtainRef.current.setAttribute(
                'd',
                `M94,168 L136,168 L136,150 Q116,${lLowCtrlY.toFixed(1)} 94,149 Z`
              );
            }
            if (leftUpperLashRef.current) {
              leftUpperLashRef.current.setAttribute(
                'd',
                `M96,149 Q116,${lCtrlY.toFixed(1)} 134,150`
              );
            }
            if (leftLidCreaseRef.current) {
              leftLidCreaseRef.current.setAttribute(
                'd',
                `M97,140 Q116,${(lCtrlY - 5.5).toFixed(1)} 133,142`
              );
            }
          }

          // Right eyelid curtains & lashes
          if (!rightEyeSwollenRef.current) {
            const rMidLidY = openPeakY + (lidMeetY - openPeakY) * es.rightLidClose;
            const rCtrlY = rMidLidY * 2 - 149.5;
            const rLowMidY = openBotY - (openBotY - lidMeetY) * es.rightSquintBottom * 0.58;
            const rLowCtrlY = rLowMidY * 2 - 149.5;

            if (rightUpperLidCurtainRef.current) {
              rightUpperLidCurtainRef.current.setAttribute(
                'd',
                `M184,126 L226,126 L226,149 Q204,${rCtrlY.toFixed(1)} 184,150 Z`
              );
            }
            if (rightLowerLidCurtainRef.current) {
              rightLowerLidCurtainRef.current.setAttribute(
                'd',
                `M184,168 L226,168 L226,149 Q204,${rLowCtrlY.toFixed(1)} 184,150 Z`
              );
            }
            if (rightUpperLashRef.current) {
              rightUpperLashRef.current.setAttribute(
                'd',
                `M186,150 Q204,${rCtrlY.toFixed(1)} 224,149`
              );
            }
            if (rightLidCreaseRef.current) {
              rightLidCreaseRef.current.setAttribute(
                'd',
                `M187,142 Q204,${(rCtrlY - 5.5).toFixed(1)} 223,140`
              );
            }
          }
        }

        // Apply subtle nostril flare with breathing & tension
        const nRx = isCyclops ? 5.2 + es.nostrilFlare * 0.85 : 3.8 + es.nostrilFlare * 0.65;
        const nRy = isCyclops ? 2.8 + es.nostrilFlare * 0.55 : 2.1 + es.nostrilFlare * 0.45;
        if (leftNostrilRef.current) {
          leftNostrilRef.current.setAttribute('rx', nRx.toFixed(2));
          leftNostrilRef.current.setAttribute('ry', nRy.toFixed(2));
        }
        if (rightNostrilRef.current) {
          rightNostrilRef.current.setAttribute('rx', nRx.toFixed(2));
          rightNostrilRef.current.setAttribute('ry', nRy.toFixed(2));
        }

        // Apply smoothly morphed mouth, Cupid's bow lips, cavity clip & jaw/teeth tracking
        const lx = es.mouthLeftX;
        const ly = es.mouthLeftY;
        const rx = es.mouthRightX;
        const ry = es.mouthRightY;
        const ulMid = es.upperLipMidY;
        const uIn = es.upperInnerY;
        const lIn = es.lowerInnerY;
        const lOut = es.lowerOuterY;

        const cavityD = isJoker
          ? `M${(lx + 1).toFixed(1)},${ly.toFixed(1)} Q160,${(uIn + 9).toFixed(1)} ${(rx - 1).toFixed(1)},${ry.toFixed(1)} Q${(rx - 8).toFixed(1)},${(lIn + 2).toFixed(1)} 160,${(lIn + 2).toFixed(1)} Q${(lx + 8).toFixed(1)},${(lIn + 2).toFixed(1)} ${(lx + 1).toFixed(1)},${ly.toFixed(1)} Z`
          : `M${(lx + 2).toFixed(1)},${ly.toFixed(1)} Q160,${(uIn - 3).toFixed(1)} ${(rx - 2).toFixed(1)},${ry.toFixed(1)} Q${(rx - 5).toFixed(1)},${(lIn + 2).toFixed(1)} 160,${(lIn + 2).toFixed(1)} Q${(lx + 5).toFixed(1)},${(lIn + 2).toFixed(1)} ${(lx + 2).toFixed(1)},${ly.toFixed(1)} Z`;
        if (mouthClipPathRef.current) mouthClipPathRef.current.setAttribute('d', cavityD);
        if (mouthCavityPathRef.current) mouthCavityPathRef.current.setAttribute('d', cavityD);

        if (upperLipPathRef.current) {
          const midL = (lx + 160) * 0.5;
          const midR = (160 + rx) * 0.5;
          upperLipPathRef.current.setAttribute(
            'd',
            isJoker
              ? `M${lx.toFixed(1)},${ly.toFixed(1)} Q${midL.toFixed(1)},${(ulMid + 1).toFixed(1)} 153,${(ulMid - 2.5).toFixed(1)} Q160,${ulMid.toFixed(1)} 167,${(ulMid - 2.5).toFixed(1)} Q${midR.toFixed(1)},${(ulMid + 1).toFixed(1)} ${rx.toFixed(1)},${ry.toFixed(1)} Q${midR.toFixed(1)},${(uIn + 6).toFixed(1)} 160,${(uIn - 1).toFixed(1)} Q${midL.toFixed(1)},${(uIn + 6).toFixed(1)} ${lx.toFixed(1)},${ly.toFixed(1)} Z`
              : `M${lx.toFixed(1)},${ly.toFixed(1)} Q${midL.toFixed(1)},${(ulMid - 4.5).toFixed(1)} 154,${(ulMid - 2).toFixed(1)} Q160,${ulMid.toFixed(1)} 166,${(ulMid - 2).toFixed(1)} Q${midR.toFixed(1)},${(ulMid - 4.5).toFixed(1)} ${rx.toFixed(1)},${ry.toFixed(1)} Q${midR.toFixed(1)},${(uIn - 1).toFixed(1)} 160,${uIn.toFixed(1)} Q${midL.toFixed(1)},${(uIn - 1).toFixed(1)} ${lx.toFixed(1)},${ly.toFixed(1)} Z`
          );
        }
        if (lowerLipPathRef.current) {
          if (isJoker) {
            const llx = lx + 2;
            const lrx = rx - 2;
            const cornerY = (ly + ry) * 0.5 + 2;
            const ctrlInnerY = 2 * (lIn + 3) - cornerY;
            const ctrlOuterY = 2 * (lOut + 7) - cornerY;
            lowerLipPathRef.current.setAttribute(
              'd',
              `M${llx.toFixed(1)},${(ly + 2).toFixed(1)} Q160,${ctrlInnerY.toFixed(1)} ${lrx.toFixed(1)},${(ry + 2).toFixed(1)} Q160,${ctrlOuterY.toFixed(1)} ${llx.toFixed(1)},${(ly + 2).toFixed(1)} Z`
            );
          } else {
            const llx = lx + 6;
            const lrx = rx - 6;
            lowerLipPathRef.current.setAttribute(
              'd',
              `M${llx.toFixed(1)},${(lIn - 1).toFixed(1)} Q160,${(lIn + 4).toFixed(1)} ${lrx.toFixed(1)},${(lIn - 1).toFixed(1)} Q160,${(lOut + 4).toFixed(1)} ${llx.toFixed(1)},${(lIn - 1).toFixed(1)} Z`
            );
          }
        }
        if (lowerLipSheenRef.current) {
          lowerLipSheenRef.current.setAttribute(
            'cy',
            isJoker ? (lIn + 7).toFixed(1) : ((lIn + lOut) * 0.5 + 1).toFixed(1)
          );
        }
        if (upperArchTransformRef.current) {
          upperArchTransformRef.current.setAttribute(
            'transform',
            `translate(0, ${((uIn - 236) * 0.55).toFixed(2)})`
          );
        }
        if (lowerArchTransformRef.current) {
          lowerArchTransformRef.current.setAttribute(
            'transform',
            `translate(0, ${(lIn - 258).toFixed(2)})`
          );
        }
        if (koTongueRef.current) {
          koTongueRef.current.style.opacity = isJoker ? '0' : es.koBlend.toFixed(3);
        }
      }

      // 5b. 60fps per-strand spring-damper hair physics (inertia, punch whip + head rebound, dishevelment & gravity)
      const activeStrands = hairStrandsRef.current;
      const safeDt = Math.max(0.004, dt);
      const headVelX = (hnx - prevHeadCurrRef.current.nx) / safeDt;
      const headVelY = (hny - prevHeadCurrRef.current.ny) / safeDt;
      prevHeadCurrRef.current.nx = hnx;
      prevHeadCurrRef.current.ny = hny;

      let punchImpulseX = 0;
      let punchImpulseY = 0;
      let hasPunchImpulse = false;
      if (hitNonceRef.current !== lastHairHitNonceRef.current) {
        lastHairHitNonceRef.current = hitNonceRef.current;
        const offset = lastHitOffsetRef.current;
        const pwr = Math.max(0.75, Math.min(2.1, offset.power || 1));
        // Head jolts along offset.dx/dy, so hair whips inversely by inertia plus upward shockwave
        punchImpulseX = -offset.dx * 245 * pwr;
        punchImpulseY = (-offset.dy * 115 - 125) * pwr;
        hasPunchImpulse = true;
        hairReboundRef.current = {
          active: true,
          age: 0,
          dx: offset.dx,
          dy: offset.dy,
          power: pwr,
        };
      }

      // Secondary spring-back rebound force when the head snaps back after ~85ms
      let reboundAx = 0;
      let reboundAy = 0;
      if (hairReboundRef.current.active) {
        hairReboundRef.current.age += safeDt;
        const rAge = hairReboundRef.current.age;
        if (rAge >= 0.085 && rAge <= 0.21) {
          const env = Math.sin(((rAge - 0.085) / 0.125) * Math.PI);
          reboundAx = hairReboundRef.current.dx * 460 * hairReboundRef.current.power * env;
          reboundAy = (hairReboundRef.current.dy * 210 + 165) * hairReboundRef.current.power * env;
        } else if (rAge > 0.21) {
          hairReboundRef.current.active = false;
        }
      }

      let hasKoImpulse = false;
      if (dead && !lastHairKoRef.current) {
        hasKoImpulse = true;
      }
      lastHairKoRef.current = dead;

      const koSagTarget = dead ? 9.5 : 0;
      const damageDishevel = Math.max(0, 1 - hpRatioRef.current);
      const dizzySwayX = !dead && isStunnedRef.current ? Math.sin(now * 0.008) * 48 : 0;

      for (let i = 0; i < activeStrands.length; i++) {
        const spec = activeStrands[i];
        const phys = hairPhysicsRef.current[i];
        const pathEl = hairStrandRefs.current[i];
        if (!phys || !pathEl) continue;

        if (hasPunchImpulse) {
          const jitter = 0.78 + ((i * 37) % 10) * 0.048;
          const fanX = Math.sin(spec.phase * 2.7 + i) * 24;
          const fanY = Math.cos(spec.phase * 1.9 + i) * 16;
          phys.vx += (punchImpulseX + fanX) * jitter * spec.gravityScale;
          phys.vy += (punchImpulseY + fanY) * jitter * spec.gravityScale;
        }
        if (hasKoImpulse) {
          phys.vx += (65 + Math.sin(spec.phase) * 28) * spec.gravityScale;
          phys.vy += (115 + Math.cos(spec.phase) * 22) * spec.gravityScale;
        }

        // Subtle dishevelment when beaten up + very gentle air breathing + KO gravity sag
        const dishevelX = Math.sin(spec.phase * 3.1 + i * 0.7) * damageDishevel * 2.1 * spec.gravityScale;
        const dishevelY = (Math.cos(spec.phase * 2.3) * 0.5 + 0.5) * damageDishevel * 2.0 * spec.gravityScale;
        const breezeX = dead ? 0 : Math.sin(now * 0.0022 + spec.phase) * 7.5;
        const breezeY = dead ? 0 : Math.cos(now * 0.0018 + spec.phase * 1.3) * 3.8;
        const targetDx = dishevelX;
        const targetDy = koSagTarget * spec.gravityScale + dishevelY;

        const ax =
          -spec.stiffness * (phys.dx - targetDx) -
          spec.damping * phys.vx -
          headVelX * 30 * spec.gravityScale +
          (reboundAx + dizzySwayX + breezeX) * spec.gravityScale;
        const ay =
          -spec.stiffness * (phys.dy - targetDy) -
          spec.damping * phys.vy -
          headVelY * 22 * spec.gravityScale +
          (reboundAy + breezeY) * spec.gravityScale;

        phys.vx += ax * safeDt;
        phys.vy += ay * safeDt;
        phys.dx = Math.max(-30, Math.min(30, phys.dx + phys.vx * safeDt));
        phys.dy = Math.max(-24, Math.min(30, phys.dy + phys.vy * safeDt));

        const restTx = spec.rx + spec.dx;
        const restTy = spec.ry + spec.dy;
        const tx = restTx + phys.dx;
        const ty = restTy + phys.dy;

        const len = Math.hypot(spec.dx, spec.dy) || 1;
        const perpX = -spec.dy / len;
        const perpY = spec.dx / len;
        const cx = spec.rx + spec.dx * 0.5 + perpX * spec.curve + phys.dx * 0.36;
        const cy = spec.ry + spec.dy * 0.5 + perpY * spec.curve + phys.dy * 0.36;

        pathEl.setAttribute(
          'd',
          buildTaperedHairPath(spec.rx, spec.ry, cx, cy, tx, ty, spec.halfWidth)
        );
      }

      // Spring-damper bounce for sculpted foreground boss hair locks
      if (sculptedHairGroupRef.current) {
        const sc = sculptedHairSpringRef.current;
        if (hasPunchImpulse) {
          sc.vx += punchImpulseX * 0.28;
          sc.vy += punchImpulseY * 0.24;
        }
        if (hasKoImpulse) {
          sc.vx += 24;
          sc.vy += 42;
        }
        const scTargetY = dead ? 3.5 : 0;
        const scAx = -175 * sc.dx - 11 * sc.vx - headVelX * 14 + reboundAx * 0.22;
        const scAy = -175 * (sc.dy - scTargetY) - 11 * sc.vy - headVelY * 10 + reboundAy * 0.2;
        sc.vx += scAx * safeDt;
        sc.vy += scAy * safeDt;
        sc.dx = Math.max(-9, Math.min(9, sc.dx + sc.vx * safeDt));
        sc.dy = Math.max(-7, Math.min(9, sc.dy + sc.vy * safeDt));
        sculptedHairGroupRef.current.setAttribute(
          'transform',
          `translate(${sc.dx.toFixed(2)}, ${sc.dy.toFixed(2)}) rotate(${(sc.dx * 0.25).toFixed(2)}, 160, 70)`
        );
      }

      // 5c. 60fps flying knocked-out teeth & trailing blood droplets
      const flyingTeeth = flyingTeethRef.current;
      for (let i = 0; i < MAX_FLYING_TEETH; i++) {
        const ft = flyingTeeth[i];
        if (!ft.active) continue;

        ft.age += dt;
        ft.vy += 560 * dt;
        ft.x += ft.vx * dt;
        ft.y += ft.vy * dt;
        ft.rot += ft.vRot * dt;
        ft.spinPhase += ft.spinSpeed * dt;

        const groupEl = flyingToothGroupRefs.current[i];
        const shapeEl = flyingToothShapeRefs.current[i];
        const dropEls = flyingToothDropRefs.current[i];

        if (ft.age >= ft.duration || ft.y > 475) {
          ft.active = false;
          if (groupEl) groupEl.style.opacity = '0';
          continue;
        }

        const fadeRatio =
          ft.age > ft.duration * 0.72
            ? Math.max(0, 1 - (ft.age - ft.duration * 0.72) / (ft.duration * 0.28))
            : 1;
        const flipX = 0.44 + 0.56 * Math.abs(Math.cos(ft.spinPhase));
        const arcPop = 1.22 + Math.sin(Math.min(1, ft.age / 0.5) * Math.PI) * 0.36;

        if (shapeEl) {
          shapeEl.style.opacity = fadeRatio.toFixed(3);
          shapeEl.setAttribute(
            'transform',
            `translate(${ft.x.toFixed(2)}, ${ft.y.toFixed(2)}) rotate(${ft.rot.toFixed(1)}) scale(${(arcPop * flipX).toFixed(2)}, ${arcPop.toFixed(2)})`
          );
        }

        const dropAlpha = Math.max(0, 1 - ft.age / 0.62);
        for (let d = 0; d < FLYING_TOOTH_DROPLETS; d++) {
          const dr = ft.droplets[d];
          dr.vy += 480 * dt;
          dr.x += dr.vx * dt;
          dr.y += dr.vy * dt;
          const circleEl = dropEls?.[d];
          if (circleEl) {
            circleEl.setAttribute('cx', dr.x.toFixed(2));
            circleEl.setAttribute('cy', dr.y.toFixed(2));
            circleEl.style.opacity = dropAlpha.toFixed(3);
          }
        }
      }

      // 6. Subtle cold traumatic shock trembling jitter (zero React re-renders)
      if (shockGroupRef.current) {
        if (!dead && isInShockRef.current) {
          const jx = Math.sin(now * 0.065) * 1.15 + Math.cos(now * 0.11) * 0.55;
          const jy = Math.cos(now * 0.085) * 0.85;
          shockGroupRef.current.setAttribute(
            'transform',
            `translate(${jx.toFixed(2)}, ${jy.toFixed(2)})`
          );
        } else {
          shockGroupRef.current.removeAttribute('transform');
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    if (hitNonce === 0) return;
    setWince(true);
    if (winceTimerRef.current) window.clearTimeout(winceTimerRef.current);
    winceTimerRef.current = window.setTimeout(() => {
      setWince(false);
    }, 170);
    return () => {
      if (winceTimerRef.current) window.clearTimeout(winceTimerRef.current);
    };
  }, [hitNonce]);

  useEffect(() => {
    if (trauma.isBlind || isKo || isStunned) {
      pointerNormRef.current = { nx: 0, ny: 0 };
      return;
    }
    const handleMove = (e: PointerEvent) => {
      if (!svgRef.current || isKo || isStunned || trauma.isBlind) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 260));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 260));
      pointerNormRef.current = { nx: dx, ny: dy };
    };
    const handleLeave = () => {
      pointerNormRef.current = { nx: 0, ny: 0 };
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    window.addEventListener('blur', handleLeave);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('blur', handleLeave);
    };
  }, [isKo, isStunned, trauma.isBlind]);

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>) => {
    e.stopPropagation();
    if (isKo) return;
    const svg = svgRef.current;
    if (!svg) return;

    let svgX = 160;
    let svgY = 180;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const local = pt.matrixTransform(ctm.inverse());
      svgX = local.x;
      svgY = local.y;
    } else {
      const rect = svg.getBoundingClientRect();
      svgX = 12 + ((e.clientX - rect.left) / rect.width) * 296;
      svgY = 18 + ((e.clientY - rect.top) / rect.height) * 402;
    }

    // Strictly allow hits on the face/head/ears only — never shoulders, chest, or neck
    if (svgY > 317) return;

    const { zone, isSweetSpot } = detectHitZone(svgX, svgY, enemy.species);
    onPunch(e.clientX, e.clientY, svgX, svgY, zone, isSweetSpot);
  };

  const handleKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
    if (isKo) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const clientX = rect.left + rect.width * 0.5;
      const clientY = rect.top + rect.height * 0.44;
      onPunch(clientX, clientY, 160, 188, 'nose', true);
    }
  };

  const joltTransform = isKo
    ? 'translate(0px, 26px) rotate(18deg) scale(0.93)'
    : wince
      ? `translate(${lastHitOffset.dx * 19 * lastHitOffset.power}px, ${lastHitOffset.dy * 13 * lastHitOffset.power}px) rotate(${lastHitOffset.dx * 14}deg) scale(0.94, 1.04)`
      : isStunned
        ? 'translate(0px, 5px) rotate(-5deg) scale(0.99)'
        : 'translate(0px, 0px) rotate(0deg) scale(1)';

  const damageStage =
    isKo ? 4 : hpPct <= 0.25 ? 3 : hpPct <= 0.55 ? 2 : hpPct <= 0.8 ? 1 : 0;

  const isCrying = enemy.bossId !== 'joker' && cryIntensity > 0.25;
  const isEyesWatering = enemy.bossId !== 'joker' && cryIntensity > 0.04;

  const mood: 'smug' | 'angry' | 'crying' | 'dazed' | 'ko' = isKo
    ? 'ko'
    : isStunned
      ? 'dazed'
      : isCrying
        ? 'crying'
        : hpPct <= 0.82
          ? 'angry'
          : 'smug';
  moodRef.current = mood;

  // Progressive CSS trauma deformation: facial swelling, asymmetric skew & feature distortion
  const leftMarksCount = bruises.reduce((acc, m) => acc + (m.x < 154 ? 1 : 0), 0);
  const rightMarksCount = bruises.reduce((acc, m) => acc + (m.x > 166 ? 1 : 0), 0);
  const leftSideLoad =
    (trauma.leftEyeSwollen ? 1.1 : 0) +
    (trauma.leftEyeRuptured ? 1.7 : 0) +
    (trauma.leftEarSwollen ? 0.75 : 0) +
    (trauma.leftEarBurst ? 1.4 : 0) +
    Math.min(2.2, leftMarksCount * 0.24) +
    Math.min(0.9, (trauma.leftEyeDamage || 0) / 140);
  const rightSideLoad =
    (trauma.rightEyeSwollen ? 1.1 : 0) +
    (trauma.rightEyeRuptured ? 1.7 : 0) +
    (trauma.rightEarSwollen ? 0.75 : 0) +
    (trauma.rightEarBurst ? 1.4 : 0) +
    Math.min(2.2, rightMarksCount * 0.24) +
    Math.min(0.9, (trauma.rightEyeDamage || 0) / 140);

  const rawAsym = rightSideLoad - leftSideLoad;
  const fallbackBias = bruises.length > 0 ? (bruises[0].id % 2 === 0 ? 0.35 : -0.35) : 0.25;
  const asymDir =
    Math.abs(rawAsym) > 0.12
      ? Math.max(-1, Math.min(1, rawAsym / 2.2))
      : fallbackBias * Math.min(1, bruises.length / 6);

  const traumaScore =
    (1 - hpPct) * 0.42 +
    (trauma.noseBroken ? 0.16 : Math.min(0.12, (trauma.noseDamage / 180) * 0.12)) +
    (trauma.jawFractured ? 0.2 : Math.min(0.14, (trauma.jawDamage / 320) * 0.14)) +
    (trauma.lipTorn ? 0.12 : 0) +
    (trauma.skullExposed ? 0.14 : Math.min(0.08, (trauma.foreheadDamage / 280) * 0.08)) +
    (trauma.leftEyeSwollen || trauma.rightEyeSwollen ? 0.12 : 0) +
    (trauma.eyeRuptured ? 0.16 : 0) +
    (trauma.earTorn ? 0.1 : 0) +
    ((6 - trauma.teethRemaining) / 6) * 0.14 +
    Math.min(0.22, bruises.length * 0.018);

  const deformLevel = Math.max(0, Math.min(1, traumaScore));
  const shockPallor = !isKo && enemy.bossId !== 'joker' && (isInShock || hpPct < 0.22);
  const headDeformStyle: React.CSSProperties = {
    transform:
      deformLevel > 0.02
        ? `translate(${(asymDir * deformLevel * 1.4).toFixed(2)}px, ${(deformLevel * 1.1).toFixed(2)}px) rotate(${(asymDir * deformLevel * 1.35 + (trauma.jawFractured ? 0.8 : 0)).toFixed(2)}deg) skew(${(asymDir * deformLevel * 2.3).toFixed(2)}deg, ${(asymDir * deformLevel * 1.15).toFixed(2)}deg) scale(${(1 + deformLevel * 0.044).toFixed(4)}, ${(1 + deformLevel * 0.018).toFixed(4)})`
        : 'none',
    transformOrigin: '160px 180px',
    transformBox: 'view-box',
    transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1), filter 420ms ease-out',
    filter: shockPallor
      ? `saturate(0.84) contrast(${(1.04 + deformLevel * 0.06).toFixed(3)}) brightness(0.97)`
      : deformLevel > 0.12
        ? `saturate(${(1 + deformLevel * 0.12).toFixed(3)}) contrast(${(1 + deformLevel * 0.045).toFixed(3)})`
        : undefined,
  };

  const eyeSwellFactor = Math.min(
    1,
    deformLevel * 0.45 +
      (trauma.leftEyeSwollen || trauma.rightEyeSwollen ? 0.45 : 0) +
      (trauma.eyeRuptured ? 0.35 : 0)
  );
  const eyesDeformStyle: React.CSSProperties = {
    transform:
      eyeSwellFactor > 0.02
        ? `translateY(${(eyeSwellFactor * 1.3).toFixed(2)}px) skewY(${(asymDir * eyeSwellFactor * 2.1).toFixed(2)}deg) scale(${(1 + eyeSwellFactor * 0.024).toFixed(4)}, ${(1 - eyeSwellFactor * 0.055).toFixed(4)})`
        : 'none',
    transformOrigin: '160px 148px',
    transformBox: 'view-box',
    transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const noseDeformFactor = Math.min(
    1,
    (trauma.noseBroken ? 0.72 : (trauma.noseDamage / 180) * 0.52) + deformLevel * 0.28
  );
  const noseDeformStyle: React.CSSProperties = {
    transform:
      noseDeformFactor > 0.02
        ? `skewX(${(asymDir * noseDeformFactor * 3.8).toFixed(2)}deg) rotate(${(asymDir * noseDeformFactor * 2.2).toFixed(2)}deg) scale(${(1 + noseDeformFactor * 0.07).toFixed(4)}, ${(1 + noseDeformFactor * 0.02).toFixed(4)})`
        : 'none',
    transformOrigin: '160px 175px',
    transformBox: 'view-box',
    transition: 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const mouthDeformFactor = Math.min(
    1,
    (trauma.jawFractured ? 0.68 : (trauma.jawDamage / 320) * 0.48) +
      (trauma.lipTorn ? 0.3 : 0) +
      ((6 - trauma.teethRemaining) / 6) * 0.25 +
      deformLevel * 0.22
  );
  const mouthDeformStyle: React.CSSProperties = {
    transform:
      mouthDeformFactor > 0.02
        ? `translate(${(asymDir * mouthDeformFactor * 1.6).toFixed(2)}px, ${(mouthDeformFactor * 1.8).toFixed(2)}px) skew(${(asymDir * mouthDeformFactor * 3.1).toFixed(2)}deg, ${(-asymDir * mouthDeformFactor * 1.6).toFixed(2)}deg) scale(${(1 + mouthDeformFactor * 0.036).toFixed(4)}, ${(1 + mouthDeformFactor * 0.055).toFixed(4)})`
        : 'none',
    transformOrigin: '160px 248px',
    transformBox: 'view-box',
    transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const mouthCavityPath =
    enemy.bossId === 'joker'
      ? 'M112,225 Q160,248 208,225 Q200,259 160,260 Q120,259 112,225 Z'
      : mood === 'ko'
        ? 'M130,242 Q160,231 190,242 Q185,263 160,264 Q135,263 130,242 Z'
        : mood === 'crying'
          ? 'M126,246 Q160,228 194,246 Q188,266 160,263 Q132,266 126,246 Z'
          : wince || mood === 'dazed'
            ? 'M124,235 Q160,222 196,235 Q190,265 160,265 Q130,265 124,235 Z'
            : mood === 'smug'
              ? 'M132,243 Q162,249 194,234 Q188,252 160,252 Q138,252 132,243 Z'
              : 'M126,237 Q160,231 194,237 Q192,257 160,257 Q128,257 126,237 Z';

  // Upper 8 anatomical teeth (from left premolar to right premolar) with realistic knock-out order
  const upperTeeth = [
    { x: 127.5, w: 6.5, h: 7.2, archY: -1.6, cusp: 0.4, side: true, koAt: null, chip: false },
    { x: 134, w: 8.2, h: 8.4, archY: -0.9, cusp: 1.5, side: true, koAt: 0, chip: false },
    { x: 142.2, w: 8.1, h: 7.7, archY: -0.3, cusp: 0.3, side: false, koAt: 4, chip: true },
    { x: 150.3, w: 9.7, h: 8.9, archY: 0.2, cusp: 0, side: false, koAt: 3, chip: false },
    { x: 160, w: 9.7, h: 8.9, archY: 0.2, cusp: 0, side: false, koAt: 5, chip: true },
    { x: 169.7, w: 8.1, h: 7.7, archY: -0.3, cusp: 0.3, side: false, koAt: 1, chip: false },
    { x: 177.8, w: 8.2, h: 8.4, archY: -0.9, cusp: 1.5, side: true, koAt: 2, chip: false },
    { x: 186, w: 6.5, h: 7.2, archY: -1.6, cusp: 0.4, side: true, koAt: null, chip: false },
  ] as const;

  const lowerTeeth = [
    { x: 136.5, w: 7.2, h: 6.4, cusp: 0.8, side: true },
    { x: 143.7, w: 7.8, h: 6.6, cusp: 0.1, side: false },
    { x: 151.5, w: 8.5, h: 6.8, cusp: 0, side: false },
    { x: 160, w: 8.5, h: 6.8, cusp: 0, side: false },
    { x: 168.5, w: 7.8, h: 6.6, cusp: 0.1, side: false },
    { x: 176.3, w: 7.2, h: 6.4, cusp: 0.8, side: true },
  ] as const;

  const upperGumTop = 230;
  const lowerToothBaseY = 259;

  const renderDentalArch = (showLower: boolean) => (
    <g clipPath="url(#mouth-cavity-clip)">
      {/* Deep Oral Cavity Depth & Buccal Corridor Shadow */}
      <rect x="118" y="220" width="84" height="52" fill="url(#mouth-depth-grad)" />

      {/* Lower jaw: tongue + lower mandibular dental arch (translates smoothly with jaw opening) */}
      <g ref={lowerArchTransformRef}>
        {showLower && (
          <g>
            <path
              d="M139,254 Q160,245 181,254 Q170,263 160,263 Q150,263 139,254 Z"
              fill="#881337"
            />
            <path
              d="M148,251 Q160,247 172,251"
              fill="none"
              stroke="#fb7185"
              strokeWidth="1.4"
              opacity="0.22"
              strokeLinecap="round"
            />
            <path d="M160,248 L160,258" stroke="#4c0519" strokeWidth="1" opacity="0.4" />
          </g>
        )}

        {showLower && (
          <g>
            {lowerTeeth.map((t, i) => {
              const yTop = lowerToothBaseY - t.h;
              const d = `M${t.x + 0.5},${lowerToothBaseY} L${t.x + 0.3},${yTop + 1.4} Q${t.x + t.w * 0.5},${yTop - t.cusp} ${t.x + t.w - 0.3},${yTop + 1.4} L${t.x + t.w - 0.5},${lowerToothBaseY} Z`;
              return (
                <g key={`low-${i}`}>
                  <path
                    d={d}
                    fill={t.side ? 'url(#tooth-enamel-side)' : 'url(#tooth-enamel-lower)'}
                    stroke="#3b1214"
                    strokeWidth="0.65"
                  />
                  {!t.side && (
                    <line
                      x1={t.x + t.w * 0.36}
                      y1={yTop + 1.4}
                      x2={t.x + t.w * 0.36}
                      y2={lowerToothBaseY - 1.5}
                      stroke="#ffffff"
                      strokeWidth="0.9"
                      opacity="0.22"
                      strokeLinecap="round"
                    />
                  )}
                </g>
              );
            })}
            {/* Lower scalloped gumline */}
            <path
              d={`M126,${lowerToothBaseY + 6} L126,${lowerToothBaseY - 1} Q136,${lowerToothBaseY - 3} 143,${lowerToothBaseY - 1} Q151,${lowerToothBaseY - 3} 160,${lowerToothBaseY - 1} Q169,${lowerToothBaseY - 3} 177,${lowerToothBaseY - 1} Q184,${lowerToothBaseY - 3} 194,${lowerToothBaseY - 1} L194,${lowerToothBaseY + 6} Z`}
              fill="url(#gum-grad)"
            />
          </g>
        )}
      </g>

      {/* Upper Maxillary Dental Arch (tracks upper lip lift smoothly) */}
      <g ref={upperArchTransformRef}>
        {upperTeeth.map((t, i) => {
          const isMissing = t.koAt !== null && trauma.teethRemaining <= t.koAt;
          const baseTop = upperGumTop + 5.2 + t.archY;
          const isChipped = (trauma.lipTorn || damageStage >= 3) && t.chip;
          const bottomY = baseTop + (isChipped ? t.h * 0.66 : t.h);

          if (isMissing) {
            return (
              <g key={`up-${i}`}>
                {/* Dark hemorrhagic tooth extraction socket */}
                <ellipse
                  cx={t.x + t.w * 0.5}
                  cy={baseTop + 1.2}
                  rx={t.w * 0.38}
                  ry="2.6"
                  fill="#2d0408"
                  stroke="#7f1d1d"
                  strokeWidth="0.8"
                />
                <path
                  d={`M${t.x + t.w * 0.5},${baseTop + 2} Q${t.x + t.w * 0.45},${baseTop + 6} ${t.x + t.w * 0.55},${baseTop + 10}`}
                  stroke="#991b1b"
                  strokeWidth="1.5"
                  opacity="0.72"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            );
          }

          const toothPath = isChipped
            ? `M${t.x + 0.4},${baseTop} L${t.x + t.w - 0.4},${baseTop} L${t.x + t.w - 0.6},${bottomY + 1.4} L${t.x + t.w * 0.48},${bottomY - 1.5} L${t.x + 0.6},${bottomY + 0.6} Z`
            : `M${t.x + 0.4},${baseTop} L${t.x + t.w - 0.4},${baseTop} L${t.x + t.w - 0.5},${bottomY - 1.4} Q${t.x + t.w * 0.5},${bottomY + t.cusp} ${t.x + 0.5},${bottomY - 1.4} Z`;

          return (
            <g key={`up-${i}`}>
              <path
                d={toothPath}
                fill={t.side ? 'url(#tooth-enamel-side)' : 'url(#tooth-enamel-front)'}
                stroke="#3b1614"
                strokeWidth="0.7"
                strokeLinejoin="round"
              />
              {/* Subtle vertical enamel highlight & translucent incisal edge */}
              {!t.side && (
                <path
                  d={`M${t.x + t.w * 0.34},${baseTop + 1.6} L${t.x + t.w * 0.34},${bottomY - 2.2}`}
                  stroke="#ffffff"
                  strokeWidth="1.25"
                  opacity="0.34"
                  strokeLinecap="round"
                />
              )}
              {damageStage >= 2 && (
                <path
                  d={`M${t.x + 0.9},${baseTop + 0.8} Q${t.x + t.w * 0.5},${baseTop + 2.2} ${t.x + t.w - 0.9},${baseTop + 0.8}`}
                  stroke="#991b1b"
                  strokeWidth="1.1"
                  opacity="0.6"
                  fill="none"
                />
              )}
            </g>
          );
        })}

        {/* Anatomical Scalloped Gingival Gumline + Interdental Papillae */}
        <path
          d={`M122,${upperGumTop - 4} L198,${upperGumTop - 4} L198,${upperGumTop + 5.5}
              Q189,${upperGumTop + 3.5} 186,${upperGumTop + 6}
              Q182,${upperGumTop + 3.2} 177.8,${upperGumTop + 6.2}
              Q173.5,${upperGumTop + 3.5} 169.7,${upperGumTop + 6.8}
              Q164.5,${upperGumTop + 3.6} 160,${upperGumTop + 7.2}
              Q155,${upperGumTop + 3.6} 150.3,${upperGumTop + 6.8}
              Q146,${upperGumTop + 3.5} 142.2,${upperGumTop + 6.2}
              Q138,${upperGumTop + 3.2} 134,${upperGumTop + 6}
              Q130,${upperGumTop + 3.5} 122,${upperGumTop + 5.5} Z`}
          fill="url(#gum-grad)"
        />

        {/* Upper Lip Cast Shadow & Mouth Corner Vignette (grounds teeth inside mouth) */}
        <rect x="120" y={upperGumTop - 2} width="80" height="10" fill="url(#upper-lip-inner-shadow)" />
      </g>

      {/* Subtle dark blood pooling inside oral cavity floor when teeth are knocked out */}
      {trauma.teethRemaining < 6 && (
        <path
          d="M128,252 Q160,248 192,252 L189,264 Q160,267 131,264 Z"
          fill="#450a0a"
          opacity={Math.min(0.68, 0.32 + (6 - trauma.teethRemaining) * 0.065)}
        />
      )}

      <rect x="120" y="220" width="80" height="50" fill="url(#mouth-corner-vignette)" />
    </g>
  );

  const hemolacria =
    trauma.eyeRuptured || trauma.leftEyeSwollen || trauma.rightEyeSwollen || damageStage >= 3;
  const headOutlinePath = getHeadOutlinePath(enemy);
  const anatomy = getEnemyAnatomyMetrics(enemy);
  const neckTopL = 108 - anatomy.neckTopExpand;
  const neckTopR = 212 + anatomy.neckTopExpand;
  const neckBotL = 84 - anatomy.neckBotExpand;
  const neckBotR = 236 + anatomy.neckBotExpand;
  const neckPath = `M${neckTopL},274 C${neckTopL},304 ${neckBotL + 13},328 ${neckBotL},354 L${neckBotR},354 C${neckBotR - 13},328 ${neckTopR},304 ${neckTopR},274 Z`;
  const hasCustomMiniBossOutfit = Boolean(enemy.miniBossId);
  const isBlueSkin = enemy.miniBossId === 'smzinho';

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Arena spotlight behind head */}
      <div
        className="pointer-events-none absolute w-80 h-80 sm:w-[440px] sm:h-[440px] -translate-y-4 rounded-full transition-opacity duration-200"
        style={{
          background: isRageActive
            ? 'radial-gradient(circle, rgba(220,38,38,0.42) 0%, rgba(17,18,21,0) 70%)'
            : damageStage >= 2
              ? 'radial-gradient(circle, rgba(185,28,28,0.3) 0%, rgba(17,18,21,0) 70%)'
              : 'radial-gradient(circle, rgba(255,255,255,0.095) 0%, rgba(17,18,21,0) 70%)',
        }}
      />

      <svg
        ref={svgRef}
        viewBox="12 18 296 402"
        className="relative z-20 h-[390px] sm:h-[495px] max-h-[56vh] sm:max-h-[63vh] w-auto max-w-full aspect-[296/402] cursor-default select-none overflow-visible transition-transform duration-100 ease-out"
        style={{
          transform: joltTransform,
          touchAction: 'manipulation',
        }}
      >
        <defs>
          {/* Anatomical cranial, cheekbone, and per-boss mandible silhouette */}
          <clipPath id="head-clip">
            <path d={headOutlinePath} />
          </clipPath>

          <clipPath id="left-eye-clip">
            <path ref={leftEyeClipPathRef} d="M97,149 Q116,135 133,150 Q116,161 97,149 Z" />
          </clipPath>
          <clipPath id="right-eye-clip">
            <path ref={rightEyeClipPathRef} d="M187,150 Q204,135 223,149 Q204,161 187,150 Z" />
          </clipPath>

          <clipPath id="cyclops-eye-clip">
            <path ref={cyclopsEyeClipPathRef} d="M121,141 Q160,115 199,141 Q160,165 121,141 Z" />
          </clipPath>

          <clipPath id="mouth-cavity-clip">
            <path ref={mouthClipPathRef} d={mouthCavityPath} />
          </clipPath>

          {/* 3D Studio Key-Light Skin Shader */}
          <radialGradient id="skin-grad" cx="42%" cy="28%" r="76%">
            <stop offset="0%" stopColor={enemy.skinColor} />
            <stop offset="56%" stopColor={enemy.skinColor} />
            <stop offset="86%" stopColor={enemy.skinShadow} />
            <stop offset="100%" stopColor="#26130c" />
          </radialGradient>

          {/* Subtle Inner Rim Vignette for 3D Cranial/Jaw Volume */}
          <radialGradient id="head-edge-vignette" cx="50%" cy="44%" r="54%">
            <stop offset="70%" stopColor="#140804" stopOpacity="0" />
            <stop offset="91%" stopColor="#140804" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0c0402" stopOpacity="0.44" />
          </radialGradient>

          {/* Hair Depth & Crown Sheen Shading */}
          <linearGradient id="hair-depth-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#090605" stopOpacity="0.1" />
            <stop offset="45%" stopColor="#090605" stopOpacity="0" />
            <stop offset="100%" stopColor="#090605" stopOpacity="0.45" />
          </linearGradient>

          {/* Neck Ambient Occlusion Gradient */}
          <linearGradient id="neck-ao-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#140905" stopOpacity="0.88" />
            <stop offset="32%" stopColor={enemy.skinShadow} stopOpacity="0.4" />
            <stop offset="100%" stopColor={enemy.skinShadow} stopOpacity="0" />
          </linearGradient>

          {/* Subsurface Cheek/Ear Warm Flush (cool cyan tint on Smzinho's blue avatar) */}
          <radialGradient id="subsurface-flush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isBlueSkin ? '#0284c7' : '#b91c1c'} stopOpacity={isBlueSkin ? '0.22' : '0.16'} />
            <stop offset="100%" stopColor={isBlueSkin ? '#0284c7' : '#b91c1c'} stopOpacity="0" />
          </radialGradient>

          {/* Deep Orbital Cavity Shadow */}
          <radialGradient id="eye-socket-shadow" cx="50%" cy="46%" r="54%">
            <stop offset="0%" stopColor="#180a05" stopOpacity="0.58" />
            <stop offset="65%" stopColor="#241008" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1c0d08" stopOpacity="0" />
          </radialGradient>

          {/* Realistic Sclera Edge Shading */}
          <radialGradient id="sclera-grad" cx="50%" cy="48%" r="56%">
            <stop offset="0%" stopColor={damageStage >= 3 ? '#fecaca' : damageStage >= 2 ? '#fee2e2' : '#f4f1ea'} />
            <stop offset="72%" stopColor={damageStage >= 3 ? '#fca5a5' : damageStage >= 2 ? '#fecaca' : '#e2ddd5'} />
            <stop offset="100%" stopColor={damageStage >= 2 ? '#b91c1c' : '#94a3b8'} />
          </radialGradient>

          {/* Realistic Layered Human Iris, Cyclops/Titan/Boss Iris & Blind Cloudy Iris */}
          <radialGradient id="iris-grad" cx="46%" cy="44%" r="54%">
            <stop
              offset="0%"
              stopColor={
                enemy.bossId === 'trevor_gta5'
                  ? '#b8894f'
                  : enemy.bossId === 'arthur_morgan'
                    ? '#bae6fd'
                    : enemy.bossId === 'geralt'
                      ? '#fde047'
                      : enemy.bossId === 'joker'
                        ? '#7c6244'
                        : enemy.bossId === 'john_wick'
                          ? '#5c3b28'
                          : enemy.bossId === 'wolverine'
                            ? '#c99858'
                            : enemy.bossId === 'thanos'
                              ? '#fcd34d'
                              : enemy.bossId === 'kratos' || enemy.species === 'titan'
                                ? '#f59e0b'
                                : enemy.eyeColor
                                  ? shadeHex(enemy.eyeColor, 1.25)
                                  : '#85583a'
              }
            />
            <stop
              offset="48%"
              stopColor={
                enemy.bossId === 'trevor_gta5'
                  ? '#69431d'
                  : enemy.bossId === 'arthur_morgan'
                    ? '#3b82f6'
                    : enemy.bossId === 'geralt'
                      ? '#d97706'
                      : enemy.bossId === 'joker'
                        ? '#382818'
                        : enemy.bossId === 'john_wick'
                          ? '#2b170e'
                          : enemy.bossId === 'wolverine'
                            ? '#6b441b'
                            : enemy.bossId === 'thanos'
                              ? '#d97706'
                              : enemy.bossId === 'kratos' || enemy.species === 'titan'
                                ? '#92400e'
                                : enemy.eyeColor || '#5c3824'
              }
            />
            <stop
              offset="84%"
              stopColor={
                enemy.bossId === 'trevor_gta5'
                  ? '#261407'
                  : enemy.bossId === 'arthur_morgan'
                    ? '#172554'
                    : enemy.bossId === 'geralt'
                      ? '#78350f'
                      : enemy.bossId === 'joker'
                        ? '#120b05'
                        : enemy.bossId === 'john_wick'
                          ? '#120805'
                          : enemy.bossId === 'wolverine'
                            ? '#291707'
                            : enemy.bossId === 'thanos'
                              ? '#78350f'
                              : enemy.bossId === 'kratos' || enemy.species === 'titan'
                                ? '#451a03'
                                : enemy.eyeColor
                                  ? shadeHex(enemy.eyeColor, 0.45)
                                  : '#2b180e'
              }
            />
            <stop offset="100%" stopColor="#110905" />
          </radialGradient>

          <radialGradient id="cyclops-iris-grad" cx="45%" cy="42%" r="55%">
            <stop offset="0%" stopColor={enemy.visualVariant === 'mine' ? '#facc15' : '#fb923c'} />
            <stop offset="46%" stopColor={enemy.visualVariant === 'mine' ? '#ca8a04' : '#c2410c'} />
            <stop offset="82%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#140702" />
          </radialGradient>

          <radialGradient id="iris-blind-grad" cx="48%" cy="46%" r="55%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="52%" stopColor="#94a3b8" />
            <stop offset="88%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </radialGradient>

          {/* Upper Eyelid Cast Shadow onto Eyeball */}
          <linearGradient id="eyelid-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#090504" stopOpacity="0.62" />
            <stop offset="45%" stopColor="#090504" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#090504" stopOpacity="0" />
          </linearGradient>

          {/* Animated Skin Eyelid Shading for Blinking, Squinting & Heavy Dazed Lids */}
          <linearGradient id="eyelid-skin-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={enemy.skinShadow} />
            <stop offset="68%" stopColor={enemy.skinColor} />
            <stop offset="100%" stopColor={enemy.skinShadow} />
          </linearGradient>

          {/* Soft Volumetric Skin Highlight Blur */}
          <filter id="soft-blur" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>

          {/* Fine Skin Pore & Micro-Grain Texture */}
          <filter id="skin-grit" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feComponentTransfer in="grayNoise" result="subtleNoise">
              <feFuncA type="linear" slope="0.065" />
            </feComponentTransfer>
            <feComposite in="subtleNoise" in2="SourceGraphic" operator="atop" />
          </filter>

          {/* Stubble / Micro-Hair Pattern */}
          <pattern id="stubble-pat" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="2" r="0.7" fill="#18181b" opacity="0.42" />
            <circle cx="4.5" cy="4.8" r="0.65" fill="#18181b" opacity="0.35" />
            <line x1="3" y1="0.8" x2="2.7" y2="2.1" stroke="#09090b" strokeWidth="0.65" opacity="0.38" />
          </pattern>

          {/* Anatomical Tooth Enamel & Oral Cavity Shaders */}
          <linearGradient id="tooth-enamel-front" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c7bfb0" />
            <stop offset="22%" stopColor="#ede9df" />
            <stop offset="68%" stopColor="#f6f3ec" />
            <stop offset="100%" stopColor="#ded8ca" />
          </linearGradient>

          <linearGradient id="tooth-enamel-side" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8c8273" />
            <stop offset="28%" stopColor="#c4bcb0" />
            <stop offset="72%" stopColor="#d1cabd" />
            <stop offset="100%" stopColor="#aba293" />
          </linearGradient>

          <linearGradient id="tooth-enamel-lower" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#9e9586" />
            <stop offset="30%" stopColor="#d6d0c4" />
            <stop offset="78%" stopColor="#e5e0d5" />
            <stop offset="100%" stopColor="#c9c2b4" />
          </linearGradient>

          <linearGradient id="gum-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4c0819" />
            <stop offset="55%" stopColor="#881337" />
            <stop offset="100%" stopColor="#ad3c57" />
          </linearGradient>

          <radialGradient id="mouth-depth-grad" cx="50%" cy="48%" r="55%">
            <stop offset="0%" stopColor="#090102" />
            <stop offset="65%" stopColor="#1e0306" />
            <stop offset="100%" stopColor="#3b070c" />
          </radialGradient>

          <linearGradient id="upper-lip-inner-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#090203" stopOpacity="0.72" />
            <stop offset="60%" stopColor="#090203" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#090203" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="mouth-corner-vignette" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#080203" stopOpacity="0.78" />
            <stop offset="18%" stopColor="#080203" stopOpacity="0.24" />
            <stop offset="50%" stopColor="#080203" stopOpacity="0" />
            <stop offset="82%" stopColor="#080203" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#080203" stopOpacity="0.78" />
          </linearGradient>

          {/* Realistic Subdermal Tissue & Cortical Bone Wound Gradients */}
          <radialGradient id="wound-bone-grad" cx="44%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#eee9dc" />
            <stop offset="52%" stopColor="#d5ccba" />
            <stop offset="84%" stopColor="#a89483" />
            <stop offset="100%" stopColor="#6b322c" />
          </radialGradient>

          <linearGradient id="wound-fascia-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d6826c" />
            <stop offset="50%" stopColor="#a83d38" />
            <stop offset="100%" stopColor="#5c0d0e" />
          </linearGradient>

          <radialGradient id="wound-cavity-grad" cx="50%" cy="46%" r="58%">
            <stop offset="0%" stopColor="#140203" />
            <stop offset="68%" stopColor="#3d0507" />
            <stop offset="100%" stopColor="#6e0e11" />
          </radialGradient>

          {/* Nose Volumetric Bridge Gradient */}
          <linearGradient id="nose-bridge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isBlueSkin ? '#082f49' : '#26120b'} stopOpacity="0.42" />
            <stop offset="38%" stopColor={enemy.skinColor} stopOpacity="0.95" />
            <stop offset="52%" stopColor={isBlueSkin ? '#bae6fd' : '#fff7ed'} stopOpacity={isBlueSkin ? '0.28' : '0.22'} />
            <stop offset="68%" stopColor={enemy.skinColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={isBlueSkin ? '#082f49' : '#26120b'} stopOpacity="0.48" />
          </linearGradient>

          <linearGradient id="lip-upper-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={enemy.bossId === 'joker' ? '#991b1b' : enemy.skinShadow} />
            <stop
              offset="42%"
              stopColor={
                enemy.bossId === 'joker'
                  ? '#dc2626'
                  : isBlueSkin
                    ? '#1e3a5f'
                    : enemy.species === 'cyclops'
                      ? '#3f2e25'
                      : '#6e3430'
              }
            />
            <stop
              offset="100%"
              stopColor={
                enemy.bossId === 'joker'
                  ? '#7f1d1d'
                  : isBlueSkin
                    ? '#0f2342'
                    : enemy.species === 'cyclops'
                      ? '#2c1d18'
                      : '#4a1d1b'
              }
            />
          </linearGradient>

          <linearGradient id="lip-lower-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={
                enemy.bossId === 'joker'
                  ? '#ef4444'
                  : isBlueSkin
                    ? '#2b4f78'
                    : enemy.species === 'cyclops'
                      ? '#584135'
                      : '#96544d'
              }
            />
            <stop
              offset="58%"
              stopColor={
                enemy.bossId === 'joker'
                  ? '#b91c1c'
                  : isBlueSkin
                    ? '#1e3a5f'
                    : enemy.species === 'cyclops'
                      ? '#463228'
                      : '#7a3c37'
              }
            />
            <stop offset="100%" stopColor={enemy.bossId === 'joker' ? '#7f1d1d' : enemy.skinShadow} />
          </linearGradient>

          <linearGradient id="blood-drip" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5c0b0b" />
            <stop offset="48%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#3b0707" />
          </linearGradient>

          <linearGradient id="tear-pool-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hemolacria ? '#fecaca' : '#e0f2fe'} stopOpacity="0.42" />
            <stop offset="100%" stopColor={hemolacria ? '#dc2626' : '#bae6fd'} stopOpacity="0.9" />
          </linearGradient>

          <radialGradient id="tear-bead-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="55%" stopColor={hemolacria ? '#f87171' : '#bae6fd'} stopOpacity="0.78" />
            <stop offset="100%" stopColor={hemolacria ? '#991b1b' : '#7dd3fc'} stopOpacity="0.92" />
          </radialGradient>

          <radialGradient id="sweat-bead-grad" cx="34%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="48%" stopColor="#e0f2fe" stopOpacity="0.42" />
            <stop offset="86%" stopColor="#94a3b8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.45" />
          </radialGradient>

          <radialGradient id="sweat-sheen-grad" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.78" />
            <stop offset="55%" stopColor="#f1f5f9" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="28%" stopColor="#94a3b8" />
            <stop offset="56%" stopColor="#475569" />
            <stop offset="85%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="shirt-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#262933" />
            <stop offset="55%" stopColor="#181a21" />
            <stop offset="100%" stopColor="#0e1015" />
          </linearGradient>

          {/* Per-Character Shirt Gradients & Patterns */}
          <linearGradient id="shirt-casual-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#33557d" />
            <stop offset="52%" stopColor="#1e3654" />
            <stop offset="100%" stopColor="#0f1d30" />
          </linearGradient>

          <linearGradient id="shirt-undershirt-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e7e5e4" />
            <stop offset="55%" stopColor="#c7c3bd" />
            <stop offset="100%" stopColor="#8c8780" />
          </linearGradient>

          <pattern id="shirt-flannel-pat" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="24" height="24" fill="#6b1414" />
            <rect x="0" y="0" width="12" height="24" fill="#1c1917" opacity="0.52" />
            <rect x="0" y="0" width="24" height="12" fill="#1c1917" opacity="0.45" />
            <line x1="6" y1="0" x2="6" y2="24" stroke="#b91c1c" strokeWidth="1.6" opacity="0.6" />
            <line x1="0" y1="6" x2="24" y2="6" stroke="#b91c1c" strokeWidth="1.6" opacity="0.6" />
            <line x1="18" y1="0" x2="18" y2="24" stroke="#fca5a5" strokeWidth="0.6" opacity="0.28" />
            <line x1="0" y1="18" x2="24" y2="18" stroke="#fca5a5" strokeWidth="0.6" opacity="0.28" />
          </pattern>

          <linearGradient id="shirt-leather-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e2e33" />
            <stop offset="45%" stopColor="#151518" />
            <stop offset="100%" stopColor="#070709" />
          </linearGradient>

          <linearGradient id="shirt-boxing-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a81d1d" />
            <stop offset="52%" stopColor="#721010" />
            <stop offset="100%" stopColor="#3c0606" />
          </linearGradient>

          <linearGradient id="shirt-gold-trim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="48%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          <linearGradient id="shirt-bouncer-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e222b" />
            <stop offset="55%" stopColor="#111318" />
            <stop offset="100%" stopColor="#07080a" />
          </linearGradient>

          <linearGradient id="shirt-butcher-tee" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#343b32" />
            <stop offset="60%" stopColor="#20251f" />
            <stop offset="100%" stopColor="#111410" />
          </linearGradient>

          <linearGradient id="shirt-butcher-apron" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f3c33" />
            <stop offset="55%" stopColor="#33251f" />
            <stop offset="100%" stopColor="#1c1410" />
          </linearGradient>

          <linearGradient id="shirt-tactical-under" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c3745" />
            <stop offset="60%" stopColor="#192029" />
            <stop offset="100%" stopColor="#0e1318" />
          </linearGradient>

          <linearGradient id="shirt-kevlar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#232830" />
            <stop offset="50%" stopColor="#15181e" />
            <stop offset="100%" stopColor="#0b0d11" />
          </linearGradient>

          <linearGradient id="shirt-titan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64646e" />
            <stop offset="38%" stopColor="#36363d" />
            <stop offset="72%" stopColor="#202025" />
            <stop offset="100%" stopColor="#101013" />
          </linearGradient>

          <pattern id="shirt-titan-hazard" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
            <rect width="12" height="12" fill="#18181b" />
            <rect width="6" height="12" fill="#f59e0b" opacity="0.88" />
          </pattern>

          {/* Primal / Monster Outfit Gradients */}
          <linearGradient id="shirt-pelt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9a6338" />
            <stop offset="52%" stopColor="#693e1e" />
            <stop offset="100%" stopColor="#3b200d" />
          </linearGradient>

          <linearGradient id="shirt-wolf-fur-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="52%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <linearGradient id="shirt-ogre-leather" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5c3a24" />
            <stop offset="52%" stopColor="#382213" />
            <stop offset="100%" stopColor="#1c1008" />
          </linearGradient>

          <linearGradient id="shirt-bronze-plate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a17b50" />
            <stop offset="45%" stopColor="#6e4e2e" />
            <stop offset="100%" stopColor="#2e1f11" />
          </linearGradient>

          <linearGradient id="shirt-titan-linen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dfd8cc" />
            <stop offset="55%" stopColor="#a89f91" />
            <stop offset="100%" stopColor="#5e574d" />
          </linearGradient>

          {/* Iconic Boss Outfit Gradients */}
          <linearGradient id="shirt-trevor-tank" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2ddd3" />
            <stop offset="52%" stopColor="#bdb4a4" />
            <stop offset="100%" stopColor="#857b6d" />
          </linearGradient>

          <linearGradient id="shirt-continental-suit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#27272e" />
            <stop offset="50%" stopColor="#141418" />
            <stop offset="100%" stopColor="#070709" />
          </linearGradient>

          <linearGradient id="shirt-spartan-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4a054" />
            <stop offset="45%" stopColor="#8f6224" />
            <stop offset="100%" stopColor="#3d2709" />
          </linearGradient>

          <linearGradient id="shirt-wolverine-yellow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="52%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          <linearGradient id="shirt-witcher-leather" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2c2f38" />
            <stop offset="52%" stopColor="#16181e" />
            <stop offset="100%" stopColor="#08090c" />
          </linearGradient>

          <linearGradient id="shirt-joker-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7e22ce" />
            <stop offset="50%" stopColor="#581c87" />
            <stop offset="100%" stopColor="#2e1065" />
          </linearGradient>

          <linearGradient id="shirt-infinity-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="42%" stopColor="#eab308" />
            <stop offset="78%" stopColor="#a16207" />
            <stop offset="100%" stopColor="#422006" />
          </linearGradient>

          <linearGradient id="shirt-arthur-coat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b08052" />
            <stop offset="48%" stopColor="#754f2b" />
            <stop offset="100%" stopColor="#3b2511" />
          </linearGradient>

          <linearGradient id="shirt-arthur-chambray" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c98ad" />
            <stop offset="52%" stopColor="#516c82" />
            <stop offset="100%" stopColor="#2e4152" />
          </linearGradient>

          <linearGradient id="arthur-hat-leather" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#332c27" />
            <stop offset="46%" stopColor="#1c1815" />
            <stop offset="100%" stopColor="#090807" />
          </linearGradient>

          {/* Organic Subcutaneous Bruise Displacement & Diffusion Filter */}
          <filter id="bruise-organic" x="-35%" y="-35%" width="170%" height="170%">
            <feTurbulence type="fractalNoise" baseFrequency="0.085" numOctaves="3" seed="17" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" result="warped" />
            <feGaussianBlur in="warped" stdDeviation="2.4" />
          </filter>

          {/* Crisp Organic Wet Blood Splatter Distortion (no heavy blur) */}
          <filter id="blood-splatter-warp" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.14" numOctaves="3" seed="29" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="7.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Reactive Impact Shockwave Vibration & Directional Micro-Shift Filter */}
          <filter id="impact-shock-warp" x="-14%" y="-14%" width="128%" height="128%">
            <feTurbulence
              ref={impactTurbulenceRef}
              type="fractalNoise"
              baseFrequency="0.022 0.042"
              numOctaves="2"
              seed="7"
              result="shockNoise"
            />
            <feDisplacementMap
              ref={impactDisplaceRef}
              in="SourceGraphic"
              in2="shockNoise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="warped"
            />
            <feOffset ref={impactOffsetRef} in="warped" dx="0" dy="0" />
          </filter>

          {/* Multi-Zone Hemoglobin Breakdown Halo (yellow-olive-brown outer stain) */}
          <radialGradient id="bruise-halo-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b0764" stopOpacity="0.48" />
            <stop offset="46%" stopColor="#4c1d95" stopOpacity="0.34" />
            <stop offset="72%" stopColor="#854d0e" stopOpacity="0.28" />
            <stop offset="88%" stopColor="#65a30d" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#713f12" stopOpacity="0" />
          </radialGradient>

          {/* Deep Subcutaneous Clotted Hematoma Core */}
          <radialGradient id="bruise-core-grad" cx="48%" cy="46%" r="52%">
            <stop offset="0%" stopColor="#2a0409" stopOpacity="0.72" />
            <stop offset="38%" stopColor="#581c87" stopOpacity="0.54" />
            <stop offset="72%" stopColor="#1e1b4b" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
          </radialGradient>

          {/* Periorbital Black-Eye Pooling Gradient */}
          <radialGradient id="periorbital-grad" cx="50%" cy="54%" r="54%">
            <stop offset="0%" stopColor="#1a0510" stopOpacity="0.76" />
            <stop offset="35%" stopColor="#4c0519" stopOpacity="0.62" />
            <stop offset="65%" stopColor="#2e1065" stopOpacity="0.44" />
            <stop offset="86%" stopColor="#713f12" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#713f12" stopOpacity="0" />
          </radialGradient>

          {/* Cylindrical Forearm & Hand Skin Gradients */}
          <linearGradient id="forearm-skin-l" x1="0%" y1="0%" x2="100%" y2="30%">
            <stop offset="0%" stopColor="#241008" />
            <stop offset="28%" stopColor={enemy.skinShadow} />
            <stop offset="66%" stopColor={enemy.skinColor} />
            <stop offset="100%" stopColor={enemy.skinShadow} />
          </linearGradient>
          <linearGradient id="forearm-skin-r" x1="100%" y1="0%" x2="0%" y2="30%">
            <stop offset="0%" stopColor="#241008" />
            <stop offset="28%" stopColor={enemy.skinShadow} />
            <stop offset="66%" stopColor={enemy.skinColor} />
            <stop offset="100%" stopColor={enemy.skinShadow} />
          </linearGradient>

          {/* Boxing Hand-Wrap Cloth Gradient */}
          <linearGradient id="hand-wrap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e4e4e7" />
            <stop offset="52%" stopColor="#d4d4d8" />
            <stop offset="100%" stopColor="#71717a" />
          </linearGradient>

          {/* Shoulder / Deltoid 3D Shading */}
          <radialGradient id="shoulder-skin-l" cx="62%" cy="30%" r="70%">
            <stop offset="0%" stopColor={enemy.skinColor} />
            <stop offset="65%" stopColor={enemy.skinShadow} />
            <stop offset="100%" stopColor="#1b0d07" />
          </radialGradient>
          <radialGradient id="shoulder-skin-r" cx="38%" cy="30%" r="70%">
            <stop offset="0%" stopColor={enemy.skinColor} />
            <stop offset="65%" stopColor={enemy.skinShadow} />
            <stop offset="100%" stopColor="#1b0d07" />
          </radialGradient>

          {/* Smooth Studio Bust Fade Mask at Lower Edge */}
          <linearGradient id="bust-fade-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="86%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <mask id="bust-fade-mask">
            <rect x="-20" y="0" width="360" height="430" fill="url(#bust-fade-grad)" />
          </mask>

          <BossSvgDefs />

          {/* Full Character Silhouette Clip for Real-Time Gravity Blood Streams (Head + Ears + Neck + Shoulders/Chest) */}
          <clipPath id="face-neck-chest-clip">
            <path d={headOutlinePath} />
            <g transform={anatomy.earOffsetX ? `translate(${-anatomy.earOffsetX}, 0)` : undefined}>
              <path
                d={
                  enemy.species === 'cyclops'
                    ? 'M72,150 C50,136 33,134 29,144 C36,164 43,190 62,208 C70,210 75,200 74,190 Z'
                    : 'M72,150 C52,144 43,160 45,180 C47,196 56,210 68,209 C74,208 75,198 74,190 Z'
                }
              />
            </g>
            <g transform={anatomy.earOffsetX ? `translate(${anatomy.earOffsetX}, 0)` : undefined}>
              <path
                d={
                  enemy.species === 'cyclops'
                    ? 'M248,150 C270,136 287,134 291,144 C284,164 277,190 258,208 C250,210 245,200 246,190 Z'
                    : 'M248,150 C268,144 277,160 275,180 C273,196 264,210 252,209 C246,208 245,198 246,190 Z'
                }
              />
            </g>
            <path d={neckPath} />
            <path d="M0,424 C4,372 24,338 70,326 C88,322 100,322 114,322 L206,322 C220,322 232,322 250,326 C296,338 316,372 320,424 Z" />
          </clipPath>
        </defs>

        <g ref={shockGroupRef} mask="url(#bust-fade-mask)">
        <BossBackProps enemy={enemy} />

        {/* Neck, Trapezius, Sternocleidomastoid & Collarbone Anatomy (Non-Hittable) */}
        <g className="pointer-events-none">
          <path
            d={neckPath}
            fill={enemy.skinShadow}
            stroke="#1a0d08"
            strokeOpacity="0.65"
            strokeWidth="1.8"
          />
          {/* Deep Jaw-to-Neck Cast Shadow */}
          <path
            d={neckPath}
            fill="url(#neck-ao-grad)"
          />
          {/* Sternocleidomastoid (SCM) muscle bands & Suprasternal Hollow */}
          <path
            d="M116,292 Q135,320 151,346 M204,292 Q185,320 169,346"
            fill="none"
            stroke="#241008"
            strokeWidth="5"
            opacity="0.26"
            strokeLinecap="round"
            filter="url(#soft-blur)"
          />
          <path
            d="M118,295 Q136,320 150,344 M202,295 Q184,320 170,344"
            fill="none"
            stroke="#fff7ed"
            strokeWidth="2.2"
            opacity="0.09"
            strokeLinecap="round"
          />
          {/* Adam's Apple & Clavicle Ridges */}
          <ellipse cx="160" cy="316" rx="9" ry="6" fill="#000000" opacity="0.16" filter="url(#soft-blur)" />
          <path d="M153,313 Q160,317 167,313" fill="none" stroke="#fff7ed" strokeWidth="1.5" opacity="0.14" strokeLinecap="round" />
          <path d="M102,340 Q132,342 154,351 M218,340 Q188,342 166,351" fill="none" stroke="#180a05" strokeWidth="2.8" opacity="0.34" strokeLinecap="round" />
          <path d="M104,337 Q132,339 152,347 M216,337 Q188,339 168,347" fill="none" stroke="#fff7ed" strokeWidth="1.4" opacity="0.12" strokeLinecap="round" />

          {(mood === 'angry' || mood === 'crying') && (
            <path
              d="M124,296 L120,316 L126,332 M194,298 L197,318"
              fill="none"
              stroke="#7f1d1d"
              strokeWidth="2"
              opacity="0.58"
              strokeLinecap="round"
            />
          )}
        </g>

        {/* Extended Broad Shoulders, Deltoids, Upper Chest & Tank-Top (Non-Hittable) */}
        <g className="pointer-events-none">
          {/* Left Shoulder / Deltoid & Exposed Trapezius Skin */}
          <path
            d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 L114,424 Z"
            fill="url(#shoulder-skin-l)"
            filter="url(#skin-grit)"
            stroke="#160c08"
            strokeOpacity="0.65"
            strokeWidth="1.8"
          />
          {/* Right Shoulder / Deltoid & Exposed Trapezius Skin */}
          <path
            d="M316,424 C312,376 292,342 246,330 C230,326 218,324 206,324 L206,424 Z"
            fill="url(#shoulder-skin-r)"
            filter="url(#skin-grit)"
            stroke="#160c08"
            strokeOpacity="0.65"
            strokeWidth="1.8"
          />
          {/* Upper Chest Exposed Skin inside Tank-Top Neckline */}
          <path
            d="M104,324 L216,324 L216,396 L104,396 Z"
            fill={enemy.skinShadow}
            filter="url(#skin-grit)"
          />
          {/* Deltoid muscle separation & collar bone highlight */}
          <path d="M52,364 Q42,390 46,418 M268,364 Q278,390 274,418" fill="none" stroke="#180a05" strokeWidth="3.5" opacity="0.28" strokeLinecap="round" filter="url(#soft-blur)" />
          <ellipse cx="46" cy="368" rx="18" ry="12" transform="rotate(-24 46 368)" fill="#fff7ed" opacity="0.09" filter="url(#soft-blur)" />
          <ellipse cx="274" cy="368" rx="18" ry="12" transform="rotate(24 274 368)" fill="#fff7ed" opacity="0.09" filter="url(#soft-blur)" />

          {/* Character-Specific Shirt / Combat Outfit */}
          {hasCustomMiniBossOutfit ? (
            <MiniBossChestOutfit enemy={enemy} />
          ) : (
            <>
          {enemy.shirtStyle === 'tshirt_casual' && (
            <g>
              {/* Weathered Denim-Blue Crew-Neck T-Shirt with Sleeves */}
              <path
                d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 Q160,356 206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
                fill="url(#shirt-casual-grad)"
                stroke="#090d14"
                strokeWidth="2"
              />
              {/* Vintage chest stripes */}
              <path d="M52,374 L268,374 L274,383 L46,383 Z" fill="#f8fafc" opacity="0.24" />
              <path d="M44,387 L276,387 L279,393 L41,393 Z" fill="#f59e0b" opacity="0.55" />
              {/* Ribbed crew-neck collar */}
              <path d="M108,324 Q160,362 212,324" fill="none" stroke="#152840" strokeWidth="7" strokeLinecap="round" />
              <path d="M108,324 Q160,362 212,324" fill="none" stroke="#4773a6" strokeWidth="2.2" strokeLinecap="round" opacity="0.58" />
              <path d="M105,329 Q160,369 215,329" fill="none" stroke="#090d14" strokeWidth="1.4" strokeLinecap="round" />
              {/* Sleeve seams & cotton folds */}
              <path d="M68,334 C60,366 52,396 42,424 M252,334 C260,366 268,396 278,424" fill="none" stroke="#0c1524" strokeWidth="2.2" opacity="0.65" />
              <path d="M110,364 Q138,374 156,372 M210,364 Q182,374 164,372" fill="none" stroke="#0a121f" strokeWidth="2.4" opacity="0.48" strokeLinecap="round" />
            </g>
          )}

          {enemy.shirtStyle === 'flannel_open' && (
            <g>
              {/* Worn Off-White Ribbed Undershirt */}
              <path
                d="M96,324 Q160,368 224,324 L232,424 L88,424 Z"
                fill="url(#shirt-undershirt-grad)"
                stroke="#3f3b36"
                strokeWidth="1.5"
              />
              <path d="M106,325 Q160,372 214,325" fill="none" stroke="#a8a29e" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M144,352 L143,414 M160,355 L160,418 M176,352 L177,414" fill="none" stroke="#78716c" strokeWidth="1.1" opacity="0.28" />
              {/* Open Crimson & Charcoal Plaid Flannel Shirt Panels */}
              <path
                d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 L132,336 L142,424 Z"
                fill="url(#shirt-flannel-pat)"
                stroke="#140808"
                strokeWidth="2"
              />
              <path
                d="M316,424 C312,376 292,342 246,330 C230,326 218,324 206,324 L188,336 L178,424 Z"
                fill="url(#shirt-flannel-pat)"
                stroke="#140808"
                strokeWidth="2"
              />
              {/* Folded Shirt Collar & Lapels */}
              <path d="M105,324 L134,344 L123,365 L94,336 Z" fill="url(#shirt-flannel-pat)" stroke="#140808" strokeWidth="1.6" />
              <path d="M215,324 L186,344 L197,365 L226,336 Z" fill="url(#shirt-flannel-pat)" stroke="#140808" strokeWidth="1.6" />
              {/* Chest Pocket & Metallic Buttons */}
              <path d="M204,370 L238,370 L236,406 L206,406 Z" fill="url(#shirt-flannel-pat)" stroke="#140808" strokeWidth="1.5" opacity="0.92" />
              <circle cx="136" cy="368" r="2.6" fill="#d6d3d1" stroke="#1c1917" strokeWidth="0.9" />
              <circle cx="139" cy="396" r="2.6" fill="#d6d3d1" stroke="#1c1917" strokeWidth="0.9" />
              <path d="M68,334 C60,366 52,396 42,424 M252,334 C260,366 268,396 278,424" fill="none" stroke="#140808" strokeWidth="2.2" opacity="0.65" />
            </g>
          )}

          {enemy.shirtStyle === 'leather_punk' && (
            <g>
              {/* Sleeveless Washed-Charcoal Street Tee Base */}
              <path
                d="M44,424 C50,392 60,368 74,330 L108,325 Q160,368 212,325 L246,330 C260,368 270,392 276,424 Z"
                fill="#1f1f24"
                stroke="#09090b"
                strokeWidth="1.8"
              />
              {/* Torn Tee Collar & Distressed Slashes */}
              <path d="M108,325 Q160,370 212,325" fill="none" stroke="#3f3f46" strokeWidth="3.6" strokeLinecap="round" />
              <path d="M142,380 L178,376 M146,392 L174,390" stroke="#09090b" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              {/* Cut-Off Biker Leather Vest Panels */}
              <path
                d="M42,424 C48,392 58,368 72,330 L108,324 L136,368 L140,424 Z"
                fill="url(#shirt-leather-grad)"
                stroke="#050507"
                strokeWidth="2"
              />
              <path
                d="M278,424 C272,392 262,368 248,330 L212,324 L184,368 L180,424 Z"
                fill="url(#shirt-leather-grad)"
                stroke="#050507"
                strokeWidth="2"
              />
              {/* Notched Leather Lapels + Silver Punk Studs & Diagonal Zipper */}
              <path d="M106,324 L142,356 L124,380 L88,342 Z" fill="#232329" stroke="#09090b" strokeWidth="1.6" />
              <path d="M214,324 L178,356 L196,380 L232,342 Z" fill="#232329" stroke="#09090b" strokeWidth="1.6" />
              <path d="M134,366 L140,422" stroke="#a1a1aa" strokeWidth="2.4" strokeDasharray="3,2" />
              <path d="M186,366 L180,422" stroke="#71717a" strokeWidth="1.6" />
              {/* Metallic Studs */}
              {[
                { cx: 103, cy: 339 },
                { cx: 112, cy: 350 },
                { cx: 121, cy: 361 },
                { cx: 217, cy: 339 },
                { cx: 208, cy: 350 },
                { cx: 199, cy: 361 },
                { cx: 76, cy: 344 },
                { cx: 244, cy: 344 },
              ].map((s, idx) => (
                <g key={`stud-${idx}`}>
                  <circle cx={s.cx} cy={s.cy} r="2.7" fill="#d4d4d8" stroke="#18181b" strokeWidth="0.9" />
                  <circle cx={s.cx - 0.6} cy={s.cy - 0.6} r="0.9" fill="#ffffff" opacity="0.85" />
                </g>
              ))}
            </g>
          )}

          {enemy.shirtStyle === 'boxing_tank' && (
            <g>
              {/* Sleeveless Crimson Satin Boxing Singlet */}
              <path
                d="M46,424 C52,390 62,366 76,330 L108,325 Q160,378 212,325 L244,330 C258,366 268,390 274,424 Z"
                fill="url(#shirt-boxing-grad)"
                stroke="#290404"
                strokeWidth="2"
              />
              {/* Metallic Gold Trim along Collar & Armholes */}
              <path d="M108,325 Q160,378 212,325" fill="none" stroke="url(#shirt-gold-trim)" strokeWidth="5.2" strokeLinecap="round" />
              <path d="M76,330 C68,368 62,396 48,424 M244,330 C252,368 258,396 272,424" fill="none" stroke="url(#shirt-gold-trim)" strokeWidth="4.6" strokeLinecap="round" />
              {/* Vertical Gold Athletic Side Piping */}
              <path d="M84,334 L72,424 M236,334 L248,424" fill="none" stroke="#fbbf24" strokeWidth="2.2" opacity="0.72" />
              {/* Satin Chest Highlights & Pectoral Folds */}
              <ellipse cx="128" cy="378" rx="20" ry="9" fill="#fca5a5" opacity="0.12" filter="url(#soft-blur)" />
              <ellipse cx="192" cy="378" rx="20" ry="9" fill="#fca5a5" opacity="0.12" filter="url(#soft-blur)" />
              <path d="M106,386 Q135,396 156,393 M214,386 Q185,396 164,393" fill="none" stroke="#2d0404" strokeWidth="2.6" opacity="0.62" strokeLinecap="round" />
              {/* Championship Diamond Crest on Sternum */}
              <path d="M160,376 L173,390 L160,404 L147,390 Z" fill="#2a0404" stroke="url(#shirt-gold-trim)" strokeWidth="2.2" />
              <path d="M160,382 L166,390 L160,398 L154,390 Z" fill="url(#shirt-gold-trim)" opacity="0.9" />
            </g>
          )}

          {enemy.shirtStyle === 'bouncer_polo' && (
            <g>
              {/* Tailored Black Security Polo Shirt */}
              <path
                d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 Q160,350 206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
                fill="url(#shirt-bouncer-grad)"
                stroke="#030305"
                strokeWidth="2"
              />
              {/* Structured Polo Collar & 2-Button Placket */}
              <path d="M150,342 L170,342 L170,398 L150,398 Z" fill="#161920" stroke="#050608" strokeWidth="1.4" />
              <path d="M108,323 L154,352 L140,368 L98,334 Z" fill="#1f242e" stroke="#050608" strokeWidth="1.6" />
              <path d="M212,323 L166,352 L180,368 L222,334 Z" fill="#1f242e" stroke="#050608" strokeWidth="1.6" />
              <circle cx="160" cy="360" r="2.6" fill="#0f172a" stroke="#475569" strokeWidth="0.9" />
              <circle cx="160" cy="380" r="2.6" fill="#0f172a" stroke="#475569" strokeWidth="0.9" />
              {/* Gold Security Shield Badge on Left Chest */}
              <path d="M208,366 L228,366 L228,384 Q218,396 208,384 Z" fill="url(#shirt-gold-trim)" stroke="#451a03" strokeWidth="1.3" />
              <path d="M213,371 L223,371 L223,381 Q218,388 213,381 Z" fill="#1e293b" opacity="0.65" />
              {/* Coiled Covert Security Earpiece Wire */}
              <path
                d="M206,294 Q216,312 208,330 Q218,342 208,354 Q218,366 212,380"
                fill="none"
                stroke="#27272a"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path d="M68,334 C60,366 52,396 42,424 M252,334 C260,366 268,396 278,424" fill="none" stroke="#050608" strokeWidth="2.2" opacity="0.65" />
            </g>
          )}

          {enemy.shirtStyle === 'butcher_apron' && (
            <g>
              {/* Grimy Dark Olive Henley Shirt Underneath */}
              <path
                d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 Q160,356 206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
                fill="url(#shirt-butcher-tee)"
                stroke="#0c0e0b"
                strokeWidth="2"
              />
              <path d="M108,324 Q160,358 212,324" fill="none" stroke="#181c17" strokeWidth="5" strokeLinecap="round" />
              {/* Heavy Butcher Leather/Canvas Apron & Shoulder Straps */}
              <path d="M88,327 L108,325 L106,374 L84,374 Z" fill="url(#shirt-butcher-apron)" stroke="#140c08" strokeWidth="1.8" />
              <path d="M232,327 L212,325 L214,374 L236,374 Z" fill="url(#shirt-butcher-apron)" stroke="#140c08" strokeWidth="1.8" />
              <path
                d="M84,362 Q160,372 236,362 L248,424 L72,424 Z"
                fill="url(#shirt-butcher-apron)"
                stroke="#140c08"
                strokeWidth="2.2"
              />
              {/* Stitched Bib Seam & Brass Rivets */}
              <path d="M88,368 Q160,378 232,368" fill="none" stroke="#a88b73" strokeWidth="1.4" strokeDasharray="4,3" opacity="0.65" />
              <circle cx="96" cy="368" r="3.4" fill="#d97706" stroke="#291505" strokeWidth="1" />
              <circle cx="224" cy="368" r="3.4" fill="#d97706" stroke="#291505" strokeWidth="1" />
              {/* Baked-In Grime & Old Dried Blood Stains on Apron */}
              <path d="M118,382 Q132,395 124,418 Q106,408 118,382 Z" fill="#450a0a" opacity="0.52" filter="url(#soft-blur)" />
              <path d="M188,388 Q208,396 202,422 Q180,416 188,388 Z" fill="#2a0404" opacity="0.58" filter="url(#soft-blur)" />
              <path d="M150,394 Q166,402 158,420" stroke="#7f1d1d" strokeWidth="4.5" strokeLinecap="round" opacity="0.48" fill="none" />
            </g>
          )}

          {enemy.shirtStyle === 'tactical_vest' && (
            <g>
              {/* Dark Slate Combat Under-Shirt */}
              <path
                d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 Q160,350 206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
                fill="url(#shirt-tactical-under)"
                stroke="#090d12"
                strokeWidth="2"
              />
              <path d="M108,324 Q160,352 212,324" fill="none" stroke="#334155" strokeWidth="5.5" strokeLinecap="round" />
              {/* Kevlar Ballistic Plate Carrier + Shoulder Straps */}
              <path d="M84,328 L112,324 L116,360 L82,360 Z" fill="url(#shirt-kevlar-grad)" stroke="#05070a" strokeWidth="1.8" />
              <path d="M236,328 L208,324 L204,360 L238,360 Z" fill="url(#shirt-kevlar-grad)" stroke="#05070a" strokeWidth="1.8" />
              <path
                d="M78,354 L116,354 L126,368 L194,368 L204,354 L242,354 L252,424 L68,424 Z"
                fill="url(#shirt-kevlar-grad)"
                stroke="#05070a"
                strokeWidth="2.2"
              />
              {/* Shoulder Buckles, MOLLE Webbing & Red Tactical Stripe */}
              <rect x="86" y="340" width="24" height="10" rx="2" fill="#334155" stroke="#090d12" strokeWidth="1.2" />
              <rect x="210" y="340" width="24" height="10" rx="2" fill="#334155" stroke="#090d12" strokeWidth="1.2" />
              <rect x="128" y="378" width="64" height="7" rx="1.5" fill="#dc2626" opacity="0.85" />
              <path d="M90,396 L230,396 M86,408 L234,408 M84,420 L236,420" stroke="#334155" strokeWidth="3.2" strokeDasharray="12,5" />
              {/* Glowing Telemetry Chest Node */}
              <circle cx="216" cy="378" r="4.2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
              <circle cx="216" cy="378" r="2.2" fill="#38bdf8" opacity="0.95" />
            </g>
          )}

          {enemy.shirtStyle === 'titanium_armor' && (
            <g>
              {/* Brushed-Titanium Exo-Collar & Heavy Cybernetic Chest Armor */}
              <path
                d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 L132,348 L188,348 L206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
                fill="url(#shirt-titan-grad)"
                stroke="#09090b"
                strokeWidth="2.4"
              />
              {/* Heavy Armored Shoulder Pauldrons with Hazard Stripes */}
              <path d="M10,418 C16,374 34,344 76,332 L98,358 L78,424 Z" fill="#27272a" stroke="#09090b" strokeWidth="2" />
              <path d="M310,418 C304,374 286,344 244,332 L222,358 L242,424 Z" fill="#27272a" stroke="#09090b" strokeWidth="2" />
              <path d="M38,360 L74,344 L84,358 L46,376 Z" fill="url(#shirt-titan-hazard)" stroke="#09090b" strokeWidth="1.2" />
              <path d="M282,360 L246,344 L236,358 L274,376 Z" fill="url(#shirt-titan-hazard)" stroke="#09090b" strokeWidth="1.2" />
              {/* Hydraulic Neck-to-Clavicle Struts & Armored Collar Rim */}
              <path d="M110,325 L128,352 L192,352 L210,325" fill="none" stroke="#a1a1aa" strokeWidth="3.2" opacity="0.7" />
              <path d="M118,308 L110,342 M202,308 L210,342" stroke="#71717a" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M118,308 L110,342 M202,308 L210,342" stroke="#d4d4d8" strokeWidth="1.6" strokeLinecap="round" />
              {/* Beveled Chest Armor Seam & Bolts */}
              <path d="M96,368 L138,384 L182,384 L224,368" fill="none" stroke="#09090b" strokeWidth="2.6" />
              <path d="M96,370 L138,386 L182,386 L224,370" fill="none" stroke="#a1a1aa" strokeWidth="1" opacity="0.5" />
              {[
                { cx: 102, cy: 356 },
                { cx: 218, cy: 356 },
                { cx: 118, cy: 404 },
                { cx: 202, cy: 404 },
              ].map((b, idx) => (
                <circle key={`armor-bolt-${idx}`} cx={b.cx} cy={b.cy} r="2.8" fill="#a1a1aa" stroke="#18181b" strokeWidth="1" />
              ))}
              {/* Glowing Amber-Orange Reactor Core */}
              <polygon points="160,378 178,390 171,412 149,412 142,390" fill="#18181b" stroke="#71717a" strokeWidth="1.8" />
              <circle cx="160" cy="396" r="10.5" fill="#78350f" stroke="#f59e0b" strokeWidth="1.6" />
              <circle cx="160" cy="396" r="5.5" fill="#fef08a" opacity="0.95" />
            </g>
          )}

          {enemy.shirtStyle === 'pelt_fur' && (
            <g>
              {/* Asymmetric Cave-Pelt Tunic across Left Shoulder & Chest + Bone Fang Necklace */}
              <path
                d="M12,424 C18,378 36,342 74,330 L114,324 L168,376 L262,402 L268,424 Z"
                fill="url(#shirt-pelt-grad)"
                stroke="#1c0d04"
                strokeWidth="2.2"
              />
              {/* Spotted Saber-Tooth / Cave-Bear Pelt Markings */}
              <ellipse cx="66" cy="368" rx="9" ry="6" transform="rotate(-18 66 368)" fill="#2e1607" opacity="0.65" />
              <ellipse cx="102" cy="396" rx="11" ry="7" transform="rotate(14 102 396)" fill="#2e1607" opacity="0.6" />
              <ellipse cx="152" cy="408" rx="8" ry="5" fill="#2e1607" opacity="0.58" />
              <ellipse cx="88" cy="350" rx="6" ry="4" fill="#2e1607" opacity="0.55" />
              {/* Jagged Fur Collar Edge */}
              <path
                d="M108,325 L120,338 L130,334 L140,352 L152,348 L164,368 L178,364 L196,382 L214,380 L236,396 L262,402"
                fill="none"
                stroke="#b88456"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.72"
              />
              {/* Rawhide Necklace with Carved Bone Fangs */}
              <path d="M114,326 Q160,368 206,326" fill="none" stroke="#2e1a0c" strokeWidth="2.6" strokeLinecap="round" />
              <polygon points="144,347 148,365 153,348" fill="#efe9dc" stroke="#3b2818" strokeWidth="0.9" />
              <polygon points="157,351 160,374 164,351" fill="#efe9dc" stroke="#3b2818" strokeWidth="0.9" />
              <polygon points="168,348 172,365 176,347" fill="#efe9dc" stroke="#3b2818" strokeWidth="0.9" />
            </g>
          )}

          {enemy.shirtStyle === 'war_pelt' && (
            <g>
              {/* Dark Hide Tunic Underneath */}
              <path
                d="M18,424 C24,378 40,344 76,330 L244,330 C280,344 296,378 302,424 Z"
                fill="#332318"
                stroke="#140c06"
                strokeWidth="2"
              />
              {/* Thick Frost-Wolf Fur Mantle Over Shoulders */}
              <path
                d="M6,406 C14,364 34,334 74,326 L112,324 Q160,356 208,324 L246,326 C286,334 306,364 314,406 L274,386 L252,398 L216,372 L182,388 L160,374 L138,388 L104,372 L68,398 L46,386 Z"
                fill="url(#shirt-wolf-fur-grad)"
                stroke="#1e293b"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Fur Tuft Lines & Bone Clasp */}
              <path d="M74,342 L66,368 M96,338 L92,366 M246,342 L254,368 M224,338 L228,366" stroke="#f8fafc" strokeWidth="1.6" opacity="0.45" strokeLinecap="round" />
              <path d="M126,356 L194,356" stroke="#1c120a" strokeWidth="4" strokeLinecap="round" />
              <circle cx="132" cy="356" r="5" fill="#e7e5e4" stroke="#292524" strokeWidth="1.3" />
              <circle cx="188" cy="356" r="5" fill="#e7e5e4" stroke="#292524" strokeWidth="1.3" />
              <polygon points="154,360 160,388 166,360" fill="#e7e5e4" stroke="#292524" strokeWidth="1.1" />
            </g>
          )}

          {enemy.shirtStyle === 'ogre_harness' && (
            <g>
              {/* Tattered Swamp Burlap Shoulder Rag (Right) */}
              <path
                d="M214,324 L246,330 C276,342 294,368 302,414 L256,396 L236,412 L220,378 Z"
                fill="#4a4232"
                stroke="#1c1810"
                strokeWidth="1.8"
              />
              {/* Heavy Diagonal Scarred Leather Chest Strap + Iron Ring */}
              <path
                d="M54,338 L86,326 L186,424 L142,424 Z"
                fill="url(#shirt-ogre-leather)"
                stroke="#0f0804"
                strokeWidth="2.2"
              />
              <path
                d="M206,362 L252,334 L268,350 L216,382 Z"
                fill="url(#shirt-ogre-leather)"
                stroke="#0f0804"
                strokeWidth="2"
              />
              {/* Forged Iron Harness Ring & Leather Stitching */}
              <circle cx="174" cy="382" r="14" fill="none" stroke="#52525b" strokeWidth="5.5" />
              <circle cx="174" cy="382" r="14" fill="none" stroke="#a1a1aa" strokeWidth="1.4" opacity="0.55" />
              <circle cx="96" cy="352" r="3.2" fill="#71717a" stroke="#18181b" strokeWidth="1" />
              <circle cx="122" cy="374" r="3.2" fill="#71717a" stroke="#18181b" strokeWidth="1" />
            </g>
          )}

          {enemy.shirtStyle === 'barbarian_plate' && (
            <g>
              {/* Forged Bronze/Iron Spiked Pauldron on Left Shoulder */}
              <path
                d="M6,416 C12,370 32,338 78,326 L106,338 L94,394 L46,424 Z"
                fill="url(#shirt-bronze-plate)"
                stroke="#140d07"
                strokeWidth="2.4"
              />
              {/* Pauldron Spikes */}
              <polygon points="34,344 18,322 48,334" fill="#a1a1aa" stroke="#18181b" strokeWidth="1.4" />
              <polygon points="56,334 48,312 72,328" fill="#a1a1aa" stroke="#18181b" strokeWidth="1.4" />
              {/* Studded Leather Cross-Chest Straps */}
              <path d="M90,342 L268,408 L260,424 L82,362 Z" fill="url(#shirt-ogre-leather)" stroke="#0f0804" strokeWidth="2" />
              <path d="M236,334 L256,342 L176,424 L148,424 Z" fill="url(#shirt-ogre-leather)" stroke="#0f0804" strokeWidth="2" />
              {[
                { cx: 112, cy: 362 },
                { cx: 142, cy: 374 },
                { cx: 192, cy: 394 },
                { cx: 222, cy: 360 },
              ].map((st, idx) => (
                <circle key={`barb-stud-${idx}`} cx={st.cx} cy={st.cy} r="3.2" fill="#d97706" stroke="#291505" strokeWidth="1" />
              ))}
            </g>
          )}

          {enemy.shirtStyle === 'titan_wraps' && (
            <g>
              {/* Ancient Tattered Colossus Gauze / Linen Chest Wraps */}
              <path d="M48,342 L104,324 L208,424 L152,424 Z" fill="url(#shirt-titan-linen)" stroke="#3b362e" strokeWidth="1.8" />
              <path d="M274,344 L218,324 L118,424 L174,424 Z" fill="url(#shirt-titan-linen)" stroke="#3b362e" strokeWidth="1.8" />
              <path d="M36,378 Q160,396 284,378 L292,406 Q160,422 28,406 Z" fill="url(#shirt-titan-linen)" stroke="#3b362e" strokeWidth="1.8" />
              {/* Cloth Fold Shadows & Grime */}
              <path d="M62,388 Q160,404 258,388 M94,350 L172,418 M226,350 L152,418" fill="none" stroke="#4a4339" strokeWidth="2" opacity="0.55" />
            </g>
          )}

          {enemy.shirtStyle === 'titan_chains' && (
            <g>
              {/* Torn Crimson-Black War Sash Across Chest */}
              <path d="M210,324 L256,334 L124,424 L74,424 Z" fill="#5c0b0b" stroke="#1c0404" strokeWidth="2" />
              <path d="M236,336 L108,422" stroke="#991b1b" strokeWidth="3" opacity="0.55" />
              {/* Heavy Iron Neck Collar Shackle & Broken Chain Links */}
              <path
                d="M104,326 Q160,362 216,326"
                fill="none"
                stroke="#3f3f46"
                strokeWidth="11"
                strokeLinecap="round"
              />
              <path
                d="M104,326 Q160,362 216,326"
                fill="none"
                stroke="#a1a1aa"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.55"
              />
              {/* Broken Hanging Chain Links */}
              <ellipse cx="126" cy="356" rx="6.5" ry="10" fill="none" stroke="#52525b" strokeWidth="3.5" />
              <ellipse cx="124" cy="373" rx="6" ry="9" transform="rotate(14 124 373)" fill="none" stroke="#3f3f46" strokeWidth="3.5" />
              <ellipse cx="196" cy="356" rx="6.5" ry="10" fill="none" stroke="#52525b" strokeWidth="3.5" />
              <ellipse cx="200" cy="373" rx="6" ry="9" transform="rotate(-16 200 373)" fill="none" stroke="#3f3f46" strokeWidth="3.5" />
            </g>
          )}

          {/* Boss Outfits */}
          {enemy.shirtStyle === 'trevor_tee' && (
            <g>
              {/* Signature Trevor Philips "CUT HERE" Dashed Throat Tattoo */}
              <path
                d="M114,326 Q160,342 206,326"
                fill="none"
                stroke="#1e293b"
                strokeWidth="2.1"
                strokeDasharray="5,4"
                opacity="0.72"
              />
              <text
                x="160"
                y="347"
                textAnchor="middle"
                fill="#1e293b"
                fontSize="6.8"
                fontWeight="800"
                letterSpacing="1.2"
                opacity="0.65"
                fontFamily="monospace"
              >
                CUT HERE
              </text>

              {/* Filthy Sweat-Stained Off-White Ribbed Tank Top (Wife-Beater) */}
              <path
                d="M42,424 C48,390 60,362 74,330 L102,326 Q160,382 218,326 L246,330 C260,362 272,390 278,424 Z"
                fill="url(#shirt-trevor-tank)"
                stroke="#3f372e"
                strokeWidth="2"
              />
              {/* Exposed Chest Hair Tufts above Low Scoop Neckline */}
              <path
                d="M142,354 L145,361 M154,358 L155,365 M166,358 L165,365 M178,354 L175,361 M158,366 L162,372"
                stroke="#2b1e16"
                strokeWidth="1.2"
                opacity="0.52"
                strokeLinecap="round"
              />
              {/* Ribbed Tank Vertical Texture & Neckline Binding */}
              <path
                d="M104,327 Q160,385 216,327"
                fill="none"
                stroke="#78716c"
                strokeWidth="4.2"
                strokeLinecap="round"
                opacity="0.72"
              />
              <path
                d="M84,358 L78,424 M114,376 L112,424 M136,386 L136,424 M160,388 L160,424 M184,386 L184,424 M206,376 L208,424 M236,358 L242,424"
                stroke="#78716c"
                strokeWidth="1.15"
                opacity="0.32"
              />
              {/* Grime, Sweat Rings, Oil & Dried Blood Stains */}
              <ellipse cx="102" cy="396" rx="18" ry="12" fill="#786b59" opacity="0.36" filter="url(#soft-blur)" />
              <ellipse cx="212" cy="388" rx="20" ry="11" fill="#8c7d6b" opacity="0.32" filter="url(#soft-blur)" />
              <ellipse cx="170" cy="410" rx="13" ry="8" fill="#7f1d1d" opacity="0.28" filter="url(#soft-blur)" />
              <circle cx="132" cy="398" r="3.5" fill="#7f1d1d" opacity="0.4" />
              <circle cx="222" cy="406" r="4.5" fill="#574c3e" opacity="0.35" />
            </g>
          )}

          {enemy.shirtStyle === 'continental_suit' && (
            <g>
              {/* All-Black John Wick Continental Suit (Charcoal Dress Shirt + Jet-Black Silk Tie + Obsidian Blazer) */}
              <path d="M104,324 L216,324 L182,424 L138,424 Z" fill="#1e1f25" stroke="#09090b" strokeWidth="1.4" />
              <polygon points="151,354 169,354 165,367 155,367" fill="#050507" stroke="#27272a" strokeWidth="0.8" />
              <polygon points="155,367 165,367 168,424 152,424" fill="#09090b" stroke="#000000" strokeWidth="1" />
              <polygon points="112,324 151,354 128,365" fill="#272830" stroke="#09090b" strokeWidth="1.2" />
              <polygon points="208,324 169,354 192,365" fill="#272830" stroke="#09090b" strokeWidth="1.2" />
              {/* Tailored Obsidian Suit Jacket */}
              <path
                d="M14,424 C20,378 38,342 74,330 L110,324 L148,424 Z"
                fill="url(#shirt-continental-suit)"
                stroke="#050507"
                strokeWidth="2"
              />
              <path
                d="M306,424 C300,378 282,342 246,330 L210,324 L172,424 Z"
                fill="url(#shirt-continental-suit)"
                stroke="#050507"
                strokeWidth="2"
              />
              <polygon points="110,324 134,394 114,398 92,354" fill="#1c1d24" stroke="#050507" strokeWidth="1.3" />
              <polygon points="210,324 186,394 206,398 228,354" fill="#1c1d24" stroke="#050507" strokeWidth="1.3" />
            </g>
          )}

          {enemy.shirtStyle === 'spartan_armor' && (
            <g>
              {/* Crimson Spartan Chest Tattoo on Viewer's RIGHT Side (matching right-side face tattoo) */}
              <path d="M236,336 L266,348 L216,424 L182,424 Z" fill="#8f191d" opacity="0.88" />
              {/* Woven Norse Leather Shoulder Pauldron + Dark Wolf Fur Trim */}
              <path
                d="M6,424 C12,374 32,338 78,326 L108,340 L94,398 L48,424 Z"
                fill="url(#kratos-woven-pat)"
                stroke="#140904"
                strokeWidth="2.4"
              />
              <path
                d="M52,334 Q78,318 108,334 L102,352 Q76,336 48,352 Z"
                fill="#1c1917"
                stroke="#09090b"
                strokeWidth="1.5"
              />
              <path d="M58,336 L66,348 M76,332 L82,344 M92,336 L96,348" stroke="#78716c" strokeWidth="1.6" strokeLinecap="round" />
              {/* Carved Norse Diagonal Baldric Strap & Brass Buckle */}
              <path d="M72,332 L104,324 L214,424 L168,424 Z" fill="#432818" stroke="#140904" strokeWidth="2.2" />
              <path d="M88,334 L194,424" stroke="#925e38" strokeWidth="2.4" opacity="0.6" />
              <circle cx="96" cy="356" r="8.5" fill="url(#shirt-spartan-bronze)" stroke="#1c1104" strokeWidth="1.6" />
              <circle cx="96" cy="356" r="3.5" fill="#432818" />
            </g>
          )}

          {enemy.shirtStyle === 'biker_jacket' && (
            <g>
              <path d="M104,324 L216,324 L196,424 L124,424 Z" fill="#18181b" />
              {/* T-800 Black Biker Leather Jacket with Bullet Holes & Chrome Snaps */}
              <path
                d="M12,424 C18,378 36,342 74,330 L108,324 L152,424 Z"
                fill="url(#shirt-leather-grad)"
                stroke="#050507"
                strokeWidth="2.2"
              />
              <path
                d="M308,424 C302,378 284,342 246,330 L212,324 L168,424 Z"
                fill="url(#shirt-leather-grad)"
                stroke="#050507"
                strokeWidth="2.2"
              />
              <polygon points="108,324 146,386 116,400 84,352" fill="#232329" stroke="#09090b" strokeWidth="1.5" />
              <polygon points="212,324 174,386 204,400 236,352" fill="#232329" stroke="#09090b" strokeWidth="1.5" />
              <path d="M174,352 L198,424" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3,2" opacity="0.7" />
              <circle cx="96" cy="346" r="3" fill="#e2e8f0" />
              <circle cx="224" cy="346" r="3" fill="#e2e8f0" />
              <circle cx="122" cy="390" r="3" fill="#e2e8f0" />
              <circle cx="198" cy="390" r="3" fill="#e2e8f0" />
              {/* Battle-damaged jacket bullet holes */}
              <circle cx="72" cy="382" r="4" fill="#09090b" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="248" cy="374" r="3.5" fill="#09090b" stroke="#94a3b8" strokeWidth="1" />
            </g>
          )}

          {enemy.shirtStyle === 'mutant_suit' && (
            <g>
              {/* Dark Charcoal Logan Crew-Neck Tee Underneath */}
              <path d="M98,324 L222,324 L208,424 L112,424 Z" fill="#111216" stroke="#050507" strokeWidth="1.6" />
              <path d="M112,324 Q160,358 208,324" fill="none" stroke="#27272a" strokeWidth="5.5" strokeLinecap="round" />
              {/* Iconic Dark Navy/Charcoal X-Men Leather Jacket with Bold Yellow Chevrons & Zipper Trim */}
              <path
                d="M14,424 C20,378 38,342 74,330 L108,324 L144,424 Z"
                fill="#162842"
                stroke="#09101d"
                strokeWidth="2.2"
              />
              <path
                d="M306,424 C300,378 282,342 246,330 L212,324 L176,424 Z"
                fill="#162842"
                stroke="#09101d"
                strokeWidth="2.2"
              />
              {/* Bold Yellow-Gold Wolverine Shoulder Panels & Chest Stripes */}
              <polygon points="74,330 108,324 128,360 82,370" fill="url(#shirt-wolverine-yellow)" stroke="#0f172a" strokeWidth="1.5" />
              <polygon points="246,330 212,324 192,360 238,370" fill="url(#shirt-wolverine-yellow)" stroke="#0f172a" strokeWidth="1.5" />
              <polygon points="62,386 114,398 108,414 56,402" fill="url(#shirt-wolverine-yellow)" stroke="#0f172a" strokeWidth="1.2" />
              <polygon points="258,386 206,398 212,414 264,402" fill="url(#shirt-wolverine-yellow)" stroke="#0f172a" strokeWidth="1.2" />
              {/* Metallic Jacket Lapel Zippers & Seam Stitching */}
              <path d="M128,370 L144,424 M192,370 L176,424" stroke="#cbd5e1" strokeWidth="1.9" strokeDasharray="3,2" opacity="0.72" />
              <path d="M44,376 L92,364 M276,376 L228,364" stroke="#3b5984" strokeWidth="1.5" opacity="0.45" strokeLinecap="round" />
              {/* Twin Silver Weapon-X Military Dog Tags on Ball-Chain */}
              <path d="M126,326 Q160,372 194,326" fill="none" stroke="#cbd5e1" strokeWidth="1.6" strokeDasharray="2.2,1.6" />
              <rect x="150" y="353" width="12" height="19" rx="2.5" transform="rotate(-8 156 362)" fill="url(#metal-grad)" stroke="#0f172a" strokeWidth="1.15" />
              <rect x="158" y="355" width="12" height="19" rx="2.5" transform="rotate(6 164 364)" fill="url(#metal-grad)" stroke="#0f172a" strokeWidth="1.15" />
            </g>
          )}

          {enemy.shirtStyle === 'witcher_armor' && (
            <g>
              {/* Dark Studded Witcher Armor */}
              <path
                d="M14,424 C20,378 38,342 74,330 L110,324 L160,356 L210,324 L246,330 C282,342 300,378 306,424 Z"
                fill="url(#shirt-witcher-leather)"
                stroke="#050608"
                strokeWidth="2.2"
              />
              {/* Crossed Sword-Belt Strap & Silver Studs */}
              <path d="M72,332 L100,326 L186,424 L150,424 Z" fill="#2e1e14" stroke="#0f0905" strokeWidth="1.6" />
              <circle cx="88" cy="354" r="2.8" fill="#cbd5e1" />
              <circle cx="108" cy="376" r="2.8" fill="#cbd5e1" />
              <circle cx="222" cy="356" r="2.8" fill="#cbd5e1" />
              {/* Silver Wolf Medallion on Chain */}
              <path d="M126,328 Q160,374 194,328" fill="none" stroke="#cbd5e1" strokeWidth="1.8" />
              <polygon points="160,362 171,372 167,388 153,388 149,372" fill="url(#metal-grad)" stroke="#0f172a" strokeWidth="1.2" />
              <circle cx="156" cy="375" r="1.4" fill="#ef4444" />
              <circle cx="164" cy="375" r="1.4" fill="#ef4444" />
            </g>
          )}

          {enemy.shirtStyle === 'joker_suit' && (
            <g>
              {/* Honeycomb Patterned Dress Shirt + Deep Purple Silk Tie + Emerald Vest */}
              <polygon points="124,324 196,324 184,394 136,394" fill="url(#joker-shirt-pat)" stroke="#1e293b" strokeWidth="1.2" />
              <polygon points="116,324 152,350 132,362" fill="url(#joker-shirt-pat)" stroke="#0f172a" strokeWidth="1.1" />
              <polygon points="204,324 168,350 188,362" fill="url(#joker-shirt-pat)" stroke="#0f172a" strokeWidth="1.1" />
              <polygon points="152,346 168,346 165,360 155,360" fill="#4c1d95" stroke="#1e063b" strokeWidth="0.9" />
              <polygon points="155,360 165,360 168,424 152,424" fill="#3b0764" stroke="#1e063b" strokeWidth="1" />
              {/* Emerald-Green Tailored Vest Panels */}
              <path d="M108,324 L132,324 L152,394 L160,424 L126,424 Z" fill="#15803d" stroke="#052e16" strokeWidth="1.5" />
              <path d="M212,324 L188,324 L168,394 L160,424 L194,424 Z" fill="#15803d" stroke="#052e16" strokeWidth="1.5" />
              <circle cx="160" cy="404" r="2.8" fill="#052e16" stroke="#86efac" strokeWidth="0.6" />
              {/* Worn Royal Purple Coat */}
              <path
                d="M14,424 C20,378 38,342 74,330 L110,324 L144,424 Z"
                fill="url(#shirt-joker-purple)"
                stroke="#1e063b"
                strokeWidth="2"
              />
              <path
                d="M306,424 C300,378 282,342 246,330 L210,324 L176,424 Z"
                fill="url(#shirt-joker-purple)"
                stroke="#1e063b"
                strokeWidth="2"
              />
              <polygon points="110,324 134,394 114,398 92,354" fill="#6b21a8" stroke="#1e063b" strokeWidth="1.3" />
              <polygon points="210,324 186,394 206,398 228,354" fill="#6b21a8" stroke="#1e063b" strokeWidth="1.3" />
            </g>
          )}

          {enemy.shirtStyle === 'infinity_plate' && (
            <g>
              {/* Deep Cosmic Undersuit */}
              <path d="M96,324 L224,324 L216,424 L104,424 Z" fill="#1e1b4b" stroke="#09071a" strokeWidth="1.8" />
              {/* Thanos Gleaming Golden Warlord Chest Plate & Flared High Pauldrons */}
              <path
                d="M4,424 C10,368 30,328 74,316 L112,324 L142,358 L178,358 L208,324 L246,316 C290,328 310,368 316,424 Z"
                fill="url(#shirt-infinity-gold)"
                stroke="#291503"
                strokeWidth="2.4"
              />
              <path d="M94,350 L138,372 L182,372 L226,350" fill="none" stroke="#fef9c3" strokeWidth="2.2" opacity="0.65" />
              <path d="M116,386 L160,404 L204,386" fill="none" stroke="#422006" strokeWidth="2.6" />
              <path d="M38,342 L74,368 M282,342 L246,368" stroke="#78350f" strokeWidth="2.2" opacity="0.55" />
              {/* Runic Gold Chest Core */}
              <circle cx="160" cy="378" r="5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.2" />
              <circle cx="142" cy="374" r="3" fill="#3b82f6" />
              <circle cx="178" cy="374" r="3" fill="#ef4444" />
            </g>
          )}

          {enemy.shirtStyle === 'arthur_coat' && (
            <g>
              {/* Signature RDR2 Weathered Sky-Blue Chambray Frontier Work Shirt & Open Placket */}
              <path
                d="M100,324 L220,324 L204,424 L116,424 Z"
                fill="url(#shirt-arthur-chambray)"
                stroke="#1e293b"
                strokeWidth="1.6"
              />
              {/* Open Collar & Button Placket */}
              <path d="M160,348 L160,424" stroke="#334155" strokeWidth="1.6" />
              <circle cx="160" cy="384" r="2.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.7" />
              <circle cx="160" cy="404" r="2.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.7" />
              {/* Classic Crimson Outlaw Neckerchief */}
              <path
                d="M112,324 Q160,354 208,324 L194,352 L160,378 L126,352 Z"
                fill="#7f1d1d"
                stroke="#2b0606"
                strokeWidth="1.5"
              />
              <path d="M136,342 L156,358 M184,342 L164,358" stroke="#fca5a5" strokeWidth="1.1" opacity="0.28" strokeLinecap="round" />
              {/* Arthur's Worn Buckskin/Tan Gunslinger Jacket with Dark Distressed Leather Collar */}
              <path
                d="M12,424 C18,378 36,342 74,330 L108,324 L144,424 Z"
                fill="url(#shirt-arthur-coat)"
                stroke="#1c1006"
                strokeWidth="2.2"
              />
              <path
                d="M308,424 C302,378 284,342 246,330 L212,324 L176,424 Z"
                fill="url(#shirt-arthur-coat)"
                stroke="#1c1006"
                strokeWidth="2.2"
              />
              <polygon points="108,324 136,386 112,396 86,348" fill="#2b1e16" stroke="#120b07" strokeWidth="1.5" />
              <polygon points="212,324 184,386 208,396 234,348" fill="#2b1e16" stroke="#120b07" strokeWidth="1.5" />
              {/* Jacket Shoulder Stitching & Wear */}
              <path d="M44,370 L86,356 M276,370 L234,356" stroke="#c99b6d" strokeWidth="1.5" opacity="0.38" strokeLinecap="round" />
              {/* Dark Leather Satchel Strap & Brass Buckle Across Chest */}
              <path d="M84,328 L108,324 L194,424 L166,424 Z" fill="#2e1a0f" stroke="#0d0704" strokeWidth="1.6" />
              <rect x="134" y="372" width="14" height="10" rx="1.5" transform="rotate(42 141 377)" fill="none" stroke="#d97706" strokeWidth="2.2" />
            </g>
          )}

          {enemy.shirtStyle === 'hoodie_street' && (
            <g>
              <path
                d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 Q160,362 206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
                fill="#1e1b2e"
                stroke="#090710"
                strokeWidth="2"
              />
              {/* Thick Rolled Hoodie Collar & Hood Folds */}
              <path
                d="M94,326 C112,356 138,372 160,372 C182,372 208,356 226,326 C214,320 202,322 192,334 Q160,356 128,334 C118,322 106,320 94,326 Z"
                fill="#2e2947"
                stroke="#0b0914"
                strokeWidth="1.8"
              />
              {/* Hoodie Drawstrings */}
              <path d="M142,366 Q138,392 141,416 M178,366 Q182,392 179,416" stroke="#e2e8f0" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.88" />
              <circle cx="141" cy="416" r="2.6" fill="#94a3b8" />
              <circle cx="179" cy="416" r="2.6" fill="#94a3b8" />
              {/* Kangaroo Pocket Rim & Sleeve Seams */}
              <path d="M68,336 C60,368 52,396 42,424 M252,336 C260,368 268,396 278,424" fill="none" stroke="#090710" strokeWidth="2.2" opacity="0.65" />
            </g>
          )}

          {enemy.shirtStyle === 'mafia_suit' && (
            <g>
              {/* Crisp White Dress Shirt & Crimson Silk Tie */}
              <path d="M104,324 L216,324 L184,424 L136,424 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.4" />
              <polygon points="151,352 169,352 164,366 156,366" fill="#7f1d1d" stroke="#2d0505" strokeWidth="0.9" />
              <polygon points="156,366 164,366 169,424 151,424" fill="#991b1b" stroke="#2d0505" strokeWidth="1" />
              <polygon points="112,324 151,352 128,365" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
              <polygon points="208,324 169,352 192,365" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
              {/* Charcoal Pinstripe Mafia Blazer */}
              <path d="M12,424 C18,378 36,342 74,330 L110,324 L150,424 Z" fill="#181b24" stroke="#06070a" strokeWidth="2" />
              <path d="M308,424 C302,378 284,342 246,330 L210,324 L170,424 Z" fill="#181b24" stroke="#06070a" strokeWidth="2" />
              <path d="M46,350 L42,424 M68,338 L66,424 M90,330 L92,424 M230,330 L228,424 M252,338 L254,424 M274,350 L278,424" stroke="#94a3b8" strokeWidth="0.8" opacity="0.22" />
              {/* Peak Lapels + Crimson Pocket Square */}
              <polygon points="110,324 136,396 112,400 88,354" fill="#232735" stroke="#06070a" strokeWidth="1.4" />
              <polygon points="210,324 184,396 208,400 232,354" fill="#232735" stroke="#06070a" strokeWidth="1.4" />
              <polygon points="214,394 236,386 240,398 214,398" fill="#dc2626" stroke="#450a0a" strokeWidth="0.9" />
            </g>
          )}

          {enemy.shirtStyle === 'prison_orange' && (
            <g>
              <path
                d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 Q160,368 206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
                fill="#ea580c"
                stroke="#431407"
                strokeWidth="2"
              />
              {/* Classic Prison V-Neck Collar & White Undershirt Peek */}
              <path d="M112,325 L160,378 L208,325" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
              <path d="M108,324 L160,382 L212,324" fill="none" stroke="#9a3412" strokeWidth="6" strokeLinejoin="round" />
              {/* Inmate Stencil Number Tag */}
              <rect x="200" y="378" width="44" height="16" rx="2" fill="#f8fafc" stroke="#1c1917" strokeWidth="1.2" opacity="0.92" />
              <text x="222" y="389.5" textAnchor="middle" fill="#1c1917" fontSize="8.5" fontWeight="900" fontFamily="monospace">
                4419-X
              </text>
              <path d="M68,334 C60,366 52,396 42,424 M252,334 C260,366 268,396 278,424" fill="none" stroke="#7c2d12" strokeWidth="2.2" opacity="0.6" />
            </g>
          )}

          {enemy.shirtStyle === 'samurai_gi' && (
            <g>
              {/* Crossed Martial Arts / Ronin Gi with Crimson Collar Trim */}
              <path
                d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 L160,376 L206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
                fill="#1e293b"
                stroke="#090d16"
                strokeWidth="2"
              />
              <path d="M106,324 L178,424 M214,324 L142,424" stroke="#0f172a" strokeWidth="14" strokeLinecap="round" />
              <path d="M106,324 L178,424 M214,324 L142,424" stroke="#b91c1c" strokeWidth="3.2" opacity="0.88" />
              <path d="M96,356 Q160,382 224,356" fill="none" stroke="#0f172a" strokeWidth="2" opacity="0.45" />
            </g>
          )}

          {enemy.shirtStyle === 'mechanic_overall' && (
            <g>
              {/* Faded Ash Work Tee Underneath */}
              <path
                d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 Q160,356 206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
                fill="#52525b"
                stroke="#18181b"
                strokeWidth="2"
              />
              {/* Heavy Denim/Navy Work Overalls + Brass Clasps */}
              <path d="M88,327 L108,325 L106,372 L84,372 Z" fill="#1e3a5f" stroke="#0c192c" strokeWidth="1.8" />
              <path d="M232,327 L212,325 L214,372 L236,372 Z" fill="#1e3a5f" stroke="#0c192c" strokeWidth="1.8" />
              <path d="M82,366 Q160,374 238,366 L248,424 L72,424 Z" fill="#172e4d" stroke="#0c192c" strokeWidth="2" />
              <rect x="134" y="384" width="52" height="28" rx="3" fill="#1e3a5f" stroke="#0c192c" strokeWidth="1.5" />
              <circle cx="96" cy="368" r="3.6" fill="#eab308" stroke="#422006" strokeWidth="1" />
              <circle cx="224" cy="368" r="3.6" fill="#eab308" stroke="#422006" strokeWidth="1" />
              {/* Motor Oil Grease Smudges */}
              <ellipse cx="108" cy="402" rx="14" ry="9" fill="#09090b" opacity="0.42" filter="url(#soft-blur)" />
              <ellipse cx="206" cy="396" rx="12" ry="7" fill="#09090b" opacity="0.38" filter="url(#soft-blur)" />
            </g>
          )}

          {enemy.shirtStyle === 'cyber_collar' && (
            <g>
              {/* High-Tech Street Runner Jacket with Glowing Neon Collar Trim */}
              <path
                d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 L160,362 L206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
                fill="#0f172a"
                stroke="#020617"
                strokeWidth="2.2"
              />
              <path d="M84,328 L104,312 L134,352 L186,352 L216,312 L236,328 L216,374 L104,374 Z" fill="#1e293b" stroke="#020617" strokeWidth="2" />
              <path d="M104,314 L134,352 L186,352 L216,314" fill="none" stroke="#22d3ee" strokeWidth="2.4" opacity="0.88" />
              <path d="M58,364 L102,380 M262,364 L218,380" fill="none" stroke="#22d3ee" strokeWidth="1.6" opacity="0.55" />
              <circle cx="160" cy="388" r="5" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.4" />
              <circle cx="160" cy="388" r="2.1" fill="#22d3ee" />
            </g>
          )}

          {/* Fallback Tank-Top if an unknown style ever appeared */}
          {!enemy.shirtStyle && (
            <path
              d="M38,424 C44,394 56,370 72,331 L106,326 Q160,368 214,326 L248,331 C264,370 276,394 282,424 Z"
              fill="url(#shirt-grad)"
              stroke="#09090b"
              strokeWidth="2"
            />
          )}
            </>
          )}

          {/* Subtle blood staining reaching chest/shirt in heavy trauma */}
          {(damageStage >= 2 || trauma.lipTorn || trauma.arterialRupture) && (
            <g opacity="0.62" style={{ mixBlendMode: 'multiply' }}>
              <path d="M148,342 Q146.5,365 149,388 Q151,372 150.5,342 Z" fill="#6b0a0e" filter="url(#soft-blur)" />
              <path d="M168,354 Q170.5,374 168.5,394 Q171.5,376 170.5,354 Z" fill="#7f1d1d" filter="url(#soft-blur)" />
            </g>
          )}
        </g>

        <g ref={headPivotRef}>
        <g ref={impactWarpGroupRef}>
        <g style={headDeformStyle}>
        <BossBackHair enemy={enemy} />
        {/* Realistic Multi-Layered Ears (Human or Pointed Ogre/Cyclops) with Independent Swelling & Ruptured Burst Gore */}
        <g ref={earsParallaxRef}>
          {/* Left Ear */}
          <g transform={anatomy.earOffsetX ? `translate(${-anatomy.earOffsetX}, 0)` : undefined}>
          <path
            d={
              enemy.species === 'cyclops'
                ? trauma.leftEarSwollen && !trauma.leftEarBurst
                  ? 'M72,150 C50,136 33,134 29,144 C36,164 43,190 62,208 C70,210 75,200 74,190 Z'
                  : 'M72,152 C53,140 36,138 33,146 C40,164 46,186 63,205 C70,207 75,198 74,190 Z'
                : trauma.leftEarSwollen && !trauma.leftEarBurst
                  ? 'M72,150 C52,144 43,160 45,180 C47,196 56,210 68,209 C74,208 75,198 74,190 Z'
                  : 'M72,152 C56,148 48,162 50,178 C51,192 58,205 68,206 C73,206 75,198 74,190 Z'
            }
            fill={trauma.leftEarBurst ? '#3b0712' : enemy.skinShadow}
            stroke="#1a0d08"
            strokeOpacity="0.38"
            strokeWidth="1.25"
          />
          <path
            d={
              enemy.species === 'cyclops'
                ? 'M68,158 C54,148 44,148 44,158 C47,176 55,194 68,196'
                : 'M68,158 C56,156 54,170 57,183 C59,192 64,198 69,196'
            }
            fill="none"
            stroke="#241008"
            strokeWidth="2.4"
            opacity="0.45"
            strokeLinecap="round"
          />
          <ellipse cx="64" cy="178" rx="5.5" ry="9" fill="#180a05" opacity="0.35" />
          <path d="M69,172 Q63,174 63,181 Q64,185 69,185" fill={enemy.skinColor} opacity="0.8" />

          {trauma.leftEarSwollen && !trauma.leftEarBurst && (
            <g>
              <ellipse cx="60" cy="176" rx="11" ry="15" fill="url(#periorbital-grad)" filter="url(#bruise-organic)" style={{ mixBlendMode: 'multiply' }} />
              <ellipse cx="56" cy="172" rx="4.5" ry="6.5" fill="#fff7ed" opacity="0.16" filter="url(#soft-blur)" />
            </g>
          )}

          {trauma.leftEarBurst && (
            <g>
              {/* Blown-open auricular hematoma & torn cartilage notch */}
              <ellipse cx="60" cy="177" rx="12" ry="14" fill="url(#periorbital-grad)" filter="url(#bruise-organic)" style={{ mixBlendMode: 'multiply' }} />
              <path d="M62,152 Q50,158 51,173 Q58,171 63,167 Z" fill="#220306" stroke="#5c080a" strokeWidth="0.9" />
              <path d="M52,166 Q58,168 56,174 Z" fill="#dfd7c8" opacity="0.85" />
              <ellipse cx="61" cy="182" rx="5.5" ry="7.5" fill="#6b0a0e" opacity="0.78" filter="url(#soft-blur)" />
              <path d="M57,176 Q53,204 58,236 Q60,210 60,176 Z" fill="#6b0a0e" opacity="0.62" style={{ mixBlendMode: 'multiply' }} />
              <path d="M65,194 Q68,224 72,258 Q70,224 67,194 Z" fill="#4c0609" opacity="0.54" style={{ mixBlendMode: 'multiply' }} />
            </g>
          )}
          </g>

          {/* Right Ear */}
          <g transform={anatomy.earOffsetX ? `translate(${anatomy.earOffsetX}, 0)` : undefined}>
          <path
            d={
              enemy.species === 'cyclops'
                ? trauma.rightEarSwollen && !(trauma.rightEarBurst || (trauma.earTorn && !trauma.leftEarBurst))
                  ? 'M248,150 C270,136 287,134 291,144 C284,164 277,190 258,208 C250,210 245,200 246,190 Z'
                  : 'M248,152 C267,140 284,138 287,146 C280,164 274,186 257,205 C250,207 245,198 246,190 Z'
                : trauma.rightEarSwollen && !(trauma.rightEarBurst || (trauma.earTorn && !trauma.leftEarBurst))
                  ? 'M248,150 C268,144 277,160 275,180 C273,196 264,210 252,209 C246,208 245,198 246,190 Z'
                  : 'M248,152 C264,148 272,162 270,178 C269,192 262,205 252,206 C247,206 245,198 246,190 Z'
            }
            fill={trauma.rightEarBurst || (trauma.earTorn && !trauma.leftEarBurst) ? '#3b0712' : enemy.skinShadow}
            stroke="#1a0d08"
            strokeOpacity="0.38"
            strokeWidth="1.25"
          />
          <path
            d={
              enemy.species === 'cyclops'
                ? 'M252,158 C266,148 276,148 276,158 C273,176 265,194 252,196'
                : 'M252,158 C264,156 266,170 263,183 C261,192 256,198 251,196'
            }
            fill="none"
            stroke="#241008"
            strokeWidth="2.4"
            opacity="0.45"
            strokeLinecap="round"
          />
          <ellipse cx="256" cy="178" rx="5.5" ry="9" fill="#180a05" opacity="0.35" />
          <path d="M251,172 Q257,174 257,181 Q256,185 251,185" fill={enemy.skinColor} opacity="0.8" />

          {trauma.rightEarSwollen && !(trauma.rightEarBurst || (trauma.earTorn && !trauma.leftEarBurst)) && (
            <g>
              <ellipse cx="260" cy="176" rx="11" ry="15" fill="url(#periorbital-grad)" filter="url(#bruise-organic)" style={{ mixBlendMode: 'multiply' }} />
              <ellipse cx="264" cy="172" rx="4.5" ry="6.5" fill="#fff7ed" opacity="0.16" filter="url(#soft-blur)" />
            </g>
          )}

          {(trauma.rightEarBurst || (trauma.earTorn && !trauma.leftEarBurst)) && (
            <g>
              {/* Blown-open auricular hematoma & torn cartilage notch */}
              <ellipse cx="260" cy="177" rx="12" ry="14" fill="url(#periorbital-grad)" filter="url(#bruise-organic)" style={{ mixBlendMode: 'multiply' }} />
              <path d="M258,152 Q270,158 269,173 Q262,171 257,167 Z" fill="#220306" stroke="#5c080a" strokeWidth="0.9" />
              <path d="M268,166 Q262,168 264,174 Z" fill="#dfd7c8" opacity="0.85" />
              <ellipse cx="259" cy="182" rx="5.5" ry="7.5" fill="#6b0a0e" opacity="0.78" filter="url(#soft-blur)" />
              <path d="M263,176 Q267,204 262,236 Q260,210 260,176 Z" fill="#6b0a0e" opacity="0.62" style={{ mixBlendMode: 'multiply' }} />
              <path d="M255,194 Q252,224 248,258 Q250,224 253,194 Z" fill="#4c0609" opacity="0.54" style={{ mixBlendMode: 'multiply' }} />
            </g>
          )}

          {!trauma.rightEarBurst && <BossEarAccessories enemy={enemy} />}
          {!trauma.rightEarBurst && enemy.faceAccessory === 'gold_hoop' && !enemy.bossId && (
            <g>
              <circle cx="256" cy="206" r="7.5" fill="none" stroke="#fbbf24" strokeWidth="2.4" />
              <circle cx="256" cy="206" r="7.5" fill="none" stroke="#fef08a" strokeWidth="0.9" opacity="0.65" />
            </g>
          )}
          </g>
        </g>

        {/* Main Head Silhouette with Soft Organic & Per-Boss Anatomical Contour */}
        <path
          d={headOutlinePath}
          fill="url(#skin-grad)"
          filter="url(#skin-grit)"
          stroke="#1c0e08"
          strokeOpacity="0.38"
          strokeWidth="1.35"
        />

        {/* Clipped Facial Interior */}
        <g clipPath="url(#head-clip)">
          {/* Soft 3D Perimeter Contour Shading */}
          <rect x="44" y="20" width="232" height="315" fill="url(#head-edge-vignette)" pointerEvents="none" />
          {/* Traumatic Shock Clammy Pale Desaturation Layer */}
          {isInShock && !isKo && (
            <rect
              x="44"
              y="20"
              width="232"
              height="315"
              fill="#cbd5e1"
              opacity="0.34"
            />
          )}

          <g ref={facialInnerParallaxRef}>
          {/* Volumetric Facial Sculpting: Temple hollows, Jaw occlusion, Malar cheeks */}
          <path
            d="M68,202 Q110,278 160,316 Q210,278 252,202 L252,324 L68,324 Z"
            fill="#140804"
            opacity="0.22"
            filter="url(#soft-blur)"
          />
          {/* Buccal cheek hollows beneath cheekbones */}
          <path d="M80,192 Q96,228 118,245" fill="none" stroke="#180a05" strokeWidth="11" opacity="0.16" strokeLinecap="round" filter="url(#soft-blur)" />
          <path d="M240,192 Q224,228 202,245" fill="none" stroke="#180a05" strokeWidth="11" opacity="0.16" strokeLinecap="round" filter="url(#soft-blur)" />
          {/* Temple side planes */}
          <ellipse cx="76" cy="116" rx="14" ry="34" fill="#180a05" opacity="0.15" filter="url(#soft-blur)" />
          <ellipse cx="244" cy="116" rx="14" ry="34" fill="#180a05" opacity="0.15" filter="url(#soft-blur)" />

          {/* Warm subsurface blood flush on cheeks & nose */}
          <ellipse cx="102" cy="186" rx="28" ry="18" fill="url(#subsurface-flush)" />
          <ellipse cx="218" cy="186" rx="28" ry="18" fill="url(#subsurface-flush)" />

          {/* Deep Orbital Sockets & Species-Specific Facial Sculpting */}
          {enemy.species === 'cyclops' ? (
            <ellipse cx="160" cy="141" rx="52" ry="30" fill="url(#eye-socket-shadow)" />
          ) : (
            <>
              <ellipse cx="115" cy="148" rx="34" ry="25" fill="url(#eye-socket-shadow)" />
              <ellipse cx="205" cy="148" rx="34" ry="25" fill="url(#eye-socket-shadow)" />
            </>
          )}
          <path d="M82,126 Q116,118 148,132 M238,126 Q204,118 172,132" fill="none" stroke={isBlueSkin ? '#bae6fd' : '#fff7ed'} strokeWidth="5" opacity={isBlueSkin ? '0.16' : '0.11'} strokeLinecap="round" filter="url(#soft-blur)" />

          {/* Neanderthal Heavy Protruding Supraorbital Brow Ridge & Tundra War Paint */}
          {enemy.species === 'neanderthal' && (
            <g>
              <path
                d="M78,128 Q116,109 160,120 Q204,109 242,128"
                fill="none"
                stroke="#1c0d08"
                strokeWidth="9.5"
                opacity="0.34"
                strokeLinecap="round"
                filter="url(#soft-blur)"
              />
              <path
                d="M84,120 Q116,106 160,115 Q204,106 236,120"
                fill="none"
                stroke="#fff7ed"
                strokeWidth="4.2"
                opacity="0.14"
                strokeLinecap="round"
                filter="url(#soft-blur)"
              />
              {enemy.visualVariant === 'tundra' && (
                <g opacity="0.72">
                  <path d="M82,174 L118,184 M80,185 L114,194" stroke="#f1f5f9" strokeWidth="4.2" strokeLinecap="round" />
                  <path d="M238,174 L202,184 M240,185 L206,194" stroke="#f1f5f9" strokeWidth="4.2" strokeLinecap="round" />
                </g>
              )}
            </g>
          )}

          {/* Organic Flesh Titan: Exposed Cheek Muscle Striations, Deep Veins & Ossified Crest */}
          {enemy.species === 'titan' && (
            <g>
              {/* Deep Sunken Eye Shadows & Bulging Veins */}
              <ellipse cx="115" cy="151" rx="28" ry="18" fill="#1a0605" opacity="0.35" filter="url(#soft-blur)" />
              <ellipse cx="205" cy="151" rx="28" ry="18" fill="#1a0605" opacity="0.35" filter="url(#soft-blur)" />
              <path d="M88,82 L98,106 L94,124 M232,84 L222,108 L226,126" fill="none" stroke="#450a0a" strokeWidth="2.1" opacity="0.45" strokeLinecap="round" />
              {/* Exposed Striated Cheek / Masseter Muscle Fibers */}
              <path d="M80,184 Q96,214 114,254 Q92,238 80,184 Z" fill="#7f1d1d" opacity="0.58" />
              <path d="M240,184 Q224,214 206,254 Q228,238 240,184 Z" fill="#7f1d1d" opacity="0.58" />
              <path d="M84,192 L106,244 M90,188 L112,240 M236,192 L214,244 M230,188 L208,240" stroke="#fecaca" strokeWidth="1.1" opacity="0.34" strokeLinecap="round" />
              {enemy.visualVariant === 'crimson' && (
                <g>
                  <path d="M86,112 Q116,96 146,118 M234,112 Q204,96 174,118" fill="none" stroke="#d6d3d1" strokeWidth="4.5" opacity="0.42" strokeLinecap="round" />
                  <path d="M90,104 L102,115 M230,104 L218,115" stroke="#e7e5e4" strokeWidth="2.4" opacity="0.52" strokeLinecap="round" />
                </g>
              )}
            </g>
          )}

          {/* Malar Cheekbone, Forehead & Chin Specular Highlights */}
          <ellipse cx="104" cy="176" rx="20" ry="9" fill={isBlueSkin ? '#bae6fd' : '#fff7ed'} opacity={isBlueSkin ? '0.2' : '0.16'} transform="rotate(-16 104 176)" filter="url(#soft-blur)" />
          <ellipse cx="216" cy="176" rx="20" ry="9" fill={isBlueSkin ? '#bae6fd' : '#fff7ed'} opacity={isBlueSkin ? '0.2' : '0.16'} transform="rotate(16 216 176)" filter="url(#soft-blur)" />
          <ellipse cx="160" cy="84" rx="44" ry="15" fill={isBlueSkin ? '#bae6fd' : '#fff7ed'} opacity={isBlueSkin ? '0.16' : '0.12'} filter="url(#soft-blur)" />
          <ellipse cx="160" cy="292" rx="17" ry="10" fill={isBlueSkin ? '#bae6fd' : '#fff7ed'} opacity={isBlueSkin ? '0.16' : '0.12'} filter="url(#soft-blur)" />

          {/* Philtrum & Nasolabial Fold Shading */}
          <path d="M155,204 Q157,216 155,226 M165,204 Q163,216 165,226" stroke="#1c0d08" strokeWidth="1.5" opacity="0.22" strokeLinecap="round" />
          <ellipse cx="160" cy="216" rx="3.2" ry="7" fill="#180a05" opacity="0.12" />

          <path
            ref={nasolabialLRef}
            d="M142,196 Q126,218 121,245"
            fill="none"
            stroke="#1c0d08"
            strokeWidth="2"
            opacity="0.24"
            strokeLinecap="round"
            filter="url(#soft-blur)"
          />
          <path
            ref={nasolabialRRef}
            d="M178,196 Q194,218 199,245"
            fill="none"
            stroke="#1c0d08"
            strokeWidth="2"
            opacity="0.24"
            strokeLinecap="round"
            filter="url(#soft-blur)"
          />

          {/* Dynamic Vascular Cheek/Forehead Flush & Throbbing Temple Rage Veins */}
          <g ref={angryCheekFlushRef} className="pointer-events-none" style={{ opacity: 0 }}>
            <ellipse cx="104" cy="186" rx="22" ry="13" fill="#dc2626" filter="url(#soft-blur)" />
            <ellipse cx="216" cy="186" rx="22" ry="13" fill="#dc2626" filter="url(#soft-blur)" />
            <ellipse cx="160" cy="108" rx="34" ry="12" fill="#b91c1c" opacity="0.65" filter="url(#soft-blur)" />
          </g>
          <g ref={rageVeinsRef} className="pointer-events-none" style={{ opacity: 0 }}>
            <path
              d="M84,96 L94,107 L90,120 M94,107 L104,111 M236,96 L226,107 L230,120 M226,107 L216,111"
              fill="none"
              stroke="#7f1d1d"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M150,86 L154,101 L151,112 M170,86 L166,101 L169,112"
              fill="none"
              stroke="#7f1d1d"
              strokeWidth="1.5"
              opacity="0.85"
              strokeLinecap="round"
            />
          </g>

          {/* Forehead expression wrinkles & glabella frown lines */}
          <path
            ref={foreheadWrinklesRef}
            d="M116,95 Q160,88 204,95 M126,106 Q160,101 194,106"
            fill="none"
            stroke="#1c0d08"
            strokeWidth="1.8"
            opacity="0.12"
            strokeLinecap="round"
          />
          <path
            ref={glabellaLinesRef}
            d="M153,115 L155,134 M167,115 L165,134"
            stroke="#1c0d08"
            strokeWidth="2.2"
            opacity="0"
            strokeLinecap="round"
          />

          {/* Mentolabial under-lip shadow & chin cleft */}
          <path d="M144,268 Q160,275 176,268" fill="none" stroke="#180a05" strokeWidth="5" opacity="0.25" strokeLinecap="round" filter="url(#soft-blur)" />
          <path d="M160,296 L160,309" stroke="#180a05" strokeWidth="2.1" opacity="0.26" strokeLinecap="round" />

          {/* Iconic Boss Facial Markings, Scars, Endoskeletons & Sculpted Jaw Details */}
          <BossFaceMarkings enemy={enemy} />

          {/* Non-Boss Facial Skin Accessories (Freckles, Nose Band-Aid, War Paint, Face Tats) */}
          {!enemy.bossId && enemy.faceAccessory === 'freckles' && (
            <g fill="#7c2d12" opacity="0.46">
              {[
                [102, 174], [108, 178], [114, 173], [120, 179], [98, 181], [111, 183],
                [154, 174], [160, 172], [166, 175], [157, 178],
                [200, 179], [206, 173], [212, 178], [218, 174], [222, 181], [209, 183],
              ].map(([fx, fy], i) => (
                <circle key={`freckle-${i}`} cx={fx} cy={fy} r={i % 3 === 0 ? 1.15 : 0.85} />
              ))}
            </g>
          )}
          {!enemy.bossId && enemy.faceAccessory === 'bandaid_nose' && (
            <g transform="rotate(-7 160 176)">
              <rect x="142" y="170" width="36" height="11" rx="3" fill="#e7c6a5" stroke="#8c6244" strokeWidth="1" />
              <rect x="153" y="171" width="14" height="9" rx="1.5" fill="#f3dfc9" />
              <circle cx="147" cy="173.5" r="0.7" fill="#9c7254" />
              <circle cx="147" cy="177.5" r="0.7" fill="#9c7254" />
              <circle cx="173" cy="173.5" r="0.7" fill="#9c7254" />
              <circle cx="173" cy="177.5" r="0.7" fill="#9c7254" />
            </g>
          )}
          {!enemy.bossId && enemy.faceAccessory === 'war_paint' && (
            <g opacity="0.76" style={{ mixBlendMode: 'multiply' }}>
              <path d="M88,164 L132,171 M86,174 L126,180" stroke="#18181b" strokeWidth="4.6" strokeLinecap="round" />
              <path d="M232,164 L188,171 M234,174 L194,180" stroke="#18181b" strokeWidth="4.6" strokeLinecap="round" />
              <path d="M153,164 L153,190 M167,164 L167,190" stroke="#991b1b" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
            </g>
          )}
          {!enemy.bossId && enemy.faceAccessory === 'face_tats' && (
            <g opacity="0.62" style={{ mixBlendMode: 'multiply' }}>
              {/* Subtle Street Teardrop under Left Eye + Brow Script + Cheek Cross */}
              <path d="M104,166 Q106,170 104,172 Q102,170 104,166 Z" fill="#1e293b" />
              <path d="M188,113 L208,110 M198,105 L198,117" stroke="#1e293b" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M214,182 L222,190 M222,182 L214,190" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
              <text x="90" y="218" fill="#1e293b" fontSize="6.5" fontWeight="700" fontFamily="serif" transform="rotate(-14 90 218)">
                XIII
              </text>
            </g>
          )}

          {/* Titanium Metal Jaw Prosthetic */}
          {enemy.hasMetalJaw && (
            <g>
              <path
                d="M84,228 L124,254 L196,254 L236,228 L228,318 L92,318 Z"
                fill="url(#metal-grad)"
                stroke="#0f172a"
                strokeWidth="2.2"
              />
              <path d="M124,254 L196,254" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.45" />
              <circle cx="104" cy="258" r="3.4" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
              <circle cx="216" cy="258" r="3.4" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
              <circle cx="118" cy="294" r="3.4" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
              <circle cx="202" cy="294" r="3.4" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
              {(damageStage >= 2 || trauma.jawFractured) && (
                <path d="M114,256 L132,282 L125,305 M192,258 L180,285" stroke="#09090b" strokeWidth="2.4" fill="none" />
              )}
            </g>
          )}

          {/* Custom Sculpted Boss & YouTuber Facial Hair OR Generic Stubble/Beard */}
          <BossCustomFacialHair enemy={enemy} />
          {enemy.facialHair === 'stubble' && !enemy.bossId && !enemy.miniBossId && (
            <path d="M74,210 Q160,295 246,210 L242,318 L78,318 Z" fill="url(#stubble-pat)" opacity="0.85" />
          )}
          {enemy.facialHair === 'beard' && !enemy.hasMetalJaw && !enemy.bossId && !enemy.miniBossId && (
            <g>
              <path d="M70,196 Q110,245 160,241 Q210,245 250,196 L244,318 L76,318 Z" fill="url(#stubble-pat)" opacity="0.58" />
              <path
                d="M72,202 Q110,248 160,244 Q210,248 248,202 L242,318 L78,318 Z"
                fill={enemy.hairColor}
                opacity="0.88"
              />
              <path
                d="M72,202 Q110,248 160,244 Q210,248 248,202 L242,318 L78,318 Z"
                fill="url(#hair-depth-grad)"
              />
              <path d="M78,202 L82,216 M92,216 L96,230 M110,230 L112,243 M242,202 L238,216 M228,216 L224,230 M210,230 L208,243" stroke={enemy.hairColor} strokeWidth="1.5" opacity="0.78" strokeLinecap="round" />
              <path d="M88,236 L94,264 M104,250 L108,282 M232,236 L226,264 M216,250 L212,282" stroke="#ffffff" strokeWidth="0.9" opacity="0.08" strokeLinecap="round" />
            </g>
          )}
          {enemy.facialHair === 'goatee' && !enemy.hasMetalJaw && !enemy.miniBossId && (
            <g>
              <path d="M126,234 Q160,221 194,234 L188,316 L132,316 Z" fill="url(#stubble-pat)" opacity="0.55" />
              <path d="M128,236 Q160,224 192,236 L186,316 L134,316 Z" fill={enemy.hairColor} opacity="0.85" />
              <path d="M128,236 Q160,224 192,236 L186,316 L134,316 Z" fill="url(#hair-depth-grad)" />
              <path d="M134,238 L136,249 M146,231 L147,242 M174,231 L173,242 M186,238 L184,249" stroke={enemy.hairColor} strokeWidth="1.3" opacity="0.7" strokeLinecap="round" />
            </g>
          )}
          {enemy.facialHair === 'handlebar' && !enemy.miniBossId && (
            <g>
              <path
                d="M112,236 Q136,215 160,227 Q184,215 208,236 Q195,254 184,240 Q160,232 136,240 Q125,254 112,236 Z"
                fill={enemy.hairColor}
                opacity="0.92"
              />
              <path d="M136,225 Q148,228 158,231 M184,225 Q172,228 162,231 M122,234 Q130,232 138,235 M198,234 Q190,232 182,235" stroke="#ffffff" strokeWidth="1" opacity="0.1" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* Dynamic Organic Bruises, Weapon-Specific Trauma, Cuts, Welts & Burns */}
          {bruises.map((mark) => {
            const sev = mark.severity ?? 0.65;
            if (mark.kind === 'bruise') {
              const rx = mark.radius * (1.3 + sev * 0.35);
              const ry = mark.radius * (0.95 + sev * 0.28);
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={rx * 1.25}
                    ry={ry * 1.22}
                    fill="url(#bruise-halo-grad)"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <ellipse
                    cx={mark.x - 1.2}
                    cy={mark.y + 0.8}
                    rx={rx * 0.82}
                    ry={ry * 0.76}
                    fill="url(#bruise-core-grad)"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <g opacity={0.48 + sev * 0.22}>
                    <circle cx={mark.x - 2.4} cy={mark.y - 1.1} r="1.05" fill="#450a0a" />
                    <circle cx={mark.x + 2.6} cy={mark.y + 1.3} r="0.95" fill="#7f1d1d" />
                    <circle cx={mark.x + 0.5} cy={mark.y - 2.5} r="0.85" fill="#450a0a" />
                    <circle cx={mark.x - 3.2} cy={mark.y + 2.0} r="0.8" fill="#7f1d1d" />
                  </g>
                </g>
              );
            }
            if (mark.kind === 'knuckle_welt') {
              const rx = mark.radius * 1.25;
              const ry = mark.radius * 0.82;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  {/* Diffuse reddish-plum blunt contusion cloud */}
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={rx * 1.32}
                    ry={ry * 1.35}
                    fill="url(#bruise-halo-grad)"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  {/* Three aligned knuckle welt impressions + swollen taut skin sheen */}
                  {[-1, 0, 1].map((slot) => {
                    const kx = mark.x + slot * (rx * 0.44);
                    const ky = mark.y + (slot === 0 ? -1.4 : 0.8);
                    return (
                      <g key={slot}>
                        <ellipse
                          cx={kx}
                          cy={ky}
                          rx={rx * 0.24}
                          ry={ry * 0.44}
                          fill="#4c0519"
                          opacity={0.42 + sev * 0.22}
                          filter="url(#soft-blur)"
                          style={{ mixBlendMode: 'multiply' }}
                        />
                        <ellipse
                          cx={kx}
                          cy={ky - 1.2}
                          rx={rx * 0.16}
                          ry={ry * 0.2}
                          fill="#fff7ed"
                          opacity="0.19"
                        />
                        <circle cx={kx + 0.6} cy={ky + 0.8} r="0.85" fill="#7f1d1d" opacity="0.6" />
                      </g>
                    );
                  })}
                </g>
              );
            }
            if (mark.kind === 'brow_split') {
              const dir = mark.id % 2 === 0 ? 1 : -1;
              const len = mark.radius * (0.85 + sev * 0.35);
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  {/* Puffy periorbital/malar hematoma swelling */}
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={len * 1.38}
                    ry={len * 0.88}
                    fill="url(#periorbital-grad)"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  {/* Taut swollen ridge above the blunt-force skin split */}
                  <path
                    d={`M${mark.x - len * 0.78},${mark.y - 2.1} Q${mark.x},${mark.y - 3.8} ${mark.x + len * 0.78},${mark.y - 1.8}`}
                    fill="none"
                    stroke="#fff7ed"
                    strokeWidth="2.4"
                    opacity="0.24"
                    strokeLinecap="round"
                    filter="url(#soft-blur)"
                  />
                  {/* Ragged blunt-force split (skin torn over underlying bone) */}
                  <path
                    d={`M${mark.x - len * 0.82},${mark.y + 0.4} Q${mark.x - len * 0.28},${mark.y - 1.8} ${mark.x},${mark.y - 1.4} Q${mark.x + len * 0.32},${mark.y - 2.0} ${mark.x + len * 0.82},${mark.y + 0.3} Q${mark.x + len * 0.25},${mark.y + 2.2} ${mark.x},${mark.y + 1.8} Q${mark.x - len * 0.3},${mark.y + 2.3} ${mark.x - len * 0.82},${mark.y + 0.4} Z`}
                    fill="#3f0609"
                    stroke="#6b0a0e"
                    strokeWidth="0.7"
                  />
                  {mark.showBone && (
                    <path
                      d={`M${mark.x - len * 0.28},${mark.y} Q${mark.x},${mark.y - 0.8} ${mark.x + len * 0.28},${mark.y + 0.1}`}
                      stroke="#dfd7c8"
                      strokeWidth="1.05"
                      opacity="0.72"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                </g>
              );
            }
            if (mark.kind === 'hematoma') {
              const rx = mark.radius * (1.2 + sev * 0.3);
              const ry = mark.radius * (0.92 + sev * 0.25);
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={rx * 1.32}
                    ry={ry * 1.28}
                    fill="url(#bruise-halo-grad)"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={rx * 0.9}
                    ry={ry * 0.85}
                    fill="url(#bruise-core-grad)"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <path
                    d={`M${mark.x - rx * 0.52},${mark.y - ry * 0.34} Q${mark.x},${mark.y - ry * 0.7} ${mark.x + rx * 0.5},${mark.y - ry * 0.24}`}
                    fill="none"
                    stroke="#fff7ed"
                    strokeWidth="2.8"
                    opacity="0.22"
                    strokeLinecap="round"
                    filter="url(#soft-blur)"
                  />
                  <g opacity="0.62">
                    <path
                      d={`M${mark.x - rx * 0.28},${mark.y - 1} L${mark.x - rx * 0.54},${mark.y - 3.6} M${mark.x + rx * 0.2},${mark.y + 1.4} L${mark.x + rx * 0.48},${mark.y + 4.1}`}
                      stroke="#4c0519"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                    />
                    <circle cx={mark.x - 1.5} cy={mark.y + 1.2} r="1.1" fill="#450a0a" />
                    <circle cx={mark.x + 2.2} cy={mark.y - 1.3} r="0.9" fill="#7f1d1d" />
                  </g>
                </g>
              );
            }
            if (mark.kind === 'scrape') {
              const rx = mark.radius * 1.42;
              const ry = mark.radius * 0.72;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={rx}
                    ry={ry}
                    fill="#88131d"
                    opacity="0.32"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={rx * 0.75}
                    ry={ry * 0.65}
                    fill="#991b1b"
                    opacity="0.44"
                    filter="url(#bruise-organic)"
                  />
                  <g opacity="0.7">
                    <path
                      d={`M${mark.x - rx * 0.7},${mark.y - ry * 0.26} Q${mark.x},${mark.y - ry * 0.1} ${mark.x + rx * 0.74},${mark.y - ry * 0.18}`}
                      stroke="#5c080a"
                      strokeWidth="1.15"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d={`M${mark.x - rx * 0.58},${mark.y + ry * 0.16} Q${mark.x},${mark.y + ry * 0.32} ${mark.x + rx * 0.62},${mark.y + ry * 0.14}`}
                      stroke="#7f1d1d"
                      strokeWidth="1.05"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx={mark.x - rx * 0.28} cy={mark.y - 0.8} r="1" fill="#450a0a" />
                    <circle cx={mark.x + rx * 0.12} cy={mark.y + 1.3} r="1.1" fill="#6b0a0e" />
                    <circle cx={mark.x + rx * 0.34} cy={mark.y - 0.6} r="0.9" fill="#450a0a" />
                  </g>
                  <path
                    d={`M${mark.x - rx * 0.32},${mark.y - ry * 0.24} Q${mark.x},${mark.y - ry * 0.4} ${mark.x + rx * 0.32},${mark.y - ry * 0.2}`}
                    stroke="#fecaca"
                    strokeWidth="0.8"
                    opacity="0.26"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              );
            }
            if (mark.kind === 'burn') {
              const r = mark.radius;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={r * 1.42}
                    ry={r * 1.1}
                    fill="#991b1b"
                    opacity="0.34"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <path
                    d={`M${mark.x - r * 1.1},${mark.y - r * 0.4} Q${mark.x},${mark.y - r * 1.2} ${mark.x + r * 1.2},${mark.y - r * 0.2} Q${mark.x + r * 0.9},${mark.y + r * 0.9} ${mark.x - r * 0.3},${mark.y + r * 1.05} Q${mark.x - r * 1.3},${mark.y + r * 0.5} ${mark.x - r * 1.1},${mark.y - r * 0.4} Z`}
                    fill="#18181b"
                    stroke="#52525b"
                    strokeOpacity="0.45"
                    strokeWidth="1.2"
                    opacity="0.72"
                    filter="url(#bruise-organic)"
                  />
                  <path
                    d={`M${mark.x - r * 0.65},${mark.y - r * 0.2} Q${mark.x + r * 0.1},${mark.y - r * 0.7} ${mark.x + r * 0.7},${mark.y + r * 0.1} Q${mark.x + r * 0.2},${mark.y + r * 0.65} ${mark.x - r * 0.65},${mark.y - r * 0.2} Z`}
                    fill="#7f1d1d"
                    opacity="0.62"
                    filter="url(#soft-blur)"
                  />
                  {mark.showBone && (
                    <path
                      d={`M${mark.x - r * 0.24},${mark.y - 0.5} Q${mark.x},${mark.y - 2.2} ${mark.x + r * 0.26},${mark.y + 0.5} Q${mark.x},${mark.y + 2.1} ${mark.x - r * 0.24},${mark.y - 0.5} Z`}
                      fill="url(#wound-bone-grad)"
                      opacity="0.76"
                    />
                  )}
                  <ellipse cx={mark.x - r * 0.2} cy={mark.y - r * 0.18} rx={r * 0.26} ry={r * 0.12} fill="#fde68a" opacity="0.18" />
                </g>
              );
            }
            if (mark.kind === 'plasma_sear') {
              const r = mark.radius * 0.95;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  {/* Erythematous radiation/thermal flare */}
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={r * 1.48}
                    ry={r * 1.05}
                    fill="#7f1d1d"
                    opacity="0.38"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  {/* Vitrified ash-charred crater rim */}
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={r * 0.92}
                    ry={r * 0.62}
                    fill="#09090b"
                    stroke="#ea580c"
                    strokeOpacity="0.45"
                    strokeWidth="1.2"
                    opacity="0.82"
                    filter="url(#bruise-organic)"
                  />
                  {/* Cauterized glassy dermal core + blister sheen */}
                  <ellipse cx={mark.x} cy={mark.y} rx={r * 0.52} ry={r * 0.34} fill="#451a03" opacity="0.78" />
                  <ellipse cx={mark.x} cy={mark.y} rx={r * 0.3} ry={r * 0.18} fill="#7c2d12" opacity="0.68" />
                  <ellipse cx={mark.x - r * 0.18} cy={mark.y - r * 0.12} rx={r * 0.22} ry={r * 0.08} fill="#fed7aa" opacity="0.28" />
                </g>
              );
            }
            if (mark.kind === 'acid_burn') {
              const r = mark.radius * 0.96;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={r * 1.45}
                    ry={r * 1.08}
                    fill="#365314"
                    opacity="0.38"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <path
                    d={`M${mark.x - r},${mark.y - r * 0.25} Q${mark.x - r * 0.2},${mark.y - r * 0.95} ${mark.x + r * 0.9},${mark.y - r * 0.2} Q${mark.x + r * 0.85},${mark.y + r * 0.72} ${mark.x - r * 0.25},${mark.y + r * 0.82} Q${mark.x - r * 1.15},${mark.y + r * 0.35} ${mark.x - r},${mark.y - r * 0.25} Z`}
                    fill="#1a2e05"
                    stroke="#65a30d"
                    strokeOpacity="0.45"
                    strokeWidth="1.05"
                    opacity="0.78"
                    filter="url(#bruise-organic)"
                  />
                  <ellipse cx={mark.x + r * 0.08} cy={mark.y + r * 0.05} rx={r * 0.46} ry={r * 0.3} fill="#4d7c0f" opacity="0.58" filter="url(#soft-blur)" />
                  <circle cx={mark.x - r * 0.22} cy={mark.y - r * 0.14} r={r * 0.16} fill="#bef264" opacity="0.3" />
                </g>
              );
            }
            if (mark.kind === 'frost_burn') {
              const r = mark.radius * 0.96;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={r * 1.45}
                    ry={r * 1.05}
                    fill="#1e1b4b"
                    opacity="0.36"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={r * 0.96}
                    ry={r * 0.66}
                    fill="#0e7490"
                    stroke="#cffafe"
                    strokeOpacity="0.5"
                    strokeWidth="1.0"
                    opacity="0.62"
                    filter="url(#bruise-organic)"
                  />
                  <path
                    d={`M${mark.x - r * 0.55},${mark.y - r * 0.1} L${mark.x - r * 0.12},${mark.y - r * 0.3} L${mark.x + r * 0.48},${mark.y + r * 0.12} M${mark.x - r * 0.12},${mark.y - r * 0.3} L${mark.x + r * 0.08},${mark.y + r * 0.35}`}
                    stroke="#e0f2fe"
                    strokeWidth="0.9"
                    opacity="0.7"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              );
            }
            if (mark.kind === 'gash') {
              const len = mark.radius * 1.15;
              const gap = 2.4 + sev * 1.85;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation * 0.55} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={len * 1.24}
                    ry={gap * 2.4}
                    fill="url(#bruise-core-grad)"
                    opacity="0.68"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <path
                    d={`M${mark.x - len},${mark.y - 1.4} Q${mark.x},${mark.y - gap * 1.15} ${mark.x + len},${mark.y - 0.9}`}
                    fill="none"
                    stroke="#fff7ed"
                    strokeWidth="1.6"
                    opacity="0.2"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M${mark.x - len},${mark.y - 0.6} Q${mark.x - len * 0.35},${mark.y - gap} ${mark.x + len * 0.2},${mark.y - gap * 0.85} Q${mark.x + len * 0.72},${mark.y - gap * 0.35} ${mark.x + len},${mark.y} Q${mark.x + len * 0.3},${mark.y + gap * 1.02} ${mark.x - len * 0.35},${mark.y + gap * 0.88} Q${mark.x - len * 0.78},${mark.y + gap * 0.35} ${mark.x - len},${mark.y - 0.6} Z`}
                    fill="url(#wound-fascia-grad)"
                    stroke="#3b0406"
                    strokeOpacity="0.65"
                    strokeWidth="0.65"
                  />
                  <path
                    d={`M${mark.x - len * 0.82},${mark.y - 0.3} Q${mark.x},${mark.y - gap * 0.6} ${mark.x + len * 0.82},${mark.y} Q${mark.x},${mark.y + gap * 0.66} ${mark.x - len * 0.82},${mark.y - 0.3} Z`}
                    fill="url(#wound-cavity-grad)"
                  />
                  {mark.showBone && (
                    <g opacity="0.88">
                      <path
                        d={`M${mark.x - len * 0.32},${mark.y - 0.3} Q${mark.x},${mark.y - gap * 0.32} ${mark.x + len * 0.34},${mark.y + 0.1} Q${mark.x + len * 0.15},${mark.y + gap * 0.32} ${mark.x - len * 0.22},${mark.y + gap * 0.2} Z`}
                        fill="url(#wound-bone-grad)"
                        stroke="#450a0a"
                        strokeWidth="0.5"
                      />
                    </g>
                  )}
                  <path
                    d={`M${mark.x - len * 0.65},${mark.y + 0.2} Q${mark.x},${mark.y + gap * 0.42} ${mark.x + len * 0.65},${mark.y + 0.1}`}
                    stroke="#88131d"
                    strokeWidth="1.25"
                    opacity="0.72"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d={`M${mark.x - len * 0.45},${mark.y - gap * 0.45} Q${mark.x},${mark.y - gap * 0.56} ${mark.x + len * 0.4},${mark.y - gap * 0.35}`}
                    stroke="#fecaca"
                    strokeWidth="0.6"
                    opacity="0.28"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              );
            }
            if (mark.kind === 'laceration') {
              const r = mark.radius * 1.02;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation * 0.7} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={r * 1.28}
                    ry={r * 0.92}
                    fill="url(#bruise-core-grad)"
                    opacity="0.72"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <path
                    d={`M${mark.x - r},${mark.y - 1.8} Q${mark.x - r * 0.4},${mark.y - 4.4} ${mark.x + r * 0.08},${mark.y - 1.9} Q${mark.x + r * 0.55},${mark.y - 4.6} ${mark.x + r},${mark.y + 0.8} Q${mark.x + r * 0.42},${mark.y + 4.4} ${mark.x - r * 0.14},${mark.y + 2.2} Q${mark.x - r * 0.62},${mark.y + 4.4} ${mark.x - r},${mark.y - 1.8} Z`}
                    fill="url(#wound-fascia-grad)"
                    stroke="#3b0406"
                    strokeOpacity="0.62"
                    strokeWidth="0.7"
                  />
                  <path
                    d={`M${mark.x - r * 0.78},${mark.y - 0.8} Q${mark.x - r * 0.25},${mark.y - 2.9} ${mark.x + r * 0.25},${mark.y - 0.8} Q${mark.x + r * 0.72},${mark.y - 2.1} ${mark.x + r * 0.45},${mark.y + 2.4} Q${mark.x - r * 0.25},${mark.y + 1.6} ${mark.x - r * 0.78},${mark.y - 0.8} Z`}
                    fill="url(#wound-cavity-grad)"
                  />
                  {mark.showBone && (
                    <polygon
                      points={`${mark.x - r * 0.22},${mark.y - 1.1} ${mark.x + r * 0.18},${mark.y - 1.6} ${mark.x + r * 0.22},${mark.y + 1.3} ${mark.x - r * 0.12},${mark.y + 1.6}`}
                      fill="url(#wound-bone-grad)"
                      stroke="#450a0a"
                      strokeWidth="0.45"
                      opacity="0.86"
                    />
                  )}
                  <path
                    d={`M${mark.x - r * 0.55},${mark.y - 3.8} L${mark.x - r * 0.3},${mark.y - 1.4} M${mark.x + r * 0.3},${mark.y + 3.6} L${mark.x + r * 0.52},${mark.y + 1.1}`}
                    stroke="#fecaca"
                    strokeWidth="0.65"
                    opacity="0.28"
                    strokeLinecap="round"
                  />
                </g>
              );
            }
            if (mark.kind === 'puncture') {
              const r = mark.radius * 0.6;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  <circle
                    cx={mark.x}
                    cy={mark.y}
                    r={r * 1.55}
                    fill="url(#bruise-core-grad)"
                    opacity="0.72"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <path
                    d={`M${mark.x - r * 0.95},${mark.y - r * 0.25} L${mark.x + r * 0.92},${mark.y + r * 0.3} M${mark.x - r * 0.2},${mark.y - r * 0.9} L${mark.x + r * 0.28},${mark.y + r * 0.95}`}
                    stroke="#380406"
                    strokeOpacity="0.72"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx={mark.x} cy={mark.y} r={r * 0.68} fill="#7f1d1d" stroke="#220203" strokeWidth="0.75" />
                  <circle cx={mark.x} cy={mark.y} r={r * 0.46} fill="#180203" />
                  {mark.showBone && (
                    <polygon
                      points={`${mark.x - r * 0.24},${mark.y - r * 0.14} ${mark.x + r * 0.22},${mark.y - r * 0.2} ${mark.x + r * 0.14},${mark.y + r * 0.24} ${mark.x - r * 0.18},${mark.y + r * 0.16}`}
                      fill="url(#wound-bone-grad)"
                      opacity="0.85"
                    />
                  )}
                </g>
              );
            }
            if (mark.kind === 'cut') {
              const len = mark.radius * 1.04;
              const gap = 1.25 + sev * 1.05;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={len * 1.16}
                    ry={gap * 2.6}
                    fill="#6b0a0e"
                    opacity="0.28"
                    filter="url(#soft-blur)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <path
                    d={`M${mark.x - len * 0.9},${mark.y - 0.6} Q${mark.x},${mark.y - gap * 1.35} ${mark.x + len * 0.9},${mark.y - 0.7}`}
                    stroke="#fff7ed"
                    strokeWidth="1.15"
                    opacity="0.24"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d={`M${mark.x - len},${mark.y} Q${mark.x},${mark.y - gap} ${mark.x + len},${mark.y - 0.4} Q${mark.x},${mark.y + gap * 1.15} ${mark.x - len},${mark.y} Z`}
                    fill="#380406"
                    stroke="#6b0a0e"
                    strokeOpacity="0.65"
                    strokeWidth="0.5"
                  />
                  <path
                    d={`M${mark.x - len * 0.72},${mark.y} Q${mark.x},${mark.y + gap * 0.44} ${mark.x + len * 0.72},${mark.y - 0.2}`}
                    stroke="#991b1b"
                    strokeWidth="0.98"
                    opacity="0.78"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {mark.showBone && (
                    <path
                      d={`M${mark.x - len * 0.28},${mark.y + 0.1} Q${mark.x},${mark.y + 0.45} ${mark.x + len * 0.26},${mark.y - 0.1}`}
                      stroke="#dfd7c8"
                      strokeWidth="0.9"
                      opacity="0.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                </g>
              );
            }
            if (mark.kind === 'slash_deep') {
              const len = mark.radius * 1.28;
              const gap = 2.6 + sev * 2.05;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation * 0.72} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={len * 1.28}
                    ry={gap * 2.6}
                    fill="url(#bruise-core-grad)"
                    opacity="0.65"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <path
                    d={`M${mark.x - len * 0.94},${mark.y - 1.2} Q${mark.x},${mark.y - gap * 1.28} ${mark.x + len * 0.94},${mark.y - 0.8}`}
                    fill="none"
                    stroke="#fff7ed"
                    strokeWidth="1.5"
                    opacity="0.22"
                    strokeLinecap="round"
                  />
                  {/* Parted dermis & subcutaneous fat/fascia bed */}
                  <path
                    d={`M${mark.x - len},${mark.y - 0.4} Q${mark.x - len * 0.2},${mark.y - gap * 1.05} ${mark.x + len * 0.25},${mark.y - gap * 0.92} Q${mark.x + len * 0.75},${mark.y - gap * 0.3} ${mark.x + len},${mark.y + 0.2} Q${mark.x + len * 0.3},${mark.y + gap * 1.15} ${mark.x - len * 0.35},${mark.y + gap * 0.95} Z`}
                    fill="url(#wound-fascia-grad)"
                    stroke="#3b0406"
                    strokeOpacity="0.72"
                    strokeWidth="0.7"
                  />
                  {/* Deep muscle cavity */}
                  <path
                    d={`M${mark.x - len * 0.8},${mark.y - 0.1} Q${mark.x},${mark.y - gap * 0.62} ${mark.x + len * 0.8},${mark.y + 0.1} Q${mark.x},${mark.y + gap * 0.68} ${mark.x - len * 0.8},${mark.y - 0.1} Z`}
                    fill="url(#wound-cavity-grad)"
                  />
                  {/* Muscle fiber striations */}
                  <path
                    d={`M${mark.x - len * 0.48},${mark.y - gap * 0.22} L${mark.x - len * 0.22},${mark.y + gap * 0.34} M${mark.x - len * 0.05},${mark.y - gap * 0.32} L${mark.x + len * 0.16},${mark.y + gap * 0.36} M${mark.x + len * 0.32},${mark.y - gap * 0.24} L${mark.x + len * 0.5},${mark.y + gap * 0.25}`}
                    stroke="#991b1b"
                    strokeWidth="0.75"
                    opacity="0.65"
                    strokeLinecap="round"
                  />
                  {mark.showBone && (
                    <path
                      d={`M${mark.x - len * 0.28},${mark.y - 0.2} Q${mark.x},${mark.y - gap * 0.26} ${mark.x + len * 0.28},${mark.y + 0.1} Q${mark.x},${mark.y + gap * 0.28} ${mark.x - len * 0.28},${mark.y - 0.2} Z`}
                      fill="url(#wound-bone-grad)"
                      stroke="#450a0a"
                      strokeWidth="0.45"
                    />
                  )}
                  <path
                    d={`M${mark.x - len * 0.58},${mark.y + gap * 0.28} Q${mark.x},${mark.y + gap * 0.45} ${mark.x + len * 0.56},${mark.y + gap * 0.2}`}
                    stroke="#b91c1c"
                    strokeWidth="1.05"
                    opacity="0.72"
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
              );
            }
            if (mark.kind === 'razor_nick') {
              const len = mark.radius * 0.88;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={len * 1.1}
                    ry={len * 0.6}
                    fill="#7f1d1d"
                    opacity="0.22"
                    filter="url(#soft-blur)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  {[-2.4, 0, 2.3].map((dyOff, idx) => {
                    const localLen = len * (idx === 1 ? 1.05 : 0.72);
                    const shiftX = (idx - 1) * 1.6;
                    return (
                      <g key={idx}>
                        <path
                          d={`M${mark.x - localLen + shiftX},${mark.y + dyOff - 0.4} Q${mark.x + shiftX},${mark.y + dyOff - 1.1} ${mark.x + localLen + shiftX},${mark.y + dyOff + 0.3}`}
                          stroke="#3b0406"
                          strokeWidth="1.1"
                          strokeLinecap="round"
                          fill="none"
                          opacity="0.88"
                        />
                        <path
                          d={`M${mark.x - localLen * 0.6 + shiftX},${mark.y + dyOff} Q${mark.x + shiftX},${mark.y + dyOff - 0.5} ${mark.x + localLen * 0.65 + shiftX},${mark.y + dyOff + 0.2}`}
                          stroke="#991b1b"
                          strokeWidth="0.65"
                          strokeLinecap="round"
                          fill="none"
                          opacity="0.85"
                        />
                      </g>
                    );
                  })}
                  <circle cx={mark.x - 1.8} cy={mark.y - 1.8} r="0.8" fill="#7f1d1d" opacity="0.82" />
                  <circle cx={mark.x + 2.4} cy={mark.y + 1.9} r="0.75" fill="#991b1b" opacity="0.78" />
                </g>
              );
            }
            if (mark.kind === 'cheek_split') {
              const r = mark.radius * 1.06;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation * 0.5} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={r * 1.42}
                    ry={r * 0.96}
                    fill="url(#bruise-halo-grad)"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <path
                    d={`M${mark.x - r * 1.1},${mark.y - 1.6} Q${mark.x - r * 0.2},${mark.y - 5.2} ${mark.x + r * 0.45},${mark.y - 3.6} Q${mark.x + r * 1.15},${mark.y - 0.5} ${mark.x + r * 0.9},${mark.y + 2.4} Q${mark.x + r * 0.15},${mark.y + 5.6} ${mark.x - r * 0.55},${mark.y + 3.8} Q${mark.x - r * 1.15},${mark.y + 1.4} ${mark.x - r * 1.1},${mark.y - 1.6} Z`}
                    fill="url(#wound-fascia-grad)"
                    stroke="#3b0406"
                    strokeWidth="0.8"
                  />
                  <path
                    d={`M${mark.x - r * 0.84},${mark.y - 0.8} Q${mark.x},${mark.y - 3.6} ${mark.x + r * 0.78},${mark.y + 0.2} Q${mark.x},${mark.y + 3.8} ${mark.x - r * 0.84},${mark.y - 0.8} Z`}
                    fill="url(#wound-cavity-grad)"
                  />
                  {mark.showBone && (
                    <polygon
                      points={`${mark.x - r * 0.2},${mark.y - 1.4} ${mark.x + r * 0.28},${mark.y - 1.1} ${mark.x + r * 0.16},${mark.y + 1.8} ${mark.x - r * 0.22},${mark.y + 1.4}`}
                      fill="url(#wound-bone-grad)"
                      stroke="#450a0a"
                      strokeWidth="0.5"
                    />
                  )}
                  <path
                    d={`M${mark.x - r * 0.62},${mark.y - 3.6} Q${mark.x},${mark.y - 4.8} ${mark.x + r * 0.62},${mark.y - 2.4}`}
                    fill="none"
                    stroke="#fff7ed"
                    strokeWidth="1.25"
                    opacity="0.24"
                    strokeLinecap="round"
                  />
                </g>
              );
            }
            if (mark.kind === 'subdermal_clot') {
              const rx = mark.radius * (0.95 + sev * 0.25);
              const ry = mark.radius * (0.72 + sev * 0.22);
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={rx * 1.48}
                    ry={ry * 1.42}
                    fill="url(#bruise-halo-grad)"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={rx * 0.88}
                    ry={ry * 0.84}
                    fill="#3b0724"
                    opacity="0.72"
                    filter="url(#soft-blur)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <ellipse
                    cx={mark.x}
                    cy={mark.y + 0.6}
                    rx={rx * 0.62}
                    ry={ry * 0.58}
                    fill="#4c0519"
                    opacity="0.68"
                  />
                  {/* Swollen blister sheen */}
                  <ellipse
                    cx={mark.x - rx * 0.16}
                    cy={mark.y - ry * 0.22}
                    rx={rx * 0.36}
                    ry={ry * 0.18}
                    fill="#fff7ed"
                    opacity="0.26"
                  />
                </g>
              );
            }
            if (mark.kind === 'petechiae') {
              const r = mark.radius * 1.15;
              const seed = mark.id * 17.3;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={r * 1.25}
                    ry={r * 0.92}
                    fill="url(#bruise-halo-grad)"
                    opacity="0.7"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <g opacity="0.76" style={{ mixBlendMode: 'multiply' }}>
                    {Array.from({ length: 11 }).map((_, idx) => {
                      const a = ((seed + idx * 2.39) % 6.28);
                      const d = (((idx * 37 + mark.id * 13) % 100) / 100) * r * 0.95;
                      const px = mark.x + Math.cos(a) * d;
                      const py = mark.y + Math.sin(a) * d * 0.72;
                      const pr = 0.55 + (idx % 3) * 0.28;
                      return (
                        <circle
                          key={idx}
                          cx={px}
                          cy={py}
                          r={pr}
                          fill={idx % 2 === 0 ? '#5c0614' : '#881337'}
                        />
                      );
                    })}
                  </g>
                </g>
              );
            }
            if (mark.kind === 'shrapnel_tear') {
              const r = mark.radius * 0.92;
              return (
                <g key={mark.id} transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
                  <ellipse
                    cx={mark.x}
                    cy={mark.y}
                    rx={r * 1.55}
                    ry={r * 1.25}
                    fill="#18181b"
                    opacity="0.46"
                    filter="url(#bruise-organic)"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  <path
                    d={`M${mark.x - r * 1.1},${mark.y - r * 0.35} L${mark.x - r * 0.35},${mark.y - r * 0.2} L${mark.x - r * 0.1},${mark.y - r * 0.95} L${mark.x + r * 0.25},${mark.y - r * 0.25} L${mark.x + r * 1.08},${mark.y - r * 0.1} L${mark.x + r * 0.42},${mark.y + r * 0.35} L${mark.x + r * 0.72},${mark.y + r * 0.95} L${mark.x - r * 0.15},${mark.y + r * 0.42} L${mark.x - r * 0.85},${mark.y + r * 0.75} L${mark.x - r * 0.48},${mark.y + r * 0.12} Z`}
                    fill="url(#wound-fascia-grad)"
                    stroke="#270304"
                    strokeWidth="0.7"
                  />
                  <circle cx={mark.x} cy={mark.y} r={r * 0.42} fill="url(#wound-cavity-grad)" />
                  {mark.showBone && (
                    <polygon
                      points={`${mark.x - r * 0.22},${mark.y - r * 0.16} ${mark.x + r * 0.2},${mark.y - r * 0.18} ${mark.x + r * 0.14},${mark.y + r * 0.2}`}
                      fill="url(#wound-bone-grad)"
                      opacity="0.88"
                    />
                  )}
                </g>
              );
            }
            // Organic skin impact graze & subtle perilesional spatter halo (no stiff static drip sticks)
            const s = mark.radius * 0.52;
            return (
              <g key={mark.id}>
                <ellipse
                  cx={mark.x}
                  cy={mark.y}
                  rx={s * 1.55}
                  ry={s * 1.08}
                  transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}
                  fill="url(#bruise-core-grad)"
                  opacity="0.72"
                  filter="url(#bruise-organic)"
                  style={{ mixBlendMode: 'multiply' }}
                />
                <g transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`} filter="url(#blood-splatter-warp)" style={{ mixBlendMode: 'multiply' }}>
                  <path
                    d={`M${mark.x - s * 1.15},${mark.y - s * 0.2}
                        Q${mark.x - s * 0.38},${mark.y - s * 1.08} ${mark.x + s * 0.52},${mark.y - s * 0.5}
                        Q${mark.x + s * 1.35},${mark.y - s * 0.15} ${mark.x + s * 0.8},${mark.y + s * 0.6}
                        Q${mark.x + s * 0.15},${mark.y + s * 1.02} ${mark.x - s * 0.7},${mark.y + s * 0.52}
                        Q${mark.x - s * 1.4},${mark.y + s * 0.18} ${mark.x - s * 1.15},${mark.y - s * 0.2} Z`}
                    fill="#6b0a0e"
                    opacity="0.56"
                  />
                  <ellipse cx={mark.x + s * 1.45} cy={mark.y - s * 0.35} rx={s * 0.26} ry={s * 0.14} fill="#7f1d1d" opacity="0.58" />
                  <circle cx={mark.x + s * 0.95} cy={mark.y + s * 0.92} r="1.1" fill="#5c0b0b" opacity="0.62" />
                </g>
              </g>
            );
          })}

          {/* Compound Jaw Fracture Hematoma & Subtle Recessed Mandible Bone */}
          {trauma.jawFractured && (
            <g>
              <ellipse
                cx="182"
                cy="276"
                rx="44"
                ry="28"
                fill="url(#bruise-halo-grad)"
                filter="url(#bruise-organic)"
                style={{ mixBlendMode: 'multiply' }}
              />
              <ellipse
                cx="178"
                cy="279"
                rx="28"
                ry="18"
                fill="url(#bruise-core-grad)"
                filter="url(#bruise-organic)"
                style={{ mixBlendMode: 'multiply' }}
              />
              {/* Organic tapered subdermal tear around jaw fracture */}
              <path
                d="M153,275 Q169,281 184,295 Q173,301 159,291 Q154,283 153,275 Z"
                fill="url(#wound-fascia-grad)"
                stroke="#3b0406"
                strokeOpacity="0.65"
                strokeWidth="0.75"
              />
              <path
                d="M156,277 Q169,283 181,293 Q172,297 161,289 Z"
                fill="url(#wound-cavity-grad)"
              />
              <polygon
                points="167,282 176,289 171,292 165,286"
                fill="url(#wound-bone-grad)"
                stroke="#450a0a"
                strokeWidth="0.6"
              />
              <path d="M172,291 Q175,302 173,312 Q176,302 174,291 Z" fill="#6b0a0e" opacity="0.62" style={{ mixBlendMode: 'multiply' }} />
            </g>
          )}

          {/* Realistic Arterial Cheek Laceration (tapered tear + feathered multiply stain, no hard stick pipe) */}
          {trauma.arterialRupture && (
            <g>
              <ellipse cx="109" cy="197" rx="26" ry="15" fill="url(#bruise-core-grad)" opacity="0.72" filter="url(#bruise-organic)" style={{ mixBlendMode: 'multiply' }} />
              <path d="M96,190 Q110,192 123,204" fill="none" stroke="#fff7ed" strokeWidth="1.3" opacity="0.2" strokeLinecap="round" />
              <path
                d="M95,191 Q110,191 124,205 Q109,204 95,191 Z"
                fill="url(#wound-fascia-grad)"
                stroke="#3b0406"
                strokeOpacity="0.68"
                strokeWidth="0.65"
              />
              <path
                d="M98,192.5 Q110,194 121,203.5 Q109,201 98,192.5 Z"
                fill="#5c0609"
              />
              <path d="M106,198 Q103,228 106,262 Q108,230 110,199 Z" fill="#7f1d1d" opacity="0.58" style={{ mixBlendMode: 'multiply' }} filter="url(#soft-blur)" />
            </g>
          )}

          {/* Realistic Periorbital Under-Eye Bags, Swelling & Ecchymosis */}
          <path d="M98,162 Q116,169 134,162" fill="none" stroke="#180a05" strokeWidth="2.4" opacity={damageStage >= 1 ? '0.45' : '0.22'} filter="url(#soft-blur)" />
          <path d="M186,162 Q204,169 222,162" fill="none" stroke="#180a05" strokeWidth="2.4" opacity={damageStage >= 1 ? '0.45' : '0.22'} filter="url(#soft-blur)" />

          {(damageStage >= 1 || trauma.leftEyeSwollen) && (
            <g>
              {/* Outer bruised tear-trough & orbital pooling */}
              <path
                d="M84,144 Q112,126 142,142 Q144,168 122,174 Q94,175 84,144 Z"
                fill="url(#periorbital-grad)"
                filter="url(#bruise-organic)"
                style={{ mixBlendMode: 'multiply' }}
              />
              {/* Swollen upper/lower orbital ridge edema + taut shiny skin */}
              <path
                d="M95,163 Q115,172 134,162"
                fill="none"
                stroke="#fff7ed"
                strokeWidth="3.2"
                opacity="0.17"
                strokeLinecap="round"
                filter="url(#soft-blur)"
              />
              <circle cx="102" cy="159" r="1.1" fill="#450a0a" opacity="0.65" />
              <circle cx="126" cy="161" r="0.9" fill="#7f1d1d" opacity="0.6" />
              <circle cx="111" cy="165" r="1" fill="#450a0a" opacity="0.55" />
            </g>
          )}
          {(damageStage >= 2 || trauma.rightEyeSwollen || trauma.eyeRuptured) && (
            <g>
              <path
                d="M236,144 Q208,126 178,142 Q176,168 198,174 Q226,175 236,144 Z"
                fill="url(#periorbital-grad)"
                filter="url(#bruise-organic)"
                style={{ mixBlendMode: 'multiply' }}
              />
              <path
                d="M186,162 Q205,172 225,163"
                fill="none"
                stroke="#fff7ed"
                strokeWidth="3.2"
                opacity="0.17"
                strokeLinecap="round"
                filter="url(#soft-blur)"
              />
              <circle cx="196" cy="161" r="1.1" fill="#450a0a" opacity="0.65" />
              <circle cx="216" cy="159" r="1" fill="#7f1d1d" opacity="0.6" />
              <circle cx="207" cy="165" r="0.9" fill="#450a0a" opacity="0.55" />
            </g>
          )}

          {/* Subtle Nostril Blood Pooling & Broken Nasal Bridge Contusion */}
          {(damageStage >= 2 || trauma.noseBroken) && (
            <g>
              <ellipse cx="153" cy="201" rx="3.4" ry="2.2" fill="#450506" opacity="0.72" />
              <ellipse cx="167" cy="201" rx="3.4" ry="2.2" fill="#450506" opacity="0.72" />
              <path d="M153,202 Q151,218 150,235 Q153,220 155,202 Z" fill="#6b0a0e" opacity="0.62" style={{ mixBlendMode: 'multiply' }} />
              <path d="M167,202 Q169,216 171,232 Q170,218 169,202 Z" fill="#6b0a0e" opacity="0.56" style={{ mixBlendMode: 'multiply' }} />
              {trauma.noseBroken && (
                <ellipse
                  cx="160"
                  cy="182"
                  rx="20"
                  ry="16"
                  fill="url(#periorbital-grad)"
                  filter="url(#bruise-organic)"
                  style={{ mixBlendMode: 'multiply' }}
                />
              )}
            </g>
          )}

          {/* Exposed Cracked Frontal Skull Trauma (recessed realistic tear, blended into forehead) */}
          {trauma.skullExposed && (
            <g>
              <ellipse
                cx="150"
                cy="87"
                rx="38"
                ry="22"
                fill="url(#bruise-core-grad)"
                filter="url(#bruise-organic)"
                style={{ mixBlendMode: 'multiply' }}
              />
              <path
                d="M122,82 Q146,70 172,77 Q184,85 174,98 Q151,105 127,96 Q116,89 122,82 Z"
                fill="url(#wound-fascia-grad)"
                stroke="#3b0406"
                strokeOpacity="0.68"
                strokeWidth="1.1"
              />
              <path
                d="M126,83 Q147,74 168,80 Q177,86 169,95 Q150,100 130,93 Q122,88 126,83 Z"
                fill="url(#wound-cavity-grad)"
              />
              <path
                d="M134,85 Q150,79 163,84 Q169,88 162,92 Q149,96 137,90 Q131,88 134,85 Z"
                fill="url(#wound-bone-grad)"
                stroke="#57534e"
                strokeWidth="0.75"
              />
              <path
                d="M140,86 L149,89 L155,84 L162,90 M149,89 L146,94"
                stroke="#292524"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
              <path d="M156,100 Q157,118 155,134 Q158,118 158,100 Z" fill="#6b0a0e" opacity="0.55" style={{ mixBlendMode: 'multiply' }} filter="url(#soft-blur)" />
            </g>
          )}

          {/* Subtle Multiply-Blended Chin Ooze on Heavy Mouth/Jaw Trauma */}
          {(trauma.lipTorn || (damageStage >= 3 && (trauma.mouthDamage >= 16 || trauma.jawFractured))) && (
            <g style={{ mixBlendMode: 'multiply' }}>
              <path
                d="M152,262 Q151,278 150,292 Q153,280 155,262 Z"
                fill="#6b0a0e"
                opacity="0.58"
                filter="url(#soft-blur)"
              />
              {trauma.lipTorn && (
                <path
                  d="M163,262 Q165,278 164,295 Q167,280 166,262 Z"
                  fill="#5c0609"
                  opacity="0.52"
                  filter="url(#soft-blur)"
                />
              )}
            </g>
          )}

          {/* Realistic Cheek Tear Trails & Slowly Rolling Tear Droplets (driven at 60fps via RAF) */}
          <g className="pointer-events-none">
            {TEAR_TRACKS.map((track, i) => (
              <React.Fragment key={track.id}>
                <path
                  ref={(el) => {
                    trailRefs.current[i] = el;
                  }}
                  d={track.d}
                  fill="none"
                  stroke={hemolacria ? '#f87171' : '#e0f2fe'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  style={{ opacity: 0 }}
                />
                <g
                  ref={(el) => {
                    beadRefs.current[i] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  <path
                    d="M0,-6 C2.2,-2.2 3.4,0.4 3.4,2.2 A3.4,3.4 0 1,1 -3.4,2.2 C-3.4,0.4 -2.2,-2.2 0,-6 Z"
                    fill="url(#tear-bead-grad)"
                    stroke="#09090b"
                    strokeOpacity="0.22"
                    strokeWidth="0.6"
                  />
                  <circle cx="-1" cy="2.6" r="1.1" fill="#ffffff" opacity="0.92" />
                </g>
              </React.Fragment>
            ))}

            {isEyesWatering && !isKo && (
              <>
                <path
                  d="M99,157 Q116,164 133,157"
                  stroke="#dc2626"
                  strokeWidth="2"
                  opacity={Math.min(0.75, cryIntensity * 0.9)}
                  fill="none"
                />
                <path
                  d="M187,157 Q204,164 221,157"
                  stroke="#dc2626"
                  strokeWidth="2"
                  opacity={Math.min(0.75, cryIntensity * 0.9)}
                  fill="none"
                />
              </>
            )}
          </g>

          {/* Clammy Exertion Skin Sheen & Slowly Trickling Sweat Droplets (driven at 60fps via RAF) */}
          <g className="pointer-events-none">
            <g ref={sweatSheenRef} style={{ opacity: 0 }}>
              <ellipse cx="160" cy="96" rx="52" ry="15" fill="url(#sweat-sheen-grad)" filter="url(#soft-blur)" />
              <ellipse cx="102" cy="176" rx="18" ry="10" transform="rotate(-14 102 176)" fill="url(#sweat-sheen-grad)" filter="url(#soft-blur)" />
              <ellipse cx="218" cy="176" rx="18" ry="10" transform="rotate(14 218 176)" fill="url(#sweat-sheen-grad)" filter="url(#soft-blur)" />
            </g>

            {SWEAT_TRACKS.map((track, i) => (
              <React.Fragment key={track.id}>
                <path
                  ref={(el) => {
                    sweatTrailRefs.current[i] = el;
                  }}
                  d={track.d}
                  fill="none"
                  stroke="#f8fafc"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  style={{ opacity: 0 }}
                />
                <g
                  ref={(el) => {
                    sweatBeadRefs.current[i] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  <path
                    d="M0,-4.8 C1.8,-1.8 2.8,0.4 2.8,1.9 A2.8,2.8 0 1,1 -2.8,1.9 C-2.8,0.4 -1.8,-1.8 0,-4.8 Z"
                    fill="url(#sweat-bead-grad)"
                    stroke="#0f172a"
                    strokeOpacity="0.22"
                    strokeWidth="0.45"
                  />
                  <circle cx="-0.85" cy="2.1" r="0.85" fill="#ffffff" opacity="0.92" />
                </g>
              </React.Fragment>
            ))}
          </g>

          {/* Scalp Root Bed inside head-clip (skipped for miniBossId since BossSculptedHair draws exact silhouettes) */}
          {!enemy.miniBossId && (
            <>
          {enemy.hairStyle === 'short' && (
            <g>
              <path
                d="M66,118 C66,54 108,32 160,32 C212,32 254,54 254,118 C242,84 214,66 160,65 C106,66 78,84 66,118 Z"
                fill={enemy.hairColor}
                opacity="0.86"
              />
              <path
                d="M66,118 C66,54 108,32 160,32 C212,32 254,54 254,118 C242,84 214,66 160,65 C106,66 78,84 66,118 Z"
                fill="url(#hair-depth-grad)"
              />
              <ellipse cx="160" cy="46" rx="44" ry="10" fill="#ffffff" opacity="0.08" filter="url(#soft-blur)" />
            </g>
          )}
          {enemy.hairStyle === 'buzz' && (
            <g>
              <path
                d="M68,116 C72,56 112,34 160,34 C208,34 248,56 252,116 C236,86 206,74 160,74 C114,74 84,86 68,116 Z"
                fill={enemy.hairColor}
                opacity="0.74"
              />
              <path
                d="M68,116 C72,56 112,34 160,34 C208,34 248,56 252,116 C236,86 206,74 160,74 C114,74 84,86 68,116 Z"
                fill="url(#stubble-pat)"
                opacity="0.62"
              />
            </g>
          )}
          {enemy.hairStyle === 'mohawk' && (
            <g>
              <path d="M142,32 Q160,26 178,32 L173,78 Q160,74 147,78 Z" fill={enemy.hairColor} opacity="0.84" />
              <path d="M142,32 Q160,26 178,32 L173,78 Q160,74 147,78 Z" fill="url(#hair-depth-grad)" />
            </g>
          )}
          {enemy.hairStyle === 'wild' && (
            <g>
              <path
                d="M64,126 C60,58 102,28 160,30 C218,28 260,58 256,126 C242,88 214,64 160,62 C106,64 78,88 64,126 Z"
                fill={enemy.hairColor}
                opacity="0.88"
              />
              <path
                d="M64,126 C60,58 102,28 160,30 C218,28 260,58 256,126 C242,88 214,64 160,62 C106,64 78,88 64,126 Z"
                fill="url(#hair-depth-grad)"
              />
              <ellipse cx="160" cy="44" rx="48" ry="11" fill="#ffffff" opacity="0.07" filter="url(#soft-blur)" />
            </g>
          )}
          {enemy.hairStyle === 'trevor_receding' && !enemy.bossId && (
            <g>
              <path
                d="M72,118 C72,82 90,54 114,48 C108,68 96,90 82,118 Z M248,118 C248,82 230,54 206,48 C212,68 224,90 238,118 Z"
                fill={enemy.hairColor}
                opacity="0.88"
              />
            </g>
          )}
          {enemy.hairStyle === 'helmet' && (
            <g>
              <path
                d="M62,135 C62,48 106,30 160,30 C214,30 258,48 258,135 L234,122 C210,104 110,104 86,122 Z"
                fill="url(#metal-grad)"
                stroke="#09090b"
                strokeWidth="2.5"
              />
              <path d="M84,116 Q160,96 236,116" fill="none" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.45" />
              <rect x="148" y="34" width="24" height="58" rx="4" fill="#18181b" stroke="#09090b" strokeWidth="1.2" />
              {damageStage >= 2 && (
                <path
                  d="M102,68 L122,88 L116,104 M206,62 L190,85 L202,98"
                  stroke="#09090b"
                  strokeWidth="2.6"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
            </g>
          )}

          {enemy.hairStyle === 'pompadour' && (
            <g>
              <path
                d="M72,116 C68,54 110,30 160,30 C210,30 252,54 248,116 C238,80 212,56 160,54 C108,56 82,80 72,116 Z"
                fill={enemy.hairColor}
                opacity="0.9"
              />
              <path
                d="M72,116 C68,54 110,30 160,30 C210,30 252,54 248,116 C238,80 212,56 160,54 C108,56 82,80 72,116 Z"
                fill="url(#hair-depth-grad)"
              />
            </g>
          )}
          {(enemy.hairStyle === 'dreads' || enemy.hairStyle === 'afro') && (
            <g>
              <path
                d="M64,120 C64,52 108,30 160,30 C212,30 256,52 256,120 C240,84 212,62 160,60 C108,62 80,84 64,120 Z"
                fill={enemy.hairColor}
                opacity="0.92"
              />
              <path
                d="M64,120 C64,52 108,30 160,30 C212,30 256,52 256,120 C240,84 212,62 160,60 C108,62 80,84 64,120 Z"
                fill="url(#hair-depth-grad)"
              />
            </g>
          )}
          {enemy.hairStyle === 'slick_back' && (
            <g>
              <path
                d="M68,118 C68,54 110,32 160,32 C210,32 252,54 252,118 C240,78 212,58 160,58 C108,58 80,78 68,118 Z"
                fill={enemy.hairColor}
                opacity="0.9"
              />
              <ellipse cx="160" cy="48" rx="46" ry="8" fill="#ffffff" opacity="0.14" filter="url(#soft-blur)" />
            </g>
          )}
          {enemy.hairStyle === 'bandana_gang' && (
            <g>
              {/* Tied Street Forehead Bandana */}
              <path
                d="M64,98 Q160,82 256,98 L254,68 Q160,54 66,68 Z"
                fill={enemy.hairColor === '#18181b' || enemy.hairColor === '#0f172a' ? '#991b1b' : '#1e293b'}
                stroke="#09090b"
                strokeWidth="1.6"
              />
              <path
                d="M72,82 Q160,68 248,82"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.3"
                strokeDasharray="6,6"
                opacity="0.34"
              />
              <path d="M68,72 C74,44 112,30 160,30 C208,30 246,44 252,72 Z" fill={enemy.hairColor} opacity="0.88" />
            </g>
          )}
            </>
          )}

          {/* Realistic Subtle Old Healed Facial Scar (never harsh cartoon red cut) */}
          {enemy.hasScar && !enemy.bossId && (
            <g opacity="0.46">
              <path
                d="M196,115 Q203,140 211,164"
                stroke={enemy.skinShadow}
                strokeWidth="2.1"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M197.2,116 Q204.2,140 212,163"
                stroke="#f5d0c5"
                strokeWidth="1.05"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M196,125 L201,123 M199,138 L205,136 M204,151 L210,149"
                stroke={enemy.skinShadow}
                strokeWidth="0.7"
                opacity="0.55"
                strokeLinecap="round"
              />
            </g>
          )}
          </g>
        </g>

        {/* Realistic Eyebrows & Layered Eyes (Dual Eyes OR Single Giant Cyclops Eye) */}
        <g ref={eyebrowsEyesParallaxRef}>
        <g style={eyesDeformStyle}>
          {enemy.species === 'cyclops' ? (
            <g>
              {/* Heavy Single Cyclops Monobrow with 60fps Fluid Interpolation */}
              <path
                ref={cyclopsBrowShadowRef}
                d="M106,112 Q160,126 214,112"
                stroke="#140905"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                opacity="0.22"
                filter="url(#soft-blur)"
              />
              <path
                ref={cyclopsBrowMainRef}
                d="M108,112 Q160,125 212,112"
                stroke={enemy.hairColor}
                strokeWidth="6.8"
                strokeLinecap="round"
                fill="none"
                opacity="0.88"
              />
              <path
                ref={cyclopsBrowHairsRef}
                d="M114,111 L122,117 M130,115 L138,120 M151,115 L156,121 M169,115 L164,121 M190,115 L182,120 M206,111 L198,117"
                stroke={enemy.hairColor}
                strokeWidth="2.1"
                strokeLinecap="round"
                fill="none"
                opacity="0.86"
              />

              {/* Single Giant Central Cyclops Eye */}
              {mood === 'ko' ? (
                <g>
                  <path d="M120,141 Q160,154 200,141" fill="none" stroke="#1c0d08" strokeWidth="4.2" strokeLinecap="round" />
                  <path d="M132,146 L128,153 M150,149 L149,156 M170,149 L171,156 M188,146 L192,153" stroke="#180a05" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                </g>
              ) : trauma.leftEyeRuptured || trauma.rightEyeRuptured || trauma.eyeRuptured ? (
                <g>
                  <ellipse cx="160" cy="141" rx="34" ry="20" fill="#2a0404" stroke="#1c0d08" strokeWidth="2.5" />
                  <ellipse cx="160" cy="141" rx="27" ry="15" fill="#991b1b" />
                  <circle cx="160" cy="141" r="12" fill="#cbd5e1" opacity="0.88" />
                  <circle cx="160" cy="141" r="6.5" fill="#475569" opacity="0.72" />
                  <path d="M138,134 L152,141 M182,136 L166,142" stroke="#dc2626" strokeWidth="2.2" />
                  <path d="M168,156 Q172,190 176,220" stroke="#b91c1c" strokeWidth="4.2" strokeLinecap="round" />
                </g>
              ) : trauma.leftEyeSwollen || trauma.rightEyeSwollen ? (
                <g>
                  <path
                    d="M116,141 Q160,114 204,141 Q160,166 116,141 Z"
                    fill={enemy.skinShadow}
                    stroke="#2b120c"
                    strokeWidth="1.6"
                  />
                  <ellipse cx="160" cy="141" rx="38" ry="19" fill="url(#periorbital-grad)" opacity="0.75" filter="url(#soft-blur)" />
                  <path d="M122,142 Q160,136 198,142" fill="none" stroke="#180806" strokeWidth="3.4" strokeLinecap="round" />
                  <path d="M128,144 L124,154 M192,144 L196,154" stroke="#991b1b" strokeWidth="1.9" strokeLinecap="round" />
                </g>
              ) : (
                <g>
                  <path
                    ref={cyclopsEyeOutlineRef}
                    d="M121,141 Q160,115 199,141 Q160,165 121,141 Z"
                    fill="url(#sclera-grad)"
                    stroke="#2b160f"
                    strokeWidth="2"
                  />
                  {(damageStage >= 1 || trauma.isBlind) && (
                    <path d="M126,140 L138,137 M180,142 L194,138 M132,146 L142,143 M182,135 L191,136" stroke="#dc2626" strokeWidth="1.6" opacity="0.88" />
                  )}
                  <g clipPath="url(#cyclops-eye-clip)">
                    {trauma.isBlind ? (
                      <g ref={cyclopsIrisGroupRef}>
                        <circle cx="160" cy="140" r="14" fill="url(#iris-blind-grad)" />
                        <circle cx="160" cy="140" r="6.5" fill="#94a3b8" opacity="0.85" />
                        <ellipse cx="160" cy="140" rx="11" ry="9" fill="#e2e8f0" opacity="0.34" />
                      </g>
                    ) : (
                      <g ref={cyclopsIrisGroupRef}>
                        <circle cx="160" cy="141" r={mood === 'crying' ? 12.2 : 14} fill="url(#cyclops-iris-grad)" />
                        <circle ref={cyclopsPupilRef} cx="160" cy="141" r={mood === 'crying' ? 4.9 : 6.4} fill="#090503" />
                        <circle cx="155.5" cy="136" r="3.1" fill="#ffffff" opacity="0.95" />
                        <circle cx="164" cy="145" r="1.3" fill="#ffffff" opacity="0.65" />
                      </g>
                    )}
                    <rect x="116" y="114" width="88" height="20" fill="url(#eyelid-shadow)" />
                    <path
                      ref={leftPoolRef}
                      d="M122,148 Q160,158 198,148 L198,170 L122,170 Z"
                      fill="url(#tear-pool-grad)"
                      style={{ opacity: 0, transformOrigin: '160px 158px' }}
                    />
                    <path
                      ref={cyclopsUpperLidCurtainRef}
                      d="M116,110 L204,110 L204,142 Q160,115 116,142 Z"
                      fill="url(#eyelid-skin-grad)"
                    />
                    <path
                      ref={cyclopsLowerLidCurtainRef}
                      d="M116,172 L204,172 L204,141 Q160,165 116,141 Z"
                      fill="url(#eyelid-skin-grad)"
                    />
                  </g>
                  <path
                    ref={cyclopsLidCreaseRef}
                    d="M124,136 Q160,108 196,136"
                    fill="none"
                    stroke="#241008"
                    strokeWidth="1.5"
                    opacity="0.52"
                  />
                  <path
                    ref={cyclopsUpperLashRef}
                    d="M120,141 Q160,115 200,141"
                    fill="none"
                    stroke="#110906"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>
          ) : (
            <>
          {/* Left Eyebrow (60fps smooth spring-interpolated ridge shadow + hair strokes; hidden for Thanos bony plates) */}
          <g opacity={enemy.bossId === 'thanos' ? 0 : 1}>
            <path
              ref={leftBrowShadowRef}
              d="M90,124 Q114,115 139,124"
              stroke={isBlueSkin ? '#082f49' : '#160a06'}
              strokeWidth={enemy.species === 'neanderthal' ? '9' : enemy.bossId === 'joker' ? '8' : '6.8'}
              strokeLinecap="round"
              fill="none"
              opacity={enemy.bossId === 'joker' ? '0.42' : '0.2'}
              filter="url(#soft-blur)"
            />
            <path
              ref={leftBrowMainRef}
              d="M90,124 Q114,115 139,124"
              stroke={
                enemy.bossId === 'joker'
                  ? '#18181b'
                  : enemy.bossId === 'trevor_gta5'
                    ? '#24170f'
                    : enemy.bossId === 'wolverine'
                      ? '#14100e'
                      : enemy.miniBossId === 'cellbit'
                        ? '#7c522d'
                        : isBlueSkin
                          ? '#090d16'
                          : enemy.hairColor
              }
              strokeWidth={
                enemy.species === 'neanderthal'
                  ? '6.2'
                  : enemy.bossId === 'wolverine'
                    ? '5.2'
                    : enemy.bossId === 'trevor_gta5' || enemy.miniBossId === 'casimiro' || enemy.miniBossId === 'davy_jones'
                      ? '4.8'
                      : enemy.miniBossId === 'whindersson'
                        ? '3.6'
                        : '4.2'
              }
              strokeLinecap="round"
              fill="none"
              opacity={enemy.bossId === 'joker' ? '0.62' : '0.86'}
            />
            <path
              ref={leftBrowHairsRef}
              d="M93,124 L100,119 M105,120 L114,117 M118,118 L127,119 M131,121 L138,124"
              stroke={
                enemy.bossId === 'joker'
                  ? '#18181b'
                  : enemy.bossId === 'trevor_gta5'
                    ? '#1a100a'
                    : enemy.miniBossId === 'cellbit'
                      ? '#6b4423'
                      : isBlueSkin
                        ? '#090d16'
                        : enemy.hairColor
              }
              strokeWidth={enemy.species === 'neanderthal' ? '2.2' : enemy.bossId === 'wolverine' || enemy.bossId === 'trevor_gta5' ? '2.0' : '1.7'}
              strokeLinecap="round"
              fill="none"
              opacity={enemy.bossId === 'joker' ? '0.52' : '0.9'}
            />
          </g>

          {/* Right Eyebrow (hidden over Thanos bony plates & T-800 exposed chrome orbital brow) */}
          <g opacity={enemy.bossId === 'thanos' || enemy.bossId === 't800' ? 0 : 1}>
            <path
              ref={rightBrowShadowRef}
              d="M230,124 Q206,115 181,124"
              stroke={isBlueSkin ? '#082f49' : '#160a06'}
              strokeWidth={enemy.species === 'neanderthal' ? '9' : enemy.bossId === 'joker' ? '8' : '6.8'}
              strokeLinecap="round"
              fill="none"
              opacity={enemy.bossId === 'joker' ? '0.42' : '0.2'}
              filter="url(#soft-blur)"
            />
            <path
              ref={rightBrowMainRef}
              d="M230,124 Q206,115 181,124"
              stroke={
                enemy.bossId === 'joker'
                  ? '#18181b'
                  : enemy.bossId === 'trevor_gta5'
                    ? '#24170f'
                    : enemy.bossId === 'wolverine'
                      ? '#14100e'
                      : enemy.miniBossId === 'cellbit'
                        ? '#7c522d'
                        : isBlueSkin
                          ? '#090d16'
                          : enemy.hairColor
              }
              strokeWidth={
                enemy.species === 'neanderthal'
                  ? '6.2'
                  : enemy.bossId === 'wolverine'
                    ? '5.2'
                    : enemy.bossId === 'trevor_gta5' || enemy.miniBossId === 'casimiro' || enemy.miniBossId === 'davy_jones'
                      ? '4.8'
                      : enemy.miniBossId === 'whindersson'
                        ? '3.6'
                        : '4.2'
              }
              strokeLinecap="round"
              fill="none"
              opacity={enemy.bossId === 'joker' ? '0.62' : '0.86'}
            />
            <path
              ref={rightBrowHairsRef}
              d="M227,124 L220,119 M215,120 L206,117 M202,118 L193,119 M189,121 L182,124"
              stroke={
                enemy.bossId === 'joker'
                  ? '#18181b'
                  : enemy.bossId === 'trevor_gta5'
                    ? '#1a100a'
                    : enemy.miniBossId === 'cellbit'
                      ? '#6b4423'
                      : isBlueSkin
                        ? '#090d16'
                        : enemy.hairColor
              }
              strokeWidth={enemy.species === 'neanderthal' ? '2.2' : enemy.bossId === 'wolverine' || enemy.bossId === 'trevor_gta5' ? '2.0' : '1.7'}
              strokeLinecap="round"
              fill="none"
              opacity={enemy.bossId === 'joker' ? '0.52' : '0.9'}
            />
          </g>

          {/* Left Eye */}
          {mood === 'ko' ? (
            <g>
              <path d="M97,149 Q116,156 134,149" fill="none" stroke="#1c0d08" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M101,152 L98,156 M110,154 L109,158 M120,154 L121,158" stroke="#180a05" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
            </g>
          ) : trauma.leftEyeRuptured ? (
            <g>
              <ellipse cx="116" cy="148" rx="18" ry="12" fill="#2a0404" stroke="#1c0d08" strokeWidth="2.2" />
              <ellipse cx="116" cy="148" rx="14" ry="9" fill="#991b1b" />
              <circle cx="116" cy="148" r="6.8" fill="#cbd5e1" opacity="0.88" />
              <circle cx="116" cy="148" r="4.2" fill="#475569" opacity="0.7" />
              <path d="M105,144 L112,148 M128,146 L119,149" stroke="#dc2626" strokeWidth="1.8" />
              <path d="M124,158 Q126,178 128,196 Q128,178 126,158 Z" fill="#6b0a0e" opacity="0.62" style={{ mixBlendMode: 'multiply' }} />
            </g>
          ) : trauma.leftEyeSwollen ? (
            <g>
              {/* Edematous swollen-shut left eyelid & bruised ridge */}
              <path
                d="M93,149 Q116,134 139,149 Q116,163 93,149 Z"
                fill={enemy.skinShadow}
                stroke="#2b120c"
                strokeWidth="1.2"
              />
              <ellipse cx="116" cy="149" rx="22" ry="12" fill="url(#periorbital-grad)" opacity="0.72" filter="url(#soft-blur)" />
              <path d="M100,143 Q116,138 131,144" fill="none" stroke="#fff7ed" strokeWidth="2.4" opacity="0.22" strokeLinecap="round" filter="url(#soft-blur)" />
              <path d="M96,150 Q116,146 135,151" fill="none" stroke="#180806" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M98,151 L95,158 M132,152 L134,157" stroke="#991b1b" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              {/* Almond Eye Shape with Sclera Gradient & Tear Caruncle */}
              <path
                ref={leftEyeOutlineRef}
                d="M97,149 Q116,135 133,150 Q116,161 97,149 Z"
                fill="url(#sclera-grad)"
                stroke="#2b160f"
                strokeWidth="1.4"
              />
              {/* Inner tear duct caruncle */}
              <ellipse cx="130.5" cy="150" rx="2.6" ry="2" fill="#e1837d" opacity="0.82" />

              {(damageStage >= 1 || trauma.isBlind || trauma.leftEyeDamage >= 45 || isCrying) && (
                <g opacity={Math.min(0.95, 0.45 + damageStage * 0.18 + (trauma.leftEyeDamage >= 45 ? 0.22 : 0))}>
                  <path d="M99,149 L108,147 M122,151 L130,149 M102,153 L109,151 M124,145 L129,146" stroke="#dc2626" strokeWidth="1.15" fill="none" />
                  {(damageStage >= 2 || trauma.leftEyeDamage >= 70) && (
                    <path d="M100,146 L106,148 L110,145 M123,153 L127,150 L132,152" stroke="#991b1b" strokeWidth="0.9" fill="none" />
                  )}
                  {damageStage >= 3 && (
                    <ellipse cx="105" cy="150" rx="3.4" ry="2.2" fill="#dc2626" opacity="0.45" />
                  )}
                </g>
              )}

              <g clipPath="url(#left-eye-clip)">
                {trauma.isBlind ? (
                  <g ref={leftIrisGroupRef}>
                    {/* Blind milky-cataract unfocused stare */}
                    <circle cx="115.4" cy="146.5" r="7.4" fill="url(#iris-blind-grad)" />
                    <circle cx="115.4" cy="146.5" r="3.6" fill="#94a3b8" opacity="0.85" />
                    <ellipse cx="115.4" cy="146.5" rx="6.2" ry="5.5" fill="#e2e8f0" opacity="0.32" />
                  </g>
                ) : (
                  <g ref={leftIrisGroupRef}>
                    <circle cx="116" cy="148" r={mood === 'crying' ? 6.4 : 7.4} fill="url(#iris-grad)" />
                    <circle
                      ref={leftPupilRef}
                      cx="116"
                      cy="148"
                      r={mood === 'crying' ? 2.6 : 3.4}
                      fill="#090605"
                      opacity={enemy.bossId === 'geralt' ? 0 : 1}
                    />
                    {enemy.bossId === 'geralt' && (
                      <ellipse cx="116" cy="148" rx="1.25" ry="5.5" fill="#090605" />
                    )}
                    {/* Crisp dual corneal catchlights */}
                    <circle cx="113.6" cy="145.6" r="1.7" fill="#ffffff" opacity="0.95" />
                    <circle cx="118.2" cy="150.2" r="0.7" fill="#ffffff" opacity="0.65" />
                  </g>
                )}
                {/* Upper eyelid shadow cast over top of eyeball */}
                <rect x="94" y="133" width="44" height="14" fill="url(#eyelid-shadow)" />

                {/* Brimming watery tear pool filling the lower eyelid rim */}
                <path
                  ref={leftPoolRef}
                  d="M98,153 Q116,158 134,153 L134,166 L98,166 Z"
                  fill="url(#tear-pool-grad)"
                  style={{ opacity: 0, transformOrigin: '116px 160px' }}
                />
                {isEyesWatering && (
                  <path
                    d="M103,155 Q116,159 129,155"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    opacity={Math.min(0.85, cryIntensity * 1.4)}
                  />
                )}

                {/* 60fps Animated Upper & Lower Eyelid Curtains (blinking, flinching, squinting, dazed droop) */}
                <path
                  ref={leftUpperLidCurtainRef}
                  d="M94,126 L136,126 L136,150 Q116,135 94,149 Z"
                  fill="url(#eyelid-skin-grad)"
                />
                <path
                  ref={leftLowerLidCurtainRef}
                  d="M94,168 L136,168 L136,150 Q116,161 94,149 Z"
                  fill="url(#eyelid-skin-grad)"
                />
              </g>

              {/* Upper eyelid crease & lash line */}
              <path ref={leftLidCreaseRef} d="M97,140 Q116,129 133,142" fill="none" stroke="#241008" strokeWidth="1.4" opacity="0.55" />
              <path
                ref={leftUpperLashRef}
                d="M96,149 Q116,135 134,150"
                fill="none"
                stroke="#110906"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Right Eye */}
          {mood === 'ko' ? (
            <g>
              <path d="M186,149 Q204,156 223,149" fill="none" stroke="#1c0d08" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M192,152 L190,156 M202,154 L201,158 M212,154 L213,158" stroke="#180a05" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
            </g>
          ) : trauma.rightEyeRuptured || (trauma.eyeRuptured && !trauma.leftEyeRuptured) ? (
            <g>
              <ellipse cx="204" cy="148" rx="18" ry="12" fill="#2a0404" stroke="#1c0d08" strokeWidth="2.2" />
              <ellipse cx="204" cy="148" rx="14" ry="9" fill="#991b1b" />
              <circle cx="204" cy="148" r="6.8" fill="#cbd5e1" opacity="0.88" />
              <circle cx="204" cy="148" r="4.2" fill="#475569" opacity="0.7" />
              <path d="M192,146 L201,149 M215,144 L208,148" stroke="#dc2626" strokeWidth="1.8" />
              <path d="M196,158 Q194,178 192,196 Q192,178 194,158 Z" fill="#6b0a0e" opacity="0.62" style={{ mixBlendMode: 'multiply' }} />
            </g>
          ) : trauma.rightEyeSwollen ? (
            <g>
              {/* Edematous swollen-shut right eyelid & bruised ridge */}
              <path
                d="M181,149 Q204,134 227,149 Q204,163 181,149 Z"
                fill={enemy.skinShadow}
                stroke="#2b120c"
                strokeWidth="1.2"
              />
              <ellipse cx="204" cy="149" rx="22" ry="12" fill="url(#periorbital-grad)" opacity="0.72" filter="url(#soft-blur)" />
              <path d="M189,144 Q204,138 220,143" fill="none" stroke="#fff7ed" strokeWidth="2.4" opacity="0.22" strokeLinecap="round" filter="url(#soft-blur)" />
              <path d="M185,151 Q204,146 224,150" fill="none" stroke="#180806" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M188,152 L186,157 M222,151 L225,158" stroke="#991b1b" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          ) : enemy.hasCyberEye ? (
            <g>
              {enemy.bossId === 't800' ? (
                <>
                  {/* T-800 Recessed Dark Chrome Orbital Socket + Glowing Red Laser Optic */}
                  <path
                    d="M181,148 Q204,130 227,148 Q204,167 181,148 Z"
                    fill="#09090b"
                    stroke="#334155"
                    strokeWidth="2.4"
                  />
                  <ellipse cx="204" cy="148" rx="14" ry="10.5" fill="#18181b" stroke="#64748b" strokeWidth="1.3" />
                  {trauma.isBlind ? (
                    <>
                      <circle cx="204" cy="148" r="5.5" fill="#450a0a" opacity="0.7" />
                      <path d="M193,141 L215,155 M214,140 L195,156" stroke="#cbd5e1" strokeWidth="1.4" opacity="0.75" />
                    </>
                  ) : (
                    <g ref={cyberIrisGroupRef}>
                      <circle cx="204" cy="148" r="11" fill="url(#t800-optic-glow)" />
                      <circle cx="204" cy="148" r="5.2" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
                      <circle cx="204" cy="148" r="2.1" fill="#ffffff" />
                      <circle cx="200.5" cy="144.5" r="1.4" fill="#ffffff" opacity="0.82" />
                    </g>
                  )}
                </>
              ) : (
                <>
                  <circle cx="204" cy="148" r="16" fill="url(#metal-grad)" stroke="#0f172a" strokeWidth="2.2" />
                  <circle cx="204" cy="148" r="11" fill="#09090b" />
                  {trauma.isBlind ? (
                    <>
                      <circle cx="204" cy="148" r="5.5" fill="#450a0a" opacity="0.7" />
                      <path d="M193,141 L215,155 M214,140 L195,156" stroke="#cbd5e1" strokeWidth="1.4" opacity="0.75" />
                    </>
                  ) : (
                    <g ref={cyberIrisGroupRef}>
                      <circle cx="204" cy="148" r="6.2" fill="#ef4444" />
                      <circle cx="204" cy="148" r="2.2" fill="#fecaca" />
                      <circle cx="199" cy="143" r="1.8" fill="#ffffff" opacity="0.65" />
                    </g>
                  )}
                </>
              )}
            </g>
          ) : (
            <g>
              <path
                ref={rightEyeOutlineRef}
                d="M187,150 Q204,135 223,149 Q204,161 187,150 Z"
                fill="url(#sclera-grad)"
                stroke="#2b160f"
                strokeWidth="1.4"
              />
              {/* Inner tear duct caruncle */}
              <ellipse cx="189.5" cy="150" rx="2.6" ry="2" fill="#e1837d" opacity="0.82" />

              {(damageStage >= 1 || trauma.isBlind || trauma.rightEyeDamage >= 45 || isCrying) && (
                <g opacity={Math.min(0.95, 0.45 + damageStage * 0.18 + (trauma.rightEyeDamage >= 45 ? 0.22 : 0))}>
                  <path d="M190,149 L198,147 M212,150 L220,147 M192,145 L197,146 M213,154 L218,152" stroke="#dc2626" strokeWidth="1.15" fill="none" />
                  {(damageStage >= 2 || trauma.rightEyeDamage >= 70) && (
                    <path d="M188,151 L194,149 L199,152 M211,146 L216,149 L221,146" stroke="#991b1b" strokeWidth="0.9" fill="none" />
                  )}
                  {damageStage >= 3 && (
                    <ellipse cx="215" cy="150" rx="3.4" ry="2.2" fill="#dc2626" opacity="0.45" />
                  )}
                </g>
              )}

              <g clipPath="url(#right-eye-clip)">
                {trauma.isBlind ? (
                  <g ref={rightIrisGroupRef}>
                    {/* Blind milky-cataract unfocused stare */}
                    <circle cx="204.6" cy="146.5" r="7.4" fill="url(#iris-blind-grad)" />
                    <circle cx="204.6" cy="146.5" r="3.6" fill="#94a3b8" opacity="0.85" />
                    <ellipse cx="204.6" cy="146.5" rx="6.2" ry="5.5" fill="#e2e8f0" opacity="0.32" />
                  </g>
                ) : (
                  <g ref={rightIrisGroupRef}>
                    <circle cx="204" cy="148" r={mood === 'crying' ? 6.4 : 7.4} fill="url(#iris-grad)" />
                    <circle
                      ref={rightPupilRef}
                      cx="204"
                      cy="148"
                      r={mood === 'crying' ? 2.6 : 3.4}
                      fill="#090605"
                      opacity={enemy.bossId === 'geralt' ? 0 : 1}
                    />
                    {enemy.bossId === 'geralt' && (
                      <ellipse cx="204" cy="148" rx="1.25" ry="5.5" fill="#090605" />
                    )}
                    <circle cx="201.6" cy="145.6" r="1.7" fill="#ffffff" opacity="0.95" />
                    <circle cx="206.2" cy="150.2" r="0.7" fill="#ffffff" opacity="0.65" />
                  </g>
                )}
                <rect x="182" y="133" width="44" height="14" fill="url(#eyelid-shadow)" />

                <path
                  ref={rightPoolRef}
                  d="M186,153 Q204,158 222,153 L222,166 L186,166 Z"
                  fill="url(#tear-pool-grad)"
                  style={{ opacity: 0, transformOrigin: '204px 160px' }}
                />
                {isEyesWatering && (
                  <path
                    d="M191,155 Q204,159 217,155"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    opacity={Math.min(0.85, cryIntensity * 1.4)}
                  />
                )}

                <path
                  ref={rightUpperLidCurtainRef}
                  d="M184,126 L226,126 L226,149 Q204,135 184,150 Z"
                  fill="url(#eyelid-skin-grad)"
                />
                <path
                  ref={rightLowerLidCurtainRef}
                  d="M184,168 L226,168 L226,149 Q204,161 184,150 Z"
                  fill="url(#eyelid-skin-grad)"
                />
              </g>

              <path ref={rightLidCreaseRef} d="M187,142 Q204,129 223,140" fill="none" stroke="#241008" strokeWidth="1.4" opacity="0.55" />
              <path
                ref={rightUpperLashRef}
                d="M186,150 Q204,135 224,149"
                fill="none"
                stroke="#110906"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </g>
          )}
          {/* Non-Boss Eyewear, Tactical Visors, Monocles & Eyepatches (with progressive impact damage) */}
          {!enemy.bossId && enemy.faceAccessory === 'eyepatch_l' && (
            <g className="pointer-events-none">
              <path d="M74,122 L116,144 L148,110" stroke="#09090b" strokeWidth="3.4" fill="none" strokeLinecap="round" />
              <path d="M96,138 Q116,130 135,139 Q136,162 116,164 Q96,162 96,138 Z" fill="#18181b" stroke="#09090b" strokeWidth="1.8" />
              <path d="M104,142 Q116,138 127,142" stroke="#52525b" strokeWidth="1" opacity="0.45" fill="none" />
            </g>
          )}
          {!enemy.bossId && enemy.faceAccessory === 'eyepatch_r' && (
            <g className="pointer-events-none">
              <path d="M246,122 L204,144 L172,110" stroke="#09090b" strokeWidth="3.4" fill="none" strokeLinecap="round" />
              <path d="M185,139 Q204,130 224,138 Q224,162 204,164 Q184,162 185,139 Z" fill="#18181b" stroke="#09090b" strokeWidth="1.8" />
              <path d="M193,142 Q204,138 216,142" stroke="#52525b" strokeWidth="1" opacity="0.45" fill="none" />
            </g>
          )}
          {!enemy.bossId && enemy.faceAccessory === 'sunglasses' && (
            <g className="pointer-events-none" transform={damageStage >= 2 ? 'rotate(-5 160 148)' : undefined}>
              <path d="M76,138 L92,140 M244,138 L228,140 M139,144 Q160,139 181,144" stroke="#09090b" strokeWidth="3.2" fill="none" strokeLinecap="round" />
              <rect x="88" y="133" width="54" height="31" rx="8" fill="#09090b" fillOpacity={damageStage >= 2 ? '0.68' : '0.88'} stroke="#27272a" strokeWidth="2.2" />
              <rect x="178" y="133" width="54" height="31" rx="8" fill="#09090b" fillOpacity={damageStage >= 3 ? '0.52' : '0.88'} stroke="#27272a" strokeWidth="2.2" />
              <path d="M96,139 L108,139 L94,154 Z" fill="#ffffff" opacity="0.22" />
              <path d="M186,139 L198,139 L184,154 Z" fill="#ffffff" opacity="0.22" />
              {damageStage >= 1 && (
                <path d="M114,135 L121,148 L112,160 M121,148 L134,152" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.72" fill="none" />
              )}
              {damageStage >= 2 && (
                <path d="M196,134 L204,149 L218,143 M204,149 L198,162" stroke="#e2e8f0" strokeWidth="1.35" opacity="0.82" fill="none" />
              )}
            </g>
          )}
          {!enemy.bossId && enemy.faceAccessory === 'visor' && (
            <g className="pointer-events-none" transform={damageStage >= 2 ? 'rotate(3 160 144)' : undefined}>
              <path
                d="M78,133 L242,133 L234,162 L176,162 L160,152 L144,162 L86,162 Z"
                fill="#082f49"
                fillOpacity="0.8"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <path d="M92,140 L228,140" stroke="#7dd3fc" strokeWidth="2" opacity="0.55" strokeLinecap="round" />
              {damageStage >= 1 && (
                <path d="M192,135 L200,147 L214,155 M200,147 L186,158" stroke="#bae6fd" strokeWidth="1.3" opacity="0.82" fill="none" />
              )}
            </g>
          )}
          {!enemy.bossId && enemy.faceAccessory === 'monocle' && (
            <g className="pointer-events-none">
              <circle cx="204" cy="148" r="17" fill="#e0f2fe" fillOpacity="0.16" stroke="#eab308" strokeWidth="2.4" />
              <path d="M194,137 L200,137 L191,149 Z" fill="#ffffff" opacity="0.28" />
              <path d="M220,154 Q228,194 222,258" stroke="#ca8a04" strokeWidth="1.3" strokeDasharray="2,2" fill="none" opacity="0.75" />
              {damageStage >= 2 && (
                <path d="M194,138 L207,150 L215,159" stroke="#f8fafc" strokeWidth="1.1" opacity="0.8" fill="none" />
              )}
            </g>
          )}
          {!enemy.bossId && enemy.faceAccessory === 'goggles' && (
            <g className="pointer-events-none">
              <path d="M72,142 L86,144 M248,142 L234,144" stroke="#451a03" strokeWidth="6" fill="none" />
              <path d="M138,147 L182,147" stroke="#78350f" strokeWidth="4.2" />
              <circle cx="114" cy="147" r="21" fill="#0f172a" fillOpacity="0.45" stroke="#b45309" strokeWidth="3.8" />
              <circle cx="206" cy="147" r="21" fill="#0f172a" fillOpacity="0.45" stroke="#b45309" strokeWidth="3.8" />
              <circle cx="114" cy="147" r="16" fill="#38bdf8" fillOpacity="0.18" />
              <circle cx="206" cy="147" r="16" fill="#38bdf8" fillOpacity="0.18" />
              {damageStage >= 2 && (
                <path d="M104,137 L116,149 L126,145" stroke="#e2e8f0" strokeWidth="1.3" opacity="0.78" fill="none" />
              )}
            </g>
          )}
            </>
          )}
        </g>
        </g>

        {/* Sculpted Volumetric Nose (positioned below giant eye for Cyclops) */}
        <g ref={noseParallaxRef}>
        <g style={noseDeformStyle}>
        <g transform={trauma.noseBroken ? 'translate(3, 1) rotate(11 160 180)' : undefined}>
          {enemy.species === 'cyclops' ? (
            <>
              {/* Broad Ogre Snout below Single Central Eye */}
              <path
                d="M150,166 L141,187 Q133,195 138,202 Q149,209 160,209 Q171,209 182,202 Q187,195 179,187 L170,166 Z"
                fill="url(#nose-bridge-grad)"
              />
              <path
                d="M141,187 Q134,196 140,203 Q150,208 160,208 Q170,208 180,203 Q186,196 179,187"
                fill="none"
                stroke="#1c0d08"
                strokeOpacity="0.52"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <ellipse cx="160" cy="204" rx="18" ry="5" fill="#180a05" opacity="0.34" />
              <path d="M159.5,171 L159,190" stroke="#fff7ed" strokeWidth="2.4" opacity="0.2" strokeLinecap="round" />
              <ellipse cx="160" cy="195" rx="6" ry="3.4" fill="#fff7ed" opacity="0.16" />
              {trauma.noseBroken && (
                <g>
                  <ellipse cx="160" cy="182" rx="11" ry="6" fill="url(#bruise-core-grad)" opacity="0.65" filter="url(#bruise-organic)" style={{ mixBlendMode: 'multiply' }} />
                  <path d="M153,178 Q160,180 167,183" stroke="#5c080a" strokeWidth="1.2" opacity="0.72" strokeLinecap="round" fill="none" />
                </g>
              )}
              <ellipse ref={leftNostrilRef} cx="148.5" cy="200.5" rx="5.2" ry="2.8" transform="rotate(-16 148.5 200.5)" fill="#140604" />
              <ellipse ref={rightNostrilRef} cx="171.5" cy="200.5" rx="5.2" ry="2.8" transform="rotate(16 171.5 200.5)" fill="#140604" />
            </>
          ) : (
            <g
              transform={
                enemy.miniBossId === 'casimiro' || enemy.miniBossId === 'luccas_neto' || enemy.miniBossId === 'davy_jones'
                  ? 'translate(160, 178) scale(1.12, 1.0) translate(-160, -178)'
                  : enemy.miniBossId === 'cellbit'
                    ? 'translate(160, 178) scale(0.9, 1.02) translate(-160, -178)'
                    : undefined
              }
            >
              {/* Nasal bridge & lateral planes */}
              <path
                d={
                  wince
                    ? 'M154,144 L149,184 Q143,191 146,197 Q154,203 160,204 Q166,203 174,197 Q177,191 171,184 L166,144 Z'
                    : 'M154,144 L148,185 Q142,192 145,198 Q154,205 160,205 Q166,205 175,198 Q178,192 172,185 L166,144 Z'
                }
                fill="url(#nose-bridge-grad)"
              />
              {/* Subtle alar wing & tip contour lines */}
              <path
                d="M148,186 Q142,193 147,199 Q154,203 160,204 Q166,203 173,199 Q178,193 172,186"
                fill="none"
                stroke={isBlueSkin ? '#082f49' : '#1c0d08'}
                strokeOpacity="0.48"
                strokeWidth="1.45"
                strokeLinecap="round"
              />
              {/* Recessed nasal under-shadow */}
              <ellipse cx="160" cy="199" rx="13" ry="4.5" fill={isBlueSkin ? '#082f49' : '#180a05'} opacity="0.32" />
              {/* Specular nasal dorsum & tip highlight */}
              <path d="M159.5,152 L159,184" stroke={isBlueSkin ? '#bae6fd' : '#fff7ed'} strokeWidth="2.2" opacity={isBlueSkin ? '0.26' : '0.22'} strokeLinecap="round" />
              <ellipse cx="160" cy="190" rx="4.2" ry="3" fill={isBlueSkin ? '#bae6fd' : '#fff7ed'} opacity={isBlueSkin ? '0.22' : '0.18'} />

              {trauma.noseBroken && (
                <g>
                  <ellipse cx="160" cy="172" rx="9.5" ry="5.5" fill="url(#bruise-core-grad)" opacity="0.65" filter="url(#bruise-organic)" style={{ mixBlendMode: 'multiply' }} />
                  <path d="M154,169 Q160,171 166,174" stroke="#5c080a" strokeWidth="1.15" opacity="0.72" strokeLinecap="round" fill="none" />
                </g>
              )}
              {/* Anatomical curved nostrils */}
              <ellipse ref={leftNostrilRef} cx="152.2" cy="196.5" rx="3.8" ry="2.1" transform="rotate(-14 152.2 196.5)" fill={isBlueSkin ? '#061f33' : '#160705'} />
              <ellipse ref={rightNostrilRef} cx="167.8" cy="196.5" rx="3.8" ry="2.1" transform="rotate(14 167.8 196.5)" fill={isBlueSkin ? '#061f33' : '#160705'} />
            </g>
          )}
        </g>
        </g>
        </g>

        {/* Realistic Lips, Oral Cavity & Sculpted Anatomical Teeth (60fps Fluid Morphing) */}
        <g ref={mouthParallaxRef}>
        <g style={mouthDeformStyle}>
        <g transform={trauma.jawFractured ? 'translate(4, 4) rotate(8 160 245)' : undefined}>
          <g>
            {/* Vermilion upper lip Cupid's bow */}
            <path
              ref={upperLipPathRef}
              d="M128,242 Q148,236 160,239 Q176,236 198,232 Q188,244 160,246 Q138,246 128,242 Z"
              fill="url(#lip-upper-grad)"
              opacity="0.88"
            />
            {/* Oral Cavity */}
            <path
              ref={mouthCavityPathRef}
              d={mouthCavityPath}
              fill="#1b0305"
              stroke="#1c0d08"
              strokeWidth="1.35"
            />
            {renderDentalArch(true)}
            {/* Limp KO tongue smoothly fading in on knockout */}
            <g ref={koTongueRef} style={{ opacity: 0 }}>
              <path d="M148,254 Q162,274 174,254 Q161,260 148,254 Z" fill="#7f1d2e" stroke="#450712" strokeWidth="1.1" />
              <path d="M160,256 Q160,263 161,268" stroke="#450712" strokeWidth="1.1" opacity="0.58" strokeLinecap="round" fill="none" />
            </g>
            {/* Lower lip vermilion rim with soft wet sheen */}
            <path
              ref={lowerLipPathRef}
              d="M134,251 Q160,260 190,246 Q162,254 134,251 Z"
              fill="url(#lip-lower-grad)"
              opacity="0.86"
            />
            <ellipse ref={lowerLipSheenRef} cx="160" cy="255" rx="13.5" ry="1.7" fill={isBlueSkin ? '#bae6fd' : '#fff7ed'} opacity={isBlueSkin ? '0.2' : '0.16'} />
            {enemy.bossId === 'joker' && (
              <g className="pointer-events-none">
                <path
                  d="M113,226 Q98,217 85,201 M207,226 Q222,217 235,201"
                  fill="none"
                  stroke="#991b1b"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  opacity="0.48"
                />
                <path
                  d="M113,226 Q98,217 85,201 M207,226 Q222,217 235,201"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  opacity="0.86"
                />
              </g>
            )}
          </g>

          {/* Lower Ogre / Cyclops Protruding Tusks */}
          {enemy.species === 'cyclops' && (
            <g>
              {trauma.teethRemaining >= 4 && (
                <path
                  d="M131,256 L136,232 Q140,242 143,257 Z"
                  fill="url(#tooth-enamel-lower)"
                  stroke="#3b1214"
                  strokeWidth="1.1"
                />
              )}
              {trauma.teethRemaining >= 2 && (
                <path
                  d="M189,256 L184,232 Q180,242 177,257 Z"
                  fill="url(#tooth-enamel-lower)"
                  stroke="#3b1214"
                  strokeWidth="1.1"
                />
              )}
            </g>
          )}

          {/* Realistic Tapered Split Lower Lip & Frothy Blood-Saliva Foam */}
          {trauma.lipTorn && (
            <g>
              <ellipse cx="154" cy="259" rx="10" ry="5.5" fill="#6b0a0e" opacity="0.34" filter="url(#soft-blur)" style={{ mixBlendMode: 'multiply' }} />
              <path
                d="M150,255 Q154,265 158,256 Q154,260 150,255 Z"
                fill="#3b0406"
                stroke="#7f1d1d"
                strokeOpacity="0.75"
                strokeWidth="0.8"
              />
              <path
                d="M154,263 Q153.5,274 155,284 Q156,274 155.5,263 Z"
                fill="#5e090c"
                opacity="0.58"
                style={{ mixBlendMode: 'multiply' }}
              />
              <circle cx="127" cy="249" r="1.9" fill="#fecaca" opacity="0.56" />
              <circle cx="131" cy="253" r="1.3" fill="#fca5a5" opacity="0.52" />
              <circle cx="192" cy="249" r="1.7" fill="#fecaca" opacity="0.56" />
            </g>
          )}

          {/* Subtle realistic lip-seam & corner blood stain when teeth are broken */}
          {(trauma.teethRemaining < 6 || trauma.lipTorn) && (
            <g className="pointer-events-none">
              <path
                d="M144,254 Q160,260 176,254 Q173,261 160,262 Q147,261 144,254 Z"
                fill="#4a0808"
                opacity={
                  trauma.teethRemaining < 6
                    ? Math.min(0.55, 0.24 + (6 - trauma.teethRemaining) * 0.055)
                    : 0.26
                }
                style={{ mixBlendMode: 'multiply' }}
              />
              <path
                d="M167,255 Q170,264 168.5,274"
                fill="none"
                stroke="#5e090c"
                strokeWidth="1.15"
                opacity={trauma.teethRemaining < 6 ? 0.62 : 0.35}
                strokeLinecap="round"
              />
            </g>
          )}

          {(mood === 'dazed' || damageStage >= 3) && (
            <path d="M132,256 Q128,276 131,290" stroke="#fca5a5" strokeWidth="1.7" strokeLinecap="round" opacity="0.58" />
          )}
        </g>
        </g>
        </g>

        {/* Sculpted Foreground Boss Hair Locks + Separated Tapered Hair Strands with 60fps Spring-Damper Physics */}
        <g ref={hairParallaxRef} className="pointer-events-none">
          <g ref={sculptedHairGroupRef}>
            <BossSculptedHair enemy={enemy} />
            {enemy.hairStyle === 'afro' && (
              <path
                d="M52,126 C40,60 88,16 160,16 C232,16 280,60 268,126 C260,92 228,58 160,56 C92,58 60,92 52,126 Z"
                fill={enemy.hairColor}
                opacity="0.95"
              />
            )}
          </g>
          {hairStrands.map((strand, i) => {
            const tx = strand.rx + strand.dx;
            const ty = strand.ry + strand.dy;
            const len = Math.hypot(strand.dx, strand.dy) || 1;
            const cx = strand.rx + strand.dx * 0.5 + (-strand.dy / len) * strand.curve;
            const cy = strand.ry + strand.dy * 0.5 + (strand.dx / len) * strand.curve;
            const initialD = buildTaperedHairPath(
              strand.rx,
              strand.ry,
              cx,
              cy,
              tx,
              ty,
              strand.halfWidth
            );
            const fillColor =
              strand.shade === 'shadow'
                ? enemy.bossId === 'trevor_gta5'
                  ? '#120b07'
                  : '#090605'
                : strand.shade === 'highlight'
                  ? enemy.bossId === 'trevor_gta5'
                    ? '#5e4736'
                    : enemy.bossId === 'wolverine'
                      ? '#524b47'
                      : enemy.bossId === 'arthur_morgan'
                        ? '#a6774c'
                        : '#fff7ed'
                  : enemy.hairColor;

            return (
              <path
                key={`${enemy.hairStyle}-strand-${i}`}
                ref={(el) => {
                  hairStrandRefs.current[i] = el;
                }}
                d={initialD}
                fill={fillColor}
                opacity={strand.opacity}
              />
            );
          })}
        </g>

        <BossTopAccessories enemy={enemy} mood={mood} damageStage={damageStage} trauma={trauma} />

        {/* Real-Time Gravity-Driven Blood Rivulets & Deep Trauma Trails (60fps RAF) */}
        <g clipPath="url(#face-neck-chest-clip)" className="pointer-events-none">
          <g ref={bloodRivuletsParallaxRef}>
          {Array.from({ length: MAX_BLOOD_RIVULETS }).map((_, i) => (
            <React.Fragment key={`blood-rivulet-${i}`}>
              {/* Deep skin-soaked crimson/coagulated channel (scales darker & wider with trauma severity) */}
              <path
                ref={(el) => {
                  rivuletStainRefs.current[i] = el;
                }}
                d=""
                fill="none"
                stroke="#450a0a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0, mixBlendMode: 'multiply' }}
              />
              {/* Primary viscous blood stream */}
              <path
                ref={(el) => {
                  rivuletCoreRefs.current[i] = el;
                }}
                d=""
                fill="none"
                stroke="#991b1b"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0 }}
              />
              {/* Wet liquid specular highlight */}
              <path
                ref={(el) => {
                  rivuletShineRefs.current[i] = el;
                }}
                d=""
                fill="none"
                stroke="#fca5a5"
                strokeWidth="0.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="translate(-0.45, 0)"
                style={{ opacity: 0 }}
              />
              {/* Gravity-pulled advancing micro-meniscus droplet bead */}
              <g
                ref={(el) => {
                  rivuletBeadRefs.current[i] = el;
                }}
                style={{ opacity: 0 }}
              >
                <ellipse
                  cx="0"
                  cy="0"
                  rx="1.05"
                  ry="1.45"
                  fill="#5c0608"
                  stroke="#280203"
                  strokeWidth="0.3"
                />
                <circle cx="-0.3" cy="-0.25" r="0.32" fill="#fecaca" opacity="0.42" />
              </g>
            </React.Fragment>
          ))}
          </g>
        </g>
        </g>
        </g>
        </g>

        {/* Detailed Anatomical Defensive Guard: Forearms, Wrapped Wrists, Knuckles & Curled Fingers */}
        {isBlocking && !isKo && !isStunned && (
          <g className="pointer-events-none">
            {/* 3D Cast Shadow onto Face beneath Raised Guard */}
            <path
              d="M32,422 L122,226 L160,248 L198,226 L288,422 Z"
              fill="#090504"
              opacity="0.46"
              filter="url(#soft-blur)"
            />

            {/* LEFT FOREARM (behind right forearm in cross-guard) */}
            <g>
              <path
                d="M12,424 C36,354 78,272 121,214 C131,208 145,214 148,226 C116,288 86,358 64,424 Z"
                fill="url(#forearm-skin-l)"
                filter="url(#skin-grit)"
                stroke="#1c0d08"
                strokeOpacity="0.82"
                strokeWidth="1.6"
              />
              {/* Forearm brachioradialis muscle ridge & tensed vein */}
              <path
                d="M38,402 Q74,316 119,232"
                fill="none"
                stroke="#fff7ed"
                strokeWidth="3.2"
                opacity="0.11"
                strokeLinecap="round"
                filter="url(#soft-blur)"
              />
              <path
                d="M52,396 Q78,336 98,292 Q110,270 122,254"
                fill="none"
                stroke="#1e293b"
                strokeWidth="1.6"
                opacity="0.34"
                strokeLinecap="round"
              />
              {damageStage >= 2 && (
                <ellipse cx="95" cy="285" rx="14" ry="8" transform="rotate(-48 95 285)" fill="url(#bruise-core-grad)" filter="url(#bruise-organic)" />
              )}

              {/* Layered Cloth Wrist Wrap (Left) */}
              <g>
                <path
                  d="M111,227 L133,198 L155,215 L133,245 Z"
                  fill="url(#hand-wrap-grad)"
                  stroke="#18181b"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                {/* Overlapping wrap fold seams */}
                <path d="M116,221 L138,238 M122,213 L144,230 M128,205 L150,222" stroke="#52525b" strokeWidth="1.3" opacity="0.72" />
                <path d="M117,223 L139,240 M123,215 L145,232" stroke="#ffffff" strokeWidth="0.9" opacity="0.45" />
                {damageStage >= 1 && (
                  <path d="M128,215 Q138,220 134,230" stroke="#991b1b" strokeWidth="3.5" opacity="0.6" strokeLinecap="round" fill="none" />
                )}
              </g>

              {/* Detailed Left Clenched Fist (4 knuckles, curled fingers, tucked thumb) */}
              <g transform="translate(141, 198) rotate(-26)">
                {/* Back of hand / Metacarpals */}
                <path
                  d="M-16,14 C-18,-2 -12,-14 0,-15 L16,-14 C23,-12 26,-2 24,12 C21,21 6,24 -10,20 Z"
                  fill={enemy.skinShadow}
                  stroke="#1c0d08"
                  strokeWidth="1.5"
                />
                {/* 4 Curled Fingers (Pinky -> Index) */}
                <g stroke="#1c0d08" strokeWidth="1.25">
                  <rect x="-15" y="-16" width="9.5" height="19" rx="4.2" fill={enemy.skinShadow} />
                  <rect x="-5.5" y="-18" width="10" height="21" rx="4.4" fill={enemy.skinColor} />
                  <rect x="4.5" y="-18.5" width="10.2" height="21.5" rx="4.5" fill={enemy.skinColor} />
                  <rect x="14.5" y="-16.5" width="9.5" height="19.5" rx="4.2" fill={enemy.skinShadow} />
                </g>
                {/* Proximal Interphalangeal (PIP) Finger Creases & Knuckle Highlights */}
                <path d="M-13,-7 L-8,-7 M-3,-8 L2,-8 M7,-8 L12,-8 M17,-7 L21,-7" stroke="#2a1109" strokeWidth="1.2" opacity="0.55" strokeLinecap="round" />
                <ellipse cx="-10.5" cy="-12" rx="2.8" ry="1.6" fill="#fff7ed" opacity="0.22" />
                <ellipse cx="-0.5" cy="-14" rx="3.1" ry="1.8" fill="#fff7ed" opacity="0.28" />
                <ellipse cx="9.5" cy="-14" rx="3.1" ry="1.8" fill="#fff7ed" opacity="0.28" />
                <ellipse cx="19" cy="-12" rx="2.6" ry="1.5" fill="#fff7ed" opacity="0.2" />
                {/* Tucked Thumb & Thenar Palm Pad */}
                <path
                  d="M15,4 C23,2 27,8 22,16 C16,22 3,20 -4,15 C-7,12 -3,6 4,6 Z"
                  fill={enemy.skinColor}
                  stroke="#1c0d08"
                  strokeWidth="1.35"
                />
                {/* Thumb knuckle crease & nail hint */}
                <path d="M8,9 Q12,13 10,17" fill="none" stroke="#241008" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
                <path d="M-2,11 Q0,13 -2,15" fill="none" stroke="#e7d5c9" strokeWidth="1.4" opacity="0.45" strokeLinecap="round" />
                {damageStage >= 2 && (
                  <circle cx="5" cy="-13" r="3.2" fill="#7f1d1d" opacity="0.55" />
                )}
              </g>
            </g>

            {/* RIGHT FOREARM & FIST (Foreground in Cross-Guard) */}
            <g>
              <path
                d="M308,424 C284,354 242,272 199,214 C189,208 175,214 172,226 C204,288 234,358 256,424 Z"
                fill="url(#forearm-skin-r)"
                filter="url(#skin-grit)"
                stroke="#1c0d08"
                strokeOpacity="0.82"
                strokeWidth="1.6"
              />
              {/* Forearm muscle highlight & subtle vein */}
              <path
                d="M282,402 Q246,316 201,232"
                fill="none"
                stroke="#fff7ed"
                strokeWidth="3.4"
                opacity="0.14"
                strokeLinecap="round"
                filter="url(#soft-blur)"
              />
              <path
                d="M268,396 Q242,336 222,292 Q210,270 198,252"
                fill="none"
                stroke="#1e293b"
                strokeWidth="1.6"
                opacity="0.32"
                strokeLinecap="round"
              />
              {damageStage >= 1 && (
                <ellipse cx="226" cy="288" rx="15" ry="9" transform="rotate(46 226 288)" fill="url(#bruise-halo-grad)" filter="url(#bruise-organic)" />
              )}

              {/* Layered Cloth Wrist Wrap (Right) */}
              <g>
                <path
                  d="M209,227 L187,198 L165,215 L187,245 Z"
                  fill="url(#hand-wrap-grad)"
                  stroke="#18181b"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <path d="M204,221 L182,238 M198,213 L176,230 M192,205 L170,222" stroke="#52525b" strokeWidth="1.3" opacity="0.72" />
                <path d="M203,223 L181,240 M197,215 L175,232" stroke="#ffffff" strokeWidth="0.9" opacity="0.48" />
                {damageStage >= 2 && (
                  <path d="M188,214 Q179,222 184,231" stroke="#991b1b" strokeWidth="3.2" opacity="0.65" strokeLinecap="round" fill="none" />
                )}
              </g>

              {/* Detailed Right Clenched Fist (Mirrored anatomy) */}
              <g transform="translate(179, 198) rotate(26)">
                <path
                  d="M16,14 C18,-2 12,-14 0,-15 L-16,-14 C-23,-12 -26,-2 -24,12 C-21,21 -6,24 10,20 Z"
                  fill={enemy.skinColor}
                  stroke="#1c0d08"
                  strokeWidth="1.5"
                />
                {/* 4 Curled Fingers */}
                <g stroke="#1c0d08" strokeWidth="1.25">
                  <rect x="5.5" y="-16" width="9.5" height="19" rx="4.2" fill={enemy.skinShadow} />
                  <rect x="-4.5" y="-18" width="10" height="21" rx="4.4" fill={enemy.skinColor} />
                  <rect x="-14.7" y="-18.5" width="10.2" height="21.5" rx="4.5" fill={enemy.skinColor} />
                  <rect x="-24" y="-16.5" width="9.5" height="19.5" rx="4.2" fill={enemy.skinShadow} />
                </g>
                {/* Knuckle Creases & Highlights */}
                <path d="M13,-7 L8,-7 M3,-8 L-2,-8 M-7,-8 L-12,-8 M-17,-7 L-21,-7" stroke="#2a1109" strokeWidth="1.2" opacity="0.55" strokeLinecap="round" />
                <ellipse cx="10.5" cy="-12" rx="2.8" ry="1.6" fill="#fff7ed" opacity="0.22" />
                <ellipse cx="0.5" cy="-14" rx="3.1" ry="1.8" fill="#fff7ed" opacity="0.3" />
                <ellipse cx="-9.5" cy="-14" rx="3.1" ry="1.8" fill="#fff7ed" opacity="0.3" />
                <ellipse cx="-19" cy="-12" rx="2.6" ry="1.5" fill="#fff7ed" opacity="0.22" />
                {/* Tucked Thumb & Thenar Pad */}
                <path
                  d="M-15,4 C-23,2 -27,8 -22,16 C-16,22 -3,20 4,15 C7,12 3,6 -4,6 Z"
                  fill={enemy.skinColor}
                  stroke="#1c0d08"
                  strokeWidth="1.35"
                />
                <path d="M-8,9 Q-12,13 -10,17" fill="none" stroke="#241008" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
                <path d="M2,11 Q0,13 2,15" fill="none" stroke="#e7d5c9" strokeWidth="1.4" opacity="0.45" strokeLinecap="round" />
                {damageStage >= 1 && (
                  <circle cx="-5" cy="-13" r="3.4" fill="#7f1d1d" opacity="0.55" />
                )}
              </g>
            </g>
          </g>
        )}

        </g>

        {/* Brief X-Ray Cranial & Jaw Fracture Impact Flash */}
        {xrayFlash && (
          <g clipPath="url(#head-clip)" className="pointer-events-none">
            <rect x="60" y="24" width="200" height="300" fill="#09090b" opacity="0.9" />
            <ellipse
              cx="160"
              cy="118"
              rx="72"
              ry="62"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3.5"
              opacity="0.9"
            />
            {enemy.species === 'cyclops' ? (
              <ellipse cx="160" cy="142" rx="30" ry="20" fill="#09090b" stroke="#cbd5e1" strokeWidth="3.2" />
            ) : (
              <>
                <ellipse
                  cx="116"
                  cy="148"
                  rx="18"
                  ry="14"
                  fill="#09090b"
                  stroke="#cbd5e1"
                  strokeWidth="2.8"
                />
                <ellipse
                  cx="204"
                  cy="148"
                  rx="18"
                  ry="14"
                  fill="#09090b"
                  stroke="#cbd5e1"
                  strokeWidth="2.8"
                />
              </>
            )}
            <path
              d="M160,145 L151,192 L169,192 Z"
              fill="#09090b"
              stroke="#cbd5e1"
              strokeWidth="2.2"
            />
            <path
              d="M94,218 L112,282 Q160,308 208,282 L226,218"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M132,80 L152,92 L166,83 M148,266 L166,288 L158,305 M153,168 L168,176"
              stroke="#ef4444"
              strokeWidth="3.2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Strict Face & Ears Only Hitbox (shoulders, chest & neck cannot be struck) */}
        <g
          ref={hitboxPivotRef}
          role="button"
          tabIndex={0}
          aria-label={`Socar o rosto de ${enemy.name} (HP ${Math.ceil(hp)} de ${enemy.maxHp})`}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          className={isKo ? 'cursor-default focus:outline-none' : 'cursor-crosshair focus:outline-none'}
        >
          <path d={headOutlinePath} fill="transparent" />
          <path
            d={
              enemy.species === 'cyclops'
                ? 'M72,150 C50,136 33,134 29,144 C36,164 43,190 62,208 C70,210 75,200 74,190 Z'
                : 'M72,152 C56,148 48,162 50,178 C51,192 58,205 68,206 C73,206 75,198 74,190 Z'
            }
            fill="transparent"
          />
          <path
            d={
              enemy.species === 'cyclops'
                ? 'M248,150 C270,136 287,134 291,144 C284,164 277,190 258,208 C250,210 245,200 246,190 Z'
                : 'M248,152 C264,148 272,162 270,178 C269,192 262,205 252,206 C247,206 245,198 246,190 Z'
            }
            fill="transparent"
          />
        </g>

        {/* 60fps Flying Knocked-Out Teeth & Blood Droplet Spray (unclipped above head) */}
        <g className="pointer-events-none">
          {Array.from({ length: MAX_FLYING_TEETH }).map((_, i) => (
            <g
              key={`flying-tooth-${i}`}
              ref={(el) => {
                flyingToothGroupRefs.current[i] = el;
              }}
              style={{ opacity: 0 }}
            >
              {Array.from({ length: FLYING_TOOTH_DROPLETS }).map((__, dIdx) => (
                <circle
                  key={`ft-drop-${i}-${dIdx}`}
                  ref={(el) => {
                    if (!flyingToothDropRefs.current[i]) {
                      flyingToothDropRefs.current[i] = [];
                    }
                    flyingToothDropRefs.current[i][dIdx] = el;
                  }}
                  cx="160"
                  cy="240"
                  r={1.6 + (dIdx % 3) * 0.5}
                  fill={dIdx % 2 === 0 ? '#dc2626' : '#7f1d1d'}
                  style={{ opacity: 0 }}
                />
              ))}
              <g
                ref={(el) => {
                  flyingToothShapeRefs.current[i] = el;
                }}
              >
                {/* Standard Human / Titan / Neanderthal Tooth with Bloody Root */}
                <g
                  ref={(el) => {
                    flyingToothNormalRefs.current[i] = el;
                  }}
                >
                  <path
                    d="M-3.3,-0.8 L-2.6,-7.6 Q-1.2,-8.6 0,-3.8 Q1.2,-8.6 2.6,-7.6 L3.3,-0.8 Z"
                    fill="#991b1b"
                    stroke="#450a0a"
                    strokeWidth="0.55"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M-1.9,-5.2 L-1.6,-7.1 M1.9,-5.2 L1.6,-7.1"
                    stroke="#ef4444"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  <path
                    d="M-4.3,-1.2 Q-4.6,5.2 -2.3,6.6 Q0,7.2 2.3,6.6 Q4.6,5.2 4.3,-1.2 Q0,-2.4 -4.3,-1.2 Z"
                    fill="#fafaf9"
                    stroke="#3b1214"
                    strokeWidth="0.75"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M-3.5,-1.1 Q0,-2.0 3.5,-1.1"
                    stroke="#dc2626"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.9"
                  />
                  <path
                    d="M-2.2,0.8 L-2.0,4.8"
                    stroke="#ffffff"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </g>

                {/* Cyclops / Ogre Curved Tusk with Bloody Root */}
                <g
                  ref={(el) => {
                    flyingToothTuskRefs.current[i] = el;
                  }}
                  style={{ display: 'none' }}
                >
                  <path
                    d="M-4.4,3.5 L-3.8,9.8 Q-1.5,11.2 0,7.2 Q1.8,11 4.0,9.5 L4.6,3.2 Z"
                    fill="#991b1b"
                    stroke="#450a0a"
                    strokeWidth="0.6"
                  />
                  <path
                    d="M-4.8,3.6 Q-5.5,-4.5 -0.8,-11.8 Q2.8,-5.0 4.6,3.6 Q0,5.2 -4.8,3.6 Z"
                    fill="#f5f5dc"
                    stroke="#3b1214"
                    strokeWidth="0.85"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M-3.9,3.5 Q0,4.8 3.9,3.5"
                    stroke="#dc2626"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M-1.5,-7.5 Q-2.2,-2.2 -2.0,1.8"
                    stroke="#ffffff"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    opacity="0.75"
                  />
                </g>
              </g>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};
