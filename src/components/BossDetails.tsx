import React from 'react';
import { EnemyProfile, TraumaState } from '../data/gameData';

export interface EnemyAnatomyMetrics {
  earOffsetX: number;
  neckTopExpand: number;
  neckBotExpand: number;
  shoulderExpand: number;
  hasDoubleChin: boolean;
}

export function getEnemyAnatomyMetrics(enemy: EnemyProfile): EnemyAnatomyMetrics {
  switch (enemy.miniBossId) {
    case 'casimiro':
      return {
        earOffsetX: 9,
        neckTopExpand: 15,
        neckBotExpand: 14,
        shoulderExpand: 10,
        hasDoubleChin: true,
      };
    case 'luccas_neto':
      return {
        earOffsetX: 5,
        neckTopExpand: 8,
        neckBotExpand: 8,
        shoulderExpand: 5,
        hasDoubleChin: true,
      };
    case 'davy_jones':
      return {
        // 2015 "Velho Testamento" fuller build + double chin
        earOffsetX: 5,
        neckTopExpand: 9,
        neckBotExpand: 9,
        shoulderExpand: 6,
        hasDoubleChin: true,
      };
    case 'whindersson':
      return {
        earOffsetX: 3,
        neckTopExpand: 4,
        neckBotExpand: 4,
        shoulderExpand: 2,
        hasDoubleChin: false,
      };
    case 'smzinho':
      return {
        earOffsetX: 2,
        neckTopExpand: 5,
        neckBotExpand: 5,
        shoulderExpand: 4,
        hasDoubleChin: false,
      };
    case 'kleberiano':
    case 'alanzoka':
    case 'felipe_neto':
      return {
        earOffsetX: 0,
        neckTopExpand: 1,
        neckBotExpand: 1,
        shoulderExpand: 1,
        hasDoubleChin: false,
      };
    default:
      if (enemy.bossId === 'thanos') {
        return {
          earOffsetX: 6,
          neckTopExpand: 8,
          neckBotExpand: 8,
          shoulderExpand: 6,
          hasDoubleChin: false,
        };
      }
      return {
        earOffsetX: 0,
        neckTopExpand: 0,
        neckBotExpand: 0,
        shoulderExpand: 0,
        hasDoubleChin: false,
      };
  }
}

/**
 * Per-boss & per-YouTuber anatomical cranial, cheekbone, and jawline silhouette.
 * Non-boss regular enemies preserve the standard proportions.
 */
export function getHeadOutlinePath(enemy: EnemyProfile): string {
  switch (enemy.miniBossId) {
    case 'casimiro':
      // Unmistakably wide, round, chubby moon-faced build with full rounded jowls & heavy jaw
      return 'M60,136 C59,86 80,44 118,34 C132,30 146,30 160,30 C174,30 188,30 202,34 C240,44 261,86 260,136 C264,158 270,180 268,204 C266,232 256,262 238,284 C218,306 190,320 172,322 C164,323 156,323 148,322 C130,320 102,306 82,284 C64,262 54,232 52,204 C50,180 56,158 60,136 Z';
    case 'luccas_neto':
      // Fuller, chubby, round cheerful cheeks and soft broad jaw
      return 'M63,138 C62,90 82,48 118,38 C132,34 146,34 160,34 C174,34 188,34 202,38 C238,48 258,90 257,138 C259,158 263,178 261,199 C259,225 250,255 235,277 C217,299 190,314 173,318 C164,320 156,320 147,318 C130,314 103,299 85,277 C70,255 61,225 59,199 C57,178 61,158 63,138 Z';
    case 'davy_jones':
      // 2015 "Velho Testamento" noticeably plumper round cheeks & softer double-jaw fullness
      return 'M63,138 C62,90 82,48 118,37 C132,33 146,33 160,33 C174,33 188,33 202,37 C238,48 258,90 257,138 C259,158 263,178 261,200 C258,224 249,254 234,277 C216,299 190,314 173,318 C164,320 156,320 147,318 C130,314 104,299 86,277 C71,254 62,224 59,200 C57,178 61,158 63,138 Z';
    case 'whindersson':
      // Expressive wide-cheeked friendly face with solid rounded-square jaw
      return 'M67,138 C66,92 83,52 118,40 C132,35 146,35 160,35 C174,35 188,35 202,40 C237,52 254,92 253,138 C254,154 257,172 254,190 C251,212 244,242 229,268 C213,290 190,308 174,314 C164,317 156,317 146,314 C130,308 107,290 91,268 C76,242 69,212 66,190 C63,172 66,154 67,138 Z';
    case 'kleberiano':
      // Lean expressive streamer face with slightly taller forehead & tapered chin
      return 'M70,136 C69,90 86,48 120,36 C133,31 146,31 160,31 C174,31 187,31 200,36 C234,48 251,90 250,136 C250,152 252,167 248,184 C244,200 239,216 233,236 C226,258 216,277 201,294 C189,307 175,316 167,318 C162,319 158,319 153,318 C145,316 131,307 119,294 C104,277 94,258 87,236 C81,216 76,200 72,184 C68,167 70,152 70,136 Z';
    case 'alanzoka':
      // Balanced youthful rounded-oval gamer face with friendly cheeks
      return 'M69,138 C68,92 85,52 119,40 C132,35 146,34 160,34 C174,34 188,35 201,40 C235,52 252,92 251,138 C252,154 254,170 250,188 C246,208 240,234 226,259 C212,283 190,304 174,311 C165,315 155,315 146,311 C130,304 108,283 94,259 C80,234 74,208 70,188 C66,170 68,154 69,138 Z';
    case 'felipe_neto':
      // Sharp expressive theatrical oval face with clean tapered jawline
      return 'M70,137 C69,92 86,50 120,38 C133,34 146,33 160,33 C174,33 187,34 200,38 C234,50 251,92 250,137 C250,152 252,166 247,183 C243,200 238,218 231,240 C224,262 214,280 198,296 C186,308 174,316 167,318 C162,319 158,319 153,318 C146,316 134,308 122,296 C106,280 96,262 89,240 C82,218 77,200 73,183 C68,166 70,152 70,137 Z';
    case 'cellbit':
      // Lean sharp V-tapered jawline & angular temples
      return 'M72,138 C71,94 87,52 120,40 C133,35 146,35 160,35 C174,35 187,35 200,40 C233,52 249,94 248,138 C248,153 249,167 244,183 C240,198 235,214 230,232 C224,254 216,274 202,292 C190,306 176,315 168,317 C162,318 158,318 152,317 C144,315 130,306 118,292 C104,274 96,254 90,232 C85,214 80,198 76,183 C71,167 72,153 72,138 Z';
    case 'smzinho':
      // Broad rugged jaw silhouette
      return 'M67,136 C66,92 84,52 118,40 C132,35 146,34 160,34 C174,34 188,35 202,40 C236,52 254,92 253,136 C253,154 256,170 252,188 C249,208 244,238 232,268 C218,292 192,310 175,316 C165,319 155,319 145,316 C128,310 102,292 88,268 C76,238 71,208 68,188 C64,170 67,154 67,136 Z';
    default:
      break;
  }

  switch (enemy.bossId) {
    case 'trevor_gta5':
      // Gaunt, weathered angular Trevor Philips face: high sharp cheekbones, hollow cheeks & rugged jaw
      return 'M73,136 C72,90 88,48 120,36 C133,32 146,31 160,31 C174,31 187,32 200,36 C232,48 248,90 247,136 C248,152 250,166 245,182 C240,196 235,212 232,228 C229,246 225,266 213,283 C200,300 182,312 170,316 C163,318 157,318 150,316 C138,312 120,300 107,283 C95,266 91,246 88,228 C85,212 80,196 75,182 C70,166 72,152 73,136 Z';
    case 'geralt':
      // Lean, chiseled cheekbone & sculpted V-tapered Witcher jaw
      return 'M72,138 C71,94 86,54 119,41 C132,36 146,35 160,35 C174,35 188,36 201,41 C234,54 249,94 248,138 C248,152 250,165 246,181 C243,195 239,207 236,222 C233,240 229,259 218,274 C204,292 186,309 173,314 C164,317 156,317 147,314 C134,309 116,292 102,274 C91,259 87,240 84,222 C81,207 77,195 74,181 C70,165 72,152 72,138 Z';
    case 'john_wick':
    case 'joker':
      // Slightly elongated, narrower gaunt/angular oval face
      return 'M73,138 C72,94 88,52 121,40 C134,35 147,34 160,34 C173,34 186,35 199,40 C232,52 248,94 247,138 C247,154 249,168 244,184 C240,198 235,212 231,228 C227,246 222,265 210,282 C197,299 180,313 170,317 C163,319 157,319 150,317 C140,313 123,299 110,282 C98,265 93,246 89,228 C85,212 80,198 76,184 C71,168 73,154 73,138 Z';
    case 'kratos':
    case 't800':
    case 'wolverine':
    case 'arthur_morgan':
      // Broad, strong square mandible & heavy masculine jaw corners
      return 'M68,136 C67,92 84,52 118,40 C132,35 146,34 160,34 C174,34 188,35 202,40 C236,52 253,92 252,136 C252,152 255,168 251,185 C249,199 245,214 244,232 C242,252 238,268 224,284 C208,301 188,312 175,316 C165,319 155,319 145,316 C132,312 112,301 96,284 C82,268 78,252 76,232 C75,214 71,199 69,185 C65,168 68,152 68,136 Z';
    case 'thanos':
      // Massive wide Mad Titan cranium & broad anvil jaw
      return 'M62,136 C60,84 82,42 118,32 C133,28 147,28 160,28 C173,28 187,28 202,32 C238,42 260,84 258,136 C259,154 261,172 256,192 C254,208 250,224 248,244 C246,266 240,284 224,298 C206,312 186,320 174,322 C164,323 156,323 146,322 C134,320 114,312 96,298 C80,284 74,266 72,244 C70,224 66,208 64,192 C59,172 61,154 62,136 Z';
    default:
      return 'M69,138 C68,94 84,54 118,41 C132,36 146,35 160,35 C174,35 188,36 202,41 C236,54 252,94 251,138 C251,152 254,166 251,182 C249,195 244,205 242,218 C240,235 239,252 228,268 C214,288 192,308 176,314 C166,317 154,317 144,314 C128,308 106,288 92,268 C81,252 80,235 78,218 C76,205 71,195 69,182 C66,166 69,152 69,138 Z';
  }
}

/**
 * Dedicated multi-stop gradients for sculpted per-boss hair, tattoos, scars & gear.
 */
export const BossSvgDefs: React.FC = () => (
  <>
    {/* Trevor Philips: greasy disheveled dark-brown thinning hair */}
    <linearGradient id="trevor-hair-grad" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stopColor="#423023" />
      <stop offset="48%" stopColor="#291c13" />
      <stop offset="100%" stopColor="#120b07" />
    </linearGradient>
    <linearGradient id="trevor-hair-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#1a110b" />
      <stop offset="100%" stopColor="#090503" />
    </linearGradient>

    {/* John Wick: sleek glossy obsidian-black hair */}
    <linearGradient id="wick-hair-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#2c2c34" />
      <stop offset="45%" stopColor="#121216" />
      <stop offset="100%" stopColor="#050507" />
    </linearGradient>

    {/* Geralt: silver-white Witcher hair with cool steel-ash roots */}
    <linearGradient id="geralt-hair-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#f8fafc" />
      <stop offset="52%" stopColor="#d4dce6" />
      <stop offset="100%" stopColor="#7b899b" />
    </linearGradient>

    {/* Joker: greasy deep mossy-emerald wild curls (Dark Knight tone) */}
    <linearGradient id="joker-hair-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#5c8e38" />
      <stop offset="48%" stopColor="#355e1c" />
      <stop offset="100%" stopColor="#142909" />
    </linearGradient>
    <linearGradient id="joker-hair-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#162b0a" />
      <stop offset="100%" stopColor="#091204" />
    </linearGradient>

    {/* Wolverine: coarse dark espresso-black wild flared wings + slate sheen */}
    <linearGradient id="wolverine-hair-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#463e3a" />
      <stop offset="46%" stopColor="#1c1816" />
      <stop offset="100%" stopColor="#070606" />
    </linearGradient>
    <linearGradient id="wolverine-hair-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#171312" />
      <stop offset="100%" stopColor="#050404" />
    </linearGradient>

    {/* Arthur Morgan: sun-bleached chestnut outlaw hair */}
    <linearGradient id="arthur-hair-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#8a5e39" />
      <stop offset="50%" stopColor="#56381f" />
      <stop offset="100%" stopColor="#26160a" />
    </linearGradient>
    <linearGradient id="arthur-hair-light" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#a6774c" />
      <stop offset="100%" stopColor="#5e3e23" />
    </linearGradient>

    {/* T-800 Chrome Endoskeleton Brushed Alloy */}
    <linearGradient id="t800-chrome-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#f8fafc" />
      <stop offset="24%" stopColor="#cbd5e1" />
      <stop offset="50%" stopColor="#64748b" />
      <stop offset="78%" stopColor="#1e293b" />
      <stop offset="100%" stopColor="#090d16" />
    </linearGradient>
    <radialGradient id="t800-optic-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="26%" stopColor="#ef4444" />
      <stop offset="68%" stopColor="#dc2626" stopOpacity="0.88" />
      <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
    </radialGradient>

    {/* Joker geometric patterned dress shirt */}
    <pattern id="joker-shirt-pat" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="#3a4468" />
      <polygon points="6,1 11,3.5 11,8.5 6,11 1,8.5 1,3.5" fill="none" stroke="#9b8c59" strokeWidth="1" opacity="0.7" />
      <circle cx="6" cy="6" r="1.4" fill="#9b8c59" opacity="0.55" />
    </pattern>

    {/* Kratos woven leather pauldron texture */}
    <pattern id="kratos-woven-pat" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-22)">
      <rect width="14" height="14" fill="#3b2819" />
      <rect x="0" y="0" width="6" height="14" fill="#523824" stroke="#180e07" strokeWidth="0.9" />
      <rect x="0" y="7" width="14" height="6" fill="#47301e" stroke="#180e07" strokeWidth="0.9" />
    </pattern>
  </>
);

/**
 * Props behind neck/shoulders (e.g. Geralt's dual steel & silver Witcher sword hilts).
 */
export const BossBackProps: React.FC<{ enemy: EnemyProfile }> = ({ enemy }) => {
  if (enemy.bossId === 'geralt') {
    return (
      <g className="pointer-events-none">
        {/* Steel Sword Hilt over Left Shoulder */}
        <g transform="translate(82, 304) rotate(-25)">
          <rect x="-5" y="-56" width="10" height="58" rx="2" fill="#291a10" stroke="#090705" strokeWidth="1.4" />
          <path d="M-4.5,-44 L4.5,-42 M-4.5,-32 L4.5,-30 M-4.5,-20 L4.5,-18 M-4.5,-8 L4.5,-6" stroke="#6b4b35" strokeWidth="1.3" />
          <circle cx="0" cy="-60" r="6.5" fill="url(#metal-grad)" stroke="#0f172a" strokeWidth="1.4" />
          <path d="M-21,2 Q0,-5 21,2 L19,8 Q0,2 -19,8 Z" fill="url(#metal-grad)" stroke="#0f172a" strokeWidth="1.4" />
        </g>
        {/* Silver Sword Hilt over Right Shoulder (higher, signature slanted V-crossguard) */}
        <g transform="translate(236, 294) rotate(24)">
          <rect x="-5" y="-58" width="10" height="60" rx="2" fill="#18181b" stroke="#050507" strokeWidth="1.4" />
          <path d="M-4.5,-46 L4.5,-44 M-4.5,-34 L4.5,-32 M-4.5,-22 L4.5,-20 M-4.5,-10 L4.5,-8" stroke="#71717a" strokeWidth="1.3" />
          <circle cx="0" cy="-62" r="7" fill="url(#metal-grad)" stroke="#0f172a" strokeWidth="1.4" />
          <path d="M-23,-6 L0,4 L23,-6 L20,2 L0,11 L-20,2 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.4" />
        </g>
      </g>
    );
  }
  return null;
};

/**
 * Hair silhouettes that drape behind the ears, jawline & neck.
 */
export const BossBackHair: React.FC<{ enemy: EnemyProfile }> = ({ enemy }) => {
  switch (enemy.bossId) {
    case 'trevor_gta5':
      return (
        <g className="pointer-events-none">
          {/* Unkempt greasy dark-brown side/back tufts sticking out unevenly behind ears */}
          <path
            d="M72,96 C54,104 46,128 54,148 C60,138 64,132 72,130 Z"
            fill="url(#trevor-hair-shadow)"
            stroke="#0e0805"
            strokeWidth="1.1"
          />
          <path
            d="M66,118 C52,132 50,162 60,188 C67,174 71,158 74,142 Z"
            fill="url(#trevor-hair-grad)"
            stroke="#0e0805"
            strokeWidth="1"
          />
          <path
            d="M248,96 C268,102 276,126 266,148 C260,138 256,132 248,130 Z"
            fill="url(#trevor-hair-shadow)"
            stroke="#0e0805"
            strokeWidth="1.1"
          />
          <path
            d="M254,118 C270,132 270,164 260,192 C253,176 249,158 246,142 Z"
            fill="url(#trevor-hair-grad)"
            stroke="#0e0805"
            strokeWidth="1"
          />
        </g>
      );

    case 'john_wick':
      return (
        <g className="pointer-events-none">
          {/* Long sleek jet-black hair cascading behind ears down to suit collar */}
          <path
            d="M66,104 C50,152 44,234 54,324 C66,336 80,342 96,338 L108,274 L84,170 Z"
            fill="url(#wick-hair-grad)"
            stroke="#050507"
            strokeWidth="1.6"
          />
          <path
            d="M254,104 C270,152 276,234 266,324 C254,336 240,342 224,338 L212,274 L236,170 Z"
            fill="url(#wick-hair-grad)"
            stroke="#050507"
            strokeWidth="1.6"
          />
          {/* Glossy wet-look vertical strand sheen */}
          <path
            d="M58,196 Q54,258 64,316 M68,214 Q65,270 74,324 M262,196 Q266,258 256,316 M252,214 Q255,270 246,324"
            fill="none"
            stroke="#52525b"
            strokeWidth="1.4"
            opacity="0.48"
            strokeLinecap="round"
          />
        </g>
      );

    case 'geralt':
      return (
        <g className="pointer-events-none">
          {/* Long flowing snow-white Witcher mane behind ears and onto shoulders */}
          <path
            d="M66,104 C48,156 42,248 52,344 C68,354 84,352 100,340 L108,272 L84,168 Z"
            fill="url(#geralt-hair-grad)"
            stroke="#475569"
            strokeWidth="1.3"
          />
          <path
            d="M254,104 C272,156 278,248 268,344 C252,354 236,352 220,340 L212,272 L236,168 Z"
            fill="url(#geralt-hair-grad)"
            stroke="#475569"
            strokeWidth="1.3"
          />
          <path
            d="M58,188 Q54,264 62,334 M70,210 Q66,278 76,336 M262,188 Q266,264 258,334 M250,210 Q254,278 244,336"
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
            opacity="0.52"
            strokeLinecap="round"
          />
        </g>
      );

    case 'wolverine':
      return (
        <g className="pointer-events-none">
          {/* Iconic Multi-Layered Razor-Flared Wolverine Wolf Wings (4 sculpted jagged spikes per side) */}
          {/* Deep Under-Layer Shadow Wings */}
          <path
            d="M84,104 C54,96 24,62 12,16 C40,32 66,42 96,42 L102,118 Z"
            fill="url(#wolverine-hair-shadow)"
            stroke="#050507"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M236,104 C266,96 296,62 308,16 C280,32 254,42 224,42 L218,118 Z"
            fill="url(#wolverine-hair-shadow)"
            stroke="#050507"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Primary Swept-Upward Horned Hair Spikes */}
          <path
            d="M80,96 C54,80 34,54 22,22 C44,38 66,46 90,50 L92,98 Z"
            fill="url(#wolverine-hair-grad)"
            stroke="#050507"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M240,96 C266,80 286,54 298,22 C276,38 254,46 230,50 L228,98 Z"
            fill="url(#wolverine-hair-grad)"
            stroke="#050507"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Mid-Temple Jagged Wolf Locks */}
          <path
            d="M74,118 C48,104 30,80 22,48 C42,64 62,72 82,76 Z"
            fill="url(#wolverine-hair-grad)"
            stroke="#050507"
            strokeWidth="1.3"
          />
          <path
            d="M246,118 C272,104 290,80 298,48 C278,64 258,72 238,76 Z"
            fill="url(#wolverine-hair-grad)"
            stroke="#050507"
            strokeWidth="1.3"
          />
          {/* Lower Ear-Flaring Bristle Tufts */}
          <path
            d="M72,138 C52,130 34,112 26,86 C46,98 62,104 78,102 Z"
            fill="#241f1d"
            stroke="#050507"
            strokeWidth="1.2"
          />
          <path
            d="M248,138 C268,130 286,112 294,86 C274,98 258,104 242,102 Z"
            fill="#241f1d"
            stroke="#050507"
            strokeWidth="1.2"
          />
          {/* Wing Rim Highlights */}
          <path
            d="M26,28 Q52,48 82,58 M30,60 Q54,76 76,82 M294,28 Q268,48 238,58 M290,60 Q266,76 244,82"
            fill="none"
            stroke="#6b635e"
            strokeWidth="1.35"
            opacity="0.52"
            strokeLinecap="round"
          />
        </g>
      );

    case 'joker':
      return (
        <g className="pointer-events-none">
          {/* Messy greasy emerald-green curled locks tucked behind & beside ears */}
          <path
            d="M70,112 C48,132 42,174 54,212 C62,222 72,218 76,204 L78,138 Z"
            fill="url(#joker-hair-grad)"
            stroke="#091504"
            strokeWidth="1.3"
          />
          <path
            d="M64,148 C48,166 48,194 60,214 C64,200 68,182 74,164 Z"
            fill="url(#joker-hair-shadow)"
          />
          <path
            d="M250,112 C272,132 278,174 266,212 C258,222 248,218 244,204 L242,138 Z"
            fill="url(#joker-hair-grad)"
            stroke="#091504"
            strokeWidth="1.3"
          />
          <path
            d="M256,148 C272,166 272,194 260,214 C256,200 252,182 246,164 Z"
            fill="url(#joker-hair-shadow)"
          />
        </g>
      );

    case 'arthur_morgan':
      return (
        <g className="pointer-events-none">
          {/* Layered shaggy sun-bleached chestnut outlaw locks framing temples, ears & nape beneath hat */}
          <path
            d="M68,94 C50,128 48,182 62,224 C70,220 77,208 80,190 L80,114 Z"
            fill="url(#arthur-hair-grad)"
            stroke="#1f1107"
            strokeWidth="1.2"
          />
          <path
            d="M58,154 C52,182 54,206 66,228 C72,216 74,198 76,176 Z"
            fill="url(#arthur-hair-light)"
            stroke="#26160a"
            strokeWidth="0.9"
          />
          <path
            d="M252,94 C270,128 272,182 258,224 C250,220 243,208 240,190 L240,114 Z"
            fill="url(#arthur-hair-grad)"
            stroke="#1f1107"
            strokeWidth="1.2"
          />
          <path
            d="M262,154 C268,182 266,206 254,228 C248,216 246,198 244,176 Z"
            fill="url(#arthur-hair-light)"
            stroke="#26160a"
            strokeWidth="0.9"
          />
          <path
            d="M60,136 Q56,174 64,212 M260,136 Q264,174 256,212"
            fill="none"
            stroke="#a6774c"
            strokeWidth="1.3"
            opacity="0.45"
            strokeLinecap="round"
          />
        </g>
      );

      default:
        if (enemy.miniBossId === 'cellbit') {
          return (
            <g className="pointer-events-none">
              {/* Dirty-blonde / light caramel messy locks tucked neatly around temples and behind ears */}
              <path
                d="M68,100 C54,128 53,168 65,200 C72,188 76,170 78,148 L78,104 Z"
                fill="#7c522d"
                stroke="#3d2410"
                strokeWidth="1.1"
              />
              <path
                d="M252,100 C266,128 267,168 255,200 C248,188 244,170 242,148 L242,104 Z"
                fill="#7c522d"
                stroke="#3d2410"
                strokeWidth="1.1"
              />
            </g>
          );
        }
        if (enemy.miniBossId === 'whindersson') {
          return (
            <g className="pointer-events-none">
              {/* Iconic 2016–2017 straight smooth temple/side hair draping smoothly above ears */}
              <path
                d="M66,86 C56,106 56,136 65,158 C71,148 73,130 74,108 Z"
                fill="#191411"
                stroke="#090705"
                strokeWidth="1"
              />
              <path
                d="M254,86 C264,106 264,136 255,158 C249,148 247,130 246,108 Z"
                fill="#191411"
                stroke="#090705"
                strokeWidth="1"
              />
            </g>
          );
        }
        if (enemy.miniBossId === 'luccas_neto') {
          return (
            <g className="pointer-events-none">
              {/* Messy brown hair wisps peeking at sides from beneath his blue beanie */}
              <path
                d="M64,86 C54,104 54,128 62,144 C68,136 70,122 70,104 Z"
                fill="#261b15"
                stroke="#0e0a07"
                strokeWidth="1"
              />
              <path
                d="M256,86 C266,104 266,128 258,144 C252,136 250,122 250,104 Z"
                fill="#261b15"
                stroke="#0e0a07"
                strokeWidth="1"
              />
            </g>
          );
        }
        return null;
  }
};

/**
 * Per-boss ear accessories (e.g. Leon S. Kennedy's black tactical comms earpiece on right ear).
 */
export const BossEarAccessories: React.FC<{ enemy: EnemyProfile }> = ({ enemy }) => {
  void enemy;
  return null;
};

/**
 * Face-plane scars, tattoos, warpaint, endoskeleton tears & sculpted chin/cheekbone anatomy
 * rendered INSIDE #head-clip (beneath animated eyes/brows/mouth).
 */
export const BossFaceMarkings: React.FC<{ enemy: EnemyProfile }> = ({ enemy }) => {
  switch (enemy.bossId) {
    case 'trevor_gta5':
      return (
        <g className="pointer-events-none">
          {/* Shiny sweaty receding forehead highlight + deep maniacal forehead creases */}
          <ellipse cx="160" cy="64" rx="46" ry="18" fill="#fef3c7" opacity="0.14" filter="url(#soft-blur)" />
          <path
            d="M102,74 Q160,66 218,74 M96,88 Q160,80 224,88 M104,102 Q160,94 216,102"
            fill="none"
            stroke="#5e2d18"
            strokeWidth="2.1"
            opacity="0.48"
            strokeLinecap="round"
          />
          <path
            d="M104,76 Q160,68 216,76 M98,90 Q160,82 222,90"
            fill="none"
            stroke="#fde2cf"
            strokeWidth="1.1"
            opacity="0.22"
            strokeLinecap="round"
          />
          {/* Deep crazy vertical "11" glabella scowl lines between eyebrows */}
          <path d="M153,108 L151,128 M167,108 L169,128" stroke="#471d0c" strokeWidth="2.4" opacity="0.58" strokeLinecap="round" />

          {/* Exhausted dark hollowed under-eye bags */}
          <ellipse cx="115" cy="162" rx="20" ry="7.5" fill="#3a190d" opacity="0.42" filter="url(#soft-blur)" />
          <ellipse cx="205" cy="162" rx="20" ry="7.5" fill="#3a190d" opacity="0.42" filter="url(#soft-blur)" />
          <path d="M98,162 Q115,171 134,162 M186,162 Q205,171 222,162" fill="none" stroke="#471d0c" strokeWidth="1.4" opacity="0.46" strokeLinecap="round" />
          {/* Crow's feet */}
          <path d="M92,148 L82,142 M91,153 L81,155 M228,148 L238,142 M229,153 L239,155" stroke="#5e2d18" strokeWidth="1.4" opacity="0.42" strokeLinecap="round" />

          {/* Sun-damaged desert ruddy cheeks & nose tip + gaunt hollow cheekbones */}
          <ellipse cx="102" cy="182" rx="22" ry="12" fill="#b91c1c" opacity="0.16" filter="url(#soft-blur)" />
          <ellipse cx="218" cy="182" rx="22" ry="12" fill="#b91c1c" opacity="0.16" filter="url(#soft-blur)" />
          <ellipse cx="160" cy="196" rx="13" ry="14" fill="#b91c1c" opacity="0.14" filter="url(#soft-blur)" />
          <path d="M84,192 Q100,224 120,256 M236,192 Q220,224 200,256" fill="none" stroke="#471d0c" strokeWidth="6.5" opacity="0.22" filter="url(#soft-blur)" />

          {/* Deep nasolabial laugh/rage folds */}
          <path d="M138,204 Q118,226 112,258 M182,204 Q202,226 208,258" fill="none" stroke="#5e2d18" strokeWidth="1.9" opacity="0.38" strokeLinecap="round" />

          {/* Crooked nose bridge nick & faded cheek scar */}
          <path d="M150,152 L171,161" stroke="#6b2814" strokeWidth="2.1" opacity="0.6" strokeLinecap="round" />
          <path d="M151,153 L170,162" stroke="#fbd5bd" strokeWidth="1" opacity="0.48" strokeLinecap="round" />
          <path d="M206,194 L222,216" stroke="#7c2d12" strokeWidth="1.8" opacity="0.52" strokeLinecap="round" />
          <path d="M207,194 L223,216" stroke="#fbd5bd" strokeWidth="0.9" opacity="0.42" strokeLinecap="round" />
        </g>
      );

    case 'john_wick':
      return (
        <g className="pointer-events-none">
          {/* Tired Baba Yaga under-eye hollows, gaunt cheekbone planes & brow creases */}
          <ellipse cx="116" cy="160" rx="19" ry="6.5" fill="#3a2015" opacity="0.26" filter="url(#soft-blur)" />
          <ellipse cx="204" cy="160" rx="19" ry="6.5" fill="#3a2015" opacity="0.26" filter="url(#soft-blur)" />
          <path d="M82,188 Q106,222 126,252" fill="none" stroke="#2a150c" strokeWidth="7" opacity="0.2" filter="url(#soft-blur)" />
          <path d="M238,188 Q214,222 194,252" fill="none" stroke="#2a150c" strokeWidth="7" opacity="0.2" filter="url(#soft-blur)" />
          <path d="M118,86 Q160,82 202,86 M128,96 Q160,92 192,96" fill="none" stroke="#3f2114" strokeWidth="1.4" opacity="0.24" strokeLinecap="round" />
        </g>
      );

    case 'kratos':
      return (
        <g className="pointer-events-none">
          {/* Deep Norse Warrior forehead furrow lines & heavy glabella ridge */}
          <path d="M98,86 Q160,92 222,86 M106,99 Q160,105 214,99" fill="none" stroke="#334155" strokeWidth="2.6" opacity="0.45" strokeLinecap="round" />
          <path
            d="M84,122 Q118,108 154,122 Q160,125 166,122 Q202,108 236,122"
            fill="none"
            stroke="#475569"
            strokeWidth="7.5"
            opacity="0.38"
            filter="url(#soft-blur)"
          />
          {/* EXACT Kratos Crimson Spartan Tattoo: viewer's RIGHT side (Kratos's left eye) */}
          <path
            d="M174,34 L204,35 L194,82 L166,112 L192,126 L224,126 L216,144 L224,174 L206,204 L186,174 L192,146 L174,124 L158,112 L175,80 Z"
            fill="#8f191d"
            opacity="0.9"
          />
          {/* Subtle worn ash skin texture through tattoo */}
          <path d="M176,78 L196,80 M184,122 L214,122 M194,168 L212,174" stroke="#cbd5e1" strokeWidth="1.1" opacity="0.22" />
          {/* Iconic Vertical Scar through viewer's LEFT eyebrow & cheek */}
          <path d="M110,94 L115,180" stroke="#475569" strokeWidth="3.4" strokeLinecap="round" opacity="0.72" />
          <path d="M111,95 L116,179" stroke="#f1f5f9" strokeWidth="1.4" strokeLinecap="round" opacity="0.58" />
        </g>
      );

    case 't800':
      return (
        <g className="pointer-events-none">
          {/* Intact human cheek battle scrapes + dried blood on viewer's left */}
          <path d="M84,108 L104,116 M86,176 L108,186" stroke="#7f1d1d" strokeWidth="2.2" opacity="0.6" strokeLinecap="round" />
          <path d="M74,202 Q120,256 164,256 L164,316 L80,316 Z" fill="url(#stubble-pat)" opacity="0.52" />

          {/* Ragged Bloodied Torn-Skin Border Exposing Right-Half T-800 Chrome Endoskeleton */}
          <path
            d="M164,50 L178,64 L172,82 L184,102 L171,126 L168,154 L177,180 L185,202 L173,224 L186,256 L214,264 L242,240 L252,196 L254,142 L246,82 L216,50 Z"
            fill="#3a0709"
          />
          {/* Exposed Multi-Plate Brushed-Chrome Terminator Skull Half */}
          <path
            d="M172,56 L216,54 L244,84 L248,144 L242,196 L226,238 L206,254 L186,246 L178,220 L189,198 L178,176 L172,150 L176,124 L188,104 L179,82 Z"
            fill="url(#t800-chrome-grad)"
            stroke="#1e293b"
            strokeWidth="1.8"
          />
          {/* Sculpted Chrome Supraorbital Brow Ridge */}
          <path
            d="M174,126 Q204,112 242,126 L238,138 Q204,126 176,138 Z"
            fill="#94a3b8"
            stroke="#0f172a"
            strokeWidth="1.4"
          />
          {/* Chrome Cranial Seam Lines & Titanium Bolts */}
          <path d="M186,86 L236,90 M180,114 L244,118" stroke="#0f172a" strokeWidth="1.8" opacity="0.72" />
          <path d="M188,88 L234,92" stroke="#ffffff" strokeWidth="1" opacity="0.48" />
          <circle cx="192" cy="72" r="2.2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.6" />
          <circle cx="228" cy="76" r="2.2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.6" />
          <circle cx="236" cy="110" r="2.1" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.6" />
          {/* Zygomatic Chrome Cheekbone Arch & Dual Hydraulic Cheek Pistons */}
          <path
            d="M178,166 Q208,184 244,164 L238,190 Q206,204 180,188 Z"
            fill="url(#metal-grad)"
            stroke="#0f172a"
            strokeWidth="1.4"
          />
          <rect x="196" y="186" width="7" height="44" rx="2" transform="rotate(-12 199 208)" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.2" />
          <rect x="214" y="180" width="5.5" height="40" rx="1.8" transform="rotate(8 216 200)" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.1" />
          {/* Exposed Metallic Jaw Hinge & Endoskeleton Teeth */}
          <path
            d="M180,236 Q204,232 224,242 L218,266 Q198,264 182,256 Z"
            fill="#1f0305"
            stroke="#5c0b0b"
            strokeWidth="1.4"
          />
          <rect x="188" y="241" width="5" height="12" rx="1" fill="#cbd5e1" stroke="#334155" strokeWidth="0.7" />
          <rect x="195" y="241" width="5" height="12" rx="1" fill="#e2e8f0" stroke="#334155" strokeWidth="0.7" />
          <rect x="202" y="242" width="5" height="11" rx="1" fill="#cbd5e1" stroke="#334155" strokeWidth="0.7" />
          {/* Rolled Bloodied Flesh Border */}
          <path
            d="M164,50 L178,64 L172,82 L184,102 L171,126 L168,154 L177,180 L185,202 L173,224 L186,256"
            fill="none"
            stroke="#7f1d1d"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
        </g>
      );

    case 'wolverine':
      return (
        <g className="pointer-events-none">
          {/* Heavy feral brow furrow & fierce glabella V-scowl shadow */}
          <path d="M100,88 Q160,96 220,88 M112,101 Q160,109 208,101" fill="none" stroke="#452414" strokeWidth="2.1" opacity="0.44" strokeLinecap="round" />
          <path
            d="M84,124 Q118,110 154,124 Q160,129 166,124 Q202,110 236,124"
            fill="none"
            stroke="#452414"
            strokeWidth="7"
            opacity="0.34"
            filter="url(#soft-blur)"
          />
          <path d="M154,110 L152,130 M166,110 L168,130" stroke="#3b1c0e" strokeWidth="2.2" opacity="0.54" strokeLinecap="round" />

          {/* Deep-set grizzled eye bags & sharp cheekbone hollows */}
          <ellipse cx="115" cy="161" rx="18" ry="5.5" fill="#452414" opacity="0.3" filter="url(#soft-blur)" />
          <ellipse cx="205" cy="161" rx="18" ry="5.5" fill="#452414" opacity="0.3" filter="url(#soft-blur)" />
          <path d="M86,184 Q112,208 134,228 M234,184 Q208,208 186,228" fill="none" stroke="#4a2614" strokeWidth="6" opacity="0.26" filter="url(#soft-blur)" />

          {/* Weathered combat scars across left brow/cheek & nose bridge */}
          <path d="M98,108 L112,136" stroke="#5c2814" strokeWidth="2.4" opacity="0.58" strokeLinecap="round" />
          <path d="M99,108 L113,136" stroke="#f3cfb6" strokeWidth="1" opacity="0.52" strokeLinecap="round" />
          <path d="M148,164 L172,174" stroke="#5c2814" strokeWidth="1.9" opacity="0.52" strokeLinecap="round" />
          <path d="M149,165 L171,175" stroke="#f3cfb6" strokeWidth="0.9" opacity="0.44" strokeLinecap="round" />
        </g>
      );

    case 'geralt':
      return (
        <g className="pointer-events-none">
          {/* Witcher Forehead Creases & Left Horizontal Forehead Scar */}
          <path d="M102,92 L134,88" stroke="#64748b" strokeWidth="2.2" opacity="0.6" strokeLinecap="round" />
          <path d="M102,93 L134,89" stroke="#f8fafc" strokeWidth="1.1" opacity="0.52" strokeLinecap="round" />
          <path d="M110,104 Q160,100 210,104" fill="none" stroke="#475569" strokeWidth="1.4" opacity="0.26" strokeLinecap="round" />
          {/* Iconic Deep Right-Eye Witcher Vertical Slash Scar (matching reference image!) */}
          <path d="M196,82 L201,134 M206,162 L218,200" stroke="#7f1d1d" strokeWidth="3.6" strokeLinecap="round" opacity="0.72" />
          <path d="M197,82 L202,134 M207,162 L219,200" stroke="#fecdd3" strokeWidth="1.6" strokeLinecap="round" opacity="0.64" />
          {/* Subtle Witcher potion toxicity veins beneath eyes */}
          <path d="M98,166 L108,174 L104,184 M222,166 L212,174 L216,184" fill="none" stroke="#334155" strokeWidth="1.2" opacity="0.3" strokeLinecap="round" />
        </g>
      );

    case 'joker':
      return (
        <g className="pointer-events-none">
          {/* Cracked Imperfect Chalk-White Clown Greasepaint (leaves raw skin at neck & temples) */}
          <path
            d="M78,84 Q160,64 242,84 L244,232 Q212,296 160,310 Q108,296 76,232 Z"
            fill="#f1f5f9"
            opacity="0.78"
          />
          {/* Grimy Forehead Wrinkles & Peeling Makeup Shading */}
          <path d="M104,88 Q160,94 216,88 M112,100 Q160,106 208,100 M122,112 Q160,117 198,112" fill="none" stroke="#64748b" strokeWidth="1.6" opacity="0.45" strokeLinecap="round" />
          {/* Heavy Smudged Charcoal Black Raccoon Eye Paint */}
          <ellipse cx="115" cy="148" rx="24" ry="15" transform="rotate(-7 115 148)" fill="#09090b" opacity="0.82" filter="url(#soft-blur)" />
          <ellipse cx="205" cy="148" rx="24" ry="15" transform="rotate(7 205 148)" fill="#09090b" opacity="0.82" filter="url(#soft-blur)" />
          <path d="M104,162 L101,180 M124,162 L126,176 M216,162 L219,180 M196,162 L194,176" stroke="#18181b" strokeWidth="2.8" opacity="0.52" strokeLinecap="round" filter="url(#soft-blur)" />
          {/* Smeared Crimson Glasgow Smile Cheek Scars & Bizarre Grin Creases */}
          <path
            d="M113,227 Q94,215 79,196 M207,227 Q226,215 241,196"
            fill="none"
            stroke="#5c080a"
            strokeWidth="9"
            strokeLinecap="round"
            opacity="0.86"
          />
          <path
            d="M113,227 Q94,215 79,196 M207,227 Q226,215 241,196"
            fill="none"
            stroke="#b91c1c"
            strokeWidth="4.4"
            strokeLinecap="round"
            opacity="0.96"
          />
          <path
            d="M105,214 L100,225 M94,205 L89,215 M85,197 L81,206 M215,214 L220,225 M226,205 L231,215 M235,197 L239,206"
            stroke="#450a0a"
            strokeWidth="1.5"
            opacity="0.8"
            strokeLinecap="round"
          />
          {/* Deep Maniacal Grin Cheek Dimples */}
          <path
            d="M104,208 Q97,226 112,246 M216,208 Q223,226 208,246"
            fill="none"
            stroke="#475569"
            strokeWidth="1.8"
            opacity="0.52"
            strokeLinecap="round"
          />
        </g>
      );

    case 'thanos':
      return (
        <g className="pointer-events-none">
          {/* Heavy Bony Cosmic Brow Plate & Forehead Compression Creases */}
          <path d="M98,74 Q160,80 222,74 M108,88 Q160,94 212,88" fill="none" stroke="#2e1065" strokeWidth="2.8" opacity="0.45" strokeLinecap="round" />
          <path
            d="M72,126 Q116,104 160,118 Q204,104 248,126"
            fill="none"
            stroke="#2e1065"
            strokeWidth="10"
            opacity="0.45"
            strokeLinecap="round"
            filter="url(#soft-blur)"
          />
          <path
            d="M80,116 Q116,100 160,111 Q204,100 240,116"
            fill="none"
            stroke="#c4b5fd"
            strokeWidth="3.5"
            opacity="0.24"
            strokeLinecap="round"
            filter="url(#soft-blur)"
          />
          {/* Deep Cheekbone Plating & Diagonal Scars */}
          <path d="M84,180 L108,204 M236,180 L212,204" stroke="#3b0764" strokeWidth="3.5" opacity="0.38" strokeLinecap="round" filter="url(#soft-blur)" />
          <path d="M92,188 L114,218" stroke="#d8b4fe" strokeWidth="1.6" opacity="0.36" strokeLinecap="round" />
          {/* Signature Thanos 3D Sculpted Vertical Ribbed Chin Grooves */}
          {[-26, -17, -8.5, 0, 8.5, 17, 26].map((dx, i) => {
            const topY = 274 + Math.abs(dx) * 0.22;
            const botY = 319 - Math.abs(dx) * 0.3;
            return (
              <React.Fragment key={`thanos-groove-${i}`}>
                <path
                  d={`M${160 + dx},${topY} Q${160 + dx * 0.94},${(topY + botY) * 0.5} ${160 + dx * 0.86},${botY}`}
                  stroke="#2e1065"
                  strokeWidth="3.6"
                  opacity="0.76"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={`M${160 + dx + 2.2},${topY + 2} Q${160 + dx * 0.94 + 2},${(topY + botY) * 0.5} ${160 + dx * 0.86 + 1.8},${botY - 2}`}
                  stroke="#c4b5fd"
                  strokeWidth="1.35"
                  opacity="0.3"
                  strokeLinecap="round"
                  fill="none"
                />
              </React.Fragment>
            );
          })}
        </g>
      );

    case 'arthur_morgan':
      return (
        <g className="pointer-events-none">
          {/* Dramatic Gambler Hat Brim Shadow across upper forehead right down to brow ridge */}
          <path
            d="M62,36 L258,36 L254,102 Q160,118 66,102 Z"
            fill="#1f1007"
            opacity="0.48"
            filter="url(#soft-blur)"
          />
          <path
            d="M114,100 Q160,94 206,100 M122,110 Q160,106 198,110"
            fill="none"
            stroke="#592e18"
            strokeWidth="1.5"
            opacity="0.34"
            strokeLinecap="round"
          />
          {/* Deep-set frontier eye sockets & strong chiseled cheekbone shadows */}
          <ellipse cx="115" cy="159" rx="18" ry="5.5" fill="#592e18" opacity="0.22" filter="url(#soft-blur)" />
          <ellipse cx="205" cy="159" rx="18" ry="5.5" fill="#592e18" opacity="0.22" filter="url(#soft-blur)" />
          <path d="M84,186 Q106,210 128,228 M236,186 Q214,210 192,228" fill="none" stroke="#592e18" strokeWidth="5.5" opacity="0.24" filter="url(#soft-blur)" />

          {/* Sun-tanned frontier blush across cheekbones & nose bridge + weathered crow's feet */}
          <ellipse cx="104" cy="184" rx="22" ry="11" fill="#b91c1c" opacity="0.14" filter="url(#soft-blur)" />
          <ellipse cx="216" cy="184" rx="22" ry="11" fill="#b91c1c" opacity="0.14" filter="url(#soft-blur)" />
          <ellipse cx="160" cy="184" rx="10" ry="18" fill="#b91c1c" opacity="0.11" filter="url(#soft-blur)" />
          <path d="M92,148 L83,143 M92,153 L82,155 M228,148 L237,143 M228,153 L238,155" stroke="#6b3e24" strokeWidth="1.4" opacity="0.46" strokeLinecap="round" />

          {/* Iconic healed chin/right-jaw outlaw scar */}
          <path d="M206,204 L214,224" stroke="#f1d3be" strokeWidth="1.8" opacity="0.72" strokeLinecap="round" />
          <path d="M207,204 L215,224" stroke="#6e3922" strokeWidth="1.1" opacity="0.6" strokeLinecap="round" />
        </g>
      );

    default:
      if (enemy.miniBossId === 'casimiro') {
        return (
          <g className="pointer-events-none">
            {/* Plump chubby rosy cheeks & wide jowl volume */}
            <ellipse cx="92" cy="196" rx="28" ry="18" fill="#c25243" opacity="0.16" filter="url(#soft-blur)" />
            <ellipse cx="228" cy="196" rx="28" ry="18" fill="#c25243" opacity="0.16" filter="url(#soft-blur)" />
            <ellipse cx="88" cy="188" rx="18" ry="11" fill="#fff7ed" opacity="0.14" filter="url(#soft-blur)" />
            <ellipse cx="232" cy="188" rx="18" ry="11" fill="#fff7ed" opacity="0.14" filter="url(#soft-blur)" />
            {/* Expressive plump nasolabial folds */}
            <path
              d="M135,198 Q112,226 106,258 M185,198 Q208,226 214,258"
              fill="none"
              stroke="#5c2a18"
              strokeWidth="2.2"
              opacity="0.32"
              strokeLinecap="round"
            />
            {/* Signature chubby double-chin (papada) crease & under-chin fold */}
            <path
              d="M112,294 Q160,318 208,294"
              fill="none"
              stroke="#471d0c"
              strokeWidth="4.2"
              opacity="0.36"
              strokeLinecap="round"
              filter="url(#soft-blur)"
            />
            <path
              d="M124,292 Q160,312 196,292"
              fill="none"
              stroke="#fde6d8"
              strokeWidth="1.6"
              opacity="0.22"
              strokeLinecap="round"
            />
          </g>
        );
      }
      if (enemy.miniBossId === 'luccas_neto') {
        return (
          <g className="pointer-events-none">
            {/* Soft chubby cheeks & cheerful smile dimple creases */}
            <ellipse cx="96" cy="192" rx="25" ry="16" fill="#dc5a47" opacity="0.16" filter="url(#soft-blur)" />
            <ellipse cx="224" cy="192" rx="25" ry="16" fill="#dc5a47" opacity="0.16" filter="url(#soft-blur)" />
            <path
              d="M135,198 Q116,223 112,252 M185,198 Q204,223 208,252"
              fill="none"
              stroke="#5c2a18"
              strokeWidth="1.9"
              opacity="0.3"
              strokeLinecap="round"
            />
            {/* Soft double-chin fullness */}
            <path
              d="M120,295 Q160,315 200,295"
              fill="none"
              stroke="#471d0c"
              strokeWidth="3.5"
              opacity="0.32"
              strokeLinecap="round"
              filter="url(#soft-blur)"
            />
          </g>
        );
      }
      if (enemy.miniBossId === 'cellbit') {
        return (
          <g className="pointer-events-none">
            {/* Exhausted ARG/Enigma detective dark under-eye circles & lean cheekbone contour */}
            <ellipse cx="115" cy="161" rx="18" ry="6.2" fill="#2e1b36" opacity="0.34" filter="url(#soft-blur)" />
            <ellipse cx="205" cy="161" rx="18" ry="6.2" fill="#2e1b36" opacity="0.34" filter="url(#soft-blur)" />
            <path d="M84,190 Q106,222 126,248 M236,190 Q214,222 194,248" fill="none" stroke="#472115" strokeWidth="5.5" opacity="0.18" filter="url(#soft-blur)" />
          </g>
        );
      }
      if (enemy.miniBossId === 'davy_jones') {
        return (
          <g className="pointer-events-none">
            {/* 2015 "Velho Testamento" plumper cheeks, gaming marathon eye bags & double chin fold */}
            <ellipse cx="96" cy="195" rx="24" ry="15" fill="#b9483b" opacity="0.13" filter="url(#soft-blur)" />
            <ellipse cx="224" cy="195" rx="24" ry="15" fill="#b9483b" opacity="0.13" filter="url(#soft-blur)" />
            <ellipse cx="115" cy="161" rx="18" ry="6" fill="#472214" opacity="0.28" filter="url(#soft-blur)" />
            <ellipse cx="205" cy="161" rx="18" ry="6" fill="#472214" opacity="0.28" filter="url(#soft-blur)" />
            <path
              d="M118,294 Q160,314 202,294"
              fill="none"
              stroke="#471d0c"
              strokeWidth="3.6"
              opacity="0.32"
              strokeLinecap="round"
              filter="url(#soft-blur)"
            />
          </g>
        );
      }
      if (enemy.miniBossId === 'felipe_neto') {
        return (
          <g className="pointer-events-none">
            {/* Iconic 2010 "Não Faz Sentido" indignant brow furrow + sculpted cheek line */}
            <path d="M126,98 Q160,92 194,98" fill="none" stroke="#61331e" strokeWidth="1.6" opacity="0.28" strokeLinecap="round" />
            <path d="M154,114 L152,130 M166,114 L168,130" stroke="#4f2514" strokeWidth="2.1" opacity="0.44" strokeLinecap="round" />
            <path d="M88,188 Q108,216 126,242 M232,188 Q212,216 194,242" fill="none" stroke="#472115" strokeWidth="4.5" opacity="0.14" filter="url(#soft-blur)" />
          </g>
        );
      }
      if (enemy.miniBossId === 'kleberiano') {
        return (
          <g className="pointer-events-none">
            {/* Tall high-forehead shine ("calvo" meme highlight) + lively under-eye shadow */}
            <ellipse cx="160" cy="64" rx="42" ry="16" fill="#fff7ed" opacity="0.18" filter="url(#soft-blur)" />
            <ellipse cx="115" cy="160" rx="17" ry="5.5" fill="#472214" opacity="0.22" filter="url(#soft-blur)" />
            <ellipse cx="205" cy="160" rx="17" ry="5.5" fill="#472214" opacity="0.22" filter="url(#soft-blur)" />
            <path d="M134,200 Q116,224 112,248 M186,200 Q204,224 208,248" fill="none" stroke="#5c2a18" strokeWidth="1.6" opacity="0.24" strokeLinecap="round" />
          </g>
        );
      }
      if (enemy.miniBossId === 'alanzoka') {
        return (
          <g className="pointer-events-none">
            {/* Expressive arched reaction creases + warm gamer cheek glow */}
            <ellipse cx="102" cy="186" rx="19" ry="10" fill="#d95b4e" opacity="0.12" filter="url(#soft-blur)" />
            <ellipse cx="218" cy="186" rx="19" ry="10" fill="#d95b4e" opacity="0.12" filter="url(#soft-blur)" />
            <path d="M135,198 Q117,222 114,248 M185,198 Q203,222 206,248" fill="none" stroke="#5c2a18" strokeWidth="1.6" opacity="0.24" strokeLinecap="round" />
          </g>
        );
      }
      if (enemy.miniBossId === 'whindersson') {
        return (
          <g className="pointer-events-none">
            {/* Warm Piauí cheek sun-tone + friendly smile lines */}
            <ellipse cx="100" cy="184" rx="22" ry="12" fill="#b9482e" opacity="0.14" filter="url(#soft-blur)" />
            <ellipse cx="220" cy="184" rx="22" ry="12" fill="#b9482e" opacity="0.14" filter="url(#soft-blur)" />
            <path d="M136,200 Q116,225 112,250 M184,200 Q204,225 208,250" fill="none" stroke="#471f0e" strokeWidth="1.8" opacity="0.28" strokeLinecap="round" />
          </g>
        );
      }
      if (enemy.miniBossId === 'smzinho') {
        return (
          <g className="pointer-events-none">
            {/* Rugged 3D muscular blue skin brow ridge & temple depth */}
            <path d="M98,84 Q160,92 222,84 M110,98 Q160,104 210,98" fill="none" stroke="#08365c" strokeWidth="2.2" opacity="0.4" strokeLinecap="round" />
            <path d="M153,110 L151,129 M167,110 L169,129" stroke="#08365c" strokeWidth="2.1" opacity="0.45" strokeLinecap="round" />
          </g>
        );
      }
      return null;
  }
};

/**
 * Custom per-boss facial hair (replaces generic oval beard when bossId matches).
 */
export const BossCustomFacialHair: React.FC<{ enemy: EnemyProfile }> = ({ enemy }) => {
  if (enemy.bossId === 'kratos') {
    return (
      <g className="pointer-events-none">
        {/* Massive Pointed Spartan / Norse Warrior Beard with subtle gray highlights */}
        <path
          d="M70,192 Q106,238 160,234 Q214,238 250,192 L242,272 Q216,326 160,346 Q104,326 78,272 Z"
          fill="#1b1815"
          stroke="#090705"
          strokeWidth="1.4"
        />
        <path
          d="M70,192 Q106,238 160,234 Q214,238 250,192 L242,272 Q216,326 160,346 Q104,326 78,272 Z"
          fill="url(#hair-depth-grad)"
        />
        <path
          d="M116,242 Q160,222 204,242 Q196,256 178,250 Q160,244 142,250 Q124,256 116,242 Z"
          fill="#14110f"
        />
        <path
          d="M90,234 L97,276 M110,256 L117,310 M135,274 L140,330 M160,278 L160,342 M185,274 L180,330 M210,256 L203,310 M230,234 L223,276"
          stroke="#6b655f"
          strokeWidth="1.35"
          opacity="0.34"
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (enemy.bossId === 'trevor_gta5') {
    return (
      <g className="pointer-events-none">
        {/* Patchy, scraggly Blaine County 3-day unshaven stubble + unkempt mustache */}
        <path d="M76,192 Q160,268 244,192 L234,316 L86,316 Z" fill="url(#stubble-pat)" opacity="0.72" />
        <path
          d="M126,238 Q160,225 194,238 Q186,248 160,242 Q134,248 126,238 Z"
          fill="#2b1e16"
          opacity="0.54"
        />
        <path
          d="M142,292 Q160,302 178,292 L174,315 Q160,319 146,315 Z"
          fill="#241710"
          opacity="0.46"
        />
        <path
          d="M84,218 L89,232 M94,242 L99,256 M236,218 L231,232 M226,242 L221,256 M148,298 L150,312 M172,298 L170,312"
          stroke="#1f140d"
          strokeWidth="1.15"
          opacity="0.55"
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (enemy.bossId === 'wolverine') {
    return (
      <g className="pointer-events-none">
        {/* Signature Wide Flared Wolverine Mutton-Chop Sideburns wrapping jawline into rugged chin beard */}
        <path d="M74,192 Q160,244 246,192 L238,266 L82,266 Z" fill="url(#stubble-pat)" opacity="0.68" />
        {/* Heavy Left & Right Flared Sideburns extending wide along temples & mandible */}
        <path
          d="M66,134 L82,142 C86,184 98,214 126,236 Q160,250 194,236 C222,214 234,184 238,142 L254,134 L256,212 C252,256 226,298 188,318 C172,324 148,324 132,318 C94,298 68,256 64,212 Z"
          fill="#181412"
          stroke="#050507"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        <path
          d="M66,134 L82,142 C86,184 98,214 126,236 Q160,250 194,236 C222,214 234,184 238,142 L254,134 L256,212 C252,256 226,298 188,318 C172,324 148,324 132,318 C94,298 68,256 64,212 Z"
          fill="url(#hair-depth-grad)"
        />
        {/* Sculpted Mutton-Chop Outer Flare Tufts */}
        <path
          d="M66,174 L56,194 L66,204 L58,224 L74,238 M254,174 L264,194 L254,204 L262,224 L246,238"
          fill="#181412"
          stroke="#050507"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        {/* Fierce Feral Downturn Mustache & Chin Anchor */}
        <path
          d="M118,238 Q160,220 202,238 Q192,252 160,244 Q128,252 118,238 Z"
          fill="#110e0c"
          stroke="#050507"
          strokeWidth="0.9"
        />
        <path d="M154,274 L166,274 L164,294 L156,294 Z" fill="#14100e" />
        {/* Grizzled Salt-and-Pepper Whisker Texture */}
        <path
          d="M72,166 L80,204 M82,212 L96,254 M106,256 L118,298 M136,282 L144,316 M184,282 L176,316 M214,256 L202,298 M238,212 L224,254 M248,166 L240,204"
          stroke="#94a3b8"
          strokeWidth="1.35"
          opacity="0.44"
          strokeLinecap="round"
        />
        <path
          d="M90,236 L102,272 M230,236 L218,272 M152,294 L154,318 M168,294 L166,318"
          stroke="#cbd5e1"
          strokeWidth="1"
          opacity="0.28"
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (enemy.bossId === 'john_wick') {
    return (
      <g className="pointer-events-none">
        {/* Lighter Cheek Stubble + Defined Baba Yaga Mustache, Soul Patch & Chin Goatee */}
        <path d="M74,202 Q160,282 246,202 L240,316 L80,316 Z" fill="url(#stubble-pat)" opacity="0.88" />
        <path
          d="M126,237 Q160,221 194,237 L186,250 Q160,240 134,250 Z"
          fill="#131316"
          opacity="0.86"
        />
        <path
          d="M128,266 Q160,276 192,266 L184,316 Q160,322 136,316 Z"
          fill="#131316"
          opacity="0.86"
        />
        <path d="M156,258 L164,258 L162,270 L158,270 Z" fill="#131316" opacity="0.82" />
      </g>
    );
  }

  if (enemy.bossId === 'geralt') {
    return (
      <g className="pointer-events-none">
        {/* Trimmed Salt-and-Pepper / Silver-White Witcher Beard */}
        <path
          d="M76,204 Q112,248 160,242 Q208,248 244,204 L234,316 Q160,328 86,316 Z"
          fill="#cbd5e1"
          opacity="0.86"
        />
        <path
          d="M76,204 Q112,248 160,242 Q208,248 244,204 L234,316 Q160,328 86,316 Z"
          fill="url(#hair-depth-grad)"
          opacity="0.72"
        />
        <path
          d="M128,236 Q160,222 192,236 L186,246 Q160,238 134,246 Z"
          fill="#e2e8f0"
          opacity="0.9"
        />
        <path
          d="M94,242 L98,274 M114,258 L117,294 M226,242 L222,274 M206,258 L203,294"
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.45"
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (enemy.bossId === 'arthur_morgan') {
    return (
      <g className="pointer-events-none">
        {/* Realistic RDR2 Contoured Level-3 Outlaw Beard: preserves strong cheekbone plane with natural cheek fade */}
        <path d="M72,188 Q160,242 248,188 L238,318 L82,318 Z" fill="url(#stubble-pat)" opacity="0.72" />
        {/* Contoured Sideburn-to-Jaw Beard Silhouette (keeps upper cheeks sculpted and natural) */}
        <path
          d="M72,156 L82,162 C85,196 98,226 128,242 Q160,252 192,242 C222,226 235,196 238,162 L248,156 L246,232 C238,274 210,312 160,322 C110,312 82,274 74,232 Z"
          fill="#3d2614"
          opacity="0.88"
        />
        <path
          d="M72,156 L82,162 C85,196 98,226 128,242 Q160,252 192,242 C222,226 235,196 238,162 L248,156 L246,232 C238,274 210,312 160,322 C110,312 82,274 74,232 Z"
          fill="url(#hair-depth-grad)"
          opacity="0.78"
        />
        {/* Sculpted Thick Chestnut Outlaw Mustache + Soul Patch + Chin Shadow */}
        <path
          d="M116,237 Q160,219 204,237 Q192,250 160,243 Q128,250 116,237 Z"
          fill="#331e0f"
          stroke="#1f1107"
          strokeWidth="0.9"
        />
        <path d="M153,273 L167,273 L164,292 L156,292 Z" fill="#2e1b0d" opacity="0.92" />
        {/* Multi-tone Chestnut & Sun-Bleached Beard Whiskers for 3D Hair Texture */}
        <path
          d="M84,196 L92,238 M96,232 L106,276 M116,256 L124,298 M138,278 L142,314 M160,288 L160,320 M182,278 L178,314 M204,256 L196,298 M224,232 L214,276 M236,196 L228,238"
          stroke="#8a5e39"
          strokeWidth="1.35"
          opacity="0.5"
          strokeLinecap="round"
        />
        <path
          d="M124,235 Q142,229 156,236 M196,235 Q178,229 164,236 M106,258 L114,286 M214,258 L206,286"
          stroke="#b38458"
          strokeWidth="1"
          opacity="0.34"
          strokeLinecap="round"
        />
      </g>
    );
  }

  // Custom tailored facial hair for YouTuber mini-bosses
  switch (enemy.miniBossId) {
    case 'casimiro':
      return (
        <g className="pointer-events-none">
          {/* Neat dark trimmed full beard & mustache contouring Casimiro's wide chubby cheeks & double jaw */}
          <path
            d="M54,196 Q104,244 160,238 Q216,244 266,196 L254,284 Q216,324 160,326 Q104,324 66,284 Z"
            fill="url(#stubble-pat)"
            opacity="0.55"
          />
          <path
            d="M56,204 Q102,248 160,242 Q218,248 264,204 L252,282 Q212,320 160,322 Q108,320 68,282 Z"
            fill="#1f1612"
            opacity="0.88"
          />
          <path
            d="M56,204 Q102,248 160,242 Q218,248 264,204 L252,282 Q212,320 160,322 Q108,320 68,282 Z"
            fill="url(#hair-depth-grad)"
            opacity="0.65"
          />
          <path d="M124,236 Q160,222 196,236 L190,246 Q160,237 130,246 Z" fill="#17100c" opacity="0.92" />
          <path d="M154,258 L166,258 L163,270 L157,270 Z" fill="#17100c" opacity="0.88" />
        </g>
      );

    case 'luccas_neto':
      return (
        <g className="pointer-events-none">
          {/* Short trimmed dark-brown beard & mustache framing chubby cheeks */}
          <path
            d="M64,202 Q108,244 160,240 Q212,244 256,202 L244,282 Q206,318 160,320 Q114,318 76,282 Z"
            fill="#2b1e17"
            opacity="0.76"
          />
          <path
            d="M64,202 Q108,244 160,240 Q212,244 256,202 L244,282 Q206,318 160,320 Q114,318 76,282 Z"
            fill="url(#stubble-pat)"
            opacity="0.55"
          />
          <path d="M127,236 Q160,223 193,236 L186,245 Q160,237 134,245 Z" fill="#231712" opacity="0.86" />
        </g>
      );

    case 'whindersson':
      return (
        <g className="pointer-events-none">
          {/* Characteristic light sparse mustache & light chin whiskers (NOT a heavy lumberjack beard) */}
          <path d="M118,244 Q160,268 202,244 L190,316 L130,316 Z" fill="url(#stubble-pat)" opacity="0.48" />
          <path
            d="M128,236 Q146,227 160,234 Q174,227 192,236 Q182,243 160,239 Q138,243 128,236 Z"
            fill="#1f1916"
            opacity="0.84"
          />
          <path
            d="M144,274 Q160,282 176,274 L172,312 Q160,316 148,312 Z"
            fill="#1f1916"
            opacity="0.56"
          />
        </g>
      );

    case 'davy_jones':
      return (
        <g className="pointer-events-none">
          {/* 2015 Davy Jones fuller chin/jaw stubble + defined mustache & goatee */}
          <path d="M68,204 Q160,284 252,204 L240,317 L80,317 Z" fill="url(#stubble-pat)" opacity="0.62" />
          <path d="M126,236 Q160,222 194,236 L187,246 Q160,238 133,246 Z" fill="#241913" opacity="0.8" />
          <path d="M135,266 Q160,275 185,266 L180,315 Q160,320 140,315 Z" fill="#241913" opacity="0.78" />
        </g>
      );

    case 'kleberiano':
      return (
        <g className="pointer-events-none">
          {/* Light casual streamer jaw stubble & faint young mustache */}
          <path d="M78,214 Q160,280 242,214 L232,315 L88,315 Z" fill="url(#stubble-pat)" opacity="0.45" />
          <path d="M134,237 Q160,228 186,237 L180,242 Q160,236 140,242 Z" fill="#2b1e17" opacity="0.38" />
        </g>
      );

    case 'smzinho':
      return (
        <g className="pointer-events-none">
          {/* Thick dark full Smzinho beard contrasting strongly against blue skin */}
          <path
            d="M68,196 Q110,242 160,238 Q210,242 252,196 L242,292 Q204,322 160,324 Q116,322 78,292 Z"
            fill="#0f172a"
            opacity="0.94"
          />
          <path
            d="M68,196 Q110,242 160,238 Q210,242 252,196 L242,292 Q204,322 160,324 Q116,322 78,292 Z"
            fill="url(#hair-depth-grad)"
            opacity="0.72"
          />
          <path d="M122,235 Q160,219 198,235 L190,248 Q160,238 130,248 Z" fill="#090d16" opacity="0.96" />
        </g>
      );

    default:
      break;
  }

  return null;
};

/**
 * Foreground sculpted multi-layered hair locks rendered inside hairParallaxRef
 * (and bounced via sculptedHairGroupRef) above the eyes/forehead.
 */
export const BossSculptedHair: React.FC<{ enemy: EnemyProfile }> = ({ enemy }) => {
  switch (enemy.bossId) {
    case 'trevor_gta5':
      return (
        <g className="pointer-events-none">
          {/* Signature GTA V Trevor M-Shaped Receding Hairline + Sparse Disheveled Center Tuft & Greasy Temple Wings */}
          {/* Thinning Central Island Crown Tuft */}
          <path
            d="M128,44 C138,32 182,32 192,44 C186,58 176,66 168,62 L160,72 L152,60 C142,66 134,58 128,44 Z"
            fill="url(#trevor-hair-grad)"
            stroke="#0e0805"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          {/* Deep M-Receding Temple Hairline (exposing wide shiny forehead on left & right) */}
          <path
            d="M70,124 C66,86 78,52 104,40 C98,58 92,78 86,104 L76,126 Z"
            fill="url(#trevor-hair-grad)"
            stroke="#0e0805"
            strokeWidth="1.1"
          />
          <path
            d="M250,124 C254,86 242,52 216,40 C222,58 228,78 234,104 L244,126 Z"
            fill="url(#trevor-hair-grad)"
            stroke="#0e0805"
            strokeWidth="1.1"
          />
          {/* Messy Greasy Stray Forehead Wisps & Sideburn Transition */}
          <path
            d="M138,48 Q144,64 139,78 M160,42 Q162,62 158,74 M178,46 Q184,62 182,74 M82,74 Q74,94 74,116 M238,74 Q246,94 246,116"
            fill="none"
            stroke="#3a291e"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path
            d="M148,40 Q158,48 168,40 M88,64 Q82,82 80,98 M232,64 Q238,82 240,98"
            fill="none"
            stroke="#6e5440"
            strokeWidth="1.2"
            opacity="0.44"
            strokeLinecap="round"
          />
        </g>
      );

    case 'john_wick':
      return (
        <g className="pointer-events-none">
          {/* Sleek Center-Parted Dark Crown + Swept-Back Side Locks */}
          <path
            d="M66,120 C66,48 106,24 160,24 C214,24 254,48 254,120 C240,82 214,58 164,54 L160,68 L156,54 C106,58 80,82 66,120 Z"
            fill="url(#wick-hair-grad)"
            stroke="#050507"
            strokeWidth="1.4"
          />
          {/* Iconic Damp Temple-Framing Strands & Loose Forehead Wisps */}
          <path
            d="M84,66 C70,106 66,158 76,204 C80,174 82,138 92,98 Z"
            fill="url(#wick-hair-grad)"
          />
          <path
            d="M236,66 C250,106 254,158 244,204 C240,174 238,138 228,98 Z"
            fill="url(#wick-hair-grad)"
          />
          <path
            d="M108,52 Q92,88 88,128 Q98,98 114,64 Z M212,52 Q228,88 232,128 Q222,98 206,64 Z"
            fill="#141418"
          />
          <path
            d="M144,48 Q128,78 122,108 Q132,84 148,58 Z M168,48 Q182,76 184,104 Q176,80 164,58 Z"
            fill="#18181b"
          />
          <path
            d="M114,42 Q132,36 148,44 M172,44 Q190,36 206,42"
            fill="none"
            stroke="#52525b"
            strokeWidth="1.8"
            opacity="0.52"
            strokeLinecap="round"
          />
        </g>
      );

    case 't800':
      return (
        <g className="pointer-events-none">
          {/* Iconic 1991 T-800 Military Flat-Top Crew Cut (with battle-torn right temple notch) */}
          <path
            d="M70,118 L73,54 L86,28 L228,28 L244,52 L246,74 L224,62 L214,72 L184,60 L160,72 L126,64 L92,76 Z"
            fill="#27201b"
            stroke="#09090b"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M86,32 L228,32 M82,42 L232,42 M94,52 L176,52"
            stroke="#6b5c50"
            strokeWidth="1.8"
            opacity="0.38"
            strokeLinecap="round"
          />
        </g>
      );

    case 'wolverine':
      return (
        <g className="pointer-events-none">
          {/* Fierce Low-Peaked Widow's Peak + Swept-Out Side-Wing Crown */}
          <path
            d="M66,122 C62,54 96,32 142,42 L160,84 L178,42 C224,32 258,54 254,122 C244,86 218,70 184,74 L160,92 L136,74 C102,70 76,86 66,122 Z"
            fill="url(#wolverine-hair-grad)"
            stroke="#050507"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Foreground Flared Wolf Brow Tufts & Coarse Bristle Lines */}
          <path
            d="M44,38 L76,66 M34,48 L70,74 M276,38 L244,66 M286,48 L250,74 M114,44 L140,72 M206,44 L180,72 M126,56 L148,80 M194,56 L172,80"
            stroke="#6b635e"
            strokeWidth="1.5"
            opacity="0.52"
            strokeLinecap="round"
          />
        </g>
      );

    case 'geralt':
      return (
        <g className="pointer-events-none">
          {/* Swept-Back Silver-White Crown + Signature Loose Strand Over Right Brow */}
          <path
            d="M68,120 C68,50 108,28 160,28 C212,28 252,50 252,120 C238,84 206,64 160,64 C114,64 82,84 68,120 Z"
            fill="url(#geralt-hair-grad)"
            stroke="#475569"
            strokeWidth="1.3"
          />
          {/* Loose Silver Temple Strands + Iconic Right-Forehead Hanging Witcher Lock */}
          <path
            d="M88,68 C74,104 72,152 84,188 C86,158 88,122 98,84 Z"
            fill="url(#geralt-hair-grad)"
            stroke="#64748b"
            strokeWidth="0.9"
          />
          <path
            d="M232,68 C246,104 248,152 236,188 C234,158 232,122 222,84 Z"
            fill="url(#geralt-hair-grad)"
            stroke="#64748b"
            strokeWidth="0.9"
          />
          <path
            d="M206,52 C220,76 226,110 220,142 C226,116 222,84 212,56 Z"
            fill="#f8fafc"
            stroke="#64748b"
            strokeWidth="0.7"
          />
          <path
            d="M114,44 Q160,36 206,44 M102,56 Q160,48 218,56"
            fill="none"
            stroke="#64748b"
            strokeWidth="1.6"
            opacity="0.45"
            strokeLinecap="round"
          />
        </g>
      );

    case 'joker':
      return (
        <g className="pointer-events-none">
          {/* Wild Greasy Emerald-Green Asymmetric Slicked-Back Waves + Forehead Curls */}
          <path
            d="M66,120 C60,54 98,22 158,24 C218,22 260,54 254,120 C238,84 212,68 164,70 C112,70 82,84 66,120 Z"
            fill="url(#joker-hair-grad)"
            stroke="#091504"
            strokeWidth="1.3"
          />
          {/* Iconic Dark Knight Sweeping Side Green Curl Lock */}
          <path
            d="M188,46 C206,68 210,104 198,136 C214,112 214,76 198,48 Z"
            fill="url(#joker-hair-grad)"
            stroke="#091504"
            strokeWidth="1"
          />
          <path
            d="M126,56 Q110,82 118,108 Q102,90 110,64 Z M172,54 Q186,82 178,104 Q194,84 184,58 Z"
            fill="#274714"
            stroke="#091504"
            strokeWidth="0.9"
          />
          <path
            d="M96,46 Q128,32 162,42 Q196,30 226,48"
            fill="none"
            stroke="#84cc16"
            strokeWidth="1.6"
            opacity="0.32"
            strokeLinecap="round"
          />
        </g>
      );

    case 'arthur_morgan':
      return (
        <g className="pointer-events-none">
          {/* Layered Shaggy Chestnut Outlaw Hair Spilling Around Temples & Forehead Edges Beneath Hat */}
          <path
            d="M72,72 C62,108 64,148 74,180 C78,154 80,122 86,88 Z"
            fill="url(#arthur-hair-grad)"
            stroke="#1f1107"
            strokeWidth="1.05"
          />
          <path
            d="M84,74 C76,98 76,124 82,148 C86,126 90,104 98,84 Z"
            fill="url(#arthur-hair-light)"
          />
          <path
            d="M248,72 C258,108 256,148 246,180 C242,154 240,122 234,88 Z"
            fill="url(#arthur-hair-grad)"
            stroke="#1f1107"
            strokeWidth="1.05"
          />
          <path
            d="M236,74 C244,98 244,124 238,148 C234,126 230,104 222,84 Z"
            fill="url(#arthur-hair-light)"
          />
          {/* Subtle loose frontier forelock wisps right beneath hat brim */}
          <path
            d="M104,76 Q96,92 94,106 M216,76 Q224,92 226,106 M74,102 Q70,132 76,162 M246,102 Q250,132 244,162"
            fill="none"
            stroke="#a6774c"
            strokeWidth="1.2"
            opacity="0.54"
            strokeLinecap="round"
          />
        </g>
      );

    default:
      switch (enemy.miniBossId) {
        case 'davy_jones':
          return (
            <g className="pointer-events-none">
              {/* 2015 Davy Jones dark hair locks peeking at temples & forehead beneath backward cap */}
              <path
                d="M64,120 C64,86 76,66 94,58 C124,72 196,72 226,58 C244,66 256,86 256,120 C244,92 226,78 196,74 C160,72 124,72 90,80 C78,90 70,104 64,120 Z"
                fill="#211711"
                stroke="#0f0a07"
                strokeWidth="1.2"
              />
              <path
                d="M96,68 Q128,76 160,73 Q192,76 224,68"
                fill="none"
                stroke="#453328"
                strokeWidth="1.4"
                opacity="0.48"
                strokeLinecap="round"
              />
            </g>
          );

        case 'felipe_neto':
          return (
            <g className="pointer-events-none">
              {/* Iconic 2010 "Não Faz Sentido" high dynamic spiky brown/espresso rock topete */}
              <path
                d="M70,116 C68,66 92,36 128,28 L142,10 L162,22 L182,8 L198,26 C230,36 252,66 250,116 C238,82 214,62 182,58 C148,56 102,70 70,116 Z"
                fill="#332014"
                stroke="#140b05"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              {/* Spiked front volume ridges */}
              <path
                d="M116,56 C126,28 144,14 162,24 L178,12 C196,24 206,42 206,58 C184,48 144,48 116,56 Z"
                fill="#4a301f"
                stroke="#190e07"
                strokeWidth="1"
              />
              <path
                d="M140,22 Q154,34 148,50 M178,18 Q174,36 184,52 M124,42 Q156,34 196,42"
                fill="none"
                stroke="#7c553c"
                strokeWidth="1.45"
                opacity="0.52"
                strokeLinecap="round"
              />
            </g>
          );

        case 'whindersson':
          return (
            <g className="pointer-events-none">
              {/* Unmistakable 2016–2017 peak-hype straight voluminous "cabelo de tigela" bowl fringe */}
              <path
                d="M66,118 C62,48 102,22 160,22 C218,22 258,48 254,118 C240,92 222,78 198,84 C166,92 122,92 84,84 C74,94 70,106 66,118 Z"
                fill="#191411"
                stroke="#070504"
                strokeWidth="1.25"
              />
              {/* Heavy smooth layered straight bangs sweeping evenly across forehead */}
              <path
                d="M78,80 C94,48 128,36 164,38 C202,38 232,54 244,86 C214,76 178,84 140,86 C112,86 92,82 78,80 Z"
                fill="#241c18"
                stroke="#090705"
                strokeWidth="0.9"
              />
              <path
                d="M108,42 Q104,64 98,82 M132,38 Q130,62 128,84 M158,36 Q158,62 158,84 M184,38 Q186,62 188,82 M210,44 Q216,64 222,80"
                fill="none"
                stroke="#4a3c35"
                strokeWidth="1.5"
                opacity="0.46"
                strokeLinecap="round"
              />
            </g>
          );

        case 'kleberiano':
          return (
            <g className="pointer-events-none">
              {/* Signature Kleberiano tall M-receding "calvo" forehead hairline + dark tousled crown volume */}
              <path
                d="M69,118 C67,82 76,56 96,46 C94,64 88,84 82,110 Z M251,118 C253,82 244,56 224,46 C226,64 232,84 238,110 Z"
                fill="#211814"
                stroke="#0e0a08"
                strokeWidth="1.1"
              />
              {/* Voluminous dark tousled center-crown crest leaving tall temples slightly exposed */}
              <path
                d="M104,52 C118,22 146,16 164,20 C184,16 208,24 216,52 C196,42 178,46 160,54 C142,46 124,42 104,52 Z"
                fill="#241a15"
                stroke="#0e0a08"
                strokeWidth="1.2"
              />
              <path
                d="M122,36 Q142,26 160,34 Q180,26 198,36 M134,44 Q160,38 186,44"
                fill="none"
                stroke="#523f35"
                strokeWidth="1.5"
                opacity="0.46"
                strokeLinecap="round"
              />
            </g>
          );

        case 'alanzoka':
          return (
            <g className="pointer-events-none">
              {/* Signature Alanzoka voluminous chestnut hair + iconic side-swept bangs peeking beneath headset */}
              <path
                d="M68,120 C66,52 106,24 160,24 C214,24 254,52 252,120 C242,88 220,74 196,76 C166,86 124,90 88,82 C78,94 72,106 68,120 Z"
                fill="#3c2718"
                stroke="#180e08"
                strokeWidth="1.25"
              />
              {/* Iconic layered diagonal side-swept franja toward viewer's right */}
              <path
                d="M90,56 C126,48 168,54 204,72 C178,88 140,92 102,84 C94,76 90,66 90,56 Z"
                fill="#4e3422"
                stroke="#1b1009"
                strokeWidth="0.95"
              />
              <path
                d="M114,78 Q144,86 180,78 M142,42 Q176,38 208,54 M108,62 Q146,58 186,70"
                fill="none"
                stroke="#7d5940"
                strokeWidth="1.55"
                opacity="0.48"
                strokeLinecap="round"
              />
            </g>
          );

        case 'casimiro':
          return (
            <g className="pointer-events-none">
              {/* Short neat tapered dark-brown hair framing Casimiro's wide cranium (no cap!) */}
              <path
                d="M60,122 C58,52 100,26 160,26 C220,26 262,52 260,122 C246,84 216,64 160,64 C104,64 74,84 60,122 Z"
                fill="#1c1512"
                stroke="#0c0806"
                strokeWidth="1.25"
              />
              <path
                d="M106,46 Q160,34 214,46 M94,58 Q160,48 226,58"
                fill="none"
                stroke="#45352d"
                strokeWidth="1.5"
                opacity="0.44"
                strokeLinecap="round"
              />
            </g>
          );

        case 'smzinho':
          return (
            <g className="pointer-events-none">
              {/* Ultra-short buzzed / close-shaved dark scalp line */}
              <path
                d="M68,116 C70,56 110,34 160,34 C210,34 250,56 252,116 C238,84 208,70 160,70 C112,70 82,84 68,116 Z"
                fill="#0f172a"
                opacity="0.76"
              />
              <path
                d="M68,116 C70,56 110,34 160,34 C210,34 250,56 252,116 C238,84 208,70 160,70 C112,70 82,84 68,116 Z"
                fill="url(#stubble-pat)"
                opacity="0.6"
              />
            </g>
          );

        case 'cellbit':
          return (
            <g className="pointer-events-none">
              {/* Iconic Cellbit dirty-blonde / light caramel messy parted curtains/fringe */}
              <path
                d="M68,120 C65,50 104,22 160,22 C216,22 255,50 252,120 C238,84 214,62 174,56 L160,74 L146,56 C106,62 82,84 68,120 Z"
                fill="#98693c"
                stroke="#4d3016"
                strokeWidth="1.2"
              />
              {/* Loose parted dirty-blonde curtain strands framing brows */}
              <path d="M148,46 C130,68 116,92 110,118 C124,98 138,76 154,58 Z" fill="#b07c49" />
              <path d="M172,46 C190,68 204,92 210,118 C196,98 182,76 166,58 Z" fill="#b07c49" />
              <path
                d="M110,44 Q134,36 152,46 M168,46 Q186,36 210,44 M126,64 Q116,86 112,108 M194,64 Q204,86 208,108"
                fill="none"
                stroke="#cfa06d"
                strokeWidth="1.5"
                opacity="0.55"
                strokeLinecap="round"
              />
            </g>
          );

        case 'luccas_neto':
          return (
            <g className="pointer-events-none">
              {/* Messy dark-brown tufts & sideburns peeking out beneath Luccas Neto's iconic royal-blue beanie */}
              <path
                d="M64,120 C64,88 74,70 92,66 L108,82 L94,86 C82,92 72,106 64,120 Z M256,120 C256,88 246,70 228,66 L212,82 L226,86 C238,92 248,106 256,120 Z"
                fill="#261b15"
                stroke="#0e0a07"
                strokeWidth="1.1"
              />
              {/* Playful forehead wisps escaping under beanie rim */}
              <path
                d="M104,68 Q112,82 106,90 M136,68 Q144,80 140,88 M176,68 Q182,80 178,88 M208,68 Q214,82 210,90"
                fill="none"
                stroke="#382820"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </g>
          );

        default:
          return null;
      }
  }
};

/**
 * Detailed 3D-sculpted Arthur Morgan Gambler Hat + Wolverine chewed cigar.
 */
export const BossTopAccessories: React.FC<{
  enemy: EnemyProfile;
  mood: 'smug' | 'angry' | 'crying' | 'dazed' | 'ko';
  damageStage: number;
  trauma: TraumaState;
}> = ({ enemy, mood, damageStage, trauma }) => {
  if (enemy.bossId === 'wolverine' && mood !== 'ko' && !trauma.jawFractured) {
    return (
      <g className="pointer-events-none" transform="translate(186, 248) rotate(13)">
        {/* Chewed Smoldering Cigar in Mouth Corner */}
        <path d="M0,-3.2 L35,-3.6 L35,3.6 L0,3.2 Z" fill="#5c361a" stroke="#1f1006" strokeWidth="1.15" />
        <path d="M7,-2.6 L10,2.6 M17,-2.8 L20,2.8 M26,-3 L28,3" stroke="#3b200d" strokeWidth="1.05" opacity="0.68" />
        <path d="M31,-3.6 L37,-3 L37,3 L31,3.6 Z" fill="#9ca3af" stroke="#374151" strokeWidth="0.85" />
        <circle cx="36" cy="0" r="2.4" fill="#f97316" />
        <circle cx="36.6" cy="0" r="1.2" fill="#fef08a" />
        <path d="M37,-4 Q43,-13 38,-22 Q34,-30 41,-39" fill="none" stroke="#cbd5e1" strokeWidth="1.9" opacity="0.38" strokeLinecap="round" filter="url(#soft-blur)" />
      </g>
    );
  }

  if (enemy.bossId === 'arthur_morgan') {
    return (
      <g
        className="pointer-events-none"
        transform={
          mood === 'ko'
            ? 'translate(-7, -3) rotate(-9 160 66)'
            : damageStage >= 3
              ? 'translate(3, 0) rotate(3.6 160 66)'
              : undefined
        }
      >
        {/* Realistic Cast Brim Shadow across Upper Forehead */}
        <path
          d="M54,74 Q160,104 266,74 Q224,96 160,98 Q96,96 54,74 Z"
          fill="#090503"
          opacity="0.68"
          filter="url(#soft-blur)"
        />
        {/* Pinched Weathered Leather Gambler Crown with Authentic Side Dents & Center Crease */}
        <path
          d="M80,68 L97,18 Q128,8 160,16 Q192,8 223,18 L240,68 Z"
          fill="url(#arthur-hat-leather)"
          stroke="#080605"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
        <path d="M160,16 L160,48" stroke="#080605" strokeWidth="3.6" opacity="0.68" strokeLinecap="round" />
        <path d="M106,32 Q126,23 146,34 M174,34 Q194,23 214,32" fill="none" stroke="#78675b" strokeWidth="1.9" opacity="0.46" strokeLinecap="round" />
        {/* Multi-Strand Twisted Rawhide Rope Hatband + Signature Left Side Knot */}
        <path
          d="M81,62 Q160,76 239,62 L240,70 Q160,84 80,70 Z"
          fill="#5c381f"
          stroke="#1c0f06"
          strokeWidth="1.25"
        />
        <path
          d="M86,66 L102,69 M112,70 L128,72 M138,73 L154,74 M166,74 L182,73 M192,72 L208,70 M218,69 L234,66"
          stroke="#b88152"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.84"
        />
        <circle cx="94" cy="66" r="4.6" fill="#4f2f19" stroke="#1c0f06" strokeWidth="1.1" />
        {/* Wide Sweeping & Gently Upturned Weathered Gambler Brim */}
        <path
          d="M16,56 C48,88 108,94 160,90 C212,94 272,88 304,56 C276,50 252,55 239,64 Q160,82 81,64 C68,55 44,50 16,56 Z"
          fill="url(#arthur-hat-leather)"
          stroke="#050404"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
        {/* Distressed Worn Leather Brim Rim Highlight & Crease Wear */}
        <path
          d="M28,59 C66,85 116,89 160,86 C204,89 254,85 292,59"
          fill="none"
          stroke="#968476"
          strokeWidth="1.5"
          opacity="0.52"
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (enemy.miniBossId === 'davy_jones' || enemy.miniBossId === 'alanzoka') {
    const isDavy = enemy.miniBossId === 'davy_jones';
    const ledColor = isDavy ? '#22d3ee' : '#f97316';
    const tiltTransform =
      mood === 'ko'
        ? 'translate(-5, 4) rotate(-8 160 150)'
        : damageStage >= 3
          ? 'rotate(3.2 160 150)'
          : undefined;
    const cupXLeft = isDavy ? 39 : 44;
    const cupXRight = isDavy ? 261 : 254;
    return (
      <g className="pointer-events-none" transform={tiltTransform}>
        {/* 2015 Davy Jones iconic backward cap (boné virado pra trás) */}
        {isDavy && (
          <g>
            {/* Cap Dome */}
            <path
              d="M68,68 C70,22 108,12 160,12 C212,12 250,22 252,68 Q160,56 68,68 Z"
              fill="#18181b"
              stroke="#09090b"
              strokeWidth="2"
            />
            <path d="M114,18 Q118,40 116,58 M206,18 Q202,40 204,58" fill="none" stroke="#27272a" strokeWidth="1.2" opacity="0.7" />
            {/* Snapback keyhole & crimson adjustment strap across forehead */}
            <path
              d="M124,56 C132,36 188,36 196,56 Q160,52 124,56 Z"
              fill="#e3b597"
              stroke="#18181b"
              strokeWidth="1.6"
            />
            <rect x="130" y="51" width="60" height="7" rx="3" fill="#b91c1c" stroke="#09090b" strokeWidth="1.1" />
            <circle cx="148" cy="54.5" r="1.2" fill="#09090b" />
            <circle cx="156" cy="54.5" r="1.2" fill="#09090b" />
            <circle cx="164" cy="54.5" r="1.2" fill="#09090b" />
            <circle cx="172" cy="54.5" r="1.2" fill="#09090b" />
            {/* Backward cap brim peaking behind crown corners */}
            <path
              d="M236,34 C258,28 274,34 276,46 C268,54 252,56 244,50 Z"
              fill="#991b1b"
              stroke="#09090b"
              strokeWidth="1.6"
            />
          </g>
        )}

        {/* Sleek Studio Over-Ear Gaming Headset */}
        <path
          d="M52,154 C52,58 92,16 160,16 C228,16 268,58 268,154"
          fill="none"
          stroke="#18181b"
          strokeWidth="10.5"
          strokeLinecap="round"
        />
        <path
          d="M54,144 C56,56 95,18 160,18 C225,18 264,56 266,144"
          fill="none"
          stroke={isDavy ? '#3f3f46' : '#dc2626'}
          strokeWidth="2.8"
          opacity={isDavy ? '0.7' : '0.82'}
          strokeLinecap="round"
        />
        {/* Padded Earcups + Accent Trim */}
        <rect x={cupXLeft} y="140" width="20" height="54" rx="9" fill="#18181b" stroke="#09090b" strokeWidth="1.6" />
        <rect x={cupXRight} y="140" width="20" height="54" rx="9" fill="#18181b" stroke="#09090b" strokeWidth="1.6" />
        <rect x={cupXLeft + 3.5} y="150" width="4.5" height="34" rx="2.2" fill={ledColor} opacity="0.88" />
        <rect x={cupXRight + 12} y="150" width="4.5" height="34" rx="2.2" fill={ledColor} opacity="0.88" />
        {/* Streamer Boom Microphone */}
        <path
          d="M54,184 Q72,226 116,244"
          fill="none"
          stroke="#27272a"
          strokeWidth="3.8"
          strokeLinecap="round"
        />
        <ellipse cx="120" cy="245" rx="7.5" ry="5" transform="rotate(14 120 245)" fill="#09090b" stroke="#52525b" strokeWidth="1.1" />

        {/* BOTH Davy Jones AND Alanzoka wear signature prescription glasses! */}
        <g transform={damageStage >= 2 ? 'rotate(-2.4 160 148)' : undefined}>
          <path d="M70,141 L88,142 M250,141 L232,142 M141,146 Q160,142 179,146" stroke="#18181b" strokeWidth="2.8" fill="none" />
          <rect
            x="88"
            y="134"
            width="53"
            height="28"
            rx={isDavy ? 5 : 8}
            fill="#e0f2fe"
            fillOpacity="0.1"
            stroke="#18181b"
            strokeWidth={isDavy ? 2.8 : 2.6}
          />
          <rect
            x="179"
            y="134"
            width="53"
            height="28"
            rx={isDavy ? 5 : 8}
            fill="#e0f2fe"
            fillOpacity="0.1"
            stroke="#18181b"
            strokeWidth={isDavy ? 2.8 : 2.6}
          />
          <path d="M94,138 L103,138 L93,149 Z M185,138 L194,138 L184,149 Z" fill="#ffffff" opacity="0.24" />
          {damageStage >= 2 && (
            <path d="M196,136 L205,148 L216,143 M205,148 L201,158" stroke="#e2e8f0" strokeWidth="1.25" opacity="0.82" fill="none" />
          )}
        </g>
      </g>
    );
  }

  if (enemy.miniBossId === 'felipe_neto') {
    return (
      <g
        className="pointer-events-none"
        transform={damageStage >= 2 ? 'rotate(-3.6 160 148)' : undefined}
      >
        {/* Iconic 2010 "Não Faz Sentido" thick black Wayfarer-style dark sunglasses */}
        <path d="M70,139 L86,140 M250,139 L234,140 M142,143 Q160,139 178,143" stroke="#09090b" strokeWidth="4.2" fill="none" />
        <path
          d="M84,132 L144,134 L141,161 Q113,166 88,159 Z"
          fill="#09090b"
          fillOpacity={damageStage >= 3 ? '0.72' : '0.94'}
          stroke="#18181b"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        <path
          d="M236,132 L176,134 L179,161 Q207,166 232,159 Z"
          fill="#09090b"
          fillOpacity={damageStage >= 3 ? '0.72' : '0.94'}
          stroke="#18181b"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        {/* Crisp studio glossy slash reflection */}
        <path d="M92,136 L105,136 L92,152 Z M184,136 L197,136 L184,152 Z" fill="#ffffff" opacity="0.26" />
        {/* Silver corner Wayfarer rivet pins */}
        <circle cx="88" cy="136" r="1.4" fill="#e2e8f0" />
        <circle cx="232" cy="136" r="1.4" fill="#e2e8f0" />
        {damageStage >= 2 && (
          <path d="M196,136 L205,149 L219,144 M205,149 L200,160" stroke="#e2e8f0" strokeWidth="1.3" opacity="0.85" fill="none" />
        )}
      </g>
    );
  }

  if (enemy.miniBossId === 'kleberiano') {
    return (
      <g
        className="pointer-events-none"
        transform={damageStage >= 2 ? 'rotate(-2.8 160 148)' : undefined}
      >
        {/* Lightweight casual black/purple streamer headset + iconic thick dark-framed glasses */}
        <path
          d="M54,154 C54,60 94,18 160,18 C226,18 266,60 266,154"
          fill="none"
          stroke="#18181b"
          strokeWidth="8.5"
          strokeLinecap="round"
        />
        <rect x="46" y="142" width="18" height="48" rx="8" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
        <rect x="256" y="142" width="18" height="48" rx="8" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
        <rect x="49" y="152" width="4" height="28" rx="2" fill="#a855f7" opacity="0.85" />
        <rect x="267" y="152" width="4" height="28" rx="2" fill="#a855f7" opacity="0.85" />
        {/* Signature bold black prescription glasses */}
        <path d="M70,141 L87,142 M250,141 L233,142 M141,145 Q160,141 179,145" stroke="#09090b" strokeWidth="3.2" fill="none" />
        <rect
          x="87"
          y="133"
          width="54"
          height="30"
          rx="9"
          fill="#e0f2fe"
          fillOpacity="0.1"
          stroke="#09090b"
          strokeWidth="3.4"
        />
        <rect
          x="179"
          y="133"
          width="54"
          height="30"
          rx="9"
          fill="#e0f2fe"
          fillOpacity="0.1"
          stroke="#09090b"
          strokeWidth="3.4"
        />
        <path d="M93,137 L104,137 L93,149 Z M185,137 L196,137 L185,149 Z" fill="#ffffff" opacity="0.24" />
        {damageStage >= 2 && (
          <path d="M196,135 L205,149 L218,144" stroke="#e2e8f0" strokeWidth="1.25" opacity="0.85" fill="none" />
        )}
      </g>
    );
  }

  if (enemy.miniBossId === 'luccas_neto') {
    return (
      <g
        className="pointer-events-none"
        transform={
          mood === 'ko'
            ? 'translate(-5, -2) rotate(-7 160 56)'
            : damageStage >= 3
              ? 'translate(2, 0) rotate(3.5 160 56)'
              : undefined
        }
      >
        {/* Luccas Neto ICONIC Royal-Blue Knit Beanie ("Gorro Azul") */}
        <path
          d="M62,82 Q160,92 258,82 Q212,92 160,92 Q108,92 62,82 Z"
          fill="#090d1a"
          opacity="0.34"
          filter="url(#soft-blur)"
        />
        <path
          d="M66,76 C66,26 106,10 160,10 C214,10 254,26 254,76 Q160,82 66,76 Z"
          fill="#2563eb"
          stroke="#1e3a8a"
          strokeWidth="2"
        />
        {/* Vertical Knit Beanie Ribs */}
        <path
          d="M100,22 Q94,48 92,72 M130,14 Q126,44 126,74 M160,12 L160,74 M190,14 Q194,44 194,74 M220,22 Q226,48 228,72"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="2.4"
          opacity="0.65"
          strokeLinecap="round"
        />
        {/* Thick Folded Ribbed Knit Cuff */}
        <path
          d="M62,68 Q160,79 258,68 C258,82 254,88 248,90 Q160,98 72,90 C66,88 62,82 62,68 Z"
          fill="#1d4ed8"
          stroke="#1e3a8a"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M84,72 L84,88 M104,74 L104,90 M124,75 L124,91 M144,76 L144,92 M164,76 L164,92 M184,75 L184,91 M204,74 L204,90 M224,73 L224,89 M242,71 L242,87"
          stroke="#3b82f6"
          strokeWidth="1.5"
          opacity="0.52"
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (enemy.miniBossId === 'smzinho') {
    return (
      <g
        className="pointer-events-none"
        transform={damageStage >= 2 ? 'rotate(-3.5 160 148)' : undefined}
      >
        {/* Gamer headset + dark sunglasses (classic Azulão look) */}
        <path
          d="M54,154 C54,58 92,18 160,18 C228,18 266,58 266,154"
          fill="none"
          stroke="#18181b"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <rect x="44" y="140" width="20" height="54" rx="9" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
        <rect x="256" y="140" width="20" height="54" rx="9" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
        <path d="M72,140 L88,142 M248,140 L232,142 M141,146 Q160,141 179,146" stroke="#09090b" strokeWidth="3.4" fill="none" />
        <rect
          x="88"
          y="133"
          width="53"
          height="28"
          rx="6"
          fill="#09090b"
          fillOpacity="0.82"
          stroke="#18181b"
          strokeWidth="3.2"
        />
        <rect
          x="179"
          y="133"
          width="53"
          height="28"
          rx="6"
          fill="#09090b"
          fillOpacity="0.82"
          stroke="#18181b"
          strokeWidth="3.2"
        />
        <path d="M94,137 L106,137 L93,150 Z M185,137 L197,137 L184,150 Z" fill="#ffffff" opacity="0.22" />
        {damageStage >= 2 && (
          <path d="M196,135 L205,149 L219,144" stroke="#e2e8f0" strokeWidth="1.3" opacity="0.85" fill="none" />
        )}
        <path d="M56,184 Q78,228 118,246" fill="none" stroke="#18181b" strokeWidth="3.8" strokeLinecap="round" />
        <ellipse cx="121" cy="247" rx="7.5" ry="4.8" transform="rotate(14 121 247)" fill="#09090b" stroke="#38bdf8" strokeWidth="1" />
      </g>
    );
  }

  return null;
};

/**
 * Custom per-YouTuber outfits rendered in TargetFace torso group for instant likeness.
 */
export const MiniBossChestOutfit: React.FC<{ enemy: EnemyProfile }> = ({ enemy }) => {
  switch (enemy.miniBossId) {
    case 'davy_jones':
      return (
        <g>
          {/* 2015 GameplayRJ dark zip gamer hoodie over cyan/slate crew tee */}
          <path
            d="M2,424 C6,374 26,340 72,328 C88,324 102,324 114,324 Q160,358 206,324 C218,324 232,324 248,328 C294,340 314,374 318,424 Z"
            fill="#18181b"
            stroke="#09090b"
            strokeWidth="2.1"
          />
          <path d="M114,325 Q160,356 206,325 L196,424 L124,424 Z" fill="#0f172a" />
          <path d="M160,356 L160,424" stroke="#3f3f46" strokeWidth="2.4" />
          {/* Cyan Gamer Logo Accent on Chest */}
          <polygon points="204,372 222,382 204,392" fill="#22d3ee" opacity="0.88" />
          <path d="M98,326 C112,354 136,368 160,368 C184,368 208,354 222,326" fill="none" stroke="#27272a" strokeWidth="5" strokeLinecap="round" />
        </g>
      );

    case 'alanzoka':
      return (
        <g>
          {/* Classic Alanzoka dark charcoal streamer hoodie + red/orange chest trim */}
          <path
            d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 Q160,360 206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
            fill="#1c1917"
            stroke="#09090b"
            strokeWidth="2"
          />
          <path
            d="M96,326 C112,354 138,370 160,370 C182,370 208,354 224,326 Q160,354 96,326 Z"
            fill="#292524"
            stroke="#0c0a09"
            strokeWidth="1.6"
          />
          <path d="M142,366 Q138,392 141,416 M178,366 Q182,392 179,416" stroke="#f97316" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.92" />
          <path d="M62,382 L258,382" stroke="#ea580c" strokeWidth="3.2" opacity="0.72" />
        </g>
      );

    case 'kleberiano':
      return (
        <g>
          {/* Kleberiano dark violet-black hoodie + crisp silver chain */}
          <path
            d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 Q160,360 206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
            fill="#1e1b2e"
            stroke="#090710"
            strokeWidth="2"
          />
          <path
            d="M98,326 C114,354 138,368 160,368 C182,368 206,354 222,326 Q160,352 98,326 Z"
            fill="#312e81"
            stroke="#1e1b4b"
            strokeWidth="1.6"
          />
          <path d="M126,334 Q160,382 194,334" fill="none" stroke="#e2e8f0" strokeWidth="2.2" opacity="0.88" />
          <path d="M143,365 Q139,392 142,415 M177,365 Q181,392 178,415" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'casimiro':
      return (
        <g>
          {/* Broad heavy Vasco-inspired black jersey with iconic white diagonal sash */}
          <path
            d="M0,424 C4,372 24,338 70,326 C88,322 100,322 112,322 Q160,356 208,322 C220,322 232,322 250,326 C296,338 316,372 320,424 Z"
            fill="#141416"
            stroke="#050507"
            strokeWidth="2.1"
          />
          {/* Iconic Diagonal White Sash */}
          <path d="M62,330 L96,324 L254,424 L212,424 Z" fill="#f8fafc" opacity="0.95" />
          {/* Crimson Cross / Crest Hint */}
          <path d="M168,370 L176,370 L176,386 L168,386 Z M164,374 L180,374 L180,382 L164,382 Z" fill="#b91c1c" />
          {/* White Ribbed Crew Collar */}
          <path d="M106,322 Q160,358 214,322" fill="none" stroke="#f8fafc" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M104,326 Q160,364 216,326" fill="none" stroke="#09090b" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );

    case 'luccas_neto':
      return (
        <g>
          {/* Luccas Neto iconic bright royal-blue sweatshirt / hoodie + cute white Seal ("Foca") chest emblem */}
          <path
            d="M2,424 C6,374 26,340 72,328 C88,324 102,324 114,324 Q160,358 206,324 C218,324 232,324 248,328 C294,340 314,374 318,424 Z"
            fill="#2563eb"
            stroke="#1e3a8a"
            strokeWidth="2"
          />
          <path
            d="M96,326 C112,354 138,368 160,368 C182,368 208,354 224,326 Q160,354 96,326 Z"
            fill="#1d4ed8"
            stroke="#1e3a8a"
            strokeWidth="1.6"
          />
          <path d="M142,364 Q138,392 141,416 M178,364 Q182,392 179,416" stroke="#f8fafc" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          {/* Cute Seal ("Foca") Circular Chest Badge */}
          <circle cx="204" cy="390" r="14" fill="#f8fafc" stroke="#1e40af" strokeWidth="1.6" />
          <ellipse cx="204" cy="391" rx="8.5" ry="6.5" fill="#93c5fd" />
          <circle cx="201" cy="389" r="1.3" fill="#0f172a" />
          <circle cx="207" cy="389" r="1.3" fill="#0f172a" />
          <ellipse cx="204" cy="392.5" rx="2.2" ry="1.4" fill="#1e293b" />
        </g>
      );

    case 'whindersson':
      return (
        <g>
          {/* Exposed collarbone/chest boxing tattoos + dark boxing ring tank-top */}
          <g opacity="0.56" style={{ mixBlendMode: 'multiply' }}>
            <path d="M118,342 L134,352 L126,364 M186,342 L202,348 M194,336 L190,358" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="152" cy="364" r="7" fill="none" stroke="#1e293b" strokeWidth="1.6" />
          </g>
          <path
            d="M42,424 C46,386 58,360 76,328 L104,326 C110,368 134,394 160,394 C186,394 210,368 216,326 L244,328 C262,360 274,386 278,424 Z"
            fill="#18181b"
            stroke="#09090b"
            strokeWidth="2"
          />
          <path d="M104,326 C110,368 134,394 160,394 C186,394 210,368 216,326" fill="none" stroke="#eab308" strokeWidth="2.8" />
        </g>
      );

    case 'felipe_neto':
      return (
        <g>
          {/* Iconic 2010 "Não Faz Sentido" open black collar blazer/jacket over dark rock tee */}
          <path
            d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 Q160,358 206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
            fill="#141416"
            stroke="#050507"
            strokeWidth="2"
          />
          <path d="M114,325 Q160,356 206,325 L190,424 L130,424 Z" fill="#27272a" />
          <polygon points="108,324 134,386 112,394 86,348" fill="#1f1f24" stroke="#09090b" strokeWidth="1.4" />
          <polygon points="212,324 186,386 208,394 234,348" fill="#1f1f24" stroke="#09090b" strokeWidth="1.4" />
          <path d="M114,325 Q160,360 206,325" fill="none" stroke="#52525b" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      );

    case 'cellbit':
      return (
        <g>
          {/* Paranormal Investigator dark coat + crisp collar & crimson Ordem Paranormal tie */}
          <path d="M108,324 L212,324 L184,424 L136,424 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
          <polygon points="152,350 168,350 163,366 157,366" fill="#7f1d1d" />
          <polygon points="157,366 163,366 167,424 153,424" fill="#991b1b" />
          <path d="M4,424 C10,376 30,342 74,330 L110,324 L148,424 Z" fill="#18181b" stroke="#09090b" strokeWidth="2" />
          <path d="M316,424 C310,376 290,342 246,330 L210,324 L172,424 Z" fill="#18181b" stroke="#09090b" strokeWidth="2" />
          <polygon points="108,324 134,392 110,398 86,350" fill="#27272a" stroke="#09090b" strokeWidth="1.3" />
          <polygon points="212,324 186,392 210,398 234,350" fill="#27272a" stroke="#09090b" strokeWidth="1.3" />
        </g>
      );

    case 'smzinho':
      return (
        <g>
          {/* Casual dark black/charcoal gamer tee */}
          <path
            d="M4,424 C8,376 28,342 74,330 C90,326 102,324 114,324 Q160,356 206,324 C218,324 230,326 246,330 C292,342 312,376 316,424 Z"
            fill="#111827"
            stroke="#030712"
            strokeWidth="2"
          />
          <path d="M108,324 Q160,360 212,324" fill="none" stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />
        </g>
      );

    default:
      return null;
  }
};
